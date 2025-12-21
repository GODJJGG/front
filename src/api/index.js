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
    const res = response.data
    // 兼容后端Result结构
    if (res.code !== undefined) {
      if (res.code === 0) {
        // 成功，添加success字段兼容前端逻辑
        res.success = true
        return res
      } else {
        // 业务错误
        return Promise.reject(new Error(res.message || '操作失败'))
      }
    }
    return res
  },
  error => {
    console.error('API请求失败:', error)
    // ... (rest of error handling)
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
  login: (username, password) => request.post('/login/login', { username, password }),

  // 注册
  register: (userData) => request.post('/login/register', userData),

  // 登出 - 后端暂无此接口，暂时保留
  logout: () => request.post('/auth/logout')
}

// 车辆管理API
export const vehicleAPI = {
  // 获取车辆列表
  getVehicles: () => request.get('/vehicle/getVehicleList'),

  // 添加车辆
  addVehicle: (vehicleData) => request.post('/vehicle/addVehicle', vehicleData),

  // 更新车辆信息 - 后端暂无编辑详情接口
  updateVehicle: (id, data) => Promise.resolve({ code: 0, message: '暂不支持编辑' }),

  // 删除车辆
  deleteVehicle: (id) => request.delete('/vehicle/deleteVehicle', { params: { id } }),

  // 获取我的车辆 - 使用获取所有车辆接口，前端过滤
  getMyVehicles: (userId) => request.get('/vehicle/getVehicleList'),

  // 获取待审核车辆申请 - 使用获取所有车辆接口，前端过滤
  getPendingVehicles: () => request.get('/vehicle/getVehicleList'),

  // 审核车辆申请 - 对应后端的updateVehicle接口(通过审核)
  reviewVehicle: (id, reviewData) => request.put('/vehicle/updatevehicle', { id, ...reviewData })
}

// 违章管理API
export const violationAPI = {
  // 获取违章记录列表
  getViolations: (params = {}) => request.get('/violations', { params }),

  // 申报违章 - 使用添加车辆接口(复用Vehicle表)
  reportViolation: (violationData) => request.post('/vehicle/addVehicle', violationData),

  // 审核违章申报
  reviewViolation: (id, reviewData) => request.put('/vehicle/updatevehicle', { id, ...reviewData }),

  // 删除违章申报
  deleteViolation: (id) => request.delete('/vehicle/deleteVehicle', { params: { id } }),

  // 获取待审核违章 - 使用获取所有车辆接口，前端过滤
  getPendingViolations: () => request.get('/vehicle/getVehicleList'),

  // 获取我的违章申报
  getMyViolations: (userId) => request.get('/vehicle/getVehicleList'),

  // 获取已审核违章记录 - 使用获取所有车辆接口，前端过滤
  getApprovedViolations: () => request.get('/vehicle/getVehicleList')
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

// 猫咪管理API（对应后端的CatController）
export const catAPI = {
  // 获取猫咪列表
  getCats: (id) => request.get('/cat/listCat', { params: { id } }),

  // 添加猫咪
  addCat: (catData) => request.post('/cat/addCat', catData),

  // 更新猫咪信息
  updateCat: (catData) => request.put('/cat/updateCat', catData),

  // 删除猫咪
  deleteCat: (id) => request.delete('/cat/deleteCat', { params: { id } })
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