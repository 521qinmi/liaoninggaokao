# 高考志愿选专业网站

一个帮助学生和家长进行高考志愿填报决策的全栈网站。

## 项目介绍

本项目包含专业信息查询、高校对比、志愿填报工具等功能，致力于为考生提供专业的志愿指导。

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL
- **HTTP 客户端**: Axios

## 项目结构

```
college-choice-website/
├── frontend/          # React 前端应用
├── backend/           # Express 后端服务
└── README.md          # 项目说明文档
```

## 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- PostgreSQL 12+ (用于数据库)

### 后端设置

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 创建 .env 文件 (参考 .env.example)
```bash
cp .env.example .env
```

4. 创建 PostgreSQL 数据库
```bash
# 使用 PostgreSQL 命令行
createdb college_choice
```

5. 导入数据库 Schema
```bash
psql -U postgres -d college_choice -f src/db/schema.sql
```

6. 启动后端服务
```bash
npm run dev
```

后端将运行在 `http://localhost:5000`

### 前端设置

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

前端将运行在 `http://localhost:5173`

## 可用的 API 端点

### 首页数据
- `GET /api/home/data` - 获取首页所有数据（轮播、推荐专业、新闻）
- `GET /api/home/carousel` - 获取轮播数据
- `GET /api/home/featured-majors` - 获取推荐专业列表
- `GET /api/home/news?limit=5` - 获取新闻资讯

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

## 功能模块

### 模块 1：首页（当前版本）
- ✅ 轮播推荐专业
- ✅ 热点话题/新闻显示
- ✅ 快速导航入口
- ✅ 用户登录/注册功能

### 待开发模块
- [ ] 模块 2：专业信息库
- [ ] 模块 3：智能推荐系统
- [ ] 模块 4：高校信息查询
- [ ] 模块 5：就业前景分析
- [ ] 模块 6：志愿填报工具
- [ ] 模块 7：社区交互
- [ ] 模块 8：个人中心

## 环境变量配置

### 后端 (.env)
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=college_choice
FRONTEND_URL=http://localhost:5173
```

### 前端 (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 数据库初始化

运行 SQL 脚本初始化数据库：
```bash
psql -U postgres -d college_choice -f backend/src/db/schema.sql
```

该脚本会创建以下表：
- `majors` - 专业信息
- `carousel_items` - 轮播内容
- `news` - 新闻资讯
- `users` - 用户账户

## 开发说明

### 启动完整开发环境

1. 确保 PostgreSQL 已启动且数据库已初始化
2. 打开一个终端，启动后端：
   ```bash
   cd backend && npm run dev
   ```
3. 打开另一个终端，启动前端：
   ```bash
   cd frontend && npm run dev
   ```
4. 在浏览器中访问 `http://localhost:5173`

### 代码规范

- 使用 TypeScript 编写类型安全的代码
- 组件使用函数式 + hooks
- CSS 使用 Tailwind CSS 实用类
- API 调用统一通过 `services/api.ts` 进行

## 许可证

MIT License

## 联系方式

有任何问题或建议，请通过以下方式联系：
- 📧 contact@gaokao.com
- 📞 400-123-4567
