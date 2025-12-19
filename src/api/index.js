import axios from 'axios'
import config from '@/config'

// 创建axios实例
const request = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加token
request.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = localStorage.getItem(config.TOKEN_KEY || 'token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理响应和错误
request.interceptors.response.use(
  response => {
    // 直接返回data部分
    return response.data
  },
  error => {
    console.error('API请求失败:', error)
    // 处理HTTP错误状态
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem(config.TOKEN_KEY)
          window.location.href = '/'
          break
        case 403:
          console.error('权限不足')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error(`请求失败: ${status}`)
      }
      // 返回后端错误信息
      return Promise.reject(new Error(data?.message || `请求失败: ${status}`))
    } else if (error.request) {
      // 网络错误
      return Promise.reject(new Error('网络连接失败，请检查网络连接'))
    } else {
      // 其他错误
      return Promise.reject(error)
    }
  }
)

// 认证相关API
export const authAPI = {
  // 登录
  login: (username, password) => request.post('/auth/login', { username, password }),

  // 注册
  register: (userData) => request.post('/auth/register', userData),

  // 登出
  logout: () => request.post('/auth/logout')
}

// 车辆管理API
export const vehicleAPI = {
  // 获取车辆列表
  getVehicles: (params = {}) => request.get('/vehicles', { params }),

  // 添加车辆
  addVehicle: (vehicleData) => request.post('/vehicles', vehicleData),

  // 更新车辆信息
  updateVehicle: (id, vehicleData) => request.put(`/vehicles/${id}`, vehicleData),

  // 删除车辆
  deleteVehicle: (id) => request.delete(`/vehicles/${id}`),

  // 获取我的车辆
  getMyVehicles: (userId) => request.get(`/vehicles/my/${userId}`)
}

// 违章管理API
export const violationAPI = {
  // 获取违章记录列表
  getViolations: (params = {}) => request.get('/violations', { params }),

  // 申报违章
  reportViolation: (violationData) => request.post('/violations', violationData),

  // 审核违章申报
  reviewViolation: (id, reviewData) => request.put(`/violations/${id}/review`, reviewData),

  // 获取待审核违章
  getPendingViolations: () => request.get('/violations/pending'),

  // 获取我的违章申报
  getMyViolations: (userId) => request.get(`/violations/my/${userId}`),

  // 获取已审核违章记录
  getApprovedViolations: () => request.get('/violations/approved')
}

// 用户管理API
export const userAPI = {
  // 获取用户信息
  getUserInfo: () => request.get('/user/info'),

  // 更新用户信息
  updateUserInfo: (userData) => request.put('/user/info', userData),

  // 获取用户列表（管理员）
  getUsers: (params = {}) => request.get('/users', { params })
}

// 文件上传API
export const fileAPI = {
  // 上传文件
  uploadFile: (file, type = 'image') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 批量上传文件
  uploadFiles: (files, type = 'image') => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    formData.append('type', type)

    return request.post('/upload/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}