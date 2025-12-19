<template>
  <el-aside :width="asideWidth" class="el-aside">
    <el-menu background-color="#545c64" text-color="#fff" router :collapse="isCollapsed">
      <h3 v-if="!isCollapsed">学生管理系统菜单</h3>
      <el-menu-item v-for="item in noChlidren" :index="item.path" :key="item.path">
        <component class="icons" :is="item.icon"></component>
        <span>{{ item.label }}</span>
      </el-menu-item>
      <el-sub-menu v-for="item in hasChildren" :index="item.path" :key="item.path">
        <template #title>
          <component class="icons" :is="item.icon"></component>
          <span>{{ item.label }}</span>
        </template>
        <el-menu-item-group>
          <el-menu-item v-for="subItem in item.children" :index="subItem.path" :key="subItem.path">
            <component class="icons" :is="subItem.icon"></component>
            <span>{{ subItem.label }}</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useUserStore } from '@/stores/user'
import { HomeFilled, User, Bicycle, Warning, Document } from '@element-plus/icons-vue'

const userStore = useUserStore()

// 注入侧边栏状态
const { isCollapsed } = inject('sidebarState')

// 根据收缩状态动态设置宽度
const asideWidth = computed(() => {
  return isCollapsed.value ? '64px' : '180px'
})

// 根据用户角色返回不同的菜单
const getMenuList = () => {
  const baseMenu = [
    {
      path: '/home/main',
      name: 'Main',
      label: '首页',
      icon: 'HomeFilled',
      permission: 'view_main'
    }
  ]

  if (userStore.user?.role === 'teacher') {
    // 老师菜单：首页、违章申报、我的申报
    return [
      ...baseMenu,
      {
        path: '/home/violations/add',
        name: 'AddViolation',
        label: '违章申报',
        icon: 'Warning',
        permission: 'manage_violations'
      },
      {
        path: '/home/my-reports',
        name: 'MyReports',
        label: '我的申报',
        icon: 'Document',
        permission: 'manage_violations'
      }
    ]
  } else if (userStore.user?.role === 'student') {
    // 学生菜单：首页、车辆申请、我的车辆
    return [
      ...baseMenu,
      {
        path: '/home/vehicles/add',
        name: 'AddVehicle',
        label: '车辆申请',
        icon: 'Bicycle',
        permission: 'manage_vehicles'
      },
      {
        path: '/home/my-vehicle',
        name: 'MyVehicle',
        label: '我的车辆',
        icon: 'Bicycle',
        permission: 'manage_vehicles'
      },
      {
        path: '/home/my-violations',
        name: 'MyViolations',
        label: '我的违章',
        icon: 'Warning',
        permission: 'manage_violations'
      }
    ]
  } else {
    // 管理员菜单：所有功能
    return [
      ...baseMenu,
      {
        path: '/home/vehicles',
        name: 'Vehicles',
        label: '车辆管理',
        icon: 'Bicycle',
        permission: 'manage_vehicles',
        children: [
          { path: '/home/vehicles/list', name: 'VehicleList', label: '车辆列表', permission: 'manage_vehicles' },
          { path: '/home/vehicles/add', name: 'AddVehicle', label: '添加车辆', permission: 'manage_vehicles' }
        ]
      },
      {
        path: '/home/violations',
        name: 'Violations',
        label: '违规管理',
        icon: 'Warning',
        permission: 'manage_violations',
        children: [
          { path: '/home/violations/review', name: 'ViolationReview', label: '申报审核', permission: 'manage_violations' },
          { path: '/home/violations/records', name: 'ViolationRecords', label: '违章记录', permission: 'manage_violations' }
        ]
      }
    ]
  }
}

const list = ref(getMenuList())

// 监听用户变化，更新菜单
watch(() => userStore.user, () => {
  list.value = getMenuList()
})

const noChlidren = computed(() => list.value.filter(item => !item.children))
const hasChildren = computed(() => list.value.filter(item => item.children))

</script>

<style lang="less" scoped>
.icons {
  width: 18px;
  height: 18px;
  margin-right: 5px;
}

.el-menu {
  border-right: none;

  h3 {
    line-height: 48px;
    color: #fff;
    text-align: center;
  }
}

.el-aside {
  height: 100%;
  background-color: #545c64;
}
</style>