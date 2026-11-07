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
  const save = document.querySelector("#save-brief");
  if (save)
    save.addEventListener("click", () => {
      const fields = [
        "brief-name",
        "brief-company",
        "brief-contact",
        "brief-service",
        "brief-task",
        "brief-notes",
      ];
      const values = {};
      for (const id of fields) {
        const input = document.getElementById(id);
        if (!input.checkValidity()) {
          input.reportValidity();
          input.focus();
          return;
        }
        values[id] = input.value.trim();
      }
      if (values["brief-task"].length < 10) {
        const task = document.getElementById("brief-task");
        task.setCustomValidity("Опишите задачу хотя бы в десяти символах.");
        task.reportValidity();
        task.addEventListener("input", () => task.setCustomValidity(""), {
          once: true,
        });
        return;
      }
      const text = [
        "DEVORY — бриф проекта",
        "Данные сохранены пользователем локально. Отправка не выполнялась.",
        "",
        `Имя: ${values["brief-name"] || "Не указано"}`,
        `Компания: ${values["brief-company"] || "Не указана"}`,
        `Контакт: ${values["brief-contact"] || "Не указан"}`,
        `Направление: ${values["brief-service"]}`,
        "",
        "ЗАДАЧА",
        values["brief-task"],
        "",
        "ДОПОЛНИТЕЛЬНО",
        values["brief-notes"] || "Не указано",
      ].join("\n");
      const url = URL.createObjectURL(
        new Blob(["\uFEFF" + text], { type: "text/plain;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "devory-brief.txt";
      document.body.append(a);
      a.click();
      a.remove();
      document.querySelector("#brief-status").textContent =
        "Бриф подготовлен для скачивания. В Devory он не отправлен.";
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });
})();
