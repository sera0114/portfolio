// 커스텀 커서 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  class CustomCursor {
    constructor() {
      this.cursor = {
        element: document.querySelector("#custom-cursor"),
        pos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        speed: 0.15,  //커스텀 커서 속도
      };

      if (!this.cursor.element) return;
      this.cursor.mouse = { x: this.cursor.pos.x, y: this.cursor.pos.y };
      this.xSet, this.ySet, this.dt;

      this.links = document.querySelectorAll("[custom-cursor-ani]");  //해당 선택자 존재시, 커서 애니메이션

      this.animate();
      this.events();
    }

    animate() {
      gsap.set(this.cursor.element, { xPercent: -50, yPercent: -50 });

      this.xSet = gsap.quickSetter(this.cursor.element, "x", "px");
      this.ySet = gsap.quickSetter(this.cursor.element, "y", "px");

      window.addEventListener("mousemove", (e) => {
        this.cursor.mouse.x = e.x;
        this.cursor.mouse.y = e.y;
      });

      gsap.ticker.add(() => {
        this.dt =
          1.0 -
          Math.pow(1.0 - this.cursor.speed, gsap.ticker.deltaRatio());
        this.cursor.pos.x +=
          (this.cursor.mouse.x - this.cursor.pos.x) * this.dt;
        this.cursor.pos.y +=
          (this.cursor.mouse.y - this.cursor.pos.y) * this.dt;
        this.xSet(this.cursor.pos.x);
        this.ySet(this.cursor.pos.y);
      });
    }

    events() {
      const animation = gsap.fromTo(
        this.cursor.element,
        { scale: 1 },
        {
          scale: 4,
          duration: 0.5,
          ease: "power4.inOut",
          paused: true,
        }
      );

      this.links.forEach((link) => {
        link.addEventListener("mouseenter", () => animation.play());
        link.addEventListener("mouseleave", () => animation.reverse());
      });
    }
  }

  new CustomCursor();
});




/*
// 커서 별 파티클 ======================================================================
let start = performance.now();

const originPosition = { x: 0, y: 0 };

const last = {
  starTimestamp: start,
  starPosition: originPosition,
};

const state = {
  pointer: originPosition,   // page 기준 좌표
  hasPointer: false,
  running: true,
};

const config = {
  starAnimationDuration: 1500,
  minimumTimeBetweenStars: 250,
  minimumDistanceBetweenStars: 75,
  colors: ["249 146 253", "252 254 255"],
  sizes: ["1.4rem", "1rem", "0.6rem"],
  animations: ["fall-1", "fall-2", "fall-3"]
};

let count = 0;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const selectRandom = items => items[rand(0, items.length - 1)];

const withUnit = (value, unit) => `${value}${unit}`;
const px = value => withUnit(value, "px");
const ms = value => withUnit(value, "ms");

const calcDistance = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const appendElement = el => document.body.appendChild(el);
const removeElement = (el, delay) => setTimeout(() => {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}, delay);

const createStar = position => {
  const star = document.createElement("span");
  const color = selectRandom(config.colors);

  star.className = "star";
  star.style.left = px(position.x);
  star.style.top = px(position.y);
  star.style.fontSize = selectRandom(config.sizes);
  star.style.color = `rgb(${color})`;
  star.textContent = "✨";
  star.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;

  star.style.animationName =
    config.animations[count++ % config.animations.length];
  star.style.animationDuration = ms(config.starAnimationDuration);

  appendElement(star);
  removeElement(star, config.starAnimationDuration);
};

const updateLastStar = (position, now) => {
  last.starTimestamp = now;
  last.starPosition = position;
};

const shouldCreateStar = (position, now) => {
  const farEnough =
    calcDistance(last.starPosition, position) >= config.minimumDistanceBetweenStars;
  const longEnough =
    (now - last.starTimestamp) > config.minimumTimeBetweenStars;

  return farEnough || longEnough;
};

// 포인터 이벤트: pageX / pageY 사용
const setPointerFromEvent = (x, y) => {
  state.pointer = { x, y };
  state.hasPointer = true;
};

window.addEventListener("mousemove", (e) => {
  setPointerFromEvent(e.pageX, e.pageY);
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;
  setPointerFromEvent(t.pageX, t.pageY);
}, { passive: true });

document.body.addEventListener("mouseleave", () => {
  state.hasPointer = false;
}, { passive: true });

// requestAnimationFrame 루프
const tick = (now) => {
  if (state.running && state.hasPointer) {
    const pos = state.pointer;

    if (shouldCreateStar(pos, now)) {
      createStar(pos);
      updateLastStar(pos, now);
    }
  }

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);

*/



// 메인 포지션 텍스트 롤링 ======================================================================
document.addEventListener('DOMContentLoaded', function () {
  const pauseMs = 3000;  // 멈춰있는 시간
  const moveMs = 1500;  // 이동하는 시간

  document.querySelectorAll('.main-rolling-txt').forEach((roller) => {
    const originals = Array.from(roller.children).filter(el => el.tagName === 'SPAN');
    const n = originals.length;
    if (n <= 1) return;

    const track = document.createElement('span');
    track.className = 'rolling-track';

    originals.forEach(el => track.appendChild(el));                 // 원본 이동
    originals.forEach(el => track.appendChild(el.cloneNode(true))); // 복제 추가

    roller.innerHTML = '';
    roller.appendChild(track);

    // 아이템 높이 계산(렌더 이후)
    requestAnimationFrame(() => {
      const first = track.querySelector('span');
      const itemH = first.getBoundingClientRect().height || parseFloat(getComputedStyle(roller).lineHeight) || 20;

      let idx = 0; // 현재 보여줄 인덱스(0~n)

      function step() {
        // 1) 멈춤
        setTimeout(() => {
          // 2) 이동(transition)
          idx += 1;
          track.style.transition = `transform ${moveMs}ms ease`;
          track.style.transform = `translateY(${-idx * itemH}px)`;

          // 3) 이동 끝난 뒤 처리
          setTimeout(() => {
            // idx가 n에 도달하면 복제 구간에 들어온 상태
            // 다음 루프를 자연스럽게 하기 위해 즉시 0으로 점프(transition 없이)
            if (idx >= n) {
              track.style.transition = 'none';
              idx = 0;
              track.style.transform = 'translateY(0)';
              // transition 제거가 적용되도록 한 프레임 넘겨줌
              requestAnimationFrame(() => { });
            }
            // 다음 스텝 반복
            step();
          }, moveMs);

        }, pauseMs);
      }

      step();
    });
  });
});


// 어바웃미 프로필 이미지 슬라이드 ======================================================================
document.addEventListener("DOMContentLoaded", function () {
  const swiper_profileIMG = new Swiper(".profileIMG", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    grabCursor: true,
    effect: "creative",
    creativeEffect: {
      prev: {
        shadow: true,
        translate: ["-20%", 0, -1],
      },
      next: {
        translate: ["100%", 0, 0],
      },
    },
    navigation: {
      nextEl: ".profileIMG .swiper-button-next",
      prevEl: ".profileIMG .swiper-button-prev",
    },
  });
});



// about me 하단 스킬 아이콘 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Select all .nav-item elements
  const navItems = document.querySelectorAll('.nav-item');
  // Helper function to add/remove a class to a sibling at a given offset
  const toggleSiblingClass = (items, index, offset, className, add) => {
    const sibling = items[index + offset];
    if (sibling) {
      sibling.classList.toggle(className, add);
    }
  };
  // Event listeners to toggle classes on hover
  navItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      item.classList.add('hover'); // Add .hover to current item
      // Toggle classes for siblings
      toggleSiblingClass(navItems, index, -1, 'sibling-close', true); // Previous sibling
      toggleSiblingClass(navItems, index, 1, 'sibling-close', true);  // Next sibling
      toggleSiblingClass(navItems, index, -2, 'sibling-far', true);   // Previous-previous sibling
      toggleSiblingClass(navItems, index, 2, 'sibling-far', true);    // Next-next sibling
    });
    item.addEventListener('mouseleave', () => {
      item.classList.remove('hover'); // Remove .hover from current item
      // Toggle classes for siblings
      toggleSiblingClass(navItems, index, -1, 'sibling-close', false); // Previous sibling
      toggleSiblingClass(navItems, index, 1, 'sibling-close', false);  // Next sibling
      toggleSiblingClass(navItems, index, -2, 'sibling-far', false);   // Previous-previous sibling
      toggleSiblingClass(navItems, index, 2, 'sibling-far', false);    // Next-next sibling
    });
  });
});



