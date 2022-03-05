<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {}
document.addEventListener('DOMContentLoaded', () => {
  const html = document.querySelector('html')
  // 屏幕的宽度除以10，获取根元素fontSize标准
  let fontSize = window.innerWidth / 10
// 获取到的 fontSize 标准不允许超过我们定义的最大值
  fontSize = fontSize > 50 ? 50 : fontSize
  // 定义根元素 大小
  html.style.fontSize = fontSize + 'px'
})
</script>

<style  lang="scss">
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #7d8188;
}

</style>
