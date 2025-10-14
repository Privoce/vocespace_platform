"use client";

import React, { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Tooltip,
  Tag,
  Modal,
  message,
  Dropdown,
  MenuProps,
  List,
} from "antd";
import {
  EditOutlined,
  SettingOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Pie } from "@ant-design/charts";
import { HomeHeader } from "@/app/home/header";
import { SpaceCard } from "@/components/space/card";
import { User, UserStats } from "@/lib/std/user";
import {
  Space,
  SpaceType,
  SpaceState,
  FrequencyInterval,
} from "@/lib/std/space";
import styles from "./UserProfile.module.scss";
import dayjs from "dayjs";
import { VocespaceLogo } from "@/components/widget/logo";

// Mock用户数据
const mockUser: User = {
  id: "user1",
  username: "张三",
  email: "zhangsan@example.com",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=syf",
  bio: "热爱技术的全栈开发者，专注于前端和后端开发。喜欢分享技术心得，参与开源项目。",
  created_at: Date.now() / 1000 - 55 * 24 * 3600,
  updated_at: Date.now() / 1000,
  location: "北京，中国",
  website: "https://zhangsan.dev",
  social_links: {
    github: "https://github.com/zhangsan",
    twitter: "https://twitter.com/zhangsan",
    linkedin: "https://linkedin.com/in/zhangsan",
  },
  total_spaces_created: 5,
  total_spaces_subscribed: 23,
  total_participation_hours: 156,
};

// Mock用户统计数据
const mockUserStats: UserStats = {
  space_type_preferences: {
    [SpaceType.Tech]: 45,
    [SpaceType.Meeting]: 25,
    [SpaceType.Class]: 20,
    [SpaceType.Hobbies]: 10,
  },
  activity_heatmap: generateMockHeatmapData(),
  monthly_stats: [
    {
      month: "2024-01",
      spaces_created: 1,
      spaces_joined: 5,
      total_duration: 20,
    },
    {
      month: "2024-02",
      spaces_created: 0,
      spaces_joined: 8,
      total_duration: 35,
    },
    {
      month: "2024-03",
      spaces_created: 2,
      spaces_joined: 12,
      total_duration: 45,
    },
  ],
  overview: {
    total_spaces_created: 5,
    total_spaces_subscribed: 23,
    total_participation_hours: 156,
    longest_streak_days: 15,
    current_streak_days: 7,
    most_active_space_type: SpaceType.Tech,
    average_session_duration: 45,
  },
};

// Mock用户创建的空间
const mockUserSpaces: Space[] = [
  {
    id: "1",
    name: "前端技术交流",
    desc: "分享前端开发经验和最新技术趋势",
    created_at: Date.now() / 1000,
    start_at: Date.now() / 1000 + 3600,
    end_at: Date.now() / 1000 + 7200,
    freq: {
      interval: FrequencyInterval.Weekly,
      in_week: [1, 3, 5],
    },
    fee: 0,
    owner_id: "user1",
    owner_name: "张三",
    state: SpaceState.Active,
    sub_count: 125,
    online_count: 15,
    url: "https://example.com/space1",
    images: [],
    ty: SpaceType.Tech,
    readme: "# 前端技术交流空间",
  },
  // 添加更多mock数据...
];

// 生成模拟热力图数据
function generateMockHeatmapData() {
  const data = [];
  const today = dayjs();

  for (let i = 0; i < 365; i++) {
    const date = today.subtract(i, "day");
    const count = Math.floor(Math.random() * 5); // 0-4的随机数
    const duration = count * (20 + Math.floor(Math.random() * 40)); // 20-60分钟

    data.push({
      date: date.format("YYYY-MM-DD"),
      count,
      duration,
    });
  }

  return data.reverse();
}

