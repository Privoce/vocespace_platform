"use client";

import React, { useState, useEffect } from "react";
import { Spin, Empty, Tabs, TabsProps, List } from "antd";
import { SpaceCard } from "@/components/space/card";
import {
  Space,
  SpaceState,
  FrequencyInterval,
  SpaceType,
} from "@/lib/std/space";
import styles from "@/styles/home_main.module.scss";

// Mock data for demonstration
const mockSpaces: Space[] = [
  {
    id: "1",
    name: "技术交流空间",
    desc: "分享最新的技术趋势和开发经验，与全球开发者一起讨论编程技术、架构设计和最佳实践。",
    created_at: Date.now() / 1000,
    start_at: Date.now() / 1000 + 3600, // 1 hour from now
    end_at: Date.now() / 1000 + 7200, // 2 hours from now
    freq: {
      interval: FrequencyInterval.Weekly,
      in_week: [1, 3, 5], // Monday, Wednesday, Friday
    },
    fee: 0,
    owner_id: "user1",
    owner_name: "张三",
    state: SpaceState.Active,
    sub_count: 1250,
    online_count: 45,
    url: "https://example.com/space1",
    images: [],
    ty: SpaceType.Tech,
  },
  {
    id: "2",
    name: "创业分享会",
    desc: "创业经验分享，投资人见面会，商业模式讨论。适合创业者、投资人和对创业感兴趣的朋友。",
    created_at: Date.now() / 1000,
    start_at: Date.now() / 1000 + 1800, // 30 minutes from now
    end_at: Date.now() / 1000 + 5400, // 1.5 hours from now
    freq: {
      interval: FrequencyInterval.Weekly,
      in_week: [2, 4], // Tuesday, Thursday
    },
    fee: 99,
    owner_id: "user2",
    owner_name: "李四",
    state: SpaceState.Waiting,
    sub_count: 580,
    online_count: 0,
    url: "https://example.com/space2",
    images: [],
    ty: SpaceType.Meeting,
  },
  {
    id: "3",
    name: "设计师聚会",
    desc: "UI/UX设计分享，设计工具使用技巧，作品点评和设计思维训练。",
    created_at: Date.now() / 1000,
    start_at: Date.now() / 1000 - 1800, // Started 30 minutes ago
    end_at: Date.now() / 1000 + 1800, // Ends in 30 minutes
    freq: {
      interval: FrequencyInterval.Daily,
    },
    fee: 0,
    owner_id: "user3",
    owner_name: "王五",
    state: SpaceState.Active,
    sub_count: 890,
    online_count: 67,
    url: "https://example.com/space3",
    images: [],
    ty: SpaceType.Class,
  },
  {
    id: "4",
    name: "金融投资课堂",
    desc: "股票、基金、加密货币投资策略分析，市场趋势解读，风险管理经验分享。",
    created_at: Date.now() / 1000,
    start_at: Date.now() / 1000 + 5400, // 1.5 hours from now
    end_at: Date.now() / 1000 + 9000, // 2.5 hours from now
    freq: {
      interval: FrequencyInterval.Monthly,
    },
    fee: 199,
    owner_id: "user4",
    owner_name: "赵六",
    state: SpaceState.Waiting,
    sub_count: 2340,
    online_count: 0,
    url: "https://example.com/space4",
    images: [],
    ty: SpaceType.Hobbies,
  },
  {
    id: "5",
    name: "语言学习角",
    desc: "多语言学习交流，包括英语、日语、韩语等，与native speaker对话练习。",
    created_at: Date.now() / 1000,
    start_at: Date.now() / 1000 + 600, // 10 minutes from now
    end_at: Date.now() / 1000 + 4200, // 70 minutes from now
    freq: {
      interval: FrequencyInterval.Flexible,
      in_week: [0, 1, 2, 3, 4, 5, 6], // Every day
    },
    fee: 0,
    owner_id: "user5",
    owner_name: "陈七",
    state: SpaceState.Waiting,
    sub_count: 756,
    online_count: 12,
    url: "https://example.com/space5",
    images: ["/images/language-space.jpg"],
    ty: SpaceType.Class,
  },
  {
    id: "6",
    name: "健身训练营",
    desc: "在线健身指导，瑜伽、普拉提、力量训练等多种运动形式，专业教练带练。",
    created_at: Date.now() / 1000,
    start_at: Date.now() / 1000 + 7200, // 2 hours from now
    end_at: Date.now() / 1000 + 10800, // 3 hours from now
    freq: {
      interval: FrequencyInterval.Weekly,
      in_week: [1, 3, 5, 0], // Monday, Wednesday, Friday, Sunday
    },
    fee: 49,
    owner_id: "user6",
    owner_name: "刘八",
    state: SpaceState.Waiting,
    sub_count: 1450,
    online_count: 0,
    url: "https://example.com/space6",
    images: ["/images/fitness-space.jpg"],
    ty: SpaceType.Hobbies,
  },
];

export function DisplaySpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadSpaces = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSpaces(mockSpaces);
      setLoading(false);
    };

    loadSpaces();
  }, []);

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "all",
      label: "全部",
      children: (
        <List
          grid={{ gutter: 20, column: 3 }}
          dataSource={spaces}
          renderItem={(space) => (
            <List.Item>
                <SpaceCard key={space.id} {...space} />
            </List.Item>
          )}
        ></List>
      ),
    },
    {
      key: SpaceType.Meeting,
      label: "会议",
      children: (
        <div className={styles.spaceGrid}>
          {spaces.map((space) => (
            <SpaceCard key={space.id} {...space} />
          ))}
        </div>
      ),
    },
    {
      key: SpaceType.Class,
      label: "课程",
      children: (
        <div className={styles.spaceGrid}>
          {spaces.map((space) => (
            <SpaceCard key={space.id} {...space} />
          ))}
        </div>
      ),
    },
    {
      key: SpaceType.Hobbies,
      label: "兴趣",
      children: <div className={styles.spaceGrid}></div>,
    },
    {
      key: SpaceType.Tech,
      label: "技术",
      children: <div className={styles.spaceGrid}></div>,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (spaces.length === 0) {
    return <Empty description="暂无空间" style={{ margin: "40px 0" }} />;
  }

  return (
    <div className={styles.space}>
      <div className={styles.space_tabs}>
        <Tabs
        size="large"
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
      />
      </div>
    </div>
  );
}