// 배경확장, 넓은 시야 섹션 ======================================================================
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section = document.querySelector("#mixVision");
  if (!section) return;

  const bg = section.querySelector(".bg");
  const word01 = section.querySelector(".word01");
  const word02 = section.querySelector(".word02");
  const triggerEl = section.querySelector(".full_img");

  // -----------------------------
  // BG clip 시작값: viewport가 아닌 "실제 섹션 크기" 기준
  // -----------------------------
  function getStartInsetPx() {
    // full_img 기준으로 잡는 게 보통 가장 안정적
    const rect = triggerEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // "비율" 기반으로 시작 inset, h,w에 곱해시는 숫자가 클수록 가운데 이미지 작아짐, 두번째숫자:min, 세번째숫자:max
    const topBottom = clamp(h * 0.35, 120, 360); 
    const leftRight = clamp(w * 0.25, 160, 540);

    return { t: topBottom, r: leftRight, b: topBottom, l: leftRight };
  }

  function clipStr() {
    const ins = getStartInsetPx();
    return `inset(${ins.t}px ${ins.r}px ${ins.b}px ${ins.l}px)`;
  }

  function applyStartClip() {
    gsap.set(bg, { clipPath: clipStr() });
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // 텍스트 너비 측정: "텍스트 크기 자체" 기준, refresh/resize 시점에도 항상 다시 계산되게 만들 것
  function measureTextWidth(el) {
    if (!el) return 0;

    // 현재 스타일을 최대한 유지한 채, width만 auto로 만들어 실측
    const prev = {
      width: el.style.width,
      position: el.style.position,
      visibility: el.style.visibility,
      opacity: el.style.opacity
    };

    el.style.width = "auto";
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    el.style.opacity = "1";

    const w = el.getBoundingClientRect().width;

    // 복구
    el.style.width = prev.width;
    el.style.position = prev.position;
    el.style.visibility = prev.visibility;
    el.style.opacity = prev.opacity;

    return Math.ceil(w);
  }

  // 초기 세팅
  gsap.set(bg, { left: "50%", top: "50%", xPercent: -50, yPercent: -50 });
  applyStartClip();
  gsap.set([word01, word02], { width: 0, opacity: 0 });


  // ====== 텍스트 HOLD 구간 길이 ======
  // 값이 클수록: pin 걸린 후/끝나기 전 “정지 구간”이 길어짐
  const HOLD_IN = 2;   // 시작 직후 멈춤
  const HOLD_MID = 0;  // word01 후 멈춤
  const HOLD_OUT = 3;  // 끝나기 전 멈춤

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerEl,
      start: "top top",
      end: "+=3000",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: () => {
        // refresh될 때마다 clip도, 텍스트 리빌도 "현재 크기"로 맞추기
        applyStartClip();
        gsap.set([word01, word02], { width: 0, opacity: 0 });
      }
    }
  });

  tl
    .to({}, { duration: HOLD_IN })

    .fromTo(
      word01,
      { width: 0, opacity: 0 },
      {
        width: () => measureTextWidth(word01), // ✅ 텍스트 크기 기준(항상 재계산)
        opacity: 1,
        ease: "power2.out",
        duration: 8
      },
      ">"
    )

    .to({}, { duration: HOLD_MID })

    .fromTo(
      bg,
      { clipPath: () => clipStr() }, // ✅ 현재 섹션 크기 기준으로 재계산
      { clipPath: "inset(0px 0px 0px 0px)", ease: "none", duration: 8 },
      ">"
    )

    .fromTo(
      word02,
      { width: 0, opacity: 0 },
      {
        width: () => measureTextWidth(word02), // ✅ 텍스트 크기 기준(항상 재계산)
        opacity: 1,
        ease: "power2.out",
        duration: 8
      },
      "<0.2"
    )

    .to({}, { duration: HOLD_OUT });

  // 폰트 로딩/리사이즈로 텍스트 폭이 달라질 수 있으니 refresh는 유지
  window.addEventListener("load", () => ScrollTrigger.refresh());
  window.addEventListener("resize", () => ScrollTrigger.refresh());
})();





// 왼쪽sticky 커리어 경험 섹션 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector("#left-sticky-section");
  if (!section) return;

  const wrap = section.querySelector(".sticky-wrap");
  const cont = section.querySelector(".cont");
  const items = gsap.utils.toArray(section.querySelectorAll(".cont > li"));
  const cateItems = gsap.utils.toArray(section.querySelectorAll(".cate > li"));

  if (!wrap || !cont || items.length === 0) return;

  // 오른쪽 컨텐츠: li 각각 순차 페이드업
  items.forEach((li, index) => {
    const startPoint = index === 0 ? "top 40%" : "top 50%";  // 첫번째 li만 top:40%, 나머지 50%

    gsap.fromTo(
      li,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        scrollTrigger: {
          trigger: li,
          start: startPoint,
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true
        }
      }
    );
  });

  // ------------------------------------------------------------
  // 2) 왼쪽 카테고리 on 토글 (기존 코드 리팩토링)
  // - cont01~04가 특정 지점에 오면 해당 item01~04에 .on
  // - 기존처럼 각각 따로 안 쓰고, 매핑으로 한번에
  const pairs = [
    { cont: ".cont01", item: ".item01", start: "top center" },
    { cont: ".cont02", item: ".item02", start: "top center" },
    { cont: ".cont03", item: ".item03", start: "top center" },
    { cont: ".cont04", item: ".item04", start: "top center" }
  ];

  pairs.forEach(({ cont: contSel, item: itemSel, start }) => {
    const contEl = section.querySelector(contSel);
    const itemEl = section.querySelector(itemSel);
    if (!contEl || !itemEl) return;

    ScrollTrigger.create({
      trigger: contEl,
      start,                         // 필요하면 cont01만 따로 조정 가능
      end: "bottom center",
      toggleClass: { targets: itemEl, className: "on" },
      invalidateOnRefresh: true
    });
  });

  // 이미지 로딩 등으로 레이아웃이 변할 수 있으니 1회 refresh
  window.addEventListener("load", () => ScrollTrigger.refresh());
});



// 커리어 슬라이드1 ======================================================================
document.addEventListener("DOMContentLoaded", function () {
  const swiper_profileIMG = new Swiper(".career1", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    grabCursor: true,
    effect: "creative",
    creativeEffect: {
      prev: {
        shadow: true,
        translate: ["-20%", 0, -1],
      },
      next: {
        translate: ["100%", 0, 0],
      },
    },
    pagination: {
      el: ".career1 .swiper-pagination",
    },
    navigation: {
      nextEl: ".career1 .swiper-button-next",
      prevEl: ".career1 .swiper-button-prev",
    },
  });
});



// 커리어 슬라이드2 ======================================================================
document.addEventListener("DOMContentLoaded", function () {
  const swiper_profileIMG = new Swiper(".career2", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    grabCursor: true,
    effect: "creative",
    creativeEffect: {
      prev: {
        shadow: true,
        translate: ["-20%", 0, -1],
      },
      next: {
        translate: ["100%", 0, 0],
      },
    },
    pagination: {
      el: ".career2 .swiper-pagination",
    },
    navigation: {
      nextEl: ".career2 .swiper-button-next",
      prevEl: ".career2 .swiper-button-prev",
    },
  });
});



