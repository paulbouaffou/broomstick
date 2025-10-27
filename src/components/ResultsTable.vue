<!--
  Broomstick - Results Table
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="results-wrapper" :class="{ 'all-hidden': allVisitedAndHidden }">
    <CdxTable
      :caption="tableCaption"
      :columns="
        results.length === 0 ||
        (hideVisited && visitedLexemes.size === props.results.length)
          ? []
          : columns
      "
      :data="tableData"
      :paginate="
        results.length > 0 &&
        !(hideVisited && visitedLexemes.size === props.results.length)
      "
      :pagination-size-options="paginationOptions"
      :pagination-size-default="200"
      v-model:sort="sortState"
      :use-row-headers="false"
    >
      <template #item-visited="{ row }">
        <CdxIcon
          v-if="isVisited(row.lexemeId)"
          :icon="cdxIconSuccess"
          size="medium"
          :style="{ color: 'var(--color-subtle)' }"
          aria-label="Visited"
        />
        <CdxIcon
          v-else
          :icon="cdxIconBright"
          size="medium"
          :style="{ color: 'transparent' }"
          aria-label="Not visited"
        />
      </template>

      <template #item-lexemeId="{ row }">
        <a
          :href="`https://www.wikidata.org/wiki/Lexeme:${row.lexemeId}`"
          target="_blank"
          rel="noopener"
          class="external-link"
          @click="markVisited(row.lexemeId)"
        >
          {{ row.lexemeId }}
          <CdxIcon :icon="cdxIconLinkExternal" class="external-icon" />
        </a>
      </template>

      <template #empty-state>
        <div class="empty-state">
          <template
            v-if="hideVisited && visitedLexemes.size === props.results.length"
          >
            <p>All Lexemes have been visited.</p>
          </template>
          <template v-else>
            <p>Lexemes not found.</p>
            <p>Try another Lexeme language or query.</p>
          </template>
        </div>
      </template>
    </CdxTable>

    <div v-if="results.length > 0" class="visibility-controls">
      <span v-if="hideVisited && hiddenCount > 0" class="hidden-count">
        {{ hiddenCount }} hidden
      </span>
      <CdxButton
        class="visibility-toggle"
        :class="{ 'is-hidden': hideVisited }"
        action="progressive"
        weight="quiet"
        :aria-label="hideVisited ? 'Show visited items' : 'Hide visited items'"
        @click="toggleHideVisited"
      >
        <CdxIcon :icon="hideVisited ? cdxIconEyeClosed : cdxIconEye" />
        <span class="toggle-text">{{
          hideVisited ? "Hide visited" : "Hide visited"
        }}</span>
      </CdxButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { CdxTable, CdxIcon, CdxButton } from "@wikimedia/codex";
import {
  cdxIconLinkExternal,
  cdxIconSuccess,
  cdxIconEye,
  cdxIconEyeClosed,
  cdxIconBright,
} from "@wikimedia/codex-icons";

const props = defineProps({
  results: {
    type: Array,
    required: true,
  },
});

const sortState = ref({});
const visitedLexemes = ref(new Set());
const hideVisited = ref(false);

const columns = [
  {
    id: "visited",
    label: "",
    allowSort: false,
    width: "2.75rem",
    minWidth: "2.75rem",
  },
  {
    id: "lexemeId",
    label: "LID",
    allowSort: true,
    width: "12.5rem",
    minWidth: "12.5rem",
  },
  {
    id: "lemma",
    label: "Lemma",
    allowSort: true,
    minWidth: "12.5rem",
  },
  {
    id: "lexicalCategory",
    label: "Lexical category",
    allowSort: true,
    minWidth: "12.5rem",
  },
];

onMounted(() => {
  // add aria-label to visited column header after table renders
  const visitedHeader = document.querySelector(".cdx-table th:first-child");
  if (visitedHeader) {
    visitedHeader.setAttribute("aria-label", "Visited status");
  }
});

const paginationOptions = [
  { value: 10 },
  { value: 50 },
  { value: 100 },
  { value: 200 },
  { value: 500 },
  { value: 1000 },
];

const tableCaption = computed(() => {
  const count = props.results.length;
  return `${count} ${count === 1 ? "result" : "results"}`;
});

const hiddenCount = computed(() => {
  return visitedLexemes.value.size;
});

const filteredResults = computed(() => {
  if (!hideVisited.value) return props.results;
  return props.results.filter((r) => !visitedLexemes.value.has(r.lexemeId));
});

