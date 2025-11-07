<template>
  <div class="login-container app-page">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        label-width="80px"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="登录名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入登录名" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item class="center-flex">
          <el-button type="primary" @click="handleLogin" :loading="loading">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 登录表单数据
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入登录名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      // 加载状态
      loading: false,
      // 有效的登录凭据（演示用）。真实场景应使用后端验证。
      validCredentials: {
        guest: '123'
      }
    }
  },
  methods: {
    async handleLogin() {
      // 触发表单验证
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请输入完整的登录信息')
          return
        }

        this.loading = true

        // 模拟短延迟以保持 UX 一致
        setTimeout(() => {
          try {
            const rawAccounts = localStorage.getItem('accounts')
            const accounts = rawAccounts ? JSON.parse(rawAccounts) : {}
            const acc = accounts[this.loginForm.username]
            let authenticated = false

            // 优先使用 accounts 中存储的密码进行验证
            if (acc && acc.password && acc.password === this.loginForm.password) {
              authenticated = true
            } else if (this.validCredentials[this.loginForm.username] === this.loginForm.password) {
              // 回退到演示凭据（首次使用演示凭据登录时，为该用户名建立 accounts 条目并保存密码）
              authenticated = true
              if (!accounts[this.loginForm.username]) {
                const old = localStorage.getItem('app_user')
                if (old) {
                  try { accounts[this.loginForm.username] = JSON.parse(old) } catch (e) { accounts[this.loginForm.username] = { name: this.loginForm.username } }
                } else {
                  accounts[this.loginForm.username] = { name: this.loginForm.username }
                }
              }
              accounts[this.loginForm.username].password = this.loginForm.password
              localStorage.setItem('accounts', JSON.stringify(accounts))
            }

            if (authenticated) {
              try { localStorage.setItem('currentUser', this.loginForm.username) } catch (e) {}
              this.$message.success('登录成功')
              this.$router.push('/taskList')
            } else {
              this.$message.error('登录名或密码错误')
            }
          } catch (e) {
            console.error('登录处理失败', e)
            this.$message.error('登录时发生错误')
          } finally {
            this.loading = false
          }
        }, 700)
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 600;
}

.center-flex {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>