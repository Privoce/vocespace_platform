import { SupabaseClient } from "@supabase/supabase-js";

export interface SBClientNeeded {
    client: SupabaseClient;
}

export type Nullable<T> = T | null;