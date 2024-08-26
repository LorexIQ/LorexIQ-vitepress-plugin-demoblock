<template>
  <ClientOnly>
    <div class="demo-block">
      <div class="demo-block__code" v-html="highlightCode.innerHTML" />
      <OpenExample v-if="link" @click="openRunner"/>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import {
  computed,
  defineAsyncComponent, h,
  onMounted,
  ref,
  shallowRef,
} from 'vue'
import OpenExample from './icons/OpenExample.vue'

const props = defineProps<{ src: string; link?: string }>()
const demoComp = shallowRef()
const content = shallowRef<Record<string, any>>()
const decode = (str?: string) => {
  if (!str) return ''
  return decodeURIComponent(str)
}
const link = computed(() => decode(content.value?.link || props.link))
const highlightCode = computed(() => {
  const div = document.createElement('div')
  div.innerHTML = decode(content.value?.highlight)
  const divLang = div.querySelector('div:first-child')
  divLang && divLang.classList.add('vp-adaptive-theme')
  return div;
})

const isSupported = ref(false)

onMounted(async() => {
  const data = await import('virtual:vitepress-demo')
  const demos = data.default
  const demo = demos[props.src]
  if (demo && demo.comp) demoComp.value = defineAsyncComponent(demo.comp)
  if (demo) content.value = demo
  if (navigator && 'clipboard' in navigator) isSupported.value = true
})

function openRunner() {
  window.parent.postMessage(JSON.stringify({
    linkValue: link.value,
    componentSrc: props.src,
    location: window.location
  }), '*');
}
</script>

<style>
.lang {
  opacity: 1 !important;
}
button.copy {
  top: 36px !important;
  opacity: 1 !important;
}
</style>

<style scoped>
.demo-block {
  position: relative;
}
.demo-block:hover .button-example {
  opacity: 1;
}
</style>
