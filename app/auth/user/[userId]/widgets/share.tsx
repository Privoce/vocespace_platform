import { useI18n } from "@/lib/i18n/i18n";
import { UserInfo } from "@/lib/std/user";
import {
  UploadOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input, Modal, Tooltip } from "antd";
import { useMemo, useState } from "react";
import styles from "@/styles/user_profile.module.scss";
import { vocespaceUrlVisit } from "@/lib/std/space";

interface UseShareBtnProps {
  userInfo: UserInfo;
}

export const useShareBtn = ({ userInfo }: UseShareBtnProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  /**
   * join us button, after click open Join Us Modal
   */
  const ShareBtn = useMemo(() => {
    return (
      <Tooltip title={t("share.title")}>
        <Button
          shape="circle"
          icon={<UploadOutlined />}
          onClick={() => setOpen(true)}
        ></Button>
      </Tooltip>
    );
  }, [t]);

  const ShareModal = useMemo(() => {
    return (
      <Modal
        title={t("share.title")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={600}
      >
        <div className={styles.share}>
          <Avatar
            size={88}
            // className={styles.avatar}
            src={userInfo.avatar}
            style={{
              fontSize: 52,
              backgroundColor: userInfo.avatar ? "transparent" : "#22CCEE",
              border: "none",
            }}
          >
            {userInfo.nickname.charAt(0).toUpperCase() || <UserOutlined />}
          </Avatar>
          <div className={styles.share_username}>{userInfo.nickname}</div>
          <div className={styles.share_url}>
            {vocespaceUrlVisit(userInfo.nickname)}
          </div>
        </div>
        <Button
          size="large"
          type="primary"
          block
          onClick={() => {
            navigator.clipboard.writeText(vocespaceUrlVisit(userInfo.nickname));
          }}
        >
          {t("share.copy")}
        </Button>
      </Modal>
    );
  }, [open, userInfo]);

  return {
    ShareBtn,
    ShareModal,
    ShareModalOpen: open,
    setShareModalOpen: setOpen,
  };
};
