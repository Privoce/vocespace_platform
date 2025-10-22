export default {
  common: {
    save: "保存",
    cancel: "取消",
    uploading: "上传中...",
  },
  space: {
    pub: {
      intro: "快速创建您的空间，您可以随时编辑和管理它。",
      title: "快速创建空间",
      public: {
        title: "公开空间",
        pub: "公开",
        private: "私密",
        desc: "任何人都可以查看和订阅此空间",
      },
      name: "空间名称(必填)",
      desc: "空间描述(选填)",
      url: "空间地址(必填)",
      placeholder: {
        name: "请输入空间名称",
        desc: "请输入空间描述",
        url: "请输入空间地址",
      },
      validation: {
        name: "空间名称不能为空",
        url: "空间地址不能为空",
        failed: "空间创建失败，请检查必填项是否填写完整",
      },
      ok: "创建空间",
      cancel: "取消",
      success: "空间创建成功",
    },
  },
  user: {
    box: {
      profile: "个人资料",
      logout: "退出登录",
    },
    profile: {
      joinAt: "加入于",
      selfVocespace: "个人Vocespace",
      edit: "编辑资料",
      publishs: "创建空间",
      subscribes: "订阅空间",
      placeholder: {
        desc: "这位用户很懒，什么都没有留下。",
      },
      joinUs: {
        title: "加入Vocespace",
        user: "在Vocespace上加入"
      }
    },
    setting: {
      title: "用户设置",
      username: "用户名",
      nickname: "昵称",
      desc: "个人简介",
      location: "所在地",
      linkedin: "领英",
      github: "GitHub",
      twitter: "推特",
      website: "个人网站",
      wx: "微信",
      save: "保存设置",
      saving: "正在保存...",
      editAvatar: "更改头像",
      cropAvatar: "裁剪头像",
      avatarUpdateSuccess: "头像更新成功",
      avatarUpdateError: "头像更新失败",
      uploadError: "上传失败，请重试",
      imageFormatError: "只支持 JPG/PNG 格式的图片",
      imageSizeError: "图片大小不能超过 2MB",
      loadError: "加载用户信息失败",
      saveSuccess: "设置保存成功",
      saveError: "保存失败，请重试",
      placeholder: {
        username: "请输入用户名",
        nickname: "请输入昵称",
        desc: "请输入个人简介",
        location: "请输入所在地",
        linkedin: "请输入领英个人主页链接",
        github: "请输入GitHub个人主页链接",
        twitter: "请输入推特个人主页链接",
      },
    },
  },
  error: {
    bucket: {
      fileNoExt: "文件缺少扩展名，无法上传",
    },
  },
};
