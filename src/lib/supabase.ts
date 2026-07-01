import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kskjnigieybpzmvakblm.supabase.co";
const supabaseAnonKey = "sb_publishable_2TivNVD_pofT1OgL77nXBQ_QpPsvmXj";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
