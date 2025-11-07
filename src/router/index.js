import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/Login.vue'
import TaskList from '@/components/TaskList.vue'
import CreateTask from '@/components/CreateTask.vue'
import EditTask from '@/components/EditTask.vue'
import TaskCompletion from '@/components/TaskCompletion.vue'
import Calendar from '@/components/Calendar.vue'
import Personal from '@/components/Personal.vue'
import EditProfile from '@/components/EditProfile.vue'


const routes = [
  { path: '/', component: Login }, // 登录页面为默认页面
  { path: '/taskList', component: TaskList }, // 任务列表页面
  { path: '/create-task', component: CreateTask },
  { path: '/edit-task/:id', component: EditTask, props: true },
  { path :'/taskCompletion',component: TaskCompletion},
  { path: '/calendar',component: Calendar},
  { path: '/personal',component: Personal},
  { path: '/edit-profile', component: EditProfile},
  
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
