export type Extraction = 'easy' | 'medium' | 'max';

export interface AICutParticipantConf {
  /**
   * 是否需要在任务栏显示分析时间以及需要进行时间统计
   */
  spent: boolean;
  /**
   * 是否要结合待办事项进行分析
   */
  todo: boolean;
  /**
   * 提取内容配置的精细度
   */
  extraction: Extraction;
}


/**
 * 用户的基础设置，去除了不必要的信息
 */
export interface ParticipantSettings {
  // /**
  //  * 客户端版本
  //  */
  // version: string;
  // /**
  //  * 参与者名称
  //  */
  // name: string;
  /**
   * 音量
   */
  volume: number;
  /**
   * 视频模糊度
   */
  blur: number;
  /**
   * 屏幕分享模糊度
   */
  screenBlur: number;
  // /**
  //  * 用户状态：系统状态/用户自定义状态
  //  */
  // status: UserStatus | string;
  // socketId: string;
  // /**
  //  * 参与者开始时间
  //  */
  // startAt: number;
  // /**
  //  * 虚拟形象
  //  */
  // virtual: {
  //   role: ModelRole;
  //   bg: ModelBg;
  //   enabled: boolean;
  // };
  /**
   * 是否开启屏幕分享音频
   */
  openShareAudio: boolean;
  /**
   * 是否开启新用户加入时的提示音
   */
  openPromptSound: boolean;
  // /**
  //  * 用户应用同步
  //  */
  // sync: AppKey[];
  // /**
  //  * 用户应用权限
  //  */
  // auth: AppAuth;
  // /**
  //  * 用户应用数据
  //  */
  // appDatas: {
  //   /**
  //    * 待办事项应用数据
  //    */
  //   todo?: SpaceTodo[];
  //   /**
  //    * 计时器应用数据
  //    */
  //   timer?: SpaceTimer;
  //   /**
  //    * 倒计时应用数据
  //    */
  //   countdown?: SpaceCountdown;
  // };
  // /**
  //  * 当前是否请求举手
  //  */
  // raiseHand: boolean;
  /**
   * ai相关的功能设置
   */
  ai: {
    /**
     * AI截图分析功能
     */
    cut: AICutParticipantConf;
  };
  // /**
  //  * 是否在线，如果用户在线则新用户如果重名无法加入，如果不在线则允许重名加入
  //  */
  // online: boolean;
  // /**
  //  * 是否认证通过
  //  */
  // isAuth: boolean;
}

export enum FrequencyInterval {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
  Flexible = "flexible",
}

export interface Frequency {
  interval: FrequencyInterval;
  // For 'flexible' interval, specify days of week (0=Sunday,...6=Saturday)
  in_week?: number[];
}

export enum SpaceState {
  Active = "active",
  Waiting = "waiting",
}

export enum SpaceType {
  Meeting = "meeting",
  Class = "class",
  Hobbies = "hobbies",
  Tech = "tech",
}

export interface Space {
  id?: string;
  name: string;
  desc?: string;
  created_at: string;
  expired_at: string;
  /**
   * Start time as UNIX timestamp
   */
  start_at?: string;
  end_at?: string;
  freq: Frequency;
  fee: number;
  owner_id: string;
  state?: SpaceState;
  sub_count: number;
  online_count?: number;
  /**
   * space url, link to join or view the space
   */
  url: string;
  /**
   * Array of image URLs
   */
  images: string[];
  ty: SpaceType | string;
  /**
   * Detailed description or content of the space (e.g., markdown format)
   */
  readme?: string;
  public: boolean;
}

export interface SpaceJsonB {
  id?: string;
  name: string;
  desc?: string;
  created_at: string;
  expired_at: string;
  /**
   * Start time as UNIX timestamp
   */
  start_at?: string;
  end_at?: string;
  freq: string;
  fee: number;
  owner_id: string;
  state?: SpaceState;
  sub_count: number;
  online_count?: number;
  url: string;
  images: string;
  readme?: string;
  public: boolean;
  ty: SpaceType | string;
}

export const castToSpace = (spaceJsonB: SpaceJsonB): Space => {
  return {
    ...spaceJsonB,
    freq: JSON.parse(spaceJsonB.freq),
    images: JSON.parse(spaceJsonB.images),
  };
};

/**
 * Initialize a new space with default values
 * @param partial Partial space object
 * @returns Initialized space object or null if required fields are missing
 * - needed fields: name, url, owner_id
 */
export const initSpace = (partial: Partial<Space>): Space | null => {
  const now = Date.now();
  const nowString = new Date(now).toLocaleString();
  const default_expired_at = new Date(
    now + 365 * 24 * 3600 * 1000
  ).toLocaleString();
  if (!partial.name || !partial.url || !partial.owner_id) {
    return null;
  } else {
    return {
      name: partial.name,
      desc: partial.desc || "",
      url: partial.url,
      owner_id: partial.owner_id,
      created_at: partial.created_at || nowString,
      expired_at: partial.expired_at || default_expired_at, // default 1 year later
      freq: partial.freq || { interval: FrequencyInterval.Flexible },
      fee: partial.fee || 0,
      sub_count: partial.sub_count || 0,
      images: partial.images || [],
      ty: partial.ty || SpaceType.Meeting,
      public: partial.public !== undefined ? partial.public : false,
    };
  }
};

/**
 * create vocespace url for direct access
 * - authFrom:
 *  - vocespace | google =>
 * @param userId user id
 * @param username username from `UserInfo.username` || `User.email!`
 * @param spaceName spaceName if is undefined, will use username as spaceName
 * @returns
 */
export const vocespaceUrl = (
  userId: string,
  username: string,
  authFrom: "vocespace" | "space" = "vocespace",
  spaceName?: string
): string => {
  let redirectTo = authFrom === "space" ? "space.voce.chat" : "vocespace.com";
  return `https://${redirectTo}/${
    spaceName || username
  }?auth=${authFrom}&userId=${userId}&username=${username}`;
};

export const vocespaceUrlVisit = (spaceName: string) => {
  return `https://vocespace.com/${spaceName}`;
};

export const vocespaceName = (username: string, spaceName?: string) => {
  return spaceName || username;
};
