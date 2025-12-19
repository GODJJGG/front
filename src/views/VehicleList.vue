<template>
  <div class="vehicle-list">
    <h2>车辆列表</h2>
    <el-table :data="vehicles" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="车辆编号" width="120"></el-table-column>
      <el-table-column prop="studentId" label="学生学号" width="120"></el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
      <el-table-column prop="type" label="车辆类型" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { vehicleAPI } from '@/api'

const vehicles = ref([])
const loading = ref(false)

const loadVehicles = async () => {
  try {
    loading.value = true
    const response = await vehicleAPI.getVehicles()
    vehicles.value = response.data || response
  } catch (error) {
    console.error('获取车辆列表失败:', error)
    ElMessage.error('获取车辆列表失败')
    // 临时使用假数据作为后备
    vehicles.value = [
      {
        id: 'V001',
        studentId: '2023001',
        studentName: '张三',
        type: '电动车',
        status: '正常'
      },
      {
        id: 'V002',
        studentId: '2023002',
        studentName: '李四',
        type: '自行车',
        status: '正常'
      }
    ]
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  console.log('编辑车辆:', row)
  // TODO: 实现编辑功能
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