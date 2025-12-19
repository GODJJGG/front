<template>
  <div class="vehicle-list">
    <h2>车辆列表</h2>
    <el-table :data="vehicles" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="车辆编号" width="120"></el-table-column>
      <el-table-column prop="studentId" label="学生学号" width="120"></el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
      <el-table-column prop="type" label="车辆类型" width="100"></el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

const loadVehicles = async () => {
  try {
    loading.value = true
    const response = await vehicleAPI.getVehicles()
    vehicles.value = response.data || response
  } catch (error) {
    console.error('获取车辆列表失败:', error)
    ElMessage.error('获取车辆列表失败')
    vehicles.value = []
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

onMounted(() => {
  loadVehicles()
})
</script>

<style scoped>
.vehicle-list {
  padding: 20px;
}
</style>