"use client";
import { LoginForm } from "@/components/login-form";
import { dbApi } from "@/lib/api/db";
import { vocespaceUrl } from "@/lib/std/space";
import { UserInfo } from "@/lib/std/user";
import { createClient } from "@/lib/supabase/client";
import styles from "@/styles/login.module.scss";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface LoginPageProps {
  searchParams?: {
    /**
     * from where the user come
     * - vocespace: from vocespace meeting page (which need to get user login params and back to meeting with user info)
     * - unknown: unknown source (for future other platform need vocespace platform user login)
     */
    from?: "vocespace" | "unknown";
    /**
     * redirect to which page after login success, if from is `vocespace` (this is not needed), it should container params see [`vocespaceUrl()`](../../../lib/std/space.ts)
     */
    redirectTo?: string;
  };
}

export default function Page({searchParams}: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const client = createClient();
  const signInOrUp = async () => {
    try {
      setLoading(true);

      if (isSignUp) {
        const { error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify_email`,
          },
        });
        if (error) throw error;
        messageApi.success("注册成功，请检查邮箱进行验证");
        setEmail("");
        setPassword("");
        setIsSignUp(false);
      } else {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw error;
        }
        await getUserAndRedirect();
      }
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const getUserAndRedirect = async () => {
    const { data, error } = await client.auth.getUser();

    if (error) {
      messageApi.error(`获取用户信息失败: ${error.message}`);
      return;
    }

    if (searchParams && searchParams.from) {
      if (searchParams.from === "vocespace") {
        // get userInfo
        const userInfo: UserInfo = await dbApi.userInfo.get(
          client,
          data.user.id
        );
        // redirect to vocespace with params
        const redirectUrl = vocespaceUrl(data.user.id, userInfo?.nickname || data.user.email!, "vocespace");
        router.replace(redirectUrl);
        return;
      } else {
        // TODO: handle other from source
      }
    }

    router.push(`/auth/user/${data.user.id}`);
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // TODO, 携带参数判断从那个页面进去
        },
      });

      if (error) throw error;

      // OAuth 会自动重定向，不需要手动处理
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "Google登录失败");
      setLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      {contextHolder}
      <div className={styles.login_left}>
        <header className={styles.login_left_header}>
          <img src="/logo.svg"></img>
        </header>
        <main className={styles.login_left_main}>
          <div className={styles.login_left_main_tt}>
            <div className={styles.login_left_main_tt_title}>
              欢迎使用VoceSpace
            </div>
            <div className={styles.login_left_main_tt_subtitle}>
              请登录以继续
            </div>
          </div>
          <div className={styles.login_left_main_others}>
            <button
              onClick={signInWithGoogle}
              style={{
                backgroundColor: "#141414",
                width: "100%",
                height: "42px",
                padding: "8px 16px",
                borderRadius: 4,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              <img
                src="/google.svg"
                style={{
                  height: 20,
                  width: 20,
                  paddingBottom: 2,
                }}
              ></img>
              <span>Continue with Google</span>
            </button>
          </div>
          <Divider style={{ borderColor: "#4c4c4c", margin: 0 }}>or</Divider>
          <div className={styles.login_left_main_form}>
            <div className={styles.login_form_input}>
              <div className={styles.login_form_input_title}>邮箱</div>
              <Input
                value={email}
                size="large"
                placeholder="请输入邮箱"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.login_form_input}>
              <div className={styles.login_form_input_title}>
                <span>密码</span>
                <a href="/auth/forget-password" style={{ color: "#22ccee" }}>
                  忘记密码？
                </a>
              </div>

              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="large"
                placeholder="请输入密码"
                iconRender={(visible) =>
                  visible ? (
                    <EyeOutlined
                      style={{
                        color: "#22ccee",
                      }}
                    />
                  ) : (
                    <EyeInvisibleOutlined
                      style={{
                        color: "#22ccee",
                      }}
                    />
                  )
                }
              />
            </div>

            <Button
              size="large"
              block
              type="primary"
              onClick={signInOrUp}
              loading={loading}
            >
              {isSignUp ? "注册" : "登录"}
            </Button>
          </div>
          {isSignUp ? (
            <div className={styles.login_left_main_signup}>
              以经有账号了？
              <a
                onClick={() => setIsSignUp(false)}
                style={{
                  color: "#22ccee",
                }}
              >
                立即登录
              </a>
            </div>
          ) : (
            <div className={styles.login_left_main_signup}>
              还没有账号？
              <a
                onClick={() => setIsSignUp(true)}
                style={{
                  color: "#22ccee",
                }}
              >
                注册一个
              </a>
            </div>
          )}
        </main>
        <footer className={styles.login_left_footer}>
          © 2025 VoceSpace, Inc. 保留所有权利。
        </footer>
      </div>
      <div className={styles.login_right}>
        <div className={styles.login_right_content}>
          <h2 className={styles.login_right_content_title}>
            VoceSpace高清会议软件：4K分辨率，60帧，2M码率
          </h2>
          <h3 className={styles.login_right_content_subtitle}>
            体验水晶般清晰的视频会议，4K分辨率，60帧流畅表现，2M码率带来无与伦比的质量。完美适合专业演示和远程协作。
          </h3>
        </div>
      </div>
    </div>
  );
}
