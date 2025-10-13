"use client";

import React from "react";
import { Button, GetProps, Input } from "antd";
import styles from "@/styles/home_header.module.scss";
import { useRouter } from "next/navigation";

export function HomeHeader() {
  const router = useRouter();
  const toLogin = () => {
    router.push("/auth/login");
  };

  return (
    <header className={styles.home_header}>
      <img src="/logo.svg"></img>
      <Button type="primary" size="large" onClick={toLogin}>
        登陆
      </Button>
    </header>
  );
}
