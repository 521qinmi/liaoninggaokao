# 🚀 快速修复指南 - 让网站立即运行

## ⚡ 3 步快速启动（5 分钟）

### 第 1 步：初始化数据库（1 分钟）

打开命令行，执行：

```bash
# 创建数据库
createdb college_choice

# 导入 Schema（确保你在项目根目录）
cd ~/Desktop/college-choice-website
psql -U postgres -d college_choice -f backend/src/db/schema.sql
```

✅ 看到 `INSERT 0 3` 和 `INSERT 0 6` 等输出表示成功

---

### 第 2 步：启动后端（1 分钟）

打开**一个新的命令行窗口**，执行：

```bash
cd ~/Desktop/college-choice-website/backend
npm run dev
```

✅ 看到这样的输出：
```
Server running on http://localhost:5000
```

**不要关闭这个窗口！** 让它继续运行。

---

### 第 3 步：启动前端（1 分钟）

打开**另一个新的命令行窗口**，执行：

```bash
cd ~/Desktop/college-choice-website/frontend
npm run dev
```

✅ 看到这样的输出：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## 🎉 打开浏览器

在浏览器地址栏输入并访问：

```
http://localhost:5173
```

**你应该看到：**
- 顶部紫色导航栏（高考志愿 LOGO）
- 轮播推荐专业区（自动播放）
- 推荐专业卡片（6 个）
- 热点话题/新闻区
- 页脚信息

---

## ✨ 尝试这些功能

### 1. 测试轮播
- 自动播放（4 秒切换一次）
- 点击左右箭头手动切换
- 点击下方圆点快速导航

### 2. 测试用户注册
- 点击"注册"按钮
- 输入：
  - 邮箱：`test@example.com`
  - 用户名：`testuser`
  - 密码：`123456`
- 点击"注册"
- 看到成功提示

### 3. 测试用户登录
- 点击"登录"按钮
- 输入刚注册的邮箱和密码
- 点击"登录"
- 看到成功提示

### 4. 测试响应式
- 按 F12 打开开发者工具
- 点击左上角"切换设备工具栏"（手机图标）
- 选择不同设备（iPhone、iPad、Android）
- 查看页面自动适配

---

## 🆘 如果还是看不到画面

### 情况 1：前端显示空白

**检查：** 按 F12 打开浏览器开发者工具

**如果看到这样的红色错误：**
```
Failed to fetch from /api/home/data
```

**原因：** 后端没有启动或数据库连接失败

**解决：**
1. 检查后端终端是否显示 `Server running on...`
2. 如果没有，重新启动后端：
   ```bash
   cd ~/Desktop/college-choice-website/backend
   npm run dev
   ```
3. 稍等 2 秒，然后刷新浏览器（F5）

---

### 情况 2：页面加载但没有样式（全是文本）

**原因：** Tailwind CSS 没有正确加载

**解决：**
```bash
cd ~/Desktop/college-choice-website/frontend

# 清理缓存
rm -rf dist node_modules/.vite

# 重新启动
npm run dev
```

然后在浏览器中：
- 按 Ctrl+Shift+R（硬刷新，清除浏览器缓存）
- 或者按 F5 然后 Ctrl+F5

---

### 情况 3：看到错误 "Cannot GET /"

**原因：** Vite 没有正确启动

**解决：**
```bash
cd ~/Desktop/college-choice-website/frontend

# 完全重新安装
rm -rf node_modules package-lock.json
npm install

# 重新启动
npm run dev
```

等待看到 `http://localhost:5173/` 的输出，然后刷新浏览器。

---

### 情况 4：数据库连接失败

**错误信息看起来像：**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**原因：** PostgreSQL 没有启动或数据库没有创建

**解决：**
1. 确保 PostgreSQL 已启动
2. 运行命令创建数据库：
   ```bash
   createdb college_choice
   psql -U postgres -d college_choice -f ~/Desktop/college-choice-website/backend/src/db/schema.sql
   ```
3. 重启后端：
   ```bash
   cd ~/Desktop/college-choice-website/backend
   npm run dev
   ```

---

## 🔍 快速诊断命令

在命令行运行这些命令来检查各个部分：

```bash
# 1. 检查 Node.js
node -v

# 2. 检查后端是否启动
curl http://localhost:5000/health

# 预期输出：
# {"status":"Backend server is running"}

# 3. 检查数据库
psql -U postgres -d college_choice -c "SELECT COUNT(*) FROM majors;"

# 预期输出：
# count
# -------
#      6
```

---

## 📋 完整启动检查清单

在启动前，确认以下所有项目都打上 ✓：

- [ ] Node.js 已安装（`node -v` >= v16）
- [ ] PostgreSQL 已安装并运行
- [ ] 项目文件位于 `~/Desktop/college-choice-website/`
- [ ] 后端目录：`~/Desktop/college-choice-website/backend/`
- [ ] 前端目录：`~/Desktop/college-choice-website/frontend/`

**启动过程：**
- [ ] 数据库已初始化 (`createdb college_choice`)
- [ ] Schema 已导入 (看到 INSERT 输出)
- [ ] 后端启动成功 (看到 `Server running...`)
- [ ] 前端启动成功 (看到 `http://localhost:5173`)
- [ ] 浏览器能访问 http://localhost:5173

---

## 🎯 故障排查图表

```
看不到画面
    ↓
按 F12 打开开发者工具
    ↓
是否有红色错误？
    ├─ 是 → 查看错误信息，参考上面的 "情况 1/2/3/4"
    └─ 否 → 刷新页面 (Ctrl+Shift+R)
         ↓
         仍然是空白？
         ├─ 是 → 检查后端终端，看是否有错误
         └─ 否 → 🎉 成功！
```

---

## 💡 常用快捷键

| 快捷键 | 作用 |
|--------|------|
| F12 | 打开浏览器开发者工具 |
| F5 | 刷新页面 |
| Ctrl+Shift+R | 硬刷新（清除缓存） |
| Ctrl+C | 停止正在运行的服务 |
| Ctrl+L | 清空终端 |

---

## 📞 仍然有问题？

1. **查看后端终端输出** - 是否有错误信息？
2. **打开浏览器 F12 Console** - 是否有红色错误？
3. **运行诊断命令** - 看上面的"快速诊断命令"部分
4. **查看详细文档** - 参考 `TROUBLESHOOT.md` 文件

---

## ✅ 成功标志

当你看到以下内容，说明完全成功了！

✅ **后端终端显示：**
```
Server running on http://localhost:5000
```

✅ **前端终端显示：**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

✅ **浏览器显示：**
- 紫色导航栏
- 轮播图自动播放
- 6 个专业卡片
- 5 条新闻
- 登录/注册按钮可点击

---

**现在就启动你的网站吧！🚀**

```bash
# 快速启动命令（复制粘贴）
cd ~/Desktop/college-choice-website

# 终端 1
cd backend && npm run dev

# 终端 2（新窗口）
cd frontend && npm run dev

# 浏览器
http://localhost:5173
```

祝你成功！🎉
