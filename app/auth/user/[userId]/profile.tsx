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
  RightOutlined,
  UsergroupAddOutlined,
  CommentOutlined,
  WechatFilled,
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
import { whereUserFrom } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { EditAvatarBtn, UserPageType, UserPageUniProps } from "./page";
import { useI18n } from "@/lib/i18n/i18n";
import { EasyPubSpaceModal } from "@/app/space/[spaceId]/edit/easy";
import { dbApi } from "@/lib/api/db";
import { useJoinUsBtn } from "./widgets/join";
import { useShareBtn } from "./widgets/share";

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
  setPage,
  messageApi,
  client,
  flushUser,
  user,
  userInfo,
  avatar,
  isSelf,
  loading,
  updateUserInfo,
}: UserProfileProps) {
  const { t } = useI18n();
  const [userSpaces, setUserSpaces] = useState<Space[]>([]);
  const [openPublishModal, setOpenPublishModal] = useState(false);

  const selfVocespaceUrl = useMemo(() => {
    if (user && userInfo.nickname) {
      return vocespaceUrl(user.id, userInfo.nickname, whereUserFrom(user));
    } else {
      return "";
    }
  }, [user?.id, userInfo]);

  useEffect(() => {
    const fetchUserSpaces = async () => {
      const spaces = await dbApi.space.getByUserId(client, userId);
      console.warn("Fetched user spaces:", spaces);
      setUserSpaces(spaces);
    };
    fetchUserSpaces();
  }, [userId]);

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
  const { JoinUsBtn, JoinUsModal, JoinUserBtn } = useJoinUsBtn({
    username: userInfo?.nickname,
  });
  const { ShareBtn, ShareModal } = useShareBtn({ userInfo });

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

  const confirmCreateSpace = async (space: Space) => {
    try {
      const success = await dbApi.space.insert(client, {
        ...space,
        owner_id: userId,
      });
      if (success) {
        messageApi.success("space.pub.success");
      }
    } catch (error) {
      messageApi.error(`${error}`);
    }
  };

  const links = useMemo(() => {
    return [
      {
        label: t("user.profile.selfVocespace"),
        url: selfVocespaceUrl,
        icon: <VocespaceLogo height={24} width={24} />,
      },
      {
        label: t("user.setting.email"),
        url: `mailto:${user?.email}`,
        icon: <MailOutlined style={{ fontSize: 24 }} />,
      },
      ...(userInfo?.github
        ? [
            {
              label: t("user.setting.github"),
              url: userInfo.github,
              icon: <GithubOutlined style={{ fontSize: 24 }} />,
            },
          ]
        : []),
      ...(userInfo?.twitter
        ? [
            {
              label: t("user.setting.twitter"),
              url: userInfo.twitter,
              icon: <TwitterOutlined style={{ fontSize: 24 }} />,
            },
          ]
        : []),
      ...(userInfo?.linkedin
        ? [
            {
              label: t("user.setting.linkedin"),
              url: userInfo.linkedin,
              icon: <LinkedinOutlined style={{ fontSize: 24 }} />,
            },
          ]
        : []),
      ...(userInfo?.website
        ? [
            {
              label: t("user.setting.website"),
              url: userInfo.website,
              icon: <GlobalOutlined style={{ fontSize: 24 }} />,
            },
          ]
        : []),
      ...(userInfo?.wx
        ? [
            {
              label: t("user.setting.wx"),
              url: userInfo.wx,
              icon: <WechatFilled style={{ fontSize: 24 }} />,
            },
          ]
        : []),
    ];
  }, [userInfo, selfVocespaceUrl, t, user]);

  const metaInfo = useMemo(() => {
    return [
      // {
      //   icon: <CalendarOutlined className={styles.icon} />,
      //   label: dayjs(user?.created_at).format("YYYY-MM"),
      // },
      ...(userInfo?.location
        ? [
            {
              icon: <EnvironmentOutlined className={styles.icon} />,
              label:
                userInfo.location || t("user.profile.placeholder.location"),
            },
          ]
        : []),
      {
        icon: <CommentOutlined className={styles.icon} />,
        label: `${t("user.profile.publishs")} : ${
          (userSpaces.length || 0) + 1
        }`,
      },
      {
        icon: <TrophyOutlined className={styles.icon} />,
        label: `${t("user.profile.subscribes")} : ${
          userInfo?.subscribes?.length || 0
        }`,
      },
    ];
  }, [userInfo, user, t]);

  return (
    <div className={styles.userProfile}>
      {loading ? (
        <div className={styles.container}>
          <Card
            className={styles.profileHeader}
            style={{ borderRadius: 16, height: "100%" }}
            styles={{
              body: {
                padding: 16,
                height: "100%",
              },
            }}
          >
            <Skeleton avatar paragraph={{ rows: 4 }} active />
          </Card>
          <Skeleton.Node active style={{ width: "100%" }} />
        </div>
      ) : !userInfo ? (
        <Result
          status="404"
          title="用户未找到"
          subTitle="抱歉，您要查看的用户不存在。"
        />
      ) : (
        <div className={styles.container}>
          {/* 个人资料头部 */}
          <Card
            style={{ borderRadius: 16, height: "100%" }}
            styles={{
              body: {
                padding: 16,
                height: "100%",
              },
            }}
          >
            <div className={styles.profile}>
              <div className={styles.header}>
                <div>{JoinUsBtn}</div>
                <div>{ShareBtn}</div>
              </div>
              <div className={styles.avatarSection}>
                <Avatar
                  size={80}
                  className={styles.avatar}
                  src={avatar}
                  style={{
                    fontSize: 48,
                    backgroundColor: avatar ? "transparent" : "#22CCEE",
                    border: "none",
                  }}
                >
                  {userInfo.nickname.charAt(0).toUpperCase() || (
                    <UserOutlined />
                  )}
                </Avatar>
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.username}>{userInfo.nickname}</div>
                <div className={styles.bio}>
                  {userInfo?.desc || t("user.profile.placeholder.desc")}
                </div>
                <div className={styles.socialLinks}>
                  {links.map((link, index) => (
                    <Tooltip title={link.label} key={index}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="text"
                          shape="circle"
                          icon={link.icon}
                        ></Button>
                      </a>
                    </Tooltip>
                  ))}
                </div>
                <div className={styles.metaInfo}>
                  <List
                    style={{ width: "100%" }}
                    dataSource={metaInfo}
                    renderItem={(item) => (
                      <List.Item className={styles.metaItem}>
                        <div className={styles.metaItem_content}>
                          <div>{item.icon}</div>
                          <div>{item.label}</div>
                        </div>
                        <RightOutlined></RightOutlined>
                      </List.Item>
                    )}
                  ></List>
                </div>
              </div>
              <footer className={styles.profileActions}>{JoinUserBtn}</footer>
            </div>
          </Card>
          {/* <Card className={styles.sectionCard}>
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
              </Card> */}
        </div>
      )}
      <EasyPubSpaceModal
        open={openPublishModal}
        setOpen={setOpenPublishModal}
        messageApi={messageApi}
        onSave={confirmCreateSpace}
        ownerId={userId}
      />
      {JoinUsModal}
      {ShareModal}
    </div>
  );
}
