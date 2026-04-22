import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        product: true,
        market: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project = await prisma.project.create({
      data: {
        name: body.name,
        product: body.product || '',
        market: body.market || 'US',
        price: body.price || '',
        angle: body.angle || '',
        context: body.context || '',
        competitors: JSON.stringify(body.competitors || []),
        sections: JSON.stringify(body.sections || []),
        results: body.results ? JSON.stringify(body.results) : null,
        avatar: body.avatar ? JSON.stringify(body.avatar) : null,
        status: body.status || 'draft',
      },
    });

    return NextResponse.json({
      ...project,
      competitors: JSON.parse(project.competitors),
      sections: JSON.parse(project.sections),
      results: project.results ? JSON.parse(project.results) : null,
      avatar: project.avatar ? JSON.parse(project.avatar) : null,
    });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
