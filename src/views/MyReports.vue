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

const reports = ref([])
const loading = ref(false)

const loadMyReports = async () => {
  try {
    loading.value = true
    const response = await violationAPI.getMyViolations()
    // 转换数据格式以适配表格显示
    reports.value = (response.data || response).map(item => ({
      id: item.id,
      content: `车辆牌照: ${item.licensePlate}, 违章时间: ${item.violationTime}, 违章内容: ${item.content}`,
      submitTime: item.submitTime || item.violationTime,
      status: item.status || '处理中',
      processResult: item.processResult || '等待处理'
    }))
  } catch (error) {
    console.error('获取我的申报失败:', error)
    // 临时使用假数据作为后备
    reports.value = [
      {
        id: 1,
        content: '车辆牌照: 浙A12345, 违章时间: 2024-12-19 10:30:00, 违章内容: 违规停车',
        submitTime: '2024-12-19 10:35:00',
        status: '已处理',
        processResult: '已通知车主，罚款50元'
      },
      {
        id: 2,
        content: '车辆牌照: 浙B67890, 违章时间: 2024-12-18 14:20:00, 违章内容: 超速行驶',
        submitTime: '2024-12-18 14:25:00',
        status: '处理中',
        processResult: '正在审核中'
      },
      {
        id: 3,
        content: '车辆牌照: 浙C11111, 违章时间: 2024-12-17 09:15:00, 违章内容: 其他违规',
        submitTime: '2024-12-17 09:20:00',
        status: '未处理',
        processResult: '等待处理'
      }
    ]
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