import { extname } from 'path'
import type { Node, NodeTag } from 'posthtml-parser'
import { parser } from 'posthtml-parser'
import { render } from 'posthtml-render'
import type { CacheStore, DemoAttr } from '../typing'
import { decodeData } from './parser-cache'
import { isObject } from './utils'
import type { Parser } from './index'

/**
 * @description: parse demo to code
 * @param src
 * @param md
 */
const parserSrc = async(src: string, md: Parser): Promise<CacheStore | undefined> => {
  const demoPath = md.getDemoPath(src)
  const relativePath = md.getBaseDemoPath(demoPath)
  if (md.cacheStore.has(relativePath)) {
    return md.cacheStore.get(relativePath)
  } else {
    console.error(`[vitepress-plugin-demo] ${src} not found`)
    return undefined
  }
}

const parserAttr = async(md: Parser, attrs?: Record<string, any>): Promise<DemoAttr> => {
  if (!attrs)
    return {}
  const ext = extname(attrs.src)
  const code1 = await parserSrc(attrs.src, md)
  const code = code1?.code
  const linkReflect = Reflect.has(attrs, 'link')
  const link = attrs?.link || (linkReflect && md.linkToExample)
  const highlight = code1?.highlight
  return {
    src: attrs.src,
    ext,
    link,
    code,
    highlight,
  }
}

const checkRaw = (demo: string, attrs: DemoAttr, md: Parser) => {
  const ext = attrs?.ext?.slice(1) ?? 'html'
  const code = attrs.code ?? ''
  if (code) {
    const codeInfo = md.renderCode(decodeData(code)!, ext, false)
    md.replaceCode(demo, codeInfo)
  }
}

const generateDemo = (demo: string, attrs: DemoAttr, node: NodeTag, nodes: Node[], md: Parser, replace = true) => {
  let src = md.getDemoPath(attrs.src)
  src = src.startsWith('/') ? src : `/${src}`
  const liveCodeOption: Record<string, any> = {}
  if (md.options?.codeSandBox?.url) {
    liveCodeOption.codeSandBox = {
      ':codeSandBox': md.options.codeSandBox.url,
    }
  }
  if (md.options?.stackblitz?.url) {
    liveCodeOption.stackblitz = {
      ':stackblitz': md.options.stackblitz.url,
    }
  }
  node.attrs = {
    src,
    link: attrs.link,
    ...liveCodeOption,
  } as Record<string, any>
  if (replace) {
    const html = render(node)
    md.replaceCode(demo, html)
  }
}

const chunkMultiDemo = async(demo: string, nodes: Node[], md: Parser) => {
  const newNodes: Node[] = []
  for (const node of nodes) {
    if (isObject(node) && node.tag === md.wrapper) {
      const attrs = await parserAttr(md, node.attrs)
      if (!md.checkSupportExt(attrs.ext)) {
        const ext = attrs?.ext?.slice(1) ?? 'html'
        const code = attrs.code ?? ''
        const codeInfo = md.renderCode(decodeData(code)!, ext, false)
        const parserNode = parser(codeInfo)
        newNodes.push(...parserNode)
      }
      else {
        generateDemo(demo, attrs, node, nodes, md, false)
        newNodes.push(node)
      }
    }
    else {
      newNodes.push(node)
    }
  }
  const html = render(newNodes)
  md.replaceCode(demo, html)
}

export const parserDemo = async(demos: string[], md: Parser) => {
  const deduplicateDemos = [...new Set(demos || [])]
  for (const demo of deduplicateDemos) {
    const nodes: Node[] = parser(demo)
    if (nodes.length === 1) {
      const node: NodeTag = nodes[0] as NodeTag
      const attrs = await parserAttr(md, node.attrs)
      if (!md.checkSupportExt(attrs.ext)) {
        checkRaw(demo, attrs, md)
      }
      else {
        generateDemo(demo, attrs, node, nodes, md)
      }
    }
    else {
      await chunkMultiDemo(demo, nodes, md)
    }
  }
}
