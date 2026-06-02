import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('cm_user');
  if (!userCookie) return null;
  try {
    const user = JSON.parse(userCookie.value);
    return user?.token ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const token = await getToken();
  const body = await request.json();

  const res = await fetch(`${BASE}conferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