// 커리어 슬라이드3 ======================================================================
document.addEventListener("DOMContentLoaded", function () {
  const swiper_profileIMG = new Swiper(".career3", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    grabCursor: true,
    effect: "creative",
    creativeEffect: {
      prev: {
        shadow: true,
        translate: ["-20%", 0, -1],
      },
      next: {
        translate: ["100%", 0, 0],
      },
    },
    pagination: {
      el: ".career3 .swiper-pagination",
    },
    navigation: {
      nextEl: ".career3 .swiper-button-next",
      prevEl: ".career3 .swiper-button-prev",
    },
  });
});



// 커리어 슬라이드4 ======================================================================
document.addEventListener("DOMContentLoaded", function () {
  const swiper_profileIMG = new Swiper(".career4", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    grabCursor: true,
    effect: "creative",
    creativeEffect: {
      prev: {
        shadow: true,
        translate: ["-20%", 0, -1],
      },
      next: {
        translate: ["100%", 0, 0],
      },
    },
    pagination: {
      el: ".career4 .swiper-pagination",
    },
    navigation: {
      nextEl: ".career4 .swiper-button-next",
      prevEl: ".career4 .swiper-button-prev",
    },
  });
});



// 다양한 경험 이미지 교차 리스트 섹션 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const sections = gsap.utils.toArray(".demo-wrapper section");

  sections.forEach((section, index) => {
    const w = section.querySelector(".wrapper");
    if (!w) return;

    const isOdd = index % 2 === 1;

    const getValues = () => {
      const maxTranslate = w.scrollWidth - section.clientWidth;
      const safeMax = Math.max(0, maxTranslate);

      const xStart = isOdd ? -safeMax : 0;
      const xEnd = isOdd ? 0 : -safeMax;

      return { xStart, xEnd };
    };

    gsap.fromTo(
      w,
      { x: () => getValues().xStart },
      {
        x: () => getValues().xEnd,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          scrub: 1,
          invalidateOnRefresh: true,
          start: "top bottom",

          onRefresh: () => {
            gsap.set(w, { x: getValues().xStart });
          },

          // markers: true,
        },
      }
    );
  });
});



// 키워드 낙하: #keyword-fall-trigger 도달 시 demo-wrapper의 모든 keyword가 한 번에 낙하 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, Physics2DPlugin);

  const wrapper = document.querySelector(".demo-wrapper");
  const triggerSection = document.querySelector("#keyword-fall-trigger");
  if (!wrapper || !triggerSection) return;

  // ✅ 낙하 대상: demo-wrapper의 모든 키워드
  const keywords = gsap.utils.toArray(".demo-wrapper .keyword");
  if (keywords.length === 0) return;

  // 초기값 세팅 (낙하 전 상태)
  gsap.set(keywords, {
    clearProps: "transform,opacity",
    transformOrigin: "50% 50%",
    autoAlpha: 1
  });

  // 전부 동시에 시작시키는 마스터 타임라인
  const master = gsap.timeline({ paused: true });

  keywords.forEach((el) => {
    const tl = gsap.timeline();

    // 1) 떨어지기 전 떨림
    tl.to(el, {
      duration: 0.06,
      x: () => gsap.utils.random(-10, 10),
      y: () => gsap.utils.random(-6, 6),
      rotation: () => gsap.utils.random(-6, 6),
      ease: "none",
      yoyo: true,
      repeat: 6
    });

    // 2) 낙하
    tl.to(el, {
      duration: gsap.utils.random(1.6, 2.8),
      physics2D: {
        velocity: gsap.utils.random(280, 620),
        angle: () => gsap.utils.random(60, 120),
        gravity: 2400
      },
      rotation: () => gsap.utils.random(-220, 220),
      ease: "none"
    });

    // 3) 사라짐
    tl.to(el, { autoAlpha: 0, duration: 0.2 }, "-=0.2");

    // ✅ 전부 한 번에 시작
    master.add(tl, 0);
  });

  // ✅ 트리거: keyword-fall-trigger 섹션이 기존 위치에 도달하면 1회 실행
  ScrollTrigger.create({
    trigger: triggerSection,
    start: "top top", // 필요하면 "top 30%" 같은 식으로 조정
    once: true,
    onEnter: () => master.play(0)
    // markers: true
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
});




//================================================================= 키워드 무한 롤링 =================================================================
document.addEventListener("DOMContentLoaded", () => {
  const lines = document.querySelectorAll(".bubble-line");
  if (!lines.length) return;

  lines.forEach((line) => {
    const track = line.querySelector(".bubble-track");
    if (!track) return;

    // 1세트(.bubble-set) 기준으로 무한 루프 만들기 위해 1회 복제
    const set = track.querySelector(".bubble-set");
    if (!set) return;

    track.appendChild(set.cloneNode(true));

    const baseSpeed = Number(line.dataset.speed || 80);  // 기본 속도(px/sec)

    const HOVER_SCALE = Number(line.dataset.hoverScale || 0.45);  // hover 시 속도

    // hover 시 부드럽게 느려지게 할 때 사용할 값
    let speedScale = 1;        // 현재 적용 중인 스케일
    let targetScale = 1;       // 목표 스케일
    const LERP = 0.5;         // 0~1 사이, 높을수록 빨리 따라감(부드러움 조절)

    let x = 0;
    let last = performance.now();

    line.addEventListener("mouseenter", () => {  // hover: 멈춤 대신 "아주 느리게"
      targetScale = HOVER_SCALE;
    });

    line.addEventListener("mouseleave", () => {
      targetScale = 1;
    });

    document.addEventListener("visibilitychange", () => {  // 탭 전환 등으로 dt 폭주 방지
      if (!document.hidden) last = performance.now();
    });

    function loop(now) {
      // dt 계산 + 상한(clamp)
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05; // 50ms 이상은 잘라서 "점프" 방지

      // speedScale 부드럽게 목표치로 수렴
      speedScale += (targetScale - speedScale) * LERP;

      // 복제 전/후 길이의 절반이 1세트 폭
      const loopWidth = track.scrollWidth / 2;

      x -= baseSpeed * speedScale * dt;

      // 음수로 이동하므로 -loopWidth 이하로 가면 한 바퀴 돈 것
      if (x <= -loopWidth) x += loopWidth;

      track.style.transform = `translate3d(${x}px,0,0)`;
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  });
});



//====================================================================== 키워드 툴팁 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") return;

  const cursorItem = document.querySelector(".cursor");
  if (!cursorItem) return;

  const cursorText =
    cursorItem.querySelector(".cursor-text") || cursorItem.querySelector("p");
  const cursorMedia = cursorItem.querySelector(".cursor-media");

  // 기본 오프셋(px) — 네가 원하던 yOffset=20 느낌 그대로
  const baseOffsetX = 12;
  const baseOffsetY = 20;

  // cursor-media CSS 크기와 동일하게 맞춰줘야 정확해
  const MEDIA_W = 600;
  const MEDIA_H = 400;

  // 화면 가장자리 여백
  const MARGIN = 24;

  let currentTarget = null;
  let lastText = "";
  let lastImage = "";

  // 현재 “실제로 튀어나갈 수 있는” 박스 크기(텍스트만 / 미디어 포함)
  let boxW = 0;
  let boxH = 0;

  // ✅ ease 차이 거의 없이 따라오게
  const xTo = gsap.quickTo(cursorItem, "x", { duration: 0.1, ease: "none" });
  const yTo = gsap.quickTo(cursorItem, "y", { duration: 0.1, ease: "none" });

  const measureBox = () => {
    // 미디어가 보이는 상태면 미디어 크기를 기준으로 화면 밖 방지
    if (cursorItem.classList.contains("has-image") && cursorMedia) {
      boxW = MEDIA_W;
      boxH = MEDIA_H;
      return;
    }

    // 텍스트만 보일 때는 텍스트 요소 크기를 사용
    if (cursorText) {
      const r = cursorText.getBoundingClientRect();
      boxW = r.width || cursorItem.offsetWidth || 0;
      boxH = r.height || cursorItem.offsetHeight || 0;
    } else {
      boxW = cursorItem.offsetWidth || 0;
      boxH = cursorItem.offsetHeight || 0;
    }
  };

  const applyTarget = (target) => {
    if (!target) return;

    const text = target.getAttribute("data-cursor") || target.textContent.trim();
    const img = target.getAttribute("data-image") || "";

    if (cursorText && text && text !== lastText) {
      cursorText.textContent = text;
      lastText = text;
    }

    if (cursorMedia) {
      if (img && img !== lastImage) {
        cursorItem.classList.add("has-image");
        cursorMedia.style.backgroundImage = `url("${img}")`;
        lastImage = img;
      } else if (!img && lastImage) {
        cursorItem.classList.remove("has-image");
        cursorMedia.style.backgroundImage = "";
        lastImage = "";
      }
    }

    // 타깃이 바뀌면 박스 크기 다시 계산
    measureBox();
  };

  window.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 혹시 최초에 boxW/H가 0이면 한번 측정
    if (!boxW || !boxH) measureBox();

    // 기본은 오른쪽/아래에 띄우기
    let ox = baseOffsetX;
    let oy = baseOffsetY;

    // ✅ 오른쪽으로 나가면 왼쪽으로 반전
    if (x + ox + boxW > vw - MARGIN) {
      ox = -(boxW + baseOffsetX);
    }

    // ✅ 아래로 나가면 위로 반전
    if (y + oy + boxH > vh - MARGIN) {
      oy = -(boxH + baseOffsetY);
    }

    // ✅ 왼쪽/위쪽도 마진 안쪽으로 클램프(모니터 작은 경우 대비)
    const minX = MARGIN;
    const maxX = vw - MARGIN;
    const minY = MARGIN;
    const maxY = vh - MARGIN;

    let targetX = x + ox;
    let targetY = y + oy;

    // 툴팁 왼쪽 상단 기준으로 클램프
    targetX = Math.min(Math.max(targetX, minX), maxX - boxW);
    targetY = Math.min(Math.max(targetY, minY), maxY - boxH);

    xTo(targetX);
    yTo(targetY);
  });

  // ===== 이벤트 위임 (복제된 키워드까지 전부 대응) =====
  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest(".bubble-key[data-cursor], .bubble-key.hl[data-image]");
    if (!target) return;
    currentTarget = target;
    applyTarget(target);
  });

  document.addEventListener("mouseout", (e) => {
    const fromKey = e.target.closest(".bubble-key");
    if (!fromKey) return;

    const toKey = e.relatedTarget?.closest?.(".bubble-key");
    if (toKey === fromKey) return;

    currentTarget = null;
  });
});




