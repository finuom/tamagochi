<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import Tamagochi from './components/Tamagochi.vue';
import Modal from './components/Modal.vue';
import PetShop from './components/PetShop.vue';
import Cemiterio from './components/Cemiterio.vue';
import {
  MAXIMO,
  SAUDE_GRAVE,
  alimentar,
  completar,
  estaFeliz,
  novoBicho,
  passarTempo,
  type Bicho,
  type Lapide,
} from './bicho';
import { ITENS, especiePorId, itemPorId, type Mochila } from './loja';

// de quanto em quanto tempo os bichos felizes pagam as moedas
const INTERVALO_RENDA = 30_000;
const MOEDAS_INICIAIS = 20;

// lê algo do localStorage sem deixar a página em branco se tiver lixo lá
// (editado na mão, versão velha...): nesse caso fica com o valor padrão
function ler<T>(chave: string, padrao: T): T {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo === null ? padrao : JSON.parse(salvo);
  } catch {
    return padrao;
  }
}

function lerBichos(): Bicho[] {
  const lista = ler<unknown>('bichos', []);
  return Array.isArray(lista) ? lista.map(completar) : [];
}

const aviso = ref('Bem-vindo ao pet shop!');
const aba = ref<'bichos' | 'loja' | 'cemiterio'>('bichos');
const bichos = ref<Bicho[]>(lerBichos());
const moedas = ref<number>(ler('moedas', MOEDAS_INICIAIS));
const mochila = ref<Mochila>(ler('mochila', {}));
const cemiterio = ref<Lapide[]>(ler('cemiterio', []));
const idSalvo = Number(localStorage.getItem('proximoId'));
// o próximo id nunca pode repetir um que já existe, nem no cemitério
// (um bicho revivido volta com o id que tinha)
let proximoId = Math.max(
  idSalvo || 1,
  ...bichos.value.map((b) => b.id + 1),
  ...cemiterio.value.map((l) => l.id + 1),
);

const bichoSoltando = ref<Bicho | null>(null);

// o relógio da página: anda a cada segundo e faz a fome e a alegria mudarem
const agora = ref(Date.now());
let ultimaRenda = Date.now();
let relogio: number | undefined;

function tique() {
  agora.value = Date.now();
  const mortos: Lapide[] = [];
  for (const bicho of bichos.value) {
    const estavaFaminto = bicho.fome === MAXIMO;
    const estavaGrave = bicho.saude <= SAUDE_GRAVE;
    const morreuEm = passarTempo(bicho, agora.value);

    if (morreuEm !== null) {
      mortos.push({
        id: bicho.id,
        nome: bicho.nome,
        especie: bicho.especie,
        acessorio: bicho.acessorio,
        adotadoEm: bicho.adotadoEm,
        morreuEm,
      });
    } else if (!estavaGrave && bicho.saude <= SAUDE_GRAVE) {
      aviso.value = `⚠️ ${bicho.nome} está muito doente! Dê comida, rápido.`;
    } else if (!estavaFaminto && bicho.fome === MAXIMO) {
      aviso.value = `${bicho.nome} está morrendo de fome!`;
    }
  }

  if (mortos.length > 0) {
    const idsMortos = mortos.map((m) => m.id);
    bichos.value = bichos.value.filter((b) => !idsMortos.includes(b.id));
    cemiterio.value.unshift(...mortos);
    const nomes = mortos.map((m) => m.nome).join(', ');
    aviso.value = `💀 ${nomes} ${mortos.length === 1 ? 'morreu' : 'morreram'} de fome.`;
  }

  // dia de pagamento: só rende quem está feliz, e cada espécie rende um tanto
  if (agora.value - ultimaRenda >= INTERVALO_RENDA) {
    ultimaRenda = agora.value;
    const ganho = bichos.value
      .filter(estaFeliz)
      .reduce((soma, b) => soma + especiePorId(b.especie).renda, 0);
    if (ganho > 0) {
      moedas.value += ganho;
      aviso.value = `Seus bichos felizes renderam ${ganho} 🪙`;
    }
  }
}

onMounted(() => {
  tique(); // recupera o tempo que passou com a aba fechada
  relogio = window.setInterval(tique, 1000);
});
onUnmounted(() => window.clearInterval(relogio));

