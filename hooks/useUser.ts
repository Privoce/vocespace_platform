import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { UserInfo } from "@/lib/std/user";
import { Nullable } from "@/lib/std";
import { MessageInstance } from "antd/es/message/interface";
import { api } from "@/lib/api";
import { dbApi } from "@/lib/api/db";
import { VocespaceError } from "@/lib/api/error";

export interface UseUserResult {
  user: Nullable<User>;
  userInfo: Nullable<UserInfo>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: Nullable<string>;
}

export interface useUserProps {
  userId?: string;
}

/**
 * Custom hook for handling Supabase user authentication
 *
 * Usage:
 * const { user, loading, error } = useUser();
 *
 * Features:
 * - Automatically fetches current user on mount
 * - Listens for auth state changes (login/logout)
 * - Handles loading and error states
 * - Returns null for user when not authenticated
 */
export function useUser({ userId }: useUserProps): UseUserResult {
  const [user, setUser] = useState<Nullable<User>>(null);
  const [userInfo, setUserInfo] = useState<Nullable<UserInfo>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Nullable<string>>(null);

  // 创建自己的VoceSpace
  const createSelfSpace = async (
    hasSpace: boolean,
    uid: string,
    username: string,
    spaceName?: string
  ): Promise<boolean> => {
    if (!hasSpace) {
      const response = await api.vocespace.createSpace(
        uid,
        username,
        spaceName
      );
      if (response.ok) {
        const {
          success,
          error,
        }: { success?: boolean; error?: VocespaceError } =
          await response.json();
        if (error) {
          console.error("Error creating vocespace:", error);
          switch (error) {
            case VocespaceError.CREATE_SPACE_EXIST:
              return true;
            case VocespaceError.CREATE_SPACE_PARAM_LACK:
              throw new Error(
                "缺少创建空间的必要参数, 若遇到此错误请联系开发者"
              );
            default:
              return false;
          }
        }
      }
      throw new Error("Failed to create default vocespace");
    }
    return true;
  };

  useEffect(() => {
    const client = createClient();

    // Get initial user
    const getInitialUser = async () => {
      try {
        setLoading(true);

        if (userId) {
          // userId存在，直接去查找userInfo即可
          const userInfo: UserInfo = await dbApi.userInfo.get(client, userId);
          // 不需要检查是否创建空间，因为这可能是查看别人的空间
          setUserInfo(userInfo);
        } else {
          const { data, error: userError } = await client.auth.getUser();

          if (userError) {
            console.error("Error fetching user:", userError);
            if (userError.message !== "Invalid JWT") {
              setError(userError.message);
            }
            setUser(null);
            setUserInfo(null);
          } else {
            setUser(data.user);
            // 如果获取到用户，尝试获取用户信息
            if (data.user) {
              let userInfo: UserInfo = await dbApi.userInfo.get(
                client,
                data.user.id
              );
              // 用户获取到之后，检查是否有自己的空间
              const hasSpace = await createSelfSpace(
                userInfo.has_space,
                userInfo.id,
                userInfo?.nickname || data.user.email!
              );
              if (hasSpace && !userInfo.has_space) {
                // 说明创建成功，更新用户信息
                userInfo.has_space = true;
              }
              setUserInfo(userInfo);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // setUser(null);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email);

      setLoading(false);
      setError(null);

      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          setUser(session?.user ?? null);
          break;
        case "SIGNED_OUT":
          setUser(null);
          setUserInfo(null);
          break;
        default:
          // For other events, check current session
          if (session) {
            setUser(session.user);
          } else {
            setUser(null);
            setUserInfo(null);
          }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading, setLoading, error, userInfo };
}

/**
 * Custom hook for user authentication actions
 *
 * Usage:
 * const { signOut, signIn, signUp } = useAuth();
 */
export function useAuth() {
  const client = createClient();

  const signOut = async () => {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await client.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  return { signOut, signIn, signUp };
}

export const getUsername = (
  user: Nullable<User>,
  userInfo: Nullable<UserInfo>
): string => {
  if (!user) return "unknown";
  if (userInfo?.nickname) {
    return userInfo.nickname;
  } else {
    if (
      user?.app_metadata &&
      user.app_metadata.provider === "google" &&
      user.user_metadata
    ) {
      return user.user_metadata.full_name || user.email;
    }
    return user.email!;
  }
};

export const whereUserFrom = (
  user: Nullable<User>
): "vocespace" | "google"  => {
  if (!user) return "vocespace";
  return user.app_metadata?.provider === "google" ? "google" : "vocespace";
};
