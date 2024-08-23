import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import VueJsx from '@vitejs/plugin-vue-jsx'
import PluginVitePressDemoBlock from '../src'

export default defineConfig({
  plugins: [
    PluginVitePressDemoBlock({
      glob: './**/demos/*.{vue,tsx,jsx}',
      linkToExample: 'http://localhost:3000/test',
    }),
    Inspect(),
    VueJsx(),
  ],
})