const famintos = computed(() => bichos.value.filter((b) => b.fome === MAXIMO).length);
const felizes = computed(() => bichos.value.filter(estaFeliz).length);
const graves = computed(
  () => bichos.value.filter((b) => b.saude <= SAUDE_GRAVE && b.fome === MAXIMO).length,
);
const pocoes = computed(() => mochila.value['pocao'] ?? 0);

// a aba do navegador avisa quando tem bicho com fome, mesmo olhando outra aba
watchEffect(() => {
  if (graves.value > 0) {
    document.title = `💀 (${graves.value}) Tamagochi`;
  } else if (famintos.value > 0) {
    document.title = `(${famintos.value}) Tamagochi`;
  } else {
    document.title = 'Tamagochi';
  }
});

const resumo = computed(() => {
  const total = bichos.value.length;
  const palavra = total === 1 ? 'bichinho' : 'bichinhos';
  const partes = [`${total} ${palavra}`, `${felizes.value} rendendo moedas`];
  if (famintos.value > 0) {
    partes.push(`${famintos.value} com muita fome`);
  }
  if (graves.value > 0) {
    partes.push(`${graves.value} em estado grave`);
  }
  return partes.join(' · ');
});

// o que tem na mochila, no formato que o cartão do bicho entende.
// a poção não aparece ali: ela só serve no cemitério
const itensNaMochila = computed(() =>
  ITENS.filter((item) => item.tipo !== 'pocao' && (mochila.value[item.id] ?? 0) > 0).map((item) => ({
    id: item.id,
    emoji: item.emoji,
    nome: item.nome,
    quantidade: mochila.value[item.id]!,
  })),
);

function quandoComer(bicho: Bicho) {
  alimentar(bicho, 1);
  aviso.value = bicho.fome === 0 ? `${bicho.nome} está cheio!` : `${bicho.nome} comeu!`;
}

function quandoBrincar(bicho: Bicho) {
  // brincar alegra, mas cansa e dá fome
  bicho.fome++;
  bicho.alegria = Math.min(MAXIMO, bicho.alegria + 2);
  bicho.alegriaDesde = Date.now();
  aviso.value = `${bicho.nome} brincou!`;
}

function alimentarTodos() {
  const comeram = bichos.value.filter((b) => b.fome > 0);
  for (const bicho of comeram) {
    alimentar(bicho, 1);
  }
  aviso.value = comeram.length === 0 ? 'Ninguém está com fome.' : 'Hora do banquete!';
}

function tirarDaMochila(id: string) {
  mochila.value[id] = (mochila.value[id] ?? 1) - 1;
  if (mochila.value[id] === 0) {
    delete mochila.value[id];
  }
}

function quandoUsar(bicho: Bicho, id: string) {
  const item = itemPorId(id);
  if (!item || !mochila.value[id]) {
    return;
  }

  if (item.tipo === 'petisco') {
    if (bicho.fome === 0) {
      aviso.value = `${bicho.nome} está cheio, guarda o ${item.nome.toLowerCase()} para depois.`;
      return;
    }
    alimentar(bicho, item.id === 'bolo' ? MAXIMO : 2);
    aviso.value = `${bicho.nome} devorou o ${item.nome.toLowerCase()}!`;
  } else if (item.tipo === 'brinquedo') {
    if (bicho.alegria === MAXIMO) {
      aviso.value = `${bicho.nome} já está super feliz.`;
      return;
    }
    bicho.alegria = MAXIMO;
    bicho.alegriaDesde = Date.now();
    aviso.value = `${bicho.nome} adorou a ${item.nome.toLowerCase()}!`;
  } else if (item.tipo === 'remedio') {
    if (bicho.saude === MAXIMO) {
      aviso.value = `${bicho.nome} está saudável, não precisa de remédio.`;
      return;
    }
    bicho.saude = MAXIMO;
    bicho.saudeDesde = Date.now();
    aviso.value =
      bicho.fome === MAXIMO
        ? `${bicho.nome} melhorou, mas continua faminto!`
        : `${bicho.nome} está curado!`;
  } else if (item.tipo === 'acessorio') {
    if (bicho.acessorio === item.id) {
      aviso.value = `${bicho.nome} já está usando isso.`;
      return;
    }
    // o acessório que ele usava volta para a mochila
    if (bicho.acessorio) {
      mochila.value[bicho.acessorio] = (mochila.value[bicho.acessorio] ?? 0) + 1;
    }
    bicho.acessorio = item.id;
    aviso.value = `${bicho.nome} ficou lindo de ${item.nome.toLowerCase()}!`;
  }

  tirarDaMochila(id);
}

