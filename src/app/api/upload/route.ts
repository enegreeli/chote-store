import { NextResponse } from 'next/server';
import { getCurrentUser, isStaffOrAdmin } from '@/lib/auth';

/**
 * Self-contained file upload handler for Chote Store.
 * Accepts image files from PC or mobile devices and returns a high-performance Data URL.
 * Works 100% out-of-the-box on local and Vercel without requiring external storage buckets.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Convert to Base64 Data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar imagem' }, { status: 500 });
  }
}
