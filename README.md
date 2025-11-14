# Vue3-todoList

这是一个使用 Vue 3 + Vite 搭建的轻量待办（Todo）示例项目，包含基本的任务创建、编辑、完成管理及简单的本地存储模拟后端。项目采用 `<script setup>` 单文件组件 (SFC) 风格，适合作为学习与小型项目基础模板。

## 项目亮点

- 基于 Vue 3 + Vite，轻量且启动快速
- 组件化设计：`src/components/` 下拆分了任务列表、创建/编辑任务、用户界面等组件
- 本地持久化：项目通过 `localStorage/` 文件夹模拟持久化（包含 `tasks`、`nextTaskId`）
- 包含简单的静态服务器/后端示例：`server.js` 和 `db.cjs`（可选用于本地演示）

## 目录结构（重要文件）

- `index.html` - 入口 HTML
- `package.json` / `pnpm-lock.yaml` - 项目依赖与锁定文件（项目里使用 pnpm 时首选 pnpm）
- `vite.config.js` - Vite 配置
- `server.js` / `db.cjs` - （可选）本地演示/后端脚本
- `src/` - 源代码目录
	- `main.js` - 应用入口
	- `App.vue` - 根组件
	- `style.css` - 全局样式
	- `assets/` - 静态资源
	- `components/` - 主要组件
		- `Calendar.vue`
		- `CreateTask.vue`
		- `EditProfile.vue`
		- `EditTask.vue`
		- `Login.vue`
		- `Personal.vue`
		- `TaskCompletion.vue`
		- `TaskList.vue`
	- `router/` - 路由定义（`index.js`）
	- `utils/` - 工具函数（如 `timeMessages.js`）
- `localStorage/` - 用作演示的本地数据文件
	- `tasks` - 存放任务数据（JSON 或文本格式，项目内用于演示/持久化）
	- `nextTaskId` - 下一个任务 ID 的存储

## 主要功能

- 登录/个人信息页面（`Login.vue`, `Personal.vue`, `EditProfile.vue`）
- 创建、编辑任务（`CreateTask.vue`, `EditTask.vue`）
- 列表展示与完成状态（`TaskList.vue`, `TaskCompletion.vue`）
- 简单日历视图（`Calendar.vue`）
- 路由支持（`src/router/index.js`）

## 本地运行（在 Windows PowerShell 中）

说明：仓库包含 `pnpm-lock.yaml`，推荐使用 `pnpm`。如果你使用 `npm` 或 `yarn`，将 `pnpm run` 替换为对应命令（`npm run` / `yarn`）。

在项目根目录下运行：

```powershell
pnpm install
pnpm run dev
```

默认情况下，Vite 会在本地开启开发服务器（通常端口为 `5173`），浏览器打开输出的地址即可查看。

打包与预览：

```powershell
pnpm run build
pnpm run preview
```

（如果 `package.json` 中的脚本名称不同，请使用 `pnpm run <script-name>`）

## 关于本地数据与后端

- 项目包含 `localStorage/` 文件夹用于演示持久化，里面可能包含 `tasks` 和 `nextTaskId`。在生产环境会改为浏览器 `localStorage` 或真实后端。
- `server.js` 与 `db.cjs` 可作演示用途，作为本地静态或简单 API 服务的参考；如果想启用它们，请阅读文件并按需运行（注意安全与端口冲突）。

## 开发提示

- 代码组织以组件为中心。若添加新视图或功能，建议在 `src/components/` 下新增组件并在 `router/index.js` 中注册路由。
- 常见改进点：表单校验、任务过滤与排序、持久化到后端服务、单元/集成测试。

## 贡献

欢迎提交 issue 或 PR。建议流程：

1. Fork 仓库并新建分支
2. 在分支中实现功能或修复 bug
3. 提交 PR，并在 PR 描述中注明改动与复现步骤

## 许可证

该仓库附带 `LICENSE` 文件，请参阅以了解具体许可信息。

