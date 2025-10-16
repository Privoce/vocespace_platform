"use client";

import React, { useEffect } from "react";
import styles from "@/styles/home_header.module.scss";
import { useRouter } from "next/navigation";
import { UserBox } from "@/components/user/box";
import { useUser } from "@/hooks/useUser";
import { MessageInstance } from "antd/es/message/interface";

// 简化后的Props，不再需要传入client
export interface HomeHeaderProps {
  messageApi: MessageInstance;
}

export function HomeHeader({ messageApi }: HomeHeaderProps) {
  const router = useRouter();
  const { user, loading, error } = useUser();

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
        <UserBox user={user} loading={loading}></UserBox>
      </div>
    </header>
  );
}
