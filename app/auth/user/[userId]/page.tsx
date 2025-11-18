"use client";
import { useEffect, useState, useRef } from "react";
import { UserProfile } from "./profile";
import OnboardingDrive from "./drive";
import { useUser } from "@/hooks/useUser";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { UserInfo } from "@/lib/std/user";
import { Card, message, Result, Skeleton } from "antd";
import { HomeHeader, HomeHeaderExports } from "@/app/home/header";
import { useI18n } from "@/lib/i18n/i18n";
import { MessageInstance } from "antd/es/message/interface";
import styles from "@/styles/user_settings.module.scss";
import { Space } from "@/lib/std/space";
import { Nullable } from "@/lib/std";
import { useRouter, useSearchParams } from "next/navigation";
import { dbApi } from "@/lib/api/db";

export interface UserPageUniProps {
  userId: string;
  messageApi: MessageInstance;
  client: SupabaseClient;
  flushUser: () => Promise<void>;
  // 从父组件传递的用户数据
  user: Nullable<User>;
  userInfo: Nullable<UserInfo>;
  avatar: string | null;
  isSelf: boolean;
  loading: boolean;
  spaces: Space[];
  updateUserInfo: (updates: any) => Promise<boolean>;
}

export default function UserPage({ params }: { params: { userId: string } }) {
  const [messageApi, contextHolder] = message.useMessage();
  const HomeHeaderRef = useRef<HomeHeaderExports>(null);
  const urlSearchParams = useSearchParams();
  const router = useRouter();
  // const urlSearchParams = useSearchParams();
  // const router = useRouter();
  const { t } = useI18n();
  // 使用新的 useUser hook
  const {
    user,
    userInfo,
    spaces,
    avatar,
    isSelf,
    loading,
    error,
    needsOnboarding,
    client,
    refreshUserData,
    updateUserInfo,
  } = useUser({
    userId: params.userId,
  });

  useEffect(() => {
    if (error) {
      console.warn("Error loading user data:", error, params.userId);

      messageApi.error(error);
    }
  }, [error, messageApi, params.userId]);

  const flushUser = async () => {
    await refreshUserData();
    if (HomeHeaderRef.current) {
      await HomeHeaderRef.current.flush();
    }
  };

  // 如果searchParam中包含logout=true，直接退出登陆
  useEffect(() => {
    if (urlSearchParams.get("logout") === "true" && user) {
      client.auth.signOut().then(async () => {
        const _ = await dbApi.userInfo.offline(client, user!.id);
        flushUser();
        setTimeout(() => {
          router.replace("/auth/login");
        }, 500);
      });
    }
  }, [urlSearchParams, client, user]);

  // 如果查看的不是自己的页面，且用户存在但昵称未设置，显示该用户无法访问
  // 如果是onboarding页面，显示onboarding组件
  return (
    <div className="uni-page-container">
      <HomeHeader ref={HomeHeaderRef} messageApi={messageApi} />
      {contextHolder}
      {loading && !user && (
        <Card
          style={{
            height: "calc(100vh - 98px)",
            width: "460px",
            backgroundColor: "#1E1E1E",
            border: "1px solid #1E1E1E",
            borderRadius: 16,
          }}
          styles={{
            body: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignContent: "flex-start",
              gap: "16px",
              padding: "36px 0",
              flexWrap: "wrap",
              position: "relative",
              height: "100%",
            },
          }}
        >
          <Skeleton.Avatar active size={96} />
          <Skeleton.Input active style={{ width: 400 }} />
          <Skeleton.Input active style={{ width: 400 }} />
          <Skeleton.Input active style={{ width: 400 }} />
          <Skeleton.Input active style={{ width: 400 }} />
          <Skeleton.Button
            active
            style={{
              width: 200,
              position: "absolute",
              bottom: 36,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </Card>
      )}
      {needsOnboarding && (
        <>
          {isSelf && user && needsOnboarding ? (
            <OnboardingDrive
              flushUser={flushUser}
              user={user}
              userInfo={userInfo}
              client={client}
              messageApi={messageApi}
              onComplete={flushUser}
              updateUserInfo={updateUserInfo}
            />
          ) : (
            <Result
              status="404"
              title={t("login.visit.un")}
              subTitle={
                <span style={{ color: "#8c8c8c" }}>
                  {t("login.visit.unFinished")}
                </span>
              }
            ></Result>
          )}
        </>
      )}
      {userInfo && !needsOnboarding && userInfo.username && (
        <div className={styles.user_view}>
          <UserProfile
            flushUser={flushUser}
            client={client}
            userId={params.userId}
            messageApi={messageApi}
            spaces={spaces}
            user={user}
            userInfo={userInfo}
            avatar={avatar}
            isSelf={isSelf}
            loading={loading}
            updateUserInfo={updateUserInfo}
          />
        </div>
      )}
    </div>
  );
}
