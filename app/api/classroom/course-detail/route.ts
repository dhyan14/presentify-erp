import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

/**
 * GET /api/classroom/course-detail?courseId=xxx
 * Returns announcements, coursework, and materials for a single course.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token   = (session as any)?.accessToken as string | undefined;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
  }

  const courseId = new URL(req.url).searchParams.get('courseId');
  if (!courseId) {
    return NextResponse.json({ error: 'courseId query param required' }, { status: 400 });
  }

  const headers = { Authorization: `Bearer ${token}` };
  const base    = `https://classroom.googleapis.com/v1/courses/${courseId}`;

  // Fetch all three in parallel
  const [annRes, workRes, matRes] = await Promise.allSettled([
    fetch(`${base}/announcements?pageSize=20&orderBy=updateTime%20desc`, { headers, cache: 'no-store' }),
    fetch(`${base}/courseWork?pageSize=20&orderBy=updateTime%20desc`,    { headers, cache: 'no-store' }),
    fetch(`${base}/courseWorkMaterials?pageSize=20`,                     { headers, cache: 'no-store' }),
  ]);

  const safe = async (r: PromiseSettledResult<Response>) => {
    if (r.status === 'rejected' || !r.value.ok) return [];
    const j = await r.value.json();
    return j.announcements ?? j.courseWork ?? j.courseWorkMaterial ?? [];
  };

  const [announcements, assignments, materials] = await Promise.all([
    safe(annRes), safe(workRes), safe(matRes),
  ]);

  return NextResponse.json({ announcements, assignments, materials });
}
