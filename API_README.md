# 前端项目 - 学生电动车管理系统

## 后端对接配置

### 1. 修改API基础地址

#### 方法一：修改环境变量文件
编辑 `.env.development` 或 `.env.production` 文件：

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:8080/api

# 生产环境
VITE_API_BASE_URL=https://your-api-domain.com/api
```

#### 方法二：直接修改配置文件
编辑 `src/config/index.js`：

```javascript
const config = {
  API_BASE_URL: 'http://your-backend-url:port/api', // 修改这里
  TIMEOUT: 10000,
  TOKEN_KEY: 'token'
}
```

### 2. 后端API端点要求

#### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

#### 车辆管理
- `GET /api/vehicles` - 获取车辆列表（管理员）
- `POST /api/vehicles` - 添加车辆申请
- `PUT /api/vehicles/{id}` - 更新车辆信息
- `DELETE /api/vehicles/{id}` - 删除车辆
- `GET /api/vehicles/my/{userId}` - 获取我的车辆

#### 违章管理
- `GET /api/violations` - 获取违章记录列表
- `POST /api/violations` - 申报违章
- `PUT /api/violations/{id}/review` - 审核违章申报
- `GET /api/violations/pending` - 获取待审核违章
- `GET /api/violations/my/{userId}` - 获取我的违章申报
- `GET /api/violations/approved` - 获取已审核违章记录

#### 文件上传
- `POST /api/upload` - 上传单个文件
- `POST /api/upload/batch` - 批量上传文件

### 3. 请求/响应格式

#### 请求头
所有API请求都会自动添加：
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### 登录响应格式
```json
{
  "success": true,
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "permissions": ["view_main", "manage_vehicles", "manage_violations"]
  }
}
```

#### 通用响应格式
```json
{
  "success": true,
  "data": [...], // 或单个对象
  "message": "操作成功"
}
```

### 4. 错误处理

前端会自动处理以下HTTP状态码：
- `401`: 未授权，自动清除token并跳转登录页
- `403`: 权限不足
- `500`: 服务器错误

### 5. 启动项目

```bash
# 安装依赖
npm install

# 开发环境启动
npm run dev

# 生产环境构建
npm run build
```

### 6. 注意事项

1. 确保后端支持CORS跨域请求
2. Token格式为 `Bearer {token}`
3. 文件上传使用 `multipart/form-data` 格式
4. 所有需要用户身份的API都会在URL中包含用户ID