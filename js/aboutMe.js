// GSAP // ScrollSmoother ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true
  });
});



// GSAP // 인덱스 고정 =============================================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollSmoother) gsap.registerPlugin(ScrollSmoother);

  // 0) ScrollSmoother
  const smoother = window.ScrollSmoother
    ? ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      effects: true
    })
    : null;

  const wrap = document.querySelector("#sticky-wrap");
  const menu = wrap?.querySelector(".sticky-menu");
  const container = wrap?.querySelector(".sticky-container");
  if (!wrap || !menu || !container) return;

  const menuItems = Array.from(menu.querySelectorAll(":scope > .menu-item"));
  const articles = Array.from(container.querySelectorAll(":scope > article"));

  const count = Math.min(menuItems.length, articles.length);
  const pairs = Array.from({ length: count }, (_, i) => ({
    item: menuItems[i],
    article: articles[i]
  }));

  const scrollerEl = smoother ? smoother.wrapper() : window;

  // --- utils ---------------------------------------------------------
  const setActive = (idx) => {
    menuItems.forEach((el) => el.classList.remove("is-active"));
    menuItems[idx]?.classList.add("is-active");
  };

  // refresh는 레이아웃 변화가 연속으로 올 수 있어서 디바운스 추천
  let refreshRAF = 0;
  const requestRefresh = () => {
    cancelAnimationFrame(refreshRAF);
    refreshRAF = requestAnimationFrame(() => {
      // transition/DOM 반영 타이밍 보완: rAF 한 번 더
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  };

  const calcPinEnd = () => {
    const total = container.scrollHeight;
    const vh = window.innerHeight;
    const dist = Math.max(0, total - vh);
    return `+=${dist}`;
  };

  // 1) sticky-menu pin
  ScrollTrigger.create({
    id: "stickyMenuPin",
    trigger: wrap,
    start: "top top",
    end: calcPinEnd,
    pin: menu,
    pinSpacing: true,
    scroller: scrollerEl,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    pinType: smoother ? "transform" : "fixed"
  });

  // 2) 메뉴 클릭 → 해당 article로 이동
  pairs.forEach(({ item, article }, idx) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      setActive(idx);

      if (smoother) {
        // 요소 기반 이동이 ScrollSmoother 환경에서 가장 안정적
        smoother.scrollTo(article, true, "top top");
      } else {
        article.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // 3) 스크롤 위치 → 메뉴 active 자동 변경
  pairs.forEach(({ article }, idx) => {
    ScrollTrigger.create({
      trigger: article,
      scroller: scrollerEl,
      start: "top center",
      end: "bottom center",
      onEnter: () => setActive(idx),
      onEnterBack: () => setActive(idx),
      invalidateOnRefresh: true
    });
  });

  // 초기 active
  setActive(0);

  // --- 핵심: 컨테이너 높이 변화 자동 감지 -----------------------------
  // 탭/아코디언/이미지 로딩 등으로 높이가 변하면 pin end 재계산 필요
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => requestRefresh());
    ro.observe(container);

    // 내부가 많고 레이아웃이 article 단위로 크게 바뀌면 이것도 도움됨(선택)
    // articles.forEach((a) => ro.observe(a));
  } else {
    // fallback: DOM 변화 감지(높이 변화 감지는 아니지만 탭 토글엔 보통 충분)
    const mo = new MutationObserver(() => requestRefresh());
    mo.observe(container, { childList: true, subtree: true, attributes: true });
  }

  // 이미지/폰트 등 늦게 반영되는 것까지 커버
  window.addEventListener("load", requestRefresh);
  window.addEventListener("resize", requestRefresh);

  // 첫 계산
  requestRefresh();
});






// 타임라인 ============================================================================================================================================
window.addEventListener("DOMContentLoaded", () => {
  const ctl = new CollapsibleTimeline("#timeline");
});

