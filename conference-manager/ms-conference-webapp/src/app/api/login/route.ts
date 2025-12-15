import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.user || !body.credentials || !body.token) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  // In real app, validate credentials/token server-side and build minimal user
  const userSession = {
    ...body.user,
    // Do NOT store sensitive credentials in cookie; include only safe fields
    token: body.token,
    email: body.credentials.email,
  };
  const resp = NextResponse.json({ ok: true }, { status: 200 });
  resp.cookies.set('cm_user', JSON.stringify(userSession), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  return resp;
}

export async function DELETE() {
  const resp = NextResponse.json({ ok: true }, { status: 200 });
  resp.cookies.set('cm_user', '', { path: '/', httpOnly: true, maxAge: 0 });
  return resp;
}
