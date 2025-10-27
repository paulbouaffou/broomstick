<!--
  Broomstick - Main App Component
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="app">
    <AppHeader @home="currentView = 'landing'" />

    <main class="main-content">
      <div v-if="currentView === 'landing'" class="landing-view">
        <div class="body-frame">
          <section class="section-text">
            <h1>Uncover Lexemes that can be improved on Wikidata</h1>
            <p class="subtitle">Select a Lexeme language and query to begin.</p>
          </section>

          <section class="section-form">
            <div class="landing-search-panel">
              <SearchForm
                v-model:language="selectedLanguage"
                v-model:gapType="selectedGapType"
                :disabled="isLoading"
                @search="executeSearch"
              />
            </div>
          </section>
        </div>
      </div>

      <div v-else-if="currentView === 'search'" class="search-view">
        <div class="search-content">
          <div class="header-row">
            <CdxButton
              v-show="isPanelCollapsed"
              @click="isPanelCollapsed = false"
              class="expand-button"
            >
              <CdxIcon :icon="cdxIconExpand" />
              Show search panel
            </CdxButton>
            <h1>{{ searchedLanguage }}, {{ searchedGapType }}</h1>
          </div>

          <div class="search-layout">
            <div v-show="!isPanelCollapsed" class="results-search-panel">
              <div class="search-header">
                <h3 class="search-heading">Search</h3>
                <CdxButton
                  @click="isPanelCollapsed = true"
                  class="collapse-button"
                  aria-label="Hide panel"
                >
                  <CdxIcon :icon="cdxIconCollapse" />
                </CdxButton>
              </div>
              <SearchForm
                v-model:language="selectedLanguage"
                v-model:gapType="selectedGapType"
                :disabled="isLoading"
                @search="executeSearch"
              />
            </div>

            <div class="results-area">
              <div v-if="isLoading" class="loading-state">
                <h3>Querying Wikidata...</h3>
                <CdxProgressBar aria-label="Querying Wikidata" />
              </div>

              <CdxMessage v-else-if="error" type="error">
                {{ error }}
              </CdxMessage>

              <div v-else>
                <ResultsTable :results="results" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  CdxButton,
  CdxIcon,
  CdxProgressBar,
  CdxMessage,
} from "@wikimedia/codex";
import { cdxIconCollapse, cdxIconExpand } from "@wikimedia/codex-icons";
import AppHeader from "./components/AppHeader.vue";
import SearchForm from "./components/SearchForm.vue";
import ResultsTable from "./components/ResultsTable.vue";
import AppFooter from "./components/AppFooter.vue";
import { getLanguageQid } from "./data/languages.js";
import { getQuerySparql } from "./data/queries.js";

const currentView = ref("landing");
const isPanelCollapsed = ref(false);

const selectedLanguage = ref("English (en)");
const selectedGapType = ref("is empty");
const searchedLanguage = ref("English (en)");
const searchedGapType = ref("is empty");

const isLoading = ref(false);
const error = ref(null);
const results = ref([]);

// save to localStorage whenever search executes
function saveLastSearch() {
  localStorage.setItem("broomstick_last_language", selectedLanguage.value);
  localStorage.setItem("broomstick_last_query", selectedGapType.value);
}

// restore from localStorage on mount
function restoreLastSearch() {
  const savedLanguage = localStorage.getItem("broomstick_last_language");
  const savedQuery = localStorage.getItem("broomstick_last_query");

  if (savedLanguage) selectedLanguage.value = savedLanguage;
  if (savedQuery) selectedGapType.value = savedQuery;
}

// call restore on mount
onMounted(() => {
  restoreLastSearch();
});

