import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

/**
 * GET /api/classroom/courses
 * Returns the authenticated user's active Google Classroom courses.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const token   = (session as any)?.accessToken as string | undefined;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
  }

  const res = await fetch(
    'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=30',
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: 'Google API error', detail: err }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data.courses ?? []);
}
