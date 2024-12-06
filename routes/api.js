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
      permissions: ["view", "edit", "delete"],
    },
    {
      id: 1,
      username: "user",
      password: bcrypt.hashSync("123456", 8), // 使用 bcrypt 加密密码
      role: "user",
      permissions: ["view"],
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

  if (!isPasswordValid) {
    res.json({
      message: "登录成功",
      role: user.role,
      token,
      permissions: user.permissions,
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 路由接口
router.get("/getRoute", (req, res) => {
  const routesByRole = {
    admin: [
      {
        path: "/welcome",
        name: "Welcome",
        label: "欢迎",
        folder: "welcome",
        file: "welcome",
        component: "welcome",
      },
      {
        path: "/parent",
        name: "Parent",
        folder: "parent",
        file: "parent",
        component: "parent",
        label: "父组件",
      },
      {
        path: "/table",
        name: "Table",
        folder: "table",
        file: "table",
        component: "table",
        label: "表格",
      },
      {
        path: "/upload",
        name: "Upload",
        folder: "upload",
        file: "upload",
        label: "上传",
        component: "upload",
        icon: "upload",
      },
      {
        path: "/directive",
        name: "Directive",
        folder: "directive",
        file: "directive",
        label: "指令",
        component: "directive",
        icon: "directive",
      },
      {
        path: "/keepalive",
        name: "Keepalive",
        folder: "keepalive",
        file: "keepalive",
        label: "缓存",
        component: "keepalive",
        icon: "keepalive",
      },
      {
        path: "/screenshot",
        name: "Screenshot",
        folder: "screenshot",
        file: "screenshot",
        label: "截屏",
        component: "screenshot",
        icon: "screenshot",
      },
      {
        path: "/interview",
        name: "Interview",
        folder: "interview",
        file: "interview",
        label: "桶",
        component: "interview",
        icon: "interview",
      },
      {
        path: "/nexttick",
        name: "Nexttick",
        folder: "nexttick",
        file: "nexttick",
        component: "nexttick",
        icon: "nexttick",
      },
      {
        path: "/permissions",
        name: "Permissions",
        folder: "permissions",
        file: "permissions",
        component: "permissions",
        icon: "permissions",
      },
    ],
    user: [
      {
        path: "/home",
        name: "Home",
        label: "首页",
        component: "home",
        meta: { requiresAuth: true }, // 标记需要登录的路由
      },
      {
        path: "/permissions",
        name: "Permissions",
        folder: "permissions",
        file: "permissions",
        component: "permissions",
        icon: "permissions",
      },
    ],
  };

  const user = req.query;
  const role = user.role; // 从请求参数获取角色
  const routes = routesByRole[role] || [];
  res.json({ message: "请求成功", routes });
});

// 查询菜单接口
router.get("/getMenu", (req, res) => {
  const menuByRole = {
    admin: [
      {
        path: "/home",
        menuName: "欢迎",
        icon: "dashboard",
        children: [
          {
            path: "/welcome",
            menuName: "欢迎",
            icon: "scan",
          },
          {
            path: "/parent",
            menuName: "父组件",
            icon: "sync",
          },
          {
            path: "/table",
            menuName: "表格",
            icon: "table",
          },
        ],
      },
      {
        path: "/vue",
        menuName: "vue类",
        icon: "windows",
        children: [
          {
            path: "/directive",
            menuName: "指令",
            icon: "stop",
          },
          {
            path: "/keepalive",
            menuName: "缓存",
            icon: "strikethrough",
          },
          {
            path: "/screenshot",
            menuName: "截屏",
            icon: "scissor",
          },
          {
            path: "/nexttick",
            menuName: "nexttick",
            icon: "scissor",
          },
          {
            path: "/permissions",
            menuName: "权限",
            icon: "scissor",
          },
        ],
      },
      {
        path: "/upload",
        menuName: "上传类",
        icon: "upload",

        children: [
          {
            path: "/upload",
            menuName: "上传",
            icon: "upload",
          },
        ],
      },
      {
        path: "/interview",
        menuName: "溜溜球",
        icon: "chrome",
        children: [
          {
            path: "/interview",
            menuName: "😂",
            icon: "chrome",
          },
        ],
      },
    ],
    user: [
      {
        path: "/home",
        menuName: "Home",
        label: "首页",
        component: "home",
        meta: { requiresAuth: true }, // 标记需要登录的路由
        icon: "fund",
      },
      {
        path: "/permissions",
        icon: "fund",
        menuName: "权限",
        children: [
          {
            path: "/permissions",
            menuName: "权限",
            icon: "chrome",
          },
        ],
      },
    ],
  };

  const user = req.query;
  const role = user.role; // 从请求参数获取角色
  const menu = menuByRole[role] || [];
  res.json({ message: "请求成功", menu });
});

// 查询题目列表
router.get("/getInterview", (req, res) => {
  let list = [
    { title: "  vue2和vue3有哪些区别？响应式有什么区别？讲下proxy对象" },
    { title: "说下虚拟DOM和diff算法，key的作用" },
    { title: "vue2和vue3 父组件怎么调用子组件的方法？有什么区别" },
    { title: "vue-router hash和histroy模式的区别" },
    { title: "vue是单向数据流，为什么有双向绑定" },
    { title: "vue2和vue3的diff有什么不同" },
    { title: "vue实现自定义指令基本工作流程开发过程" },
    { title: "vue中内置组件及其原理" },
    { title: "vue项目中style样式中为什么要添加 scoped" },
    { title: "vue-rouer导航守卫有哪些" },
    { title: "watch和computed的区别" },
    { title: "为什么data要定义成函数" },
    { title: "vuex怎么进行存储数据和获取数据" },
    { title: "vue组件传值方式" },
    { title: "用vue-router hash模式实现锚点" },
    { title: "mounted生命周期和keep-alive中activated的优先级" },
    { title: "如何在页面第一次加载不触发请求,后续每一次进入页面都触发" },
    { title: "vue2和vue3有什么区别" },
    { title: "你在用vue的时候用了哪些方式去做性能优化" },
    { title: "团队有没有做代码review" },
    { title: "对ts的熟练程度" },
    { title: "Vue中name的作用" },
    { title: "$set的实现方式" },
    { title: "你在使用vue3的时候都遇到过哪些坑？" },
    { title: "Vue2修改了数组哪些方法，为什么" },
    { title: "如何判断是一个优秀的Vue项目" },
    { title: "节点如何绑定Watcher的" },
    { title: "vue和react的区别" },
    {
      title:
        "vuex和redux的区别（被问到的这种对比的题目很多，建议可以多加一些这种题目）",
    },
    {
      title:
        "用vite做过线上部署嘛，vite在本地和线上的效率差别还是比较大的，为什么呢？",
    },
    { title: "vue3有哪些新特性" },
    {
      title:
        "vue3为什么要做新的静态标记（patch flag 优化静态属性），好处是什么",
    },
    { title: "Vue3.0 Object.difineProperty和vue3.0的proxy的区别" },
    {
      title:
        "Vue3.0 diff算法为什么更新，vue3用的最长的递增子序列相比vue2的双端对比好在哪",
    },
    { title: "父子组件钩子的执行顺序是什么" },
    { title: "Vue响应式原理" },
    { title: "Data里面如果有数组，如何检测数组的变化" },
    { title: "vue的生命周期和keep-alive组件声明周期" },
    { title: "computed 和 watch 有什么区别及运用场景" },
    { title: "你在使用vue3的时候都遇到过哪些坑？" },
    { title: "Vue3的proxy有什么缺点吗" },
    { title: "Vue2中mixins的作用是什么？和extend有什么区别" },
    { title: "Vue中遇到的最大的坑是什么？（怎么回答能显得有深度）" },
    { title: "react面试题" },
    { title: "什么场景需要自定义hooks?" },
    { title: "fiber 在hooks 组件上的体现有哪些？" },
    { title: "在react 中怎样的操作会导致内存泄漏？" },
    { title: "10 个setState 为什么会渲染10次？" },
    { title: "什么是diff算法" },
    { title: "react 路由架构如何设计" },
    { title: "react 用户权限如何设计" },
    { title: "setstate 是同步还是异步" },
    { title: "hooks 性能优化" },
    { title: "类组件和函数组件有什么区别" },
    { title: "如何避免不必要的重新渲染" },
    { title: "高阶组件是什么，有哪些应用场景" },
    { title: "React Hook可以写在条件语句或者循环里嘛，为什么" },
    { title: "React组件通信场景有哪些？分别怎么实现通信呢？" },
    { title: "setState是同步还是异步" },
    { title: "对受控组件和非受控组件的理解" },
    { title: "react如果props里面传的是个深层的对象应该怎么处理" },
    {
      title: "React.memo，usememo，usecallback的区别，你们实际场景是如何使用的",
    },
    { title: "react旧虚拟dom有什么问题" },
    { title: "react fiber详述" },
    { title: "「 React Scheduler」为什么用MessageChannel 来做调度？" },
    { title: "react认为自己的任务应该执行多久（5ms，20ms）" },
    { title: "RN了解过吗" },
    {
      title:
        "为什么只有react做了fiber优化？vue是否也需要做类似优化？为什么vue没做呢？",
    },
    { title: "为什么要有 useRef 呢？为什么不能 const 定义一个对象？" },
    { title: "react 事件机制是怎么实现的" },
    { title: "react和vue有什么区别？开发项目时如何选择react和vue" },
    { title: "项目相关 & 性能优化" },
    { title: "什么是DDD" },
    { title: "关于前端架构的优化" },
    { title: "关于技术选型的原因" },
    { title: "关于前端架构设计" },
    { title: "下最近项目中遇到的难点或者项目中做过的亮点？" },
    { title: "低代码有做过吗，要怎么做?思路? 辅助线对齐功能具体怎么实现?" },
    { title: "讲一下管理系统项目中的权限和登录" },
    { title: "讲一下前端的权限管理" },
    { title: "图片加载错误怎么监听？" },
    { title: "New Image的加载错误怎么监听" },
    { title: "怎么定位到发生错误的元素" },
    { title: "文件分片上传的流程？超大文件全量hash很耗时，这个怎么优化？" },
    { title: "如果手动改变文件后缀名，怎么识别文件类型？" },
    { title: "B端与C端的区别？" },
    { title: "怎么提高项目稳定性呢？" },
    { title: "公共组件怎么去管理？公共组件怎么拆分？" },
    { title: "微前端的项目怎么去拆分？" },
    { title: "微前端的部署方面的问题，模块太多会不会不好管理，运维成本增加？" },
    { title: "微前端主要解决了哪些痛点问题？" },
    {
      title:
        "如果微前端项目没有上线，但是现在需要做新需求那么应该在老项目上还是新项目上进行开发？",
    },
    { title: "重构的逻辑" },
    { title: "你是怎么二次封装antd组件库的" },
    { title: "如何封装一个组件库" },
    {
      title:
        "webpack已经有热更新了，你们的微前端项目为什么要自己做一套热更新呢",
    },
    { title: "你在项目中哪里用到了docker，为什么要用docker，可以解决什么问题" },
    { title: "有用过虚拟列表嘛，是什么原理" },
    { title: "微前端的样式隔离是怎么做的？为什么没有用shadow dom？" },
    { title: "微前端方面了解过qiankun嘛，为什么不直接用，要自己新建一套呢" },
    { title: "你们的灰度链路是怎么做的" },
    {
      title:
        "我看你是一名开发，为什么在这个大项目中做了项目管理，是什么原因驱使的呢",
    },
    {
      title:
        "你们的devops是怎么做的，你在里面承担了哪些工作，有什么难点，是怎么解决的",
    },
    { title: "你们的devops里面有用到docker嘛，是怎么用的" },
    { title: "网页性能监控的方式，哥有什么优缺点，分别适用于什么场景" },
    {
      title: "对于博客的性能问题怎么解决（减少重绘重排，分页加载，懒加载图片）",
    },
    {
      title:
        "追问，如果不允许实现分页，怎么减小加载的长度（懒加载页面，到可视区域再加载",
    },
    { title: "追问：如果每次页面滑到底部再加载新的，那么上面的怎么回收" },
    { title: "一个秒杀系统前端要做什么" },
    { title: "追问：假如让你设计秒杀系统的后端你会怎么设计" },
    {
      title:
        "追问：对于单个服务端来说，假如一瞬间有100个请求，怎么处理（过滤，只处理10个，或者依次处理）",
    },
    { title: "追问：如果只处理10个，但这10个人有些没有执行最终的购买怎么办" },
    { title: "你们是如何做自动化测试的" },
    { title: "你在项目中哪里用到了docker，为什么要用docker" },
    {
      title:
        "背景：我们自己写了一套脚手架模版；你们项目模板除了lint相关都做了哪些，都封装了哪些组件，配置了哪些东西为什么不直接用create-react-app，有什么区别",
    },
    {
      title:
        "Vue中管理系统侧边动态菜单栏的实现，除了使用v-if判断角色权限进行动态渲染外还有什么其他方式实现吗？",
    },
    { title: "是否封装过自定义的plugin和loader在什么情况下会进行封装" },
    { title: "ci cd 如何配置" },
    {
      title:
        "webpack有哪些配置？有哪些优化手段？wepback热更新？请求https接口devServer要怎么配置？",
    },
    { title: "nginx怎么做反向代理" },
    { title: "如何回答：介绍一下项目、说一下项目背景、项目怎么做的" },
    { title: "如果让你统计一个城市的垃圾桶，你应该怎么设计解决方案" },
    { title: "原生小程序优化处理哪些方面" },
    { title: "http和https的区别" },
    { title: "拆分组件可以提升性能 为什么要拆分组件" },
    { title: "小程序的渲染机制" },
    { title: "职业规划和学习计划" },
    { title: "对公司有哪些期望，什么公司符合期望" },
    { title: "学习了什么新技术，那么有没有使用到项目中去呢？" },
    { title: "写过单元测试吗？" },
    { title: "使用过GraphQL吗？" },
    { title: "享元模式使用过吗？" },
    { title: "双十一凑单用到了什么算法？" },
    { title: "你怎么看待前端" },
    { title: "ssr了解吗，ssr的优势是什么，缺点是什么" },
    { title: "了解过数据仓库吗" },
    {
      title: "事件循环中在node和浏览器有什么区别，在node11之前和之后有什么区别",
    },
    { title: "你怎么看待chatgpt？他对你的工作有哪些影响" },
    { title: "浏览器输入url后面会发生什么" },
    { title: "讲一下webpack的原理" },
    { title: "讲一下webpack热更新的原理" },
    { title: "有了解前端比较热门的技术嘛，平时是通过什么渠道了解的" },
    { title: "webpack loader和plugin区别" },
    { title: "对加班怎么看" },
    { title: "用过websocket嘛，做过聊天室嘛" },
    { title: "tcp报文架构" },
    { title: "TTL有什么用" },
    { title: "有了解过http3.0嘛" },
    { title: "npm,yarn,pnpm的各自优缺点，pnpm为什么比另外两个更好" },
    { title: "强缓存和协商缓存" },
    {
      title:
        "谈谈你是怎么实现大屏的实时数据更新？聊聊轮询机制，Coment和WebSocket？",
    },
    { title: "有了解过在大屏上配置视频源的方法？" },
    { title: "团队如何进行代码review" },
    { title: "预加载怎么做的" },
    { title: "如何合理的分割代码chunk" },
    { title: "FCP、LCP怎么优化的？" },
    { title: "http1一定比http2要慢吗？" },
    { title: "如果上传10M以上的图片展示图片时应该怎么优化？" },
    { title: "弹幕右边聊天框，如果并发量很大几千条，那么怎么做性能优化？" },
    { title: "你在项目中做过哪些跟性能优化相关的事情" },
  ];
  res.json({ message: "请求成功", list });
});
module.exports = router;
