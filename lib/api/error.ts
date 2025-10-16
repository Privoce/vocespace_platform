export enum UserInfoErrMsg {
  USER_NOT_FOUND = "User not found",
  USER_CREATE_FAILED = "Failed to create user",
  USER_UPDATE_FAILED = "Failed to update user",
  USER_DELETE_FAILED = "Failed to delete user",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  INVALID_INPUT = "Invalid input",
  INTERNAL_ERROR = "Internal server error",
}

export interface ApiErrMsg {
  userInfo: UserInfoErrMsg;
}

export interface ApiErr {
  msg: ApiErrMsg;
  other: Error | string;
}
