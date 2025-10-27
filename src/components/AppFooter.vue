<!--
  Broomstick - App Footer
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="main-section">
        <div class="footer-branding">
          <BroomstickIcon class="footer-logo" alt="Broomstick logo" />
          <div class="footer-text">
            <h3 class="footer-title">Broomstick</h3>
            <p class="footer-caption">
              by
              <a
                href="https://meta.wikimedia.org/wiki/Software_Collaboration_for_Wikidata"
                target="_blank"
                rel="noopener"
                class="wikicollabs-link"
                >Wikicollabs</a
              >
            </p>
            <p class="footer-caption">Powered by Wikidata</p>
          </div>
        </div>
      </div>
      <div class="links">
        <a
          href="https://www.wikidata.org/wiki/Wikidata:Broomstick"
          target="_blank"
          rel="noopener"
          class="external-link"
        >
          About
          <cdx-icon :icon="cdxIconLinkExternal" size="small" />
        </a>
        <span class="link-separator">·</span>
        <a
          href="https://www.wikidata.org/wiki/Wikidata:Broomstick/Privacy_policy"
          target="_blank"
          rel="noopener"
          class="external-link"
        >
          Privacy policy
          <cdx-icon :icon="cdxIconLinkExternal" size="small" />
        </a>
        <span class="link-separator">·</span>
        <a
          href="https://www.wikidata.org/wiki/Wikidata:Broomstick/License"
          target="_blank"
          rel="noopener"
          class="external-link"
        >
          License
          <cdx-icon :icon="cdxIconLinkExternal" size="small" />
        </a>
        <span class="link-separator">·</span>
        <a
          href="https://github.com/wikicollabs/broomstick"
          target="_blank"
          rel="noopener"
          class="external-link"
        >
          Source code
          <cdx-icon :icon="cdxIconLinkExternal" size="small" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { CdxIcon } from "@wikimedia/codex";
import { cdxIconLinkExternal } from "@wikimedia/codex-icons";
import BroomstickIcon from "./BroomstickIcon.vue";
</script>

<style scoped>
.app-footer {
  background-color: var(--background-color-neutral);
  border-top: 0.0625rem solid var(--border-color-base);
  margin-top: auto;
}

.footer-content {
  padding: var(--spacing-100); /* 16px all around on mobile */
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--spacing-200);
}

@media (min-width: 640px) {
  .footer-content {
    padding: var(--spacing-150) var(--spacing-200); /* 24px vertical, 32px horizontal */
  }
}

/* rest of footer styles stay the same */

.footer-branding {
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
}

.footer-logo {
  width: 2rem;
  height: 2rem;
  color: #3056a9;
}

.footer-text {
  display: flex;
  flex-direction: column;
  gap: 0; /* remove spacing between lines */
}

.footer-title {
  margin: 0;
  font-family: var(--font-family-base);
  font-size: var(--font-size-x-large);
  font-style: normal;
  font-weight: 700;
  line-height: var(--line-height-x-large);
  color: var(--color-base);
}

.footer-caption {
  margin: 0;
  font-family: var(--font-family-base);
  font-size: var(--font-size-small);
  font-weight: 700;
  line-height: var(--line-height-small);
  letter-spacing: 0;
  color: var(--color-subtle);
}

.wikicollabs-link {
  color: var(--color-progressive);
  text-decoration: none;
  font-weight: 700; /* maintain bold weight */
}

.wikicollabs-link:hover {
  text-decoration: underline;
}

.links {
  display: flex;
  gap: var(--spacing-25); /* changed from spacing-100 */
  flex-wrap: wrap;
  align-items: center; /* align with footer text */
}

.link-separator {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  user-select: none;
}

.external-link {
  color: var(--color-progressive);
  text-decoration: none;
  font-size: var(--font-size-small);
  font-weight: 400; /* caption regular, not bold */
  line-height: var(--line-height-small);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-25);
}

.external-link:hover {
  text-decoration: underline;
}

/* make the icon blue too */
.external-link :deep(.cdx-icon) {
  color: var(--color-progressive);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .links {
    width: 100%;
  }
}
</style>
