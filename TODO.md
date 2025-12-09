- [x] 首页
  - [x] header: HomeHeader
    - [x] 描述 (发现Vocespace空间)
    - [x] 搜索框
  - [x] main: HomeMain
    - [x] SpaceCard 列表
  - [x] user box
    - [x] 跳转用户profile
    - [x] 退出登陆
- [x] 空间卡片: SpaceCard
  - [x] edit类型
  - [x] 空间宣传图
  - [x] 空间名
  - [x] 空间描述
  - [x] 订阅频率 (每天/每周某天/每周某几天/每月某天)
  - [x] 空间开始时间（类似于主播几点开播）
  - [x] 空间持续时间（空间所有者创建时间 ～ 最终销毁时间）
  - [x] 数据
    - [x] 订阅数
    - [x] 在线人数
    - [x] 空间所有者名字
  - [x] 空间为公开/付费（付费需要显示费用）
  - [x] 加入空间按钮
  - [x] 当前状态
    - [x] Active 表示活跃，空间内内容已经倒了开始时间
    - [x] Waiting 表示等待中，表示空间内容未开始
- [x] 空间介绍页面: SpaceAbout
  - [x] 空间README部分（类似github）
  - [x] 空间宣传视频/图片
- [x] 登陆
  - [x] 验证登陆
  - [x] Google接入
- [x] 注册
  - [x] 验证注册
  - [x] 修改注册邮箱验证消息
- [x] supabase接入
- [x] 用户页
  - [x] profile
    - [x] 用户信息
    - [x] 数据统计
    - [x] 我创建的空间
    - [x] 活动统计
    - [x] 热力图
- [x] 整理版本 
- [ ] ～空间发布～
- [ ] ～后台页面～
- [ ] ～图片/视频审核(Google Vision SafeSearch)～
- [x] 默认展开空间列表
- [x] 创建空间 -> 我的空间
- [x] 昵称默认为google登陆元数据(如果有)
- [x] 订阅空间 -> 历史记录
- [x] 左侧icon Button -> icon
- [ ] vocespace.com google登陆 loading page 覆盖login页面
- [x] profile左侧settings page可以去除
- [x] 优化loading 骨架屏
- [x] 多创建了一次自己的Vocespace空间
- [x] email点击之后不要自动打开邮件，email和微信弹出modal进行手动复制
- [x] 查询数据接口没有发
- [x] 头像策略更换为加时间戳，然后删除原始图片
- [x] Google用户信息转userInfo的json解析有问题
- [x] 默认房间名为名字即可不用图片
- [x] a标签打开的链接以domain作为了基础地址
- [x] header里的avatar没有使用更新的头像
- [x] 历史记录图标使用<HistoryOutlined />
- [x] 首页Empty使用Empty.PRESENTED_IMAGE_SIMPLE 
- [x] chrome中space card image alt 默认样式问题
- [x] 退出重定向登陆页
- [x] collapse 开启图标旋转
- [x] google登陆资料页
- [x] vocespace.com google登陆失败（待复现）
- [x] 时区时间戳出现问题


http://localhost:3001/auth/user/7792d9c6-bc73-4145-bfee-baa112567006?logout=true


增加widget右侧跳转到个人待办与分析页面按钮

https://www.figma.com/design/NKlzkfflv1oUlq5IOgtWnt/Timer?node-id=52-138&t=nBJXwOaQtRpUcOyb-0