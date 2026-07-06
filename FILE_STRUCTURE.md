# 项目文件结构详解

## 项目总体布局

```
college-choice-website/                    # 项目根目录
├── backend/                               # 后端应用
│   ├── src/                              # 源代码目录
│   │   ├── controllers/                  # 业务逻辑控制器
│   │   │   ├── homeController.ts         # 首页数据处理
│   │   │   └── authController.ts         # 用户认证处理
│   │   ├── routes/                       # 路由定义
│   │   │   ├── home.ts                   # 首页相关路由
│   │   │   └── auth.ts                   # 认证相关路由
│   │   ├── db/                          # 数据库相关
│   │   │   ├── database.ts              # 数据库连接配置
│   │   │   └── schema.sql               # 数据库初始化脚本
│   │   ├── middleware/                  # 中间件
│   │   │   └── cors.ts                  # CORS 跨域配置
│   │   └── server.ts                    # Express 服务器入口
│   ├── node_modules/                    # 依赖包（自动生成）
│   ├── .env                             # 环境变量（本地配置）
│   ├── .env.example                     # 环境变量示例
│   ├── package.json                     # NPM 项目配置
│   ├── package-lock.json                # 依赖版本锁定文件
│   └── tsconfig.json                    # TypeScript 配置
│
├── frontend/                             # 前端应用
│   ├── src/                             # 源代码目录
│   │   ├── components/                  # React 可复用组件
│   │   │   ├── Header.tsx              # 导航栏组件
│   │   │   ├── Carousel.tsx            # 轮播组件
│   │   │   ├── Featured.tsx            # 推荐专业卡片组件
│   │   │   ├── News.tsx                # 新闻列表组件
│   │   │   └── Auth.tsx                # 登录/注册模态框组件
│   │   ├── pages/                      # 页面级组件
│   │   │   └── HomePage.tsx            # 首页主页面
│   │   ├── services/                   # API 服务层
│   │   │   └── api.ts                  # API 调用集中管理
│   │   ├── assets/                     # 静态资源（图片等）
│   │   ├── App.tsx                     # 应用根组件
│   │   ├── App.css                     # 应用全局样式
│   │   ├── main.tsx                    # React 入口文件
│   │   └── vite-env.d.ts              # Vite 环境类型定义
│   ├── public/                         # 公共资源
│   │   └── vite.svg               # Vite logo
│   ├── node_modules/                   # 依赖包（自动生成）
│   ├── dist/                           # 构建输出目录（生成时创建）
│   ├── .env                            # 环境变量（本地配置）
│   ├── index.html                      # HTML 入口文件
│   ├── package.json                    # NPM 项目配置
│   ├── package-lock.json               # 依赖版本锁定文件
│   ├── tsconfig.json                   # TypeScript 配置
│   ├── tsconfig.app.json              # TypeScript App 配置
│   ├── tsconfig.node.json             # TypeScript Node 配置
│   ├── vite.config.ts                 # Vite 构建配置
│   ├── tailwind.config.js             # Tailwind CSS 配置
│   ├── postcss.config.js              # PostCSS 配置
│   └── README.md                       # 前端项目说明
│
├── README.md                            # 项目总体说明文档
├── QUICKSTART.md                        # 快速开始指南
├── PROJECT_SUMMARY.md                   # 项目完成总结
├── CHECKLIST.md                         # 开发检查清单
├── FILE_STRUCTURE.md                    # 本文件
└── .gitignore                          # Git 忽略配置
```

## 详细文件说明

### 后端文件详解

#### `/backend/src/server.ts`
- **作用**: Express 应用的主入口
- **功能**: 
  - 初始化 Express 应用
  - 配置中间件（JSON 解析、CORS）
  - 注册路由
  - 启动服务器
- **重要函数**:
  - `app.listen(PORT)` - 启动服务器

#### `/backend/src/controllers/homeController.ts`
- **作用**: 处理首页相关的业务逻辑
- **导出函数**:
  - `getCarousel()` - 获取轮播数据
  - `getFeaturedMajors()` - 获取推荐专业
  - `getNews()` - 获取新闻列表
  - `getHomeData()` - 获取首页全部数据

#### `/backend/src/controllers/authController.ts`
- **作用**: 处理用户认证相关逻辑
- **导出函数**:
  - `register()` - 用户注册
  - `login()` - 用户登录
  - `getCurrentUser()` - 获取当前用户

#### `/backend/src/routes/home.ts`
- **作用**: 定义首页相关的 API 路由
- **路由**:
  - `GET /carousel` - 轮播数据
  - `GET /featured-majors` - 推荐专业
  - `GET /news` - 新闻列表
  - `GET /data` - 完整首页数据

#### `/backend/src/routes/auth.ts`
- **作用**: 定义认证相关的 API 路由
- **路由**:
  - `POST /register` - 注册
  - `POST /login` - 登录
  - `GET /me` - 当前用户

#### `/backend/src/middleware/cors.ts`
- **作用**: 配置跨域资源共享 (CORS)
- **功能**: 允许前端正确访问后端 API

#### `/backend/src/db/database.ts`
- **作用**: 管理数据库连接
- **功能**: 
  - 初始化 PostgreSQL 连接池
  - 导出连接对象供其他模块使用

#### `/backend/src/db/schema.sql`
- **作用**: 数据库初始化脚本
- **包含**:
  - 表定义 (CREATE TABLE)
  - 示例数据 (INSERT INTO)

