// 环境配置
const config = {
  // API基础URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',

  // 其他配置
  TIMEOUT: 10000,
  TOKEN_KEY: 'token'
}

export default config