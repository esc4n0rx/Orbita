// app/api/auth/firebase/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Registrar o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Criar documento do usuário no Firestore
    const userDoc = {
      id: user.uid,
      nome: name,
      email: user.email,
      bio: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: 'firebase'
    };

    await setDoc(doc(db, 'orbita_usuarios', user.uid), userDoc);

    // Obter token para autenticação
    const token = await user.getIdToken();

    return NextResponse.json({ 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: null
      },
      token,
      message: 'Usuário registrado com sucesso!' 
    });
  } catch (error: any) {
    console.error('Erro ao registrar usuário no Firebase:', error);
    
    // Mapear mensagens de erro do Firebase para mensagens amigáveis
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email já está em uso';
      statusCode = 400;
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Formato de email inválido';
      statusCode = 400;
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A senha é muito fraca';
      statusCode = 400;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}