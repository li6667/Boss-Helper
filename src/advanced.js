const DEFAULT_SETTINGS = {
  salaryKeywords: "",
  companyKeywords: "",
  greetTemplate: "您好，我对{jobTitle}岗位很感兴趣，已认真阅读职位描述，期待进一步沟通。",
  autoGreet: true,
  autoNext: true,
  pollIntervalMs: 1800
};

const elements = {
  salaryKeywords: document.getElementById("salaryKeywords"),
  companyKeywords: document.getElementById("companyKeywords"),
  greetTemplate: document.getElementById("greetTemplate"),
  pollIntervalMs: document.getElementById("pollIntervalMs"),
  autoGreet: document.getElementById("autoGreet"),
  autoNext: document.getElementById("autoNext"),
  saveStatus: document.getElementById("saveStatus"),
  closeButton: document.getElementById("closeButton")
};

void bootstrap();

async function bootstrap() {
  const response = await chrome.runtime.sendMessage({
    type: "boss-helper:get-settings"
  });

  const settings = {
    ...DEFAULT_SETTINGS,
    ...(response?.settings ?? {})
  };

  hydrate(settings);
  bindEvents();
}

function hydrate(settings) {
  elements.salaryKeywords.value = settings.salaryKeywords || "";
  elements.companyKeywords.value = settings.companyKeywords || "";
  elements.greetTemplate.value = settings.greetTemplate || DEFAULT_SETTINGS.greetTemplate;
  elements.pollIntervalMs.value = String(settings.pollIntervalMs || DEFAULT_SETTINGS.pollIntervalMs);
  elements.autoGreet.checked = Boolean(settings.autoGreet);
  elements.autoNext.checked = Boolean(settings.autoNext);
}

function bindEvents() {
  for (const key of ["salaryKeywords", "companyKeywords", "greetTemplate", "pollIntervalMs", "autoGreet", "autoNext"]) {
    const element = elements[key];
    const eventName = element.type === "checkbox" ? "change" : "input";
    element.addEventListener(eventName, () => {
      void saveSettings();
    });
  }

  elements.closeButton.addEventListener("click", () => {
    window.close();
  });
}

async function saveSettings() {
  const payload = {
    salaryKeywords: elements.salaryKeywords.value.trim(),
    companyKeywords: elements.companyKeywords.value.trim(),
    greetTemplate: elements.greetTemplate.value.trim() || DEFAULT_SETTINGS.greetTemplate,
    pollIntervalMs: clampNumber(Number(elements.pollIntervalMs.value), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs),
    autoGreet: elements.autoGreet.checked,
    autoNext: elements.autoNext.checked
  };

  try {
    await chrome.runtime.sendMessage({
      type: "boss-helper:save-settings",
      payload
    });
    elements.saveStatus.textContent = `已保存 ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    elements.saveStatus.textContent = error instanceof Error ? error.message : String(error);
  }
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}
