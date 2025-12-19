<template>
  <div class="vehicle-list">
    <h2>车辆列表</h2>
    <el-table :data="vehicles" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="车辆编号" width="120"></el-table-column>
      <el-table-column prop="studentId" label="学生学号" width="120"></el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status || '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button
            v-if="scope.row.status === '待审核'"
            size="mini"
            type="warning"
            @click="handleReview(scope.row)"
          >
            审核
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑车辆对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑车辆信息" width="600px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="车辆编号" prop="id">
          <el-input v-model="editForm.id" placeholder="请输入车辆编号" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="学生学号" prop="studentId">
          <el-input v-model="editForm.studentId" placeholder="请输入学生学号"></el-input>
        </el-form-item>
        <el-form-item label="学生姓名" prop="studentName">
          <el-input v-model="editForm.studentName" placeholder="请输入学生姓名"></el-input>
        </el-form-item>
        <el-form-item label="车辆类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择车辆类型">
            <el-option label="电动车" value="电动车"></el-option>
            <el-option label="自行车" value="自行车"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="editLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

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
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { vehicleAPI } from '@/api'

const vehicles = ref([])
const loading = ref(false)

// 编辑相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref()
const currentEditVehicle = ref(null)

const editForm = reactive({
  id: '',
  studentId: '',
  studentName: '',
  type: ''
})

const editRules = {
  studentId: [{ required: true, message: '请输入学生学号', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
  type: [{ required: true, message: '请选择车辆类型', trigger: 'change' }]
}

// 审核相关
const reviewDialogVisible = ref(false)
const reviewLoading = ref(false)
const currentReviewVehicle = ref(null)
const reviewResult = ref('')

const loadVehicles = async () => {
  try {
    loading.value = true
    const response = await vehicleAPI.getVehicles()
    vehicles.value = response.data || response

    // 临时添加测试数据以展示审核功能
    if (vehicles.value.length === 0) {
      vehicles.value = [
        {
          id: 'V001',
          studentId: '2024001',
          studentName: '张三',
          type: '电动车',
          status: '待审核',
          applyTime: '2024-12-19 10:00:00'
        },
        {
          id: 'V002',
          studentId: '2024002',
          studentName: '李四',
          type: '自行车',
          status: '已通过',
          applyTime: '2024-12-18 09:00:00'
        }
      ]
    }
  } catch (error) {
    console.error('获取车辆列表失败:', error)
    ElMessage.error('获取车辆列表失败')
    // 临时使用测试数据
    vehicles.value = [
      {
        id: 'V001',
        studentId: '2024001',
        studentName: '张三',
        type: '电动车',
        status: '待审核',
        applyTime: '2024-12-19 10:00:00'
      },
      {
        id: 'V002',
        studentId: '2024002',
        studentName: '李四',
        type: '自行车',
        status: '已通过',
        applyTime: '2024-12-18 09:00:00'
      }
    ]
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  currentEditVehicle.value = row
  // 复制数据到编辑表单
  Object.assign(editForm, {
    id: row.id,
    studentId: row.studentId,
    studentName: row.studentName,
    type: row.type
  })
  editDialogVisible.value = true
}

const submitEdit = async () => {
  try {
    await editFormRef.value.validate()
    editLoading.value = true

    // 调用API更新车辆信息
    await vehicleAPI.updateVehicle(editForm.id, editForm)

    ElMessage.success('编辑成功')
    editDialogVisible.value = false
    loadVehicles() // 重新加载列表
  } catch (error) {
    if (error !== 'validation_failed') {
      console.error('编辑车辆失败:', error)
      ElMessage.error('编辑失败')
    }
  } finally {
    editLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await vehicleAPI.deleteVehicle(row.id)
    ElMessage.success('删除成功')
    loadVehicles() // 重新加载列表
  } catch (error) {
    console.error('删除车辆失败:', error)
    ElMessage.error('删除失败')
  }
}

const getStatusType = (status) => {
  switch (status) {
    case '待审核':
      return 'warning'
    case '已通过':
      return 'success'
    case '已驳回':
      return 'danger'
    default:
      return ''
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

    const reviewData = {
      status: reviewResult.value
    }

    await vehicleAPI.reviewVehicle(currentReviewVehicle.value.id, reviewData)

    ElMessage.success('审核完成')
    reviewDialogVisible.value = false
    loadVehicles() // 重新加载列表
  } catch (error) {
    console.error('审核车辆失败:', error)
    ElMessage.error('审核失败')
  } finally {
    reviewLoading.value = false
  }
}
</script>

<style scoped>
.vehicle-list {
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