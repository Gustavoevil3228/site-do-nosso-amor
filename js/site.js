// Página principal: contador, fotos em tela cheia, animações de entrada e menu ativo.
(() => {
  const reduzirMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Contador "juntos há..." ----------
  const contador = document.getElementById("contador");
  const inicio = (window.CONFIG && window.CONFIG.inicioNamoro) || "";
  const dataInicio = /^\d{4}-\d{2}-\d{2}$/.test(inicio) ? new Date(`${inicio}T00:00:00`) : null;

  if (contador && dataInicio && !isNaN(dataInicio)) {
    contador.classList.remove("oculto");
    const campos = Object.fromEntries([...contador.querySelectorAll("[data-c]")].map((el) => [el.dataset.c, el]));
    const dois = (n) => String(n).padStart(2, "0");

    const atualizar = () => {
      const agora = new Date();
      let anos = agora.getFullYear() - dataInicio.getFullYear();
      let meses = agora.getMonth() - dataInicio.getMonth();
      let dias = agora.getDate() - dataInicio.getDate();
      if (dias < 0) {
        meses -= 1;
        dias += new Date(agora.getFullYear(), agora.getMonth(), 0).getDate();
      }
      if (meses < 0) {
        anos -= 1;
        meses += 12;
      }
      campos.anos.textContent = Math.max(0, anos);
      campos.meses.textContent = Math.max(0, meses);
      campos.dias.textContent = Math.max(0, dias);
      campos.horas.textContent = dois(agora.getHours());
      campos.minutos.textContent = dois(agora.getMinutes());
      campos.segundos.textContent = dois(agora.getSeconds());
    };
    atualizar();
    setInterval(atualizar, 1000);
  }

  // ---------- Corações subindo na capa ----------
  const coracoes = document.querySelector(".coracoes");
  if (coracoes && !reduzirMovimento) {
    for (let i = 0; i < 14; i++) {
      const c = document.createElement("span");
      c.textContent = i % 3 === 0 ? "♡" : "♥";
      c.style.left = `${Math.random() * 100}%`;
      c.style.fontSize = `${10 + Math.random() * 18}px`;
      c.style.animationDuration = `${9 + Math.random() * 10}s`;
      c.style.animationDelay = `${-Math.random() * 18}s`;
      coracoes.appendChild(c);
    }
  }

  // ---------- Animação de entrada ao rolar ----------
  const revelaveis = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window && !reduzirMovimento) {
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add("visivel");
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revelaveis.forEach((el) => obs.observe(el));
  } else {
    revelaveis.forEach((el) => el.classList.add("visivel"));
  }

  // ---------- Menu marca a seção atual ----------
  const links = [...document.querySelectorAll('.menu a[href^="#"]')];
  const secoes = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && secoes.length) {
    const obsMenu = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          links.forEach((a) => {
            const ativo = a.getAttribute("href") === `#${e.target.id}`;
            a.classList.toggle("ativo", ativo);
            if (ativo) a.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
          });
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    secoes.forEach((s) => obsMenu.observe(s));
  }

  // ---------- Fotos em tela cheia ----------
  const visualizador = document.getElementById("visualizador");
  if (visualizador && typeof visualizador.showModal === "function") {
    const imgGrande = visualizador.querySelector("figure img");
    const legenda = visualizador.querySelector("figcaption");
    const contagem = document.getElementById("visualizador-contagem");
    const anterior = visualizador.querySelector(".anterior");
    const proxima = visualizador.querySelector(".proxima");
    let grupo = [];
    let atual = 0;

    const legendaDe = (img) => {
      const texto = img.closest(".momento")?.querySelector(".momento-texto p:last-child")?.textContent;
      return texto || img.closest("figure")?.querySelector("figcaption")?.textContent || "";
    };

    const mostrar = () => {
      const img = grupo[atual];
      imgGrande.src = img.dataset.grande;
      imgGrande.alt = img.alt;
      legenda.textContent = legendaDe(img);
      const varias = grupo.length > 1;
      contagem.textContent = varias ? `${atual + 1} / ${grupo.length}` : "";
      anterior.hidden = proxima.hidden = !varias;
      // já carrega a próxima para a troca ficar instantânea
      if (varias) new Image().src = grupo[(atual + 1) % grupo.length].dataset.grande;
    };

    const ir = (passo) => {
      atual = (atual + passo + grupo.length) % grupo.length;
      mostrar();
    };

    const abrir = (img) => {
      const conjunto = img.closest("[data-galeria]");
      grupo = conjunto ? [...conjunto.querySelectorAll("img[data-grande]")] : [img];
      atual = Math.max(0, grupo.indexOf(img));
      mostrar();
      visualizador.showModal();
    };

    document.querySelectorAll("img[data-grande]").forEach((img) => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.addEventListener("click", () => abrir(img));
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir(img);
        }
      });
    });

    anterior.addEventListener("click", () => ir(-1));
    proxima.addEventListener("click", () => ir(1));
    visualizador.querySelector("[data-fechar]").addEventListener("click", () => visualizador.close());
    visualizador.addEventListener("click", (e) => {
      if (e.target === visualizador || e.target.tagName === "FIGURE") visualizador.close();
    });
    visualizador.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") ir(-1);
      if (e.key === "ArrowRight") ir(1);
    });

    // arrastar para o lado troca de foto (celular)
    let inicioX = null;
    visualizador.addEventListener("pointerdown", (e) => {
      inicioX = e.clientX;
    });
    visualizador.addEventListener("pointerup", (e) => {
      if (inicioX === null || grupo.length < 2) return;
      const dx = e.clientX - inicioX;
      inicioX = null;
      if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
    });
  }

  // ---------- Ano no rodapé ----------
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
