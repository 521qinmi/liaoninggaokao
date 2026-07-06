#!/bin/bash

echo "🚀 高考志愿网站 - 开发启动脚本"
echo "================================"
echo ""

# 检查依赖
echo "✅ 检查依赖..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"
echo "✓ npm 版本: $(npm -v)"
echo ""

# 询问用户是否要初始化数据库
read -p "是否要初始化数据库？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 初始化数据库..."
    createdb college_choice 2>/dev/null || echo "⚠️ 数据库可能已存在"
    psql -U postgres -d college_choice -f backend/src/db/schema.sql
    echo "✅ 数据库初始化完成"
    echo ""
fi

# 启动后端
echo "🔧 启动后端服务器..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✓ 后端进程 ID: $BACKEND_PID"
sleep 2

# 启动前端
echo ""
echo "🎨 启动前端开发服务器..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✓ 前端进程 ID: $FRONTEND_PID"
echo ""

echo "================================"
echo "✅ 启动完成！"
echo ""
echo "📱 前端地址: http://localhost:5173"
echo "🔌 后端地址: http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止两个服务"
echo "================================"

# 等待用户中断
wait
