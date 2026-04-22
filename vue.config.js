// 从 @vue/cli-service 包中解构导入 defineConfig 函数
// defineConfig 是一个辅助函数，提供：
// 类型提示：在编辑器中获得配置项的自动补全
// 配置验证：检查配置项是否正确
// 更好的 IDE 支持：配合 TypeScript 项目使用效果更好
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: '/',
  // 作用：部署应用包时的基本 URL
  // '/' 的含义：使用绝对路径
  // 打包后的资源引用路径相对于项目根目录
  // 例如：<script src="/js/chunk.js">

  transpileDependencies: true,
  // 开发服务器配置
  devServer: {
    // 开启 history 模式的 404 回退到 index.html
    historyApiFallback: true
  }
})
