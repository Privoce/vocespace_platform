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
  created_at: number;
  expired_at: number;
  /**
   * Start time as UNIX timestamp
   */
  start_at?: number;
  end_at?: number;
  freq: Frequency;
  fee: number;
  owner_id: string;
  state?: SpaceState;
  sub_count: number;
  online_count: number;
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

export const initSpace = (partial: Partial<Space>): Space | null => {
  const now = Math.floor(Date.now() / 1000);
  if (!partial.name || !partial.url || !partial.owner_id) {
    return null;
  } else {
    return {
      name: partial.name,
      desc: partial.desc || "",
      url: partial.url,
      owner_id: partial.owner_id,
      created_at: partial.created_at || now,
      expired_at: partial.expired_at || now + 365 * 24 * 3600, // default 1 year later
      freq: partial.freq || { interval: FrequencyInterval.Flexible },
      fee: partial.fee || 0,
      sub_count: partial.sub_count || 0,
      online_count: partial.online_count || 0,
      images: partial.images || [],
      ty: partial.ty || SpaceType.Meeting,
      public: partial.public !== undefined ? partial.public : false,
    };
  }
};

/**
 * create vocespace url for direct access
 * @param userId user id
 * @param username username from `UserInfo.nickname` || `User.email!`
 * @param spaceName spaceName if is undefined, will use username as spaceName
 * @returns
 */
export const vocespaceUrl = (
  userId: string,
  username: string,
  authFrom: "vocespace" | "google" = "vocespace",
  spaceName?: string
): string => {
  return `https://vocespace.com/${
    spaceName || username
  }?auth=${authFrom}&userId=${userId}&username=${username}`;
};
