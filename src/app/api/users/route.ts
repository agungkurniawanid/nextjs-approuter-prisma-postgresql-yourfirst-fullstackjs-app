import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('name') || '';

  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive' // Pencarian tidak case-sensitive
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}