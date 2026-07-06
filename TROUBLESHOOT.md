# 🔧 故障排除指南

## 问题：访问 http://localhost:5173 没看到画面

### 快速诊断步骤

#### 第 1 步：检查前端是否启动

**终端输出应该是这样的：**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**如果看不到上面的输出：**
```bash
cd ~/Desktop/college-choice-website/frontend
npm run dev
```

---

#### 第 2 步：打开浏览器开发者工具

1. 在浏览器中按 **F12** 打开开发者工具
2. 切换到 **Console** 标签（控制台）
3. 查看是否有红色的错误信息

**常见错误及解决方案：**

##### ❌ 错误：`Cannot GET /`
- **原因**: Vite 前端没有正确启动
- **解决**: 
  - 检查前端终端是否显示 "ready"
  - 尝试: `npm install` → `npm run dev`

##### ❌ 错误：`Failed to fetch from /api/...`
- **原因**: 后端没有运行或 CORS 配置有问题
- **解决**:
  - 检查后端是否启动：`curl http://localhost:5000/health`
  - 如果后端没启动：
    ```bash
    cd ~/Desktop/college-choice-website/backend
    npm run dev
    ```

##### ❌ 错误：`fetch error: Network error`
- **原因**: 后端地址配置有误或数据库连接失败
- **解决**:
  - 检查前端 `.env` 文件中的 `VITE_API_URL` 是否为 `http://localhost:5000/api`
  - 检查数据库是否已初始化

##### ❌ 错误：`Module not found` 或类似模块错误
- **原因**: 依赖包没有安装
- **解决**:
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  npm run dev
  ```

---

#### 第 3 步：检查后端是否运行

打开新的终端窗口，运行：

```bash
curl http://localhost:5000/health
```

**预期输出：**
```json
{"status":"Backend server is running"}
```

**如果看到 "Connection refused"：**
- 后端未启动，运行：
  ```bash
  cd ~/Desktop/college-choice-website/backend
  npm run dev
  ```

**如果看到数据库错误：**
- 数据库未初始化，运行：
  ```bash
  createdb college_choice
  psql -U postgres -d college_choice -f backend/src/db/schema.sql
  ```

---

#### 第 4 步：检查浏览器网络请求

1. 按 F12 打开开发者工具
2. 切换到 **Network** 标签
3. 刷新页面 (F5)
4. 查看是否有红色的请求失败

**检查 API 调用：**
- 查找 `http://localhost:5000/api/home/data` 的请求
- 如果是红色，说明后端有问题
- 点击该请求查看 "Response" 标签查看具体错误

---

### 完整的故障排除清单

- [ ] 前端终端显示 "ready"
- [ ] 后端终端显示 "Server running on..."
- [ ] `curl http://localhost:5000/health` 返回成功
- [ ] 浏览器 F12 控制台没有红色错误
- [ ] 浏览器能加载首页内容

### 如果以上都检查过了，还是有问题

尝试完全重启：

#### 1. 关闭所有终端和浏览器

#### 2. 重新初始化数据库
```bash
cd ~/Desktop/college-choice-website

# 删除旧数据库
dropdb college_choice

# 创建新数据库
createdb college_choice

# 导入 Schema
psql -U postgres -d college_choice -f backend/src/db/schema.sql
```

#### 3. 清理依赖
```bash
# 后端
cd backend
rm -rf node_modules package-lock.json
npm install

# 前端
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

#### 4. 重新启动

**终端 1 - 后端：**
```bash
cd ~/Desktop/college-choice-website/backend
npm run dev
```

等待看到: `Server running on http://localhost:5000`

**终端 2 - 前端：**
```bash
cd ~/Desktop/college-choice-website/frontend
npm run dev
```

等待看到: `http://localhost:5173/`

#### 5. 在浏览器中访问
```
http://localhost:5173
```

#### 6. 刷新浏览器
- 普通刷新: F5
- 硬刷新（清缓存）: Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)

---

### 常见问题排查

#### Q: 我按照步骤做了还是不行？
**A:** 检查以下几点：
1. Node.js 版本是否 >= 16？ `node -v`
2. PostgreSQL 是否正常运行？
3. 端口 5000 和 5173 是否被占用？
4. 是否在正确的目录中运行命令？

#### Q: 我看到 "EADDRINUSE" 错误
**A:** 端口被占用，解决方案：
- 关闭其他占用该端口的应用
- 或者修改 `.env` 中的 PORT (如改为 5001)

#### Q: 我看到 "connect ECONNREFUSED" 错误
**A:** 后端没有启动，运行：
```bash
cd ~/Desktop/college-choice-website/backend
npm run dev
```

#### Q: 数据库初始化失败
**A:** 尝试：
```bash
# 确保 PostgreSQL 正在运行

# 删除旧数据库
dropdb college_choice

# 创建新数据库
createdb college_choice

# 导入 Schema
psql -U postgres -d college_choice -f backend/src/db/schema.sql
```

#### Q: 我看到空白页面但没有错误
**A:** 可能是：
1. 页面加载中，稍等 2-3 秒
2. 尝试硬刷新：Ctrl+Shift+R
3. 检查浏览器控制台是否有错误（F12）

---

### 获得更多帮助

如果仍然无法解决，请：
1. 查看后端终端的完整错误输出
2. 打开浏览器 F12，查看 Console 和 Network 标签
3. 确认所有依赖都已正确安装
4. 参考 README.md 中的详细说明

---

**最后的核心检查清单：**

```bash
# 1. 检查 Node.js
node -v  # 应该 >= v16.x.x

# 2. 检查数据库
psql -U postgres -c "SELECT 1 FROM college_choice LIMIT 1;"

# 3. 检查后端
curl http://localhost:5000/health

# 4. 检查前端构建
cd ~/Desktop/college-choice-website/frontend
npm run build  # 构建测试

# 如果以上都成功，再启动开发服务器
npm run dev
```

祝你成功！🚀
