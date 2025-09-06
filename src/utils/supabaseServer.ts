import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Supabase URL exists:', !!supabaseUrl);
console.log('Supabase Key exists:', !!supabaseServiceKey);
console.log('Supabase URL (first 20 chars):', supabaseUrl?.substring(0, 20));

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(`Missing Supabase environment variables - URL: ${!!supabaseUrl}, Key: ${!!supabaseServiceKey}`);
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});