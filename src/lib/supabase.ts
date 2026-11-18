import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase client for client-side and general queries / storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload an image to Supabase Storage bucket (e.g. 'products')
 * @param file File object or Buffer
 * @param bucketName Name of the storage bucket, default 'products'
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: File,
  bucketName = 'products'
): Promise<{ url?: string; error?: string }> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return { error: 'Supabase URL e Anon Key não estão configuradas no .env' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `jerseys/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Erro no upload para o Supabase' };
  }
}

