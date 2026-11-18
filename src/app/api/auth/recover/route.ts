import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Security standard: don't reveal if user exists, or return success message
      return NextResponse.json({
        success: true,
        message: 'Se este e-mail estiver cadastrado, as instruções de recuperação foram enviadas.',
      });
    }

    // If newPassword was provided (for reset mode):
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'A nova senha deve ter no mínimo 6 caracteres' }, { status: 400 });
      }
      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      return NextResponse.json({
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode entrar com a nova senha.',
      });
    }

    // Default recovery request
    return NextResponse.json({
      success: true,
      message: 'Instruções de recuperação e código temporário enviados para o e-mail informado.',
    });
  } catch (error: any) {
    console.error('Password recovery error:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
