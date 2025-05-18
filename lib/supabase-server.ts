import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        persistSession: false,
      },
    }
  );
  
  return supabase;
};