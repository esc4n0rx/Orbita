import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não foi definida');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não foi definida');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserDetails = async () => {
  const user = await getUser();
  
  if (!user) return null;
  
  const { data } = await supabase
    .from('orbita_usuarios')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return data;
};