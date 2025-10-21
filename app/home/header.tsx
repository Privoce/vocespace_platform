"use client";

import React, { useEffect, useMemo } from "react";
import styles from "@/styles/home_header.module.scss";
import { useRouter } from "next/navigation";
import { UserBox } from "@/components/user/box";
import { getUsername, useUser } from "@/hooks/useUser";
import { MessageInstance } from "antd/es/message/interface";
import { LangSelect } from "@/components/widget/lang";

// 简化后的Props，不再需要传入client
export interface HomeHeaderProps {
  messageApi: MessageInstance;
}

export function HomeHeader({ messageApi }: HomeHeaderProps) {
  const router = useRouter();
  const { user, userInfo, loading, error } = useUser({});

  const username = useMemo(() => {
    return getUsername(user, userInfo);
  }, [userInfo, user]);

  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error]);

  return (
    <header className={styles.home_header}>
      <div className={styles.home_header_content}>
        <img
          src="/logo.svg"
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
        ></img>
        <div className={styles.home_header_right}>
          <LangSelect></LangSelect>
          <UserBox user={user} username={username} loading={loading}></UserBox>
        </div>
      </div>
    </header>
  );
}
