<template>
	<div class="app-page personal-page">
		<div class="page-header">
			<el-menu mode="horizontal" class="top-nav" :default-active="'personal'" style="background-color: #6c757d; margin-bottom: 16px;">
				<el-menu-item index="task-overview" @click="goToTaskList">任务总览</el-menu-item>
				<el-menu-item index="task-analysis" @click="goToTaskCom">任务完成情况</el-menu-item>
				<el-menu-item index="calendar" @click="goToCalendar">日历</el-menu-item>
				<el-menu-item index="personal">个人中心</el-menu-item>
			</el-menu>
		</div>
		<el-row :gutter="20">
			<el-col :span="8">
				<el-card>
								<div class="profile-header">
									<div style="position:relative; cursor:pointer;" @click="triggerAvatarInput">
										<el-avatar :size="80" :src="user.avatar" />
										<el-icon style="position:absolute; right:-6px; bottom:-6px; background:white; border-radius:50%; padding:2px;"> 
											<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#606266" d="M5 20h14v-2H5v2zm7-18L5.33 7h3.67v6h6V7h3.67L12 2z"/></svg>
										</el-icon>
									</div>
									<input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarSelected" />
									<div class="profile-info">
										<h3>{{ user.name }}</h3>
										<div class="muted">{{ user.email }}</div>
									</div>
								</div>

								<div style="margin-top: 12px; display:flex; gap:8px;">
									<el-button type="primary" size="small" @click="goEditProfile">编辑资料</el-button>
									<el-button type="warning" size="small" @click="logout">登出</el-button>
								</div>
				</el-card>

				<el-card style="margin-top: 12px;">
					<h4>设置</h4>
					<el-row style="margin-top:8px; align-items:center;">
						<el-col :span="12">深色模式</el-col>
						<el-col :span="12"><el-switch v-model="darkMode" @change="toggleTheme" /></el-col>
					</el-row>
				</el-card>
			</el-col>

			<el-col :span="16">
				<el-row :gutter="12">
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-number">{{ stats.total }}</div>
							<div class="stat-label">总任务</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-number">{{ stats.completed }}</div>
							<div class="stat-label">已完成</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-number">{{ stats.overdue }}</div>
							<div class="stat-label">已过期</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-number">{{ stats.dueToday }}</div>
							<div class="stat-label">今日截止</div>
						</el-card>
					</el-col>
				</el-row>

				<el-row :gutter="12">
					<el-col :span="12">
						<el-card style="margin-top: 12px;">
							<div style="display:flex; justify-content:space-between; align-items:center;">
								<h4>即将到期任务</h4>
								<el-button type="text" @click="refreshTasks">刷新</el-button>
							</div>

							<el-table :data="upcomingTasks" style="width: 100%; margin-top: 8px;" size="small">
								<el-table-column prop="title" label="标题" />
								<el-table-column prop="end_date" label="截止时间" width="180">
									<template #default="{ row }">
										<span>{{ formatDateTime(row.end_date) }}</span>
										<el-tag v-if="isDueToday(row)" type="warning" size="small" style="margin-left:8px;">今日 {{ formatEndTime(row) }}</el-tag>
									</template>
								</el-table-column>
								<el-table-column prop="completion_status" label="状态" width="120" />
							</el-table>
						</el-card>
					</el-col>
					<el-col :span="12">
						<el-card style="margin-top: 12px;">
							<div style="display:flex; justify-content:space-between; align-items:center;">
								<h4>已过期任务</h4>
								<el-button type="text" @click="refreshTasks">刷新</el-button>
							</div>

							<el-table :data="expiredTasks" style="width: 100%; margin-top: 8px;" size="small">
								<el-table-column prop="title" label="标题" />
								<el-table-column prop="end_date" label="截止时间" width="180">
									<template #default="{ row }">
										<span>{{ formatDateTime(row.end_date) }}</span>
										<el-tag type="danger" size="small" style="margin-left:8px;">已过期</el-tag>
									</template>
								</el-table-column>
								<el-table-column prop="completion_status" label="状态" width="120" />
							</el-table>
						</el-card>
					</el-col>
				</el-row>
			</el-col>
		</el-row>


	</div>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

