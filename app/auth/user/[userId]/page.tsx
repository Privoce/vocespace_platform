"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { UserProfile } from "./profile";
import UserSettings from "./settings";
import OnboardingDrive from "./drive";
import { useUser } from "@/hooks/useUser";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { UserInfo } from "@/lib/std/user";
import {
  Card,
  GetProp,
  message,
  Result,
  Skeleton,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { HomeHeader, HomeHeaderExports } from "@/app/home/header";
import { useI18n } from "@/lib/i18n/i18n";
import { MessageInstance } from "antd/es/message/interface";
import { useSearchParams, useRouter } from "next/navigation";
import ImgCrop from "antd-img-crop";
import { dbApi } from "@/lib/api/db";
import { BucketApiErrMsg } from "@/lib/api/error";
import styles from "@/styles/user_settings.module.scss";
import { initSpace, Space, vocespaceUrlVisit } from "@/lib/std/space";
import { isMobile, Nullable } from "@/lib/std";

export interface UserPageUniProps {
  userId: string;
  messageApi: MessageInstance;
  client: SupabaseClient;
  flushUser: () => Promise<void>;
  // 从父组件传递的用户数据
  user: Nullable<User>;
  userInfo: Nullable<UserInfo>;
  avatar: string | null;
  isSelf: boolean;
  loading: boolean;
  spaces: Space[];
  updateUserInfo: (updates: any) => Promise<boolean>;
}

export default function UserPage({ params }: { params: { userId: string } }) {
  const [messageApi, contextHolder] = message.useMessage();
  const HomeHeaderRef = useRef<HomeHeaderExports>(null);
  // const urlSearchParams = useSearchParams();
  // const router = useRouter();
  const { t } = useI18n();
  // 使用新的 useUser hook
  const {
    user,
    userInfo,
    spaces,
    avatar,
    isSelf,
    loading,
    error,
    needsOnboarding,
    client,
    refreshUserData,
    updateUserInfo,
  } = useUser({
    userId: params.userId,
  });

  useEffect(() => {
    if (error) {
      console.warn("Error loading user data:", error, params.userId);
      messageApi.error(error);
    }
  }, [error, messageApi, params.userId]);

  const flushUser = async () => {
    await refreshUserData();
    if (HomeHeaderRef.current) {
      await HomeHeaderRef.current.flush();
    }
  };

  // 如果查看的不是自己的页面，且用户存在但昵称未设置，显示该用户无法访问
  // 如果是onboarding页面，显示onboarding组件
  return (
    <div className="uni-page-container">
      <HomeHeader ref={HomeHeaderRef} messageApi={messageApi} />
      {contextHolder}
      {loading && !user && (
        <Card
          style={{
            height: "calc(100vh - 98px)",
            width: "460px",
            backgroundColor: "#1E1E1E",
            border: "1px solid #1E1E1E",
            borderRadius: 16,
          }}
          styles={{
            body: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignContent: "flex-start",
              gap: "16px",
              padding: "36px 0",
              flexWrap: "wrap",
              position: "relative",
              height: "100%",
            },
          }}
        >
          <Skeleton.Avatar active size={96} />
          <Skeleton.Input active style={{ width: 400 }} />
          <Skeleton.Input active style={{ width: 400 }} />
          <Skeleton.Input active style={{ width: 400 }} />
          <Skeleton.Input active style={{ width: 400 }} />
          <Skeleton.Button
            active
            style={{
              width: 200,
              position: "absolute",
              bottom: 36,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </Card>
      )}
      {!loading && userInfo && !userInfo.nickname && (
        <>
          {isSelf && user && needsOnboarding ? (
            <OnboardingDrive
              flushUser={flushUser}
              user={user}
              userInfo={userInfo}
              client={client}
              messageApi={messageApi}
              onComplete={flushUser}
              updateUserInfo={updateUserInfo}
            />
          ) : (
            <Result
              status="404"
              title={t("login.visit.un")}
              subTitle={
                <span style={{ color: "#8c8c8c" }}>
                  {t("login.visit.unFinished")}
                </span>
              }
            ></Result>
          )}
        </>
      )}
      {userInfo && !needsOnboarding && userInfo.nickname && (
        <div className={styles.user_view}>
          {/* {isSelf && !isMobile() && (
            <UserSettings
              flushUser={flushUser}
              client={client}
              userId={params.userId}
              messageApi={messageApi}
              user={user}
              userInfo={userInfo}
              avatar={avatar}
              spaces={spaces}
              isSelf={isSelf}
              loading={loading}
              updateUserInfo={updateUserInfo}
            />
          )} */}
          <UserProfile
            flushUser={flushUser}
            client={client}
            userId={params.userId}
            messageApi={messageApi}
            spaces={spaces}
            user={user}
            userInfo={userInfo}
            avatar={avatar}
            isSelf={isSelf}
            loading={loading}
            updateUserInfo={updateUserInfo}
          />
        </div>
      )}
    </div>
  );
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface EditAvatarBtnProps {
  userId: string;
  client: SupabaseClient;
  messageApi: MessageInstance;
  afterUpdate: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function EditAvatarBtn({
  userId,
  client,
  messageApi,
  afterUpdate,
  children,
  disabled = false,
}: EditAvatarBtnProps) {
  const { t } = useI18n();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadToSupabase = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const path = await dbApi.storage.update(client, userId, file);
      return await dbApi.storage.url(client, path);
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const updateUserAvatar = async (avatarUrl: string) => {
    try {
      const success = await dbApi.userInfo.update(client, userId, {
        avatar: avatarUrl,
      });

      if (success) {
        messageApi.success(t("user.setting.avatarUpdateSuccess"));
        afterUpdate && afterUpdate();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Update avatar error:", error);
      messageApi.error(t("user.setting.avatarUpdateError"));
    }
  };

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      const avatarUrl = await uploadToSupabase(file);
      await updateUserAvatar(avatarUrl);
      onSuccess(avatarUrl);
      setFileList([]);
    } catch (error) {
      onError(error);
      if (error === BucketApiErrMsg.FILE_NO_EXT) {
        messageApi.error(error);
      } else {
        messageApi.error(t("user.setting.uploadError"));
      }
    }
  };

  const beforeUpload = (file: File) => {
    const isAllowImg =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      file.type === "image/svg+xml" ||
      file.type === "image/gif";

    if (!isAllowImg) {
      messageApi.error(t("user.setting.imageFormatError"));
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error(t("user.setting.imageSizeError"));
      return false;
    }

    return true;
  };

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as FileType);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  return (
    <ImgCrop
      rotationSlider
      modalTitle={t("user.setting.cropAvatar")}
      modalOk={t("common.save")}
      modalCancel={t("common.cancel")}
    >
      <Upload
        customRequest={customUpload}
        fileList={fileList}
        onChange={onChange}
        beforeUpload={beforeUpload}
        multiple={false}
        onPreview={onPreview}
        showUploadList={false}
        accept="image/*"
        disabled={disabled}
      >
        {/* <Button
          icon={<EditOutlined />}
          type="default"
          loading={uploading}
          disabled={uploading}
        >
          {uploading ? t("common.uploading") : t("user.setting.editAvatar")}
        </Button> */}
        {children}
      </Upload>
    </ImgCrop>
  );
}
