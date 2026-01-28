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
    searchParams?.forEach((value, key) => {
      params.set(key, value);
    });

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
