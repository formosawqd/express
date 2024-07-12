const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// 定义一个简单的 GET 接口
router.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

// 用户数据示例
const users = [
  { name: "Alice", age: 25, address: "123 Main St", show: true },
  { name: "Bob", age: 30, address: "456 Maple Ave", show: false },
  { name: "Charlie", age: 35, address: "789 Oak Dr", show: true },
];

// 定义 GET /list 接口
router.get("/list", (req, res) => {
  res.send(users);
});

// 其他接口可以继续在这里定义

// 设置 multer 存储引擎
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 文件保存路径
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    ); // 处理文件名编码
    cb(null, Date.now() + "-" + originalName); // 文件名
  },
});

// 初始化 multer
const upload = multer({ storage: storage });

// 定义文件上传接口
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send({
    message: "File uploaded successfully!",
    file: req.file,
  });
});

const SECRET_KEY = "your-very-secure-secret-key";

router.post("/login", (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  // 在这里进行实际的用户验证，例如检查数据库中的用户名和密码
  if (username === "formosa" && password === "111111") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

router.get("/protected", (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: "Protected data", user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// 示例数据
const items = [];
for (let i = 1; i <= 100; i++) {
  items.push({
    id: i,
    name: `Person ${i}`,
    age: 20 + (i % 30), // 示例年龄在 20 到 49 之间
    sex: i % 2 === 0 ? 'male' : 'female',
    address: `Address ${i}`
  });
}

router.post('/getList', (req, res) => {
  console.log(req.body);
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 10;

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / pageSize);

  res.json({
    page,
    pageSize,
    totalPages,
    data: paginatedItems
  });
});

module.exports = router;
