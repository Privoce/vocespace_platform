"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { UserProfile } from "./profile";
import UserSettings from "./settings";
import { getUsername, useUser } from "@/hooks/useUser";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { UserInfo } from "@/lib/std/user";
import { Nullable } from "@/lib/std";
import { message } from "antd";
import { HomeHeader } from "@/app/home/header";
import { useI18n } from "@/lib/i18n/i18n";
import { MessageInstance } from "antd/es/message/interface";
import { useSearchParams } from "next/navigation";

export type UserPageType = "profile" | "settings";

export interface UserPageUniProps {
  setPage: (page: UserPageType) => void;
  userId: string;
  user: Nullable<User>;
  userInfo: Nullable<UserInfo>;
  username: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  messageApi: MessageInstance;
  client: SupabaseClient;
}

export default function UserPage({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: {
    page?: UserPageType;
  };
}) {
  const [page, setPage] = useState<UserPageType>("profile");
  const [messageApi, contextHolder] = message.useMessage();
  const urlSearchParams = useSearchParams();
  const { user, userInfo, loading, setLoading, error, client } = useUser({
    userId: params.userId,
  });

  const username = useMemo(() => {
    return getUsername(user, userInfo);
  }, [userInfo, user]);

  // 创建一个可靠的参数获取函数
  const getPageParam = useCallback(() => {
    return (
      (urlSearchParams?.get("page") as UserPageType) ||
      searchParams?.page ||
      (typeof window !== "undefined"
        ? (new URLSearchParams(window.location.search).get(
            "page"
          ) as UserPageType)
        : null) ||
      "profile"
    );
  }, [urlSearchParams, searchParams]);

  useEffect(() => {
    if (error) {
      console.warn("Error loading user data:", error, params.userId);
      messageApi.error(error);
    }
  }, [error]);

  useEffect(() => {
    const pageParam = getPageParam();
    if (pageParam === "profile" || pageParam === "settings") {
      setPage(pageParam);
    }
  }, [urlSearchParams, searchParams, getPageParam]);

  return (
    <div className="uni-page-container">
      <HomeHeader messageApi={messageApi} />
      {contextHolder}
      {page === "profile" ? (
        <UserProfile
          client={client}
          userId={params.userId}
          username={username}
          user={user}
          userInfo={userInfo}
          loading={loading}
          setLoading={setLoading}
          messageApi={messageApi}
          setPage={setPage}
        />
      ) : (
        <UserSettings
          client={client}
          username={username}
          userId={params.userId}
          user={user}
          userInfo={userInfo}
          loading={loading}
          setLoading={setLoading}
          setPage={setPage}
          messageApi={messageApi}
        />
      )}
    </div>
  );
}
