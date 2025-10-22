"use client";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { UserProfile } from "./profile";
import UserSettings from "./settings";
import OnboardingDrive from "./drive";
import { useUser } from "@/hooks/useUser";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserInfo } from "@/lib/std/user";
import {
  GetProp,
  message,
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

export type UserPageType = "profile" | "settings" | "onboarding";

export interface UserPageUniProps {
  setPage: (page: UserPageType) => void;
  userId: string;
  messageApi: MessageInstance;
  client: SupabaseClient;
  flushUser: () => Promise<void>;
  // 从父组件传递的用户数据
  user: any;
  userInfo: any;
  username: string;
  avatar: string | null;
  isSelf: boolean;
  loading: boolean;
  updateUserInfo: (updates: any) => Promise<boolean>;
}

export default function UserPage({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: {
    page?: UserPageType;
  };
}) {
  const [page, setPage] = useState<UserPageType>("profile");
  const [messageApi, contextHolder] = message.useMessage();
  const HomeHeaderRef = useRef<HomeHeaderExports>(null);
  const urlSearchParams = useSearchParams();
  const router = useRouter();
  
  // 使用新的 useUser hook
  const {
    user,
    userInfo,
    username,
    avatar,
    isSelf,
    loading,
    error,
    needsOnboarding,
    client,
    getUser,
    updateUserInfo,
  } = useUser({
    userId: params.userId,
  });

  // 创建一个可靠的参数获取函数
  const getPageParam = useCallback(() => {
    return (
      (urlSearchParams?.get("page") as UserPageType) ||
      searchParams?.page ||
      (typeof window !== "undefined"
        ? (new URLSearchParams(window.location.search).get(
            "page"
          ) as UserPageType)
        : null) ||
      "profile"
    );
  }, [urlSearchParams, searchParams]);

  useEffect(() => {
    if (error) {
      console.warn("Error loading user data:", error, params.userId);
      messageApi.error(error);
    }
  }, [error, messageApi, params.userId]);

  // 处理onboarding重定向
  useEffect(() => {
    if (!loading && isSelf && needsOnboarding) {
      const currentPage = getPageParam();
      if (currentPage !== "onboarding") {
        // 自动重定向到onboarding页面
        router.replace(`/auth/user/${params.userId}?page=onboarding`);
        setPage("onboarding");
        return;
      }
    }
  }, [loading, isSelf, needsOnboarding, getPageParam, router, params.userId]);

  useEffect(() => {
    const pageParam = getPageParam();
    if (pageParam === "profile" || pageParam === "settings" || pageParam === "onboarding") {
      setPage(pageParam);
    }
  }, [urlSearchParams, searchParams, getPageParam]);

  const flushUser = async () => {
    await getUser();
    if (HomeHeaderRef.current) {
      await HomeHeaderRef.current.flush();
    }
  };

  // 处理onboarding完成后的跳转
  const handleOnboardingComplete = () => {
    router.push(`/auth/user/${params.userId}?page=profile`);
    setPage("profile");
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="uni-page-container">
        <HomeHeader ref={HomeHeaderRef} messageApi={messageApi} />
        {contextHolder}
        <div className={styles.user_view}>
          <div style={{ textAlign: "center", padding: "50px" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // 如果是onboarding页面，显示onboarding组件
  if (page === "onboarding" && isSelf && user) {
    return (
      <>
        {contextHolder}
        <OnboardingDrive
        flushUser={flushUser}
          user={user}
          userInfo={userInfo}
          client={client}
          messageApi={messageApi}
          onComplete={handleOnboardingComplete}
          updateUserInfo={updateUserInfo}
        />
      </>
    );
  }

  return (
    <div className="uni-page-container">
      <HomeHeader ref={HomeHeaderRef} messageApi={messageApi} />
      {contextHolder}
      <div className={styles.user_view}>
        {isSelf && (
          <UserSettings
            flushUser={flushUser}
            client={client}
            userId={params.userId}
            setPage={setPage}
            messageApi={messageApi}
            user={user}
            userInfo={userInfo}
            username={username}
            avatar={avatar}
            isSelf={isSelf}
            loading={loading}
            updateUserInfo={updateUserInfo}
          />
        )}
        <UserProfile
          flushUser={flushUser}
          client={client}
          userId={params.userId}
          messageApi={messageApi}
          setPage={setPage}
          user={user}
          userInfo={userInfo}
          username={username}
          avatar={avatar}
          isSelf={isSelf}
          loading={loading}
          updateUserInfo={updateUserInfo}
        />
      </div>
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
}

export function EditAvatarBtn({
  userId,
  client,
  messageApi,
  afterUpdate,
  children,
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
