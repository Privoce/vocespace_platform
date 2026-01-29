"use client";
import { LangSelect } from "@/components/widget/lang";
import { dbApi } from "@/lib/api/db";
import { useI18n } from "@/lib/i18n/i18n";
import { isMobile } from "@/lib/std";
import { vocespaceUrl } from "@/lib/std/space";
import { UserInfo } from "@/lib/std/user";
import { createClient } from "@/lib/supabase/client";
import styles from "@/styles/login.module.scss";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  GoogleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Divider, Input, message, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";

export interface LoginPageProps {
  /**
   * search params from url
   * - `https://home.vocespace.com/auth/login?from=vocespace&redirectTo=...&auth=google&spaceName=xxx`
   */
  searchParams?: {
    /**
     * from where the user come
     * - vocespace: from vocespace meeting page (which need to get user login params and back to meeting with user info)
     * - unknown: unknown source (for future other platform need vocespace platform user login)
     * - init: from vocespace.com initial page, act as "vocespace", after register/login, redirect to vocespace meeting page (self)
     */
    from?: "vocespace" | "unknown" | "space";
    /**
     * redirect to which page after login success, if from is `vocespace` (this is not needed), it should container params see [`vocespaceUrl()`](../../../lib/std/space.ts)
     */
    redirectTo?: string;
    /**
     * authentication method, could be `google` or `email` or undefined (default)
     * - google: use google oauth
     * - email: use email (vocespace default auth method)
     */
    auth?: "google" | "email";
    /**
     * vocespace space name, needed!
     * use to create / join space after login
     */
    spaceName: string;
  };
}

