"use client";

import { useI18n } from "@/lib/i18n/i18n";
import { Nullable } from "@/lib/std";
import { UserInfo } from "@/lib/std/user";
import styles from "@/styles/user_settings.module.scss";
import { UserOutlined } from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import { Avatar, Button } from "antd";
import { MessageInstance } from "antd/es/message/interface";

export interface UserSettingsProps {
  messageApi: MessageInstance;
  userInfo: UserInfo;
  avatar: string | null;
  user: User;
  setPageType: (type: "settings" | "profile") => void;
  deleteAccount: () => Promise<void>;
}

export function UserSettings({
  userInfo,
  avatar,
  user,
  setPageType,
  deleteAccount
}: UserSettingsProps) {
  const { t } = useI18n();

  return (
    <div className={styles.container}>
      <div className={styles.avatar_wrapper}>
        <div className={styles.avatar_wrapper_info}>
          <div>
            <Avatar
              size={48}
              className={styles.avatar}
              src={avatar}
              style={{
                fontSize: 18,
                backgroundColor: avatar ? "transparent" : "#22CCEE",
                border: "none",
              }}
            >
              {userInfo.username.charAt(0).toUpperCase() || <UserOutlined />}
            </Avatar>
          </div>
          <div className={styles.avatar_wrapper_name}>
            {userInfo.username || user.email}
          </div>
        </div>
        <Button
          type="primary"
          onClick={() => {
            setPageType("profile");
          }}
        >
          {t("user.setting.to_profile")}
        </Button>
      </div>
      <div className={styles.items}>
        <div className={styles.items_delete}>
          <div className={styles.items_delete_title}>
            {t("user.setting.account.delete")}
          </div>
          <div className={styles.items_delete_desc}>
            {t("user.setting.account.delete_confirm")}
          </div>
          <Button danger={true} onClick={deleteAccount}>
            {t("user.setting.account.delete_btn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