async function executeSearch() {
  const languageQid = getLanguageQid(selectedLanguage.value);
  const querySparql = getQuerySparql(selectedGapType.value, languageQid);

  if (!languageQid) {
    error.value = "Language not found. Try choosing another language.";
    return;
  }

  if (!querySparql) {
    error.value = "Query type not found. Try choosing another query.";
    return;
  }

  searchedLanguage.value = selectedLanguage.value;
  searchedGapType.value = selectedGapType.value;
  saveLastSearch();

  error.value = null;
  isLoading.value = true;
  currentView.value = "search";
  isPanelCollapsed.value = window.innerWidth < 640;
  results.value = [];

  try {
    const response = await fetch("https://query.wikidata.org/sparql", {
      method: "POST",
      headers: {
        Accept: "application/sparql-results+json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `query=${encodeURIComponent(querySparql)}`,
    });

    if (!response.ok) {
      throw new Error("Query failed");
    }

    const data = await response.json();

    const lexemeMap = new Map();

    data.results.bindings.forEach((binding) => {
      const lexemeId = binding.lexeme.value.split("/").pop();
      const lemma = binding.lemma.value;
      const categoryLabel = binding.lexicalCategoryLabel?.value || "";
      const categoryQid = binding.lexicalCategory?.value.split("/").pop() || "";
      const lexicalCategory = categoryQid
        ? `${categoryLabel} (${categoryQid})`
        : categoryLabel;

      if (lexemeMap.has(lexemeId)) {
        const existing = lexemeMap.get(lexemeId);
        if (!existing.lemmas.includes(lemma)) {
          existing.lemmas.push(lemma);
        }
      } else {
        lexemeMap.set(lexemeId, {
          lexemeId: lexemeId,
          lemmas: [lemma],
          lexicalCategory: lexicalCategory,
        });
      }
    });

    results.value = Array.from(lexemeMap.values()).map((item) => ({
      lexemeId: item.lexemeId,
      lemma: item.lemmas.join(" / "),
      lexicalCategory: item.lexicalCategory,
    }));
  } catch (err) {
    console.error("Query error:", err);
    error.value = "An error occurred while querying Wikidata.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color-base);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* MOBILE FIRST */
.landing-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-100);
  flex: 1;
}

.body-frame {
  width: 100%;
  max-width: calc(100vw - 2 * var(--spacing-100)); 
  display: flex;
  flex-direction: column; /* stack vertically on mobile */
  gap: var(--spacing-100); 
}

.section-text {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-form {
  width: 100%;
}

.landing-view h1 {
  font-family: var(--font-family-serif);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.25;
  color: var(--color-emphasized);
  margin: 0 0 var(--spacing-50) 0;
}

.subtitle {
  color: var(--color-subtle);
  margin: 0;
}

.landing-search-panel {
  width: 100%;
  box-sizing: border-box; /* includes padding/border in width */
  background-color: var(--background-color-interactive);
  border: 0.0625rem solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-75);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}

/* DESKTOP (≥640px) */
@media (min-width: 640px) {
  .landing-view {
    padding: var(--spacing-200); 
  }

  .body-frame {
    max-width: 56rem; 
    flex-direction: row; /* side-by-side */
    gap: var(--spacing-150); 
  }

  .section-text {
    width: 30rem; 
  }

  .section-form {
    width: 24rem; 
  }

}

/* SEARCH VIEW - MOBILE FIRST */
.search-view {
  padding: var(--spacing-100); 
  flex: 1;
}

.search-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
}

.header-row {
  display: flex;
  flex-direction: column-reverse; /* stack on mobile */
  align-items: flex-start; /* align to left */
  gap: var(--spacing-100);
}

/* DESKTOP */
@media (min-width: 640px) {
  .header-row {
    flex-direction: row;
    align-items: center;
  }

  .header-row h1 {
    flex: 1; /* h1 takes remaining space */
  }
}

.search-content h1 {
  color: var(--color-emphasized);
  font-family: var(--font-family-serif);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.25;
  margin: 0;
  width: 100%; /* full width on mobile */
}

.search-layout {
  width: 100%;
  display: flex;
  flex-direction: column; /* stack on mobile */
  align-items: flex-start;
  gap: var(--spacing-100);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-75);
}

.search-heading {
  margin: 0;
  color: var(--color-emphasized);
  font-weight: 700;
}

/* search results page search panel */
.results-search-panel {
  width: 100%;
  background-color: var(--background-color-interactive);
  border: 0.0625rem solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-75);
}

.results-search-panel :deep(.cdx-field) {
  margin-bottom: 0;
}

.results-area {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.loading-state {
  padding: var(--spacing-100);
  border: 0.0625rem solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  width: 100%;
}

.loading-state h3 {
  margin: 0 0 var(--spacing-100) 0;
  color: var(--color-emphasized);
  text-align: center;
}

.loading-state :deep(.cdx-progress-bar__bar) {
  background-color: var(--background-color-progressive) !important;
}

@media (min-width: 640px) {
  .loading-state :deep(.cdx-progress-bar) {
    max-width: 32rem;
    margin: 0 auto;
  }
}

.collapse-button {
  width: var(--size-200);
  height: var(--size-200);
}

.collapse-button,
.expand-button {
  background-color: var(--background-color-interactive-subtle) !important;
  border: 1px solid var(--border-color-interactive) !important;
}

.expand-button {
  width: 100% !important;
  max-width: none !important;
  font-size: var(--font-size-medium);
  line-height: var(--line-height-small);
  font-weight: 700;
}

@media (min-width: 640px) {
  .expand-button {
    width: auto !important;
    max-width: none !important;
    white-space: nowrap !important;
    padding: var(--spacing-25) var(--spacing-75) !important;
    flex-shrink: 0;
  }
}

/* SEARCH VIEW - DESKTOP */
@media (min-width: 640px) {
  .search-view {
    padding: var(--spacing-200); /* 32px on desktop */
  }

  .search-layout {
    flex-direction: row; /* side-by-side on desktop */
    gap: var(--spacing-150); /* 24px gutter */
    min-height: 25.5rem;
  }

  .results-search-panel {
    width: 24rem;
    max-width: 24rem;
  }
}
</style>
