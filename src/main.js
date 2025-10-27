/**
 * Broomstick
 * A tool to identify Lexemes on Wikidata that can be improved
 * 
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.css'
import '@wikimedia/codex/dist/codex.style.css'


// apply theme immediately to prevent flash
if (localStorage?.getItem('theme')) {
  const theme = localStorage.getItem('theme')
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.add('light')
  }
  else if (theme === 'auto') {
    // check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }
}

else {
  // no saved preference - check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
}

createApp(App).mount('#app')