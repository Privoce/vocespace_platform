"use client";

import React, { useState, useEffect } from "react";
import { Spin, Empty, Tabs, TabsProps, List, FloatButton } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { SpaceCard } from "@/components/space/card";
import { Space } from "@/lib/std/space";
import styles from "@/styles/home_main.module.scss";
import { api } from "@/lib/api";

export function DisplaySpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getSpaces = async () => {
    setLoading(true);
    const response = await api.vocespace.allSpaces();
    if (response.ok) {
      const { spaces }: { spaces: Space[] } = await response.json();
      setSpaces(spaces);
    } else {
      console.error("Failed to fetch spaces");
    }

    setLoading(false);
  };

  useEffect(() => {
    // Simulate API call
    getSpaces();
  }, []);

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "all",
      label: "全部",
      children: (
        <div className={styles.spaceGrid}>
          {spaces.length == 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              grid={{ gutter: 20, column: 3 }}
              dataSource={spaces}
              renderItem={(space) => (
                <List.Item>
                  <SpaceCard key={space.id} space={space} />
                </List.Item>
              )}
            ></List>
          )}
        </div>
      ),
    },
    // {
    //   key: SpaceType.Meeting,
    //   label: "会议",
    //   children: (
    //     <div className={styles.spaceGrid}>
    //       {spaces.map((space) => (
    //         <SpaceCard key={space.id} {...space} />
    //       ))}
    //     </div>
    //   ),
    // },
    // {
    //   key: SpaceType.Class,
    //   label: "课程",
    //   children: (
    //     <div className={styles.spaceGrid}>
    //       {spaces.map((space) => (
    //         <SpaceCard key={space.id} {...space} />
    //       ))}
    //     </div>
    //   ),
    // },
    // {
    //   key: SpaceType.Hobbies,
    //   label: "兴趣",
    //   children: <div className={styles.spaceGrid}></div>,
    // },
    // {
    //   key: SpaceType.Tech,
    //   label: "技术",
    //   children: <div className={styles.spaceGrid}></div>,
    // },
  ];

  return (
    <div className={styles.space}>
      <div className={styles.space_tabs}>
        {loading ? (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </div>
        ) : spaces.length == 0 ? (
          <Empty
            description="暂无空间"
            style={{ margin: "40px 0" }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Tabs
            size="large"
            defaultActiveKey="1"
            items={items}
            onChange={onChange}
          />
        )}
      </div>

      {/* 浮动创建按钮 */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => router.push("/space/edit")}
        tooltip="创建新空间"
      />
    </div>
  );
}
