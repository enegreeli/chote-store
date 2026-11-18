import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const rawSettings = await prisma.storeSetting.findMany();
    const settings: Record<string, string> = {};
    rawSettings.forEach((s) => {
      settings[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, settings: {} });
  }
}

