# Tamadragão

Um dragãozinho virtual estilo tamagotchi, num arquivo HTML só: dê comida, brinque, deixe dormir, limpe a sujeira e dê remédio quando ele ficar doente. Ele continua vivendo mesmo com a página fechada (o progresso fica no `localStorage`).

**No ar:** https://tamadragao.vercel.app

Funciona de dois jeitos, com o mesmo arquivo:

- **No navegador:** abra `widget/contents/html/tamagato.html`.
- **Como widget do KDE Plasma:** a pasta `widget/` é o pacote do plasmoide, que carrega o mesmo HTML com `?widget=1` (fundo transparente e ajuste ao tamanho).

## Controles

| Botão | Teclado | Ação |
| --- | --- | --- |
| A | ← | Passa pelos ícones (◀ no jogo) |
| B | Enter | Confirma |
| C | → ou Esc | Volta (▶ no jogo) |

## Widget

```bash
kpackagetool5 -t Plasma/Applet -i widget   # instalar
kpackagetool5 -t Plasma/Applet -u widget   # atualizar depois de mexer no HTML
```

Depois, clique com o botão direito na área de trabalho → *Adicionar widgets* → **Tamadragão**.

## Versão antiga

A versão em Vue 3 + TypeScript (vários bichos, pet shop e cemitério) está guardada na branch `vue-arquivo`.
