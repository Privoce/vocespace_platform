import { useI18n } from "@/lib/i18n/i18n";
import { UploadOutlined, UserAddOutlined } from "@ant-design/icons";
import { Button, Modal, Tooltip } from "antd";
import { useMemo, useState } from "react";

interface UseShareBtnProps {
  username: string;
}

export const useShareBtn = ({ username }: UseShareBtnProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  /**
   * join us button, after click open Join Us Modal
   */
  const ShareBtn = useMemo(() => {
    return (
      <Tooltip title={t("user.profile.Share.title")}>
        <Button
          shape="circle"
          icon={<UploadOutlined />}
          onClick={() => setOpen(true)}
        ></Button>
      </Tooltip>
    );
  }, [t]);

  const ShareModal = useMemo(() => {
    return <Modal></Modal>;
  }, []);

  return {
    ShareBtn,
    ShareModal,
    ShareModalOpen: open,
    setShareModalOpen: setOpen,
  };
};
