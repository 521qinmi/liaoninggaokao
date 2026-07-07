// API 配置
const isDev = import.meta.env.DEV;

export const API_BASE_URL = isDev
  ? '/api'  // 开发环境使用相对路径（Vite 代理）
  : (import.meta.env.VITE_API_URL || 'https://zhixuanweilai.onrender.com/api');  // 生产环境使用完整 URL

console.log('API_BASE_URL:', API_BASE_URL);
