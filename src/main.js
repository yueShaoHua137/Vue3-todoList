import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'       // 导入 App.vue 根组件
import router from './router'      // 导入路由配置

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.mount('#app')
