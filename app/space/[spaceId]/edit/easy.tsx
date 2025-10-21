import { useI18n } from "@/lib/i18n/i18n";
import { initSpace, Space } from "@/lib/std/space";
import styles from "@/styles/space_pub.module.scss";
import { Input, Modal, Radio } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";

export interface PubSpaceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  messageApi: MessageInstance;
  onSave: (space: Space) => Promise<void>;
}

export function EasyPubSpaceModal({
  open,
  setOpen,
  messageApi,
  onSave,
}: PubSpaceModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [pub, setPub] = useState(true);

  const confirmCreateSpace = async () => {
    // valid
    if (!name.trim()) {
      messageApi.error(t("space.pub.validation.name"));
      return;
    }
    if (!url.trim()) {
      messageApi.error(t("space.pub.validation.url"));
      return;
    }
    const space = initSpace({
      name: name.trim(),
      desc: desc.trim(),
      url: url.trim(),
      public: pub,
    });

    if (!space) {
      messageApi.error(t("space.pub.validation.failed"));
      return;
    }

    // save space to user
    await onSave(space);
  };

  return (
    <Modal
      title={t("space.pub.title")}
      open={open}
      onCancel={() => setOpen(false)}
      okText={t("space.pub.ok")}
      cancelText={t("space.pub.cancel")}
      onOk={confirmCreateSpace}
    >
      <div className={styles.easy}>
        <div className={styles.easy_intro}>{t("space.pub.intro")}</div>
        <div className={styles.easy_form}>
          <div className={styles.easy_form_row}>
            <div className={styles.easy_form_label}>{t("space.pub.name")}:</div>
            <Input
              size="large"
              placeholder={t("space.pub.placeholder.name")}
              style={{ width: "100%" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.easy_form_row}>
            <div className={styles.easy_form_label}>{t("space.pub.url")}:</div>
            <Input
              size="large"
              placeholder={t("space.pub.placeholder.url")}
              style={{ width: "100%" }}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className={styles.easy_form_row}>
            <div className={styles.easy_form_label}>{t("space.pub.desc")}:</div>
            <Input.TextArea
              size="large"
              placeholder={t("space.pub.placeholder.desc")}
              style={{ width: "100%" }}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              maxLength={100}
              showCount
              styles={{
                count: {
                  color: "#8c8c8c",
                  fontSize: "12px",
                },
              }}
            />
          </div>
          <div className={styles.easy_form_row}>
            <div className={styles.easy_form_label}>
              {t("space.pub.public.title")}:
            </div>
            <Radio.Group
              defaultValue="public"
              size="large"
              block
              value={pub ? "public" : "private"}
              onChange={(e) => {
                setPub(e.target.value === "public");
              }}
            >
              <Radio.Button value="public">
                {t("space.pub.public.pub")}
              </Radio.Button>
              <Radio.Button value="private">
                {t("space.pub.public.private")}
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>
    </Modal>
  );
}
