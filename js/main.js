/* ==========================================================================
   Lorentso Aligia — Portfolio interactions
   Vanilla JS: i18n (EL/EN), theme toggle, scroll effects, filters, modal, form
   ========================================================================== */

(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");

  const dict = window.PORTFOLIO_I18N || {};
  let currentLang = "el";
  let activeProjectKey = null;
  let toastTimer = null;

  /* ---------- Helpers ---------- */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  function getValue(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  /* ---------- Language (EL / EN) ---------- */
  function detectInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang === "el" || urlLang === "en") return urlLang;
    try {
      const saved = localStorage.getItem("portfolio_lang");
      if (saved === "el" || saved === "en") return saved;
    } catch (_) {
      /* ignore storage restrictions */
    }
    return "el";
  }

  function renderSkillLists(langData) {
    const map = [
      { id: "skills-group-1", items: langData.skills.g1Items },
      { id: "skills-group-2", items: langData.skills.g2Items },
      { id: "skills-group-3", items: langData.skills.g3Items }
    ];
    map.forEach(({ id, items }) => {
      const ul = document.getElementById(id);
      if (!ul || !Array.isArray(items)) return;
      ul.innerHTML = "";
      items.forEach((label) => {
        const li = document.createElement("li");
        li.textContent = label;
        ul.appendChild(li);
      });
    });
  }

  function applyLanguage(lang, animate = false) {
    if (!dict[lang]) return;
    currentLang = lang;
    const data = dict[lang];

    const runSwap = () => {
      root.setAttribute("lang", lang);
      root.setAttribute("data-lang", lang);

      if (data.meta) {
        document.title = data.meta.title;
        const metaDesc = $('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", data.meta.description);
      }

      $$("[data-i18n]").forEach((el) => {
        const val = getValue(data, el.dataset.i18n);
        if (typeof val === "string") el.textContent = val;
      });

      $$("[data-i18n-html]").forEach((el) => {
        const val = getValue(data, el.dataset.i18nHtml);
        if (typeof val === "string") el.innerHTML = val;
      });

      $$("[data-i18n-placeholder]").forEach((el) => {
        const val = getValue(data, el.dataset.i18nPlaceholder);
        if (typeof val === "string") el.setAttribute("placeholder", val);
      });

      $$("[data-i18n-aria]").forEach((el) => {
        const val = getValue(data, el.dataset.i18nAria);
        if (typeof val === "string") el.setAttribute("aria-label", val);
      });

      renderSkillLists(data);

      $$("[data-lang-btn]").forEach((btn) => {
        const isCurrent = btn.dataset.langBtn === lang;
        btn.setAttribute("aria-pressed", String(isCurrent));
      });

      if (activeProjectKey) {
        populateModal(activeProjectKey);
      }

      if (typeof updateAthensClock === "function") {
        updateAthensClock();
      }
      if (typeof syncRoleWord === "function") {
        syncRoleWord();
      }
      if (typeof renderStoriesLang === "function") {
        renderStoriesLang();
      }

      try {
        localStorage.setItem("portfolio_lang", lang);
      } catch (_) {
        /* ignore */
      }
    };

    if (!animate) {
      runSwap();
      return;
    }

    document.body.classList.add("is-switching");
    window.setTimeout(() => {
      runSwap();
      document.body.classList.remove("is-switching");
    }, 140);
  }

  $$("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.langBtn;
      if (target && target !== currentLang) {
        applyLanguage(target, true);
      }
    });
  });

  /* ---------- Theme (Light / Dark) ---------- */
  function initTheme() {
    let theme = "light";
    try {
      const saved = localStorage.getItem("portfolio_theme");
      if (saved === "light" || saved === "dark") {
        theme = saved;
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        theme = "dark";
      }
    } catch (_) {
      /* ignore */
    }
    root.setAttribute("data-theme", theme);
  }

  const themeToggle = $("#theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("portfolio_theme", next);
      } catch (_) {
        /* ignore */
      }
    });
  }

  /* ---------- Mobile Menu ---------- */
  const burger = $("#menu-toggle");
  const mobileMenu = $("#mobile-menu");

  function setMenuOpen(open) {
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (burger) burger.setAttribute("aria-expanded", String(open));
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", String(!open));
  }

  if (burger) {
    burger.addEventListener("click", () => {
      setMenuOpen(!document.body.classList.contains("menu-open"));
    });
  }

  $$(".mobile-menu__link").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  /* ---------- Header Scroll & Progress Bar ---------- */
  const header = $("#site-header");
  const progressBar = $("#scroll-progress");
  let lastY = window.scrollY;
  let ticking = false;

  function updateScrollUI() {
    const y = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, y / maxScroll))})`;
    }
    if (header) {
      header.classList.toggle("is-scrolled", y > 24);
      const scrollingDown = y > lastY && y > 260;
      const menuOrModalOpen =
        document.body.classList.contains("menu-open") || ($("#project-modal")?.classList.contains("is-open") ?? false);
      header.classList.toggle("is-hidden", scrollingDown && !menuOrModalOpen);
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollUI);
        ticking = true;
      }
    },
    { passive: true }
  );

  /* ---------- Active Nav Highlight ---------- */
  const navLinks = $$(".nav__link");
  const trackedSections = navLinks
    .map((a) => {
      const id = a.getAttribute("href")?.replace("#", "");
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && trackedSections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    trackedSections.forEach((sec) => navObserver.observe(sec));
  }

  /* ---------- Reveal on Scroll ---------- */
  const revealEls = $$(".reveal, .step");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Portfolio Filter ---------- */
  const filterBtns = $$(".filter-btn");
  const projectCards = $$(".project[data-category]");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter || "all";
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---------- Project Detail Modal ---------- */
  const modal = $("#project-modal");
  const modalImg = $("#modal-img");
  const modalCat = $("#modal-cat");
  const modalTitle = $("#modal-title");
  const modalDesc = $("#modal-desc");
  const modalDeliverables = $("#modal-deliverables");
  const modalTools = $("#modal-tools");
  const modalCta = $("#modal-cta");
  const modalCloseBtn = $("#modal-close");

  function populateModal(key) {
    const data = dict[currentLang]?.projects?.[key];
    if (!data) return;
    if (modalImg) {
      modalImg.src = data.image;
      modalImg.alt = data.title;
    }
    if (modalCat) modalCat.textContent = data.cat;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.desc;

    if (modalDeliverables) {
      modalDeliverables.innerHTML = "";
      data.deliverables.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        modalDeliverables.appendChild(li);
      });
    }

    if (modalTools) {
      modalTools.innerHTML = "";
      data.tools.forEach((tool) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tool;
        modalTools.appendChild(span);
      });
    }

    if (modalCta) {
      modalCta.dataset.topicPrefill = key;
    }
  }

  function openModal(key) {
    if (!modal || !dict[currentLang]?.projects?.[key]) return;
    activeProjectKey = key;
    populateModal(key);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => modalCloseBtn?.focus(), 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeProjectKey = null;
  }

  $$("[data-open-project]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const key = trigger.dataset.openProject;
      if (key) openModal(key);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

  if (modalCta) {
    modalCta.addEventListener("click", () => {
      const topicMap = { web: "web", video: "video", social: "social" };
      const topicSelect = $("#contact-topic");
      const prefill = topicMap[modalCta.dataset.topicPrefill];
      if (topicSelect && prefill) {
        topicSelect.value = prefill;
      }
      closeModal();
      $("#contact")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => $("#contact-name")?.focus(), 450);
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal?.classList.contains("is-open")) closeModal();
      if (document.body.classList.contains("menu-open")) setMenuOpen(false);
    }
  });

  /* ---------- Print / Save CV PDF ---------- */
  $$("[data-print-cv]").forEach((btn) => {
    btn.addEventListener("click", () => window.print());
  });

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  const toastMsg = $("#toast-msg");

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 5200);
  }

  /* ---------- Contact Form (Real Email Delivery) ---------- */
  const CONTACT_CONFIG = {
    email: "lorentsoaligia@gmail.com",
    web3formsKey: "", // Optional: add a free key from web3forms.com to send directly even from file://
    formsubmitUrl: "https://formsubmit.co/ajax/lorentsoaligia@gmail.com"
  };

  const form = $("#contact-form");
  if (form) {
    const nameInput = $("#contact-name");
    const emailInput = $("#contact-email");
    const topicSelect = $("#contact-topic");
    const msgInput = $("#contact-message");
    const honeyInput = $("#contact-honey");
    const submitBtn = $("#contact-submit");
    const submitLabel = $("#contact-submit-label");

    const setError = (input, hasErr) => {
      input?.closest(".field")?.classList.toggle("has-error", hasErr);
    };

    const openGmailCompose = (subject, body) => {
      const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(CONTACT_CONFIG.email)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;
      const win = window.open(gmailUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        const link = document.createElement("a");
        link.href =
          `mailto:${CONTACT_CONFIG.email}` +
          `?subject=${encodeURIComponent(subject)}` +
          `&body=${encodeURIComponent(body)}`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    [nameInput, emailInput, msgInput].forEach((input) => {
      input?.addEventListener("input", () => setError(input, false));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Honeypot check (ignore spam bots)
      if (honeyInput && honeyInput.value.trim() !== "") return;

      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const msgVal = msgInput.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

      setError(nameInput, nameVal.length < 2);
      setError(emailInput, !emailOk);
      setError(msgInput, msgVal.length < 10);

      if (nameVal.length < 2 || !emailOk || msgVal.length < 10) {
        const firstInvalid = form.querySelector(".field.has-error input, .field.has-error textarea");
        firstInvalid?.focus();
        return;
      }

      const cStrings = dict[currentLang]?.contact || {};
      const topicLabel = topicSelect.options[topicSelect.selectedIndex]?.text || topicSelect.value;
      const subject = `[Portfolio] ${topicLabel} — ${nameVal}`;
      const plainBody = `Name: ${nameVal}\nEmail: ${emailVal}\nTopic: ${topicLabel}\n\n${msgVal}`;
      const isHttp = window.location.protocol === "http:" || window.location.protocol === "https:";

      const setLoading = (loading) => {
        if (submitBtn) submitBtn.disabled = loading;
        if (submitLabel) {
          submitLabel.textContent = loading
            ? cStrings.formSending || "Sending..."
            : cStrings.formSubmit || "Send message";
        }
      };

      // Local file:// without Web3Forms key -> open pre-filled Gmail Compose directly (works without hosting!)
      if (!isHttp && !CONTACT_CONFIG.web3formsKey) {
        openGmailCompose(subject, plainBody);
        showToast(cStrings.toastMailto || `Opened Gmail for ${CONTACT_CONFIG.email}`);
        form.reset();
        return;
      }

      const sendViaWeb3Forms = async () => {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: CONTACT_CONFIG.web3formsKey,
            subject,
            from_name: nameVal,
            name: nameVal,
            email: emailVal,
            replyto: emailVal,
            topic: topicLabel,
            message: msgVal
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.message || "Web3Forms error");
        return { ok: true, needsActivation: false };
      };

      const sendViaFormSubmit = async () => {
        const fd = new FormData();
        fd.append("name", nameVal);
        fd.append("email", emailVal);
        fd.append("_replyto", emailVal);
        fd.append("topic", topicLabel);
        fd.append("message", msgVal);
        fd.append("_subject", subject);
        fd.append("_template", "table");
        fd.append("_captcha", "false");

        const res = await fetch(CONTACT_CONFIG.formsubmitUrl, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: fd
        });
        const data = await res.json().catch(() => ({}));
        const msg = String(data.message || "");
        if (/activat/i.test(msg)) {
          return { ok: true, needsActivation: true };
        }
        if (!res.ok || data.success === "false" || data.success === false) {
          throw new Error(msg || `FormSubmit status ${res.status}`);
        }
        return { ok: true, needsActivation: false };
      };

      setLoading(true);
      try {
        if (CONTACT_CONFIG.web3formsKey) {
          await sendViaWeb3Forms();
          showToast(cStrings.toastSuccess || `Message sent to ${CONTACT_CONFIG.email}!`);
        } else {
          const result = await sendViaFormSubmit();
          if (result.needsActivation) {
            showToast(cStrings.toastActivate || `Activation email sent to ${CONTACT_CONFIG.email}`);
          } else {
            showToast(cStrings.toastSuccess || `Message sent to ${CONTACT_CONFIG.email}!`);
          }
        }
        form.reset();
      } catch (_) {
        openGmailCompose(subject, plainBody);
        showToast(cStrings.toastError || `Opened Gmail for ${CONTACT_CONFIG.email}`);
      } finally {
        setLoading(false);
      }
    });
  }

  /* ---------- Subtle Intro Curtain ---------- */
  function initIntro() {
    const intro = $("#intro-screen");
    if (!intro) return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      intro.classList.add("is-done");
      return;
    }
    window.setTimeout(() => {
      intro.classList.add("is-done");
    }, 480);
  }

  /* ---------- Live Athens Clock & Status ---------- */
  function updateAthensClock() {
    const heroClock = $("#hero-clock");
    const heroTime = $("#hero-clock-time");
    const heroStatus = $("#hero-clock-status");
    const contactClock = $("#contact-clock");
    if (!heroTime && !contactClock) return;

    const now = new Date();
    let hour = 12;
    let minute = "00";
    let tz = "EET";

    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Athens",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZoneName: "short"
      }).formatToParts(now);

      const getPart = (type) => parts.find((p) => p.type === type)?.value;
      const hStr = getPart("hour") || "12";
      hour = parseInt(hStr, 10);
      minute = getPart("minute") || "00";
      const tzRaw = getPart("timeZoneName") || "EET";
      tz = /GMT\+3|EEST/i.test(tzRaw) ? "EEST" : /GMT\+2|EET/i.test(tzRaw) ? "EET" : tzRaw;
      const hh = String(hour).padStart(2, "0");

      const clockStrings = dict[currentLang]?.clock || { city: "Athens", available: "Available", away: "Offline" };
      const isAvailable = (hour >= 8 && hour < 23) || (hour === 23 && parseInt(minute, 10) < 30);

      if (heroClock) heroClock.classList.toggle("is-away", !isAvailable);
      if (heroTime) {
        heroTime.innerHTML = `${clockStrings.city} · ${hh}<span class="live-clock__colon">:</span>${minute} ${tz}`;
      }
      if (heroStatus) {
        heroStatus.textContent = isAvailable ? clockStrings.available : clockStrings.away;
      }
      if (contactClock) {
        contactClock.textContent = `${hh}:${minute} ${tz}`;
      }
    } catch (_) {
      /* ignore Intl errors on legacy browsers */
    }
  }

  /* ---------- Animated Stat Counters ---------- */
  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length) return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (Number.isNaN(target) || el.dataset.counted === "1") return;
      el.dataset.counted = "1";
      const duration = target <= 5 ? 550 : 1050;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          el.textContent = String(target);
        }
      };
      el.textContent = "0";
      window.requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach((el) => obs.observe(el));
  }

  /* ---------- Magnetic Hover Buttons ---------- */
  function initMagneticButtons() {
    const finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    $$(".btn").forEach((btn) => {
      let rafId = null;
      btn.addEventListener("mousemove", (e) => {
        if (btn.disabled) return;
        const rect = btn.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        const mx = (relX * 10).toFixed(2);
        const my = (relY * 8).toFixed(2);
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(() => {
          btn.style.setProperty("--mx", `${mx}px`);
          btn.style.setProperty("--my", `${my}px`);
        });
      });
      btn.addEventListener("mouseleave", () => {
        if (rafId) window.cancelAnimationFrame(rafId);
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------- 1-Click Copy Email (Works on HTTPS & file://) ---------- */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        /* fall through to legacy copy */
      }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  $$("[data-copy-email]").forEach((btn) => {
    let resetTimer = null;
    btn.addEventListener("click", async () => {
      const email = btn.dataset.copyEmail || CONTACT_CONFIG.email;
      await copyText(email);

      btn.classList.add("is-copied");
      const labelEl = btn.querySelector("[data-i18n]");
      const isContactCopy = Boolean(labelEl);
      if (isContactCopy) {
        labelEl.textContent = dict[currentLang]?.contact?.copiedBtn || "Copied";
      }

      const toastText = dict[currentLang]?.contact?.toastCopied || `Copied: ${email}`;
      showToast(toastText);

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        btn.classList.remove("is-copied");
        if (isContactCopy) {
          labelEl.textContent = dict[currentLang]?.contact?.copyBtn || "Copy";
        }
      }, 2200);
    });
  });

  /* ---------- Dynamic Role Rotator ---------- */
  let roleIndex = 0;
  function syncRoleWord() {
    const el = $("#role-word");
    const roles = dict[currentLang]?.hero?.roles;
    if (!el || !Array.isArray(roles) || !roles.length) return;
    el.textContent = roles[roleIndex % roles.length];
  }

  function initRoleRotator() {
    const el = $("#role-word");
    if (!el) return;
    syncRoleWord();
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    window.setInterval(() => {
      const roles = dict[currentLang]?.hero?.roles;
      if (!Array.isArray(roles) || roles.length < 2) return;
      el.classList.add("is-out");
      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        el.textContent = roles[roleIndex];
        el.classList.remove("is-out");
        el.classList.add("is-in-prep");
        void el.offsetWidth; // trigger reflow
        el.classList.remove("is-in-prep");
      }, 360);
    }, 2700);
  }

  /* ---------- Interactive Instagram Stories (iPhone Frame) ---------- */
  let currentStory = 0;
  let storyTimer = null;
  let storyStartTs = 0;
  let storyRemaining = 5500;
  let storyManualPaused = false;
  let storyHoverPaused = false;
  const STORY_DURATION = 5500;

  function renderStoryTabs() {
    const stories = dict[currentLang]?.showcase?.stories;
    if (!Array.isArray(stories)) return;
    $$(".story-tab").forEach((tab, i) => {
      const s = stories[i];
      if (!s) return;
      const strong = tab.querySelector("strong");
      const small = tab.querySelector("small");
      if (strong) strong.textContent = s.tabTitle;
      if (small) small.textContent = s.tabSub;
      const active = i === currentStory;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  }

  function renderStorySlide(idx, restartBar = true) {
    const stories = dict[currentLang]?.showcase?.stories;
    if (!Array.isArray(stories) || !stories.length) return;
    currentStory = ((idx % stories.length) + stories.length) % stories.length;
    const s = stories[currentStory];

    const img = $("#story-img");
    const media = $("#story-media");
    const timeEl = $("#story-time");
    const tagEl = $("#story-tag");
    const titleEl = $("#story-title");
    const descEl = $("#story-desc");
    const startBtn = $("#story-start-btn");

    if (img) {
      img.src = s.image;
      img.alt = s.title;
    }
    if (media && restartBar) {
      media.classList.remove("is-zoom");
      void media.offsetWidth;
      media.classList.add("is-zoom");
    }
    if (timeEl) timeEl.textContent = s.time;
    if (tagEl) tagEl.textContent = s.tag;
    if (titleEl) titleEl.textContent = s.title;
    if (descEl) descEl.textContent = s.desc;
    if (startBtn) startBtn.dataset.storyTopic = s.topic || "other";

    renderStoryTabs();

    if (restartBar) {
      const bars = $$("#story-bars .story-bar");
      bars.forEach((bar, i) => {
        bar.classList.remove("is-done", "is-active");
        const fill = bar.querySelector(".story-bar__fill");
        if (fill) {
          fill.style.animation = "none";
          void fill.offsetWidth;
          fill.style.animation = "";
        }
        if (i < currentStory) bar.classList.add("is-done");
        if (i === currentStory) bar.classList.add("is-active");
      });
      storyRemaining = STORY_DURATION;
      scheduleStoryNext();
    }
  }

  function renderStoriesLang() {
    renderStorySlide(currentStory, false);
  }

  function isStoryPaused() {
    return storyManualPaused || storyHoverPaused;
  }

  function syncStoryPauseUI() {
    const iphone = $("#iphone-stories");
    if (iphone) iphone.classList.toggle("is-paused", isStoryPaused());
  }

  function scheduleStoryNext() {
    window.clearTimeout(storyTimer);
    syncStoryPauseUI();
    if (isStoryPaused()) return;
    storyStartTs = performance.now();
    storyTimer = window.setTimeout(() => {
      renderStorySlide(currentStory + 1, true);
    }, storyRemaining);
  }

  function pauseStory() {
    if (!storyTimer) return;
    window.clearTimeout(storyTimer);
    storyTimer = null;
    const elapsed = performance.now() - storyStartTs;
    storyRemaining = Math.max(250, storyRemaining - elapsed);
    syncStoryPauseUI();
  }

  function initStories() {
    const iphone = $("#iphone-stories");
    if (!iphone) return;

    $$(".story-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const idx = parseInt(tab.dataset.storyIndex || "0", 10);
        storyManualPaused = false;
        renderStorySlide(idx, true);
      });
    });

    const goPrev = () => {
      storyManualPaused = false;
      renderStorySlide(currentStory - 1, true);
    };
    const goNext = () => {
      storyManualPaused = false;
      renderStorySlide(currentStory + 1, true);
    };

    $("#story-prev-btn")?.addEventListener("click", goPrev);
    $("#story-next-btn")?.addEventListener("click", goNext);
    $("#story-tap-prev")?.addEventListener("click", goPrev);
    $("#story-tap-next")?.addEventListener("click", goNext);

    $("#story-pause-btn")?.addEventListener("click", () => {
      storyManualPaused = !storyManualPaused;
      if (storyManualPaused) {
        pauseStory();
      } else {
        scheduleStoryNext();
      }
    });

    iphone.addEventListener("mouseenter", () => {
      storyHoverPaused = true;
      pauseStory();
    });
    iphone.addEventListener("mouseleave", () => {
      storyHoverPaused = false;
      scheduleStoryNext();
    });

    $("#story-start-btn")?.addEventListener("click", (e) => {
      const topic = e.currentTarget.dataset.storyTopic;
      const topicSelect = $("#contact-topic");
      if (topicSelect && topic) topicSelect.value = topic;
      $("#contact")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => $("#contact-name")?.focus(), 450);
    });

    renderStorySlide(0, true);
  }

  /* ---------- Scroll-Driven Horizontal Filmstrip Gallery ---------- */
  function initFilmstrip() {
    const wrap = $("#filmstrip");
    const track = $("#filmstrip-track");
    if (!wrap || !track) return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let currentX = 0;
    let targetX = 0;
    let animating = false;

    const computeTarget = () => {
      const viewport = wrap.querySelector(".filmstrip__viewport");
      if (!viewport) return;
      const maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth);
      if (maxShift <= 0) {
        targetX = 0;
        return;
      }
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      targetX = -maxShift * progress;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      if (Math.abs(targetX - currentX) < 0.35) {
        currentX = targetX;
        track.style.transform = `translate3d(${currentX.toFixed(1)}px, 0, 0)`;
        animating = false;
        return;
      }
      track.style.transform = `translate3d(${currentX.toFixed(1)}px, 0, 0)`;
      window.requestAnimationFrame(tick);
    };

    const onScrollOrResize = () => {
      computeTarget();
      if (!animating) {
        animating = true;
        window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    onScrollOrResize();
  }

  /* ---------- Floating Quick Contact Menu (FAB) ---------- */
  function initFab() {
    const fab = $("#fab-contact");
    const toggle = $("#fab-toggle");
    const menu = $("#fab-menu");
    if (!fab || !toggle || !menu) return;

    const setOpen = (open) => {
      fab.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!fab.classList.contains("is-open"));
    });

    $$(".fab__item", fab).forEach((item) => {
      item.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("click", (e) => {
      if (fab.classList.contains("is-open") && !fab.contains(e.target)) {
        setOpen(false);
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && fab.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  }

  /* ---------- Initialize ---------- */
  initTheme();
  applyLanguage(detectInitialLang(), false);
  updateAthensClock();
  window.setInterval(updateAthensClock, 15000);
  initIntro();
  initRoleRotator();
  initStories();
  initFilmstrip();
  initFab();
  initCounters();
  initMagneticButtons();
  updateScrollUI();
})();
