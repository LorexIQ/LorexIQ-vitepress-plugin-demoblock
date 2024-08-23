import { extname } from 'path'
import chokidar from 'chokidar'
import fsExtra from 'fs-extra'
import { renderCode } from './render-code'
import { parserCache } from './parser-cache'
import { parserSingleFile } from './glob-files'
import type { Parser } from './index'
export const watcherServer = (md: Parser) => {
  md.watcher = chokidar.watch(md.glob, {
    cwd: md.basePath,
  })

  md.watcher?.on('add', async(path) => {
    const relativePath = md.getBaseDemoPath(path)
    if (md.cacheStore.has(relativePath))
      return

    const fullPath = md.getFullPath(path, true)
    const storeItem = await parserSingleFile(md, fullPath, path, relativePath)
    if (storeItem) {
      const modules = md.server?.moduleGraph?.getModulesByFile(md.moduleId)
      md.cacheStore.set(relativePath, storeItem)
      modules?.forEach((module) => {
        md.server?.moduleGraph.invalidateModule(module)
      })
      md.server?.ws?.send({
        type: 'full-reload',
      })
    }
  })

  md.watcher?.on('change', async(path) => {
    const relativePath = md.getBaseDemoPath(path)
    const fullPath = md.getFullPath(path, true)
    let code = await fsExtra.readFile(fullPath, 'utf-8')
    let docs: any[] = []
    const ext = extname(path)
    let storeItem = md.cacheStore.get(relativePath)
    if (ext.endsWith('vue')) {
      const renderCodeData = await renderCode(code, md)
      code = renderCodeData.code as string
      docs = renderCodeData.docs
      if (storeItem) {
        storeItem.code = code
        storeItem.docs = renderCodeData.docs
        storeItem.highlight = md.renderCode(code as string, ext.slice(1))
        storeItem = parserCache(storeItem)
      }
      else {
        storeItem = parserCache({
          relativePath,
          code,
          docs,
          highlight: md.renderCode(code as string, ext.slice(1)),
        })
      }
    }
    if (!storeItem) {
      storeItem = parserCache({
        relativePath,
        code,
        highlight: md.renderCode(code as string, ext.slice(1)),
      })
    }
    md.cacheStore.set(relativePath, storeItem!)
  })

  md.watcher?.on('unlink', async(path) => {
    const relativePath = md.getBaseDemoPath(path)
    md.cacheStore.delete(relativePath)
    const modules = md.server?.moduleGraph?.getModulesByFile(md.moduleId)
    modules?.forEach((module) => {
      md.server?.moduleGraph.invalidateModule(module)
    })
    md.server?.ws?.send({
      type: 'full-reload',
    })
  })
}