//====================================================================== DO & DONT 페이드인 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector("#GoodBad .window-wrap");
  const good = document.querySelector("#Good-wrap");
  const bad  = document.querySelector("#Bad-wrap");

  if (!section || !good || !bad) return;

  // 초기 상태
  gsap.set(good, { autoAlpha: 0, x: -120 });
  gsap.set(bad,  { autoAlpha: 0, x:  120 });

  // 타임라인
  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 50%",
      toggleActions: "play none none reverse"
      // markers: true
    }
  })
  .to(good, {
    autoAlpha: 1,
    x: 0,
    duration: 0.8,
    ease: "power2.out"
  })
  .to(bad, {
    autoAlpha: 1,
    x: 0,
    duration: 0.8,
    ease: "power2.out"
  }, "-=0.4");
});



//====================================================================== 윈도우11 open 토글  ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  const goodWrap = document.querySelector("#Good-wrap");
  if (!goodWrap) return;

  const setBtnText = (hidden, text) => {
    const b = hidden.closest(".popup")?.querySelector("button");
    if (b) b.textContent = text;
  };

  const expand = (el) => {
    // 닫힌 상태(0) -> 실제 높이(px)로
    el.classList.add("on");
    el.style.height = "0px"; // 시작값 보장
    const targetH = el.scrollHeight;

    // 다음 프레임에서 height 변경 (transition 트리거)
    requestAnimationFrame(() => {
      el.style.height = targetH + "px";
      el.style.opacity = "1";
    });

    // 애니메이션 끝나면 auto로 (내용 길이 변해도 대응)
    const onEnd = (e) => {
      if (e.propertyName !== "height") return;
      el.style.height = "auto";
      el.removeEventListener("transitionend", onEnd);
    };
    el.addEventListener("transitionend", onEnd);
  };

  const collapse = (el) => {
    // auto일 수 있으니 현재 높이를 px로 고정 후 0으로
    el.style.height = el.scrollHeight + "px";
    el.style.opacity = "0";

    requestAnimationFrame(() => {
      el.style.height = "0px";
    });

    const onEnd = (e) => {
      if (e.propertyName !== "height") return;
      el.classList.remove("on");
      el.removeEventListener("transitionend", onEnd);
    };
    el.addEventListener("transitionend", onEnd);
  };

  goodWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const popup = btn.closest(".popup");
    if (!popup) return;

    const target = popup.querySelector(".hidden-txt");
    if (!target) return;

    const wasOpen = target.classList.contains("on");

    // 현재 열려있는 것들 (target 포함 가능)
    const opened = [...goodWrap.querySelectorAll(".hidden-txt.on")];

    // ✅ 동시에: 다른 열린 것들은 닫고, target은 열기/닫기
    opened.forEach((el) => {
      if (el !== target) {
        collapse(el);
        setBtnText(el, "MORE");
      }
    });

    if (wasOpen) {
      collapse(target);
      btn.textContent = "MORE";
    } else {
      expand(target);
      btn.textContent = "CLOSE";
    }
  });
});



//====================================================================== 윈도우95 쓰레기통 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("#Bad-wrap");
  if (!root) return;

  const explorer = root.querySelector("[data-explorer]");
  const notes = root.querySelectorAll("[data-note]");
  const binBtn = root.querySelector(".bin-btn");

  // 시작은 무조건 OFF
  if (explorer) explorer.hidden = true;
  notes.forEach(n => (n.hidden = true));

  // z-index 포커스
  let z = 50;
  const bringToFront = (el) => {
    z += 1;
    el.style.zIndex = String(z);
  };

  // Recycle Bin: 탐색기 열기
  binBtn?.addEventListener("click", (e) => {  //"click" → "dblclick" // 더블클릭
    e.preventDefault();
    e.stopPropagation();
    if (!explorer) return;
    explorer.hidden = false;
    bringToFront(explorer);
  });

  // 닫기/열기 이벤트 위임
  root.addEventListener("click", (e) => {
    const t = e.target;

    // 탐색기 닫기
    const closeExplorerBtn = t.closest("[data-close-explorer]");
    if (closeExplorerBtn) {
      e.stopPropagation();
      if (explorer) explorer.hidden = true;
      return;
    }

    // 노트 열기 (탐색기 열려 있을 때만)
    const iconBtn = t.closest("[data-open-note]");
    if (iconBtn) {
      e.stopPropagation();
      if (!explorer || explorer.hidden) return;

      const key = iconBtn.getAttribute("data-open-note");
      const note = key ? root.querySelector(`[data-note="${key}"]`) : null;
      if (!note) return;

      note.hidden = false;
      bringToFront(note);
      return;
    }

    // 노트 닫기
    const closeNoteBtn = t.closest("[data-close-note]");
    if (closeNoteBtn) {
      e.stopPropagation();
      const note = closeNoteBtn.closest("[data-note]");
      if (note) note.hidden = true;
      return;
    }
  });

  // 창 클릭하면 앞으로
  root.addEventListener("pointerdown", (e) => {
    const win = e.target.closest(".explorer, .notepad");
    if (!win || win.hidden) return;
    bringToFront(win);
  });

  // 드래그
  const isInteractive = (el) =>
    Boolean(el.closest("button, a, input, textarea, select, [contenteditable='true'], .desk-icon"));

  const ensureAbsolute = (win) => {
    const cs = getComputedStyle(win);
    if (cs.position !== "absolute") win.style.position = "absolute";

    const hasPx = (v) => typeof v === "string" && v.includes("px");
    if (hasPx(win.style.left) && hasPx(win.style.top)) return;

    const rect = win.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();

    win.style.left = `${rect.left - rootRect.left}px`;
    win.style.top = `${rect.top - rootRect.top}px`;
    win.style.transform = "none";
  };

  let drag = null;

  root.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest("[data-drag-handle]");
    if (!handle) return;

    if (isInteractive(e.target)) return;

    const win = handle.closest(".explorer, .notepad");
    if (!win || win.hidden) return;

    e.preventDefault();
    e.stopPropagation();

    ensureAbsolute(win);
    bringToFront(win);

    drag = {
      win,
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      sl: parseFloat(win.style.left || "0"),
      st: parseFloat(win.style.top || "0"),
      moved: false,
    };

    win.setPointerCapture(e.pointerId);
  });

  root.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;

    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;

    if (!drag.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) drag.moved = true;
    if (!drag.moved) return;

    drag.win.style.left = `${drag.sl + dx}px`;
    drag.win.style.top = `${drag.st + dy}px`;
  });

  root.addEventListener("pointerup", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    try { drag.win.releasePointerCapture(e.pointerId); } catch (_) {}
    drag = null;
  });
});



