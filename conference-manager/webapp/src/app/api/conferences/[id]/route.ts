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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken();
  const body = await request.json();

  const res = await fetch(`${BASE}conferences/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken();

  const res = await fetch(`${BASE}conferences/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return new NextResponse(null, { status: res.status });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
