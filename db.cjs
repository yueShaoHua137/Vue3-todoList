const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'task_manager'
});

connection.connect((err) => {
    if (err) {
        console.error('数据库连接失败: ' + err.stack);
        return;
    }
    console.log('数据库连接成功，ID: ' + connection.threadId);
	
	
	
	
	// 查询数据
	    const query = 'SELECT * FROM tasks'; // 假设你的表名是 'tasks'
	    connection.query(query, (err, results, fields) => {
	        if (err) {
	            console.error('查询数据失败: ' + err.message);
	            return;
	        }
	
	        // 输出查询结果
	        console.log('查询结果:', results);
	
	        // 处理数据或返回给前端
	        results.forEach(task => {
	            console.log(`任务: ${task.title}, 描述: ${task.description}`);
	        });
	
	        // 关闭连接
	        connection.end((err) => {
	            if (err) {
	                console.error('关闭连接失败: ' + err.message);
	            } else {
	                console.log('数据库连接已关闭');
	            }
	        });
	    });
});

