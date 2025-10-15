"use client";

import React from "react";
import styles from "@/styles/home_header.module.scss";
import { useRouter } from "next/navigation";
import { UserBox } from "@/components/user/box";
import { useUser } from "@/hooks/useUser";

// 简化后的Props，不再需要传入client
export interface HomeHeaderProps {}

export function HomeHeader({}: HomeHeaderProps) {
  const router = useRouter();
  const { user, loading, error } = useUser();

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
