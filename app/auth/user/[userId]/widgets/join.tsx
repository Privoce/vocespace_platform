import { VocespaceLogo } from "@/components/widget/logo";
import { useI18n } from "@/lib/i18n/i18n";
import { UserAddOutlined } from "@ant-design/icons";
import { Button, Modal, Tooltip } from "antd";
import { useMemo, useState } from "react";

interface UseJoinUsBtnProps {
  username?: string;
}

export const useJoinUsBtn = ({ username }: UseJoinUsBtnProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  /**
   * join us button, after click open Join Us Modal
   */
  const JoinUsBtn = useMemo(() => {
    return (
      <Tooltip title={t("user.profile.joinUs.title")} trigger={"hover"}>
        <Button
          shape="circle"
          icon={<VocespaceLogo></VocespaceLogo>}
          onClick={() => setOpen(true)}
        ></Button>
      </Tooltip>
    );
  }, [t]);

  const JoinUsModal = useMemo(() => {
    return <Modal open={open} onCancel={() => setOpen(false)}>
        ceshi
    </Modal>;
  }, [open]);

  const JoinUserBtn = useMemo(() => {
    return (
      <Button
        shape="round"
        size="large"
        type="primary"
        onClick={() => setOpen(true)}
      >
        {`${t("user.profile.joinUs.user")}${username?.substring(0, 16)}`}
      </Button>
    );
  }, [t, username]);

  return {
    JoinUsBtn,
    JoinUsModal,
    JoinUserBtn,
    joinUsModalOpen: open,
    setJoinUsModalOpen: setOpen,
  };
};
