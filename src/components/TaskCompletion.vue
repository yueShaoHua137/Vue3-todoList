<template>
  <div class="app-page">
    <!-- 横向导航栏 -->
    <div class="page-header">
      <el-menu mode="horizontal" @select="handleNavSelect" :default-active="activeNav" class="top-nav">
        <el-menu-item index="task-overview" @click="goToTaskList">任务总览</el-menu-item>
        <el-menu-item index="task-analysis" @click="goToTaskCom">任务完成情况</el-menu-item>
        <el-menu-item index="calendar" @click="goToCalendar">日历</el-menu-item>
        <el-menu-item index="personal" @click="goToPersonal">个人中心</el-menu-item>
      </el-menu>
    </div>
    
    <el-page-header @back="handleBack" content="任务统计"></el-page-header>
    
    <div class="statistics">
      <div class="stat-item">
        <h3>未开始</h3>
        <p>{{ completedCount }}</p>
      </div>
      <div class="stat-item">
        <h3>进行中</h3>
        <p>{{ inProgressCount }}</p>
      </div>
      <div class="stat-item">
        <h3>已完成</h3>
        <p>{{ notStartedCount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'TaskCompletion',
  data() {
    return {
      activeNav: 'task-analysis',
      tasks: [],
      completedCount: 0,
      inProgressCount: 0,
      notStartedCount: 0
    }
  },
  methods: {
    async fetchTasks() {
      try {
        const response = await axios.get('http://localhost:3000/api/tasks')
        this.tasks = response.data
        
        // 统计任务状态
        this.completedCount = this.tasks.filter(task => task.completion_status === '未开始').length
        this.inProgressCount = this.tasks.filter(task => task.completion_status === '进行中').length
        this.notStartedCount = this.tasks.filter(task => task.completion_status === '已完成').length
        
        this.renderChart()
      } catch (error) {
        console.error('加载任务失败:', error)
      }
    },
    
    
    handleBack() {
      this.$router.back()
    },
    
    goToTaskList() {
      this.$router.push('/taskList')
    },
    
    goToTaskCom() {
      this.$router.push('/taskCompletion')
    },
    
    goToCalendar() {
      this.$router.push('/calendar')
    },
    
    goToPersonal() {
      this.$router.push('/personal')
    },
    
  },
  mounted() {
    this.fetchTasks()
  }
}
</script>

<style>
.top-nav {
  background-color: #6c757d;
}

.el-menu-item.is-active {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.el-menu-item {
  padding: 0 20px;
  color: white;
  background-color: #6c757d;
}

.statistics {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  width: 600px;
  margin: 0 auto;
}
</style>