# Yang-Shoping 移动端电商项目

<p align="center">
  <img src="https://img.shields.io/badge/Vue-2.6.14-4FC08D?style=flat-square&logo=vue.js" alt="Vue Version">
  <img src="https://img.shields.io/badge/Vant-2.x-07C160?style=flat-square&logo=vant" alt="Vant UI">
  <img src="https://img.shields.io/badge/Vuex-3.x-42B883?style=flat-square&logo=vuex" alt="Vuex">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License">
</p>

## 项目简介

本项目是一个基于 **Vue 2** 和 **Vant UI** 打造的响应式移动端电商商城。项目涵盖了从商品搜索、购物车管理、订单流程到个人中心等完整的电商业务逻辑，适合作为 Vue2 工程化入门的学习案例。

## ✨ 功能特性

- **完整业务流**：首页展示、商品搜索、商品详情、购物车管理、订单结算、地址管理等
- **UI 组件库**：基于 **Vant 2** 实现，支持按需引入，完美适配移动端
- **响应式布局**：采用 `postcss-px-to-viewport` 方案，实现移动端极致适配
- **状态管理**：使用 **Vuex** 实现模块化状态管理（购物车、用户信息、地址管理）
- **请求封装**：基于 **Axios** 封装，包含拦截器、Token 管理、全局加载提示等
- **代码规范**：全项目覆盖 **ESLint + Standard** 规范，结构清晰易维护

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue | 2.6.14 |
| 路由管理 | Vue Router | 3.x |
| 状态管理 | Vuex | 3.x |
| UI 组件库 | Vant | 2.x |
| HTTP 请求 | Axios | ^1.12.2 |
| CSS 预处理 | Less | ^4.0.0 |
| 移动端适配 | PostCSS (px-to-viewport) | ^1.1.1 |
| 代码规范 | ESLint + Standard | - |

## 🚀 快速开始

### 环境要求

- Node.js >= 12.0.0
- npm >= 6.0.0 或 yarn >= 1.22.0

### 安装步骤

```bash
# 克隆项目
git clone <project-url>

# 进入项目目录
cd yang-shoping

# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 构建生产版本
npm run build

# 代码检查和修复
npm run lint
```

### 访问地址

- 开发环境：http://localhost:8080

## 📂 项目结构

```
src/
├── api/                  # API 接口模块
│   ├── address.js        # 地址相关接口
│   ├── cart.js           # 购物车接口
│   ├── category.js       # 分类接口
│   ├── home.js           # 首页接口
│   ├── login.js          # 登录接口
│   ├── order.js          # 订单接口
│   └── ...
├── assets/               # 静态资源文件
├── components/           # 公共组件
│   ├── CountBox.vue      # 数量选择器
│   ├── GoodsItem.vue     # 商品项组件
│   └── OrderListItem.vue # 订单列表项
├── constants/            # 常量定义
├── mixins/               # 混入 (mixin)
├── router/               # 路由配置
├── store/                # Vuex 状态管理
│   ├── modules/
│   │   ├── address.js    # 地址模块
│   │   ├── cart.js       # 购物车模块
│   │   └── user.js       # 用户模块
│   └── index.js
├── styles/               # 全局样式
│   ├── common.less       # 公共样式
│   └── variables.less    # 变量定义
├── utils/                # 工具函数
│   ├── area.js           # 地区数据
│   ├── format.js         # 格式化工具
│   ├── request.js        # 请求封装
│   ├── storage.js        # 本地存储
│   └── vant-ui.js        # Vant 配置
├── views/                # 页面视图
│   ├── layout/           # 布局组件 (TabBar)
│   ├── login/            # 登录页
│   ├── prodetail/        # 商品详情
│   ├── search/           # 搜索页
│   ├── pay/              # 支付页
│   ├── order/            # 订单列表
│   ├── address/          # 地址管理
│   └── settings/         # 设置页
├── App.vue               # 根组件
└── main.js               # 入口文件
```

## 💡 核心功能说明

### 1. 购物车系统
- 本地与后端数据同步机制
- 全选/反选功能
- 商品数量动态调整
- 库存校验与价格计算

### 2. 地址管理系统
- 基于 `areaList` 的行政区划数据
- Vant 级联选择器集成
- 地址的增删改查 (CRUD)
- 默认地址设置

### 3. 用户认证
- Token 持久化存储
- 登录状态守卫
- 401 自动跳转登录
- 请求自动携带 Token

### 4. 移动端适配方案
- 设计稿基准：750px 或 375px
- 自动 px 转 vw 单位
- 多设备屏幕兼容

## 🔧 开发规范

### 代码风格
- 遵循 **ESLint Standard** 规范
- 统一使用 **2 空格缩进**
- 组件命名采用 **PascalCase**
- 文件命名采用 **kebab-case**

### Git 提交规范
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 📝 更新日志

### v0.1.0 (2024-01-01)
- 初始版本发布
- 完成核心电商功能模块
- 集成 Vant UI 组件库
- 实现移动端适配方案

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 👨‍💻 作者

Yang-Shoping Team

---

<p align="center">
  <strong>Yang-Shoping</strong> - 记录每一个购物的精彩瞬间 ✨
</p>
