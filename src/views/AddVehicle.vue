<template>
  <div class="add-vehicle">
    <h2>车辆申请</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="车辆编号" prop="id">
        <el-input v-model="form.id" placeholder="请输入车辆编号"></el-input>
      </el-form-item>
      <el-form-item label="学生学号" prop="studentId">
        <el-input v-model="form.studentId" placeholder="请输入学生学号"></el-input>
      </el-form-item>
      <el-form-item label="车辆类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择车辆类型">
          <el-option label="电动车" value="电动车"></el-option>
          <el-option label="自行车" value="自行车"></el-option>
          <el-option label="其他" value="其他"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="牌照类型" prop="licenseType">
        <el-select v-model="form.licenseType" placeholder="请选择牌照类型">
          <el-option label="绿牌" value="绿牌"></el-option>
          <el-option label="蓝牌" value="蓝牌"></el-option>
          <el-option label="黄牌" value="黄牌"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="提交相片">
        <el-upload
          ref="uploadRef"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :auto-upload="false"
          multiple
          action="">
          <el-button type="primary">选择文件</el-button>
          <template #tip>
            <div class="el-upload__tip">请上传车辆照片，支持多张</div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" :loading="loading">提交</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { vehicleAPI, fileAPI } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const form = reactive({
  id: '',
  studentId: '',
  type: '',
  licenseType: '',
  photos: []
})

onMounted(() => {
  if (userStore.user && userStore.user.id) {
    form.studentId = userStore.user.id
  }
})

const rules = {
  id: [{ required: true, message: '请输入车辆编号', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学生学号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择车辆类型', trigger: 'change' }],
  licenseType: [{ required: true, message: '请选择牌照类型', trigger: 'change' }]
}

const formRef = ref()
const uploadRef = ref()
const loading = ref(false)

const handleFileChange = (file, fileList) => {
  form.photos = fileList
}

const handleFileRemove = (file, fileList) => {
  form.photos = fileList
}

const onSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true

        // 如果有照片，先上传照片
        let photoUrls = []
        if (form.photos && form.photos.length > 0) {
          const uploadPromises = form.photos.map(file => fileAPI.uploadFile(file.raw, 'vehicle'))
          const uploadResults = await Promise.all(uploadPromises)
          photoUrls = uploadResults.map(result => result.url)
        }

        // 提交车辆申请
        // 映射前端字段到后端Vehicle实体
        const vehicleData = {
          catNumber: form.id, // 车辆编号 -> 车牌号
          userId: userStore.user?.id || form.studentId, // 优先使用当前登录用户ID
          pic: photoUrls.length > 0 ? photoUrls[0] : '', // 取第一张照片
          address: form.type + '-' + form.licenseType, // 将类型和牌照类型存入地址字段(临时方案)
          status: 1 // 默认为审核中
        }

        await vehicleAPI.addVehicle(vehicleData)
        ElMessage.success('车辆申请提交成功')
        onCancel() // 重置表单
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const onCancel = () => {
  formRef.value.resetFields()
  uploadRef.value.clearFiles()
}
</script>

<style scoped>
.add-vehicle {
  padding: 20px;
  max-width: 600px;
}
</style>