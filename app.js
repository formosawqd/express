const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');

// 使用中间件来解析 JSON 请求体
app.use(express.json());

// 使用定义的路由
app.use('/', apiRoutes);

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
