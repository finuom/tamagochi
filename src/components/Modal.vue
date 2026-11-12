<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits<{
  fechar: [];
}>();

// Esc fecha o modal, como em qualquer janela
function teclou(evento: KeyboardEvent) {
  if (evento.key === 'Escape') {
    emit('fechar');
  }
}

onMounted(() => window.addEventListener('keydown', teclou));
onUnmounted(() => window.removeEventListener('keydown', teclou));
</script>

<template>
  <!-- .self: só fecha se o clique foi no fundo, não dentro da caixa -->
  <div class="modal-fundo" @click.self="emit('fechar')">
    <div class="modal" role="dialog" aria-modal="true">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 320px, mas nunca mais largo que a tela (16px de folga de cada lado) */
  width: min(320px, 100vw - 32px);
  box-sizing: border-box;
  padding: 24px;
  background: var(--cor-fundo-afundado);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.4);
}

.modal-fundo {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 0.6);
}
</style>
