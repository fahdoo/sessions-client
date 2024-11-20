import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@/lib/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const signedUrl = await getSignedUrl(url);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' }, 
      { status: 500 }
    );
  }
} 