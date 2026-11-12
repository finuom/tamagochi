<script setup lang="ts">
import { computed, ref } from 'vue';
import { MAXIMO, SAUDE_GRAVE, estaFeliz, tempoDesde } from '../bicho';

const props = defineProps<{
  nome: string;
  fome: number;
  alegria: number;
  saude: number;
  adotadoEm: number;
  agora: number;
  especie: string; // o emoji da espécie
  acessorio: string | null; // o emoji do acessório, se tiver
  itens: { id: string; emoji: string; nome: string; quantidade: number }[];
}>();

const emit = defineEmits<{
  comeu: [];
  brincou: [];
  soltou: [];
  usou: [item: string];
}>();

// a carinha e o humor leem a fome e a alegria que vieram da vitrine
const humor = computed(() => {
  if (props.saude <= SAUDE_GRAVE) {
    return { emoji: '🤒', texto: props.fome === MAXIMO ? 'Morrendo de fome!' : 'Doente, se recuperando' };
  }
  if (props.fome === MAXIMO && props.alegria === 0) {
    return { emoji: '😱', texto: 'Desesperado' };
  }
  if (props.fome === MAXIMO) {
    return { emoji: '😫', texto: 'Faminto' };
  }
  if (props.alegria === 0) {
    return { emoji: '😠', texto: 'Emburrado' };
  }
  if (props.fome === 0 && props.alegria >= 4) {
    return { emoji: '😍', texto: 'Radiante' };
  }
  if (estaFeliz(props)) {
    return { emoji: '😊', texto: 'Feliz, rendendo moedas' };
  }
  return { emoji: '🙂', texto: 'De boa' };
});

// quanto mais perto do limite, mais o bicho reclama (e treme)
const emPerigo = computed(() => props.fome === MAXIMO || props.alegria === 0);
// saúde baixa e ainda faminto: ou alguém faz alguma coisa, ou ele morre
const grave = computed(() => props.saude <= SAUDE_GRAVE && props.fome === MAXIMO);

const idade = computed(() => tempoDesde(props.agora - props.adotadoEm));

// o emojizinho que sobe quando ele come ou brinca; o contador recria o elemento
// e faz a animação rodar de novo mesmo se clicar duas vezes seguidas
const efeito = ref<{ emoji: string; vez: number } | null>(null);
let vezes = 0;

function mostrarEfeito(emoji: string) {
  vezes++;
  efeito.value = { emoji, vez: vezes };
}

function alimentar() {
  mostrarEfeito('🍖');
  emit('comeu');
}

function brincar() {
  mostrarEfeito('🧶');
  emit('brincou');
}

function usar(item: { id: string; emoji: string }) {
  mostrarEfeito(item.emoji);
  emit('usou', item.id);
}

function excluir() {
  emit('soltou');
}
</script>

<template>
  <div class="tamagochi" :class="{ perigo: emPerigo, grave }">
    <div class="dados">
      <div class="avatar">
        <span :key="efeito?.vez" :class="{ pulo: efeito }">{{ especie }}</span>
        <span v-if="acessorio" class="acessorio">{{ acessorio }}</span>
        <span v-if="efeito" :key="'e' + efeito.vez" class="efeito">{{ efeito.emoji }}</span>
      </div>

      <div class="info">
        <p class="nome">{{ nome }} <small>{{ humor.emoji }} {{ humor.texto }}</small></p>
        <p class="idade">adotado {{ idade }}</p>

        <div class="barra" :aria-label="`fome ${fome} de ${MAXIMO}`">
          <span class="rotulo">Fome</span>
          <span
            v-for="n in MAXIMO"
            :key="n"
            class="gomo fome"
            :class="{ cheio: n <= fome }"
          />
        </div>
        <div class="barra" :aria-label="`alegria ${alegria} de ${MAXIMO}`">
          <span class="rotulo">Alegria</span>
          <span
            v-for="n in MAXIMO"
            :key="n"
            class="gomo alegria"
            :class="{ cheio: n <= alegria }"
          />
        </div>
        <div class="barra" :aria-label="`saúde ${saude} de ${MAXIMO}`">
          <span class="rotulo">Saúde</span>
          <span
            v-for="n in MAXIMO"
            :key="n"
            class="gomo saude"
            :class="{ cheio: n <= saude }"
          />
        </div>

        <div v-if="itens.length > 0" class="mochila">
          <button
            v-for="item in itens"
            :key="item.id"
            :title="`Usar ${item.nome}`"
            @click="usar(item)"
          >
            {{ item.emoji }} <small>×{{ item.quantidade }}</small>
          </button>
        </div>
      </div>
    </div>

    <div class="botoes">
      <button @click="alimentar" :disabled="fome === 0">Alimentar</button>
      <button
        @click="brincar"
        :disabled="fome === MAXIMO"
        :title="fome === MAXIMO ? 'Com fome assim, nem pensar' : ''"
        class="brincar"
      >
        Brincar
      </button>
      <button @click="excluir" class="excluir">Soltar</button>
    </div>
  </div>
