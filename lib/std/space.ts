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
  id: string;
  name: string;
  desc?: string;
  created_at: number;
  start_at: number;
  end_at: number;
  freq: Frequency;
  fee: number;
  owner_id: string;
  owner_name: string;
  state: SpaceState;
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
}

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

