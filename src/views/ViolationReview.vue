<template>
  <div class="violation-review">
    <h2>申报审核</h2>
    <el-table :data="pendingViolations" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="申报ID" width="80"></el-table-column>
      <el-table-column prop="reporter" label="申报人" width="100"></el-table-column>
      <el-table-column prop="licensePlate" label="车牌号码" width="120"></el-table-column>
      <el-table-column prop="violationTime" label="违章时间" width="180"></el-table-column>
      <el-table-column prop="location" label="违章地点" width="150"></el-table-column>
      <el-table-column prop="content" label="违章内容" min-width="200"></el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="180"></el-table-column>
      <el-table-column label="现场相片" width="120">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="viewPhotos(scope.row)">查看相片</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button size="mini" type="success" @click="approveViolation(scope.row)">通过</el-button>
            <el-button size="mini" type="danger" @click="rejectViolation(scope.row)">拒绝</el-button>
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
          class="review-photo"
          fit="cover"
        />
      </div>
    </el-dialog>

    <!-- 处理结果输入弹窗 -->
    <el-dialog v-model="processDialogVisible" title="输入处理结果" width="500px">
      <el-form :model="{ processResult }" label-width="100px">
        <el-form-item label="处理结果" required>
          <el-input
            v-model="processResult"
            type="textarea"
            :rows="4"
            placeholder="请输入违章处理结果..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcessResult" :loading="loading">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { violationAPI } from '@/api'

const pendingViolations = ref([])
const loading = ref(false)
const photoDialogVisible = ref(false)
const currentPhotos = ref([])

// 处理结果输入弹窗相关
const processDialogVisible = ref(false)
const processResult = ref('')
const currentViolation = ref(null)

const loadPendingViolations = async () => {
  try {
    loading.value = true
    const response = await violationAPI.getPendingViolations()
    const rawList = response.data || []
    
    // 过滤出违章记录(address以VIOLATION开头)且待审核(status=1)
    pendingViolations.value = rawList
      .filter(item => item.status == 1 && item.address && item.address.startsWith('VIOLATION'))
      .map(item => ({
        id: item.id,
        reporter: item.userId, // 申报人ID
        licensePlate: item.catNumber,
        violationTime: item.createTime, // 使用创建时间作为违章时间
        location: '未知', // 后端未存储地点
        content: item.address.split('|')[1] || '无内容', // 从address解析内容
        submitTime: item.createTime,
        photos: item.pic ? [item.pic] : [],
        originalId: item.id
      }))
  } catch (error) {
    console.error('获取待审核违章失败:', error)
    pendingViolations.value = []
  } finally {
    loading.value = false
  }
}

const viewPhotos = (row) => {
  currentPhotos.value = row.photos
  photoDialogVisible.value = true
}

const approveViolation = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定通过申报ID ${row.id} 的违章记录吗？`,
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      }
    )

    // 打开处理结果输入弹窗
    currentViolation.value = row
    processResult.value = ''
    processDialogVisible.value = true

  } catch {
    // 用户取消操作
  }
}

const rejectViolation = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定拒绝申报ID ${row.id} 的违章记录吗？`,
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    loading.value = true
    // 拒绝即删除
    await violationAPI.deleteViolation(row.originalId)
    ElMessage.success('审核拒绝成功')
    loadPendingViolations() // 重新加载列表

  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      ElMessage.error('审核失败')
    }
  } finally {
    loading.value = false
  }
}

const submitProcessResult = async () => {
  if (!processResult.value.trim()) {
    ElMessage.warning('请输入处理结果')
    return
  }

  try {
    loading.value = true
    // 通过审核 (status=2)
    await violationAPI.reviewViolation(currentViolation.value.originalId, {
      status: 2,
      processingresult: processResult.value
    })
    processDialogVisible.value = false
    ElMessage.success('审核通过成功')
    loadPendingViolations() // 重新加载列表
  } catch (error) {
    console.error('提交处理结果失败:', error)
    ElMessage.error('提交失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPendingViolations()
})
</script>

<style scoped>
.violation-review {
  padding: 20px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.photo-gallery {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.review-photo {
  width: 200px;
  height: 150px;
  border-radius: 4px;
}
</style>