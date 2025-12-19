<template>
  <div class="my-vehicle">
    <h2>我的车辆</h2>
    <div v-loading="loading" v-if="hasVehicle" class="vehicle-info">
      <el-card class="vehicle-card">
        <template #header>
          <div class="card-header">
            <span>车辆信息</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>车牌号码：</label>
              <span>{{ vehicle.licensePlate }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>车辆型号：</label>
              <span>{{ vehicle.model }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <div class="info-item">
              <label>申报通过时间：</label>
              <span>{{ vehicle.approvedTime }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-col :span="24">
            <div class="info-item">
              <label>车辆相片：</label>
              <div class="photo-gallery">
                <el-image
                  v-for="(photo, index) in vehicle.photos"
                  :key="index"
                  :src="photo"
                  :preview-src-list="vehicle.photos"
                  class="vehicle-photo"
                  fit="cover"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <div v-else class="no-vehicle">
      <el-empty description="请先进行车辆申请">
        <el-button type="primary" @click="goToApply">去申请</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { vehicleAPI } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const vehicle = ref(null)
const loading = ref(false)

const loadMyVehicle = async () => {
  try {
    loading.value = true
    const response = await vehicleAPI.getMyVehicles()
    if (response.data && response.data.length > 0) {
      vehicle.value = response.data[0] // 假设用户只有一辆车
    }
  } catch (error) {
    console.error('获取我的车辆失败:', error)
    // 临时使用假数据作为后备
    if (userStore.user?.username === 'student') {
      vehicle.value = {
        licensePlate: '浙A12345',
        model: '电动车-小牛',
        approvedTime: '2024-12-15 14:30:00',
        photos: [
          'https://via.placeholder.com/200x150?text=车辆正面',
          'https://via.placeholder.com/200x150?text=车辆侧面'
        ]
      }
    }
  } finally {
    loading.value = false
  }
}

// 是否有车辆
const hasVehicle = computed(() => {
  return vehicle.value !== null
})

const goToApply = () => {
  router.push('/home/vehicles/add')
}

onMounted(() => {
  loadMyVehicle()
})
</script>

<style scoped>
.my-vehicle {
  padding: 20px;
  max-width: 800px;
}

.vehicle-card {
  margin-top: 20px;
}

.card-header {
  font-weight: bold;
}

.info-item {
  margin-bottom: 15px;
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
}

.vehicle-photo {
  width: 200px;
  height: 150px;
  border-radius: 4px;
}

.no-vehicle {
  text-align: center;
  margin-top: 50px;
}
</style>