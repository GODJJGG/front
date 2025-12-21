<template>
  <div class="violation-records">
    <h2>违章记录</h2>
    <el-table :data="approvedViolations" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="记录ID" width="80"></el-table-column>
      <el-table-column prop="licensePlate" label="车牌号码" width="120"></el-table-column>
      <el-table-column prop="violationTime" label="违章时间" width="180"></el-table-column>
      <el-table-column prop="location" label="违章地点" width="150"></el-table-column>
      <el-table-column prop="content" label="违章内容" min-width="200"></el-table-column>
      <el-table-column prop="reporter" label="申报人" width="100"></el-table-column>
      <el-table-column prop="approvedTime" label="审核通过时间" width="180"></el-table-column>
      <el-table-column prop="processResult" label="处理结果" min-width="150"></el-table-column>
      <el-table-column label="现场相片" width="120">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button size="mini" type="primary" @click="viewPhotos(scope.row)">查看相片</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 相片查看弹窗 -->
    <el-dialog v-model="photoDialogVisible" title="现场相片" width="600px">
      <div class="photo-gallery">
        <el-image
          v-for="(photo, index) in currentPhotos"
          :key="index"
          :src="photo"
          :preview-src-list="currentPhotos"
          class="record-photo"
          fit="cover"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { violationAPI } from '@/api'

const approvedViolations = ref([])
const loading = ref(false)
const photoDialogVisible = ref(false)
const currentPhotos = ref([])

const loadApprovedViolations = async () => {
  try {
    loading.value = true
    const response = await violationAPI.getApprovedViolations()
    const rawList = response.data || []
    
    // 过滤出已审核通过(status=2)且是违章记录(address以VIOLATION开头)的数据
    approvedViolations.value = rawList
      .filter(item => item.status == 2 && item.address && item.address.startsWith('VIOLATION'))
      .map(item => ({
        id: item.id,
        licensePlate: item.catNumber,
        violationTime: item.createTime,
        location: '未知',
        content: item.address.split('|')[1] || '无内容',
        reporter: item.userId,
        approvedTime: item.endTime ? item.endTime.replace('T', ' ') : '未知时间',
        processResult: item.processingresult,
        photos: item.pic ? [item.pic] : []
      }))
  } catch (error) {
    console.error('获取违章记录失败:', error)
    approvedViolations.value = []
  } finally {
    loading.value = false
  }
}

const viewPhotos = (row) => {
  currentPhotos.value = row.photos
  photoDialogVisible.value = true
}

onMounted(() => {
  loadApprovedViolations()
})
</script>

<style scoped>
.violation-records {
  padding: 20px;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.photo-gallery {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.record-photo {
  width: 200px;
  height: 150px;
  border-radius: 4px;
}
</style>