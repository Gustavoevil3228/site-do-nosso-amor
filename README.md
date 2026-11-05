# Nossa vida 💕

Um presentinho: nossas fotos, viagens, momentos bobos e um buquê de flores com mensagens secretas.

**Site:** <https://gustavoevil3228.github.io/site-do-nosso-amor/>

Antes ele estava no Google Sites. Agora é um site estático no GitHub Pages: HTML, CSS e JavaScript puro, sem frameworks e sem nada pra instalar.

## O que tem

- **Página principal** (`index.html`):
  - capa com contador "juntos há…"
  - linha do tempo da nossa história
  - fotos dela, viagens, momentos bobos e edits
  - fotos em tela cheia: arraste pro lado ou use as setas pra passar
- **Buquê** (`buque.html`):
  - as flores são desenhadas por código e mudam toda vez
  - cada flor brilhante guarda uma mensagem num código diferente: de trás pra frente, emoji, números, cifra de César, Morse e senha
  - quando decifrada, a flor fica dourada e o progresso fica salvo no celular
  - decifrando todas, aparece a mensagem final
- **Detalhes técnicos:**
  - fotos em WebP com duas resoluções (o celular baixa a menor)
  - carregamento sob demanda
  - prévia bonita no WhatsApp
  - dá pra "instalar" na tela inicial do celular
  - respeita quem prefere menos animação

## Como mudar as coisas

Quase tudo se muda num arquivo só: **`config.js`**. Abra no GitHub, clique no lápis ✏️, edite e salve com **Commit changes**. O site atualiza sozinho em 1 ou 2 minutos.

- `inicioNamoro`: a data em que vocês começaram (`"AAAA-MM-DD"`). Ativa o contador.
- `buque.mensagens`: uma mensagem por flor. Cada uma tem o tipo de código (`cifra`) e o `texto`.
- `buque.final`: a mensagem que aparece quando todas as flores forem decifradas.

## Organização

```
index.html        página principal
buque.html        o buquê de mensagens secretas
config.js         ← personalize aqui
css/              estilos
js/site.js        contador, fotos em tela cheia, animações
js/buque.js       desenho das flores e os códigos
img/              fotos (nome.webp = grande, nome-p.webp = pequena)
video/            vídeos
icones/           ícones do site
duvidas.md        perguntas que ficaram em aberto
```
