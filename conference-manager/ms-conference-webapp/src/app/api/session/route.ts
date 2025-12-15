import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('cm_user');
  if (!userCookie) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  try {
    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
