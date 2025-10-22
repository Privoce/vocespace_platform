"use client";

import { UserInfo } from "@/lib/std/user";
import { dbApi } from "@/lib/api/db";
import { Input, Button, Typography, Avatar, Badge, List } from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  LeftOutlined,
  PlusCircleFilled,
  WechatOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import styles from "@/styles/user_settings.module.scss";
import { UserPageUniProps } from "./page";
import { useI18n } from "@/lib/i18n/i18n";
import { EditAvatarBtn } from "./page";
const { Title, Text } = Typography;
const { TextArea } = Input;

interface UserSettingsProps extends UserPageUniProps {}

export default function UserSettings({
  userId,
  setPage,
  messageApi,
  client,
  flushUser,
  user,
  userInfo,
  username,
  avatar,
  isSelf,
  loading,
  updateUserInfo,
}: UserSettingsProps) {
  const { t } = useI18n();

  const [nickname, setNickname] = useState(userInfo?.nickname || "");
  const [desc, setDesc] = useState(userInfo?.desc || "");
  const [location, setLocation] = useState(userInfo?.location || "");
  const [linkedin, setLinkedin] = useState(userInfo?.linkedin || "");
  const [github, setGithub] = useState(userInfo?.github || "");
  const [twitter, setTwitter] = useState(userInfo?.twitter || "");
  const [currentUserInfo, setCurrentUserInfo] = useState(userInfo);

  const handleAvatarUpdate = (avatarUrl: string) => {
    // 更新本地状态
    setCurrentUserInfo((prev: any) =>
      prev ? { ...prev, avatar: avatarUrl } : null
    );
  };

  const handleSave = async (values: any) => {
    try {
      const updateData: Partial<UserInfo> = {
        nickname,
        desc,
        location,
        linkedin,
        github,
        twitter,
      };
      
      await updateUserInfo(updateData);
      messageApi.success(t("user.setting.saveSuccess"));
    } catch (error) {
      messageApi.error(t("user.setting.saveError"));
    }
  };

  const handleEditProfile = () => {
    messageApi.info("头像更改功能正在开发中，敬请期待！");
  };

  const links = useMemo(() => {
    return [
      {
        icon: <GithubOutlined style={{ fontSize: 20, cursor: "pointer" }} />,
        value: "github",
      },
      {
        icon: <LinkedinOutlined style={{ fontSize: 20, cursor: "pointer" }} />,
        value: "linkedin",
      },
      {
        icon: <WechatOutlined style={{ fontSize: 20, cursor: "pointer" }} />,
        value: "wx",
      },
      {
        icon: <TwitterOutlined style={{ fontSize: 20, cursor: "pointer" }} />,
        value: "twitter",
      },
    ];
  }, [userInfo]);

  const addLink = (linkType: string) => {};

  if (!userInfo) {
    return (
      <div className={styles.settings}>
        <Text>loading...</Text>
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
                backgroundColor: "#22CCEE",
                border: "none",
              }}
            >
              {username.charAt(0).toUpperCase() || <UserOutlined />}
            </Avatar>
          </EditAvatarBtn>
        </div>
        <div className={styles.settings_userInfo}>
          <div className={styles.settings_userInfo_username}>{username}</div>
          <div className={styles.settings_userInfo_desc}>
            {userInfo?.desc || t("user.profile.placeholder.desc")}
          </div>
          <div className={styles.settings_userInfo_links}>
            {links.map((link) => (
              <Badge count={<PlusCircleFilled></PlusCircleFilled>} key={link.value}>
                <div onClick={() => addLink(link.value)} key={link.value}>
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
      >
        {t("space.pub.title")}
      </Button>
      <div className={styles.settings_spaces}>
        <div className={styles.settings_spaces_title}>
          {t("user.profile.mySpace")}
        </div>
        <List dataSource={[]} renderItem={(item) => {
          return <List.Item></List.Item>;
        }}></List>
      </div>
    </div>
  );
}

// function Modal(){
//   return <div className={styles.settings_form}>
//         <div className={styles.settings_form_row}>
//           <div className={styles.inline}>{t("user.setting.username")}:</div>
//           <Input
//             placeholder={t("user.setting.placeholder.username")}
//             size="large"
//             value={nickname}
//             onChange={(e) => {
//               setNickname(e.target.value);
//             }}
//           />
//         </div>
//         <div className={styles.settings_form_row}>
//           <div className={styles.inline}>{t("user.setting.desc")}:</div>
//           <TextArea
//             placeholder={t("user.setting.placeholder.desc")}
//             showCount
//             maxLength={60}
//             rows={4}
//             value={desc}
//             onChange={(e) => {
//               setDesc(e.target.value);
//             }}
//             style={{ resize: "none" }}
//           />
//         </div>
//         <div className={styles.settings_form_row}>
//           <div className={styles.inline}>{t("user.setting.location")}:</div>
//           <Input
//             placeholder={t("user.setting.placeholder.location")}
//             prefix={<EnvironmentOutlined />}
//             size="large"
//             value={location}
//             onChange={(e) => {
//               setLocation(e.target.value);
//             }}
//           />
//         </div>
//         <div className={styles.settings_form_row}>
//           <div className={styles.inline}>{t("user.setting.linkedin")}:</div>
//           <Input
//             placeholder={t("user.setting.placeholder.linkedin")}
//             prefix={<LinkedinOutlined />}
//             size="large"
//             value={linkedin}
//             onChange={(e) => {
//               setLinkedin(e.target.value);
//             }}
//           />
//         </div>
//         <div className={styles.settings_form_row}>
//           <div className={styles.inline}>{t("user.setting.github")}:</div>
//           <Input
//             placeholder={t("user.setting.placeholder.github")}
//             prefix={<GithubOutlined />}
//             size="large"
//             value={github}
//             onChange={(e) => {
//               setGithub(e.target.value);
//             }}
//           />
//         </div>
//         <div className={styles.settings_form_row}>
//           <div className={styles.inline}>{t("user.setting.twitter")}:</div>
//           <Input
//             placeholder={t("user.setting.placeholder.twitter")}
//             prefix={<TwitterOutlined />}
//             size="large"
//             value={twitter}
//             onChange={(e) => {
//               setTwitter(e.target.value);
//             }}
//           />
//         </div>
//         <div
//           className={styles.settings_form_row}
//           style={{ justifyContent: "flex-end" }}
//         >
//           <Button
//             size="large"
//             style={{ width: 220 }}
//             type="primary"
//             loading={loading}
//             onClick={handleSave}
//           >
//             {t("user.setting.save")}
//           </Button>
//         </div>
//       </div>
// }
