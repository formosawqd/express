// routes/auth.js

const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET_KEY = "your-very-secure-secret-key";

router.post("/login", (req, res) => {
  console.log(req);
  const { username, password } = req.body;

  // 在这里进行实际的用户验证，例如检查数据库中的用户名和密码
  if (username === "user" && password === "password") {
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

module.exports = router;
