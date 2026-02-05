"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input, Button, message } from "antd";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18n";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [msgApi, contextHolder] = message.useMessage();
  const { t } = useI18n();

  const code = searchParams?.get("code") || "";
  const accessToken = searchParams?.get("access_token") || "";
  const error = searchParams?.get("error") || "";
  const errorCode = searchParams?.get("error_code") || "";
  const errorDescription = searchParams?.get("error_description") || "";
  const [hasSessionFromUrl, setHasSessionFromUrl] = useState(false);

  useEffect(() => {
    // 显示URL中的错误信息
    if (error) {
      if (errorCode === "otp_expired") {
        msgApi.error(t("reset.new.expiredMessage"));
      } else {
        msgApi.error(errorDescription || error);
      }
    }
  }, [error, errorCode, errorDescription, msgApi, t]);

  useEffect(() => {
    (async () => {
      // If Supabase injected tokens into the URL (recovery flow), try to let the client parse them
      const client = createClient();
      try {
        // 检查当前是否有session
        const { data: sessionData } = await client.auth.getSession();
        if (sessionData?.session) {
          setHasSessionFromUrl(true);
          return;
        }

        // Some Supabase clients provide getSessionFromUrl
        // @ts-ignore
        const maybe = client.auth.getSessionFromUrl?.();
        if (maybe) {
          const { data, error } = await maybe;
          if (!error && data?.session) {
            setHasSessionFromUrl(true);
          }
        } else if (accessToken) {
          // fallback: if there is an access_token present assume session available
          setHasSessionFromUrl(true);
        }
      } catch (e) {
        // ignore parsing errors
      }
    })();
  }, [accessToken]);

  const submitNewPassword = async () => {
    if (!password) {
      msgApi.error(t("reset.new.enterNewPassword"));
      return;
    }
    if (password !== confirm) {
      msgApi.error(t("reset.new.passwordNotMatch"));
      return;
    }

    setLoading(true);
    try {
      const client = createClient();
      
      // 直接使用客户端SDK更新密码
      // Supabase会自动从URL解析token或使用当前session
      const { error } = await client.auth.updateUser({ password });
      
      if (error) throw error;
      
      msgApi.success(t("reset.new.resetSuccess"));
      router.replace("/auth/login");
    } catch (err: any) {
      msgApi.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const sendResetEmail = async () => {
    const to = email.trim();
      if (!to) {
      msgApi.error(t("reset.new.enterEmailAddress"));
      return;
    }
    setLoading(true);
    try {
      const client = createClient();
      const { error } = await client.auth.resetPasswordForEmail(to, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;

      msgApi.success(t("reset.new.resetEmailSent"));
    } catch (err: any) {
      msgApi.error(err?.message || t("reset.new.sendResetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 20 }}>
      {contextHolder}
      <h2>{t("reset.new.title")}</h2>
      {(code || accessToken) ? (
        <div>
          <p>{t("reset.new.detected")}</p>
          <div style={{ marginBottom: 12 }}>
            <Input.Password
              placeholder={t("reset.new.newPasswordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Input.Password
              placeholder={t("reset.new.confirmPasswordPlaceholder")}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="primary" onClick={submitNewPassword} loading={loading}>
            {t("reset.new.submit")}
          </Button>
        </div>
      ) : (
        <div>
          <p>{t("reset.new.enterEmailPrompt")}</p>
          <div style={{ marginBottom: 12 }}>
            <Input
              value={email}
              placeholder={t("reset.new.emailPlaceholder")}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="primary" onClick={sendResetEmail} loading={loading}>
            {t("reset.new.sendResetEmail")}
          </Button>
        </div>
      )}
    </div>
  );
}