class CollapsibleTimeline {
  constructor(el) {
    this.el = document.querySelector(el);

    this.init();
  }
  init() {
    this.el?.addEventListener("click", this.itemAction.bind(this));
  }
  animateItemAction(button, ctrld, contentHeight, shouldCollapse) {
    const expandedClass = "timeline__item-body--expanded";
    const animOptions = {
      duration: 300,
      easing: "cubic-bezier(0.65,0,0.35,1)"
    };

    if (shouldCollapse) {
      button.ariaExpanded = "false";
      ctrld.ariaHidden = "true";
      ctrld.classList.remove(expandedClass);
      animOptions.duration *= 2;
      this.animation = ctrld.animate([
        { height: `${contentHeight}px` },
        { height: `${contentHeight}px` },
        { height: "0px" }
      ], animOptions);
    } else {
      button.ariaExpanded = "true";
      ctrld.ariaHidden = "false";
      ctrld.classList.add(expandedClass);
      this.animation = ctrld.animate([
        { height: "0px" },
        { height: `${contentHeight}px` }
      ], animOptions);
    }
  }
  itemAction(e) {
    const { target } = e;
    const action = target?.getAttribute("data-action");
    const item = target?.getAttribute("data-item");

    if (action) {
      const targetExpanded = action === "expand" ? "false" : "true";
      const buttons = Array.from(this.el?.querySelectorAll(`[aria-expanded="${targetExpanded}"]`));
      const wasExpanded = action === "collapse";

      for (let button of buttons) {
        const buttonID = button.getAttribute("data-item");
        const ctrld = this.el?.querySelector(`#item${buttonID}-ctrld`);
        const contentHeight = ctrld.firstElementChild?.offsetHeight;

        this.animateItemAction(button, ctrld, contentHeight, wasExpanded);
      }

    } else if (item) {
      const button = this.el?.querySelector(`[data-item="${item}"]`);
      const expanded = button?.getAttribute("aria-expanded");

      if (!expanded) return;

      const wasExpanded = expanded === "true";
      const ctrld = this.el?.querySelector(`#item${item}-ctrld`);
      const contentHeight = ctrld.firstElementChild?.offsetHeight;

      this.animateItemAction(button, ctrld, contentHeight, wasExpanded);
    }
  }
}



// 취미 & 특기 타이틀 탭 ============================================================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#title-tab");
  if (!root) return;

  const items = root.querySelectorAll(".idv__item");
  if (!items.length) return;

  const closePanel = (btn, panel) => {
    btn.setAttribute("aria-expanded", "false");
    panel.style.maxHeight = panel.scrollHeight + "px";
    panel.offsetHeight; // reflow
    panel.style.maxHeight = "0px";
    panel.addEventListener("transitionend", function onEnd(e) {
      if (e.propertyName !== "max-height") return;
      panel.hidden = true;
      panel.removeEventListener("transitionend", onEnd);
    });
  };

  const openPanel = (btn, panel) => {
    btn.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    panel.style.maxHeight = "0px";
    panel.offsetHeight; // reflow
    panel.style.maxHeight = panel.scrollHeight + "px";
  };

  items.forEach((item) => {
    const btn = item.querySelector(".idv__btn");
    const panel = item.querySelector(".idv__panel");
    if (!btn || !panel) return;

    panel.style.transition = "max-height 360ms ease";
    panel.style.maxHeight = "0px";
    panel.hidden = true;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) closePanel(btn, panel);
      else openPanel(btn, panel);
    });
  });

  // 리사이즈 시 열린 패널 높이 재계산
  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      root.querySelectorAll('.idv__btn[aria-expanded="true"]').forEach((btn) => {
        const panel = btn.closest(".idv__item")?.querySelector(".idv__panel");
        if (!panel || panel.hidden) return;
        panel.style.maxHeight = panel.scrollHeight + "px";
      });
    });
  });
});


// 취미 & 특기 타이틀 탭 ============================================================================================================================================
document.addEventListener("DOMContentLoaded", function () {
  var inc02Swiper = new Swiper("#title-tab .swiper", {
    speed: 1200,
    slidesPerView: 2.2,
    spaceBetween: 150,
    grabCursor: true,
    centeredSlides: true,
    pagination: false,
    slideActiveClass: 'on',
  });
});



// 다양한경험 ============================================================================================================================================
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  gsap.set('.image-motion', {
    transform: 'rotatex(90deg)',
  });

  gsap.to('.image-motion', {
    transform: 'rotatex(0deg)',
    scrollTrigger: {
      trigger: '.section2',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      markers: false,
    },
  });

  gsap.fromTo('.title', {
    opacity: 0,
    y: 50,
  }, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.section3',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
    },
  });

  gsap.fromTo('.subtitle', {
    opacity: 0,
    y: 30,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.3,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.section3',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
    },
  });

  const text = new SplitText('.text', {
    types: 'lines',
    mask: 'lines',
  });

  gsap.fromTo(text.lines, {
    opacity: 0,
    y: 30,
  }, {
    opacity: 1,
    y: 0,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.text-content',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
    },
  });

  gsap.fromTo('.feature', {
    opacity: 0,
    y: 50,
    scale: 0.9,
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.features',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
    },
  });
});



