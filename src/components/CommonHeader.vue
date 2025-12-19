<template>
  <div class="header">
    <div class="l-content">
      <el-button size="small" @click="handleCollapse">
        <component class="icons" is="menu"></component>
      </el-button>
      <el-breadcrumb separator="/" class="bread">
        <router-link to="/" class="breadcrumb-link">首页</router-link>
      </el-breadcrumb>
    </div>
    <div class="r-content">
      <el-dropdown>
        <span class="el-dropdown-link">
          <img :src="getImageUrl('user')" class="user" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 注入侧边栏切换函数
const { toggleCollapse } = inject('sidebarState')

const getImageUrl = (user)=>{
  return new URL(`../assets/image/${user}.png`, import.meta.url).href
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handleCollapse = () => {
  toggleCollapse()
}
</script>

<style lang="less" scoped>
.header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  width:100%;
  height:100%;
  background-color:#333;
}

.icons {
  width:20px;
  height:20px;
}

.l-content {
  display:flex;
  align-items:center;
  .el-button {
    margin-right: 20px;
  }
}

.r-content {
  .user{
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}

:deep(.bread span){
  color:#fff !important;
  cursor:pointer !important
}

.breadcrumb-link {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}

.breadcrumb-link:hover {
  color: #ffd04b;
}

</style>