//====================================================================== 윈도우 에러섹션 ======================================================================
window.addEventListener("DOMContentLoaded", () => {
  new Windows95("#Bad-wrap");
});

class Windows95 {
  cursorDragPos = null;
  errorDragging = null;

  errorLimit = 30;
  refreshThreshold = 29; // 29개 이상이면 새로고침 표시
  errors = [];

  constructor(containerSelector) {
    this.el = document.querySelector(containerSelector);
    if (!this.el) return;

    // 새로고침 버튼 생성
    this.createRefreshButton();

    // Bad-wrap 내부에서만 동작
    this.el.addEventListener("click", this.errorLoop);
    this.el.addEventListener("keyup", this.errorLoop);

    // drag start
    this.el.addEventListener("mousedown", this.dragErrorStart);
    this.el.addEventListener("touchstart", this.dragErrorStart, { passive: true });

    // drag move
    this.el.addEventListener("mousemove", this.dragError);
    this.el.addEventListener("touchmove", this.dragError, { passive: true });

    // drag end
    this.el.addEventListener("mouseup", this.dragErrorEnd);
    this.el.addEventListener("mouseleave", this.dragErrorEnd);
    this.el.addEventListener("contextmenu", this.dragErrorEnd);
    this.el.addEventListener("touchend", this.dragErrorEnd);

    // 처음 1개 표시
    this.spawnError(0, 0);
    this.updateRefreshUI();
  }

  // ---------------- 새로고침 버튼 ----------------
  createRefreshButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "win95-refresh";
    btn.setAttribute("aria-label", "Reset errors");
    btn.setAttribute("aria-hidden", "true");

