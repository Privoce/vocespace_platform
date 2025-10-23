"use client";

import React, { useMemo } from "react";
import { Button, Card, Tag } from "antd";
import {
  UserOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Space, SpaceState, FrequencyInterval } from "@/lib/std/space";
import styles from "@/styles/space_card.module.scss";
import { useRouter } from "next/navigation";

export interface SpaceCardProps {
  space: Space;
  cardType?: "default" | "edit";
  style?: React.CSSProperties;
}

export function SpaceCard({
  space,
  style,
  cardType = "default",
}: SpaceCardProps) {
  const router = useRouter();

  const formatFrequency = (frequency: any) => {
    switch (frequency.interval) {
      case FrequencyInterval.Daily:
        return "每天";
      case FrequencyInterval.Weekly:
        return frequency.in_week?.length > 1
          ? `每周${frequency.in_week.length}天`
          : "每周";
      case FrequencyInterval.Monthly:
        return "每月";
      case FrequencyInterval.Yearly:
        return "每年";
      case FrequencyInterval.Flexible:
        return "灵活安排";
      default:
        return "按需安排";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = () => {
    if (!space.start_at || !space.end_at) return "";

    const duration =
      new Date(space.end_at).getTime() - new Date(space.start_at).getTime();
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    if (hours > 0) {
      return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
    }
    return `${minutes}分钟`;
  };

  const handleJoinSpace = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle join space logic
    // window.open(url, "_blank");
    // jump to space detail page
    router.push("/space/" + space.id);
  };

  const handleCardClick = () => {
    // Navigate to space detail page
    console.log("Navigate to space:", space.id);
    router.push("/space/" + space.id);
  };

  const defaultImage = "/images/default_space.jpg";

  const spaceImage = useMemo(() => {
    if (space.images.length > 0) {
      console.warn(space.images.length, space.images);
      return space.images[0] || defaultImage;
    } else {
      return defaultImage;
    }
  }, [space]);

  if (cardType === "edit") {
    return (
      <Card
        className={styles.spaceCard}
        styles={{ body: { padding: 0 } }}
        style={style}
        onClick={() => {
          window.open(space.url, "_blank");
        }}
      >
        <div className={styles.spaceCard_edit}>
          <div className={styles.spaceCard_edit_imageSection}>
            <img
              src={spaceImage}
              onError={(e) => {
                e.currentTarget.src = defaultImage;
              }}
            />
          </div>
          <div className={styles.spaceCard_edit_content}>
            <div className={styles.spaceCard_edit_content_name}>
              {space.name}
            </div>
            <div
              className={styles.spaceCard_edit_content_desc}
              title={space.desc}
            >
              {space.desc}
            </div>
            <div className={styles.spaceCard_edit_content_info}>
              <CalendarOutlined className={styles.icon} />
              订阅频率: {formatFrequency(space.freq)}
            </div>

            <div className={styles.content_inline}>
              <div className={styles.flex_line}>
                <UserOutlined className={styles.icon} />
                <span className={styles.value}>{space.sub_count}</span>
              </div>
              <div className={styles.flex_line}>
                <EyeOutlined className={styles.icon} />
                <span className={styles.value}>{space.online_count}</span>
              </div>
              <div className={styles.flex_line}>
                <DollarOutlined className={styles.icon} />
                <span className={styles.value}>¥{space.fee}</span>
              </div>
            </div>
          </div>
          {/* <div className={styles.spaceCard_edit_opts}>
            <Button type="primary" block onClick={()=> {}}>
              编辑
            </Button>
          </div> */}
        </div>
      </Card>
    );
  } else {
    return (
      <Card
        className={styles.spaceCard}
        onClick={handleCardClick}
        styles={{ body: { padding: 0 } }}
        style={style}
      >
        <div className={styles.imageSection}>
          <img
            src={spaceImage}
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />

          <div
            className={`${styles.feeTag} ${space.fee === 0 ? styles.free : ""}`}
          >
            {space.fee === 0 ? "免费" : `¥${space.fee}`}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.content_line}>
            <div className={styles.name}>{space.name}</div>
          </div>

          <div className={styles.content_line_desc}>{space.desc}</div>

          <div className={styles.content_line}>
            <div className={styles.flex_line}>
              <CalendarOutlined className={styles.icon} />
              订阅频率: {formatFrequency(space.freq)}
            </div>
          </div>
          <div className={styles.content_line}>
            {space.start_at && space.end_at && (
              <div className={styles.flex_line}>
                <ClockCircleOutlined className={styles.icon} />
                {formatTime(space.start_at)} - {formatTime(space.end_at)} (持续{" "}
                {formatDuration()})
              </div>
            )}
          </div>

          <div className={styles.content_inline}>
            <div className={styles.flex_line}>
              <UserOutlined className={styles.icon} />
              <span className={styles.value}>{space.sub_count}</span>
            </div>
            <div className={styles.flex_line}>
              <EyeOutlined className={styles.icon} />
              <span className={styles.value}>{space.online_count}</span>
            </div>
            <div className={styles.flex_line}>
              <DollarOutlined className={styles.icon} />
              <span className={styles.value}>¥{space.fee}</span>
            </div>
          </div>

          <div className={styles.content_line}>
            <div className={styles.flex_line}>
              空间所有者: <span className={styles.ownerName}>{}</span>
            </div>
          </div>
          <div className={styles.content_line}>
            <div className={styles.flex_line}>
              <span>状态:</span>
              <Tag
                bordered={true}
                color={
                  space.state === SpaceState.Active ? "success" : "warning"
                }
              >
                {" "}
                {space.state === SpaceState.Active ? "活跃" : "等待中"}
              </Tag>
            </div>
          </div>
          <Button block type="primary" onClick={handleJoinSpace}>
            加入空间
          </Button>
        </div>
      </Card>
    );
  }
}
