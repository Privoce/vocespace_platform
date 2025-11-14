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
} from "@ant-design/icons";
import { Button, Divider, Input, message } from "antd";
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
     */
    from?: "vocespace" | "unknown" | "init";
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
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
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
      from: from as "vocespace" | "unknown" | undefined,
      spaceName: spaceName || "",
      auth: auth as "google" | "email" | undefined,
      redirectTo: redirectTo || undefined,
    };
  }, [urlSearchParams, searchParams]);

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
        messageApi.success(t("login.signupSuccess"));
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

    if (params && params?.from === "vocespace") {
      // get userInfo, if userInfo has nickname, do jump to vocespace meeting page or to drive page
      const userInfo: UserInfo = await dbApi.userInfo.get(client, data.user.id);
      if (userInfo && userInfo.nickname) {
        redirectTo = vocespaceUrl(
          data.user.id,
          userInfo.nickname,
          "vocespace",
          params.spaceName
        );
      } else {
        // add params to redirectTo
        redirectTo += `?spaceName=${params.spaceName}`;
      }
    }
    router.push(redirectTo);
  };

  /**
   * login with google oauth when clicked continue with google button
   */
  const signInWithGoogle = async (directly = false) => {
    try {
      setLoading(true);
      // if is directly, means with search params from vocespace
      // just like email login, let it to auth/callback with all params
      let redirectTo = `${window.location.origin}/auth/callback`;
      if (directly) {
        const params = getParams();
        if (params.spaceName) {
          redirectTo += `?spaceName=${params.spaceName}`;
        }
      }

      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
    } catch (e) {
      messageApi.error(
        e instanceof Error ? e.message : t("login.googleSignInFail")
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = getParams();

    if (params && params.from === "vocespace" && params.auth === "google") {
      // directly use google oauth
      signInWithGoogle(true);
    }
  }, [urlSearchParams, searchParams, getParams]);

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
              <div className={styles.login_form_input_title}>邮箱</div>
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
                <a href="/auth/forget-password" style={{ color: "#22ccee" }}>
                  {t("login.forgetPwd")}
                </a>
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
              {t("login.noAccount")}
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
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}