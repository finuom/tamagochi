<script setup lang="ts">
import { computed, ref } from 'vue';
import { ESPECIES, ITENS, type Mochila } from '../loja';

const props = defineProps<{
  moedas: number;
  mochila: Mochila;
}>();

const emit = defineEmits<{
  adotar: [especie: string, nome: string];
  comprar: [item: string];
}>();

const especieEscolhida = ref(ESPECIES[0]!.id);
const nome = ref('');

const escolhida = computed(() => ESPECIES.find((e) => e.id === especieEscolhida.value)!);
const podeAdotar = computed(
  () => nome.value.trim() !== '' && props.moedas >= escolhida.value.preco,
);

function adotar() {
  if (!podeAdotar.value) {
    return;
  }
  emit('adotar', especieEscolhida.value, nome.value.trim());
  nome.value = '';
}
</script>

<template>
  <section>
    <h2>Adotar</h2>
    <p class="dica">Bichos felizes rendem moedas. Os mais raros rendem mais.</p>

    <div class="grade">
      <button
        v-for="especie in ESPECIES"
        :key="especie.id"
        class="cartao"
        :class="{ escolhido: especie.id === especieEscolhida }"
        :disabled="moedas < especie.preco"
        :aria-pressed="especie.id === especieEscolhida"
        @click="especieEscolhida = especie.id"
      >
        <span class="emoji">{{ especie.emoji }}</span>
        <span>{{ especie.nome }}</span>
        <span class="preco">{{ especie.preco === 0 ? 'grátis' : `${especie.preco} 🪙` }}</span>
        <span class="detalhe">rende {{ especie.renda }} 🪙</span>
      </button>
    </div>

    <div class="adotar">
      <input
        v-model="nome"
        :placeholder="`Nome do seu ${escolhida.nome.toLowerCase()}`"
        maxlength="24"
        @keyup.enter="adotar"
      />
      <button class="principal" :disabled="!podeAdotar" @click="adotar">
        Adotar {{ escolhida.emoji }}
        <template v-if="escolhida.preco > 0">({{ escolhida.preco }} 🪙)</template>
      </button>
    </div>
  </section>

  <section>
    <h2>Produtos</h2>
    <p class="dica">O que você compra vai para a mochila. Use nos bichos pela aba Meus bichos.</p>

    <div class="grade">
      <div v-for="item in ITENS" :key="item.id" class="cartao">
        <span class="emoji">{{ item.emoji }}</span>
        <span>{{ item.nome }}</span>
        <span class="detalhe">{{ item.descricao }}</span>
        <span v-if="mochila[item.id]" class="detalhe">na mochila: {{ mochila[item.id] }}</span>
        <button class="principal" :disabled="moedas < item.preco" @click="emit('comprar', item.id)">
          {{ item.preco }} 🪙
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  margin-bottom: 32px;
}

h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.dica {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--cor-texto-suave);
}

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.cartao {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  font: inherit;
  color: var(--cor-texto-tela);
  background: var(--cor-fundo-afundado);
  border: 2px solid var(--cor-borda);
  border-radius: 8px;
  text-align: center;
}

button.cartao {
  cursor: pointer;
  transition: border-color 0.2s, transform 0.1s;
}

button.cartao:hover:not(:disabled) {
  border-color: var(--cor-primaria);
}

button.cartao:active:not(:disabled) {
  transform: scale(0.97);
}

button.cartao:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cartao.escolhido {
  border-color: var(--cor-secundaria);
}

.emoji {
  font-size: 36px;
  line-height: 1.2;
}

.preco {
  font-weight: 600;
}

.detalhe {
  font-size: 12px;
  color: var(--cor-texto-suave);
}

.cartao .principal {
  margin-top: 6px;
  width: 100%;
}

.adotar {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

/* o campo estica e ocupa o espaço que sobra do botão */
.adotar input {
  flex: 1;
  min-width: 0;
  max-width: 320px;
}

.principal {
  padding: 8px 16px;
  font: inherit;
  color: var(--cor-texto);
  background: var(--cor-primaria);
  border: none;
  border-radius: var(--raio);
  cursor: pointer;
}

.principal:hover {
  background: var(--cor-secundaria);
}

.principal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--cor-disabled);
}
</style>
