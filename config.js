/*
 * ============================================================
 *  PERSONALIZE AQUI 💌
 *  Este é o único arquivo que você precisa mexer para trocar
 *  a data do contador e as mensagens do buquê.
 *  Dá pra editar direto no GitHub: abra o arquivo e clique no lápis.
 * ============================================================
 */
window.CONFIG = {
  // Dia em que vocês começaram a namorar, no formato "AAAA-MM-DD" (ex.: "2024-01-20").
  // Enquanto estiver vazio, o contador "juntos há..." fica escondido.
  inicioNamoro: "2025-07-20",

  buque: {
    /*
     * Uma mensagem por flor. Os tipos de código disponíveis:
     *   "reverso"  → texto de trás pra frente (fácil)
     *   "emoji"    → cada letra vira um emoji, com metade da chave revelada
     *   "numeros"  → cada letra vira um número (A=1, B=2...)
     *   "cesar"    → letras deslocadas; ela gira a roda até a frase aparecer ("chave" de 1 a 25)
     *   "morse"    → pontos e traços, com som (use frases curtas!)
     *   "senha"    → só abre respondendo uma pergunta que só ela sabe
     * Qualquer flor pode ter "musica": ela toca quando a flor é decifrada.
     * Pode ser um vídeo da pasta video/ (ex.: "video/always-forever.mp4")
     * ou o código de um vídeo do YouTube (o que vem depois de "watch?v=").
     */
    mensagens: [
      { cifra: "reverso", texto: "Você é linda" },
      { cifra: "emoji", texto: "Você é o amor da minha vida" },
      { cifra: "numeros", texto: "Como eu te amo" },
      { cifra: "cesar", chave: 7, texto: "Você é uma pessoa maravilhosa" },
      { cifra: "morse", texto: "Eu te amo" },
      {
        cifra: "senha",
        pergunta: "Qual é o nome da nossa música?",
        respostas: ["always forever"],
        dica: "Aquela que é a nossa cara 🎶",
        texto: "Always Forever 🎶",
        // Ao acertar, toca esta música (vídeo que está na pasta video/)
        musica: "video/always-forever.mp4"
      }
    ],

    // Aparece quando ela decifrar todas as flores.
    final: "Tá vendo como você é inteligente?"
  }
};
