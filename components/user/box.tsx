import { UserOutlined } from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import { Avatar, Button, Dropdown, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useUser";

export interface UserBoxProps {
  user: User | null;
  loading?: boolean;
}

/**
 * UserBox component
 * always use in header to show user is login or not
 * if login, show user avatar and dropdown menu
 * if not login, show login button
 */
export function UserBox({ user, loading = false }: UserBoxProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const toLogin = () => {
    router.push("/auth/login");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      messageApi.success("退出登录成功");
      router.push("/");
    } catch (error) {
      messageApi.error("退出登录失败");
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <Spin size="default" />
      </div>
    );
  }

  return (
    <div>
      {contextHolder}
      {user ? (
        <Dropdown
          placement="bottomRight"
          menu={{
            items: [
              {
                key: "profile",
                label: "个人资料",
                onClick: () => router.push(`/auth/user/${user.id}`),
              },
              {
                key: "logout",
                label: "退出登录",
                onClick: handleLogout,
              },
            ],
          }}
        >
          <Avatar
            size={"large"}
            style={{ backgroundColor: "#22CCEE", cursor: "pointer" }}
          >
            {user.email?.charAt(0).toUpperCase() || <UserOutlined />}
          </Avatar>
        </Dropdown>
      ) : (
        <Button
          type="primary"
          size="large"
          onClick={toLogin}
          icon={<UserOutlined></UserOutlined>}
        >
          登陆
        </Button>
      )}
    </div>
  );
}
