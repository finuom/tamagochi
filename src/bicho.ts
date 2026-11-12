// tudo que define um bichinho fica aqui, para o App e o componente falarem a mesma língua

export const MAXIMO = 5;

// de quanto em quanto tempo a fome sobe e a alegria cai (em milissegundos)
export const INTERVALO_FOME = 20_000;
export const INTERVALO_ALEGRIA = 30_000;
// faminto, perde 1 de saúde a cada 24 min: de saúde cheia até morrer são 2 horas
export const INTERVALO_SAUDE = 24 * 60_000;
// sem estar faminto, recupera 1 de saúde a cada 3 min
export const INTERVALO_RECUPERACAO = 3 * 60_000;

// abaixo disso o bicho está em estado grave
export const SAUDE_GRAVE = 2;

export type Bicho = {
  id: number;
  nome: string;
  fome: number; // 0 = cheio, 5 = faminto
  alegria: number; // 0 = triste, 5 = radiante
  saude: number; // 0 = morto, 5 = saudável
  especie: string; // id do catálogo da loja
  acessorio: string | null; // id do item que ele está usando
  adotadoEm: number;
  // marcam desde quando o relógio de cada coisa está contando
  fomeDesde: number;
  alegriaDesde: number;
  saudeDesde: number;
};

// o que sobra de um bicho no cemitério
export type Lapide = {
  id: number;
  nome: string;
  especie: string;
  acessorio: string | null;
  adotadoEm: number;
  morreuEm: number;
};

export function novoBicho(id: number, nome: string, especie: string): Bicho {
  const agora = Date.now();
  return {
    id,
    nome,
    fome: 3,
    alegria: 3,
    saude: MAXIMO,
    especie,
    acessorio: null,
    adotadoEm: agora,
    fomeDesde: agora,
    alegriaDesde: agora,
    saudeDesde: agora,
  };
}

// bichos salvos por versões antigas não tinham alguns campos: completa o que faltar
export function completar(salvo: Partial<Bicho> & { id: number; nome: string }): Bicho {
  const agora = Date.now();
  return {
    fome: 3,
    alegria: 3,
    saude: MAXIMO,
    especie: 'gato',
    acessorio: null,
    adotadoEm: agora,
    fomeDesde: agora,
    alegriaDesde: agora,
    saudeDesde: agora,
    ...salvo,
  };
}

// faz o relógio andar: quantos intervalos inteiros passaram desde a última vez?
// funciona igual para 1 segundo ou para 3 dias com a aba fechada.
// devolve o momento em que o bicho morreu, ou null se ele está vivo
export function passarTempo(bicho: Bicho, agora: number): number | null {
  const fomeAntes = bicho.fome;
  const passosFome = Math.floor((agora - bicho.fomeDesde) / INTERVALO_FOME);
  if (passosFome > 0) {
    // se ele ficou faminto agora (ou enquanto a aba estava fechada), descobre
    // o momento exato: é dali que a saúde começa a cair
    if (fomeAntes < MAXIMO && fomeAntes + passosFome >= MAXIMO) {
      bicho.saudeDesde = bicho.fomeDesde + (MAXIMO - fomeAntes) * INTERVALO_FOME;
    }
    bicho.fome = Math.min(MAXIMO, bicho.fome + passosFome);
    bicho.fomeDesde += passosFome * INTERVALO_FOME;
  }

  const passosAlegria = Math.floor((agora - bicho.alegriaDesde) / INTERVALO_ALEGRIA);
  if (passosAlegria > 0) {
    bicho.alegria = Math.max(0, bicho.alegria - passosAlegria);
    bicho.alegriaDesde += passosAlegria * INTERVALO_ALEGRIA;
  }

  if (bicho.fome === MAXIMO) {
    const passosSaude = Math.floor((agora - bicho.saudeDesde) / INTERVALO_SAUDE);
    if (passosSaude > 0) {
      if (passosSaude >= bicho.saude) {
        const morreuEm = bicho.saudeDesde + bicho.saude * INTERVALO_SAUDE;
        bicho.saude = 0;
        return morreuEm;
      }
      bicho.saude -= passosSaude;
      bicho.saudeDesde += passosSaude * INTERVALO_SAUDE;
    }
  } else if (bicho.saude < MAXIMO) {
    // comendo direitinho: vai se recuperando
    const passos = Math.floor((agora - bicho.saudeDesde) / INTERVALO_RECUPERACAO);
    if (passos > 0) {
      bicho.saude = Math.min(MAXIMO, bicho.saude + passos);
      bicho.saudeDesde += passos * INTERVALO_RECUPERACAO;
    }
  } else {
    // saudável e alimentado: o relógio da saúde fica parado
    bicho.saudeDesde = agora;
  }

  return null;
}

// tira fome do bicho. Quem estava faminto sai do estado de fome agora, então o
// relógio da saúde recomeça daqui (senão ele "recuperaria" o tempo que passou faminto)
export function alimentar(bicho: Bicho, quanto: number) {
  if (bicho.fome === MAXIMO) {
    bicho.saudeDesde = Date.now();
  }
  bicho.fome = Math.max(0, bicho.fome - quanto);
  bicho.fomeDesde = Date.now();
}

// bicho feliz é bicho que rende moedas
export function estaFeliz(bicho: Pick<Bicho, 'fome' | 'alegria'>): boolean {
  return bicho.fome <= 2 && bicho.alegria >= 2;
}

// "3 min", "2 h", "5 dias"
export function duracao(ms: number): string {
  const minutos = Math.floor(ms / 60_000);
  if (minutos < 1) return 'menos de 1 min';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? '1 dia' : `${dias} dias`;
}

export function tempoDesde(ms: number): string {
  return ms < 60_000 ? 'agora mesmo' : `há ${duracao(ms)}`;
}
