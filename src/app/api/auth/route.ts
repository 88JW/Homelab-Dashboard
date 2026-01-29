import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  const MASTER_PASSWORD = 'TwojeSilneHaslo123';

  if (password === MASTER_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('cosmos_session', 'active', {
      httpOnly: true,
      secure: false, // Zmienione na false dla HTTP
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return NextResponse.json({ success: true });
  }

  const baseUrl = new URL(request.url).origin;
  await fetch(`${baseUrl}/api/stats?recordFailedLogin=true`, { cache: 'no-store' });

  return NextResponse.json({ error: 'Błędne hasło' }, { status: 401 });
}