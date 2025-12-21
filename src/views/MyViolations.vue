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
    // 获取所有车辆和违章数据
    const response = await violationAPI.getMyViolations(userStore.user.id)
    const allData = response.data || []

    // 1. 找出当前用户拥有的车辆 (非违章记录且userId匹配)
    const myCars = allData.filter(item => 
      String(item.userId) === String(userStore.user.id) && 
      (!item.address || !item.address.startsWith('VIOLATION'))
    )
    const myPlates = myCars.map(car => car.catNumber)

    // 2. 找出针对这些车辆的已审核通过(status=2)的违章记录
    const myViolationsList = allData.filter(item => 
      item.address && 
      item.address.startsWith('VIOLATION') && 
      item.status === 2 && 
      myPlates.includes(item.catNumber)
    )

    // 3. 映射数据
    violations.value = myViolationsList.map(item => ({
      id: item.id,
      status: '已处理',
      violationTime: item.createTime,
      location: '未知',
      content: item.address.split('|')[1] || '无内容',
      photos: item.pic ? [item.pic] : [],
      processResult: item.processingresult
    }))

  } catch (error) {
    console.error('获取我的违章记录失败:', error)
    violations.value = []
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