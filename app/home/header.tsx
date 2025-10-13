"use client";

import React from "react";
import { Button, GetProps, Input } from "antd";
import styles from "@/styles/home_header.module.scss";
import { useRouter } from "next/navigation";
import { UserOutlined } from "@ant-design/icons";

export function HomeHeader() {
  const router = useRouter();
  const toLogin = () => {
    router.push("/auth/login");
  };

  return (
    <header className={styles.home_header}>
      <div className={styles.home_header_content}>
        <img src="/logo.svg"></img>
        <Button
          type="primary"
          size="large"
          onClick={toLogin}
          icon={<UserOutlined></UserOutlined>}
        >
          登陆
        </Button>
      </div>
    </header>
  );
}
