<template>
  <div id="app">
    <!--
      路由占位符：
      用于承载不同页面路由对应的组件内容
    -->
    <router-view/>
  </div>
</template>

<script>
/**
 * Root Component - 项目根组件
 * 作用：作为整个单页面应用 (SPA) 的壳，承载顶级路由视图
 */
export default {
  name: 'App'
}
</script>

<style lang="less">
/* 全局样式已在 main.js 中通过 common.less 引入 */
</style>