function reviver(id: number) {
  const lapide = cemiterio.value.find((l) => l.id === id);
  if (!lapide || pocoes.value === 0) {
    return;
  }
  // volta fraco e com fome: precisa de cuidado logo
  const bicho = novoBicho(lapide.id, lapide.nome, lapide.especie);
  bicho.adotadoEm = lapide.adotadoEm;
  bicho.acessorio = lapide.acessorio;
  bicho.fome = 3;
  bicho.alegria = 1;
  bicho.saude = 2;
  bichos.value.unshift(bicho);
  cemiterio.value = cemiterio.value.filter((l) => l.id !== id);
  tirarDaMochila('pocao');
  aviso.value = `✨ ${lapide.nome} voltou à vida! Cuide bem desta vez.`;
  aba.value = 'bichos';
}

function comprar(id: string) {
  const item = itemPorId(id);
  if (!item || moedas.value < item.preco) {
    return;
  }
  moedas.value -= item.preco;
  mochila.value[id] = (mochila.value[id] ?? 0) + 1;
  aviso.value = `Você comprou: ${item.emoji} ${item.nome}`;
}

function adotar(especieId: string, nome: string) {
  const especie = especiePorId(especieId);
  if (moedas.value < especie.preco) {
    return;
  }
  moedas.value -= especie.preco;
  bichos.value.unshift(novoBicho(proximoId, nome, especie.id));
  proximoId++;
  localStorage.setItem('proximoId', String(proximoId));
  aviso.value = `Bem-vindo, ${nome}! ${especie.emoji}`;
  aba.value = 'bichos';
}

function quandoSoltou(bicho: Bicho) {
  bichoSoltando.value = bicho;
}

function cancelar() {
  bichoSoltando.value = null;
}

function soltar() {
  const bicho = bichoSoltando.value;
  if (bicho === null) {
    return;
  }
  // o acessório não vai embora com ele
  if (bicho.acessorio) {
    mochila.value[bicho.acessorio] = (mochila.value[bicho.acessorio] ?? 0) + 1;
  }
  bichos.value = bichos.value.filter((b) => b.id !== bicho.id);
  aviso.value = `Tchau, ${bicho.nome}! 👋`;
  bichoSoltando.value = null;
}

watch(bichos, (lista) => localStorage.setItem('bichos', JSON.stringify(lista)), { deep: true });
watch(moedas, (valor) => localStorage.setItem('moedas', JSON.stringify(valor)));
watch(mochila, (valor) => localStorage.setItem('mochila', JSON.stringify(valor)), { deep: true });
watch(cemiterio, (valor) => localStorage.setItem('cemiterio', JSON.stringify(valor)), { deep: true });
</script>

