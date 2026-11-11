// Buquê montado na hora: as flores mudam a cada vez, e cada flor brilhante guarda
// uma mensagem escrita num código diferente (as mensagens ficam em config.js).
(() => {
  const CONFIG = window.CONFIG || {};
  const MSGS = (CONFIG.buque && CONFIG.buque.mensagens) || [];
  const FINAL = (CONFIG.buque && CONFIG.buque.final) || "";
  const reduzirMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const svg = document.getElementById("buque");
  const progresso = document.getElementById("progresso");
  const avisoFinal = document.getElementById("aviso-final");
  const bilhete = document.getElementById("bilhete");
  const corpo = document.getElementById("bilhete-corpo");
  const final = document.getElementById("final");
  const petalas = document.getElementById("petalas");

  // ---------- Utilidades ----------
  const n1 = (n) => Math.round(n * 10) / 10;
  const escolher = (lista, rnd = Math.random) => lista[Math.floor(rnd() * lista.length)];
  const entre = (a, b, rnd = Math.random) => a + rnd() * (b - a);
  const embaralhar = (lista, rnd = Math.random) => {
    const l = [...lista];
    for (let i = l.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [l[i], l[j]] = [l[j], l[i]];
    }
    return l;
  };
  const semAcento = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "");
  const normalizar = (t) => semAcento(t).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const hash = (t) => {
    let h = 2166136261;
    for (const c of String(t)) {
      h ^= c.codePointAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  // gerador de números com semente (mesma semente = mesmo resultado)
  const gerador = (semente) => () => {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const distancia = (a, b) => {
    const d = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let anterior = d[0];
      d[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const guardado = d[j];
        d[j] = Math.min(d[j] + 1, d[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1));
        anterior = guardado;
      }
    }
    return d[b.length];
  };
  // aceita pequenos erros de digitação
  const parecido = (a, b) => {
    const x = normalizar(a);
    const y = normalizar(b);
    if (!x || !y) return false;
    return x === y || 1 - distancia(x, y) / Math.max(x.length, y.length) >= 0.85;
  };

  // ---------- Progresso salvo no aparelho ----------
  const CHAVE = "buque-decifradas";
  const assinatura = (m) => String(hash(`${m.cifra}|${m.texto}`));
  let salvas = new Set();
  try {
    salvas = new Set(JSON.parse(localStorage.getItem(CHAVE) || "[]"));
  } catch {}
  const salvar = () => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify([...salvas]));
    } catch {}
  };
  const decifrada = (i) => salvas.has(assinatura(MSGS[i]));
  const quantasDecifradas = () => MSGS.filter((_, i) => decifrada(i)).length;
  const todasDecifradas = () => MSGS.length > 0 && quantasDecifradas() === MSGS.length;

  // ---------- Desenho das flores ----------
  const PALETAS = [
    { petala: "#ff7aa8", escura: "#d9447c", miolo: "#ffd27a" },
    { petala: "#ffc2d6", escura: "#ec8db0", miolo: "#ffcf6b" },
    { petala: "#e8365a", escura: "#9e1030", miolo: "#ffd27a" },
    { petala: "#b9a0ff", escura: "#7a58dc", miolo: "#ffe08a" },
    { petala: "#fff1f5", escura: "#e9b7c9", miolo: "#ffc94d" },
    { petala: "#ffad8a", escura: "#e8714a", miolo: "#fff0a8" },
    { petala: "#3d2c4f", escura: "#1f1530", miolo: "#ff7aa8" },
    { petala: "#d78bff", escura: "#9a45d6", miolo: "#fff3c4" },
  ];
  const OURO = { petala: "#ffd27a", escura: "#d99a2b", miolo: "#fff4cf" };

  const petala = (c, l) => `M0 0C${n1(l)} ${n1(-c * 0.3)} ${n1(l * 0.8)} ${n1(-c)} 0 ${n1(-c)}C${n1(-l * 0.8)} ${n1(-c)} ${n1(-l)} ${n1(-c * 0.3)} 0 0Z`;
  const pontuda = (c, l) => `M0 0C${n1(l)} ${n1(-c * 0.35)} ${n1(l * 0.35)} ${n1(-c * 0.8)} 0 ${n1(-c)}C${n1(-l * 0.35)} ${n1(-c * 0.8)} ${n1(-l)} ${n1(-c * 0.35)} 0 0Z`;
  const recortada = (c, l) =>
    `M0 0C${n1(l)} ${n1(-c * 0.25)} ${n1(l)} ${n1(-c * 0.85)} ${n1(l * 0.55)} ${n1(-c)}L${n1(l * 0.22)} ${n1(-c * 0.9)}L0 ${n1(-c)}L${n1(-l * 0.22)} ${n1(-c * 0.9)}L${n1(-l * 0.55)} ${n1(-c)}C${n1(-l)} ${n1(-c * 0.85)} ${n1(-l)} ${n1(-c * 0.25)} 0 0Z`;
  const anel = (n, giro, fn) => Array.from({ length: n }, (_, k) => fn(n1(giro + (360 / n) * k), k)).join("");

  const FLORES = {
    rosa(r, p) {
      return (
        `<circle r="${n1(r * 0.9)}" fill="${p.escura}"/>` +
        anel(6, 0, (a) => `<path d="${petala(r, r * 0.62)}" transform="rotate(${a})" fill="${p.petala}" stroke="${p.escura}"/>`) +
        anel(5, 36, (a) => `<path d="${petala(r * 0.7, r * 0.5)}" transform="rotate(${a})" fill="${p.petala}" stroke="${p.escura}"/>`) +
        anel(4, 12, (a) => `<path d="${petala(r * 0.44, r * 0.38)}" transform="rotate(${a})" fill="${p.escura}" opacity=".85"/>`) +
        `<path d="M${n1(-r * 0.16)} 0a${n1(r * 0.16)} ${n1(r * 0.16)} 0 1 1 ${n1(r * 0.32)} 0a${n1(r * 0.1)} ${n1(r * 0.1)} 0 1 1 ${n1(-r * 0.2)} 0" fill="none" stroke="${p.petala}" stroke-width="1.6" stroke-linecap="round"/>`
      );
    },
    margarida(r, p, rnd) {
      const n = 14 + Math.floor(rnd() * 5);
      return (
        anel(n, entre(0, 20, rnd), (a) => `<path d="${petala(r, r * 0.2)}" transform="rotate(${a})" fill="${p.petala}" stroke="${p.escura}" stroke-width=".7"/>`) +
        `<circle r="${n1(r * 0.3)}" fill="${p.miolo}"/><circle r="${n1(r * 0.3)}" fill="url(#miolo-sombra)"/>`
      );
    },
    tulipa(r, p) {
      const w = r * 0.78;
      const h = r * 1.1;
      return (
        `<g transform="translate(0 ${n1(h * 0.35)})">` +
        `<path d="M${n1(-w)} ${n1(-h * 0.55)}C${n1(-w)} ${n1(-h * 1.05)} ${n1(-w * 0.4)} ${n1(-h * 1.05)} ${n1(-w * 0.15)} ${n1(-h * 0.75)}L0 ${n1(-h * 0.95)}L${n1(w * 0.15)} ${n1(-h * 0.75)}C${n1(w * 0.4)} ${n1(-h * 1.05)} ${n1(w)} ${n1(-h * 1.05)} ${n1(w)} ${n1(-h * 0.55)}C${n1(w)} ${n1(h * 0.05)} ${n1(w * 0.45)} ${n1(h * 0.2)} 0 ${n1(h * 0.2)}C${n1(-w * 0.45)} ${n1(h * 0.2)} ${n1(-w)} ${n1(h * 0.05)} ${n1(-w)} ${n1(-h * 0.55)}Z" fill="${p.petala}" stroke="${p.escura}" stroke-width="1.2"/>` +
        `<path d="M0 ${n1(h * 0.18)}C${n1(-w * 0.45)} ${n1(-h * 0.2)} ${n1(-w * 0.3)} ${n1(-h * 0.8)} 0 ${n1(-h * 0.95)}C${n1(w * 0.3)} ${n1(-h * 0.8)} ${n1(w * 0.45)} ${n1(-h * 0.2)} 0 ${n1(h * 0.18)}Z" fill="${p.escura}" opacity=".5"/></g>`
      );
    },
    cosmos(r, p, rnd) {
      return (
        anel(8, entre(0, 45, rnd), (a, k) => `<path d="${recortada(r, r * 0.42)}" transform="rotate(${a})" fill="${k % 2 ? p.petala : p.escura}" stroke="${p.escura}" stroke-width=".8"/>`) +
        `<circle r="${n1(r * 0.24)}" fill="${p.miolo}"/>` +
        anel(10, 0, (a) => `<circle cy="${n1(-r * 0.17)}" r="${n1(r * 0.045)}" fill="${p.escura}" transform="rotate(${a})"/>`)
      );
    },
    lirio(r, p, rnd) {
      return (
        anel(6, entre(0, 60, rnd), (a) => `<g transform="rotate(${a})"><path d="${pontuda(r, r * 0.38)}" fill="${p.petala}" stroke="${p.escura}"/><path d="M0 ${n1(-r * 0.15)}L0 ${n1(-r * 0.75)}" stroke="${p.escura}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/></g>`) +
        anel(6, 30, (a) => `<g transform="rotate(${a})"><path d="M0 0L0 ${n1(-r * 0.5)}" stroke="${p.miolo}" stroke-width="1.2"/><ellipse cy="${n1(-r * 0.52)}" rx="${n1(r * 0.05)}" ry="${n1(r * 0.09)}" fill="#7a3b1a"/></g>`) +
        `<circle r="${n1(r * 0.1)}" fill="${p.miolo}"/>`
      );
    },
    hortensia(r, p) {
      let s = `<circle r="${n1(r * 0.85)}" fill="${p.escura}" opacity=".55"/>`;
      const n = 13;
      for (let k = 0; k < n; k++) {
        const ang = (k * 137.5 * Math.PI) / 180;
        const dist = r * 0.7 * Math.sqrt((k + 0.5) / n);
        const f = r * 0.3;
        s +=
          `<g transform="translate(${n1(Math.cos(ang) * dist)} ${n1(Math.sin(ang) * dist)}) rotate(${(k * 23) % 90})">` +
          [0, 90, 180, 270].map((a) => `<path d="${petala(f, f * 0.7)}" transform="rotate(${a})" fill="${k % 2 ? p.petala : p.escura}" stroke="${p.escura}" stroke-width=".5"/>`).join("") +
          `<circle r="${n1(f * 0.18)}" fill="${p.miolo}"/></g>`;
      }
      return s;
    },
    botao(r, p) {
      return (
        `<path d="M0 ${n1(r * 0.5)}C${n1(-r * 0.6)} ${n1(r * 0.2)} ${n1(-r * 0.5)} ${n1(-r * 0.7)} 0 ${n1(-r)}C${n1(r * 0.5)} ${n1(-r * 0.7)} ${n1(r * 0.6)} ${n1(r * 0.2)} 0 ${n1(r * 0.5)}Z" fill="${p.petala}" stroke="${p.escura}"/>` +
        `<path d="M0 ${n1(r * 0.5)}C${n1(-r * 0.45)} ${n1(r * 0.3)} ${n1(-r * 0.5)} ${n1(-r * 0.1)} ${n1(-r * 0.2)} ${n1(-r * 0.35)}L0 ${n1(r * 0.1)}L${n1(r * 0.2)} ${n1(-r * 0.35)}C${n1(r * 0.5)} ${n1(-r * 0.1)} ${n1(r * 0.45)} ${n1(r * 0.3)} 0 ${n1(r * 0.5)}Z" fill="#5e9a5a"/>`
      );
    },
  };
  const TIPOS_GRANDES = ["rosa", "margarida", "tulipa", "cosmos", "lirio", "hortensia"];
  const TIPOS_PEQUENOS = ["margarida", "botao", "rosa", "cosmos", "botao"];
  const PAPEIS = [
    { papel: "#f3c6d3", dobra: "#d99ab0" },
    { papel: "#2b2133", dobra: "#1b1422" },
    { papel: "#d9c8ff", dobra: "#ac93e6" },
    { papel: "#e9d3b8", dobra: "#c9a57d" },
  ];
  const LACOS = ["#ff4f8b", "#b9a0ff", "#ffd27a", "#e8365a"];

  const CENTRO = { x: 200, y: 186 };
  const RAIO = { x: 152, y: 124 };
  const NO = { x: 200, y: 430 }; // onde os cabos se juntam (no laço)

  // espalha as flores pelo "domo" do buquê, escolhendo sempre o lugar mais livre
  const espalhar = (qtd, rMin, rMax, ocupados) => {
    const novos = [];
    for (let n = 0; n < qtd; n++) {
      let melhor = null;
      for (let t = 0; t < 70; t++) {
        const r = entre(rMin, rMax);
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random());
        const x = CENTRO.x + Math.cos(ang) * dist * (RAIO.x - r * 0.55);
        const y = Math.min(292, CENTRO.y + Math.sin(ang) * dist * (RAIO.y - r * 0.55));
        let folga = Infinity;
        for (const o of ocupados.concat(novos)) folga = Math.min(folga, Math.hypot(o.x - x, o.y - y) - (o.r + r) * 0.82);
        if (!melhor || folga > melhor.folga) melhor = { x, y, r, folga };
      }
      novos.push(melhor);
    }
    return novos;
  };

  let flores = [];

  const desenharCabeca = (f, paleta) => FLORES[f.tipo](f.r, paleta, gerador(f.semente));

  const montarBuque = () => {
    const qtdMsg = MSGS.length;
    const rMsg = qtdMsg > 7 ? [30, 36] : [37, 45];
    const ordemMsgs = embaralhar(MSGS.map((_, i) => i));
    const grandes = espalhar(qtdMsg, rMsg[0], rMsg[1], []).map((p, k) => ({ ...p, msg: ordemMsgs[k], tipo: escolher(TIPOS_GRANDES) }));
    const pequenas = espalhar(10 + Math.floor(Math.random() * 4), 15, 24, grandes).map((p) => ({ ...p, msg: null, tipo: escolher(TIPOS_PEQUENOS) }));
    flores = grandes.concat(pequenas).map((f) => ({ ...f, paleta: escolher(PALETAS), giro: entre(0, 360), semente: Math.floor(Math.random() * 1e9) }));
    // as de baixo ficam na frente; as flores com mensagem ficam por cima das pequenas
    flores.sort((a, b) => a.y + (a.msg !== null ? 30 : 0) - (b.y + (b.msg !== null ? 30 : 0)));

    const papel = escolher(PAPEIS);
    const laco = escolher(LACOS.filter((c) => c !== papel.papel));
    let s = `<defs>
      <radialGradient id="halo-rosa"><stop offset=".55" stop-color="#ffb3cf" stop-opacity=".9"/><stop offset=".75" stop-color="#ff7aa8" stop-opacity=".45"/><stop offset="1" stop-color="#ff7aa8" stop-opacity="0"/></radialGradient>
      <radialGradient id="halo-ouro"><stop offset=".55" stop-color="#ffe7a8" stop-opacity="1"/><stop offset=".75" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <radialGradient id="miolo-sombra"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>
      <linearGradient id="folha" x1="0" x2="1"><stop offset="0" stop-color="#3f7d45"/><stop offset="1" stop-color="#76b86c"/></linearGradient>
      <linearGradient id="papel-luz" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
      <filter id="sombra" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".35"/></filter>
    </defs>`;

    // papel de trás
    s += `<path class="papel" d="M36 238Q200 146 364 238L248 566H152Z" fill="${papel.dobra}"/>`;
    s += `<path d="M36 238Q200 146 364 238L248 566H152Z" fill="url(#papel-luz)" opacity=".6"/>`;

    // cabos
    s += `<g class="cabos" fill="none" stroke-linecap="round">`;
    flores.forEach((f, k) => {
      const nx = NO.x + entre(-7, 7);
      const qx = nx + (f.x - nx) * 0.25;
      const qy = (NO.y + f.y) / 2 + 26;
      const cor = k % 2 ? "#4f8a4b" : "#3f7a3f";
      s += `<path d="M${n1(nx)} 560L${n1(nx)} ${NO.y}Q${n1(qx)} ${n1(qy)} ${n1(f.x)} ${n1(f.y)}" stroke="${cor}" stroke-width="${f.msg !== null ? 3.4 : 2.2}" pathLength="1" style="animation-delay:${n1(k * 0.04)}s"/>`;
    });
    s += `</g>`;

    // folhas: umas saindo pelas bordas, outras preenchendo o meio
    s += `<g class="folhas">`;
    const qtdFolhas = 14 + Math.floor(Math.random() * 5);
    for (let k = 0; k < qtdFolhas; k++) {
      const borda = k % 2 === 0;
      const ang = borda ? entre(-30, 210) : entre(0, 360);
      const rad = (ang * Math.PI) / 180;
      const alcance = borda ? 0.84 : entre(0.2, 0.7);
      const x = CENTRO.x + Math.cos(rad) * RAIO.x * alcance;
      const y = Math.min(320, CENTRO.y + Math.sin(rad) * RAIO.y * alcance + 14);
      const c = entre(36, 56);
      const l = entre(10, 15);
      s += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(ang)})"><path d="M0 0C${n1(c * 0.3)} ${n1(-l)} ${n1(c * 0.7)} ${n1(-l)} ${n1(c)} 0C${n1(c * 0.7)} ${n1(l)} ${n1(c * 0.3)} ${n1(l)} 0 0Z" fill="url(#folha)"/><path d="M2 0L${n1(c - 4)} 0" stroke="#2f6234" stroke-width="1"/></g>`;
    }
    s += `</g>`;

    // mosquitinhos (florzinhas brancas)
    s += `<g class="mosquitinhos">`;
    for (let k = 0; k < 4; k++) {
      const ang = (entre(-160, -20) * Math.PI) / 180;
      const cx = CENTRO.x + Math.cos(ang) * RAIO.x * 0.92;
      const cy = CENTRO.y + Math.sin(ang) * RAIO.y * 0.92;
      for (let j = 0; j < 10; j++) {
        s += `<circle cx="${n1(cx + entre(-16, 16))}" cy="${n1(cy + entre(-14, 14))}" r="${n1(entre(1.8, 3.4))}" fill="#fffaf2" opacity="${n1(entre(0.75, 1))}"/>`;
      }
    }
    s += `</g>`;

    // flores
    s += `<g class="flores">`;
    flores.forEach((f, ordem) => {
      const atraso = `animation-delay:${n1(0.55 + ordem * 0.07)}s`;
      const balanco = `animation-duration:${n1(entre(3.5, 6))}s;animation-delay:${n1(-entre(0, 5))}s`;
      if (f.msg === null) {
        s += `<g class="flor" transform="translate(${n1(f.x)} ${n1(f.y)})"><g class="entrada" style="${atraso}"><g class="balanco" style="${balanco}"><g transform="rotate(${n1(f.giro)})" filter="url(#sombra)">${desenharCabeca(f, f.paleta)}</g></g></g></g>`;
        return;
      }
      const ok = decifrada(f.msg);
      s +=
        `<g class="flor msg${ok ? " resolvida" : ""}" data-i="${f.msg}" transform="translate(${n1(f.x)} ${n1(f.y)})" tabindex="0" role="button" aria-label="Flor ${f.msg + 1}: ${ok ? "mensagem decifrada" : "mensagem secreta"}">` +
        `<circle class="halo" r="${n1(f.r * 1.65)}" fill="url(#${ok ? "halo-ouro" : "halo-rosa"})"/>` +
        `<g class="entrada" style="${atraso}"><g class="balanco" style="${balanco}"><g class="forma" transform="rotate(${n1(f.giro)})" filter="url(#sombra)">${desenharCabeca(f, ok ? OURO : f.paleta)}</g></g></g>` +
        `<g transform="translate(${n1(f.r * 0.78)} ${n1(-f.r * 0.78)})"><path class="brilho" d="M0-10L2.4-2.4L10 0L2.4 2.4L0 10L-2.4 2.4L-10 0L-2.4-2.4Z" fill="#fff"/></g>` +
        `<circle r="${n1(f.r * 1.05)}" fill="transparent"/></g>`;
    });
    s += `</g>`;

    // papel da frente e laço
    s += `<path class="papel" d="M74 312Q200 364 326 312L242 572H158Z" fill="${papel.papel}"/>`;
    s += `<path d="M74 312Q200 364 326 312L242 572H158Z" fill="url(#papel-luz)"/>`;
    s += `<path d="M200 338L200 572M138 332L176 572M262 332L224 572" stroke="${papel.dobra}" stroke-width="1.4" opacity=".6" fill="none"/>`;
    s +=
      `<g class="laco" fill="${laco}">` +
      `<path d="M200 430C176 402 146 408 150 426C153 442 182 440 200 430Z"/>` +
      `<path d="M200 430C224 402 254 408 250 426C247 442 218 440 200 430Z"/>` +
      `<path d="M196 434C188 458 176 478 168 494L180 490L184 502C192 482 198 460 202 436Z"/>` +
      `<path d="M204 434C212 458 224 478 232 494L220 490L216 502C208 482 202 460 198 436Z"/>` +
      `<circle cx="200" cy="431" r="8"/>` +
      `<path d="M150 426C170 424 186 428 200 430C186 434 166 436 152 430Z" fill="#000" opacity=".12"/></g>`;

    svg.innerHTML = s;
    if (reduzirMovimento) svg.classList.add("parado");
    atualizarProgresso();
  };

  const dourar = (i) => {
    const el = svg.querySelector(`.msg[data-i="${i}"]`);
    const f = flores.find((x) => x.msg === i);
    if (!el || !f) return;
    el.classList.add("resolvida");
    el.querySelector(".forma").innerHTML = desenharCabeca(f, OURO);
    el.querySelector(".halo").setAttribute("fill", "url(#halo-ouro)");
    el.setAttribute("aria-label", `Flor ${i + 1}: mensagem decifrada`);
  };

  const atualizarProgresso = () => {
    const n = quantasDecifradas();
    progresso.textContent = MSGS.length ? `${n} de ${MSGS.length} flores decifradas` : "";
    avisoFinal.classList.toggle("oculto", !todasDecifradas());
  };

  // ---------- Pétalas caindo ----------
  const chuva = (qtd) => {
    if (reduzirMovimento) return;
    const cores = ["#ff7aa8", "#ffc2d6", "#b9a0ff", "#ffd27a", "#ff4f8b"];
    for (let k = 0; k < qtd; k++) {
      const p = document.createElement("i");
      p.style.left = `${Math.random() * 100}vw`;
      p.style.background = escolher(cores);
      p.style.animationDuration = `${n1(entre(3.5, 7))}s`;
      p.style.animationDelay = `${n1(entre(0, 1.2))}s`;
      p.style.setProperty("--giro", `${Math.round(entre(-360, 360))}deg`);
      p.style.setProperty("--vento", `${Math.round(entre(-90, 90))}px`);
      p.addEventListener("animationend", () => p.remove());
      petalas.appendChild(p);
    }
  };

  // ---------- Peças comuns dos desafios ----------
  const QUASE = ["Quase! Tenta de novo 💭", "Hmm, ainda não… olha com calma 👀", "Não foi dessa vez, mas tá pertinho 💗"];

  const instrucao = (area, texto) => area.insertAdjacentHTML("beforeend", `<p class="instrucao">${texto}</p>`);

  const campoResposta = (area, conferir, rotulo = "O que diz a mensagem?") => {
    const form = document.createElement("form");
    form.className = "resposta";
    form.innerHTML = `<label for="resposta">${rotulo}</label><div class="linha-resposta"><input id="resposta" name="resposta" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escreva aqui"><button class="botao" type="submit">Conferir</button></div><p class="retorno" aria-live="polite"></p>`;
    const retorno = form.querySelector(".retorno");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (conferir(form.resposta.value)) return;
      retorno.textContent = escolher(QUASE);
      form.classList.remove("tremer");
      void form.offsetWidth;
      form.classList.add("tremer");
    });
    area.appendChild(form);
  };

  const botaoDica = (area, rotulo, aoClicar) => {
    const caixa = document.createElement("div");
    caixa.className = "dica";
    caixa.innerHTML = `<button class="link" type="button">💡 ${rotulo}</button><p class="dica-texto" aria-live="polite"></p>`;
    caixa.querySelector("button").addEventListener("click", () => aoClicar(caixa.querySelector(".dica-texto")));
    area.appendChild(caixa);
  };
  const dicaFixa = (area, texto) => botaoDica(area, "Quero uma dica", (alvo) => (alvo.textContent = texto));

  // grade de letras para os códigos de substituição (emoji e números)
  const criptograma = (m, area, ok, simboloDe, pistas) => {
    const grade = document.createElement("div");
    grade.className = "cripto";
    const caixas = [];
    m.texto.split(/\s+/).forEach((palavra) => {
      const p = document.createElement("span");
      p.className = "palavra";
      for (const c of palavra) {
        const letra = semAcento(c).toLowerCase();
        if (/^[a-z]$/.test(letra)) {
          const slot = document.createElement("label");
          slot.className = "slot";
          slot.innerHTML = `<span class="simbolo">${simboloDe(letra)}</span><input maxlength="2" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text">`;
          const input = slot.querySelector("input");
          input.dataset.letra = letra;
          input.setAttribute("aria-label", `Letra do símbolo ${simboloDe(letra)}`);
          caixas.push(input);
          p.appendChild(slot);
        } else {
          const solto = document.createElement("span");
          solto.className = "solto";
          solto.textContent = c;
          p.appendChild(solto);
        }
      }
      grade.appendChild(p);
    });
    area.appendChild(grade);
    const retorno = document.createElement("p");
    retorno.className = "retorno";
    retorno.setAttribute("aria-live", "polite");
    area.appendChild(retorno);

    let terminou = false;
    const revelar = (letra) =>
      caixas
        .filter((c) => c.dataset.letra === letra)
        .forEach((c) => {
          c.value = letra.toUpperCase();
          c.readOnly = true;
          c.parentElement.classList.add("pista");
        });
    const conferir = () => {
      if (terminou) return;
      if (caixas.every((c) => c.value.toLowerCase() === c.dataset.letra)) {
        terminou = true;
        grade.classList.add("certo");
        retorno.textContent = "";
        setTimeout(ok, 700);
      } else if (caixas.every((c) => c.value)) {
        retorno.textContent = "Alguma letra não encaixou… 🤔";
      } else {
        retorno.textContent = "";
      }
    };
    pistas.forEach(revelar);

    caixas.forEach((caixa, idx) => {
      caixa.addEventListener("input", () => {
        const v = semAcento(caixa.value).replace(/[^a-z]/gi, "").slice(-1).toUpperCase();
        // o mesmo símbolo é sempre a mesma letra: preenche todos de uma vez
        caixas.filter((o) => o.dataset.letra === caixa.dataset.letra && !o.readOnly).forEach((o) => (o.value = v));
        if (v) {
          const proxima = caixas.slice(idx + 1).find((o) => !o.readOnly && !o.value) || caixas.find((o) => !o.readOnly && !o.value);
          if (proxima) proxima.focus();
        }
        conferir();
      });
      caixa.addEventListener("keydown", (e) => {
        if (e.key !== "Backspace" || caixa.value) return;
        const anterior = caixas.slice(0, idx).reverse().find((o) => !o.readOnly);
        if (anterior) anterior.focus();
      });
    });

    botaoDica(area, "Revelar uma letra", (alvo) => {
      const faltando = [...new Set(caixas.filter((c) => c.value.toLowerCase() !== c.dataset.letra).map((c) => c.dataset.letra))];
      if (!faltando.length) return;
      const letra = escolher(faltando);
      revelar(letra);
      alvo.textContent = `Revelei a letra ${letra.toUpperCase()} 😉`;
      conferir();
    });
  };

  // ---------- Os códigos ----------
  const EMOJIS = ["🌸", "🌹", "🌷", "🌻", "🌼", "💐", "🍓", "🍒", "⭐", "🌙", "🌞", "🦋", "🐝", "🍀", "🎀", "💌", "🧸", "🍬", "🍭", "🎈", "🔮", "🐱", "🐰", "🌈", "🍉", "🍩"];
  const MORSE = {
    a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--",
    n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..",
    0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
  };
  let audio = null;

  const tocarMorse = (palavras) => {
    const unidade = 0.085;
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    let t = audio.currentTime + 0.1;
    const vibracao = [];
    palavras.forEach((palavra, pi) => {
      [...palavra].forEach((letra, li) => {
        [...(MORSE[letra] || "")].forEach((sinal, si) => {
          const dur = (sinal === "." ? 1 : 3) * unidade;
          const osc = audio.createOscillator();
          const vol = audio.createGain();
          osc.frequency.value = 620;
          vol.gain.setValueAtTime(0, t);
          vol.gain.linearRampToValueAtTime(0.25, t + 0.01);
          vol.gain.setValueAtTime(0.25, t + dur - 0.01);
          vol.gain.linearRampToValueAtTime(0, t + dur);
          osc.connect(vol).connect(audio.destination);
          osc.start(t);
          osc.stop(t + dur);
          vibracao.push(Math.round(dur * 1000));
          const pausa = si < MORSE[letra].length - 1 ? 1 : li < palavra.length - 1 ? 3 : pi < palavras.length - 1 ? 7 : 0;
          if (pausa) vibracao.push(Math.round(pausa * unidade * 1000));
          t += dur + pausa * unidade;
        });
      });
    });
    if (navigator.vibrate) navigator.vibrate(vibracao);
  };

  const CIFRAS = {
    reverso: {
      nome: "De trás pra frente",
      nivel: "Fácil",
      montar(m, area, ok) {
        instrucao(area, "Essa mensagem foi escrita ao contrário. Leia do fim para o começo e escreva o que ela diz.");
        area.insertAdjacentHTML("beforeend", `<p class="cifrado">${escapar([...m.texto].reverse().join(""))}</p>`);
        campoResposta(area, (v) => parecido(v, m.texto) && (ok(), true));
        dicaFixa(area, "Comece pela última letra e vá voltando. Os espaços continuam nos lugares certos.");
      },
    },
    emoji: {
      nome: "Letras de emoji",
      nivel: "Médio",
      montar(m, area, ok) {
        const rnd = gerador(hash(m.texto));
        const sorteados = embaralhar(EMOJIS, rnd);
        const mapa = Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((l, k) => [l, sorteados[k]]));
        const contagem = {};
        for (const c of semAcento(m.texto).toLowerCase()) if (/[a-z]/.test(c)) contagem[c] = (contagem[c] || 0) + 1;
        const ordem = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a]);
        // revela umas letras de frequência média: ajuda sem entregar a frase
        const pistas = ordem.filter((_, k) => k % 2 === 1).slice(0, Math.ceil(ordem.length * 0.4));
        instrucao(area, "Cada emoji é sempre a mesma letra. Algumas já estão no lugar: descubra as outras e complete a frase.");
        criptograma(m, area, ok, (l) => mapa[l], pistas);
      },
    },
    numeros: {
      nome: "Números secretos",
      nivel: "Médio",
      montar(m, area, ok) {
        instrucao(area, "Cada número é uma letra do alfabeto. Uma pista: A = 1, B = 2, C = 3…");
        criptograma(m, area, ok, (l) => l.charCodeAt(0) - 96, []);
      },
    },
    cesar: {
      nome: "A roda de César",
      nivel: "Difícil",
      montar(m, area, ok) {
        const chave = (((Number(m.chave) || 7) % 26) + 26) % 26 || 7;
        const ALFA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const desloca = (t, d) => t.replace(/[A-Z]/g, (c) => ALFA[(((c.charCodeAt(0) - 65 + d) % 26) + 26) % 26]);
        const cifrado = desloca(semAcento(m.texto).toUpperCase(), chave);
        instrucao(area, "Cada letra andou algumas casas no alfabeto. Gire a roda até a frase fazer sentido.");
        area.insertAdjacentHTML(
          "beforeend",
          `<p class="cifrado" id="cesar-texto">${escapar(cifrado)}</p>
          <div class="fitas" aria-hidden="true"><div class="fita" id="fita-cima"></div><div class="fita baixo" id="fita-baixo"></div></div>
          <div class="roda">
            <button class="botao-icone" type="button" data-passo="-1" aria-label="Voltar uma casa">‹</button>
            <input type="range" min="0" max="25" value="0" id="cesar-giro" aria-label="Quantas casas voltar">
            <button class="botao-icone" type="button" data-passo="1" aria-label="Avançar uma casa">›</button>
          </div>
          <p class="giro-valor" id="giro-valor"></p>`
        );
        const texto = area.querySelector("#cesar-texto");
        const giro = area.querySelector("#cesar-giro");
        const valor = area.querySelector("#giro-valor");
        const fitaCima = area.querySelector("#fita-cima");
        const fitaBaixo = area.querySelector("#fita-baixo");
        fitaCima.innerHTML = [...ALFA].map((l) => `<span>${l}</span>`).join("");
        let terminou = false;
        const atualizar = () => {
          const d = Number(giro.value);
          texto.textContent = desloca(cifrado, -d);
          fitaBaixo.innerHTML = [...desloca(ALFA, -d)].map((l) => `<span>${l}</span>`).join("");
          valor.innerHTML = d === 1 ? "Voltando <strong>1</strong> casa" : `Voltando <strong>${d}</strong> casas`;
          if (d === chave && !terminou) {
            terminou = true;
            texto.classList.add("certo");
            setTimeout(ok, 1100);
          }
        };
        giro.addEventListener("input", atualizar);
        area.querySelectorAll("[data-passo]").forEach((b) =>
          b.addEventListener("click", () => {
            giro.value = (Number(giro.value) + Number(b.dataset.passo) + 26) % 26;
            atualizar();
          })
        );
        atualizar();
        dicaFixa(area, "Olhe as palavras pequenas: quando aparecer algo como “TE”, “DO” ou “EU”, você está quase lá!");
      },
    },
    morse: {
      nome: "Código Morse",
      nivel: "Difícil",
      montar(m, area, ok) {
        const palavras = normalizar(m.texto).split(" ").filter(Boolean);
        const codigo = palavras.map((p) => [...p].map((c) => MORSE[c] || "").filter(Boolean).join("  ")).join("   /   ");
        instrucao(area, "Pontinhos e tracinhos! Cada grupo é uma letra e a barra separa as palavras. Dá até pra ouvir.");
        area.insertAdjacentHTML(
          "beforeend",
          `<p class="cifrado morse">${codigo.replace(/\./g, "•").replace(/-/g, "—")}</p>
          <div class="acoes pequenas"><button class="botao secundario" type="button" data-ouvir>🔊 Ouvir</button><button class="botao secundario" type="button" data-colinha aria-expanded="false">📖 Colinha</button></div>
          <div class="colinha oculto">${Object.entries(MORSE)
            .filter(([l]) => /[a-z]/.test(l))
            .map(([l, c]) => `<span><b>${l.toUpperCase()}</b> ${c.replace(/\./g, "•").replace(/-/g, "—")}</span>`)
            .join("")}</div>`
        );
        area.querySelector("[data-ouvir]").addEventListener("click", () => tocarMorse(palavras));
        const colinha = area.querySelector(".colinha");
        area.querySelector("[data-colinha]").addEventListener("click", (e) => {
          const aberta = colinha.classList.toggle("oculto") === false;
          e.currentTarget.setAttribute("aria-expanded", String(aberta));
        });
        campoResposta(area, (v) => parecido(v, m.texto) && (ok(), true));
      },
    },
    senha: {
      nome: "Só você sabe",
      nivel: "Só pra você",
      montar(m, area, ok) {
        const respostas = (m.respostas || []).map(normalizar).filter(Boolean);
        instrucao(area, "Essa flor tem cadeado 🔒 Ela só abre com a resposta certa:");
        area.insertAdjacentHTML("beforeend", `<p class="pergunta">${escapar(m.pergunta || "Qual é a senha?")}</p>`);
        campoResposta(
          area,
          (v) => {
            const r = normalizar(v);
            const certo = r && respostas.some((s) => parecido(r, s) || r.includes(s));
            if (certo) ok();
            return certo;
          },
          "Sua resposta"
        );
        dicaFixa(area, m.dica || "Pensa num dia especial nosso 💭");
      },
    },
  };

  // ---------- Bilhete de cada flor ----------
  let mostrarFinalDepois = false;

  const mostrarRevelada = (i) => {
    const m = MSGS[i];
    const musica = m.musica ? String(m.musica).trim() : "";
    let player = "";
    if (/\.(mp4|webm|m4v|mov)$/i.test(musica)) {
      // Vídeo que está no próprio site (pasta video/)
      player = `<p class="aumenta">Aumenta o som 🔊</p><div class="player"><video src="${escapar(musica)}" controls autoplay playsinline preload="auto" title="Nossa música"></video></div>`;
    } else if (musica) {
      // Código de um vídeo do YouTube
      const video = musica.replace(/[^\w-]/g, "");
      player = `<p class="aumenta">Aumenta o som 🔊</p><div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0&playsinline=1" title="Nossa música" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    corpo.innerHTML = `<p class="selo">💛 Mensagem decifrada</p><p class="mensagem-revelada">${escapar(m.texto)}</p>${player}<div class="acoes"><button class="botao" type="button" data-fechar>Voltar pro buquê</button></div>`;
  };

  const concluir = (i) => {
    salvas.add(assinatura(MSGS[i]));
    salvar();
    mostrarRevelada(i);
    corpo.querySelector("[data-fechar]").focus();
    dourar(i);
    atualizarProgresso();
    chuva(30);
    if (todasDecifradas()) mostrarFinalDepois = true;
  };

  const abrirBilhete = (i) => {
    const m = MSGS[i];
    const cifra = CIFRAS[m.cifra] || CIFRAS.reverso;
    document.getElementById("bilhete-nivel").textContent = `Flor ${i + 1} de ${MSGS.length} · ${cifra.nivel}`;
    document.getElementById("bilhete-titulo").textContent = cifra.nome;
    corpo.innerHTML = "";
    if (decifrada(i)) mostrarRevelada(i);
    else cifra.montar(m, corpo, () => concluir(i));
    bilhete.showModal();
  };

  const abrirFinal = () => {
    document.getElementById("final-texto").textContent = FINAL;
    final.showModal();
    chuva(70);
  };

  // ---------- Eventos ----------
  svg.addEventListener("click", (e) => {
    const flor = e.target.closest(".msg");
    if (flor) abrirBilhete(Number(flor.dataset.i));
  });
  svg.addEventListener("keydown", (e) => {
    const flor = e.target.closest(".msg");
    if (flor && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      abrirBilhete(Number(flor.dataset.i));
    }
  });

  for (const dialogo of [bilhete, final]) {
    dialogo.addEventListener("click", (e) => {
      if (e.target === dialogo || e.target.closest("[data-fechar]")) dialogo.close();
    });
  }
  bilhete.addEventListener("close", () => {
    // Para a música quando o bilhete fecha
    corpo.querySelectorAll("video").forEach((v) => v.pause());
    if (mostrarFinalDepois) {
      mostrarFinalDepois = false;
      setTimeout(abrirFinal, 250);
    }
  });

  document.getElementById("ver-final").addEventListener("click", abrirFinal);
  document.getElementById("novo-buque").addEventListener("click", montarBuque);
  document.getElementById("recomecar").addEventListener("click", () => {
    if (!confirm("Apagar o progresso e esconder as mensagens de novo?")) return;
    salvas.clear();
    salvar();
    montarBuque();
  });

  if (!MSGS.length) {
    document.querySelector(".sub-buque").textContent = "Ainda não tem nenhuma mensagem guardada nas flores.";
  }
  montarBuque();
})();
