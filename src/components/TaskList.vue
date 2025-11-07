<template>
  <div class="app-page">
    <!-- 横向导航栏 -->
	<!-- https://element-plus.org/zh-CN/component/menu
		mode="horizontal"：设置菜单为水平模式。
		@select="handleNavSelect"：当菜单项被选中时触发的方法。
		:default-active="activeNav"：默认激活的菜单项，这里绑定到activeNav数据，初始为'task-overview'。
	-->
    <div class="page-header">
      <el-menu mode="horizontal" @select="handleNavSelect" :default-active="activeNav" class="top-nav" style="background-color: #6c757d; ">
      <el-menu-item index="task-overview" @click="goToTaskList">任务总览</el-menu-item>
      <el-menu-item index="task-analysis" @click="goToTaskCom">任务完成情况</el-menu-item>
      <el-menu-item index="calendar" @click="goToCalendar">日历</el-menu-item>
      <el-menu-item index="personal" @click="goToPersonal">个人中心</el-menu-item>
      </el-menu>
    </div>
     <!-- 使用el-button创建一个按钮，点击后跳转到创建任务页面。-->
	<div class="button-container">
      <el-button type="primary" @click="goToCreateTask">
        创建新任务
      </el-button>
    </div>
    <!-- 使用el-input创建一个搜索框，通过v-model绑定到searchKeyword，实现双向数据绑定。当输入时，触发handleSearch方法进行实时搜索。-->
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索任务关键字"
        clearable
        @input="handleSearch"
        style="width: 300px;"
      >
     </el-input>
    </div>
    <div style="margin-bottom: 10px; text-align: right;">
      <el-button size="small" :type="showTodayOnly ? 'success' : 'info'" @click="toggleTodayTasks">
        {{ showTodayOnly ? '显示全部任务' : '只看今日任务' }}
      </el-button>
    </div>
    <el-table :data="filteredTasks" border style="width: 100%" v-if="!loading">
      <el-table-column prop="title" label="标题" width="180">
        <template #default="scope">
          <!-- 优先显示已过期 -->
          <span v-if="isExpired(scope.row)" style="color: #6c757d; font-weight: bold;">
            {{ scope.row.title }}
            <el-tag type="danger" size="small" style="margin-left: 5px;">已过期</el-tag>
          </span>

          <!-- 精确到分钟的到期提示（正在到期的时刻） -->
          <span v-else-if="isDueNow(scope.row)" style="color: #e74c3c; font-weight: bold;">
            {{ scope.row.title }}
            <el-tag type="danger" size="small" style="margin-left: 5px;">今日 {{ formatEndTime(scope.row) }} 截止</el-tag>
          </span>

          <!-- 当天但未到期的任务显示今日提示 -->
          <span v-else-if="isDueToday(scope.row)" style="color: #ff9800; font-weight: bold;">
            {{ scope.row.title }}
            <el-tag type="warning" size="small" style="margin-left: 5px;">今日 {{ formatEndTime(scope.row) }}</el-tag>
          </span>

          <span v-else>
            {{ scope.row.title }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="start_date" label="开始时间" width="180" />
      <el-table-column prop="end_date" label="截止时间" width="180" />
      <el-table-column prop="importance" label="标记" width="120" />
      <el-table-column prop="completion_status" label="完成状态" width="120" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editTask(scope.row.id)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="confirmDeleteTask(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-spinner v-else />
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

export default {
  name: 'TaskList',
	// activeNav：当前激活的导航项。
	// tasks：从后端获取的任务列表。
	// filteredTasks：经过搜索过滤后的任务列表，用于表格显示。
	// loading：加载状态，初始为true。
	//searchKeyword：搜索关键词。
  data() {
    return {
      activeNav: 'task-overview',
      tasks: [],
      filteredTasks: [],
      loading: true,
  searchKeyword: '',
  showTodayOnly: false
    }
  },
  methods: {
    async fetchTasks() {
      try {
        console.log("正在请求任务数据...")
       //后端API的地址为http://localhost:3000/api/tasks，需要确保后端服务正在运行。
	   //从后端 API 获取任务列表
	   //初始化时同时设置 tasks 和 filteredTasks
	   //axios.get()   axios: 一个基于 Promise 的 HTTP 客户端库，用于浏览器和 Node.js .get(): 发起 GET 请求的方法，用于从服务器获取数据.
	   //await:作用: 暂停异步函数的执行，等待 Promise 完成结果: 直接返回 Promise 的解析值，而不是 Promise 对象本身要求: 必须在 async 函数内部使用
		const response = await axios.get('http://localhost:3000/api/tasks')
        console.log("任务数据加载成功", response.data)
        this.tasks = response.data
        this.filteredTasks = response.data
      } catch (error) {
        console.error("加载任务失败:", error)
        ElMessage.error('加载任务失败')
      } finally {
        this.loading = false
      }
    },
    
    toggleTodayTasks() {
      this.showTodayOnly = !this.showTodayOnly;
      this.applyFilters();
    },

    applyFilters() {
      // 搜索和今日任务筛选结合
      let tasks = this.tasks;
      const keyword = this.searchKeyword.trim().toLowerCase();
      if (keyword) {
        tasks = tasks.filter(task =>
          task.title.toLowerCase().includes(keyword) ||
          task.description.toLowerCase().includes(keyword)
        );
      }
      if (this.showTodayOnly) {
        const today = dayjs().format('YYYY-MM-DD');
        tasks = tasks.filter(task => task.end_date && dayjs(task.end_date).format('YYYY-MM-DD') === today);
      }
      this.filteredTasks = tasks;
    },

    // 判断任务是否在与当前系统时间精确到分钟的时刻截止（高亮条件）
    isDueNow(task) {
      if (!task || !task.end_date) return false;
      try {
        const taskMinute = dayjs(task.end_date).format('YYYY-MM-DD HH:mm');
        const nowMinute = dayjs().format('YYYY-MM-DD HH:mm');
        return taskMinute === nowMinute;
      } catch (e) {
        return false;
      }
    },

    // 判断是否已过期（截止时间在当前时间之前）
    isExpired(task) {
      if (!task || !task.end_date) return false;
      try {
        return dayjs(task.end_date).isBefore(dayjs());
      } catch (e) {
        return false;
      }
    },

    // 判断是否为当天截止（但未必到达具体时刻）
    isDueToday(task) {
      if (!task || !task.end_date) return false;
      try {
        return dayjs(task.end_date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') && !dayjs(task.end_date).isBefore(dayjs());
      } catch (e) {
        return false;
      }
    },

    // 格式化显示截止时间的时分（HH:mm）
    formatEndTime(task) {
      if (!task || !task.end_date) return '';
      try {
        return dayjs(task.end_date).format('HH:mm');
      } catch (e) {
        return '';
      }
    },

    handleSearch() {
      this.applyFilters();
    },
    
    editTask(id) {
      this.$router.push(`/edit-task/${id}`)
    },
    
    confirmDeleteTask(id) {
      ElMessageBox.confirm(
        '确定要删除该任务吗?',
        '删除任务',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.deleteTask(id)
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    },
	
  //使用 axios 发送 DELETE 请求到后端 API，URL 为 http://localhost:3000/api/tasks/${id}，其中 id 是要删除任务的唯一标识符。
  //如果请求成功（即 Promise 被 resolve），则执行以下操作：
  //调用 this.fetchTasks() 重新获取任务列表，更新页面显示。
  //使用 Element Plus 的 ElMessage.success 方法显示成功消息，提示用户“任务删除成功”。
  //如果请求失败（即 Promise 被 reject），则使用 ElMessage.error 显示错误消息，提示用户“删除任务失败”。  
    deleteTask(id) {
      axios.delete(`http://localhost:3000/api/tasks/${id}`)
        .then(() => {
          this.fetchTasks()
          ElMessage.success('任务删除成功')
        })
        .catch(() => ElMessage.error('删除任务失败'))
    },
    
    goToCreateTask() {
      this.$router.push('/create-task')
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
    
    handleNavSelect() {
      // 导航选择处理逻辑
    }
  },
  mounted() {
    this.fetchTasks()
  }
}
</script>

<style>
.top-nav {
  display: flex;
  justify-content: center;
}
.el-menu-item {
  padding: 0 20px;
  transition: font-size 0.3s ease;
  color: white !important; 
  background-color: #6c757d !important; 
}

.el-menu-item.is-active {
  font-size: 18px;
  font-weight: bold;
  color: white !important;
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px; 
  margin-bottom: 20px;
}
</style>