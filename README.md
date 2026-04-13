# 智慧商城 (Yang-Shopping)

> 一个基于 Vue 2.x 生态构建的高性能移动端电商购物平台。

[![Vue](https://img.shields.io/badge/Vue-2.6.14-42b883.svg)](https://vuejs.org/)
[![Vant](https://img.shields.io/badge/Vant-2.13.9-1989fa.svg)](https://vant-ui.github.io/vant/v2/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 项目简介

**智慧商城** 是一款专为移动端打造的电商应用，实现了从商品浏览、搜索、分类到购物车管理、订单结算及个人中心等完整的购物闭环。项目采用 Vue 2 全家桶进行开发，配合 Vant UI 库提供流畅的用户体验，并实现了完善的移动端适配方案。

## ✨ 核心功能

- 🏠 **首页模块**：精美 Banner 轮播、热门商品推荐。
- 🔍 **搜索系统**：关键词搜索、历史记录管理、搜索结果列表。
- 🗂️ **分类导航**：侧边导航切换，快速定位感兴趣的商品类别。
- 🛒 **购物车**：支持商品增减、全选/反选、金额自动计算。
- 💳 **结算流程**：订单确认、收货地址选择、模拟支付。
- 📋 **订单管理**：订单状态追踪（全部、待支付、待发货等）。
- 👤 **个人中心**：用户登录、退出登录、基础资料展示。
- 🔐 **权限控制**：基于路由守卫和 Axios 拦截器的登录验证。

## 🛠️ 技术栈

- **核心框架**：Vue 2.6.14
- **路由管理**：Vue Router 3.5.1
- **状态管理**：Vuex 3.6.2
- **UI 组件库**：Vant UI 2.x (按需引入)
- **网络请求**：Axios (集成请求/响应拦截器)
- **样式处理**：Less & PostCSS (px-to-viewport 移动端适配)
- **构建工具**：Vue CLI 5.0

## 📂 项目目录结构

```text
src/
├── api/             # 接口模块：封装各类业务 API 请求
├── assets/          # 静态资源：图片、图标等
├── components/      # 通用组件：计数器、商品卡片、订单项等
├── mixins/          # 混入逻辑：通用业务逻辑复用 (如登录确认)
├── router/          # 路由配置：页面跳转与守卫逻辑
├── store/           # 状态管理：购物车、用户信息模块化存储
├── styles/          # 全局样式：基础样式重置与 Less 变量
├── utils/           # 工具函数：请求封装、持久化存储、UI 按需加载
└── views/           # 视图页面：首页、分类、购物车、详情、搜索等
```

## 🚀 快速开始

### 1. 克隆并安装依赖
```bash
git clone <your-repository-url>
cd yang-shoping
npm install
```

### 2. 本地运行
```bash
npm run serve
```
启动后访问：`http://localhost:8080`

### 3. 项目打包
```bash
npm run build
```

## 📱 移动端适配

本项目采用 `postcss-px-to-viewport` 方案，将 `px` 自动转化为 `vw`。设计稿基准宽度为 `375px`。

---

*如果您觉得这个项目对您有帮助，欢迎点个 Star 🌟！*
