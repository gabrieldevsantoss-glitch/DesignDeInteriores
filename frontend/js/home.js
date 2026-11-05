/**
 * Animacoes da pagina inicial com GSAP + ScrollTrigger.
 *
 *  1. Hero: o video avanca/volta conforme a rolagem (scrub)
 *  2. Cabecalho: fica mais opaco depois do hero e marca a secao atual
 *  3. Transicao entre secoes: conteudo entra e a secao anterior "recua"
 *  4. Comodos: secao presa (pin) e as fotos trocam com a rolagem
 *  5. Detalhes: elementos [data-anima], contadores e parallax
 *
 * Se o usuario preferir menos movimento (configuracao do sistema),
 * as animacoes sao desligadas e a pagina funciona normalmente.
 */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return; // CDN indisponivel: pagina segue estatica
  gsap.registerPlugin(ScrollTrigger);

  const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cabecalho = document.querySelector('.site-header');

  // ======================================================================
  // 2. Cabecalho: mais opaco ao sair do hero + item do menu da secao atual
  // ======================================================================
  /**
   * Cabecalho mais opaco depois do hero e sublinhado da secao visivel.
   * Criado por ultimo: assim as posicoes ja consideram o espaco extra
   * das secoes presas (hero e comodos).
   */
  function marcarMenu() {
    ScrollTrigger.create({
      trigger: '#produtos',
      start: 'top top+=80',
      onEnter: () => cabecalho.classList.add('rolado'),
      onLeaveBack: () => cabecalho.classList.remove('rolado'),
    });

    document.querySelectorAll('.menu [data-secao]').forEach((link) => {
      const secao = document.getElementById(link.dataset.secao);
      if (!secao) return;
      // Secao presa (pin): usa o "pin-spacer", que tem a altura real da rolagem
      const alvo = secao.parentElement.classList.contains('pin-spacer') ? secao.parentElement : secao;
      ScrollTrigger.create({
        trigger: alvo,
        start: 'top center',
        end: 'bottom center',
        onToggle: (estado) => link.classList.toggle('ativo', estado.isActive),
      });
    });
  }

  // Fecha o menu do celular ao clicar em um link
  document.querySelectorAll('.menu a').forEach((a) =>
    a.addEventListener('click', () => document.querySelector('.menu').classList.remove('aberto'))
  );

  if (menosMovimento) {
    configurarComodos(false);
    marcarMenu();
    return;
  }

  // ======================================================================
  // 1. Hero: video controlado pela rolagem
  // ======================================================================
  const video = document.querySelector('.hero-video');
  const textosHero = gsap.utils.toArray('[data-hero]');

  // Entrada do texto ao carregar a pagina
  gsap.from(textosHero, { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 });

  const linhaHero = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=150%', // o hero fica preso por 1,5 tela enquanto o video roda
      pin: true,
      scrub: 0.6,
    },
  });

  // O texto sobe e some, o indicador de rolagem desaparece
  linhaHero
    .to('.hero-rolar', { opacity: 0, duration: 0.1 }, 0)
    .to('.hero-conteudo', { y: -120, opacity: 0, ease: 'none', duration: 0.6 }, 0.1);

  // Quando o video carregar, seu tempo passa a acompanhar a rolagem
  const ligarVideo = () => {
    video.pause();
    linhaHero.fromTo(video, { currentTime: 0 }, { currentTime: video.duration || 1, ease: 'none', duration: 1 }, 0);
  };
  if (video.readyState >= 1) ligarVideo();
  else video.addEventListener('loadedmetadata', ligarVideo, { once: true });

  // Secoes presas (pin) devem ser criadas na ordem da pagina,
  // antes das animacoes das secoes que vem depois delas
  configurarComodos(true);

  // ======================================================================
  // 3. Transicao entre secoes
  //    - a secao que sai encolhe levemente e escurece
  //    - o conteudo da proxima entra com [data-anima]
  // ======================================================================
  gsap.utils.toArray('.secao-tela').forEach((secao) => {
    gsap.fromTo(secao,
      { '--recuo': 0 },
      {
        '--recuo': 1,
        ease: 'none',
        scrollTrigger: { trigger: secao, start: 'bottom bottom', end: 'bottom top', scrub: true },
      });
  });

  // Elementos que aparecem ao entrar na tela
  gsap.utils.toArray('[data-anima]').forEach((el) => {
    const direcao = el.dataset.anima;
    const de = { opacity: 0, y: 50 };
    if (direcao === 'esquerda') Object.assign(de, { x: -80, y: 0 });
    if (direcao === 'direita') Object.assign(de, { x: 80, y: 0 });

    gsap.from(el, {
      ...de,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
    });
  });

  // Cards de produto entram em sequencia
  gsap.from('.produto-card', {
    y: 60,
    opacity: 0,
    rotate: 2,
    duration: 0.8,
    stagger: 0.08,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.carrossel', start: 'top 80%', toggleActions: 'play none none reverse' },
  });

  // Fundo diagonal dos produtos se move levemente
  gsap.fromTo('.secao-produtos', { backgroundPosition: '0% 0%' }, {
    backgroundPosition: '0% 30%',
    ease: 'none',
    scrollTrigger: { trigger: '.secao-produtos', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // ======================================================================
  // 5. Contadores (sobre nos) e parallax das imagens
  // ======================================================================
  document.querySelectorAll('[data-contar]').forEach((el) => {
    const alvo = { valor: 0 };
    const sufixo = el.dataset.sufixo || '+';
    gsap.to(alvo, {
      valor: Number(el.dataset.contar),
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = Math.round(alvo.valor) + sufixo; },
    });
  });

  document.querySelectorAll('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -10 }, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Fundo do contato com leve zoom
  gsap.fromTo('.secao-contato', { backgroundSize: '115%' }, {
    backgroundSize: '100%',
    ease: 'none',
    scrollTrigger: { trigger: '.secao-contato', start: 'top bottom', end: 'top top', scrub: true },
  });

  marcarMenu();

  // ======================================================================
  // 4. Comodos: secao presa enquanto as fotos trocam com a rolagem
  // ======================================================================
  function configurarComodos(animar) {
    const secao = document.querySelector('[data-comodos]');
    if (!secao) return;

    const slides = gsap.utils.toArray('.comodo', secao);
    const pontos = gsap.utils.toArray('.progresso-ponto', secao);
    const barra = secao.querySelector('.progresso-barra');
    const total = slides.length;
    let atual = 0;

    /** Destaca o comodo "indice" (classe ativo nas fotos e bolinhas) */
    function mostrar(indice) {
      if (indice === atual) return;
      atual = indice;
      slides.forEach((s, i) => s.classList.toggle('ativo', i === indice));
      pontos.forEach((p, i) => {
        p.classList.toggle('ativo', i === indice);
        p.classList.toggle('visto', i < indice);
      });
    }

    if (!animar) {
      // Sem animacao: as bolinhas apenas trocam a foto
      pontos.forEach((p, i) => p.addEventListener('click', () => mostrar(i)));
      return;
    }

    const gatilho = ScrollTrigger.create({
      trigger: secao,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (total - 1), // uma tela de rolagem por comodo
      pin: true,
      scrub: true,
      snap: { snapTo: 1 / (total - 1), duration: 0.4, ease: 'power1.inOut' },
      onUpdate: (st) => {
        gsap.set(barra, { scaleY: st.progress });
        mostrar(Math.round(st.progress * (total - 1)));
      },
    });

    // Clicar numa bolinha rola ate o comodo correspondente
    pontos.forEach((p, i) => p.addEventListener('click', () => {
      const destino = gatilho.start + (gatilho.end - gatilho.start) * (i / (total - 1));
      window.scrollTo({ top: destino, behavior: 'smooth' });
    }));

    // Leve zoom da foto ativa durante a rolagem
    slides.forEach((slide) => {
      gsap.fromTo(slide.querySelector('img'), { scale: 1.12 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: secao, start: 'top bottom', end: () => gatilho.end, scrub: true },
      });
    });
  }
})();
