import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

function parseProject(project: {
  id: string;
  name: string;
  product: string;
  market: string;
  price: string;
  angle: string;
  context: string;
  competitors: string;
  sections: string;
  results: string | null;
  avatar: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...project,
    competitors: JSON.parse(project.competitors),
    sections: JSON.parse(project.sections),
    results: project.results ? JSON.parse(project.results) : null,
    avatar: project.avatar ? JSON.parse(project.avatar) : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(parseProject(project));
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.product !== undefined && { product: body.product }),
        ...(body.market !== undefined && { market: body.market }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.angle !== undefined && { angle: body.angle }),
        ...(body.context !== undefined && { context: body.context }),
        ...(body.competitors !== undefined && { competitors: JSON.stringify(body.competitors) }),
        ...(body.sections !== undefined && { sections: JSON.stringify(body.sections) }),
        ...(body.results !== undefined && { results: JSON.stringify(body.results) }),
        ...(body.avatar !== undefined && { avatar: JSON.stringify(body.avatar) }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json(parseProject(project));
  } catch (error) {
    console.error('PUT /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
