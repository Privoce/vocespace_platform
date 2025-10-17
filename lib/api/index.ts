import { dbApi } from "./db";
import { vocespace } from "./vocespace/space";

export const api = {
  userInfo: dbApi.userInfo,
  /**
   * only for server side
   */
  vocespace,
};