// 실패경험  ============================================================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".failure-wrap");
  if (!root) return;

  const SPEED = 300;

  // 루트(기존) / 서브(분리) 판별
  const isRootAccordion = (acc) =>
    acc?.classList?.contains("js-accordion") && acc?.dataset?.accordion === "root";

  const isSubAccordion = (acc) => acc?.classList?.contains("js-sub-accordion");

  // 공통 슬라이드
  const slideUp = (el, duration = SPEED) => {
    if (!el || el.style.display === "none") return;

    el.style.height = el.offsetHeight + "px";
    el.style.transitionProperty = "height";
    el.style.transitionDuration = duration + "ms";
    el.style.overflow = "hidden";

    requestAnimationFrame(() => {
      el.style.height = "0px";
    });

    window.setTimeout(() => {
      el.style.display = "none";
      el.style.removeProperty("height");
      el.style.removeProperty("transition-property");
      el.style.removeProperty("transition-duration");
      el.style.removeProperty("overflow");
    }, duration);
  };

  const slideDown = (el, duration = SPEED) => {
    if (!el) return;

    el.style.display = "block";
    const height = el.scrollHeight;

    el.style.height = "0px";
    el.style.transitionProperty = "height";
    el.style.transitionDuration = duration + "ms";
    el.style.overflow = "hidden";

    // reflow
    el.offsetHeight;

    requestAnimationFrame(() => {
      el.style.height = height + "px";
    });

    window.setTimeout(() => {
      el.style.removeProperty("height");
      el.style.removeProperty("transition-property");
      el.style.removeProperty("transition-duration");
      el.style.removeProperty("overflow");
    }, duration);
  };

  // --- ROOT: item open/close ---
  const closeRootItem = (item) => {
    item.classList.remove("active");
    slideUp(item.querySelector(":scope > .js-accordion-body"), SPEED);
  };

  const openRootItem = (item) => {
    item.classList.add("active");
    slideDown(item.querySelector(":scope > .js-accordion-body"), SPEED);
  };

  // --- SUB: item open/close ---
  const closeSubItem = (item) => {
    item.classList.remove("active");
    slideUp(item.querySelector(":scope > .js-sub-accordion-body"), SPEED);
  };

  const openSubItem = (item) => {
    item.classList.add("active");
    slideDown(item.querySelector(":scope > .js-sub-accordion-body"), SPEED);
  };

  // ✅ 초기화: ROOT도 전부 닫힘 / SUB도 전부 닫힘
  const initRootAccordions = () => {
    root.querySelectorAll('.js-accordion[data-accordion="root"]').forEach((acc) => {
      const items = Array.from(acc.querySelectorAll(":scope > .js-accordion-item"));
      if (!items.length) return;

      items.forEach((it) => {
        it.classList.remove("active");
        const body = it.querySelector(":scope > .js-accordion-body");
        if (body) body.style.display = "none";
      });
    });
  };

  const initSubAccordions = () => {
    root.querySelectorAll(".js-sub-accordion").forEach((acc) => {
      const items = Array.from(acc.querySelectorAll(":scope > .js-sub-accordion-item"));
      if (!items.length) return;

      items.forEach((it) => {
        it.classList.remove("active");
        const body = it.querySelector(":scope > .js-sub-accordion-body");
        if (body) body.style.display = "none";
      });
    });
  };

  initRootAccordions();
  initSubAccordions();

  // 클릭 델리게이션
  root.addEventListener("click", (e) => {
    // 1) ROOT 헤더 클릭 처리
    const rootHeader = e.target.closest(".js-accordion-header");
    if (rootHeader) {
      const item = rootHeader.closest(".js-accordion-item");
      const acc = rootHeader.closest('.js-accordion[data-accordion="root"]');
      if (!item || !acc || !isRootAccordion(acc)) return;

      const isActive = item.classList.contains("active");

      // ✅ ROOT: 열려있으면 다시 클릭 시 닫힘
      if (isActive) {
        closeRootItem(item);
        return;
      }

      // ✅ ROOT: 다른 탭 클릭 → 형제 닫고 현재 오픈 (최대 1개만 열림, 단 0개도 가능)
      const siblings = Array.from(acc.querySelectorAll(":scope > .js-accordion-item.active"));
      siblings.forEach((sib) => {
        if (sib !== item) closeRootItem(sib);
      });
      openRootItem(item);
      return;
    }

    // 2) SUB 헤더 클릭 처리 (기존 유지)
    const subHeader = e.target.closest(".js-sub-accordion-header");
    if (subHeader) {
      const item = subHeader.closest(".js-sub-accordion-item");
      const acc = subHeader.closest(".js-sub-accordion");
      if (!item || !acc || !isSubAccordion(acc)) return;

      const isActive = item.classList.contains("active");

      // 서브: 토글 허용 / 여러 개 열림 허용
      if (isActive) closeSubItem(item);
      else openSubItem(item);
    }
  });
});