<template>
  <header>
    <h1>Tamagochi Pet Shop</h1>
    <p class="moedas" aria-label="moedas">🪙 {{ moedas }}</p>
  </header>

  <nav class="abas">
    <button :class="{ ativa: aba === 'bichos' }" @click="aba = 'bichos'">
      Meus bichos <small>{{ bichos.length }}</small>
    </button>
    <button :class="{ ativa: aba === 'loja' }" @click="aba = 'loja'">Pet shop</button>
    <button :class="{ ativa: aba === 'cemiterio' }" @click="aba = 'cemiterio'">
      Cemitério <small v-if="cemiterio.length > 0">{{ cemiterio.length }}</small>
    </button>
  </nav>

  <p class="aviso" aria-live="polite">{{ aviso }}</p>

  <PetShop
    v-if="aba === 'loja'"
    :moedas="moedas"
    :mochila="mochila"
    @adotar="adotar"
    @comprar="comprar"
  />

  <Cemiterio
    v-else-if="aba === 'cemiterio'"
    :lapides="cemiterio"
    :agora="agora"
    :pocoes="pocoes"
    @reviver="reviver"
  />

  <template v-else>
    <div v-if="bichos.length === 0" class="vazio">
      <p>☹️ Nenhum bichinho por aqui.</p>
      <button @click="aba = 'loja'">Ir ao pet shop</button>
    </div>

    <template v-else>
      <div class="painel">
        <p class="resumo">{{ resumo }}</p>
        <button v-if="bichos.length > 1" @click="alimentarTodos">Alimentar todos</button>
      </div>

      <TransitionGroup name="lista" tag="div" class="lista">
        <Tamagochi
          v-for="bicho in bichos"
          :key="bicho.id"
          :nome="bicho.nome"
          :fome="bicho.fome"
          :alegria="bicho.alegria"
          :saude="bicho.saude"
          :adotado-em="bicho.adotadoEm"
          :agora="agora"
          :especie="especiePorId(bicho.especie).emoji"
          :acessorio="bicho.acessorio ? itemPorId(bicho.acessorio)?.emoji ?? null : null"
          :itens="itensNaMochila"
          @comeu="quandoComer(bicho)"
          @brincou="quandoBrincar(bicho)"
          @usou="quandoUsar(bicho, $event)"
          @soltou="quandoSoltou(bicho)"
        />
      </TransitionGroup>
    </template>
  </template>

  <Transition name="modal">
    <Modal v-if="bichoSoltando !== null" @fechar="cancelar">
      <p>Tem certeza que quer soltar {{ bichoSoltando.nome }}?</p>
      <p v-if="especiePorId(bichoSoltando.especie).preco > 0" class="detalhe">
        Você não recebe as moedas de volta.
      </p>

      <div class="acoes">
        <button @click="cancelar">Cancelar</button>
        <button @click="soltar" class="perigoso">Soltar</button>
      </div>
    </Modal>
  </Transition>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

h1 {
  margin: 0;
}

.moedas {
  margin: 0;
  padding: 6px 14px;
  font-size: 20px;
  font-weight: 700;
  background: var(--cor-fundo-afundado);
  border: 1px solid var(--cor-borda);
  border-radius: 999px;
  white-space: nowrap;
}

.abas {
  display: flex;
  gap: 4px;
  margin: 20px 0 12px;
  border-bottom: 1px solid var(--cor-borda);
}

.abas button {
  padding: 10px 16px;
  font: inherit;
  color: var(--cor-texto-suave);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
}

.abas button:hover {
  color: var(--cor-texto-tela);
}

.abas button.ativa {
  color: var(--cor-texto-tela);
  border-bottom-color: var(--cor-primaria);
}

.abas small {
  margin-left: 4px;
  padding: 1px 7px;
  font-size: 12px;
  background: var(--cor-borda);
  border-radius: 999px;
}

.aviso {
  min-height: 1.2em;
  margin: 0 0 20px;
  font-weight: 600;
}

.acoes {
  display: flex;
  gap: 10px;
  justify-content: end;
}

.acoes button,
.painel button,
.vazio button {
  padding: 8px 16px;
  font: inherit;
  color: var(--cor-texto);
  background: var(--cor-primaria);
  border: none;
  border-radius: var(--raio);
  cursor: pointer;
}

.acoes button:hover,
.painel button:hover,
.vazio button:hover {
  background: var(--cor-secundaria);
}

.acoes .perigoso {
  background: #e53935;
  color: #fff;
}

.acoes .perigoso:hover {
  background: #c62828;
}

.detalhe {
  margin-top: -8px;
  font-size: 14px;
  color: var(--cor-texto-suave);
}

.painel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.painel p {
  margin: 0;
}

.resumo {
  font-size: 14px;
  color: var(--cor-texto-suave);
}

.lista {
  position: relative;
}

/* bicho novo entra deslizando, bicho solto sai encolhendo, e os outros se ajeitam */
.lista-enter-active,
.lista-leave-active,
.lista-move {
  transition: all 0.35s ease;
}

.lista-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.lista-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* quem está saindo sai do fluxo, para os de baixo poderem subir */
.lista-leave-active {
  position: absolute;
  width: 100%;
  box-sizing: border-box;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .lista-enter-active,
  .lista-leave-active,
  .lista-move,
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
}

@media (max-width: 600px) {
  h1 {
    font-size: 24px;
  }
}
</style>
