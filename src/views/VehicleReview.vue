<template>
  <div class="vehicle-review">
    <h2>车辆申请审核</h2>
    <el-table :data="pendingVehicles" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="车辆编号" width="120"></el-table-column>
      <el-table-column prop="studentId" label="学生学号" width="120"></el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
      <el-table-column prop="type" label="车辆类型" width="100"></el-table-column>
      <el-table-column prop="applyTime" label="申请时间" width="180"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="handleReview(scope.row)">
            审核
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 审核车辆申请对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="审核车辆申请" width="500px">
      <div class="review-content">
        <div class="vehicle-info">
          <h3>车辆申请信息</h3>
          <p><strong>车辆编号：</strong>{{ currentReviewVehicle?.id }}</p>
          <p><strong>学生学号：</strong>{{ currentReviewVehicle?.studentId }}</p>
          <p><strong>学生姓名：</strong>{{ currentReviewVehicle?.studentName }}</p>
          <p><strong>车辆类型：</strong>{{ currentReviewVehicle?.type }}</p>
          <p><strong>申请时间：</strong>{{ currentReviewVehicle?.applyTime }}</p>
        </div>
        <div class="review-options">
          <h3>审核结果</h3>
          <el-radio-group v-model="reviewResult">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">驳回</el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitReview"
            :loading="reviewLoading"
            :disabled="!reviewResult"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { vehicleAPI } from '@/api'

const pendingVehicles = ref([])
const loading = ref(false)

// 审核相关
const reviewDialogVisible = ref(false)
const reviewLoading = ref(false)
const currentReviewVehicle = ref(null)
const reviewResult = ref('')

const loadPendingVehicles = async () => {
  try {
    loading.value = true
    const response = await vehicleAPI.getPendingVehicles()
    
    // 映射后端数据到前端表格格式，并过滤出待审核(status=1)且非违章记录的记录
    const rawList = response.data || []
    pendingVehicles.value = rawList
      .filter(item => item.status == 1 && (!item.address || !item.address.startsWith('VIOLATION')))
      .map(item => ({
        id: item.catNumber, // 车牌号作为ID
        studentId: item.userId, // 车主ID
        studentName: '未知', // 后端未返回姓名
        type: item.address ? item.address.split('-')[0] : '未知', // 从address解析类型
        applyTime: item.createTime,
        originalId: item.id // 保存原始数据库ID用于操作
      }))

  } catch (error) {
    console.error('获取待审核车辆失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleReview = (row) => {
  currentReviewVehicle.value = row
  reviewResult.value = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  if (!reviewResult.value) {
    ElMessage.warning('请选择审核结果')
    return
  }

  try {
    reviewLoading.value = true

    if (reviewResult.value === 'approved') {
      // 通过审核
      await vehicleAPI.reviewVehicle(currentReviewVehicle.value.originalId, { status: 2 })
      ElMessage.success('审核已通过')
    } else {
      // 驳回审核 (删除申请)
      await vehicleAPI.deleteVehicle(currentReviewVehicle.value.originalId)
      ElMessage.success('审核已驳回')
    }

    reviewDialogVisible.value = false
    loadPendingVehicles() // 重新加载列表
  } catch (error) {
    console.error('审核车辆失败:', error)
    ElMessage.error('审核失败')
  } finally {
    reviewLoading.value = false
  }
}

onMounted(() => {
  loadPendingVehicles()
})
</script>

<style scoped>
.vehicle-review {
  padding: 20px;
}

.review-content {
  padding: 20px 0;
}

.vehicle-info {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.vehicle-info h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.vehicle-info p {
  margin: 8px 0;
  line-height: 1.5;
}

.review-options h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.review-options .el-radio-group {
  margin-bottom: 10px;
}
</style>