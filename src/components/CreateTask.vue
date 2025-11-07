<template>
  <div class="app-page">
    <el-page-header @back="handleBack" content="创建任务"></el-page-header>
    <el-form :model="taskForm" ref="formRef" :rules="rules" label-width="120px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="taskForm.title" placeholder="请输入标题"></el-input>
      </el-form-item>

      <el-form-item label="描述">
        <el-input type="textarea" v-model="taskForm.description" :rows="4" placeholder="请输入描述"></el-input>
      </el-form-item>

      <el-form-item label="开始时间" prop="start_date">
        <!-- 使用 datetime 选择器以便同时选择日期和时间 -->
        <el-date-picker v-model="taskForm.start_date" type="datetime" placeholder="选择开始时间（年月日 时:分）" />
      </el-form-item>

      <el-form-item label="截止时间" prop="end_date">
        <!-- 使用 datetime 选择器以便同时选择日期和时间 -->
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

      <el-button type="primary" @click="createTask">提交</el-button>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import axios from 'axios'
import dayjs from 'dayjs'
import { TIME_MESSAGES } from '../utils/timeMessages'

export default {
  name: 'CreateTask',
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
      rules: {
        title: [
          { required: true, message: '任务标题不能为空', trigger: 'blur' },
        ],
        start_date: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        end_date: [
          { required: true, message: '请选择截止时间', trigger: 'change' },
          { validator: (rule, value, callback) => {
              // 若开始时间未填，先跳过（start 的必填规则会提示）
              if (!this.taskForm.start_date || !value) {
                return callback();
              }
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
        ],
      }
    }
  },
  methods: {
    handleBack() {
      this.$router.push('/taskList')
    },
    createTask() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 最终再一次性校验避免竞态（例如表单校验未捕捉到的极端情况）
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

          const formattedTaskData = {
            ...this.taskForm,
            start_date: dayjs(this.taskForm.start_date).format('YYYY-MM-DD HH:mm:ss'),
            end_date: dayjs(this.taskForm.end_date).format('YYYY-MM-DD HH:mm:ss'),
          }

          axios.post('http://localhost:3000/api/tasks', formattedTaskData)
            .then(() => {
              ElMessage.success('任务创建成功')
              this.$router.push('/taskList')
            })
            .catch(() => {
              ElMessage.error('任务创建失败')
            })
        } else {
          ElMessage.error('请完成表单信息')
        }
      })
    }
  }
}
</script>

<style scoped>
</style>