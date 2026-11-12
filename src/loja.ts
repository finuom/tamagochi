// o catálogo do pet shop: o que dá para adotar e o que dá para comprar

export type Especie = {
  id: string;
  emoji: string;
  nome: string;
  preco: number;
  // quantas moedas ele rende a cada pagamento, se estiver feliz
  renda: number;
};

export const ESPECIES: Especie[] = [
  { id: 'gato', emoji: '🐱', nome: 'Gato', preco: 0, renda: 1 },
  { id: 'cachorro', emoji: '🐶', nome: 'Cachorro', preco: 15, renda: 2 },
  { id: 'coelho', emoji: '🐰', nome: 'Coelho', preco: 25, renda: 2 },
  { id: 'hamster', emoji: '🐹', nome: 'Hamster', preco: 35, renda: 3 },
  { id: 'raposa', emoji: '🦊', nome: 'Raposa', preco: 60, renda: 4 },
  { id: 'panda', emoji: '🐼', nome: 'Panda', preco: 100, renda: 6 },
  { id: 'dragao', emoji: '🐉', nome: 'Dragão', preco: 250, renda: 12 },
];

export type TipoItem = 'petisco' | 'brinquedo' | 'remedio' | 'pocao' | 'acessorio';

export type Item = {
  id: string;
  emoji: string;
  nome: string;
  preco: number;
  tipo: TipoItem;
  descricao: string;
};

export const ITENS: Item[] = [
  { id: 'bolo', emoji: '🍰', nome: 'Bolo', preco: 8, tipo: 'petisco', descricao: 'Mata toda a fome' },
  { id: 'peixe', emoji: '🐟', nome: 'Peixe', preco: 4, tipo: 'petisco', descricao: 'Tira 2 de fome' },
  { id: 'bola', emoji: '⚽', nome: 'Bola', preco: 8, tipo: 'brinquedo', descricao: 'Alegria no máximo, sem dar fome' },
  { id: 'remedio', emoji: '💊', nome: 'Remédio', preco: 15, tipo: 'remedio', descricao: 'Recupera toda a saúde' },
  { id: 'pocao', emoji: '🧪', nome: 'Poção da vida', preco: 150, tipo: 'pocao', descricao: 'Traz um bicho de volta do cemitério' },
  { id: 'laco', emoji: '🎀', nome: 'Laço', preco: 12, tipo: 'acessorio', descricao: 'Charmoso' },
  { id: 'oculos', emoji: '🕶️', nome: 'Óculos', preco: 20, tipo: 'acessorio', descricao: 'Estiloso' },
  { id: 'cartola', emoji: '🎩', nome: 'Cartola', preco: 30, tipo: 'acessorio', descricao: 'Elegante' },
  { id: 'coroa', emoji: '👑', nome: 'Coroa', preco: 80, tipo: 'acessorio', descricao: 'Realeza' },
];

// a mochila guarda quantos de cada item você tem: { bolo: 2, coroa: 1 }
export type Mochila = Record<string, number>;

// procurar no catálogo, caindo no gato se o id não existir (ex.: save antigo)
export function especiePorId(id: string): Especie {
  return ESPECIES.find((e) => e.id === id) ?? ESPECIES[0]!;
}

export function itemPorId(id: string): Item | undefined {
  return ITENS.find((i) => i.id === id);
}
