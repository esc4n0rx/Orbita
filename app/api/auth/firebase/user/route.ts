// app/api/auth/firebase/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    // Buscar detalhes adicionais do perfil do usuário no Firestore
    const userRef = doc(db, 'orbita_usuarios', currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Perfil de usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      }, 
      perfil: userSnap.data() 
    });
  } catch (error) {
    console.error('Erro ao obter usuário do Firebase:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}