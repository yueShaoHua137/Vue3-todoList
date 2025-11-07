//express是一个基于Node.js的Web应用框架，用于创建Web服务器和API。
//cors（跨源资源共享）中间件，用于允许跨域请求。
//从node-localstorage包导入LocalStorage类：用于在Node.js环境中模拟浏览器的localStorage，实现数据的持久化存储。
import express from 'express';   
import cors from 'cors';
import { LocalStorage } from 'node-localstorage';

//创建一个Express应用实例。
//定义服务器端口号为3000。
const app = express();
const port = 3000;

app.use(cors());  // 使用cors中间件：允许所有跨域请求。
app.use(express.json()); // 使用 express 内置的 JSON 解析器

// 初始化 localStorage，指定存储路径为'./localStorage'，即当前目录下的localStorage文件夹。
const localStorage = new LocalStorage('./localStorage');

// 初始化数据
const initializeData = () => {
  if (!localStorage.getItem('tasks')) {
    const initialTasks = [
      {
        id: 1,
        title: 'C实验',
        description: '实验2-数组',
        start_date: '2025-10-20 00:00:00',
        end_date: '2025-11-26 23:59:59',
        importance: '重要',
        completion_status: '进行中'
      },
      {
        id: 2,
        title: '交互实验2',
        description: '交互实验报告',
        start_date: '2025-11-25 00:00:00',
        end_date: '2025-12-12 23:59:59',
        importance: '重要',
        completion_status: '未开始'
      },
      {
        id: 3,
        title: '班会议',
        description: '每周例会',
        start_date: '2025-10-22 10:00:00',
        end_date: '2025-10-22 11:30:00',
        importance: '普通',
        completion_status: '已完成'
      }
    ];
	// 使用 JSON.stringify 将对象转换为字符串存储
    localStorage.setItem('tasks', JSON.stringify(initialTasks));   
    localStorage.setItem('nextTaskId', '4');  //设置下一个可用的任务 ID 为 4
    console.log('初始化数据完成');
  }
};

// 辅助函数：获取任务数据，从 localStorage 获取任务列表，如果没有数据则返回空数组
//localStorage 只能存储字符串，从 localStorage 获取的是字符串，不是对象，使用 JSON.parse 转换为 JavaScript 对象
//() => ...：这是箭头函数的语法。箭头函数是ES6中引入的一种新的函数定义方式，它提供了一种更简洁的函数写法。括号()表示函数的参数列表。这里没有参数，所以是一个空括号。=>是箭头函数的标志，它分隔了参数列表和函数体。
//等价于:
/* const getTasks = function() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}; */
const getTasks = () => JSON.parse(localStorage.getItem('tasks') || '[]');

// 辅助函数：保存任务数据
const saveTasks = (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks));

// 获取所有任务
//定义了一个GET路由，当客户端请求/api/tasks时，服务器会执行这个回调函数。
//app.get 表示定义一个GET请求的路由。
//第一个参数 '/api/tasks' 是路由的路径。
//第二个参数是一个箭头函数，即处理请求的回调函数。该函数有两个参数：req（请求对象）和 res（响应对象）。
//res.json() 是Express响应对象的方法，它将传入的JavaScript对象或数组转换为JSON字符串并发送给客户端。
app.get('/api/tasks', (req, res) => {
  try {
    res.json(getTasks());    
  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).send('服务器错误');
  }
});

// 获取单个任务
//这是一个Express路由，用于处理GET请求。路由路径是/api/tasks/:id，其中:id是一个路由参数，代表任务的ID。
//getTasks()函数从localStorage中获取所有任务的数组。
//find()方法用于在任务数组中查找第一个满足条件的任务。条件是一个回调函数：t => t.id === parseInt(req.params.id)
//req.params.id是从路由参数中获取的字符串，使用parseInt将其转换为整数，以便与任务ID（数字）比较。
//如果找到，task变量将包含该任务对象；否则为undefined。
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = getTasks().find(t => t.id === parseInt(req.params.id));
    task ? res.json(task) : res.status(404).json({ message: '任务未找到' });
  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).send('服务器错误');
  }
});

// 创建任务
//app.post(): 定义处理 HTTP POST 请求的路。
//POST 方法的特点:用于创建新资源、请求数据在请求体（body）中发送、通常需要数据验证
//从请求体中解构出必要的字段：title, start_date, end_date, completion_status。

app.post('/api/tasks', (req, res) => {
  try {
    const { title, start_date, end_date, completion_status } = req.body;
    if (!title || !start_date || !end_date || !completion_status) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const tasks = getTasks();
    const nextId = parseInt(localStorage.getItem('nextTaskId') || '1');
    
    const newTask = {
      id: nextId,
      title,
      description: req.body.description || '',
      start_date,
      end_date,
      importance: req.body.importance || '普通',
      completion_status
    };

    tasks.push(newTask);
    saveTasks(tasks);
    localStorage.setItem('nextTaskId', (nextId + 1).toString());

    res.status(201).json({ message: '任务创建成功', taskId: newTask.id });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).send('服务器错误');
  }
});

// 更新任务
//定义处理 HTTP PUT 请求的路由
//PUT 方法的特点:用于更新现有资源、通常用于完整更新（替换整个资源）、需要指定要更新的资源ID
// /api/tasks/:id: 包含路由参数 :id，指定要更新的具体任务
//findIndex() 方法详解：在数组中查找满足条件的第一个元素的索引，如果找到，返回该元素的索引（0, 1, 2, ...），如果没找到，返回 -1
app.put('/api/tasks/:id', (req, res) => {
  try {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));

    if (taskIndex === -1) {
      return res.status(404).json({ message: '任务未找到' });
    }
//使用扩展运算符进行对象合并：
//扩展运算符 ... 详解：创建原任务的浅拷贝，用 req.body 的属性覆盖原任务属性

    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    saveTasks(tasks);

    res.json({ message: '任务更新成功' });
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).send('服务器错误');
  }
});

// 删除任务
//app.delete(): 定义处理 HTTP DELETE 请求的路由
//DELETE 方法的特点:用于删除现有资源、需要指定要删除的资源ID、多次删除同一资源结果相同
//filter() 方法详解：创建一个新数组，包含所有通过测试的元素、不会修改原数组，而是返回新数组、回调函数返回 true 的元素会被保留
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(t => t.id !== parseInt(req.params.id));
    
    if (tasks.length === filteredTasks.length) {
      return res.status(404).json({ message: '任务未找到' });
    }

    saveTasks(filteredTasks);
    res.json({ message: '任务删除成功' });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).send('服务器错误');
  }
});

// 初始化数据
initializeData();

// 服务器启动
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log('使用 localStorage 作为数据存储');
});