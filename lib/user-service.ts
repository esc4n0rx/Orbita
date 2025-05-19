// lib/user-service.ts
import { User as FirebaseUser } from 'firebase/auth';
import { supabase } from '@/lib/supabase';
import { auth as adminAuth } from '@/lib/firebase-admin';

export async function sincronizarUsuarioFirebaseComSupabase(firebaseUser: FirebaseUser) {
  try {
    // Verificar se usuário existe no Supabase
    const { data: usuarioExistente } = await supabase
      .from('orbita_usuarios')
      .select('id')
      .eq('id', firebaseUser.uid)
      .single();

    if (!usuarioExistente) {
      // Criar um customToken para o usuário no Firebase Admin
      const customToken = await adminAuth.createCustomToken(firebaseUser.uid);
      
      // Fazer login no Supabase com customToken (isso criará um usuário correspondente)
      const { error } = await supabase.auth.signInWithCustomToken(customToken);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar usuário Firebase com Supabase:', error);
    return false;
  }
}