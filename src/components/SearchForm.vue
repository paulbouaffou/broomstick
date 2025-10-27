<!--
  Broomstick - Search Form
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="search-form">
    <cdx-field
      class="language-type-field"
      :status="languageError ? 'error' : 'default'"
    >
      <template #label>Lexeme language</template>
      <cdx-combobox
        v-model:selected="selectedLanguageValue"
        :menu-items="filteredLanguageOptions"
        placeholder="Choose a language"
        @input="onLanguageInput"
        @blur="onLanguageBlur"
        @focus="onLanguageFocus"
      />
    </cdx-field>
    <div v-if="languageError" class="error-message">
      <cdx-icon :icon="cdxIconError" size="small" />
      {{ languageError }}
    </div>

    <cdx-field
      class="gap-type-field"
      :status="gapTypeError ? 'error' : 'default'"
    >
      <template #label>Find Lexeme that</template>
      <cdx-combobox
        v-model:selected="selectedGapTypeValue"
        :menu-items="filteredGapTypeOptions"
        placeholder="Choose an option"
        @input="onGapTypeInput"
        @blur="onGapTypeBlur"
        @focus="onGapTypeFocus"
      />
    </cdx-field>
    <div v-if="gapTypeError" class="error-message">
      <cdx-icon :icon="cdxIconError" size="small" />
      {{ gapTypeError }}
    </div>

    <cdx-button
      action="progressive"
      weight="primary"
      type="button"
      :disabled="isSearchDisabled"
      @click="handleSearch"
      class="search-button"
    >
      <cdx-icon :icon="cdxIconSearch" />
      Search
    </cdx-button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { CdxField, CdxCombobox, CdxButton, CdxIcon } from "@wikimedia/codex";
import { cdxIconSearch, cdxIconError } from "@wikimedia/codex-icons";
import { LANGUAGES } from "../data/languages.js";
import {
  getQueryOptionsForLanguage,
  getAllQueryValues,
} from "../data/queries.js";

const props = defineProps({
  language: {
    type: String,
    default: "English (en)",
  },
  gapType: {
    type: String,
    default: "is empty",
  },

  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:language", "update:gapType", "search"]);

const languageOptions = LANGUAGES.map((lang) => ({
  value: lang.display,
  label: lang.display,
}));

const gapTypeOptions = computed(() => {
  return getQueryOptionsForLanguage(props.language);
});

const languageSearchTerm = ref("");
const gapTypeSearchTerm = ref("");
const languageBlurred = ref(false);
const gapTypeBlurred = ref(false);

const filteredLanguageOptions = computed(() => {
  if (!languageSearchTerm.value) return languageOptions;
  const search = languageSearchTerm.value.toLowerCase();
  return languageOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search)
  );
});

const filteredGapTypeOptions = computed(() => {
  if (!gapTypeSearchTerm.value) return gapTypeOptions.value;
  const search = gapTypeSearchTerm.value.toLowerCase();

  return gapTypeOptions.value
    .map((group) => ({
      label: group.label,
      items: group.items.filter((opt) =>
        opt.label.toLowerCase().includes(search)
      ),
    }))
    .filter((group) => group.items.length > 0);
});

const selectedLanguageValue = computed({
  get() {
    return props.language;
  },
  set(value) {
    emit("update:language", value);
  },
});

const selectedGapTypeValue = computed({
  get() {
    return props.gapType;
  },
  set(value) {
    emit("update:gapType", value);
  },
});

const languageError = computed(() => {
  if (!languageBlurred.value) return "";
  if (!props.language) return "";

  const validValues = languageOptions.map((opt) => opt.value);
  if (!validValues.includes(props.language)) {
    return "Language not found. Try choosing another language.";
  }
  return "";
});

const gapTypeError = computed(() => {
  if (!gapTypeBlurred.value) return "";
  if (!props.gapType) return "";

  const validValues = getAllQueryValues();
  if (!validValues.includes(props.gapType)) {
    return "Query type not found. Try choosing another query.";
  }
  return "";
});

const isSearchDisabled = computed(() => {
  if (!props.language || !props.gapType) return true;
  if (props.disabled) return true;
  console.log("disabled prop:", props.disabled);

  const validLanguages = languageOptions.map((opt) => opt.value);
  const validGapTypes = getAllQueryValues();

  if (!validLanguages.includes(props.language)) return true;
  if (!validGapTypes.includes(props.gapType)) return true;

  return false;
});

function onLanguageInput(event) {
  languageSearchTerm.value = event.target.value;
  // clear blur flag when user starts typing again
  if (languageBlurred.value && event.target.value === "") {
    languageBlurred.value = false;
  }
}

function onGapTypeInput(event) {
  gapTypeSearchTerm.value = event.target.value;
  // clear blur flag when user starts typing again
  if (gapTypeBlurred.value && event.target.value === "") {
    gapTypeBlurred.value = false;
  }
}

function onLanguageBlur() {
  languageBlurred.value = true;
}

function onGapTypeBlur() {
  gapTypeBlurred.value = true;
}

function onLanguageFocus() {
  // clear search term if there's an error, allowing dropdown to work
  if (languageError.value && languageSearchTerm.value) {
    languageSearchTerm.value = "";
  }
  languageBlurred.value = false;
}

function onGapTypeFocus() {
  // clear search term if there's an error, allowing dropdown to work
  if (gapTypeError.value && gapTypeSearchTerm.value) {
    gapTypeSearchTerm.value = "";
  }
  gapTypeBlurred.value = false;
}

function handleSearch() {
  languageBlurred.value = true;
  gapTypeBlurred.value = true;

  if (!languageError.value && !gapTypeError.value) {
    emit("search");
  }
}
</script>

<style scoped>
.search-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-75);
  width: 100%;
}

.search-button {
  width: 100%;
  min-width: 0; /* CRITICAL - allows it to shrink below codex defaults */
  max-width: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-50);
}

@media (min-width: 640px) {
  .search-button {
    width: 100%;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-25);
  color: var(--color-error);
  font-size: var(--font-size-medium);
  font-weight: 700 !important;
  margin-top: calc(var(--spacing-100) * -1);
}

.error-message :deep(.cdx-icon) {
  color: var(--color-error);
}

:deep(.cdx-field) {
  width: 100%;
  min-width: 0;
}

:deep(.cdx-combobox) {
  width: 100%;
  min-width: 0;
}

:deep(.cdx-text-input) {
  width: 100%;
  min-width: 0;
}

:deep(.cdx-text-input__input) {
  width: 100%;
  min-width: 0;
}

:deep(.language-type-field) {
  margin-top: 0;
}
:deep(.gap-type-field) {
  margin-top: 0;
}
:deep(.cdx-field--status-error .cdx-text-input__input) {
  background-color: var(--background-color-error-subtle);
}
</style>
