(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const money = (value) => `${new Intl.NumberFormat("ru-RU").format(Number(value) || 0)} ₽`;
  const toast = $("#dashboard-toast");
  let toastTimer;
  const notify = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
  };

  // Fictional advertisers and objects. No request is sent to Yandex Direct.
  const clients = [
    { id: "sever", name: "Компания «Север»", currency: "RUB", balance: 63240 },
    { id: "vector", name: "ООО «Вектор»", currency: "RUB", balance: 184500 },
  ];
  const campaignsSeed = {
    sever: [
      { id: "784120561", name: "Поиск — бренд «Север»", startDate: "2026-10-01", type: "TEXT_CAMPAIGN", state: "ON", status: "ACCEPTED", strategy: "MAXIMUM_CLICKS", budget: 42000, schedule: "Ежедневно, 09:00–21:00", regions: "Москва и Московская область", negativePhrases: "бесплатно, работа, скачать", impressions: 602300, clicks: 11040, spend: 158460, conversions: 84 },
      { id: "784120582", name: "Каталог — товары", startDate: "2026-10-05", type: "UNIFIED_CAMPAIGN", state: "ON", status: "ACCEPTED", strategy: "MAXIMUM_CONVERSION_RATE", budget: 85000, schedule: "Ежедневно, 08:00–23:00", regions: "Россия, кроме удалённых регионов", negativePhrases: "оптом, б/у, вакансии", impressions: 410200, clicks: 6720, spend: 142540, conversions: 61 },
      { id: "784120603", name: "Приложение — установки", startDate: "2026-10-12", type: "UNIFIED_CAMPAIGN", state: "SUSPENDED", status: "ACCEPTED", strategy: "MAXIMUM_CONVERSION_RATE", budget: 18000, schedule: "Пн–Пт, 10:00–20:00", regions: "Москва, Санкт-Петербург", negativePhrases: "бесплатно, скачать apk, iOS", impressions: 267950, clicks: 1490, spend: 51480, conversions: 28 },
    ],
    vector: [
      { id: "851220146", name: "Поиск — услуги", startDate: "2026-10-03", type: "TEXT_CAMPAIGN", state: "ON", status: "ACCEPTED", strategy: "AVERAGE_CPC", budget: 56000, schedule: "Пн–Сб, 08:00–22:00", regions: "Санкт-Петербург и Ленинградская область", negativePhrases: "бесплатно, вакансии, обучение", impressions: 329400, clicks: 7950, spend: 104820, conversions: 73 },
      { id: "851220170", name: "Каталог — сезон", startDate: "2026-10-14", type: "UNIFIED_CAMPAIGN", state: "SUSPENDED", status: "MODERATION", strategy: "MAXIMUM_CONVERSION_RATE", budget: 72000, schedule: "Ежедневно, 07:00–23:00", regions: "Санкт-Петербург, Москва", negativePhrases: "оптом, б/у", impressions: 192600, clicks: 3840, spend: 86710, conversions: 39 },
    ],
  };
  const stores = Object.fromEntries(clients.map((client) => {
    const campaigns = campaignsSeed[client.id].map((item) => ({ ...item }));
    const groups = [];
    const ads = [];
    const keywords = [];
    const audiences = [];
    const modifiers = [];
    campaigns.forEach((campaign, campaignIndex) => {
      ["Основная аудитория", "Дополнительный сегмент"].forEach((suffix, groupIndex) => {
        const groupId = `${campaign.id}-g${groupIndex + 1}`;
        groups.push({ id: groupId, campaignId: campaign.id, name: `${campaign.name}: ${suffix}`, state: "ON", status: "ACCEPTED", regions: campaign.regions, negativePhrases: campaign.negativePhrases, targeting: groupIndex ? "РСЯ" : "Поиск" });
        audiences.push({ id: `${groupId}-aud`, campaignId: campaign.id, groupId, name: groupIndex ? "Возврат посетителей" : "Интерес к категории", type: groupIndex ? "RETARGETING" : "AUDIENCE", rules: groupIndex ? "Посетили сайт за 30 дней" : "Интересы: технологии и бизнес", state: "ON" });
        modifiers.push({ id: `${groupId}-mod`, campaignId: campaign.id, type: "DEVICE", target: groupIndex ? "Мобильные устройства" : "Десктопы", adjustment: groupIndex ? -20 : 15, state: "ON" });
        ads.push({ id: `${groupId}-a1`, groupId, type: "TEXT_AD", title: groupIndex ? "Решение для вашей команды" : "Цифровые решения для бизнеса", text: "Разработка и автоматизация процессов. Посмотрите демонстрационные сценарии.", href: "https://example.test/services", displayUrl: "example.test/services", sitelinks: "Услуги; Решения; Технологии", state: "ON", status: groupIndex ? "MODERATION" : "ACCEPTED" });
        ads.push({ id: `${groupId}-a2`, groupId, type: "RESPONSIVE_AD", title: "Упростите работу с сервисами", text: "Свяжите данные и сократите ручные операции. Подход под задачу бизнеса.", href: "https://example.test/automation", displayUrl: "example.test/automation", sitelinks: "Интеграции; Поддержка", state: "ON", status: "ACCEPTED" });
        const phrases = campaignIndex === 0 ? ["разработка сайта для бизнеса", "создание интернет-магазина", "заказать сайт под ключ"] : ["автоматизация продаж", "интеграция сервисов", "цифровой кабинет клиента"];
        phrases.forEach((phrase, phraseIndex) => keywords.push({ id: `${groupId}-k${phraseIndex + 1}`, groupId, phrase: groupIndex ? `${phrase} отзывы` : phrase, state: phraseIndex === 2 ? "SUSPENDED" : "ON", status: "ACCEPTED", bid: 45 + phraseIndex * 15, contextBid: 60 + phraseIndex * 20, priority: ["HIGH", "NORMAL", "LOW"][phraseIndex], targeting: "KEYWORD" }));
      });
    });
    return [client.id, { campaigns, groups, ads, keywords, audiences, modifiers }];
  }));

  const manager = $("#manager-table-wrap");
  const clientSelect = $("#manager-client");
  const search = $("#manager-search");
  const addButton = $("#manager-add");
  const countLabel = $("#manager-count");
  const empty = $("#manager-empty");
  const dialog = $("#object-dialog");
  const form = $("#object-form");
  const fieldsContainer = $("#object-editor-fields");
  let currentClient = clients[0].id;
  let currentKind = "campaigns";
  let editingId = null;
  let editingKind = null;
  let filterCampaignId = "";
  let reportPeriod = "30";

  const kindLabels = { campaigns: "Кампанию", groups: "Группу", ads: "Объявление", keywords: "Ключевую фразу", audiences: "Условие аудитории", modifiers: "Корректировку" };
  const kindNouns = { campaigns: "кампаний", groups: "групп", ads: "объявлений", keywords: "фраз", audiences: "условий аудиторий", modifiers: "корректировок" };
  const fieldsByKind = {
    campaigns: [
      ["name", "Название", "text", true], ["type", "Тип кампании", "select", true, [["TEXT_CAMPAIGN", "Текстовая"], ["UNIFIED_CAMPAIGN", "Единая перфоманс-кампания"], ["CPM_BANNER_CAMPAIGN", "Медийная"]]],
      ["strategy", "Стратегия", "select", true, [["MAXIMUM_CLICKS", "Максимум кликов"], ["MAXIMUM_CONVERSION_RATE", "Максимум конверсий"], ["AVERAGE_CPC", "Средняя цена клика"], ["AVERAGE_CPA", "Средняя цена конверсии"], ["MANUAL_CPC", "Ручное управление ставками"]]],
      ["budget", "Недельный бюджет, ₽", "number", true], ["state", "Показы", "select", true, [["ON", "Включены"], ["SUSPENDED", "Остановлены"]]],
      ["startDate", "Дата начала", "date", true], ["endDate", "Дата окончания", "date", false], ["schedule", "Расписание показов", "textarea", true], ["regions", "Регионы", "text", true], ["negativePhrases", "Минус-фразы кампании", "textarea", false], ["excludedSites", "Исключённые площадки через ;", "textarea", false],
    ],
    groups: [
      ["campaignId", "Кампания", "select-campaign", true], ["name", "Название группы", "text", true], ["targeting", "Тип трафика", "select", true, [["Поиск", "Поиск"], ["РСЯ", "Рекламная сеть Яндекса"], ["Поиск и РСЯ", "Поиск и РСЯ"]]],
      ["regions", "Регионы показа", "text", true], ["negativePhrases", "Минус-фразы группы", "textarea", false], ["deviceAdjustment", "Корректировка для устройств, %", "number", false], ["state", "Состояние", "select", true, [["ON", "Активна"], ["SUSPENDED", "Остановлена"]]],
    ],
    ads: [
      ["groupId", "Группа объявлений", "select-group", true], ["type", "Формат", "select", true, [["TEXT_AD", "Текстовое"], ["RESPONSIVE_AD", "Комбинаторное"], ["IMAGE_AD", "Графическое"], ["SHOPPING_AD", "Товарное"]]],
      ["title", "Заголовок", "text", true], ["text", "Текст объявления", "textarea", true], ["href", "Ссылка", "url", true], ["displayUrl", "Отображаемая ссылка", "text", false], ["sitelinks", "Быстрые ссылки через ;", "text", false],
      ["state", "Показы", "select", true, [["ON", "Включены"], ["SUSPENDED", "Остановлены"]]], ["status", "Модерация", "select", true, [["DRAFT", "Черновик"], ["MODERATION", "На модерации"], ["ACCEPTED", "Допущено"], ["REJECTED", "Отклонено"]]],
    ],
    keywords: [
      ["groupId", "Группа объявлений", "select-group", true], ["phrase", "Ключевая фраза / автотаргетинг", "text", true], ["targeting", "Тип условия", "select", true, [["KEYWORD", "Ключевая фраза"], ["AUTOTARGETING", "Автотаргетинг"]]],
      ["bid", "Ставка на поиске, ₽", "number", false], ["contextBid", "Ставка в сетях, ₽", "number", false], ["priority", "Приоритет", "select", true, [["LOW", "Низкий"], ["NORMAL", "Обычный"], ["HIGH", "Высокий"]]],
      ["state", "Показы", "select", true, [["ON", "Включены"], ["SUSPENDED", "Остановлены"]]],
    ],
    audiences: [
      ["campaignId", "Кампания", "select-campaign", true], ["groupId", "Группа (необязательно)", "select-group", false], ["name", "Название условия", "text", true], ["type", "Вид условия", "select", true, [["AUDIENCE", "Аудитория"], ["RETARGETING", "Ретаргетинг"]]], ["rules", "Условие / описание сегмента", "textarea", true], ["state", "Состояние", "select", true, [["ON", "Включено"], ["SUSPENDED", "Остановлено"]]],
    ],
    modifiers: [
      ["campaignId", "Кампания", "select-campaign", true], ["type", "Тип корректировки", "select", true, [["DEVICE", "Устройства"], ["DEMOGRAPHIC", "Пол и возраст"], ["AUDIENCE", "Аудитория"], ["RETARGETING", "Ретаргетинг"]]], ["target", "Сегмент", "text", true], ["adjustment", "Корректировка, %", "number", true], ["state", "Состояние", "select", true, [["ON", "Включена"], ["SUSPENDED", "Отключена"]]],
    ],
  };
  const getStore = () => stores[currentClient];
  const findName = (kind, id) => getStore()[kind].find((item) => item.id === id)?.name || id;
  const parentName = (kind, item) => kind === "groups" ? findName("campaigns", item.campaignId) : kind === "ads" || kind === "keywords" ? findName("groups", item.groupId) : "";
  const stateLabel = (state) => state === "ON" ? "Активна" : "Остановлена";
  const statusLabel = (status) => ({ ACCEPTED: "Допущено", MODERATION: "На модерации", REJECTED: "Отклонено", DRAFT: "Черновик" }[status] || status || "—");
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  const tabNames = { campaigns: "Кампании", groups: "Группы", ads: "Объявления", keywords: "Фразы и ставки", audiences: "Аудитории", modifiers: "Корректировки" };
  const setTab = (kind) => {
    currentKind = kind;
    $$('[data-manager-tab]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.managerTab === kind)));
    addButton.innerHTML = `Создать ${kindLabels[kind].toLowerCase()} <span aria-hidden="true">＋</span>`;
    search.placeholder = `Найти: ${tabNames[kind].toLowerCase()}`;
    renderManager();
  };

  const renderManager = () => {
    if (!manager) return;
    const store = getStore();
    let items = store[currentKind];
    if (filterCampaignId) {
      items = items.filter((item) => {
        if (currentKind === "campaigns") return item.id === filterCampaignId;
        if (item.campaignId) return item.campaignId === filterCampaignId;
        const group = store.groups.find((candidate) => candidate.id === item.groupId);
        return group?.campaignId === filterCampaignId;
      });
    }
    const term = search.value.trim().toLocaleLowerCase("ru");
    if (term) items = items.filter((item) => Object.values(item).some((value) => String(value).toLocaleLowerCase("ru").includes(term)) || parentName(currentKind, item).toLocaleLowerCase("ru").includes(term));
    const table = document.createElement("table");
    table.className = "campaign-table manager-table";
    const headers = {
      campaigns: ["Кампания", "Тип", "Стратегия", "Состояние", "Показы", "Клики", "CTR", "Расход", "Бюджет / неделя", ""],
      groups: ["Группа", "Кампания", "Тип трафика", "Регион", "Минус-фразы", "Состояние", ""],
      ads: ["Объявление", "Группа", "Формат", "Статус модерации", "Ссылка", "Состояние", ""],
      keywords: ["Фраза / условие", "Группа", "Тип", "Ставка: поиск", "Ставка: сети", "Приоритет", "Состояние", ""],
      audiences: ["Условие аудитории", "Кампания", "Группа", "Тип", "Сегмент / правило", "Состояние", ""],
      modifiers: ["Тип", "Кампания", "Сегмент", "Корректировка", "Состояние", ""],
    }[currentKind];
    table.innerHTML = `<thead><tr>${headers.map((name) => `<th scope="col">${escape(name)}</th>`).join("")}</tr></thead>`;
    const tbody = document.createElement("tbody");
    items.forEach((item) => {
      const row = document.createElement("tr");
      const actionButtons = `<td class="manager-row-actions"><button type="button" class="text-action" data-object-action="edit" data-id="${escape(item.id)}">Изменить</button>${currentKind === "groups" ? "" : `<button type="button" class="text-action" data-object-action="toggle" data-id="${escape(item.id)}">${item.state === "ON" ? "Остановить" : "Запустить"}</button>`}<button type="button" class="text-action danger-action" data-object-action="delete" data-id="${escape(item.id)}">Удалить</button></td>`;
      const state = `<span class="status-pill ${item.state === "ON" ? "status-active" : "status-paused"}"><i></i>${stateLabel(item.state)}</span>`;
      if (currentKind === "campaigns") {
        const ctr = item.impressions ? (item.clicks / item.impressions * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 }) : "0";
        row.innerHTML = `<th scope="row"><span class="campaign-name">${escape(item.name)}</span><small>ID ${escape(item.id)}</small></th><td><span class="campaign-type">${escape(item.type.replaceAll("_", " "))}</span></td><td>${escape(item.strategy.replaceAll("_", " "))}</td><td>${state}<small class="manager-moderation">${escape(statusLabel(item.status))}</small></td><td>${new Intl.NumberFormat("ru-RU").format(item.impressions)}</td><td>${new Intl.NumberFormat("ru-RU").format(item.clicks)}</td><td>${ctr}%</td><td class="table-cost">${money(item.spend)}</td><td>${money(item.budget)}</td>${actionButtons}`;
      } else if (currentKind === "groups") {
        row.innerHTML = `<th scope="row"><span class="campaign-name">${escape(item.name)}</span><small>ID ${escape(item.id)}</small></th><td>${escape(parentName(currentKind, item))}</td><td>${escape(item.targeting)}</td><td>${escape(item.regions)}</td><td>${escape(item.negativePhrases || "—")}</td><td>${state}</td>${actionButtons}`;
      } else if (currentKind === "ads") {
        row.innerHTML = `<th scope="row"><span class="campaign-name">${escape(item.title)}</span><small>ID ${escape(item.id)} · ${escape(item.text)}</small></th><td>${escape(parentName(currentKind, item))}</td><td>${escape(item.type.replaceAll("_", " "))}</td><td>${escape(statusLabel(item.status))}</td><td><a href="${escape(item.href)}" target="_blank" rel="noopener">${escape(item.displayUrl || item.href)}</a></td><td>${state}</td>${actionButtons}`;
      } else if (currentKind === "keywords") {
        row.innerHTML = `<th scope="row"><span class="campaign-name">${escape(item.phrase)}</span><small>ID ${escape(item.id)}</small></th><td>${escape(parentName(currentKind, item))}</td><td>${item.targeting === "AUTOTARGETING" ? "Автотаргетинг" : "Ключевая фраза"}</td><td>${money(item.bid)}</td><td>${money(item.contextBid)}</td><td>${escape(item.priority)}</td><td>${state}</td>${actionButtons}`;
      } else if (currentKind === "audiences") {
        row.innerHTML = `<th scope="row"><span class="campaign-name">${escape(item.name)}</span><small>ID ${escape(item.id)}</small></th><td>${escape(findName("campaigns", item.campaignId))}</td><td>${escape(item.groupId ? findName("groups", item.groupId) : "Вся кампания")}</td><td>${item.type === "RETARGETING" ? "Ретаргетинг" : "Аудитория"}</td><td>${escape(item.rules)}</td><td>${state}</td>${actionButtons}`;
      } else {
        row.innerHTML = `<th scope="row"><span class="campaign-name">${item.type === "DEVICE" ? "Устройства" : item.type === "DEMOGRAPHIC" ? "Пол и возраст" : escape(item.type)}</span><small>ID ${escape(item.id)}</small></th><td>${escape(findName("campaigns", item.campaignId))}</td><td>${escape(item.target)}</td><td>${Number(item.adjustment) > 0 ? "+" : ""}${Number(item.adjustment)}%</td><td>${state}</td>${actionButtons}`;
      }
      tbody.append(row);
    });
    table.append(tbody);
    manager.replaceChildren(table);
    empty.hidden = items.length > 0;
    countLabel.textContent = `${items.length} ${kindNouns[currentKind]}`;
  };

  const makeField = (definition, item) => {
    const [key, label, type, required, options] = definition;
    const wrap = document.createElement("label");
    wrap.className = "object-field";
    wrap.htmlFor = `object-field-${key}`;
    wrap.append(document.createTextNode(label));
    let input;
    if (type.startsWith("select")) {
      input = document.createElement("select");
      let choices = options || [];
      if (type === "select-campaign") choices = getStore().campaigns.map((campaign) => [campaign.id, campaign.name]);
      if (type === "select-group") choices = getStore().groups.map((group) => [group.id, group.name]);
      choices.forEach(([value, text]) => { const option = document.createElement("option"); option.value = value; option.textContent = text; input.append(option); });
    } else if (type === "textarea") input = document.createElement("textarea");
    else { input = document.createElement("input"); input.type = type; }
    input.id = `object-field-${key}`;
    input.name = key;
    input.value = item?.[key] ?? (key === "budget" ? 30000 : ["bid", "contextBid"].includes(key) ? 50 : "");
    if (required) input.required = true;
    if (type === "number") { input.min = key === "budget" ? "1000" : ["adjustment", "deviceAdjustment"].includes(key) ? "-100" : "0"; input.step = "1"; }
    if (key === "startDate" && !input.value) input.value = new Date().toISOString().slice(0, 10);
    if (key === "href") input.placeholder = "https://example.test/page";
    wrap.append(input);
    fieldsContainer.append(wrap);
  };

  const openEditor = (kind, id = null) => {
    editingKind = kind;
    editingId = id;
    const item = id ? getStore()[kind].find((record) => record.id === id) : null;
    $("#object-dialog-title").textContent = item ? `Изменить: ${kindLabels[kind].toLowerCase()}` : `Создать: ${kindLabels[kind].toLowerCase()}`;
    $("#object-dialog-kind").textContent = tabNames[kind];
    fieldsContainer.replaceChildren();
    fieldsByKind[kind].forEach((definition) => makeField(definition, item));
    dialog.showModal();
  };

  const deleteObject = (kind, id) => {
    const store = getStore();
    const target = store[kind].find((item) => item.id === id);
    if (!target || !window.confirm(`Удалить «${target.name || target.title || target.phrase || target.target}» из демо?`)) return;
    if (kind === "campaigns") {
      const groupIds = store.groups.filter((group) => group.campaignId === id).map((group) => group.id);
      store.groups = store.groups.filter((group) => group.campaignId !== id);
      store.ads = store.ads.filter((ad) => !groupIds.includes(ad.groupId));
      store.keywords = store.keywords.filter((keyword) => !groupIds.includes(keyword.groupId));
      store.audiences = store.audiences.filter((audience) => audience.campaignId !== id);
      store.modifiers = store.modifiers.filter((modifier) => modifier.campaignId !== id);
    } else if (kind === "groups") {
      store.ads = store.ads.filter((ad) => ad.groupId !== id);
      store.keywords = store.keywords.filter((keyword) => keyword.groupId !== id);
      store.audiences = store.audiences.filter((audience) => audience.groupId !== id);
    }
    store[kind] = store[kind].filter((item) => item.id !== id);
    populateSettingsCampaigns();
    renderManager();
    renderAccountSummary();
    notify("Объект удалён только из демонстрационных данных.");
  };

  clients.forEach((client) => { const option = document.createElement("option"); option.value = client.id; option.textContent = client.name; clientSelect.append(option); });
  const settingsCampaign = $("#settings-campaign");
  const renderCampaignSettings = () => {
    const campaign = getStore().campaigns.find((item) => item.id === settingsCampaign?.value) || getStore().campaigns[0];
    if (!campaign) return;
    [["strategy", campaign.strategy.replaceAll("_", " ")], ["budget", money(campaign.budget)], ["spend", money(campaign.spend)], ["schedule", campaign.schedule], ["regions", campaign.regions], ["negatives", campaign.negativePhrases]].forEach(([key, value]) => {
      const target = $(`[data-setting="${key}"]`);
      if (target) target.textContent = value || "—";
    });
  };
  const populateSettingsCampaigns = () => {
    if (!settingsCampaign) return;
    const old = settingsCampaign.value;
    settingsCampaign.replaceChildren();
    getStore().campaigns.forEach((campaign) => {
      const option = document.createElement("option"); option.value = campaign.id; option.textContent = campaign.name; settingsCampaign.append(option);
    });
    settingsCampaign.value = getStore().campaigns.some((item) => item.id === old) ? old : (getStore().campaigns[0]?.id || "");
    renderCampaignSettings();
  };
  clientSelect.addEventListener("change", () => {
    currentClient = clientSelect.value;
    filterCampaignId = "";
    populateSettingsCampaigns();
    const companyLabel = clients.find((item) => item.id === currentClient)?.name || "Демо-компания";
    const balanceCaption = $(".balance-caption");
    if (balanceCaption) balanceCaption.innerHTML = `Демо-счёт<br />${escape(companyLabel)}`;
    const balanceAmount = $(".balance-amount");
    if (balanceAmount) balanceAmount.innerHTML = `${new Intl.NumberFormat("ru-RU").format(clients.find((item) => item.id === currentClient)?.balance || 0)}<span> ₽</span>`;
    renderManager();
    renderAccountSummary();
  });
  settingsCampaign?.addEventListener("change", renderCampaignSettings);
  $("[data-settings-open]")?.addEventListener("click", () => {
    const id = settingsCampaign?.value;
    if (id) openEditor("campaigns", id);
  });
  $$('[data-manager-tab]').forEach((button) => button.addEventListener("click", () => setTab(button.dataset.managerTab)));
  search.addEventListener("input", renderManager);
  addButton.addEventListener("click", () => openEditor(currentKind));
  manager.addEventListener("click", (event) => {
    const button = event.target.closest("[data-object-action]");
    if (!button) return;
    if (button.dataset.objectAction === "edit") openEditor(currentKind, button.dataset.id);
    if (button.dataset.objectAction === "delete") deleteObject(currentKind, button.dataset.id);
    if (button.dataset.objectAction === "toggle") {
      const item = getStore()[currentKind].find((record) => record.id === button.dataset.id);
      if (item) {
        item.state = item.state === "ON" ? "SUSPENDED" : "ON";
        renderManager();
        notify(`${kindLabels[currentKind]}: показы ${item.state === "ON" ? "запущены" : "остановлены"} в демо.`);
      }
    }
  });
  $$("[data-object-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const store = getStore();
    const values = Object.fromEntries(new FormData(form).entries());
    fieldsByKind[editingKind].forEach(([key, , type]) => {
      if (type === "number") values[key] = Number(values[key] || 0);
      if (typeof values[key] === "string") values[key] = values[key].trim();
    });
    const idField = { campaigns: "name", groups: "name", ads: "title", keywords: "phrase", audiences: "name", modifiers: "target" }[editingKind];
    if (!values[idField]) return;
    if (values.href && !/^https?:\/\//i.test(values.href)) { $("#object-field-href").setCustomValidity("Укажите ссылку с http:// или https://"); $("#object-field-href").reportValidity(); return; }
    if (editingId) Object.assign(store[editingKind].find((item) => item.id === editingId), values);
    else {
      const prefix = { campaigns: "cmp", groups: "grp", ads: "ad", keywords: "kw", audiences: "aud", modifiers: "mod" }[editingKind];
      const id = `${prefix}-${Date.now().toString().slice(-7)}-${Math.floor(Math.random() * 90 + 10)}`;
      const extra = editingKind === "campaigns" ? { status: "DRAFT", impressions: 0, clicks: 0, spend: 0, conversions: 0 } : editingKind === "ads" ? { status: "DRAFT" } : editingKind === "keywords" ? { status: "ACCEPTED" } : { status: "DRAFT" };
      store[editingKind].push({ id, state: "ON", ...extra, ...values });
    }
    dialog.close();
    populateSettingsCampaigns();
    renderManager();
    renderAccountSummary();
    renderCampaignSettings();
    notify(editingId ? "Параметры мок-объекта обновлены." : "Мок-объект создан.");
  });

  // Report period controls swap only demo snapshots; spend remains report data, not an editable field.
  const periodButtons = $$('[data-period]');
  const chart = $(".spend-chart");
  const renderAccountSummary = () => {
    const campaigns = getStore().campaigns;
    const scale = reportPeriod === "7" ? 0.23 : 1;
    const totals = campaigns.reduce((sum, campaign) => ({
      impressions: sum.impressions + campaign.impressions,
      clicks: sum.clicks + campaign.clicks,
      spend: sum.spend + campaign.spend,
      conversions: sum.conversions + campaign.conversions,
    }), { impressions: 0, clicks: 0, spend: 0, conversions: 0 });
    const values = [money(Math.round(totals.spend * scale)), new Intl.NumberFormat("ru-RU").format(Math.round(totals.impressions * scale)), new Intl.NumberFormat("ru-RU").format(Math.round(totals.clicks * scale)), new Intl.NumberFormat("ru-RU").format(Math.round(totals.conversions * scale))];
    $$(".metric-value").forEach((node, index) => { if (values[index]) node.textContent = values[index]; });
    const total = $("[data-chart-total]"); if (total) total.textContent = values[0];
    const byType = campaigns.reduce((sum, campaign) => { sum[campaign.type] = (sum[campaign.type] || 0) + campaign.spend; return sum; }, {});
    const typeNames = { TEXT_CAMPAIGN: "Текстовая кампания", UNIFIED_CAMPAIGN: "Единая перфоманс-кампания", CPM_BANNER_CAMPAIGN: "Медийная кампания" };
    const typeRows = $$(".type-row");
    const types = ["TEXT_CAMPAIGN", "UNIFIED_CAMPAIGN", "CPM_BANNER_CAMPAIGN"];
    types.forEach((type, index) => {
      const row = typeRows[index]; if (!row) return;
      const amount = byType[type] || 0;
      const label = $("span", row); if (label) label.textContent = typeNames[type];
      const value = $("strong", row); if (value) value.textContent = money(Math.round(amount * scale));
      const bar = $(".type-track i", row); if (bar) bar.style.setProperty("--bar-width", `${totals.spend ? amount / totals.spend * 100 : 0}%`);
    });
    const typeTotal = $(".type-total strong"); if (typeTotal) typeTotal.textContent = values[0];
  };
  const renderChart = (period) => {
    if (!chart) return;
    const source = chart.dataset[period === "7" ? "valuesSeven" : "valuesThirty"] || "";
    const bars = $(".chart-bars", chart);
    if (bars) {
      bars.replaceChildren();
      source.split(",").forEach((value, index) => {
        const bar = document.createElement("span"); bar.className = "chart-bar"; bar.style.height = `${Number(value)}%`; bar.title = `Интервал ${index + 1}: мок-расход`; bars.append(bar);
      });
    }
    const labels = period === "7" ? ["09.11", "12.11", "15.11"] : ["17.10", "01.11", "15.11"];
    ["[data-axis-start]", "[data-axis-middle]", "[data-axis-end]"].forEach((selector, index) => { const node = $(selector, chart); if (node) node.textContent = labels[index]; });
    const total = $("[data-chart-total]"); if (total) total.innerHTML = period === "7" ? "87&nbsp;120&nbsp;₽" : "352&nbsp;480&nbsp;₽";
    const label = $("[data-chart-period]"); if (label) label.textContent = `${period} дней`;
    const caption = $(".panel-caption"); if (caption) caption.textContent = `За ${period} дней`;
  };
  periodButtons.forEach((button) => button.addEventListener("click", () => {
    const period = button.dataset.period;
    reportPeriod = period;
    periodButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    const tablePeriod = $("[data-table-period]"); if (tablePeriod) tablePeriod.textContent = `${period} дней`;
    renderChart(period);
    renderAccountSummary();
  }));
  $$('[data-toast]').forEach((button) => button.addEventListener("click", () => notify(button.dataset.toast)));
  populateSettingsCampaigns();
  renderManager();
  renderAccountSummary();
})();

