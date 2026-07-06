# 快速启动指南

## 一分钟快速开始

### 前置准备
1. 确保已安装 Node.js 16+ 和 PostgreSQL
2. PostgreSQL 已启动，用户名/密码为 postgres/postgres

### 第一步：初始化数据库

打开 PostgreSQL 命令行或使用工具（如 pgAdmin），执行：

```sql
CREATE DATABASE college_choice;
```

然后导入 Schema：
```bash
# Windows Git Bash / PowerShell
psql -U postgres -d college_choice -f backend/src/db/schema.sql
```

### 第二步：启动后端

打开一个终端窗口：
```bash
cd college-choice-website/backend
npm install  # 第一次运行时
npm run dev
```

看到 `Server running on http://localhost:5000` 表示启动成功 ✓

### 第三步：启动前端

打开另一个终端窗口：
```bash
cd college-choice-website/frontend
npm install  # 第一次运行时
npm run dev
```

看到 `http://localhost:5173` 链接表示启动成功 ✓

### 第四步：访问网站

在浏览器打开 `http://localhost:5173`，你应该看到首页包含：
- 轮播推荐专业区
- 推荐专业卡片（6个）
- 热点话题/新闻列表
- 登录/注册功能

## 测试核心功能

### 1. 测试首页加载
- [ ] 访问首页，轮播图自动播放
- [ ] 推荐专业卡片正常显示
- [ ] 新闻列表正常加载

### 2. 测试用户注册
- [ ] 点击"注册"按钮
- [ ] 输入邮箱、密码、用户名
- [ ] 点击注册成功提示出现

### 3. 测试用户登录
- [ ] 点击"登录"按钮
- [ ] 输入邮箱和密码
- [ ] 成功登录

### 4. 测试轮播交互
- [ ] 点击左右箭头切换幻灯片
- [ ] 点击下方圆点指示器切换
- [ ] 验证自动播放功能

### 5. 响应式设计测试
- [ ] 在桌面浏览器上检查布局
- [ ] 使用浏览器开发者工具模拟移动端
- [ ] 验证移动设备上导航菜单正常

## 常见问题

### 问题 1：数据库连接失败
**错误信息**: `Error: connect ECONNREFUSED`

**解决方案**:
1. 确保 PostgreSQL 服务已启动
2. 检查 `.env` 文件中的数据库配置是否正确
3. 检查数据库是否已创建：`createdb college_choice`

### 问题 2：CORS 错误
**错误信息**: `Access to XMLHttpRequest blocked by CORS policy`

**解决方案**:
1. 确保后端 `.env` 中的 `FRONTEND_URL` 为 `http://localhost:5173`
2. 重启后端服务

### 问题 3：前端无法加载样式
**症状**: 页面加载但没有 Tailwind CSS 样式

**解决方案**:
1. 重新运行 `npm install` 确保 Tailwind 已安装
2. 清除浏览器缓存：F12 → 存储 → 清除所有缓存

### 问题 4：端口已被占用
**错误信息**: `Error: listen EADDRINUSE`

**解决方案**:
1. 修改 `.env` 中的 `PORT` 为其他端口（如 5001）
2. 或者杀死占用该端口的进程

## 生成的文件结构

```
college-choice-website/
├── backend/
│   ├── src/
│   │   ├── controllers/       # 业务逻辑
│   │   │   ├── homeController.ts
│   │   │   └── authController.ts
│   │   ├── routes/            # 路由定义
│   │   │   ├── home.ts
│   │   │   └── auth.ts
│   │   ├── models/            # 数据模型
│   │   ├── middleware/        # 中间件
│   │   │   └── cors.ts
│   │   ├── db/               # 数据库相关
│   │   │   ├── schema.sql
│   │   │   └── database.ts
│   │   └── server.ts         # 主服务文件
│   ├── .env                   # 环境变量
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── Header.tsx
│   │   │   ├── Carousel.tsx
│   │   │   ├── Featured.tsx
│   │   │   ├── News.tsx
│   │   │   └── Auth.tsx
│   │   ├── pages/            # 页面
│   │   │   └── HomePage.tsx
│   │   ├── services/         # API 调用
│   │   │   └── api.ts
│   │   └── App.tsx           # 主应用
│   ├── .env                   # 环境变量
│   ├── tailwind.config.js     # Tailwind 配置
│   ├── postcss.config.js      # PostCSS 配置
│   ├── vite.config.ts         # Vite 配置
│   ├── package.json
│   └── tsconfig.json
│
├── README.md                  # 项目说明
└── QUICKSTART.md             # 本文件
```

## 下一步

1. **扩展功能**: 按照 README.md 中的待开发模块清单继续开发
2. **数据管理**: 向数据库添加更多专业、新闻数据
3. **优化性能**: 添加缓存、图片懒加载等优化
4. **部署上线**: 配置生产环境部署

## 获取帮助

- 查看后端日志：终端中查看 `npm run dev` 的输出
- 查看前端错误：浏览器 F12 开发者工具 → Console
- 检查网络请求：浏览器 F12 → Network 标签

祝你开发愉快！🚀
