import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Missing Supabase environment variables. ' +
        'The app will run in offline mode. Check your .env file.'
    );
}

// Use placeholder values when env vars are missing to prevent module-load crash.
// Supabase calls will fail gracefully at network level instead of throwing at startup.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
);
