"use client";
import { Button, Result } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignIn = () => {
    // 保留所有 URL 参数并传递给登录页面
    const params = new URLSearchParams();
    // 先尝试从 useSearchParams() 读取（如果当前 URL 使用 ?query=...）
    searchParams?.forEach((value, key) => {
      params.set(key, value);
    });

    // 如果没有 query，但我们可能把参数放在 hash (#) 中（signup 时会使用 hash 保存），则解析 hash
    if (!params.toString() && typeof window !== "undefined" && window.location.hash) {
      const raw = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      try {
        const fromHash = new URLSearchParams(raw);
        fromHash.forEach((value, key) => params.set(key, value));
      } catch (e) {
        // ignore parse errors
      }
    }

    const queryString = params.toString();
    const loginUrl = queryString
      ? `/auth/login?${queryString}`
      : "/auth/login";

    router.push(loginUrl);
  };

  return (
    <div>
      <Result
        status="success"
        title="Email Verified Successfully!"
        subTitle="You can now log in with your account."
        extra={[
          <Button
            key="signin"
            color="green"
            variant="solid"
            onClick={handleSignIn}
          >
            Sign in
          </Button>,
        ]}
      />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
