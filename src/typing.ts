import type { MarkdownOptions } from 'vitepress'

export interface CodeOptions {
  url: string
}

export interface UserOptions {
  base?: string
  wrapper?: string
  markdown?: MarkdownOptions
  glob?: string | string[]
  exclude?: string | string[]
  linkToExample?: string
  /**
   * support transform code to vue component extra
   * @default ['.vue', '.tsx', '.jsx']
   */
  includeExt?: string[]
  aliasName?: string
  codeSandBox?: CodeOptions // https://codesandbox.io/s/vue-shape-8ciig?file=/src/App.vue
  stackblitz?: CodeOptions // https://stackblitz.com/edit/vitejs-vite-lsj1ne?file=src/Demo1.vue
  /**
   * @description custom vue block name
   * @default docs
   */
  blockName?: string
}

export interface DemoAttr{
  src?: string
  ext?: string
  link?: true | string
  code?: string
  highlight?: string
  comp?: any
}

export interface CacheStore{
  relativePath: string
  code: string
  link?: string
  highlight?: string
  docs?: any[]
  comp?: any
}