const tableData = computed(() => {
  let data = filteredResults.value.map((result) => ({
    visited: "",
    lexemeId: result.lexemeId,
    lemma: result.lemma,
    lexicalCategory: result.lexicalCategory,
  }));

  const sortColumn = Object.keys(sortState.value)[0];

  if (sortColumn) {
    const sortDirection = sortState.value[sortColumn];

    data = [...data].sort((a, b) => {
      let aVal = String(a[sortColumn]).toLowerCase();
      let bVal = String(b[sortColumn]).toLowerCase();

      if (sortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }

  return data;
});

const allVisitedAndHidden = computed(() => {
  return (
    hideVisited.value && visitedLexemes.value.size === props.results.length
  );
});

function markVisited(lexemeId) {
  visitedLexemes.value.add(lexemeId);
}

function isVisited(lexemeId) {
  return visitedLexemes.value.has(lexemeId);
}

function toggleHideVisited() {
  hideVisited.value = !hideVisited.value;
}
</script>

<style scoped>
.results-wrapper {
  position: relative;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* only remove border when empty */
.results-wrapper :deep(.cdx-table__table__empty-state-content) {
  border: none !important;
}

.visibility-controls {
  position: absolute;
  top: var(--spacing-75);
  right: var(--spacing-75);
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
}

.hidden-count {
  color: var(--color-subtle);
  font-size: var(--font-size-medium);
}

.visibility-toggle {
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  padding: 0 var(--spacing-25);
  background-color: var(--background-color-interactive) !important;
  border: 0.0625rem solid var(--border-color-interactive) !important;
  color: var(--color-base) !important;
}

:deep(.cdx-table__header) {
  height: 3.5rem;
  padding: var(--spacing-75) !important;
}

:deep(.cdx-table th) {
  padding: 0;
}

:deep(.cdx-table th button) {
  padding: var(--spacing-75);
}

/* disable ALL hover states when all items hidden */
.all-hidden :deep(tr:has(td:first-child .cdx-icon[aria-label="Visited"]):hover),
.all-hidden
  :deep(tr:has(td:first-child .cdx-icon[aria-label="Visited"]):hover td),
.all-hidden
  :deep(
    tbody tr:not(:has(td:first-child .cdx-icon[aria-label="Visited"])):hover
  ),
.all-hidden
  :deep(
    tbody tr:not(:has(td:first-child .cdx-icon[aria-label="Visited"])):hover td
  ) {
  background-color: var(--background-color-base) !important;
}

/* hidden state styling */
.visibility-toggle.is-hidden {
  background-color: var(--background-color-progressive) !important;
  border-color: transparent !important;
  color: var(--color-inverted-fixed) !important;
}

.visibility-toggle :deep(.cdx-icon) {
  color: inherit !important; /* inherit from button color */
}

@media (min-width: 640px) {
  .visibility-toggle {
    width: 8.9375rem;
  }
}

.toggle-text {
  display: none;
}

@media (min-width: 640px) {
  .toggle-text {
    display: inline;
  }
}

.external-link {
  font-weight: 700;
  color: var(--color-progressive);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.external-link:hover {
  text-decoration: underline;
}

.external-icon {
  font-size: 0.875rem;
  color: var(--color-progressive);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-100);
  color: var(--color-subtle);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.empty-state p {
  margin: 0;
}

:deep(.cdx-table table) {
  table-layout: auto;
  width: max-content;
}

:deep(.cdx-table td),
:deep(.cdx-table th) {
  white-space: nowrap; /* prevent vertical text wrapping */
}

/* desktop: allow lemma to wrap */
@media (min-width: 640px) {
  :deep(.cdx-table table) {
    width: 100%; /* table fills container on desktop */
  }

  :deep(.cdx-table td:nth-child(3)),
  :deep(.cdx-table td:nth-child(4)) {
    /* lemma column (3rd column) */
    white-space: normal;
  }
}

/* border on visited column */
:deep(td:first-child) {
  border-right: 0.0625rem solid var(--border-color-base) !important;
}

/* visited row default state */
:deep(tr:has(td:first-child .cdx-icon[aria-label="Visited"])) {
  background-color: var(--background-color-neutral) !important;
  color: var(--color-subtle) !important;
}

/* visited row hover state */
:deep(tr:has(td:first-child .cdx-icon[aria-label="Visited"]):hover) {
  background-color: var(--background-color-neutral-subtle) !important;
}

/* visited row hover - target td elements directly */
:deep(tr:has(td:first-child .cdx-icon[aria-label="Visited"]):hover td) {
  background-color: var(--background-color-neutral-subtle) !important;
}

/* NON-visited row hover state */
:deep(
    tbody tr:not(:has(td:first-child .cdx-icon[aria-label="Visited"])):hover
  ) {
  background-color: var(--background-color-interactive-subtle) !important;
}

/* NON-visited row hover - target td elements */
:deep(
    tbody tr:not(:has(td:first-child .cdx-icon[aria-label="Visited"])):hover td
  ) {
  background-color: var(--background-color-interactive-subtle) !important;
}

/* visited row links */
:deep(tr:has(td:first-child .cdx-icon[aria-label="Visited"]) a) {
  color: var(--color-visited) !important;
}

/* visited row link icons */
:deep(tr:has(td:first-child .cdx-icon[aria-label="Visited"]) a .cdx-icon) {
  color: var(--color-visited) !important;
}

/* visited row link hover underline */
:deep(tr:has(td:first-child .cdx-icon[aria-label="Visited"]) a:hover) {
  text-decoration: underline;
}
</style>
