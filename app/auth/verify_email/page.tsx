"use client";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  return (
    <div>
      <Result
        status="success"
        title="Email Verified Successfully!"
        subTitle="You can now log in with your account."
        extra={[
          <Button
            color="green"
            variant="solid"
            onClick={() => router.push("/auth/login")}
          >
            Sign in
          </Button>,
        ]}
      />
    </div>
  );
}
