"use client";

import { UserInfo } from "@/lib/std/user";
import { Input, Button, Avatar, Badge, List, Modal, Skeleton } from "antd";
import {
  UserOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  PlusCircleFilled,
  WechatOutlined,
} from "@ant-design/icons";
import { ChangeEvent, useMemo, useState, useEffect } from "react";
import styles from "@/styles/user_settings.module.scss";
import { UserPageUniProps } from "./page";
import { useI18n } from "@/lib/i18n/i18n";
import { EditAvatarBtn } from "./page";
import { EasyPubSpaceModal } from "@/app/space/[spaceId]/edit/easy";
import { Space } from "@/lib/std/space";
import { dbApi } from "@/lib/api/db";
import { SpaceCard } from "@/components/space/card";
const { TextArea } = Input;

interface UserSettingsProps extends UserPageUniProps {}
type Links = "github" | "linkedin" | "twitter" | "wx";

export default function UserSettings({
  userId,
  messageApi,
  client,
  flushUser,
  user,
  userInfo,
  spaces,
  avatar,
  isSelf,
  loading,
  updateUserInfo,
}: UserSettingsProps) {
  const { t } = useI18n();
  const [desc, setDesc] = useState(userInfo?.desc || "");
  const [linkedin, setLinkedin] = useState(userInfo?.linkedin || "");
  const [github, setGithub] = useState(userInfo?.github || "");
  const [twitter, setTwitter] = useState(userInfo?.twitter || "");
  const [wx, setWx] = useState(userInfo?.wx || "");
  const [descEditOpen, setDescEditOpen] = useState(false);
  const [linksEditOpen, setLinksEditOpen] = useState<boolean>(false);
  const [createSpaceOpen, setCreateSpaceOpen] = useState<boolean>(false);

  // 当 userInfo 更新时，同步更新本地状态
  useEffect(() => {
    if (userInfo) {
      setDesc(userInfo.desc || "");
      setLinkedin(userInfo.linkedin || "");
      setGithub(userInfo.github || "");
      setTwitter(userInfo.twitter || "");
      setWx(userInfo.wx || "");
    }
  }, [userInfo]);

  const links = useMemo(() => {
    return [
      {
        icon: <GithubOutlined style={{ fontSize: 20, cursor: "pointer" }} />,
        key: "github",
        placeholder: t("user.setting.placeholder.github"),
        value: github,
        onChange: (e: ChangeEvent<HTMLInputElement>) =>
          setGithub(e.target.value),
      },
      {
        icon: <LinkedinOutlined style={{ fontSize: 20, cursor: "pointer" }} />,
        key: "linkedin",
        placeholder: t("user.setting.placeholder.linkedin"),
        value: linkedin,
        onChange: (e: ChangeEvent<HTMLInputElement>) =>
          setLinkedin(e.target.value),
      },
      {
        icon: <WechatOutlined style={{ fontSize: 20, cursor: "pointer" }} />,
        key: "wx",
        placeholder: t("user.setting.placeholder.wx"),
        value: wx,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setWx(e.target.value),
      },
      {
        icon: <TwitterOutlined style={{ fontSize: 20, cursor: "pointer" }} />,
        key: "twitter",
        placeholder: t("user.setting.placeholder.twitter"),
        value: twitter,
        onChange: (e: ChangeEvent<HTMLInputElement>) =>
          setTwitter(e.target.value),
      },
    ];
  }, [userInfo, github, linkedin, twitter, wx, t]);

  const saveDesc = async () => {
    try {
      const updateData: Partial<UserInfo> = {
        desc,
      };

      await updateUserInfo(updateData);
      messageApi.success(t("user.setting.saveSuccess"));
      setDescEditOpen(false);
    } catch (error) {
      messageApi.error(t("user.setting.saveError"));
    }
  };

  const handleEditProfile = (ty: "desc" | Links) => {
    if (ty === "desc") {
      // 编辑个人简介
      setDescEditOpen(true);
    } else {
      // 编辑社交链接
      setLinksEditOpen(true);
    }
  };

  const saveLinks = async () => {
    try {
      const updateData: Partial<UserInfo> = {
        linkedin,
        github,
        twitter,
        wx,
      };

      await updateUserInfo(updateData);
      messageApi.success(t("user.setting.saveSuccess"));
      setLinksEditOpen(false);
    } catch (error) {
      messageApi.error(t("user.setting.saveError"));
    }
  };

  const createNewSpace = async (space: Space) => {
    try {
      await dbApi.space.insert(client, space);
      messageApi.success(t("space.pub.success"));
      setCreateSpaceOpen(false);
      flushUser();
    } catch (error) {
      messageApi.error(t("space.pub.fail"));
    }
  };

  if (!userInfo || loading) {
    return (
      <div className={styles.settings}>
        <div className={styles.settings_header}>
          <Skeleton avatar paragraph={{ rows: 3 }} active />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settings}>
      <div className={styles.settings_header}>
        <div className={styles.settings_avatar}>
          <EditAvatarBtn
            userId={userId}
            client={client}
            messageApi={messageApi}
            afterUpdate={flushUser}
          >
            <Avatar
              size={68}
              className={styles.avatar}
              src={avatar}
              style={{
                fontSize: 32,
                backgroundColor: avatar ? "transparent" : "#22CCEE",
                border: "none",
                cursor: "pointer",
              }}
            >
              {userInfo?.nickname.charAt(0).toUpperCase() || <UserOutlined />}
            </Avatar>
          </EditAvatarBtn>
        </div>
        <div className={styles.settings_userInfo}>
          <div className={styles.settings_userInfo_username}>
            {userInfo.nickname}
          </div>
          <div
            className={styles.settings_userInfo_desc}
            onClick={() => handleEditProfile("desc")}
          >
            {userInfo?.desc || t("user.profile.placeholder.desc")}
          </div>
          <div className={styles.settings_userInfo_links}>
            {links.map((link) => (
              <Badge
                count={<PlusCircleFilled></PlusCircleFilled>}
                key={link.key}
              >
                <div
                  onClick={() => handleEditProfile(link.key as Links)}
                  key={link.key}
                >
                  {link.icon}
                </div>
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <Button
        icon={<PlusCircleFilled></PlusCircleFilled>}
        type="primary"
        size="large"
        shape="round"
        style={{ width: "80%", maxWidth: 460 }}
        onClick={() => {
          if (spaces.length >= 2) {
            messageApi.error(t("space.pub.validation.limit2"));
            return;
          } else {
            setCreateSpaceOpen(true);
          }
        }}
      >
        {t("space.pub.title")}
      </Button>
      <div className={styles.settings_spaces}>
        <div className={styles.settings_spaces_title}>
          {t("user.profile.mySpace")}
        </div>
        <List
          dataSource={spaces}
          renderItem={(item) => {
            return (
              <List.Item>
                <SpaceCard
                  space={item}
                  cardType="edit"
                  style={{ padding: 0, margin: 0 }}
                ></SpaceCard>
              </List.Item>
            );
          }}
        ></List>
      </div>
      <Modal
        open={descEditOpen}
        onCancel={() => setDescEditOpen(false)}
        title={t("user.setting.desc")}
        okText={t("user.setting.save")}
        cancelText={t("user.setting.cancel")}
        onOk={saveDesc}
      >
        <TextArea
          placeholder={t("user.setting.placeholder.desc")}
          showCount
          maxLength={60}
          rows={4}
          value={desc}
          onChange={(e) => {
            setDesc(e.target.value);
          }}
          style={{ resize: "none", marginBottom: 16 }}
        />
      </Modal>
      <Modal
        open={linksEditOpen}
        onCancel={() => setLinksEditOpen(false)}
        title={t("user.setting.links")}
        okText={t("user.setting.save")}
        cancelText={t("user.setting.cancel")}
        onOk={saveLinks}
      >
        <div>
          {links.map((link, index) => {
            return (
              <Input
                style={{
                  margin: "8px 0",
                }}
                key={index}
                placeholder={link.placeholder}
                prefix={link.icon}
                size="large"
                value={link.value}
                onChange={link.onChange}
              />
            );
          })}
        </div>
      </Modal>
      <EasyPubSpaceModal
        ownerId={userId}
        open={createSpaceOpen}
        setOpen={setCreateSpaceOpen}
        messageApi={messageApi}
        onSave={createNewSpace}
      ></EasyPubSpaceModal>
    </div>
  );
}
