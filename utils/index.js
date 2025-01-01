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
        {
          path: "/download",
          menuName: "下载",
          icon: "download",
        },
      ],
    },
    {
      path: "/vue插件",
      menuName: "vue插件",
      icon: "upload",
      children: [
        {
          path: "/loading",
          menuName: "加载中",
          icon: "download",
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
      path: "/download",
      name: "download",
      folder: "download",
      file: "download",
      label: "下载",
      component: "download",
      icon: "download",
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
    {
      path: "/loading",
      name: "Loading",
      folder: "loading",
      file: "loading",
      component: "loading",
      icon: "loading",
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
module.exports = {
  menuByRole,
  routesByRole,
};
