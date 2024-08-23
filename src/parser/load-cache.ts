import type { CacheStore } from '../typing'
import { objToStr } from './obj-to-str'
import type { Parser } from './index'

export const loadCache = (md: Parser) => {
  const obj: Record<string, CacheStore> = {}
  for (const [key, value] of Array.from(md.cacheStore.entries())) {
    obj[key] = {
      ...value,
      comp: `() => import('${md.getImportSrc(key)}')`,
    }
  }
  return `const demoData = ${objToStr(obj)};\n export default demoData;`
}
