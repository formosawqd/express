const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const crypto = require("crypto");
const iconv = require("iconv-lite"); // 使用 iconv-lite 进行编码转换

// 定义一个简单的 GET 接口
router.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

// 定义 GET /list 接口
router.get("/list", (req, res) => {
  // 用户数据示例
  const users = [
    { name: "Alice", age: 25, address: "123 Main St", show: true },
    { name: "Bob", age: 30, address: "456 Maple Ave", show: false },
    { name: "Charlie", age: 35, address: "789 Oak Dr", show: true },
  ];
  res.send(users);
});

// 其他接口可以继续在这里定义

const SECRET_KEY = "your-very-secure-secret-key";

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

router.post("/getList", (req, res) => {
  // 示例数据
  const items = [];
  for (let i = 1; i <= 100; i++) {
    items.push({
      id: i,
      name: `Person ${i}`,
      age: 20 + (i % 30), // 示例年龄在 20 到 49 之间
      sex: i % 2 === 0 ? "male" : "female",
      address: `Address ${i}`,
    });
  }
  console.log(req.body);
  const page = parseInt(req.body.currentPage) || 1;
  const pageSize = parseInt(req.body.pageSize) || 10;

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  console.log(startIndex);
  console.log(endIndex);
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / pageSize);

  res.json({
    page,
    pageSize,
    totalPages,
    data: paginatedItems,
  });
});

// 配置上传目录
const UPLOADS_DIR = path.join(__dirname, "uploads");

// 检查并创建 uploads 目录
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR); // 设置上传文件存储的路径
  },
  filename: (req, file, cb) => {
    // 这个文件名正常，但是内容乱码了
    // req.setEncoding("utf-8");
    // const original_name = Buffer.from(file.originalname, "latin1").toString(
    //   "utf8"
    // );
    // cb(null, original_name); // 自定义文件名
    // 这个内容正常，但是文件名乱码了

    // 获取原始文件名，并解码（如果需要）
    const decodedName = decodeURIComponent(file.originalname); // 解码文件名

    // 生成唯一文件名
    const uniqueName = `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}${path.extname(decodedName)}`;

    // 使用生成的唯一文件名
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 后端接收多个文件的接口
router.post("/upload", upload.array("files", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  // 返回上传的文件信息
  res.json({
    message: "Files uploaded successfully",
    files: req.files, // 返回上传的文件信息
  });
});

// 获取上传目录中的所有文件接口
router.get("/files", (req, res) => {
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).json({ message: "Unable to read directory" });
    }

    // 返回文件列表
    res.status(200).json({ files });
  });
});

// 下载接口
router.get("/download/:filename", (req, res) => {
  // 获取参数中的文件名
  const { filename } = req.params;

  // 定义文件存储路径
  const filePath = path.join(__dirname, "uploads", filename);

  // 设置文件下载响应
  res.download(filePath, filename, (err) => {
    if (err) {
      // 如果文件不存在或其他错误
      console.error("File download error:", err);
      res.status(404).send({ message: "File not found!" });
    }
  });
});

// 登录接口
router.post("/login", (req, res) => {
  // 模拟用户数据
  const users = [
    {
      id: 1,
      username: "admin",
      password: bcrypt.hashSync("123456", 8), // 使用 bcrypt 加密密码
      role: "admin",
    },
    {
      id: 1,
      username: "user",
      password: bcrypt.hashSync("123456", 8), // 使用 bcrypt 加密密码
      role: "user",
    },
  ];

  // JWT 秘钥和过期时间
  const JWT_SECRET = "your_jwt_secret_key";
  const JWT_EXPIRES_IN = "1h"; // Token 有效期 1 小时
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "用户名或密码错误" });
  }

  // 生成 JWT Token
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  // 验证密码
  const isPasswordValid = bcrypt.compareSync(
    bcrypt.hashSync(password, 8),
    user.password
  );

  // 一起返回路由

  const routesByRole = {
    admin: [
      {
        key: 1,
        path: "/home",
        name: "Home",
        label: "首页",
        component: "home",
        meta: { requiresAuth: true }, // 标记需要登录的路由
        icon: "fund",
        children: [
          {
            path: "/parent",
            name: "Parent",
            component: "parent",
            icon: "fund",
            label: "父组件",
          },
          {
            path: "/table",
            name: "Table",
            component: "table",
            icon: "fund",
            label: "表格",
          },
        ],
      },
      {
        key: 2,
        path: "/upload",
        name: "Upload",
        label: "上传",
        component: "upload",
        icon: "fund",
        meta: { requiresAuth: true }, // 标记需要登录的路由
      },
    ],
    user: [
      {
        key: 1,
        path: "/home",
        name: "Home",
        label: "首页",
        component: "home",
        meta: { requiresAuth: true }, // 标记需要登录的路由
        icon: "fund",
      },
      {
        key: 3,
        path: "/products",
        icon: "fund",
        label: "产品",
        name: "Products",
        component: "Products",
      },
    ],
  };
  const role = user.role; // 从请求参数获取角色
  const routes = routesByRole[role] || [];
  if (!isPasswordValid) {
    res.json({ message: "登录成功", role: user.role, token, routes });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});
module.exports = router;