    // 심플 refresh SVG
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#1f1f1f">
        <path d="M12 4a8 8 0 1 0 7.6 10h-2.1A6 6 0 1 1 12 6c1.7 0 3.2.7 4.3 1.7H14V10h6V4h-2v2.3A7.9 7.9 0 0 0 12 4z"/>
      </svg>
    `;

    // Bad-wrap 클릭으로 에러 생성되는 거 막기
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.resetToOne();
    });

    // 키보드 Enter/Space도 버튼 자체로 처리되지만, 버블 방지
    btn.addEventListener("keydown", (e) => {
      e.stopPropagation();
    });

    this.el.appendChild(btn);
    this.refreshBtn = btn;
  }

  updateRefreshUI() {
    if (!this.refreshBtn) return;
    const show = this.errors.length >= this.refreshThreshold;
    this.refreshBtn.setAttribute("aria-hidden", show ? "false" : "true");
  }

  resetToOne() {
    // 드래그 상태 정리
    this.dragErrorEnd();

    // 전부 닫기(안전하게 try)
    for (const err of this.errors) {
      try { err.close(); } catch (_) {}
    }
    this.errors = [];

    // 다시 1개
    this.spawnError(0, 0);
    this.updateRefreshUI();
  }

  errorLoop = async (e) => {
    const { code, target } = e;

    // 새로고침 버튼이면 아무것도 하지 않음(안전망)
    if (target?.closest?.(".win95-refresh")) return;

    // Enter / OK 버튼
    if (code === "Enter" || code === "NumpadEnter" || (!code && target?.hasAttribute("data-ok"))) {
      const okId = target?.getAttribute("data-ok");
      const activeError = this.errors.find(err => (okId && err.id === okId) || err.active);

      if (!activeError) return;

      activeError.close();
      this.errors = this.errors.filter(err => !err.isClosing);
      this.errors[this.errors.length - 1]?.activate();

      this.updateRefreshUI();

      let spawns = Utils.randomInt(this.errors.length ? 0 : 10, 20); // 새창을 몇개 띄울지, (창이 있으면 0~20, 없으면 10~20)
      const overLimit = (this.errors.length + spawns) - this.errorLimit;
      if (overLimit > 0) spawns = this.errorLimit - this.errors.length;

      for (let s = 0; s < spawns; s++) {
        await new Promise(res => setTimeout(res, 100));
        if (this.errors.length) this.spawnError();
        else this.spawnError(0, 0);
        this.updateRefreshUI();
      }

      return;
    }

    // 일반 클릭이면 active window 전환
    if (!code) this.switchError(e);
  };

  dragError = (e) => {
    if (!this.errorDragging || !this.cursorDragPos) return;

    let nowX = 0, nowY = 0;
    if (e.touches?.length) {
      const [touch] = e.touches;
      nowX = touch.clientX;
      nowY = touch.clientY;
    } else {
      nowX = e.clientX;
      nowY = e.clientY;
    }

    const moveX = nowX - this.cursorDragPos.x;
    const moveY = nowY - this.cursorDragPos.y;

    this.errorDragging.moveBy(moveX, moveY);
    this.cursorDragPos.x = nowX;
    this.cursorDragPos.y = nowY;
  };

  dragErrorStart = (e) => {
    let { target } = e;

    // 새로고침 버튼은 드래그 시작 금지
    if (target?.closest?.(".win95-refresh")) return;

    if (target?.nodeName === "BUTTON") return;

    // header 찾기
    let headerFound = false;
    do {
      headerFound = target?.hasAttribute("data-header");
      target = target?.parentElement;
    } while (target && !headerFound);

    if (!headerFound) return;

    // header의 상위 window 찾기
    let winEl = target;
    while (winEl && !winEl.hasAttribute("data-window")) winEl = winEl.parentElement;
    if (!winEl) return;

    this.errorDragging = this.errors.find(err => err.el?.id === winEl.id);
    this.switchError(e);

    if (e.touches?.length) {
      const [touch] = e.touches;
      this.cursorDragPos = { x: touch.clientX, y: touch.clientY };
    } else {
      this.cursorDragPos = { x: e.clientX, y: e.clientY };
    }
  };

  dragErrorEnd = () => {
    this.cursorDragPos = null;
    this.errorDragging = null;
  };

  spawnError = (x, y) => {
    if (this.errors.length >= this.errorLimit) {  // 이미 리미트 갯수면 더 만들지 않음(안전)
      this.updateRefreshUI();
      return;
    }

    this.errors.forEach(err => err.deactivate());
    this.errors.push(new Windows95Error(this.el, x, y));
    this.updateRefreshUI();
  };

  switchError = (e) => {
    this.errors.find(err => err.active)?.deactivate();

    let { target } = e;
    while (target && !target?.hasAttribute("data-window")) target = target.parentElement;

    if (!target) return;

    const found = this.errors.find(err => err.el?.id === target.id);
    if (!found) return;

    this.errors.push(this.errors.splice(this.errors.indexOf(found), 1)[0]);
    this.errors[this.errors.length - 1]?.activate();
  };
}

class Windows95Error {
  activeClass = "window--active";
  active = false;
  el = null;
  id = Utils.randomInt().toString(16);
  isClosing = false;
  x = 0;
  y = 0;

  constructor(parentEl, x, y) {
    this.parent = parentEl;

    const template = this.parent.querySelector("#error-template");
    const windowNew = template?.cloneNode(true);

    if (!this.parent || !windowNew) return;

    this.el = windowNew;
    this.parent.appendChild(windowNew);

    windowNew.id = `error-${this.id}`;
    windowNew.hidden = false;
    windowNew.querySelector("[data-desc]").textContent = this.errorMessage;

    // 컨테이너 기준 중앙 배치 + 랜덤 오프셋
    const halfElWidth = Math.round(this.parent.clientWidth / 2);
    const halfElHeight = Math.round(this.parent.clientHeight / 2);
    const halfWinWidth = Math.round(windowNew.offsetWidth / 2);
    const halfWinHeight = Math.round(windowNew.offsetHeight / 2);

    this.x = (x === undefined) ? Utils.randomInt(-halfElWidth + halfWinWidth, halfElWidth - halfWinWidth) : x;
    this.y = (y === undefined) ? Utils.randomInt(-halfElHeight + halfWinHeight, halfElHeight - halfWinHeight) : y;

    const label = `error-label-${this.id}`;
    const desc = `error-desc-${this.id}`;

    windowNew.setAttribute("aria-labelledby", label);
    windowNew.setAttribute("aria-describedby", desc);
    windowNew.querySelector("[data-label]").id = label;
    windowNew.querySelector("[data-desc]").id = desc;
    windowNew.querySelector("[data-ok]").setAttribute("data-ok", this.id);

    // 부모(Bad-wrap) 기준 중앙 calc + transform 오프셋
    windowNew.style.left = `calc(50% - ${halfWinWidth}px)`;
    windowNew.style.top = `calc(50% - ${halfWinHeight}px)`;
    windowNew.style.transform = `translate(${this.x}px,${this.y}px)`;

    this.activate();
  }

  get errorMessage() {
    const list = [
      "A fatal error has occurred.",
      "Access is denied.",
      "An error occurred while displaying the previous error.",
      "Application performed an illegal action.",
      "Critical error",
      "Nope.",
      "Something terrible happened.",
      "Sorry. No can do.",
      "That action is out of order.",
      "The operation completed successfully.",
      "The operation failed badly.",
      "Unknown error",
      "You don’t have permission to do that. Contact an administrator if you want it."
    ];
    return list[Utils.randomInt(0, list.length - 1)];
  }

  activate() {
    if (!this.el) return;
    this.el.classList.add(this.activeClass);
    this.el.setAttribute("aria-hidden", "false");
    this.active = true;
    this.parent.appendChild(this.el); // z-index처럼 최상단으로
  }

  deactivate() {
    if (!this.el) return;
    this.el.classList.remove(this.activeClass);
    this.el.setAttribute("aria-hidden", "true");
    this.active = false;
  }

  close() {
    if (!this.el) return;
    this.deactivate();
    if (this.el.parentNode) this.parent.removeChild(this.el);
    this.isClosing = true;
  }

  moveBy(x, y) {
    if (!this.el) return;
    this.x += x;
    this.y += y;
    this.el.style.transform = `translate(${this.x}px,${this.y}px)`;
  }
}

//난수 생성기, 에러창 위치, 메시지, 개수 등
class Utils {
  static randomInt(min = 0, max = 2 ** 32) {
    const percent = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const relativeValue = (max - min) * percent;
    return min + Math.round(relativeValue);
  }
}





//====================================================================== 퍼블리셔 포트폴리오 크로스헤어 ======================================================================
document.addEventListener('DOMContentLoaded', () => {
  const inner = document.querySelector('#section4');
  if (!inner) return;

  const crosshair = inner.querySelector('.crosshair');
  const lineX = inner.querySelector('.crosshair__x');
  const lineY = inner.querySelector('.crosshair__y');

  if (!crosshair || !lineX || !lineY) return;

  const update = (e) => {
    const rect = inner.getBoundingClientRect();

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // 영역 밖이면 숨김
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      inner.classList.remove('is-aiming');
      return;
    }

    inner.classList.add('is-aiming');

    // 픽셀 스냅 (콘솔/비트 느낌 강화)
    x = Math.round(x);
    y = Math.round(y);

    lineX.style.top = `${y}px`;
    lineY.style.left = `${x}px`;
  };

  inner.addEventListener('mouseenter', () => {
    inner.classList.add('is-aiming');
  });

  inner.addEventListener('mouseleave', () => {
    inner.classList.remove('is-aiming');
  });

  inner.addEventListener('mousemove', update);

  // 모바일 터치 대응 (조준선 비활성)
  inner.addEventListener('touchstart', () => {
    inner.classList.remove('is-aiming');
  }, { passive: true });
});








//====================================================================== matter.js ======================================================================
document.addEventListener('DOMContentLoaded', function () {
  //📌 Matter.js 기본 객체 생성
  let Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

  // 전역 변수 (한 번만 생성 후 재사용)
  let engine = Engine.create();
  let render;

  function init() {
    // 화면 크기 값 가져오기
    let width = $("#matter-container").width();
    let height = $("#matter-container").height();

    // 기존 엔진과 월드 초기화
    if (engine) {
      World.clear(engine.world);
      Engine.clear(engine);
    } else {
      engine = Engine.create();
    }

    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;

    // 기존 Render 객체 정리 후 새로운 Render 생성
    if (render) {
      Render.stop(render); // 기존 렌더링 중지
      render.canvas.remove(); // 기존 캔버스 삭제
      render.context = null;
      render.textures = {};
    }

    render = Render.create({
      element: document.getElementById('matter-container'),
      engine: engine,
      options: {
        wireframes: false,
        background: 'transparent',
        width: width,
        height: height
      }
    });

    // 월드 경계 추가 (바운더리)
    World.add(engine.world, [
      Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true }), // 하단 벽
      Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true }), // 상단 벽
      Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true }), // 왼쪽 벽
      Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true }) // 오른쪽 벽
    ]);

    // <ul id="myList"> 내의 모든 <li> 요소 탐색
    let listItems = document.querySelectorAll("#myList li");
    let circles = [];

    listItems.forEach(li => {
      let img = li.querySelector("img");
      if (img) {
        // 이미지가 로드된 후에만 circle 생성 (naturalWidth 문제 해결)
        if (img.complete) {
          createCircle(img);
        } else {
          img.onload = function () {
            createCircle(img);
          };
        }
      }
    });

    // 이미지에서 Circle 객체 생성하는 함수
    function createCircle(img) {
      let texture = img.src;
      let radius = img.naturalWidth / 3.5; // 이미지 크기에 따라 반지름 조정, 

      let circle = Bodies.circle(
        Math.random() * width,  // 랜덤 X 위치
        Math.random() * height, // 랜덤 Y 위치
        radius,
        {
          render: {
            sprite: {
              texture: texture,
              xScale: 0.5,  // 가로 크기 축소 (60%)
              yScale: 0.5   // 세로 크기 축소 (60%)
            }
          }
        }
      );

      circles.push(circle);
      World.add(engine.world, circle);
    }

    // Matter.js 엔진 및 렌더 실행
    Engine.run(engine);
    Render.run(render);

    // 마우스 인터랙션 추가 (드래그 기능)
    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.5,
        render: { visible: false }
      }
    });

    // 스크롤 막는 Matter.js 기본 wheel 이벤트 제거
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    // (모바일까지 대비할 경우)
    mouse.element.removeEventListener("touchmove", mouse.mousemove);

    // 기존 마우스 컨트롤 제거 후 새로운 컨트롤 추가
    if (engine.mouseConstraint) {
      World.remove(engine.world, engine.mouseConstraint);
    }
    engine.mouseConstraint = mouseConstraint;
    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // 중앙으로 끌어당기는 힘 적용
    Matter.Events.on(engine, 'beforeUpdate', function () {
      circles.forEach(function (circle) {
        // 중앙으로 가는 힘 적용
        Matter.Body.applyForce(circle, circle.position, {
          x: (width / 2 - circle.position.x) * 0.00005, //숫자가 작아질 수록 강해짐
          y: (height / 2 - circle.position.y) * 0.00005  //숫자가 작아질 수록 강해짐
        });

        // 마우스와의 충돌 감지 (반발력 추가)
        let mousePosition = mouse.position;
        let distance = Matter.Vector.magnitude(Matter.Vector.sub(mousePosition, circle.position));
        let minDistance = circle.circleRadius + 10;

        if (distance < minDistance) {
          let forceMagnitude = 0.05 * (minDistance - distance);  //숫자가 작아질 수록 강해짐
          let force = Matter.Vector.normalise(Matter.Vector.sub(circle.position, mousePosition));
          force = Matter.Vector.mult(force, forceMagnitude);
          Matter.Body.applyForce(circle, circle.position, force);
        }
      });
    });
  }

  // 초기 실행
  init();

  // 창 크기 변경 시 `init()` 실행 (디바운싱 적용)
  let resizeTimer;
  $(window).resize(function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });
});



//====================================================================== GSAP ======================================================================


document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // 인트로 ======================================================================
  const loading = document.querySelector('.intro');
  const rotate = document.querySelectorAll('.rotate');
  const opacity = document.querySelectorAll('.opacity');

  if (loading) {
    setTimeout(() => loading.classList.add('scene1'), 0);
    setTimeout(() => loading.classList.add('scene2'), 5000);
    setTimeout(() => rotate.forEach(r => r.classList.add('on')), 5000);
    setTimeout(() => opacity.forEach(o => o.classList.add('on')), 5000);
  }

  // 01 메인 비주얼 ======================================================================
  gsap.timeline({
    scrollTrigger: {
      trigger: '.visual',
      start: '100% 100%',
      end: '100% 0%',
      scrub: 1,
      // markers: true,
    }
  })

    .to('.logoWrap #symbol1', { x: -150, y: 250, rotate: 20, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol2', { x: -30, y: 150, rotate: -10, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol3', { x: 0, y: 400, rotate: -10, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol4', { x: 50, y: 300, rotate: 10, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol5', { x: 100, y: 100, rotate: -10, opacity: 0.5, ease: 'none', duration: 5 }, 0)
    .to('.logoWrap #symbol6', { x: 50, y: 400, rotate: 20, opacity: 0.5, ease: 'none', duration: 5 }, 0);



// design-portfolio 배경 색상 변경 + GoodBad섹션 색상변경 =========================================================
const designPortfolioBgChange = document.querySelector('#design-portfolio');
const goodBadSection = document.querySelector('#GoodBad');

if (designPortfolioBgChange) {
  ScrollTrigger.create({
    trigger: designPortfolioBgChange,
    start: 'top 50%',
    end: 'bottom 80%',

    onEnter: () => {
      designPortfolioBgChange.classList.add('background-reverse');
      goodBadSection?.classList.add('background-reverse');
    },

    onEnterBack: () => {
      designPortfolioBgChange.classList.add('background-reverse');
      goodBadSection?.classList.add('background-reverse');
    },

    onLeave: () => {
      designPortfolioBgChange.classList.remove('background-reverse');
      goodBadSection?.classList.remove('background-reverse');
    },

    onLeaveBack: () => {
      designPortfolioBgChange.classList.remove('background-reverse');
      goodBadSection?.classList.remove('background-reverse');
    },

    // markers: true,
  });
}

  // graphic-design 기준 배경 변경 =========================================================
  const graphicDesign = document.querySelector('.graphic-design');
  if (graphicDesign && designPortfolioBgChange) {
    ScrollTrigger.create({
      trigger: graphicDesign,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () =>
        designPortfolioBgChange.classList.add('background-reverse2'),
      onEnterBack: () =>
        designPortfolioBgChange.classList.add('background-reverse2'),
      onLeave: () =>
        designPortfolioBgChange.classList.remove('background-reverse2'),
      onLeaveBack: () =>
        designPortfolioBgChange.classList.remove('background-reverse2'),
      // markers: true,
    });
  }


  // 디자인 포트폴리오 타이틀 ======================================================================
  gsap.utils.toArray('#section4 .mainTextBox').forEach((box) => {
    const targets = box.querySelectorAll('.title i');
    if (!targets.length) return;

    gsap.set(targets, { y: 300 }); // 시작 위치 (미리 아래로)

    gsap.timeline({
      scrollTrigger: {
        trigger: box,
        start: 'top 40%',
        toggleActions: 'restart none none reverse',
      }
    })
      .to(targets, { y: 0, ease: 'power3.out', duration: 0.6, stagger: 0.1 }, 0);
  });


  // 디자인 포트폴리오 서브 타이틀 ======================================================================
  gsap.utils.toArray('#section4 .subText').forEach((box) => {
    const targets = box.querySelectorAll('p');
    if (!targets.length) return;

    gsap.set(targets, { y: 300, opacity: 0 });

    gsap.timeline({
      scrollTrigger: {
        trigger: box,
        start: 'top 70%',
        toggleActions: 'restart none none reverse',
      }
    })
      .to(targets, {
        y: 0,
        opacity: 1,
        ease: 'power3.out',
        duration: 0.6,
        stagger: 0.2
      }, 0);
  });


  // -----------------section2------------------------------------------------
  function observeDirectionReset(selector, activeClass, threshold = 0.3) {
    const el = document.querySelector(selector);
    if (!el) return;

    let lastY = window.scrollY;

    const observer = new IntersectionObserver((entries) => {
      const currentY = window.scrollY;
      const scrollingUp = currentY < lastY;
      lastY = currentY;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(activeClass);
          return;
        }

        const rootH = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
        const leftToBottom = entry.boundingClientRect.top >= rootH;

        if (scrollingUp && leftToBottom) entry.target.classList.remove(activeClass);
      });
    }, { threshold });

    observer.observe(el);
  }

  observeDirectionReset('#section2>div>h2', 'active', 1);
  observeDirectionReset('#section2>div>div', 'active', 0.3);
  observeDirectionReset('.bubble-info', 'active', 0.3);


  // -----------------section4-----------------------------------------------
  const targetText9 = document.querySelector('#section4 h3');
  if (targetText9) {
    const observerText9 = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 1 });
    observerText9.observe(targetText9);
  }

  const targetText10 = document.querySelectorAll('#section4 .web-project-box');
  if (targetText10.length) {
    const observerText10 = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    targetText10.forEach((box) => observerText10.observe(box));
  }


  // 그래픽 디자인 타이틀 ======================================================================
  gsap.utils.toArray('.graphic-design .mainTextBox').forEach((box) => {
    const targets = box.querySelectorAll('.title i');
    if (!targets.length) return;

    gsap.set(targets, { y: 300 }); // 시작 위치 (미리 아래로)

    gsap.timeline({
      scrollTrigger: {
        trigger: box,
        start: 'top 50%',
        toggleActions: 'restart none none reverse',
      }
    })
      .to(targets, { y: 0, ease: 'power3.out', duration: 0.6, stagger: 0.1 }, 0);
  });


  // 그래픽 디자인 포트폴리오 서브 타이틀 ======================================================================
  gsap.utils.toArray('.graphic-design .subText').forEach((box) => {
    const targets = box.querySelectorAll('p');
    if (!targets.length) return;

    gsap.set(targets, { y: 300, opacity: 0 });

    gsap.timeline({
      scrollTrigger: {
        trigger: box,
        start: 'top 70%',
        toggleActions: 'restart none none reverse',
      }
    })
      .to(targets, {
        y: 0,
        opacity: 1,
        ease: 'power3.out',
        duration: 0.6,
        stagger: 0.2
      }, 0);
  });

  

  //  그래픽 디자인 리스트 ======================================================================
  gsap.utils.toArray('.graphic-design .listBox li').forEach((selector, t) => {
    ScrollTrigger.create({
      trigger: selector,
      start: 'top bottom',
      onEnter: () => {
        gsap.set(selector, { rotationX: '-65deg', z: '-500px', opacity: 0 });
        gsap.to(selector, { rotationX: 0, z: 0, opacity: 1, delay: (t % 3) * 0.05 });
      },
    });
  });



  // Next-Step 도달 시 bg-change 적용 ==============================================
  const nextStepSection = document.querySelector('.Next-Step');

  if (nextStepSection) {
    ScrollTrigger.create({
      trigger: nextStepSection,
      start: 'top 50%',
      onEnter: () =>
        nextStepSection.classList.add('bg-change'),
      onEnterBack: () =>
        nextStepSection.classList.add('bg-change'),
      onLeave: () =>
        nextStepSection.classList.remove('bg-change'),
      onLeaveBack: () =>
        nextStepSection.classList.remove('bg-change'),
      // markers: true,
    });
  }


  // Next-Step 리스트 박스 ======================================================================
  gsap.utils.toArray('.Next-Step .listBox .box').forEach((selector) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: selector,
        start: '0% 20%',
        end: '0% -20%',
        scrub: 1,
      }
    })
    // hold 구간 (변화 없음)
    .to(selector, {}, 0.4)

    .to(
      selector,
      {
        transform: 'rotateX(-5deg) scale(0.9)',
        transformOrigin: 'top',
        filter: 'brightness(0.3)',
      },
      0.3
    );
  });



  // qna ======================================================================
  gsap.timeline({
    scrollTrigger: {
      trigger: '#qna',
      start: '0% 100%',
      end: '100% 100%',
      scrub: 1,
    }
  })
    .to('.logoWrap', { top: '40%', ease: 'none', duration: 5 }, 0);

  ScrollTrigger.refresh();
});



// 그래픽 디자인 이미지 트레일러 ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  const trailer = document.querySelector(".graphic-design .mainTextBox");
  const images = document.querySelectorAll(".graphic-design .image-gallery .image-item");

  if (!trailer || images.length === 0) return;  // 방어 코드: 요소가 없으면 중단

  let currentImageIndex = 0;
  let lastMousePos = { x: 0, y: 0 };
  let lastImageTime = Date.now();

  const movementThreshold = 180; // 마지막 이미지가 생성된 위치에서 최소 몇 px 이상 이동해야 새 이미지를 만들지
  const delayBetween = 100;

  function createImageTrail(e) {  // mainTextBox 기준 좌표로 변환
    const rect = trailer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;


    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;  // 박스 내부일 때만 (안전장치)

    // 마지막 생성 좌표와 거리 계산 (mainTextBox 기준)
    const dx = x - lastMousePos.x;
    const dy = y - lastMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < movementThreshold) return;

    const now = Date.now();
    if (now - lastImageTime < delayBetween) return;

    // 이미지 복제
    const image = images[currentImageIndex].cloneNode(true);
    currentImageIndex = (currentImageIndex + 1) % images.length;

    // absolute 기준점: mainTextBox (이미 position:relative라 OK)
    // 이미지 중앙 정렬(200x300 기준이면 -100, -150)
    image.style.left = `${x - 50}px`;
    image.style.top = `${y - 75}px`;

    trailer.appendChild(image);

    gsap.fromTo(
      image,
      {
        opacity: 1,
        scale: 0,
        rotation: gsap.utils.random(-20, 20)
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(2)"
      }
    );

    gsap.to(image, {
      opacity: 1,
      scale: 0,
      duration: 0.6,
      delay: 0.6,
      ease: "power2.in",
      onComplete: () => image.remove()
    });

    lastMousePos = { x, y };
    lastImageTime = now;
  }

  // document가 아니라 mainTextBox에서만 동작
  trailer.addEventListener("mousemove", createImageTrail);

  // 박스 밖으로 나가면 기준점 리셋(선택)
  trailer.addEventListener("mouseleave", () => {
    lastMousePos = { x: 0, y: 0 };
  });
});




// 포물선 마퀴 ======================================================================
document.addEventListener('DOMContentLoaded', () => {
  // === 설정값 (React props/const 대체) ===
  const marqueeText = 'Designer ✦ Publisher ✦ Director ✦ ';
  const pathId = 'customCurve';
  const textSpacing = 3220; // px 단위 간격
  const speed = 1;          // 프레임당 이동 px (1 = 원본과 동일)

  const path = document.getElementById(pathId);
  const textPath = document.getElementById('marqueeTextPath');
  if (!path || !textPath) return;

  // 경로 길이 측정 (React useEffect 대체)
  const pathLength = path.getTotalLength();

  // 반복 개수 계산 (원본 로직 동일)
  const repeats = Math.ceil(pathLength / textSpacing) + 2;

  // tspans 참조 배열
  const tspans = [];

  // tspan 생성 (React 렌더 대체)
  for (let i = 0; i < repeats; i++) {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan.setAttribute('x', String(i * textSpacing));
    tspan.textContent = marqueeText;
    tspan.style.fontFamily = '"Sequel 100 Wide", sans-serif';
    textPath.appendChild(tspan);
    tspans.push(tspan);
  }

  // 무한 애니메이션 (React useEffect 대체)
  let rafId;

  function move() {
    for (let i = 0; i < tspans.length; i++) {
      const tspan = tspans[i];
      let x = parseFloat(tspan.getAttribute('x')) || 0;
      x -= speed;

      // 너무 왼쪽으로 가면 오른쪽 끝으로 보내기
      if (x < -textSpacing) {
        x = (tspans.length - 1) * textSpacing;
      }

      tspan.setAttribute('x', String(x));
    }

    rafId = requestAnimationFrame(move);
  }

  move();

  // 페이지 떠날 때 정리(선택)
  window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
});


//====================================================================== Q n A (Tabs + Hover) ======================================================================
document.addEventListener('DOMContentLoaded', () => {
  let isAnimating = false;

  // 1) Tab switching
  $(document).on('click', '.qna-tab', function () {
    const target = $(this).data('qna-tab');

    // tabs ui
    $('.qna-tab').removeClass('is-active').attr('aria-selected', 'false');
    $(this).addClass('is-active').attr('aria-selected', 'true');

    // panels
    $('.qna-panel').removeClass('is-active').attr('hidden', true);
    const $panel = $(`.qna-panel[data-qna-panel="${target}"]`);
    $panel.addClass('is-active').removeAttr('hidden');

    // optional: 탭 바꿀 때 첫 번째 li를 active로 리셋 
    const $lis = $panel.find('.qna-list .li');
    $lis.removeClass('active inactive');
    $lis.each(function (idx) {
      $(this).addClass(idx === 0 ? 'active' : 'inactive');
    });
  });

  // 2) Hover interaction (same behavior, scoped to current panel)
  $(document).on('mouseenter', '.qna-panel.is-active .qna-list .li', function () {
    if (isAnimating) return;
    isAnimating = true;

    const $current = $(this);
    const $all = $current.closest('.qna-list').find('.li');

    // 현재 것만 active, 나머지는 inactive
    $all.not($current).removeClass('active').addClass('inactive');
    $current.removeClass('inactive').addClass('active');

    setTimeout(() => {
      isAnimating = false;
    }, 150);
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

    ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
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

  document.addEventListener('DOMContentLoaded', () => {
    const triggerBtn = document.querySelector('.footer .btn.tooltip-wrap');
    const targetBtn = document.querySelector('.footer .btn.aboutme');

    if (!triggerBtn || !targetBtn) return;

      triggerBtn.addEventListener('mouseenter', () => {
        targetBtn.classList.add('on');
      });
    
      triggerBtn.addEventListener('mouseleave', () => {
        targetBtn.classList.remove('on');
      });
    });
    
});
