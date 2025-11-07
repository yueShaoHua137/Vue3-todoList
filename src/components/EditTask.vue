<template>
  <div class="app-page">
    <el-page-header @back="handleBack" content="编辑任务"></el-page-header>

    <el-form :model="taskForm" ref="formRef" label-width="120px" :rules="formRules">
      <el-form-item label="标题" prop="title">
        <el-input v-model="taskForm.title" placeholder="请输入标题"></el-input>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input type="textarea" v-model="taskForm.description" :rows="4" placeholder="请输入描述"></el-input>
      </el-form-item>

      <el-form-item label="开始时间" prop="start_date">
        <!-- 使用 datetime 选择器以便编辑时也能选择具体到时:分 -->
        <el-date-picker v-model="taskForm.start_date" type="datetime" placeholder="选择开始时间（年月日 时:分）" />
      </el-form-item>

      <el-form-item label="截止时间" prop="end_date">
        <!-- 使用 datetime 选择器以便编辑时也能选择具体到时:分 -->
        <el-date-picker v-model="taskForm.end_date" type="datetime" placeholder="选择截止时间（年月日 时:分）" />
      </el-form-item>

      <el-form-item label="标记" prop="importance">
        <el-select v-model="taskForm.importance" placeholder="选择标记">
          <el-option label="重要" value="重要" />
          <el-option label="普通" value="普通" />
        </el-select>
      </el-form-item>

      <el-form-item label="完成状态" prop="completion_status">
        <el-select v-model="taskForm.completion_status" placeholder="选择状态">
          <el-option label="未开始" value="未开始" />
          <el-option label="进行中" value="进行中" />
          <el-option label="已完成" value="已完成" />
        </el-select>
      </el-form-item>

      <el-button type="primary" @click="updateTask">提交</el-button>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import axios from 'axios'
import dayjs from 'dayjs'
import { TIME_MESSAGES } from '../utils/timeMessages'

export default {
  data() {
    return {
      taskForm: {
        title: '',
        description: '',
        start_date: null,
        end_date: null,
        importance: '普通',
        completion_status: '未开始',
      },
      formRules: {
        title: [
          { required: true, message: '任务标题不能为空', trigger: 'blur' }
        ],
        start_date: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        end_date: [
          { required: true, message: '请选择截止时间', trigger: 'change' },
          { validator: (rule, value, callback) => {
              if (!this.taskForm.start_date || !value) return callback();
              const start = dayjs(this.taskForm.start_date);
              const end = dayjs(value);
              const now = dayjs();
              if (end.isBefore(start)) {
                callback(new Error(TIME_MESSAGES.END_BEFORE_START));
              } else if (end.isBefore(now)) {
                callback(new Error(TIME_MESSAGES.END_IN_PAST));
              } else {
                callback();
              }
            }, trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.loadTaskData()
  },
  methods: {
    handleBack() {
      this.$router.back()
    },
    async loadTaskData() {
      try {
        const taskId = this.$route.params.id
        const response = await axios.get(`http://localhost:3000/api/tasks/${taskId}`)
        const taskData = response.data

        this.taskForm = {
          ...taskData,
          // date-picker with type="datetime" expects a Date object (or parseable value)
          start_date: taskData.start_date ? dayjs(taskData.start_date).toDate() : null,
          end_date: taskData.end_date ? dayjs(taskData.end_date).toDate() : null,
        }
      } catch (error) {
        console.error('获取任务数据失败:', error)
        ElMessage.error('任务数据加载失败')
      }
    },
    updateTask() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          const taskId = this.$route.params.id
          // 额外一次性校验（防止在某些 edge case 下未触发表单内 validator）
          const now = dayjs();
          const start = dayjs(this.taskForm.start_date);
          const end = dayjs(this.taskForm.end_date);
          if (end.isBefore(start)) {
            ElMessage.error(TIME_MESSAGES.END_BEFORE_START);
            return;
          }
          if (end.isBefore(now)) {
            ElMessage.error(TIME_MESSAGES.END_IN_PAST);
            return;
          }

          const updatedTaskData = {
            ...this.taskForm,
            start_date: dayjs(this.taskForm.start_date).format('YYYY-MM-DD HH:mm:ss'),
            end_date: dayjs(this.taskForm.end_date).format('YYYY-MM-DD HH:mm:ss'),
          }

          axios.put(`http://localhost:3000/api/tasks/${taskId}`, updatedTaskData)
            .then((response) => {
              ElMessage.success('任务更新成功')
              this.$router.push('/taskList')
            })
            .catch((error) => {
              console.error('更新任务失败:', error)
              ElMessage.error('任务更新失败')
            })
        } else {
          ElMessage.error('请完成表单信息')
        }
      })
    }
  }
}
</script>