<template>
  <div class="app-page" style="max-width:600px; margin:0 auto;">
    <el-page-header @back="back" content="编辑资料" />
    <el-form :model="form" label-width="90px">
      <el-form-item label="头像">
        <div style="display:flex; align-items:center; gap:12px;">
          <el-avatar :size="80" :src="form.avatar" />
          <div>
            <el-button @click="triggerInput" size="small">上传图片</el-button>
            <input ref="fileInp" type="file" accept="image/*" style="display:none" @change="onFile" />
          </div>
        </div>
      </el-form-item>

      <el-form-item label="昵称">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="登录名">
        <el-input v-model="form.login" placeholder="用于登录的用户名" />
      </el-form-item>

      <el-form-item label="新密码">
        <el-input v-model="form.password" placeholder="不填写则不修改密码" show-password />
      </el-form-item>

      <el-form-item label="确认密码">
        <el-input v-model="form.passwordConfirm" placeholder="再次输入新密码" show-password />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
export default {
  name: 'EditProfile',
  data() {
    return {
      form: {
        avatar: '',
        name: '',
        email: '',
        login: '',
        password: '',
        passwordConfirm: ''
      }
    }
  },
  mounted() {
    try {
      const current = localStorage.getItem('currentUser')
      const rawAccounts = localStorage.getItem('accounts')
      const accounts = rawAccounts ? JSON.parse(rawAccounts) : null
      if (current && accounts && accounts[current]) {
        this.form = Object.assign({}, accounts[current])
        this.form.login = current
      } else {
        const raw = localStorage.getItem('app_user')
        if (raw) this.form = JSON.parse(raw)
      }
    } catch (e) {}
  },
  methods: {
    back() { this.$router.push('/personal') },
    triggerInput() { this.$refs.fileInp && this.$refs.fileInp.click() },
    onFile(e) {
      const f = e.target.files && e.target.files[0]
      if (!f) return
      const reader = new FileReader()
      reader.onload = (ev) => { this.form.avatar = ev.target.result }
      reader.readAsDataURL(f)
      e.target.value = ''
    },
    save() {
      // 校验密码确认
      if (this.form.password && this.form.password !== this.form.passwordConfirm) {
        ElMessage.error('两次输入的密码不一致')
        return
      }
      try {
        const current = localStorage.getItem('currentUser')
        const rawAccounts = localStorage.getItem('accounts')
        const accounts = rawAccounts ? JSON.parse(rawAccounts) : {}

        const newLogin = this.form.login && String(this.form.login).trim()
        if (!newLogin) {
          ElMessage.error('登录名不能为空')
          return
        }

        if (current) {
          // 如果修改了登录名，迁移账户键
          if (newLogin !== current) {
            if (accounts[newLogin]) {
              ElMessage.error('该登录名已存在，请换一个')
              return
            }
            accounts[newLogin] = { ...(accounts[current] || {}) }
            delete accounts[current]
          }
          // 保存表单字段到 accounts[newLogin]
          accounts[newLogin] = { ...(accounts[newLogin] || {}), name: this.form.name, email: this.form.email, avatar: this.form.avatar }
          if (this.form.password) accounts[newLogin].password = this.form.password
          localStorage.setItem('accounts', JSON.stringify(accounts))
          // 更新 currentUser
          localStorage.setItem('currentUser', newLogin)
        } else {
          // 无 currentUser 时直接保存为 accounts[newLogin]
          if (accounts[newLogin]) {
            accounts[newLogin] = { ...(accounts[newLogin] || {}), name: this.form.name, email: this.form.email, avatar: this.form.avatar }
          } else {
            accounts[newLogin] = { name: this.form.name, email: this.form.email, avatar: this.form.avatar }
          }
          if (this.form.password) accounts[newLogin].password = this.form.password
          localStorage.setItem('accounts', JSON.stringify(accounts))
          localStorage.setItem('currentUser', newLogin)
        }

        ElMessage.success('已保存')
        this.$router.push('/personal')
      } catch (e) {
        console.error(e)
        ElMessage.error('保存失败')
      }
    }
  }
}
</script>

<style scoped>
</style>
