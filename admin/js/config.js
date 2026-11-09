const SUPABASE_URL =
    "https://quaabmagztyqehjajiwa.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_eGnuz0X3I4DlTE_eFPePmw_PolJGPYv";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);