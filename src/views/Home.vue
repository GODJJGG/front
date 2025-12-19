<template>
    <div class="common-layout">
        <el-container class="lay-container">
            <!--自定义左侧组件-->
            <common-aside />
            <el-container>
                <el-header class="el-header">
                    <common-header />
                </el-header>
                <el-main class="right-main">
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>


<script setup>
import CommonAside from '@/components/CommonAside.vue';
import CommonHeader from '@/components/CommonHeader.vue';
import { ref, provide } from 'vue';
import router from '../router';

// 侧边栏收缩状态
const isCollapsed = ref(false);

// 侧边栏收缩函数
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

// 向子组件提供状态和切换函数
provide('sidebarState', {
    isCollapsed,
    toggleCollapse
});
</script>



<style scoped lang="less">
.common-layout {
    height: 100%;
}

.lay-container {
    height: 100%;
}

.el-header {
    background-color: #333;
}

.right-main {
    height: 100%;
    overflow: auto;
}
</style>
