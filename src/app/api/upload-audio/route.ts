import { NextRequest, NextResponse } from 'next/server';

const MEDIA_HOST = 'https://www.layman-design.com/six43';
const MEDIA_KEY = process.env.MEDIA_KEY!;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const filename = formData.get('filename') as string | null;

  if (!file || !filename) {
    return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
  }

  const proxyForm = new FormData();
  proxyForm.append('file', file);
  proxyForm.append('filename', filename);
  proxyForm.append('key', MEDIA_KEY);

  try {
    const res = await fetch(`${MEDIA_HOST}/upload.php`, {
      method: 'POST',
      body: proxyForm,
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    } else {
      const text = await res.text();
      console.error('Audio upload proxy error:', filename, res.status, text);
      return NextResponse.json({ error: 'Upload failed' }, { status: res.status });
    }
  } catch (err) {
    console.error('Audio upload proxy network error:', filename, err);
    return NextResponse.json({ error: 'Network error' }, { status: 502 });
  }
}
