"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { UserProfile } from "./profile";
import UserSettings from "./settings";
import { getUsername, useUser } from "@/hooks/useUser";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { UserInfo } from "@/lib/std/user";
import { Nullable } from "@/lib/std";
import {
  Button,
  GetProp,
  message,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { HomeHeader } from "@/app/home/header";
import { useI18n } from "@/lib/i18n/i18n";
import { MessageInstance } from "antd/es/message/interface";
import { useSearchParams } from "next/navigation";
import { EditOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { dbApi } from "@/lib/api/db";
import { BucketApiErrMsg } from "@/lib/api/error";

export type UserPageType = "profile" | "settings";

export interface UserPageUniProps {
  setPage: (page: UserPageType) => void;
  userId: string;
  user: Nullable<User>;
  userInfo: Nullable<UserInfo>;
  username: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  messageApi: MessageInstance;
  client: SupabaseClient;
  flushUser: () => Promise<void>;
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
  const urlSearchParams = useSearchParams();
  const { user, userInfo, loading, setLoading, error, client, getUser } =
    useUser({
      userId: params.userId,
    });

  const username = useMemo(() => {
    return getUsername(user, userInfo);
  }, [userInfo, user]);

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
  }, [error]);

  useEffect(() => {
    const pageParam = getPageParam();
    if (pageParam === "profile" || pageParam === "settings") {
      setPage(pageParam);
    }
  }, [urlSearchParams, searchParams, getPageParam]);

  return (
    <div className="uni-page-container">
      <HomeHeader messageApi={messageApi} />
      {contextHolder}
      {page === "profile" ? (
        <UserProfile
          flushUser={getUser}
          client={client}
          userId={params.userId}
          username={username}
          user={user}
          userInfo={userInfo}
          loading={loading}
          setLoading={setLoading}
          messageApi={messageApi}
          setPage={setPage}
        />
      ) : (
        <UserSettings
          flushUser={getUser}
          client={client}
          username={username}
          userId={params.userId}
          user={user}
          userInfo={userInfo}
          loading={loading}
          setLoading={setLoading}
          setPage={setPage}
          messageApi={messageApi}
        />
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
}

export function EditAvatarBtn({
  userId,
  client,
  messageApi,
  afterUpdate,
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
        <Button
          icon={<EditOutlined />}
          type="default"
          loading={uploading}
          disabled={uploading}
        >
          {uploading ? t("common.uploading") : t("user.setting.editAvatar")}
        </Button>
      </Upload>
    </ImgCrop>
  );
}
