<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>学生电动车管理系统</h2>

      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onLogin" :loading="loading" style="width: 100%">登录</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
            </el-form-item>
            <el-form-item label="角色" prop="role">
              <el-select v-model="registerForm.role" placeholder="您的身份是">
                <el-option label="学生" value="student"></el-option>
                <el-option label="老师" value="teacher"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onRegister" :loading="registerLoading" style="width: 100%">注册</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/api'

const router = useRouter()
const userStore = useUserStore()

// 标签页状态
const activeTab = ref('login')

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const loginFormRef = ref()
const registerFormRef = ref()
const loading = ref(false)
const registerLoading = ref(false)

const handleTabClick = (tab) => {
  // 切换标签页时重置表单
  if (tab.props.name === 'login') {
    loginFormRef.value?.resetFields()
  } else {
    registerFormRef.value?.resetFields()
  }
}

const onLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true

    // 优先检查管理员账号
    if (loginForm.username === 'admin' && loginForm.password === '123456') {
      const adminUser = {
        id: 1,
        username: 'admin',
        role: 'admin',
        permissions: ['view_main', 'manage_vehicles', 'manage_violations']
      }
      userStore.setToken('admin-token')
      userStore.setUser(adminUser)
      ElMessage.success('管理员登录成功')
      router.push('/home/main')
      return
    }

    // 调用后端登录API
    const response = await authAPI.login(loginForm.username, loginForm.password)

    if (response.success) {
      userStore.setToken(response.token)
      userStore.setUser(response.user)
      ElMessage.success('登录成功')
      router.push('/home/main')
    } else {
      ElMessage.error(response.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const onRegister = async () => {
  try {
    await registerFormRef.value.validate()
    registerLoading.value = true

    // 调用后端注册API
    const response = await authAPI.register({
      username: registerForm.username,
      password: registerForm.password,
      role: registerForm.role
    })

    if (response.success) {
      ElMessage.success('注册成功，请登录')
      activeTab.value = 'login'
      registerFormRef.value.resetFields()
    } else {
      ElMessage.error(response.message || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请重试')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>