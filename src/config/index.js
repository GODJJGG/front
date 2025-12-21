// 环境配置
const config = {
  // API基础URL - 更新为后端实际地址
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090',

  // 其他配置
  TIMEOUT: 10000,
  TOKEN_KEY: 'token'
}

export default config