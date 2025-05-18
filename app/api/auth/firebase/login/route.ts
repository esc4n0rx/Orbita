// app/api/auth/firebase/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar o Firebase Admin para fazer login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    return NextResponse.json({ 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, 
      token 
    });
  } catch (error: any) {
    console.error('Erro ao fazer login no Firebase:', error);
    
    // Mapear mensagens de erro do Firebase para mensagens amigáveis
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Email ou senha incorretos';
      statusCode = 401;
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Formato de email inválido';
      statusCode = 400;
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde';
      statusCode = 429;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}