// matter.js - 인 앤 아웃 인 요소 ============================================================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector("#in");
  if (!stage) return console.error("#in 요소 없음");

  const { Engine, Render, World, Bodies, Body, Runner, Vector, Events } = Matter;

  stage.style.position = stage.style.position || "relative";

  // 원본처럼 반응형 스케일(스프라이트 / 히트박스 / 작은 히트박스)
  function getResponsiveScale(cw) {
    if (cw <= 360) return { sprite: 0.40, hit: 0.30, small: 0.10 };
    if (cw <= 468) return { sprite: 0.50, hit: 0.35, small: 0.10 };
    if (cw <= 800) return { sprite: 0.70, hit: 0.55, small: 0.40 };
    if (cw <= 1200) return { sprite: 0.75, hit: 0.60, small: 0.45 };
    return { sprite: 0.85, hit: 0.60, small: 0.45 };
  }


  // 아웃 데이터
  const elementData = [
    { src: "images/aboutMe/matter/do/skill_obj02.png", isSmall: false, angle: -10 },
    { src: "images/aboutMe/matter/do/skill_obj03.png", isSmall: false, angle: 4 },
    { src: "images/aboutMe/matter/do/skill_obj04.png", isSmall: false, angle: -8 },
    { src: "images/aboutMe/matter/do/skill_obj05.png", isSmall: false, angle: 12 },
    { src: "images/aboutMe/matter/do/skill_obj06.png", isSmall: false, angle: -6 },
    { src: "images/aboutMe/matter/do/skill_obj07.png", isSmall: false, angle: -5 },
    { src: "images/aboutMe/matter/do/skill_obj08.png", isSmall: false, angle: 9 },
    { src: "images/aboutMe/matter/do/skill_obj09.png", isSmall: false, angle: -7 },
    { src: "images/aboutMe/matter/do/skill_obj10.png", isSmall: false, angle: 5 },
    { src: "images/aboutMe/matter/do/skill_obj11.png", isSmall: false, angle: -12 },
    //{ src: "images/aboutMe/matter/skill_obj15.svg", isSmall: false, angle: 3, link: "./pdfs/JeongYeonju_Resume.pdf" },
  ];

  const ITEM_W = 520;
  const ITEM_H = 140;

  const deg = (d) => (d * Math.PI) / 180;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const engine = Engine.create();
  engine.gravity.y = 0;
  engine.gravity.scale = 0;

  const render = Render.create({
    element: stage,
    engine,
    options: {
      width: stage.clientWidth,
      height: stage.clientHeight,
      background: "transparent",
      wireframes: false,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    },
  });

  const runner = Runner.create();

  let bodies = [];
  let isInside = false;
  let pointer = { x: render.options.width / 2, y: render.options.height / 2 };

  function canvasPoint(e) {
    const r = render.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (render.options.width / r.width),
      y: (e.clientY - r.top) * (render.options.height / r.height),
    };
  }

  function buildWorld() {
    const CW = stage.clientWidth;
    const CH = stage.clientHeight;

    World.clear(engine.world, false);

    render.options.width = CW;
    render.options.height = CH;
    render.canvas.width = CW * render.options.pixelRatio;
    render.canvas.height = CH * render.options.pixelRatio;
    render.canvas.style.width = `${CW}px`;
    render.canvas.style.height = `${CH}px`;

    // 벽
    const t = 150;
    World.add(engine.world, [
      Bodies.rectangle(CW / 2, -t, CW * 2, t, { isStatic: true, render: { opacity: 0 } }),
      Bodies.rectangle(CW / 2, CH + t, CW * 2, t, { isStatic: true, render: { opacity: 0 } }),
      Bodies.rectangle(-t, CH / 2, t, CH * 2, { isStatic: true, render: { opacity: 0 } }),
      Bodies.rectangle(CW + t, CH / 2, t, CH * 2, { isStatic: true, render: { opacity: 0 } }),
    ]);

    const { sprite: SPRITE, hit: HIT, small: SMALL_HIT } = getResponsiveScale(CW);

    const cx = CW / 2;
    const cy = CH / 2;

    bodies = elementData.map((d) => {
      // 시작 위치: 사방에서 생성
      const side = Math.floor(Math.random() * 4);
      let x = cx, y = cy;

      if (side === 0) { x = Math.random() * CW; y = -120; }
      if (side === 1) { x = CW + 120; y = Math.random() * CH; }
      if (side === 2) { x = Math.random() * CW; y = CH + 120; }
      if (side === 3) { x = -120; y = Math.random() * CH; }

      const hitScale = d.isSmall ? SMALL_HIT : HIT;

      // 충돌 박스는 hitScale로 줄이고, 스프라이트는 spriteScale로 표시
      const body = Bodies.rectangle(x, y, ITEM_W * hitScale, ITEM_H * hitScale, {
        restitution: 0.2,
        friction: 0.22,
        frictionStatic: 0.7,
        frictionAir: 0.06, // ✅ (기존 0.12) 공기저항 낮춰서 더 빠르게
        render: {
          sprite: {
            texture: d.src,
            xScale: SPRITE,
            yScale: SPRITE,
          },
        },
      });

      Body.setAngle(body, deg(d.angle || 0));
      return body;
    });

    World.add(engine.world, bodies);

    pointer.x = cx;
    pointer.y = cy;
  }

  // ✅ 빠르게 붙고, 점점 느려지는(스프링+댐핑)
  function attract() {
    const CW = render.options.width;
    const CH = render.options.height;

    const target = isInside ? pointer : { x: CW / 2, y: CH / 2 };

    // ====== 속도 튜닝(여기 중요) ======
    const spring = 0.0032;   // ✅ (기존 0.0009) 3~4배 ↑
    const damping = 0.035;   // ✅ (기존 0.06) ↓ : 너무 죽지 않게
    const maxForce = 0.09;   // ✅ (기존 0.035) ↑ : 초반 접근 속도 확보
    const distCap = 520;     // ✅ (기존 220) ↑ : 멀리 있어도 힘 유지
    // =================================

    for (const b of bodies) {
      const to = Vector.sub(target, b.position);
      const m = Vector.magnitude(to);
      if (m < 0.0001) continue;

      // "가까울수록 가속" 느낌을 줄이려고, 거리값을 캡으로 제한해서 선형 범위만 사용
      const dist = clamp(m, 0, distCap);
      const dir = Vector.mult(to, 1 / m);

      const springForce = Vector.mult(dir, dist * spring * b.mass);
      const dampingForce = Vector.mult(b.velocity, -damping * b.mass);

      let force = Vector.add(springForce, dampingForce);

      const fm = Vector.magnitude(force);
      if (fm > maxForce) force = Vector.mult(force, maxForce / fm);

      Body.applyForce(b, b.position, force);
    }
  }

  // 마우스(좌표) 역할 + 내부에서만 추적
  stage.addEventListener("pointerenter", () => (isInside = true));
  stage.addEventListener("pointerleave", () => (isInside = false));
  render.canvas.addEventListener(
    "pointermove",
    (e) => {
      pointer = canvasPoint(e);
    },
    { passive: true }
  );

  buildWorld();
  Events.on(engine, "beforeUpdate", attract);
  Runner.run(runner, engine);
  Render.run(render);

  let resizeId;
  const resize = () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(buildWorld, 150);
  };

  window.addEventListener("resize", resize);
  new ResizeObserver(resize).observe(stage);
});



