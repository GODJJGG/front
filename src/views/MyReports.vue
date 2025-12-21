<template>
  <div class="my-reports">
    <h2>我的申报</h2>
    <el-table :data="reports" style="width: 100%" v-loading="loading">
      <el-table-column prop="content" label="申报内容" width="300"></el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="200"></el-table-column>
      <el-table-column prop="status" label="状态" width="150">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="processResult" label="处理情况" width="200"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="mini" @click="viewDetail(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { violationAPI } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const reports = ref([])
const loading = ref(false)

const loadMyReports = async () => {
  try {
    loading.value = true
    const response = await violationAPI.getMyViolations(userStore.user.id)
    const rawList = response.data || []
    
    // 过滤出当前用户的违章申报
    reports.value = rawList
      .filter(item => String(item.userId) === String(userStore.user.id) && item.address && item.address.startsWith('VIOLATION'))
      .map(item => ({
        id: item.id,
        content: `车辆牌照: ${item.catNumber}, 违章内容: ${item.address.split('|')[1] || '无内容'}`,
        submitTime: item.createTime,
        status: item.status === 1 ? '处理中' : (item.status === 2 ? '已处理' : '未知'),
        processResult: item.processingresult || '等待处理'
      }))
  } catch (error) {
    console.error('获取我的申报失败:', error)
    reports.value = []
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  switch (status) {
    case '已处理':
      return 'success'
    case '处理中':
      return 'warning'
    case '未处理':
      return 'danger'
    default:
      return ''
  }
}

const viewDetail = (row) => {
  ElMessage.info(`查看申报详情: ${row.content}`)
  // 这里可以跳转到详情页面或打开弹窗
}

onMounted(() => {
  loadMyReports()
})
</script>

<style scoped>
.my-reports {
  padding: 20px;
}
</style>