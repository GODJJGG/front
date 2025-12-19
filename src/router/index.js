import {createRouter, createWebHashHistory} from 'vue-router'
import { useUserStore } from '@/stores/user'

//路由规则
const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
    },
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: "main",
                name: "Main",
                component: () => import('@/views/Main.vue'),
                meta: { permission: 'view_main' }
            },
            {
                path: "vehicles/list",
                name: "VehicleList",
                component: () => import('@/views/VehicleList.vue'),
                meta: { permission: 'manage_vehicles' }
            },
            {
                path: "vehicles/add",
                name: "AddVehicle",
                component: () => import('@/views/AddVehicle.vue'),
                meta: { permission: 'manage_vehicles' }
            },
            {
                path: "vehicles/review",
                name: "VehicleReview",
                component: () => import('@/views/VehicleReview.vue'),
                meta: { permission: 'manage_vehicles' }
            },
            {
                path: "my-vehicle",
                name: "MyVehicle",
                component: () => import('@/views/MyVehicle.vue'),
                meta: { permission: 'manage_vehicles' }
            },
            {
                path: "my-violations",
                name: "MyViolations",
                component: () => import('@/views/MyViolations.vue'),
                meta: { permission: 'manage_violations' }
            },
            {
                path: "violations/add",
                name: "AddViolation",
                component: () => import('@/views/AddViolation.vue'),
                meta: { permission: 'manage_violations' }
            },
            {
                path: "violations/review",
                name: "ViolationReview",
                component: () => import('@/views/ViolationReview.vue'),
                meta: { permission: 'manage_violations' }
            },
            {
                path: "violations/records",
                name: "ViolationRecords",
                component: () => import('@/views/ViolationRecords.vue'),
                meta: { permission: 'manage_violations' }
            },
            {
                path: "my-reports",
                name: "MyReports",
                component: () => import('@/views/MyReports.vue'),
                meta: { permission: 'manage_violations' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    // 需要登录的页面
    if (to.meta.requiresAuth && !userStore.token) {
        next('/login')
        return
    }

    // 需要权限的页面
    if (to.meta.permission && !userStore.hasPermission(to.meta.permission)) {
        // 检查用户是否有访问主页的权限
        if (userStore.hasPermission('view_main')) {
            next('/home/main')
        } else {
            // 如果没有主页权限，跳转到登录页或显示无权限
            next('/login')
        }
        return
    }

    next()
})

export default router;