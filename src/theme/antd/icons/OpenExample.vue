<template>
  <button class="button-example" title="Run example">
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 256 256"><path fill="#808080" d="M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128"/></svg>
  </button>
</template>

<script>
export default {
  name: "Expand"
}
</script>

<style scoped>
.button-example {
  position: absolute;
  top: 82px;
  right: 12px;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--vp-code-copy-code-border-color);
  border-radius: 4px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: opacity 0.4s;
}
.button-example:hover {
  background-color: var(--vp-code-copy-code-hover-bg);
}
</style>