interface UserProfileProps {
  userId?: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User>(mockUser);
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
  const [userSpaces, setUserSpaces] = useState<Space[]>(mockUserSpaces);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // 在实际应用中，这里会根据userId获取用户数据
    setLoading(false);
  };

  const handleEditProfile = () => {
    // 打开编辑个人资料对话框
    message.info("编辑个人资料功能待实现");
  };

  const handleDeleteSpace = async (spaceId: string) => {
    Modal.confirm({
      title: "确认删除空间",
      content: "删除后不可恢复，确定要删除这个空间吗？",
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setUserSpaces((prev) => prev.filter((space) => space.id !== spaceId));
          message.success("空间删除成功");
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  // 空间类型偏好图表配置
  const pieConfig = {
    appendPadding: 10,
    data: Object.entries(userStats.space_type_preferences).map(
      ([type, value]) => ({
        type: getSpaceTypeName(type as SpaceType),
        value,
      })
    ),
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [{ type: "element-active" }],
    color: ["#1890ff", "#52c41a", "#faad14", "#f5222d"],
  };

  function getSpaceTypeName(type: SpaceType) {
    const typeNames = {
      [SpaceType.Tech]: "技术",
      [SpaceType.Meeting]: "会议",
      [SpaceType.Class]: "课程",
      [SpaceType.Hobbies]: "兴趣",
    };
    return typeNames[type] || type;
  }

  const getHeatmapLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 2) return 2;
    if (count <= 3) return 3;
    return 4;
  };

  const spaceActions: MenuProps["items"] = [
    {
      key: "edit",
      label: "编辑空间",
      icon: <EditOutlined />,
    },
    {
      key: "delete",
      label: "删除空间",
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  return (
    <div className={styles.userProfile}>
      <HomeHeader />

      <div className={styles.container}>
        {/* 个人资料头部 */}
        <Card className={styles.profileHeader}>
          <div className={styles.headerContent}>
            <div className={styles.avatarSection}>
              <Avatar
                size={120}
                src={user.avatar_url}
                className={styles.avatar}
              >
                {user.username?.[0]}
              </Avatar>
              <Button
                icon={<EditOutlined />}
                type="default"
                onClick={handleEditProfile}
              >
                编辑头像
              </Button>
            </div>

            <div className={styles.profileInfo}>
              <h1 className={styles.username}>{user.username}</h1>
              {/* <div className={styles.email}>{user.email}</div> */}

              {user.bio && <div className={styles.bio}>{user.bio}</div>}

              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <CalendarOutlined className={styles.icon} />
                  加入于 {dayjs(user.created_at * 1000).format("YYYY年MM月")}
                </div>
                {user.location && (
                  <div className={styles.metaItem}>
                    <EnvironmentOutlined className={styles.icon} />
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <div className={styles.metaItem}>
                    <VocespaceLogo></VocespaceLogo>
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      个人Vocespace
                    </a>
                  </div>
                )}
              </div>

              {user.social_links && (
                <div className={styles.socialLinks}>
                  {user.social_links.github && (
                    <Tooltip title="GitHub">
                      <Button type="default">
                        <a
                          href={user.social_links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <GithubOutlined />
                        </a>
                      </Button>
                    </Tooltip>
                  )}
                  {user.social_links.twitter && (
                    <Tooltip title="Twitter">
                      <Button type="default">
                        <a
                          href={user.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <TwitterOutlined />
                        </a>
                      </Button>
                    </Tooltip>
                  )}
                  {user.social_links.linkedin && (
                    <Tooltip title="LinkedIn">
                      <Button type="default">
                        <a
                          href={user.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkedinOutlined />
                        </a>
                      </Button>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>

            <div className={styles.profileActions}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditProfile}
              >
                编辑资料
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => message.info("设置功能待实现")}
              >
                设置
              </Button>
            </div>
          </div>
        </Card>

        {/* 统计数据卡片 */}
        <div className={styles.profileStats}>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>
              {userStats.overview.total_spaces_created}
            </div>
            <div className={styles.statLabel}>创建空间</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>
              {userStats.overview.total_spaces_subscribed}
            </div>
            <div className={styles.statLabel}>订阅空间</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>
              {userStats.overview.total_participation_hours}h
            </div>
            <div className={styles.statLabel}>参与时长</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>
              {userStats.overview.current_streak_days}
            </div>
            <div className={styles.statLabel}>连续天数</div>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            {/* 我的空间 */}
            <Card className={styles.sectionCard}>
              <div className={styles.sectionCard_inner}>
                <div className={styles.sectionTitle}>
                  <TeamOutlined className={styles.icon} />
                  我创建的空间 ({userSpaces.length})
                </div>

                <div className={styles.userSpacesList}>
                  <List
                    dataSource={userSpaces}
                    renderItem={(item) => (
                      <List.Item>
                        <SpaceCard {...item} cardType="edit" />
                      </List.Item>
                    )}
                  ></List>
                </div>
              </div>
            </Card>
            {/* 参与活动热力图 */}
            <Card className={styles.sectionCard}>
              <div className={styles.sectionTitle}>
                <FireOutlined className={styles.icon} />
                参与活动热力图
              </div>

              <div className={styles.activityCalendar}>
                <div className={styles.calendarHeader}>
                  <span>过去一年的活动情况</span>
                  <div className={styles.yearNav}>
                    <Button
                      size="small"
                      onClick={() => setSelectedYear(selectedYear - 1)}
                    >
                      {selectedYear - 1}
                    </Button>
                    <Button size="small" type="primary">
                      {selectedYear}
                    </Button>
                  </div>
                </div>

                <div className={styles.heatmapGrid}>
                  {userStats.activity_heatmap.map((item, index) => (
                    <Tooltip
                      key={index}
                      title={`${item.date}: ${item.count}次参与, ${item.duration}分钟`}
                    >
                      <div
                        className={`${styles.heatmapCell} ${
                          styles[`level-${getHeatmapLevel(item.count)}`]
                        }`}
                      />
                    </Tooltip>
                  ))}
                </div>

                <div className={styles.calendarLegend}>
                  <span>较少</span>
                  <div className={styles.legendItem}>
                    <div
                      className={`${styles.heatmapCell} ${styles["level-0"]}`}
                    />
                    <div
                      className={`${styles.heatmapCell} ${styles["level-1"]}`}
                    />
                    <div
                      className={`${styles.heatmapCell} ${styles["level-2"]}`}
                    />
                    <div
                      className={`${styles.heatmapCell} ${styles["level-3"]}`}
                    />
                    <div
                      className={`${styles.heatmapCell} ${styles["level-4"]}`}
                    />
                  </div>
                  <span>较多</span>
                </div>
              </div>
            </Card>

            {/* 空间类型偏好 */}
            <Card className={styles.sectionCard}>
              <div className={styles.sectionTitle}>
                <TrophyOutlined className={styles.icon} />
                空间类型偏好
              </div>
              <div className={styles.spaceTypeChart}>
                <div className={styles.chartContainer}>
                  <Pie {...pieConfig} />
                </div>
              </div>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className={styles.sidebar}>
            {/* 最近活动 */}
            <Card className={styles.sectionCard}>
              <div className={styles.sectionTitle}>
                <ClockCircleOutlined style={{color: "#22CCEE"}} />
                最近活动
              </div>

              <div className={styles.recentActivity}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <PlayCircleOutlined />
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      参与了"前端技术交流"
                    </div>
                    <div className={styles.activityTime}>2小时前</div>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <TeamOutlined />
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      创建了新空间"React进阶"
                    </div>
                    <div className={styles.activityTime}>1天前</div>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <UserOutlined />
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      订阅了"设计师聚会"
                    </div>
                    <div className={styles.activityTime}>3天前</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