// matter.js - 인 앤 아웃 아웃 요소 ============================================================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("out");
  if (!container) return console.error("#out 요소 없음");

  const { Engine, World, Bodies, Body, Render, MouseConstraint, Mouse, Runner, Events } = Matter;

  function getResponsiveScale(cw) {
    if (cw <= 360) return { sprite: 0.40, hit: 0.3, small: 0.10 };
    if (cw <= 468) return { sprite: 0.50, hit: 0.35, small: 0.10 };
    if (cw <= 800) return { sprite: 0.70, hit: 0.55, small: 0.40 };
    if (cw <= 1200) return { sprite: 0.75, hit: 0.6, small: 0.45 };
    return { sprite: 0.85, hit: 0.60, small: 0.45 };
  }

  // 엔진 및 렌더러 생성
  const engine = Engine.create();

  // ✅ 시작 전에는 중력 OFF (트리거 시 ON)
  engine.gravity.y = 0;
  engine.gravity.scale = 0;

  const renderer = Render.create({
    element: container,
    engine,
    options: {
      width: container.offsetWidth,
      height: container.offsetHeight,
      wireframes: false,
      background: "#111",
    },
  });

  // 마우스 컨트롤 생성 (드래그는 유지)
  const mouse = Mouse.create(renderer.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });

  // 스크롤/터치 방해 방지(기존 유지)
  mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
  mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
  mouse.element.removeEventListener("touchstart", mouse.mousedown);
  mouse.element.removeEventListener("touchmove", mouse.mousemove);
  mouse.element.removeEventListener("touchend", mouse.mouseup);

  // ✅ 반발용 포인터 좌표 추적 (스크롤 방해 없음)
  const pointer = { x: null, y: null, inside: false };
  const updatePointer = (clientX, clientY) => {
    const rect = renderer.canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (renderer.canvas.width / rect.width);
    const y = (clientY - rect.top) * (renderer.canvas.height / rect.height);
    // Matter 월드는 렌더 bounds 변형 없으면 canvas 좌표계와 동일하므로 그대로 사용
    pointer.x = x;
    pointer.y = y;
  };

  renderer.canvas.addEventListener("pointerenter", () => { pointer.inside = true; }, { passive: true });
  renderer.canvas.addEventListener("pointerleave", () => { pointer.inside = false; pointer.x = null; pointer.y = null; }, { passive: true });
  renderer.canvas.addEventListener("pointermove", (e) => { updatePointer(e.clientX, e.clientY); }, { passive: true });

  // 모바일에서 move가 약할 수 있어 down에서도 갱신
  renderer.canvas.addEventListener("pointerdown", (e) => { updatePointer(e.clientX, e.clientY); }, { passive: true });

  // 아웃 데이터
  const elementData = [
    { src: "images/aboutMe/matter/dont/skill_obj12.png", isSmall: false, angle: -10 },
    { src: "images/aboutMe/matter/dont/skill_obj13.png", isSmall: false, angle: 4 },
    { src: "images/aboutMe/matter/dont/skill_obj14.png", isSmall: false, angle: -8 },
    { src: "images/aboutMe/matter/dont/skill_obj15.png", isSmall: false, angle: 12 },
    { src: "images/aboutMe/matter/dont/skill_obj16.png", isSmall: false, angle: -6 },
    { src: "images/aboutMe/matter/dont/skill_obj17.png", isSmall: false, angle: -5 },
    { src: "images/aboutMe/matter/dont/skill_obj18.png", isSmall: false, angle: 9 },
    { src: "images/aboutMe/matter/dont/skill_obj19.png", isSmall: false, angle: -7 },
    { src: "images/aboutMe/matter/dont/skill_obj20.png", isSmall: false, angle: 5 },
    { src: "images/aboutMe/matter/dont/skill_obj21.png", isSmall: false, angle: -12 },
    //{ src: "images/aboutMe/matter/skill_obj15.svg", isSmall: false, angle: 3, link: "./pdfs/JeongYeonju_Resume.pdf" },
  ];
  
  const ITEM_W = 520, ITEM_H = 140;
  const physics = { restitution: 0.3, friction: 0.3, frictionStatic: 0.8 };
  const deg = (d) => (d * Math.PI) / 180;

  let createdElements = [];

  function createImgRect(src, w, h, spriteScale, hitScale, x, y, angleDeg, link = null) {
    const body = Bodies.rectangle(x, y, w * hitScale, h * hitScale, {
      ...physics,
      render: { sprite: { texture: src, xScale: spriteScale, yScale: spriteScale } },
    });
    Body.setAngle(body, deg(angleDeg || 0));
    if (link) body.clickLink = link;
    return body;
  }

  function handleClick() {
    const p = mouse.position;

    for (const element of createdElements) {
      if (!element.clickLink) continue;

      const b = element.bounds;
      if (p.x >= b.min.x && p.x <= b.max.x && p.y >= b.min.y && p.y <= b.max.y) {
        const downloadUrl = element.clickLink.replace(
          "/view?usp=sharing",
          "/export?format=pdf&id=1S-Mk0N_FRbjABeL88c-7xO99ZxmoRN5v"
        );
        window.open(downloadUrl, "_blank");
        break;
      }
    }
  }

  renderer.canvas.addEventListener("click", handleClick);

  function resetSimulation() {
    const CW = container.offsetWidth;
    const CH = container.offsetHeight;

    World.clear(engine.world);

    renderer.canvas.width = CW;
    renderer.canvas.height = CH;
    renderer.options.width = CW;
    renderer.options.height = CH;

    const walls = [
      Bodies.rectangle(-0.5, CH / 2, 1, CH * 2, { isStatic: true, render: { opacity: 0 } }),
      Bodies.rectangle(CW + 0.5, CH / 2, 1, CH * 2, { isStatic: true, render: { opacity: 0 } }),
      Bodies.rectangle(CW / 2, CH + 0.5, CW * 2, 1, { isStatic: true, render: { opacity: 0 } }),
    ];
    World.add(engine.world, walls);

    const { sprite: SPRITE, hit: HIT, small: SMALL_HIT } = getResponsiveScale(CW);

    const elements = elementData.map((data, index) => {
      const x = Math.random() * (CW * 0.8) + CW * 0.1;
      const y = -200 - index * 150;
      const hitScale = data.isSmall ? SMALL_HIT : HIT;
      return createImgRect(data.src, ITEM_W, ITEM_H, SPRITE, hitScale, x, y, data.angle, data.link);
    });

    createdElements = elements;
    World.add(engine.world, [...elements, mouseConstraint]);
  }

  // ✅ 마우스(포인터) 근접 반발(튀어나감) 인터랙션 -----------------------------
  const repel = {
    radius: 200,        // 반발 반경(px)
    strength: 30,  // ✅ 이전보다 강하게(체감용)
    maxForce: 50,   // 최대 힘 제한
    softZone: 10      // 너무 가까울 때 폭주 방지
  };

  function applyPointerRepel() {
    if (!started) return;
    if (!pointer.inside || pointer.x == null || pointer.y == null) return;

    // 드래그 중이면 튕김이 불편할 수 있어 끄고 싶으면 아래 주석 해제
    // if (mouseConstraint.body) return;

    const px = pointer.x;
    const py = pointer.y;

    for (const b of createdElements) {
      if (!b || b.isStatic) continue;

      const c = b.position;
      const dx = c.x - px;
      const dy = c.y - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 0 || dist > repel.radius) continue;

      // 가까울수록 더 세게: (1 - dist/radius)^2
      const t = 1 - dist / repel.radius;
      const falloff = t * t;

      const safeDist = Math.max(dist, repel.radius * repel.softZone);
      const nx = dx / safeDist;
      const ny = dy / safeDist;

      let fx = nx * repel.strength * falloff;
      let fy = ny * repel.strength * falloff;

      const fmag = Math.sqrt(fx * fx + fy * fy);
      if (fmag > repel.maxForce) {
        const s = repel.maxForce / fmag;
        fx *= s;
        fy *= s;
      }

      Body.applyForce(b, c, { x: fx, y: fy });
    }
  }

  // ✅ 시작 조건: 섹션 상단이 뷰포트 80% 라인에 도달하면 시작
  let started = false;
  let runner = null;

  function startSimulationOnce() {
    if (started) return;
    started = true;

    resetSimulation();

    // ✅ 중력 ON
    engine.gravity.y = 1;
    engine.gravity.scale = 0.001;

    // ✅ 반발 인터랙션 연결
    Events.on(engine, "beforeUpdate", applyPointerRepel);

    runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(renderer);
  }

  // 리사이즈 처리: 시작 전엔 캔버스만 맞춰두고, 시작 후엔 reset
  let resizeId;
  function handleResize() {
    clearTimeout(resizeId);
    resizeId = setTimeout(() => {
      if (!started) {
        renderer.canvas.width = container.offsetWidth;
        renderer.canvas.height = container.offsetHeight;
        renderer.options.width = container.offsetWidth;
        renderer.options.height = container.offsetHeight;
        return;
      }
      resetSimulation();
    }, 150);
  }

  window.addEventListener("resize", handleResize);
  new ResizeObserver(handleResize).observe(container);

  // ✅ IntersectionObserver 트리거
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        startSimulationOnce();
        io.disconnect();
        break;
      }
    },
    { root: null, threshold: 0, rootMargin: "0px 0px -20% 0px" }
  );

  io.observe(container);

  // (옵션) 새로고침 시 이미 조건 만족이면 바로 시작
  const rect = container.getBoundingClientRect();
  if (rect.top <= window.innerHeight * 0.8) startSimulationOnce();
});


