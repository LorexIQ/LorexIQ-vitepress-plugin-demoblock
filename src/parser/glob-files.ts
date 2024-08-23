import { extname } from 'path'
import fg from 'fast-glob'
import fsExtra from 'fs-extra'
import { renderCode } from './render-code'
import { parserCache } from './parser-cache'
import type { Parser } from './index'

export const parserSingleFile = async(md: Parser, fullPath: string, file: string, relativePath: string) => {
  if (md.cacheStore.has(relativePath))
    return undefined

  let code = await fsExtra.readFile(fullPath, 'utf-8')
  let docs: any[] = []
  const ext = extname(file)
  if (ext.endsWith('vue')) {
    const renderCodeData = await renderCode(code, md)
    code = renderCodeData.code as string
    docs = renderCodeData.docs
  }
  return parserCache({
    relativePath,
    code,
    docs,
    highlight: md.renderCode(code as string, ext.slice(1)),
  })
}
const baseIgnore = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/test/**', '**/tests/**', '**/__tests__/**']

export const globFiles = async(md: Parser) => {
  const files = await fg(md.glob, {
    cwd: md.basePath,
    ignore: [...baseIgnore, ...md.excludeFiles],
  })

  for (const file of files) {
    const relativePath = md.getBaseDemoPath(file)
    const fullPath = md.getFullPath(file, true)
    const storeItem = await parserSingleFile(md, fullPath, file, relativePath)
    if (storeItem) {
      md.cacheStore.set(relativePath, storeItem)
    }
  }
}
