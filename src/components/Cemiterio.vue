<script setup lang="ts">
import { duracao, tempoDesde, type Lapide } from '../bicho';
import { especiePorId, itemPorId } from '../loja';

defineProps<{
  lapides: Lapide[];
  agora: number;
  pocoes: number;
}>();

const emit = defineEmits<{
  reviver: [id: number];
}>();
</script>

<template>
  <div v-if="lapides.length === 0" class="vazio">
    <p>🌷 Ninguém por aqui. Continue cuidando bem deles.</p>
  </div>

  <template v-else>
    <p class="dica">
      Bicho faminto vai perdendo saúde. Com a saúde zerada, ele vem parar aqui.
      <template v-if="pocoes === 0">Uma 🧪 Poção da vida, do pet shop, traz um deles de volta.</template>
    </p>

    <TransitionGroup name="lista" tag="div" class="lapides">
      <div v-for="lapide in lapides" :key="lapide.id" class="lapide">
        <span class="tumulo">🪦</span>
        <p class="nome">
          {{ especiePorId(lapide.especie).emoji }} {{ lapide.nome }}
          <span v-if="lapide.acessorio">{{ itemPorId(lapide.acessorio)?.emoji }}</span>
        </p>
        <p class="datas">viveu {{ duracao(lapide.morreuEm - lapide.adotadoEm) }}</p>
        <p class="datas">morreu {{ tempoDesde(agora - lapide.morreuEm) }}</p>
        <button v-if="pocoes > 0" @click="emit('reviver', lapide.id)">
          Reviver 🧪 <small>({{ pocoes }})</small>
        </button>
      </div>
    </TransitionGroup>
  </template>
</template>

<style scoped>
.dica {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--cor-texto-suave);
}

.vazio {
  color: var(--cor-texto-suave);
}

.lapides {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.lapide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 12px;
  text-align: center;
  background: var(--cor-fundo-afundado);
  border: 1px solid var(--cor-borda);
  /* topo arredondado, como uma lápide */
  border-radius: 60px 60px 8px 8px;
  filter: grayscale(0.6);
}

.lapide p {
  margin: 0;
}

.tumulo {
  font-size: 40px;
}

.nome {
  font-weight: 600;
}

.datas {
  font-size: 13px;
  color: var(--cor-texto-suave);
}

.lapide button {
  margin-top: 8px;
  padding: 6px 12px;
  font: inherit;
  color: var(--cor-texto);
  background: var(--cor-primaria);
  border: none;
  border-radius: var(--raio);
  cursor: pointer;
}

.lapide button:hover {
  background: var(--cor-secundaria);
}

.lista-enter-active,
.lista-leave-active {
  transition: all 0.4s ease;
}

.lista-enter-from,
.lista-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .lista-enter-active,
  .lista-leave-active {
    transition: none;
  }
}
</style>
