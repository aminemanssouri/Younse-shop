import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

    const buffer = await file.arrayBuffer();
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    const filename = `${crypto.randomBytes(16).toString('hex')}-${Date.now()}${ext}`;
    const objectPath = `products/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, Buffer.from(buffer), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    const imageUrl = data.publicUrl;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
