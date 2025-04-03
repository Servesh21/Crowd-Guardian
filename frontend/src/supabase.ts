import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "your_supabase_url";
const SUPABASE_ANON_KEY = "your_supabase_anon_key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