</template>

<style scoped>
.tamagochi {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  background: var(--cor-fundo-afundado);
  border: 1px solid var(--cor-borda);
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.tamagochi.perigo {
  border-color: #e53935;
}

.dados {
  display: flex;
  gap: 20px;
  align-items: center;
}

.avatar {
  position: relative;
  font-size: 48px;
  line-height: 1;
}

.avatar > span {
  display: inline-block;
}

.perigo .avatar > span:first-child {
  animation: tremer 0.4s ease-in-out infinite alternate;
}

.pulo {
  animation: pulo 0.4s ease-out;
}

.acessorio {
  position: absolute;
  top: -10px;
  right: -12px;
  font-size: 24px;
  transform: rotate(15deg);
}

.efeito {
  position: absolute;
  left: 50%;
  top: 0;
  font-size: 24px;
  pointer-events: none;
  animation: subir 0.9s ease-out forwards;
}

.info p {
  margin: 0;
}

.nome {
  font-size: 18px;
  font-weight: 600;
}

.nome small {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 400;
  color: var(--cor-texto-suave);
}

.idade {
  margin-bottom: 8px !important;
  font-size: 13px;
  color: var(--cor-texto-suave);
}

.barra {
  display: flex;
  gap: 3px;
  align-items: center;
  margin-top: 4px;
}

.rotulo {
  width: 56px;
  font-size: 12px;
  color: var(--cor-texto-suave);
}

.gomo {
  width: 14px;
  height: 8px;
  border-radius: 2px;
  background: var(--cor-borda);
  transition: background 0.3s;
}

.gomo.fome.cheio {
  background: #ff8a65;
}

.gomo.alegria.cheio {
  background: var(--cor-secundaria);
}

.gomo.saude.cheio {
  background: #66bb6a;
}

.grave .gomo.saude.cheio {
  background: #e53935;
}

.tamagochi.grave {
  animation: piscar 1s ease-in-out infinite alternate;
}

@keyframes piscar {
  to {
    background: #3d1f24;
  }
}

.mochila {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.mochila button {
  padding: 4px 8px;
  font: inherit;
  font-size: 16px;
  color: var(--cor-texto-tela);
  background: transparent;
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio);
  cursor: pointer;
}

.mochila button:hover {
  border-color: var(--cor-primaria);
}

.mochila small {
  font-size: 12px;
  color: var(--cor-texto-suave);
}

.botoes {
  display: flex;
  gap: 20px;
}

.botoes button {
  padding: 16px 32px;
  background: var(--cor-primaria);
  color: var(--cor-texto);
  border-radius: var(--raio);
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
}

.botoes button:active:not(:disabled) {
  transform: scale(0.95);
}

.botoes button:hover {
  background: var(--cor-secundaria);
}

.botoes button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--cor-disabled);
}

.botoes .brincar,
.botoes .brincar:hover,
.botoes .brincar:disabled {
  background: var(--cor-secundaria);
}

.botoes .excluir {
  background: #e53935;
  color: #fff;
}

.botoes .excluir:hover {
  background: #c62828;
}

@keyframes pulo {
  40% {
    transform: translateY(-12px) scale(1.1);
  }
}

@keyframes subir {
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -40px);
  }
}

@keyframes tremer {
  from {
    transform: rotate(-6deg);
  }
  to {
    transform: rotate(6deg);
  }
}

/* quem não gosta de movimento na tela fica sem as animações */
@media (prefers-reduced-motion: reduce) {
  .pulo,
  .efeito,
  .tamagochi.grave,
  .perigo .avatar > span:first-child {
    animation: none;
  }
}

/* no celular não cabe tudo numa linha: os dados ficam em cima e os botões
   embaixo, dividindo a largura. Fica no fim do bloco: com a mesma
   especificidade, a regra que vem depois ganha */
@media (max-width: 600px) {
  .tamagochi {
    flex-direction: column;
    align-items: stretch;
  }

  .botoes {
    gap: 8px;
  }

  .botoes button {
    flex: 1;
    padding: 12px 8px;
  }
}
</style>