// 将主要的登录逻辑提取到单独的组件中
function LoginForm({ searchParams }: LoginPageProps) {
  const { t } = useI18n();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [screenLoading, setScreenLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [hasTriggeredOAuth, setHasTriggeredOAuth] = useState(false);
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const client = createClient();

  // 创建一个可靠的参数获取函数
  const getParams = useCallback(() => {
    const from =
      urlSearchParams?.get("from") ||
      searchParams?.from ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("from")
        : null);

    const spaceName =
      urlSearchParams?.get("spaceName") ||
      searchParams?.spaceName ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("spaceName")
        : null);

    const auth =
      urlSearchParams?.get("auth") ||
      searchParams?.auth ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("auth")
        : null);

    const redirectTo =
      urlSearchParams?.get("redirectTo") ||
      searchParams?.redirectTo ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirectTo")
        : null);

    return {
      from: from as "vocespace" | "unknown" | "space" | undefined,
      spaceName: spaceName || "",
      auth: auth as "google" | "email" | undefined,
      redirectTo: redirectTo || undefined,
    };
  }, [urlSearchParams, searchParams]);

  const signInOrUp = async () => {
    try {
      setLoading(true);

      if (isSignUp) {
        if (password !== confirmPassword) {
          setLoading(false);
          messageApi.error(
            t("login.passwordNotMatch") || "Passwords do not match",
          );
          return;
        }

        const searchParamsObj: Record<string, string> = {};
        if (searchParams) {
          Object.entries(searchParams as Record<string, string>).forEach(
            ([k, v]) => (searchParamsObj[k] = v),
          );
        } else if (urlSearchParams) {
          urlSearchParams.forEach((v, k) => (searchParamsObj[k] = v));
        }

        // 使用 hash (#) 承载查询参数作为兼容方案，避免 Supabase 在生成验证链接时丢弃 query string
        let emailRedirectTo = `${window.location.origin}/auth/verify_email`;

        const { error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
            // 将自定义参数放到 data（会存入 user_metadata）以便在验证页面通过 getUser 获取
            data:
              Object.keys(searchParamsObj).length > 0
                ? searchParamsObj
                : undefined,
          },
        });

        if (error && error.code !== "email_not_confirmed") {
          messageApi.error(error.message);
          throw error;
        }

        // 注册后尝试直接使用相同凭证登录；若因邮箱确认等原因失败，则提示注册成功并清理表单
        const { error: signinError } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (signinError) {
          messageApi.success(t("login.signupSuccess"));
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setIsSignUp(false);
        } else {
          await getUserAndRedirect();
        }
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
      messageApi.error(e instanceof Error ? e.message : t("login.signinFail"));
    } finally {
      setLoading(false);
    }
  };

  const getUserAndRedirect = async () => {
    const { data, error } = await client.auth.getUser();

    if (error) {
      messageApi.error(`${t("common.getUserInfoFail")}: ${error.message}`);
      return;
    }

    const params = getParams();
    let redirectTo = `/auth/user/${data.user.id}`;
    // get userInfo, if userInfo has username, do jump to vocespace meeting page or to drive page
    const userInfo = await dbApi.userInfo.getOrNull(client, data.user.id);
    if (params && (params.from === "vocespace" || params.from === "space")) {
      if (userInfo && userInfo.username) {
        redirectTo = await vocespaceUrl(
          userInfo,
          params.from,
          params.spaceName,
          params.redirectTo,
        );
      } else {
        // add params to redirectTo
        redirectTo += `?spaceName=${encodeURIComponent(
          params.spaceName,
        )}&from=${params.from}`;
      }
    }

    // 这里说明当前用户已经登录成功，进行跳转，但是在跳转之前我们需要尝试到数据库中获取更完整的用户信息
    // 如果有的话说明用户是已经完成用户身份登记的，需要把online状态更新为true，如果没有则会让profile页面
    // 去完成用户信息登记（这里直接跳转，不需要干预）
    if (userInfo) {
      const _ = await dbApi.userInfo.online(client, data.user.id);
    }

    router.push(redirectTo);
  };

  /**
   * login with google oauth when clicked continue with google button
   */
  const signInWithGoogle = async (
    directly = false,
    from: "vocespace" | "space" = "vocespace",
  ) => {
    try {
      setLoading(true);

      // 构建回调 URL
      const isLocalEnv =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost";
      const baseUrl = isLocalEnv
        ? window.location.origin
        : "https://home.vocespace.com";
      let redirectTo = `${baseUrl}/auth/callback`;

      // 如果是直接登录（从 vocespace 跳转过来），添加 spaceName 参数
      if (directly) {
        const params = getParams();
        if (params.spaceName) {
          redirectTo += `?spaceName=${encodeURIComponent(
            params.spaceName,
          )}&from=${from}`;
        }
        if (params.redirectTo) {
          redirectTo += `&redirectTo=${encodeURIComponent(params.redirectTo)}`;
        }
      }

      // console.log("Google OAuth redirectTo:", redirectTo);
      // 增加queryParams: { prompt: "select_account" }，确保每次都弹出账号选择
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo,
          skipBrowserRedirect: false,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (e) {
      messageApi.error(
        e instanceof Error ? e.message : t("login.googleSignInFail"),
      );
    } finally {
      // setScreenLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setScreenLoading(true);
    // 防止重复触发 OAuth 流程
    if (hasTriggeredOAuth) return;

    const params = getParams();

    if (
      params &&
      (params.from === "vocespace" || params.from === "space") &&
      params.auth === "google"
    ) {
      console.warn("Auto trigger Google OAuth login flow");

      // directly use google oauth
      setHasTriggeredOAuth(true);
      signInWithGoogle(true, params.from);
    } else {
      setScreenLoading(false);
    }

    return () => {
      setScreenLoading(false);
    };
  }, [urlSearchParams, searchParams]);

  if (screenLoading) {
    return (
      <Spin
        indicator={<LoadingOutlined spin />}
        size="large"
        tip="Loading..."
        fullscreen
      />
    );
  }

  return (
    <div className={styles.login}>
      {contextHolder}
      <div className={styles.login_lang}>
        <LangSelect></LangSelect>
      </div>
      <div className={styles.login_left}>
        <header className={styles.login_left_header}>
          <img
            src="/logo.svg"
            onClick={() => router.push("/")}
            style={{ cursor: "pointer" }}
          ></img>
        </header>
        <main className={styles.login_left_main}>
          <div className={styles.login_left_main_tt}>
            <div className={styles.login_left_main_tt_title}>
              {t("login.welcome")}
            </div>
            <div className={styles.login_left_main_tt_subtitle}>
              {t("login.continue")}
            </div>
          </div>
          <div className={styles.login_left_main_others}>
            <button
              onClick={() => signInWithGoogle(false)}
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
              <div className={styles.login_form_input_title}>Email</div>
              <Input
                value={email}
                size="large"
                placeholder={t("login.placeholder.email")}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.login_form_input}>
              <div className={styles.login_form_input_title}>
                <span>{t("login.password")}</span>
                {!isSignUp && (
                  <a href="/auth/forget-password" style={{ color: "#22ccee" }}>
                    {t("login.forgetPwd")}
                  </a>
                )}
              </div>

              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="large"
                placeholder={t("login.placeholder.pwd")}
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
              {isSignUp && (
                <div
                  className={styles.login_form_input}
                  style={{ marginTop: 20 }}
                >
                  <div className={styles.login_form_input_title}>
                    <span>{t("login.confirmPassword")}</span>
                  </div>

                  <Input.Password
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    size="large"
                    placeholder={
                      t("login.placeholder.confirmPwd") || "Confirm password"
                    }
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
              )}
            </div>

            <Button
              size="large"
              block
              type="primary"
              onClick={signInOrUp}
              loading={loading}
            >
              {isSignUp ? t("login.signup") : t("login.signin")}
            </Button>
          </div>
          {isSignUp ? (
            <div className={styles.login_left_main_signup}>
              {t("login.alreadyHaveAccount")}
              <a
                onClick={() => setIsSignUp(false)}
                style={{
                  color: "#22ccee",
                }}
              >
                {t("login.alreadyHaveAccount")}
              </a>
            </div>
          ) : (
            <div className={styles.login_left_main_signup}>
              {t("login.noAccount")}{" "}
              <a
                onClick={() => setIsSignUp(true)}
                style={{
                  color: "#22ccee",
                }}
              >
                {t("login.createAccount")}
              </a>
            </div>
          )}
        </main>
        <footer className={styles.login_left_footer}>
          {t("common.copyright")}
        </footer>
      </div>
      {!isMobile() && (
        <div className={styles.login_right}>
          <div className={styles.login_right_content}>
            <h2 className={styles.login_right_content_title}>
              {t("login.sideTitle")}
            </h2>
            <h3 className={styles.login_right_content_subtitle}>
              {t("login.sideSubtitle")}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}

// 主页面组件，包装 LoginForm 在 Suspense 中
export default function Page({ searchParams }: LoginPageProps) {
  return (
    <Suspense>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}
