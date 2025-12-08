"use client";

import { useI18n } from "@/lib/i18n/i18n";
import { Nullable } from "@/lib/std";
import { Extraction } from "@/lib/std/space";
import { UserInfo } from "@/lib/std/user";
import styles from "@/styles/user_settings.module.scss";
import { UserOutlined } from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import {
  Avatar,
  Button,
  Checkbox,
  CheckboxOptionType,
  Col,
  InputNumber,
  InputNumberProps,
  Radio,
  Row,
  Slider,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useMemo, useState } from "react";

export interface UserSettingsProps {
  messageApi: MessageInstance;
  userInfo: UserInfo;
  avatar: string | null;
  user: User;
  setPageType: (type: "settings" | "profile") => void;
  deleteAccount: () => Promise<void>;
  updateUserInfo: (updates: Partial<UserInfo>) => Promise<boolean>;
}

export function UserSettings({
  messageApi,
  userInfo,
  avatar,
  user,
  setPageType,
  deleteAccount,
  updateUserInfo,
}: UserSettingsProps) {
  const { t } = useI18n();
  const [volume, setVolume] = useState(userInfo.settings?.volume || 100);
  const [blur, setBlur] = useState<number>(userInfo.settings?.blur || 0.0);
  const [openShareAudio, setOpenShareAudio] = useState<boolean>(
    userInfo.settings?.openShareAudio || true
  );
  const [openPromptSound, setOpenPromptSound] = useState<boolean>(
    userInfo.settings?.openPromptSound || true
  );
  const [screenBlur, setScreenBlur] = useState<number>(
    userInfo.settings?.screenBlur || 0.0
  );
  const [aiChoose, setAiChoose] = useState<string[]>(() => {
    let { spent, todo } = userInfo.settings?.ai.cut || {
      spent: false,
      todo: true,
    };
    const choices: string[] = [];
    if (spent) choices.push("spent");
    if (todo) choices.push("todo");
    return choices;
  });
  const [aiExtraction, setAiExtraction] = useState<Extraction>("medium");
  const aiChooseOptions: CheckboxOptionType<string>[] = [
    { label: t("user.setting.general.ai.spent"), value: "spent" },
    { label: t("user.setting.general.ai.todo"), value: "todo" },
  ];

  const isChanged = useMemo(() => {
    if (!userInfo.settings) return true;
    if (userInfo.settings.volume !== volume) return true;
    if (userInfo.settings.blur !== blur) return true;
    if (userInfo.settings.screenBlur !== screenBlur) return true;
    const aiConf = userInfo.settings.ai.cut;
    const spent = aiChoose.includes("spent");
    const todo = aiChoose.includes("todo");
    if (aiConf.spent !== spent) return true;
    if (aiConf.todo !== todo) return true;
    if (aiExtraction !== aiConf.extraction) return true;
    if (userInfo.settings.openShareAudio !== openShareAudio) return true;
    if (userInfo.settings.openPromptSound !== openPromptSound) return true;
    return false;
  }, [
    userInfo.settings,
    volume,
    blur,
    screenBlur,
    aiChoose,
    aiExtraction,
    openShareAudio,
    openPromptSound,
  ]);

  const saveSettings = async () => {
    const success= await updateUserInfo({
      settings: {
        volume,
        blur,
        screenBlur,
        openShareAudio,
        openPromptSound,
        ai: {
          cut: {
            spent: aiChoose.includes("spent"),
            todo: aiChoose.includes("todo"),
            extraction: aiExtraction,
          },
        },
      },
    });

    if (success) {
      messageApi.success(t("user.setting.general.success.save"));
    }else{
      messageApi.error(t("user.setting.general.error.save"));
    }
  };

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
        <div className={styles.items_general}>
          <div className={styles.items_general_title}>
            {t("user.setting.general.title")}
          </div>
          <div className={styles.items_general_item}>
            <div>{t("user.setting.general.volume")}</div>
            <div>
              <Row>
                <Col span={12}>
                  <Slider
                    min={0}
                    max={100}
                    onChange={(newValue) => setVolume(newValue as number)}
                    value={typeof volume === "number" ? volume : 0}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ margin: "0 16px" }}
                    value={volume}
                    onChange={(newValue) => setVolume(newValue as number)}
                  />
                </Col>
              </Row>
            </div>
          </div>
          <div className={styles.items_general_item}>
            <div>{t("user.setting.general.blur")}</div>
            <div>
              <Row>
                <Col span={12}>
                  <Slider
                    min={0.0}
                    step={0.05}
                    max={1.0}
                    onChange={(newValue) => setBlur(newValue as number)}
                    value={typeof blur === "number" ? blur : 0}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={0.0}
                    step={0.05}
                    max={1.0}
                    style={{ margin: "0 16px" }}
                    value={blur}
                    onChange={(newValue) => setBlur(newValue as number)}
                  />
                </Col>
              </Row>
            </div>
          </div>
          <div className={styles.items_general_item}>
            <div>{t("user.setting.general.screenBlur")}</div>
            <div>
              <Row>
                <Col span={12}>
                  <Slider
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    onChange={(newValue) => setScreenBlur(newValue as number)}
                    value={typeof screenBlur === "number" ? screenBlur : 0}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={0.0}
                    step={0.05}
                    max={1.0}
                    style={{ margin: "0 16px" }}
                    value={screenBlur}
                    onChange={(newValue) => setScreenBlur(newValue as number)}
                  />
                </Col>
              </Row>
            </div>
          </div>
          <div className={styles.items_general_item}>
            <div>{t("user.setting.general.openShareAudio")}</div>
            <div style={{ width: 500, marginTop: 8 }}>
              <Radio.Group
                size="large"
                block
                value={openShareAudio}
                onChange={(e) => setOpenShareAudio(e.target.value)}
              >
                <Radio.Button value={true}>
                  {t("user.setting.general.open")}
                </Radio.Button>
                <Radio.Button value={false}>
                  {t("user.setting.general.close")}
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>
          <div className={styles.items_general_item}>
            <div>{t("user.setting.general.openPromptSound")}</div>
            <div style={{ width: 500, marginTop: 8 }}>
              <Radio.Group
                size="large"
                block
                value={openPromptSound}
                onChange={(e) => setOpenPromptSound(e.target.value)}
              >
                <Radio.Button value={true}>
                  {t("user.setting.general.open")}
                </Radio.Button>
                <Radio.Button value={false}>
                  {t("user.setting.general.close")}
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </div>
        <div className={styles.items_general}>
          <div className={styles.items_general_title}>
            {t("user.setting.general.ai.title")}
          </div>
          <div className={styles.items_general_item}>
            <div>{t("user.setting.general.ai.source")}</div>
            <div style={{ width: 500, marginTop: 8 }}>
              <Checkbox.Group
                options={aiChooseOptions}
                value={aiChoose}
                onChange={(e) => {
                  setAiChoose(e as string[]);
                }}
              ></Checkbox.Group>
            </div>
          </div>

          <div className={styles.items_general_item}>
            <div>{t("user.setting.general.ai.extraction")}</div>
            <div style={{ width: 500, marginTop: 8 }}>
              <Radio.Group
                size="large"
                block
                value={aiExtraction}
                onChange={(e) => setAiExtraction(e.target.value)}
              >
                <Radio.Button value={"easy"}>
                  {t("user.setting.general.ai.easy")}
                </Radio.Button>
                <Radio.Button value={"medium"}>
                  {t("user.setting.general.ai.mid")}
                </Radio.Button>
                <Radio.Button value={"max"}>
                  {t("user.setting.general.ai.max")}
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>

          <div className={styles.items_general_item}>
            {isChanged && (
              <Button
                type="primary"
                style={{ width: 500 }}
                size="large"
                onClick={saveSettings}
              >
                {t("user.setting.general.save")}
              </Button>
            )}
          </div>
        </div>

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
