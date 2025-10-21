"use client";

import { UserInfo } from "@/lib/std/user";
import { dbApi } from "@/lib/api/db";
import { Input, Button, Typography, Avatar } from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  EditOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import styles from "@/styles/user_settings.module.scss";
import { UserPageUniProps } from "./page";
import { whereUserFrom } from "@/hooks/useUser";
import { useI18n } from "@/lib/i18n/i18n";
const { Title, Text } = Typography;
const { TextArea } = Input;

interface UserSettingsProps extends UserPageUniProps {}

export default function UserSettings({
  userId,
  username,
  user,
  userInfo,
  loading,
  setLoading,
  messageApi,
  setPage,
  client,
}: UserSettingsProps) {
  const { t } = useI18n();
  const [nickname, setNickname] = useState(userInfo?.nickname || "");
  const [desc, setDesc] = useState(userInfo?.desc || "");
  const [location, setLocation] = useState(userInfo?.location || "");
  const [linkedin, setLinkedin] = useState(userInfo?.linkedin || "");
  const [github, setGithub] = useState(userInfo?.github || "");
  const [twitter, setTwitter] = useState(userInfo?.twitter || "");

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const updateUserInfo: Partial<UserInfo> = {
        nickname,
        desc,
        location,
        linkedin,
        github,
        twitter,
      };
      const success = await dbApi.userInfo.update(
        client,
        userId,
        updateUserInfo
      );
      if (success) {
        messageApi.success(t("user.setting.saveSuccess"));
      }
    } catch (error) {
      messageApi.error(t("user.setting.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    messageApi.info("头像更改功能正在开发中，敬请期待！");
  };

  if (!userInfo || !user) {
    return (
      <div className={styles.settings}>
        <Text>loading...</Text>
      </div>
    );
  }

  return (
    <div className={styles.settings}>
      <div className={styles.settings_header}>
        <Title level={4}>
          <LeftOutlined
            style={{ marginRight: 8, cursor: "pointer" }}
            onClick={() => {
              setPage("profile");
            }}
          ></LeftOutlined>
          {t("user.setting.title")}
        </Title>
      </div>
      <div className={styles.settings_form}>
        <div className={styles.settings_form_row}>
          <div className={styles.inline}>{t("user.setting.username")}:</div>
          <Input
            placeholder={t("user.setting.placeholder.username")}
            size="large"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
            }}
          />
        </div>
        <div className={styles.settings_form_row}>
          <div className={styles.inline}>{t("user.setting.desc")}:</div>
          <TextArea
            placeholder={t("user.setting.placeholder.desc")}
            showCount
            maxLength={60}
            rows={4}
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
            }}
            style={{ resize: "none" }}
          />
        </div>
        <div className={styles.settings_form_row}>
          <div className={styles.inline}>{t("user.setting.location")}:</div>
          <Input
            placeholder={t("user.setting.placeholder.location")}
            prefix={<EnvironmentOutlined />}
            size="large"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
            }}
          />
        </div>
        <div className={styles.settings_form_row}>
          <div className={styles.inline}>{t("user.setting.linkedin")}:</div>
          <Input
            placeholder={t("user.setting.placeholder.linkedin")}
            prefix={<LinkedinOutlined />}
            size="large"
            value={linkedin}
            onChange={(e) => {
              setLinkedin(e.target.value);
            }}
          />
        </div>
        <div className={styles.settings_form_row}>
          <div className={styles.inline}>{t("user.setting.github")}:</div>
          <Input
            placeholder={t("user.setting.placeholder.github")}
            prefix={<GithubOutlined />}
            size="large"
            value={github}
            onChange={(e) => {
              setGithub(e.target.value);
            }}
          />
        </div>
        <div className={styles.settings_form_row}>
          <div className={styles.inline}>{t("user.setting.twitter")}:</div>
          <Input
            placeholder={t("user.setting.placeholder.twitter")}
            prefix={<TwitterOutlined />}
            size="large"
            value={twitter}
            onChange={(e) => {
              setTwitter(e.target.value);
            }}
          />
        </div>
        <div
          className={styles.settings_form_row}
          style={{ justifyContent: "flex-end" }}
        >
          <Button
            size="large"
            style={{ width: 220 }}
            type="primary"
            loading={loading}
            onClick={handleSave}
          >
            {t("user.setting.save")}
          </Button>
        </div>
      </div>
      <div className={styles.settings_avatar}>
        <Avatar
          size={120}
          className={styles.avatar}
          src={
            whereUserFrom(user) === "google"
              ? user.user_metadata?.picture
              : undefined
          }
          style={{
            fontSize: 48,
            backgroundColor: "#22CCEE",
            border: "none",
          }}
        >
          {username.charAt(0).toUpperCase() || <UserOutlined />}
        </Avatar>
        <div>{username}</div>
        <Button
          icon={<EditOutlined />}
          type="default"
          onClick={handleEditProfile}
        >
          {t("user.setting.editAvatar")}
        </Button>
      </div>
    </div>
  );
}
