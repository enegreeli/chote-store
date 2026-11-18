import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

// In-memory brute-force protection (maximum 5 failed attempts per 60 seconds per IP/email)
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = failedAttempts.get(identifier);
  if (!entry || now > entry.resetAt) {
    return true; // Not rate limited
  }
  return entry.count < 5;
}

function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  const entry = failedAttempts.get(identifier);
  if (!entry || now > entry.resetAt) {
    failedAttempts.set(identifier, { count: 1, resetAt: now + 60 * 1000 });
  } else {
    entry.count += 1;
  }
}

function clearRateLimit(identifier: string) {
  failedAttempts.delete(identifier);
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || cleanEmail;

    // 1. Brute-force rate limiting check
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Muitas tentativas incorretas. Por segurança, aguarde 1 minuto para tentar novamente.' },
        { status: 429 }
      );
    }

    // 2. Fetch user from embedded database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !user.passwordHash) {
      recordFailedAttempt(clientIp);
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // 3. Cryptographic password comparison using Bcrypt with salted hash (no plain-text in code)
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      recordFailedAttempt(clientIp);
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // 4. Success: Clear rate limit counter
    clearRateLimit(clientIp);

    // 5. Sign cryptographic JWT authentication token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        cpf: user.cpf,
      },
    });

    // 6. Set secure HttpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar login seguro' }, { status: 500 });
  }
}
