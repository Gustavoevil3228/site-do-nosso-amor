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
  inicioNamoro: "",

  buque: {
    /*
     * Uma mensagem por flor. Os tipos de código disponíveis:
     *   "reverso"  → texto de trás pra frente (fácil)
     *   "emoji"    → cada letra vira um emoji, com metade da chave revelada
     *   "numeros"  → cada letra vira um número (A=1, B=2...)
     *   "cesar"    → letras deslocadas; ela gira a roda até a frase aparecer ("chave" de 1 a 25)
     *   "morse"    → pontos e traços, com som (use frases curtas!)
     *   "senha"    → só abre respondendo uma pergunta que só ela sabe
     * As mensagens abaixo são EXEMPLOS — troque pelas suas.
     */
    mensagens: [
      { cifra: "reverso", texto: "Você é a melhor parte do meu dia" },
      { cifra: "emoji", texto: "Eu te escolheria de novo todos os dias" },
      { cifra: "numeros", texto: "Meu lugar favorito é do seu lado" },
      { cifra: "cesar", chave: 7, texto: "Te amo mais do que ontem" },
      { cifra: "morse", texto: "Minha flor" },
      {
        cifra: "senha",
        pergunta: "Que filme a gente foi ver no nosso primeiro passeio como namorados?",
        respostas: ["jurassic world", "jurassic"],
        texto: "Desde aquele dia no cinema eu sei que é você. Pra sempre."
      }
    ],

    // Aparece quando ela decifrar todas as flores.
    final: "Esse buquê nunca vai murchar, igual ao que eu sinto por você. Eu te amo hoje, amanhã e em todos os dias que vierem."
  }
};
