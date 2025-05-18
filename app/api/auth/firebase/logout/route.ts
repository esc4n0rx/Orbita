// app/api/auth/firebase/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    await auth.signOut();
    
    return NextResponse.json({ message: 'Logout realizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao fazer logout do Firebase:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}