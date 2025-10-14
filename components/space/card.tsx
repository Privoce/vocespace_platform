"use client";

import React from "react";
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

type SpaceCardProps = Space;

export function SpaceCard({
  id,
  name,
  desc,
  created_at,
  start_at,
  end_at,
  freq,
  fee,
  owner_name,
  state,
  sub_count,
  online_count,
  url,
  images,
}: SpaceCardProps) {
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = () => {
    const duration = end_at - start_at;
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
    window.open(url, "_blank");
  };

  const handleCardClick = () => {
    // Navigate to space detail page
    console.log("Navigate to space:", id);
  };

  const defaultImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='14' fill='%23999'%3E空间封面图%3C/text%3E%3C/svg%3E";
  const spaceImage =
    images && images.length > 0 ? images[0] : "/images/default_intro.png";

  return (
    <Card
      className={styles.spaceCard}
      onClick={handleCardClick}
      styles={{ body: { padding: 0 } }}
    >
      <div className={styles.imageSection}>
        <img
          src={spaceImage}
          alt={name}
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />

        <div className={`${styles.feeTag} ${fee === 0 ? styles.free : ""}`}>
          {fee === 0 ? "免费" : `¥${fee}`}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.content_line}>
          <div className={styles.name}>{name}</div>
        </div>

        <div className={styles.content_line_desc}>{desc}</div>

        <div className={styles.content_line}>
          <div className={styles.flex_line}>
            <CalendarOutlined className={styles.icon} />
            订阅频率: {formatFrequency(freq)}
          </div>
        </div>
        <div className={styles.content_line}>
          <div className={styles.flex_line}>
            <ClockCircleOutlined className={styles.icon} />
            {formatTime(start_at)} - {formatTime(end_at)} (持续{" "}
            {formatDuration()})
          </div>
        </div>

        <div className={styles.content_inline}>
          <div className={styles.flex_line}>
            <UserOutlined className={styles.icon} />
            <span className={styles.value}>{sub_count}</span>
          </div>
          <div className={styles.flex_line}>
            <EyeOutlined className={styles.icon} />
            <span className={styles.value}>{online_count}</span>
          </div>
          <div className={styles.flex_line}>
            <DollarOutlined className={styles.icon} />
            <span className={styles.value}>¥{fee}</span>
          </div>
        </div>

        <div className={styles.content_line}>
          <div className={styles.flex_line}>
            空间所有者: <span className={styles.ownerName}>{owner_name}</span>
          </div>
        </div>
        <div className={styles.content_line}>
          <div className={styles.flex_line}>
            <span>状态:</span>
            <Tag
              bordered={true}
              color={state === SpaceState.Active ? "success" : "warning"}
            >
              {" "}
              {state === SpaceState.Active ? "活跃" : "等待中"}
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