### 前端文件详解

#### `/frontend/src/main.tsx`
- **作用**: React 应用的入口文件
- **功能**: 
  - 挂载 React 应用到 DOM
  - 导入全局样式

#### `/frontend/src/App.tsx`
- **作用**: 应用的根组件
- **功能**: 渲染 HomePage 组件

#### `/frontend/src/pages/HomePage.tsx`
- **作用**: 首页主容器
- **功能**:
  - 加载首页数据
  - 管理页面状态
  - 组合所有首页子组件

#### `/frontend/src/components/Header.tsx`
- **作用**: 顶部导航栏组件
- **功能**:
  - 显示 Logo
  - 导航菜单
  - 登录/注册按钮
  - 移动端菜单
- **Props**: 
  - `onLoginClick` - 登录按钮回调
  - `onRegisterClick` - 注册按钮回调

#### `/frontend/src/components/Carousel.tsx`
- **作用**: 轮播图组件
- **功能**:
  - 自动播放
  - 左右导航
  - 指示点导航
  - 过渡动画
- **Props**: 
  - `items` - 轮播数据数组

#### `/frontend/src/components/Featured.tsx`
- **作用**: 推荐专业卡片组件
- **功能**:
  - 网格布局展示专业
  - 显示专业详细信息
  - 颜色编码就业前景
- **Props**: 
  - `majors` - 专业数据数组

#### `/frontend/src/components/News.tsx`
- **作用**: 新闻列表组件
- **功能**:
  - 列表显示新闻
  - 显示分类标签
  - 显示浏览统计
- **Props**: 
  - `items` - 新闻数据数组

#### `/frontend/src/components/Auth.tsx`
- **作用**: 登录/注册模态框组件
- **功能**:
  - 登录表单
  - 注册表单
  - 表单验证
  - 错误/成功提示
- **Props**: 
  - `isOpen` - 模态框开启状态
  - `mode` - 'login' 或 'register'
  - `onClose` - 关闭回调
  - `onSuccess` - 成功回调

#### `/frontend/src/services/api.ts`
- **作用**: 集中管理所有 API 调用
- **功能**:
  - 配置 axios 实例
  - 导出 homeAPI 和 authAPI 对象
  - 简化组件中的 API 调用

### 配置文件说明

#### `tsconfig.json` (后端和前端)
- **作用**: TypeScript 编译配置
- **配置项**:
  - `target` - 目标 JavaScript 版本
  - `module` - 模块系统
  - `lib` - 引入的库定义
  - `strict` - 严格类型检查

#### `package.json` (后端和前端)
- **作用**: NPM 项目配置文件
- **主要内容**:
  - `dependencies` - 生产依赖
  - `devDependencies` - 开发依赖
  - `scripts` - 可执行脚本

#### `.env` 和 `.env.example`
- **作用**: 环境变量管理
- **后端变量**:
  - `PORT` - 服务器端口
  - `DB_*` - 数据库连接信息
  - `FRONTEND_URL` - 前端地址
- **前端变量**:
  - `VITE_API_URL` - API 后端地址

#### `vite.config.ts` (前端)
- **作用**: Vite 构建工具配置
- **功能**: 配置开发服务器和构建选项

#### `tailwind.config.js` (前端)
- **作用**: Tailwind CSS 样式框架配置
- **功能**: 自定义主题、扩展功能

#### `postcss.config.js` (前端)
- **作用**: PostCSS 配置
- **功能**: 集成 Tailwind CSS 和 Autoprefixer

### 文档文件

- **README.md** - 项目总体介绍和使用说明
- **QUICKSTART.md** - 3 分钟快速开始指南
- **PROJECT_SUMMARY.md** - 项目完成情况总结
- **CHECKLIST.md** - 开发检查清单和测试步骤
- **FILE_STRUCTURE.md** - 本文件，详细文件结构说明

## 代码行数统计

### 后端代码
- 服务器入口: ~20 行
- 首页控制器: ~50 行
- 认证控制器: ~60 行
- 路由定义: ~20 行
- CORS 中间件: ~15 行
- 数据库配置: ~15 行
- 总计: ~180 行 TypeScript 代码

### 前端代码
- 首页: ~150 行
- 导航栏: ~80 行
- 轮播: ~100 行
- 推荐卡片: ~80 行
- 新闻列表: ~80 行
- 登录/注册: ~120 行
- API 服务: ~30 行
- 总计: ~640 行 TypeScript/JSX 代码

### 数据库
- Schema.sql: ~70 行 SQL 代码

### 文档
- 总计: ~1000+ 行中文说明文档

## 资源占用

- **依赖包** (已安装):
  - 后端: 27 个包
  - 前端: 28 个包
- **磁盘占用** (node_modules):
  - 后端: ~300 MB
  - 前端: ~400 MB

## 开发工具链

### 后端工具
- TypeScript - 代码编译
- ts-node - 直接运行 TS 代码
- Express - Web 框架
- pg - PostgreSQL 驱动

### 前端工具
- Vite - 构建工具
- React - UI 框架
- TypeScript - 类型检查
- Tailwind CSS - 样式框架
- Axios - HTTP 请求

## 最后更新

- **创建日期**: 2024-07-02
- **项目版本**: v1.0.0
- **文件总数**: 32+ 个源文件
- **完成度**: 100% ✅

