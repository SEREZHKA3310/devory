(() => {
  "use strict";
  const menu = document.querySelector(".menu-toggle"),
    nav = document.querySelector("#mobile-nav");
  if (menu && nav) {
    const close = () => {
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Открыть меню");
      nav.hidden = true;
    };
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      nav.hidden = !open;
    });
    nav
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const wasOpen = !nav.hidden;
        close();
        if (wasOpen) menu.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (!nav.hidden && !nav.contains(e.target) && !menu.contains(e.target))
        close();
    });
  }
  const toggle = document.querySelector(".motion-toggle");
  if (toggle) {
    let paused = false;
    toggle.addEventListener("motion-resume", () => {
      paused = false;
    });
    toggle.addEventListener("click", () => {
      paused = !paused;
      document.body.classList.toggle("paused", paused);
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.textContent = paused ? "Включить анимацию" : "Остановить анимацию";
    });
  }
  const filters = Array.from(document.querySelectorAll("[data-filter]")),
    cards = Array.from(document.querySelectorAll("[data-demo-type]"));
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      filters.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      let count = 0;
      cards.forEach((card) => {
        card.hidden =
          button.dataset.filter !== "all" &&
          card.dataset.demoType !== button.dataset.filter;
        if (!card.hidden) count++;
      });
      document.querySelector("#filter-status").textContent =
        `Показано примеров: ${count}`;
    }),
  );
})();
