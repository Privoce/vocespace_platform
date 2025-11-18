const VOCESPACE_API = "/api/vocespace";

export interface CreateSpaceParams {
  spaceName: string;
  ownerId: string;
  owner: string;
}

/**
 * create a vocespace for user
 * @param uid user id
 * @param username user username from `UserInfo` or use `User`.email (now only support email/google login, so email is always exist)
 */
export const createSpace = (
  uid: string,
  username: string,
  spaceName?: string
): Promise<Response> => {
  // 发送到: GET vocespace.com/api/space?space=create&spaceName=${spaceName}&ownerId=${uid}&owner=${username}
  const url = new URL(VOCESPACE_API, location.origin);

  return fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      spaceName: spaceName || username,
      ownerId: uid,
      owner: username,
    } as CreateSpaceParams),
  });
};

export const vocespace = {
  createSpace,
};
