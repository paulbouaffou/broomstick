<!--
  Broomstick - AccountMenu settings 
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="settings-menu">
    <cdx-menu-button
      v-model:selected="selectedItem"
      :menu-items="menuItems"
      aria-label="settings"
    >
      <template #default>
        <cdx-icon :icon="cdxIconMenu" />
      </template>
    </cdx-menu-button>

    <!-- theme dialog -->
    <cdx-dialog
      v-model:open="showThemeDialog"
      title="Theme"
      :use-close-button="true"
      :primary-action="{
        label: 'Apply',
        actionType: 'progressive',
      }"
      :default-action="{
        label: 'Cancel',
      }"
      @primary="saveTheme"
      @default="showThemeDialog = false"
    >
      <div class="dialog-content">
        <cdx-field>
          <cdx-radio v-model="tempTheme" name="theme" input-value="auto">
            <template #default> Automatic </template>
            <template #description>
              <span class="radio-description">Follow your browser theme</span>
            </template>
          </cdx-radio>
          <cdx-radio v-model="tempTheme" name="theme" input-value="light">
            Light
          </cdx-radio>
          <cdx-radio v-model="tempTheme" name="theme" input-value="dark">
            Dark
          </cdx-radio>
        </cdx-field>
      </div>
    </cdx-dialog>

    <!-- display language dialog -->
    <cdx-dialog
      v-model:open="showLanguageDialog"
      title="Display language"
      :use-close-button="true"
      :primary-action="{
        label: 'Apply',
        actionType: 'progressive',
      }"
      :default-action="{
        label: 'Cancel',
      }"
      @primary="saveLanguage"
      @default="showLanguageDialog = false"
    >
      <div class="dialog-content">
        <cdx-field>
          <cdx-radio v-model="tempLanguage" name="language" input-value="en">
            English
          </cdx-radio>
          <!-- 
          <cdx-radio
            v-model="tempLanguage"
            name="language"
            input-value="id"
          >
            Indonesian
          </cdx-radio>
          -->
        </cdx-field>
      </div>
    </cdx-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  CdxMenuButton,
  CdxDialog,
  CdxField,
  CdxRadio,
  CdxIcon,
} from "@wikimedia/codex";
import {
  cdxIconMenu,
  cdxIconBright,
  cdxIconMoon,
  cdxIconLanguage,
} from "@wikimedia/codex-icons";

const selectedItem = ref(null);
const currentTheme = ref("auto");
const currentLanguage = ref("en");

const tempTheme = ref("auto");
const tempLanguage = ref("en");

const showThemeDialog = ref(false);
const showLanguageDialog = ref(false);

const themeLabel = computed(() => {
  const labels = {
    auto: "Automatic",
    light: "Light",
    dark: "Dark",
  };
  return labels[currentTheme.value];
});

const languageLabel = computed(() => {
  const labels = {
    en: "English",
    id: "Indonesian",
  };
  return labels[currentLanguage.value];
});

const effectiveTheme = computed(() => {
  if (currentTheme.value !== "auto") return currentTheme.value;
  return systemTheme.value;
});

const menuItems = computed(() => [
  {
    value: "theme",
    label: "Theme",
    description: themeLabel.value,
    icon: effectiveTheme.value === "dark" ? cdxIconMoon : cdxIconBright,
  },
  {
    value: "language",
    label: "Display language",
    description: languageLabel.value,
    icon: cdxIconLanguage,
  },
]);

watch(selectedItem, (newValue) => {
  if (newValue === "theme") {
    tempTheme.value = currentTheme.value;
    showThemeDialog.value = true;
    selectedItem.value = null;
  } else if (newValue === "language") {
    tempLanguage.value = currentLanguage.value;
    showLanguageDialog.value = true;
    selectedItem.value = null;
  }
});

function saveTheme() {
  currentTheme.value = tempTheme.value;
  showThemeDialog.value = false;

  // save to localStorage
  localStorage.setItem("theme", tempTheme.value);

  // apply theme to html element
  applyTheme(tempTheme.value);
}

function restoreTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    currentTheme.value = savedTheme;
    applyTheme(savedTheme);
  } else {
    // default to auto if nothing saved
    currentTheme.value = "auto";
  }
}

const systemTheme = ref(
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
);

onMounted(() => {
  restoreTheme();

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkModeQuery.addEventListener("change", (e) => {
    systemTheme.value = e.matches ? "dark" : "light"; // update reactive value
    if (currentTheme.value === "auto") {
      applyTheme("auto");
    }
  });
});

function applyTheme(theme) {
  const html = document.documentElement;

  if (theme === "dark") {
    html.classList.remove("light");
    html.classList.add("dark");
  } else if (theme === "light") {
    html.classList.remove("dark");
    html.classList.add("light");
  } else {
    // auto
    html.classList.remove("dark", "light");
    // check system preference and apply it
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      html.classList.add("dark");
    }
  }
}

function saveLanguage() {
  currentLanguage.value = tempLanguage.value;
  showLanguageDialog.value = false;
  // apply selected language later on
}
</script>

<style scoped>
.settings-menu {
  display: flex;
  align-items: center;
}

.dialog-content {
  color: var(--color-base);
}

.radio-description {
  color: var(--color-subtle);
}

:deep(.cdx-label__label__text) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Lato,
    Helvetica, Arial, sans-serif !important;
}
</style>
