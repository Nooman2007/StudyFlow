const SUPABASE_URL =
    "https://chrzovcvyjbslhbedabm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_YYJyaMPj23t-r3oFkF5V4g_-D2vXqZ2";

const studyflowSupabase =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false
            }
        }
    );

window.studyflowSupabase =
    studyflowSupabase;