export default {
	name: 'Personal',
	data() {
		return {
			user: {
				name: '未设置',
				email: '未设置',
				avatar: ''
			},
			darkMode: false,
			tasks: [],
			stats: {
				total: 0,
				completed: 0,
				overdue: 0,
				dueToday: 0
			}
		}
	},
	computed: {
		upcomingTasks() {
			// 返回所有未过期（截止时间 >= 现在）的任务，按截止时间升序，取前 6 项
			const list = (this.tasks || []).filter(t => t.end_date).map(t => ({ ...t }))
			const now = dayjs()
			const filtered = list.filter(t => !dayjs(t.end_date).isBefore(now))
			filtered.sort((a, b) => dayjs(a.end_date).valueOf() - dayjs(b.end_date).valueOf())
			return filtered.slice(0, 6)
		},
		expiredTasks() {
			// 返回已经过期（截止时间 < 现在）的所有任务，按截止时间降序（最近过期优先），取前 6 项
			const list = (this.tasks || []).filter(t => t.end_date).map(t => ({ ...t }))
			const now = dayjs()
			const filtered = list.filter(t => dayjs(t.end_date).isBefore(now))
			filtered.sort((a, b) => dayjs(b.end_date).valueOf() - dayjs(a.end_date).valueOf())
			return filtered.slice(0, 6)
		}
	},
	methods: {
		loadUser() {
			try {
				// 优先从当前登陆用户的 accounts 中读取
				const current = localStorage.getItem('currentUser')
				const rawAccounts = localStorage.getItem('accounts')
				const accounts = rawAccounts ? JSON.parse(rawAccounts) : null
				if (current && accounts && accounts[current]) {
					this.user = accounts[current]
				} else {
					// 兼容旧的数据存储键 app_user
					const raw = localStorage.getItem('app_user')
					if (raw) this.user = JSON.parse(raw)
				}
			} catch (e) {
				// ignore
			}
		},
			triggerAvatarInput() {
				const inp = this.$refs.avatarInput
				if (inp && inp.click) inp.click()
			},
			onAvatarSelected(e) {
				const file = e.target.files && e.target.files[0]
				if (!file) return
				const reader = new FileReader()
				reader.onload = (ev) => {
					const dataUrl = ev.target.result
						this.user.avatar = dataUrl
						// persist to accounts[currentUser]，若无 currentUser 则回退到 app_user（兼容旧实现）
						try {
							const current = localStorage.getItem('currentUser')
							if (current) {
								const rawAccounts = localStorage.getItem('accounts')
								const accounts = rawAccounts ? JSON.parse(rawAccounts) : {}
								accounts[current] = accounts[current] || {}
								accounts[current].avatar = dataUrl
								localStorage.setItem('accounts', JSON.stringify(accounts))
							} else {
								localStorage.setItem('app_user', JSON.stringify(this.user))
							}
						} catch (e) {}
					ElMessage.success('头像已更新')
				}
				reader.readAsDataURL(file)
				// clear value so same file can be chosen again
				e.target.value = ''
			},
			goEditProfile() {
				this.$router.push('/edit-profile')
			},
			goToTaskList() { this.$router.push('/taskList') },
			goToTaskCom() { this.$router.push('/taskCompletion') },
			goToCalendar() { this.$router.push('/calendar') },

		logout() {
			// 简单登出：清空本地用户并跳回登录（默认路由 '/')
			localStorage.removeItem('app_user')
			ElMessage.success('已登出')
			this.$router.push('/')
		},
		toggleTheme(val) {
			// 保存并应用深色模式
			localStorage.setItem('dark_mode', val ? '1' : '0')
			this.darkMode = val
			this.applyTheme()
			ElMessage.success(val ? '已启用深色模式' : '已禁用深色模式')
		},

		applyTheme() {
			try {
				if (this.darkMode) {
					document.body.classList.add('dark-mode')
				} else {
					document.body.classList.remove('dark-mode')
				}
			} catch (e) {}
		},
		async fetchTasks() {
			try {
				const res = await axios.get('http://localhost:3000/api/tasks')
				this.tasks = res.data || []
				this.calculateStats()
			} catch (e) {
				console.error('加载任务失败', e)
			}
		},
		refreshTasks() {
			this.fetchTasks()
		},
		calculateStats() {
			const now = dayjs()
			this.stats.total = this.tasks.length
			this.stats.completed = this.tasks.filter(t => t.completion_status === '已完成').length
			// 已过期：截止时间在当前时间之前
			this.stats.overdue = this.tasks.filter(t => t.end_date && dayjs(t.end_date).isBefore(now)).length
			// 今天截止：截止日期是今天且截止时间不早于当前时间（排除已过期的任务）
			this.stats.dueToday = this.tasks.filter(t => t.end_date && dayjs(t.end_date).format('YYYY-MM-DD') === now.format('YYYY-MM-DD') && !dayjs(t.end_date).isBefore(now)).length
		},
		formatEndTime(task) {
			try { return dayjs(task.end_date).format('HH:mm') } catch (e) { return '' }
		},
		formatDateTime(val) {
			try { return dayjs(val).format('YYYY-MM-DD HH:mm') } catch (e) { return '' }
		},
		isExpired(task) {
			try { return dayjs(task.end_date).isBefore(dayjs()) } catch (e) { return false }
		},
		isDueToday(task) {
			try { return dayjs(task.end_date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') } catch (e) { return false }
		}
	},
	mounted() {
		this.loadUser()
		this.fetchTasks()
		const dm = localStorage.getItem('dark_mode')
		this.darkMode = dm === '1'
		this.applyTheme()
	},

	watch: {
		'$route'() {
			this.loadUser()
		}
	}
}
</script>

<style scoped>
.personal-page { padding: 16px; }
.profile-header { display:flex; gap:12px; align-items:center }
.profile-info h3 { margin:0 }
.muted { color: #888 }
.stat-card { text-align:center }
.stat-number { font-size: 20px; font-weight: bold }
.stat-label { color: #666; margin-top:6px }
</style>