//====================================================================== 우편함 페이드인 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".postbox").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 150 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 70%",   // 요소 상단이 뷰포트 50% 지점 도달
          toggleActions: "play none none reverse",
        },
      }
    );
  });
});


//====================================================================== 우편함 클릭 ======================================================================
document.addEventListener('DOMContentLoaded', () => {
  // introduce memo
  const about = document.querySelector('.about');
  const introImage = document.querySelector('.intro_image');
  const aboutClose = document.querySelector('.about_close');

  if (introImage && about) {
    introImage.addEventListener('click', () => {
      about.classList.add('is-open');
    });
  }

  if (aboutClose && about) {
    aboutClose.addEventListener('click', () => {
      about.classList.remove('is-open');
    });
  }

  // GRAPHIC & BRANDING
  const addWork = document.querySelector('.add-work');
  const btnClose = document.querySelector('.btn_close');
  const btns = document.querySelectorAll('.btn');

  btns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (addWork) addWork.classList.add('is-open');
      document.body.classList.add('is-dimmed');
    });
  });

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      if (addWork) addWork.classList.remove('is-open');
      document.body.classList.remove('is-dimmed');
    });
  }
});


//====================================================================== 우편함 컨페티 ======================================================================
document.addEventListener("DOMContentLoaded", function () {
  const celebrateBtn = document.getElementById('celebrateBtn');

  celebrateBtn.addEventListener('click', () => {

    // 왼쪽에서 발사
    confetti({
      particleCount: 80,
      angle: 60,          // 오른쪽 위 방향
      spread: 70,
      startVelocity: 65,
      gravity: 1.5,
      ticks: 150,
      origin: { x: 0, y: 0.5 } //발사 위치, origin.x = 0 (왼쪽), 1 (오른쪽) , y = 높이
    });

    // 오른쪽에서 발사
    confetti({
      particleCount: 80,
      angle: 120,         // 왼쪽 위 방향
      spread: 70,
      startVelocity: 65,
      gravity: 1.5,
      ticks: 150,
      origin: { x: 1, y: 0.5 } //발사 위치, origin.x = 0 (왼쪽), 1 (오른쪽), , y = 높이
    });

    // 버튼 클릭 애니메이션
    celebrateBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      celebrateBtn.style.transform = 'scale(1)';
    }, 120);
  });
});




