// API基础配置
const API_BASE_URL = 'http://localhost:8080/api' // 根据实际后端地址修改

// 通用请求函数
const request = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  // 添加token到请求头
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || '请求失败')
    }

    return data
  } catch (error) {
    console.error('API请求失败:', error)
    throw error
  }
}

// 认证相关API
export const authAPI = {
  // 登录
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),

  // 注册
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  // 登出
  logout: () => request('/auth/logout', {
    method: 'POST'
  })
}

// 车辆管理API
export const vehicleAPI = {
  // 获取车辆列表
  getVehicles: (params = {}) => request('/vehicles', {
    method: 'GET',
    body: params ? new URLSearchParams(params) : undefined
  }),

  // 添加车辆
  addVehicle: (vehicleData) => request('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData)
  }),

  // 更新车辆信息
  updateVehicle: (id, vehicleData) => request(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vehicleData)
  }),

  // 删除车辆
  deleteVehicle: (id) => request(`/vehicles/${id}`, {
    method: 'DELETE'
  }),

  // 获取我的车辆
  getMyVehicles: () => request('/vehicles/my', {
    method: 'GET'
  })
}

// 违章管理API
export const violationAPI = {
  // 获取违章记录列表
  getViolations: (params = {}) => request('/violations', {
    method: 'GET',
    body: params ? new URLSearchParams(params) : undefined
  }),

  // 申报违章
  reportViolation: (violationData) => request('/violations', {
    method: 'POST',
    body: JSON.stringify(violationData)
  }),

  // 审核违章申报
  reviewViolation: (id, reviewData) => request(`/violations/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
  }),

  // 获取待审核违章
  getPendingViolations: () => request('/violations/pending', {
    method: 'GET'
  }),

  // 获取我的违章申报
  getMyViolations: () => request('/violations/my', {
    method: 'GET'
  }),

  // 获取已审核违章记录
  getApprovedViolations: () => request('/violations/approved', {
    method: 'GET'
  })
}

// 用户管理API
export const userAPI = {
  // 获取用户信息
  getUserInfo: () => request('/user/info', {
    method: 'GET'
  }),

  // 更新用户信息
  updateUserInfo: (userData) => request('/user/info', {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),

  // 获取用户列表（管理员）
  getUsers: (params = {}) => request('/users', {
    method: 'GET',
    body: params ? new URLSearchParams(params) : undefined
  })
}

// 文件上传API
export const fileAPI = {
  // 上传文件
  uploadFile: (file, type = 'image') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return request('/upload', {
      method: 'POST',
      headers: {
        // 不要设置Content-Type，让浏览器自动设置
        ...Object.fromEntries(
          Object.entries(request.headers || {}).filter(([key]) => key !== 'Content-Type')
        )
      },
      body: formData
    })
  },

  // 批量上传文件
  uploadFiles: (files, type = 'image') => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    formData.append('type', type)

    return request('/upload/batch', {
      method: 'POST',
      headers: {
        ...Object.fromEntries(
          Object.entries(request.headers || {}).filter(([key]) => key !== 'Content-Type')
        )
      },
      body: formData
    })
  }
}