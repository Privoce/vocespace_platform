import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { dbApi } from "@/lib/api/db";
import { UserInfo } from "@/lib/std/user";
import { vocespace } from "@/lib/api/vocespace/space";
import { Nullable } from "@/lib/std";

export interface UseUserOptions {
  /**
   * 要查看的用户ID，如果不提供则使用当前认证用户
   */
  userId?: string;
}

export interface UseUserResult {
  // 认证相关
  authUser: Nullable<User>;
  authUserInfo: Nullable<UserInfo>;
  isAuthenticated: boolean;
  
  // 当前查看的用户相关
  user: Nullable<User>; // 保持向后兼容
  userInfo: Nullable<UserInfo>;
  username: string;
  avatar: Nullable<string>;
  isSelf: boolean;
  
  // 状态
  loading: boolean;
  error: Nullable<string>;
  
  // 操作
  createSpace: (spaceName?: string) => Promise<Response>;
  updateUserInfo: (updates: Partial<UserInfo>) => Promise<boolean>;
  
  // 原始数据（用于调试或特殊用途）
  viewingUserInfo: Nullable<UserInfo>;
  
  // 兼容旧版本
  client: ReturnType<typeof createClient>;
  getUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

/**
 * Enhanced user hook that handles both authenticated users and viewing other users
 * 
 * @param options - Configuration options
 * @param options.userId - Optional user ID to view, if not provided uses current auth user
 * 
 * @example
 * // View current authenticated user
 * const { user, userInfo, username, avatar, isSelf } = useUser();
 * 
 * @example
 * // View another user
 * const { userInfo, username, avatar, isSelf } = useUser({ userId: 'other-user-id' });
 */
export function useUser(options: UseUserOptions = {}): UseUserResult {
  const [authUser, setAuthUser] = useState<Nullable<User>>(null);
  const [authUserInfo, setAuthUserInfo] = useState<Nullable<UserInfo>>(null);
  const [viewingUserInfo, setViewingUserInfo] = useState<Nullable<UserInfo>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Nullable<string>>(null);

  const { userId } = options;
  const client = createClient();

  // 当前正在查看的用户信息（可能是自己也可能是别人）
  const userInfo = userId ? viewingUserInfo : authUserInfo;
  
  // 判断是否在查看自己的信息
  const isSelf = !userId || (authUser !== null && userId === authUser.id);

  // 计算用户名（优先级：nickname > email > "Unknown User"）
  const username = useMemo(() => {
    if (userInfo?.nickname) return userInfo.nickname;
    if (isSelf && authUser?.email) return authUser.email;
    return "Unknown User";
  }, [userInfo?.nickname, isSelf, authUser?.email]);

  // 计算头像URL
  const avatar = useMemo(() => {
    if (userInfo?.avatar) return userInfo.avatar;
    if (isSelf && authUser?.user_metadata?.avatar_url) return authUser.user_metadata.avatar_url;
    return null;
  }, [userInfo?.avatar, isSelf, authUser?.user_metadata?.avatar_url]);

  // 获取认证用户信息
  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const {
          data: { user },
        } = await client.auth.getUser();
        setAuthUser(user);

        if (user) {
          const userInfo = await dbApi.userInfo.get(client, user.id);
          setAuthUserInfo(userInfo);
        }
        
        // 只有在没有指定 userId 或者 userId 就是当前用户时才设置 loading 为 false
        if (!userId || (user && userId === user.id)) {
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch user data");
        console.error(err);
        setLoading(false);
      }
    };

    getAuthUser();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setAuthUser(session.user);
        try {
          const userInfo = await dbApi.userInfo.get(client, session.user.id);
          setAuthUserInfo(userInfo);
        } catch (err) {
          setError("Failed to fetch user info");
          console.error(err);
        }
      } else if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setAuthUserInfo(null);
      }
      
      // 只有在没有指定 userId 时才更新 loading 状态
      if (!userId) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [client, userId]);

  // 获取指定用户的信息（如果提供了 userId）
  useEffect(() => {
    if (!userId) {
      setViewingUserInfo(null);
      return;
    }

    // 如果 userId 是当前认证用户，则直接使用 authUserInfo
    if (authUser && userId === authUser.id) {
      setViewingUserInfo(authUserInfo);
      setLoading(false);
      return;
    }

    const getViewingUserInfo = async () => {
      try {
        setLoading(true);
        const userInfo = await dbApi.userInfo.get(client, userId);
        setViewingUserInfo(userInfo);
      } catch (err) {
        setError("Failed to fetch user info");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getViewingUserInfo();
  }, [userId, authUser, authUserInfo, client]);

  // 创建空间（只有认证用户才能创建）
  const createSpace = async (spaceName?: string) => {
    if (!authUser || !authUserInfo) {
      throw new Error("User not authenticated");
    }

    const displayName = authUserInfo.nickname || authUser.email || "Unknown User";
    
    try {
      const response = await vocespace.createSpace(authUser.id, displayName, spaceName);
      
      if (!response.ok) {
        throw new Error("Failed to create space");
      }
      
      return response;
    } catch (error) {
      console.error("Error creating space:", error);
      throw error;
    }
  };

  // 更新用户信息（只能更新自己的信息）
  const updateUserInfo = async (updates: Partial<UserInfo>) => {
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    try {
      await dbApi.userInfo.update(client, authUser.id, updates);
      
      // 更新本地状态
      setAuthUserInfo(prev => prev ? { ...prev, ...updates } : null);
      
      // 如果当前查看的是自己的信息，也要更新
      if (isSelf) {
        setViewingUserInfo(prev => prev ? { ...prev, ...updates } : null);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating user info:", error);
      throw error;
    }
  };

  // 获取用户信息（兼容旧版本）
  const getUser = async () => {
    if (userId) {
      // 如果指定了 userId，获取指定用户的信息
      try {
        setLoading(true);
        const userInfo = await dbApi.userInfo.get(client, userId);
        setViewingUserInfo(userInfo);
      } catch (err) {
        setError("Failed to fetch user info");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      // 否则获取当前认证用户信息
      try {
        setLoading(true);
        const {
          data: { user },
        } = await client.auth.getUser();
        setAuthUser(user);

        if (user) {
          const userInfo = await dbApi.userInfo.get(client, user.id);
          setAuthUserInfo(userInfo);
        }
      } catch (err) {
        setError("Failed to fetch user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    // 认证相关
    authUser,
    authUserInfo,
    isAuthenticated: !!authUser,
    
    // 当前查看的用户相关
    user: authUser, // 保持向后兼容
    userInfo,
    username,
    avatar,
    isSelf,
    
    // 状态
    loading,
    error,
    
    // 操作
    createSpace,
    updateUserInfo,
    
    // 原始数据（用于调试或特殊用途）
    viewingUserInfo,
    
    // 兼容旧版本
    client,
    getUser,
    setLoading,
  };
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

export const whereUserFrom = (user: Nullable<User>): "vocespace" | "google" => {
  if (!user) return "vocespace";
  return user.app_metadata?.provider === "google" ? "google" : "vocespace";
};