document.addEventListener("DOMContentLoaded", () => {

  // 땡큐폴 와칭 비디오랩 타이틀 ======================================================================
  gsap.timeline({
    scrollTrigger: {
      trigger: ".footer h2",
      start: "top bottom",
      end: "0% 0%",
      scrub: 1
    }
  })
    .to(".footer h2", { x: () => window.innerWidth * -0.6, y: 0, z: 0, ease: "none" }, 0);

  // 푸터 질문 문구 페이드 인업 ======================================================================
  const textAniList = document.querySelectorAll(".footer .textAni li");
  if (textAniList.length) {
    const textAni = gsap.timeline({ repeat: -1 });

    textAniList.forEach((li) => {
      textAni
        .to(li, { opacity: 1, duration: 0.8, ease: "power4.out" })
        .to(li, { opacity: 1, duration: 2 })
        .to(li, { opacity: 0, duration: 0.8, ease: "power4.out" });
    });
  }

});




//====================================================================== video ======================================================================
$(function () {
  gsap.timeline({
    scrollTrigger: {
      trigger: '.video',
      start: '00% 90%',
      end: '80% 90%',
      scrub: 1,
      markers: false
    }
  })
    .fromTo('.videowrap video',
      { 'clip-path': 'inset(60% round 1000px)' },
      { 'clip-path': 'inset(0% round 30px)', ease: 'none', duration: 10 },
      0
    );
});



