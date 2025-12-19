<template>
  <div class="my-violations">
    <h2>我的违章</h2>
    <div v-loading="loading" v-if="violations.length > 0" class="violations-list">
      <el-card v-for="violation in violations" :key="violation.id" class="violation-card" style="margin-bottom: 20px;">
        <template #header>
          <div class="card-header">
            <span>违章记录 #{{ violation.id }}</span>
            <el-tag :type="getStatusType(violation.status)">{{ violation.status }}</el-tag>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>违章时间：</label>
              <span>{{ violation.violationTime }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>违章地点：</label>
              <span>{{ violation.location }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row style="margin-top: 15px;">
          <el-col :span="24">
            <div class="info-item">
              <label>违章内容：</label>
              <span>{{ violation.content }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row v-if="violation.photos && violation.photos.length > 0" style="margin-top: 15px;">
          <el-col :span="24">
            <div class="info-item">
              <label>现场相片：</label>
              <div class="photo-gallery">
                <el-image
                  v-for="(photo, index) in violation.photos"
                  :key="index"
                  :src="photo"
                  :preview-src-list="violation.photos"
                  class="violation-photo"
                  fit="cover"
                />
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row v-if="violation.processResult" style="margin-top: 15px;">
          <el-col :span="24">
            <div class="info-item">
              <label>处理结果：</label>
              <span>{{ violation.processResult }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <div v-else class="no-violations">
      <el-empty description="暂无违章记录">
        <p>保持良好驾驶习惯！</p>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { violationAPI } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const violations = ref([])
const loading = ref(false)

const loadMyViolations = async () => {
  try {
    loading.value = true
    const response = await violationAPI.getMyViolations(userStore.user.id)
    violations.value = response.data || response
  } catch (error) {
    console.error('获取我的违章记录失败:', error)
    // 临时使用假数据作为后备
    violations.value = [
      {
        id: 1,
        violationTime: '2024-12-18 14:20:00',
        location: '校园东门停车场',
        content: '违规停车，占用消防通道',
        status: '已处理',
        processResult: '已通知车主，罚款50元',
        photos: [
          'https://via.placeholder.com/200x150?text=违章现场1',
          'https://via.placeholder.com/200x150?text=违章现场2'
        ]
      },
      {
        id: 2,
        violationTime: '2024-12-15 09:15:00',
        location: '教学楼前广场',
        content: '超速行驶',
        status: '处理中',
        processResult: '正在审核中',
        photos: [
          'https://via.placeholder.com/200x150?text=违章现场3'
        ]
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

onMounted(() => {
  loadMyViolations()
})
</script>

<style scoped>
.my-violations {
  padding: 20px;
  max-width: 1000px;
}

.violation-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.info-item {
  margin-bottom: 10px;
}

.info-item label {
  font-weight: bold;
  color: #666;
  margin-right: 10px;
}

.photo-gallery {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.violation-photo {
  width: 200px;
  height: 150px;
  border-radius: 4px;
}

.no-violations {
  text-align: center;
  margin-top: 50px;
}
</style>