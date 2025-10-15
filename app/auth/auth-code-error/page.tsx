"use client";

import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function AuthCodeError() {
  const router = useRouter();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Result
        status="error"
        title="登录失败"
        subTitle="Google 登录过程中出现错误，请重试。"
        extra={[
          <Button type="primary" key="retry" onClick={() => router.push('/auth/login')}>
            重新登录
          </Button>,
          <Button key="home" onClick={() => router.push('/')}>
            返回首页
          </Button>,
        ]}
      />
    </div>
  );
}