//====================================================================== 롤링 스와이퍼 ======================================================================
document.addEventListener("DOMContentLoaded", function () {
  var swiper_rolling = new Swiper(".rolling-swiper", {
    slidesPerView: "auto",
    spaceBetween: 30,
    loop: true,
    speed: 8000,
    grabCursor: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
  });
});


//====================================================================== 버튼 향하는 화살표 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("overlay");
  const target = document.getElementById("target");
  const box = canvas?.closest(".box");
  if (!canvas || !target || !box) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // mouse (viewport coords)
  let mouse = { x: null, y: null };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const updateCanvasSize = () => {
    const rect = box.getBoundingClientRect(); // box size in CSS pixels
    const dpr = window.devicePixelRatio || 1;

    // CSS pixel size (visible size)
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    // actual drawing buffer size (device pixels)
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    // make 1 unit in canvas = 1 CSS pixel
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  window.addEventListener("resize", updateCanvasSize);
  // 스크롤로 box의 위치가 바뀌면 rect도 바뀌니 같이 갱신 (가벼운 작업)
  window.addEventListener("scroll", updateCanvasSize, { passive: true });

  updateCanvasSize();

  const drawArrow = () => {
    if (mouse.x == null || mouse.y == null) return;

    // box 내부에서만 그리기: 마우스가 box 밖이면 지움
    const bRect = box.getBoundingClientRect();
    const inside =
      mouse.x >= bRect.left &&
      mouse.x <= bRect.right &&
      mouse.y >= bRect.top &&
      mouse.y <= bRect.bottom;

    if (!inside) return;

    // viewport -> box-local(CSS px)
    const x0 = mouse.x - bRect.left;
    const y0 = mouse.y - bRect.top;

    // target center -> box-local(CSS px)
    const tRect = target.getBoundingClientRect();
    const cx = (tRect.left + tRect.width / 2) - bRect.left;
    const cy = (tRect.top + tRect.height / 2) - bRect.top;

    // aim to edge-ish (simple)
    const a = Math.atan2(cy - y0, cx - x0);
    const x1 = cx - Math.cos(a) * (tRect.width / 2 + 12);
    const y1 = cy - Math.sin(a) * (tRect.height / 2 + 12);

    // curve control
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5);
    const tt = Math.max(-1, Math.min(1, (y0 - y1) / 200));
    const controlX = midX;
    const controlY = midY + offset * tt;

    // opacity
    const r = Math.hypot(x1 - x0, y1 - y0);
    const base = (r - Math.max(tRect.width, tRect.height) / 2) / 750;
    const opacity = Math.min(0.75, Math.max(0, base));

    ctx.strokeStyle = `rgba(100,100,100,${opacity})`;  //화살표 색상
    ctx.lineWidth = 1;

    // dashed curve
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(controlX, controlY, x1, y1);
    ctx.setLineDash([10, 4]);
    ctx.stroke();
    ctx.restore();

    // arrowhead
    const angle = Math.atan2(y1 - controlY, x1 - controlX);
    const headLength = 10;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(
      x1 - headLength * Math.cos(angle - Math.PI / 6),
      y1 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x1, y1);
    ctx.lineTo(
      x1 - headLength * Math.cos(angle + Math.PI / 6),
      y1 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const animate = () => {
    // clear in CSS pixel coordinates because we setTransform(dpr,..)
    const rect = box.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    drawArrow();
    requestAnimationFrame(animate);
  };

  animate();
});
