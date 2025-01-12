/*
 * MIT License
 * Copyright (c) 2025 Ata İlhan Köktürk
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const url = new URL(request.url);
    const currentPage = Number(url.searchParams.get('currentPage') || 1);

    const pageSize = 20;


    const totalSNI = await prisma.sniData.count({
      where: {
        timestamp: {
          gte: last24Hours.toISOString(),
        },
      },
    });


    const totalPages = Math.ceil(totalSNI / pageSize);


    const skip = (currentPage - 1) * pageSize;
    const sniData = await prisma.sniData.findMany({
      where: {
        timestamp: {
          gte: last24Hours.toISOString(),
        },
      },
      skip: skip,
      take: pageSize,
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        id: true,
        dstIp: true,
        sni: true,
        srcIp: true,
        timestamp: true
      }
    });


    return NextResponse.json({
      data: sniData,
      pagination: {
        currentPage,
        totalPages,
        totalSNI,
      },
    });
  } catch (error) {
    console.error('Veri alırken bir hata oluştu:', error);
    return NextResponse.json({ error: 'Veriler alınırken bir hata oluştu.' }, { status: 500 });
  } finally {
    prisma.$disconnect();
  }
}
