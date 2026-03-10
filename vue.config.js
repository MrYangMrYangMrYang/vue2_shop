// 从 @vue/cli-service 包中解构导入 defineConfig 函数
// defineConfig 是一个辅助函数，提供：
// 类型提示：在编辑器中获得配置项的自动补全
// 配置验证：检查配置项是否正确
// 更好的 IDE 支持：配合 TypeScript 项目使用效果更好
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: './',
  // 作用：部署应用包时的基本 URL
  // './' 的含义：使用相对路径
  // 打包后的资源引用路径相对于当前 HTML 文件
  // 例如：<script src="./js/chunk.js"> 而不是 <script src="/js/chunk.js">

  transpileDependencies: true
  // 作用：控制是否转译 node_modules 中的依赖
  // true 的含义：
  // 转译 node_modules 中所有的依赖
  // 确保所有依赖都被编译成兼容性更好的 ES5 代码
  // 适用场景：
  // 项目中使用了未提供 ES5 版本的第三方库
  // 需要支持较旧的浏览器（如 IE）
  // 某些依赖使用了现代 JavaScript 语法
})
