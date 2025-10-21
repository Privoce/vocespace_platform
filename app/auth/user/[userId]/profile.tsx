"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Skeleton,
  Result,
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
  vocespaceUrl,
} from "@/lib/std/space";
import styles from "@/styles/user_profile.module.scss";
import dayjs from "dayjs";
import { VocespaceLogo } from "@/components/widget/logo";
import { getUsername, useUser, whereUserFrom } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { UserPageType, UserPageUniProps } from "./page";

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
  {
    id: "2",
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
  {
    id: "3",
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
  {
    id: "4",
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

interface UserProfileProps extends UserPageUniProps {}

export function UserProfile({
  userId,
  username,
  setPage,
  user,
  userInfo,
  loading,
  setLoading,
}: UserProfileProps) {
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
  const [userSpaces, setUserSpaces] = useState<Space[]>(mockUserSpaces);
  // const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  const selfVocespaceUrl = useMemo(() => {
    if (user && username) {
      return vocespaceUrl(user.id, username, whereUserFrom(user));
    } else {
      return "";
    }
  }, [user?.id, username]);

  const handleEditProfile = () => {
    setPage("settings");
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
  //   const pieConfig = {
  //     appendPadding: 10,
  //     data: Object.entries(userStats.space_type_preferences).map(
  //       ([type, value]) => ({
  //         type: getSpaceTypeName(type as SpaceType),
  //         value,
  //       })
  //     ),
  //     angleField: "value",
  //     colorField: "type",
  //     radius: 0.8,
  //     label: {
  //       type: "outer",
  //       content: "{name} {percentage}",
  //     },
  //     interactions: [{ type: "element-active" }],
  //     color: ["#1890ff", "#52c41a", "#faad14", "#f5222d"],
  //   };

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
      {loading ? (
        <div className={styles.container}>
          <Card className={styles.profileHeader}>
            <Skeleton avatar paragraph={{ rows: 4 }} active />
          </Card>
          <Skeleton.Node active style={{ width: "100%" }} />
        </div>
      ) : !user ? (
        <Result
          status="404"
          title="用户未找到"
          subTitle="抱歉，您要查看的用户不存在。"
        />
      ) : (
        <div className={styles.container}>
          {/* 个人资料头部 */}
          <Card className={styles.profileHeader}>
            <div className={styles.headerContent}>
              <div className={styles.avatarSection}>
                <Avatar
                  size={120}
                  className={styles.avatar}
                  src={
                    whereUserFrom(user) === "google"
                      ? user.user_metadata?.picture
                      : undefined
                  }
                  style={{
                    fontSize: 48,
                    backgroundColor: "#22CCEE",
                    border: "none",
                  }}
                >
                  {username.charAt(0).toUpperCase() || <UserOutlined />}
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
                <h1 className={styles.username}>{username}</h1>
                {/* <div className={styles.email}>{user.email}</div> */}

                <div className={styles.bio}>
                  {userInfo?.desc || "这位用户很懒，什么都没有留下。"}
                </div>
                <div className={styles.metaInfo}>
                  <div className={styles.metaItem}>
                    <CalendarOutlined className={styles.icon} />
                    加入于 {dayjs(user.created_at).format("YYYY年MM月")}
                  </div>
                  {userInfo?.location && (
                    <div className={styles.metaItem}>
                      <EnvironmentOutlined className={styles.icon} />
                      {userInfo.location}
                    </div>
                  )}

                  <div className={styles.metaItem}>
                    <VocespaceLogo></VocespaceLogo>
                    <a
                      href={selfVocespaceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      个人Vocespace
                    </a>
                  </div>
                </div>

                <div className={styles.socialLinks}>
                  <Tooltip title="Vocespace">
                    <Button type="default">
                      <a
                        href={selfVocespaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <VocespaceLogo></VocespaceLogo>
                      </a>
                    </Button>
                  </Tooltip>
                  {userInfo?.github && (
                    <Tooltip title="GitHub">
                      <Button type="default">
                        <a
                          href={userInfo.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <GithubOutlined />
                        </a>
                      </Button>
                    </Tooltip>
                  )}
                  {userInfo?.twitter && (
                    <Tooltip title="Twitter">
                      <Button type="default">
                        <a
                          href={userInfo.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <TwitterOutlined />
                        </a>
                      </Button>
                    </Tooltip>
                  )}
                  {userInfo?.linkedin && (
                    <Tooltip title="LinkedIn">
                      <Button type="default">
                        <a
                          href={userInfo.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkedinOutlined />
                        </a>
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className={styles.profileActions}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                >
                  编辑资料
                </Button>
                {/* <Button
                  icon={<SettingOutlined />}
                  onClick={() => message.info("设置功能待实现")}
                >
                  设置
                </Button> */}
              </div>
            </div>
          </Card>

          <div className={styles.profileStats}>
            <Card className={styles.statCard}>
              <div className={styles.statValue}>
                {(userInfo?.publishs?.length || 0) + 1}
              </div>
              <div className={styles.statLabel}>创建空间</div>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statValue}>
                {userInfo?.subscribes?.length || 0}
              </div>
              <div className={styles.statLabel}>订阅空间</div>
            </Card>
            {/* <Card className={styles.statCard}>
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
            </Card> */}
          </div>

          {/* <div className={styles.contentGrid}>
            <div className={styles.mainContent}>

              <Card className={styles.sectionCard}>
                <div className={styles.sectionCard_inner}>
                  <div className={styles.sectionTitle}>
                    <TeamOutlined className={styles.icon} />
                    我创建的空间 ({userSpaces.length})
                  </div>

                  <List
                    pagination={{
                      pageSize: 3,
                      position: "bottom",
                      size: "small",
                      simple: { readOnly: true },
                    }}
                    split={false}
                    bordered={false}
                    dataSource={userSpaces}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          height: "120px",
                          padding: "0",
                        }}
                      >
                        <SpaceCard {...item} cardType="edit" />
                      </List.Item>
                    )}
                  ></List>
                </div>
              </Card>

              <Card className={styles.sectionCard}>
                <div className={styles.sectionCard_inner}>
                  <div className={styles.sectionTitle}>
                    <FireOutlined className={styles.icon} />
                    参与活动热力图
                  </div>

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

                  <div className={styles.activityCalendar}>
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
            </div>
            <div className={styles.sidebar}>
              <Card className={styles.sectionCard}>
                <div className={styles.sectionTitle}>
                  <ClockCircleOutlined style={{ color: "#22CCEE" }} />
                  最近活动
                </div>

                <List
                  pagination={{
                    pageSize: 8,
                    position: "bottom",
                    size: "small",
                    simple: { readOnly: true },
                  }}
                  bordered={false}
                  dataSource={[
                    {
                      title: '参加了 "前端技术交流"',
                      time: "2小时前",
                      icon: <PlayCircleOutlined></PlayCircleOutlined>,
                    },
                    {
                      title: '创建了新空间 "React进阶"',
                      time: "1天前",
                      icon: <TeamOutlined></TeamOutlined>,
                    },
                    {
                      title: '订阅了 "设计师聚会"',
                      time: "3天前",
                      icon: <UserOutlined></UserOutlined>,
                    },
                  ]}
                  renderItem={(item) => (
                    <List.Item className={styles.activityItem}>
                      <div className={styles.activityIcon}>{item.icon}</div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityText}>{item.title}</div>
                        <div className={styles.activityTime}>{item.time}</div>
                      </div>
                    </List.Item>
                  )}
                ></List>
              </Card>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}
