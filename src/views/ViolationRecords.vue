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
    approvedViolations.value = response.data || response
  } catch (error) {
    console.error('获取违章记录失败:', error)
    // 临时使用假数据作为后备
    approvedViolations.value = [
      {
        id: 1,
        licensePlate: '浙A12345',
        violationTime: '2024-12-15 14:20:00',
        location: '校园东门停车场',
        content: '违规停车，占用消防通道',
        reporter: '张老师',
        approvedTime: '2024-12-15 16:30:00',
        processResult: '已通知车主，罚款50元',
        photos: [
          'https://via.placeholder.com/200x150?text=违章现场1',
          'https://via.placeholder.com/200x150?text=违章现场2'
        ]
      },
      {
        id: 2,
        licensePlate: '浙C99999',
        violationTime: '2024-12-10 09:15:00',
        location: '图书馆停车区',
        content: '未按规定停车',
        reporter: '王老师',
        approvedTime: '2024-12-10 11:45:00',
        processResult: '已教育车主，加强管理',
        photos: [
          'https://via.placeholder.com/200x150?text=违章现场4'
        ]
      },
      {
        id: 3,
        licensePlate: '浙B67890',
        violationTime: '2024-12-08 17:30:00',
        location: '宿舍区停车场',
        content: '超时停车',
        reporter: '李老师',
        approvedTime: '2024-12-08 18:20:00',
        processResult: '已清理车辆，警告一次',
        photos: [
          'https://via.placeholder.com/200x150?text=违章现场5',
          'https://via.placeholder.com/200x150?text=违章现场6'
        ]
      }
    ]
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