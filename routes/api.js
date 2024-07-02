const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


// 定义一个简单的 GET 接口
router.get('/hello', (req, res) => {
    res.send('Hello, World!');
});



// 其他接口可以继续在这里定义

// 设置 multer 存储引擎
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 文件保存路径
    },
    filename: (req, file, cb) => {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8'); // 处理文件名编码
        cb(null, Date.now() + '-' + originalName); // 文件名
    }
});

// 初始化 multer
const upload = multer({ storage: storage });

// 定义文件上传接口
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({
        message: 'File uploaded successfully!',
        file: req.file
    });
});

module.exports = router;
