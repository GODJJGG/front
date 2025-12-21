<template>
  <div class="add-violation">
    <h2>违章申报</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="车辆牌照" prop="licensePlate">
        <el-input v-model="form.licensePlate" placeholder="请输入车辆牌照"></el-input>
      </el-form-item>
      <el-form-item label="违章时间" prop="violationTime">
        <el-date-picker
          v-model="form.violationTime"
          type="datetime"
          placeholder="选择违章时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="违章内容" prop="violationContent">
        <el-input
          v-model="form.violationContent"
          type="textarea"
          :rows="4"
          placeholder="请输入违章内容">
        </el-input>
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
            <div class="el-upload__tip">请上传违章现场照片，支持多张</div>
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { violationAPI, fileAPI } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const form = reactive({
  licensePlate: '',
  violationTime: '',
  violationContent: '',
  photos: []
})

const rules = {
  licensePlate: [{ required: true, message: '请输入车辆牌照', trigger: 'blur' }],
  violationTime: [{ required: true, message: '请选择违章时间', trigger: 'change' }],
  violationContent: [{ required: true, message: '请输入违章内容', trigger: 'blur' }]
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
          const uploadPromises = form.photos.map(file => fileAPI.uploadFile(file.raw, 'violation'))
          const uploadResults = await Promise.all(uploadPromises)
          photoUrls = uploadResults.map(result => result.url)
        }

        // 提交违章申报
        // 复用Vehicle实体，映射字段
        const violationData = {
          catNumber: form.licensePlate, // 车牌号
          userId: userStore.user.id, // 申报人ID
          pic: photoUrls.length > 0 ? photoUrls[0] : '', // 照片
          address: 'VIOLATION|' + form.violationContent, // 标记为违章记录并存储内容
          processingresult: '', // 初始为空，用于存储审核反馈
          status: 1 // 待审核
        }

        await violationAPI.reportViolation(violationData)
        ElMessage.success('违章申报提交成功')
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
.add-violation {
  padding: 20px;
  max-width: 600px;
}
</style>