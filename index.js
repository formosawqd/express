// 引入必要的模块
const express = require("express");
const multer = require("multer");
const cors = require("cors");

const path = require("path");

// 创建一个 Express 应用
const app = express();
app.use(cors());

// 设置端口号
const PORT = 3000;

// 配置 multer 中间件用于处理文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 设置上传文件存储目录
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// 创建一个简单的 GET 接口，用于测试服务器是否正常运行
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const data = [
  { name: "Alice", age: 25, address: "123 Main St" },
  { name: "Bob", age: 30, address: "456 Maple Ave" },
  { name: "Charlie", age: 35, address: "789 Oak Dr" },
];

app.get("/list", (req, res) => {
  res.json(data);
});

// 创建一个上传文件的 POST 接口
app.post("/upload", upload.single("file"), (req, res) => {
  // 打印请求的详细信息
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("File:", req.file);

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.json({ message: "File uploaded successfully!", file: req.file });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
