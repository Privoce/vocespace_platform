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

export interface Space {
  id: string;
  name: string;
  desc: string;
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
  /**
   * Whether the space is public or requires payment
   */
  is_public: boolean;
}
