/*
 * MIT License
 * Copyright (c) 2025 Ata İlhan Köktürk
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchHourlyCounts(date: Date) {
    const hourlyCounts = [];
    for (let i = 0; i < 24; i++) {
        const startOfHour = new Date(date);
        startOfHour.setHours(i, 0, 0, 0);
        const endOfHour = new Date(date);
        endOfHour.setHours(i + 1, 0, 0, 0);

        try {
            const [countSNI, countPacket] = await Promise.all([
                prisma.sniData.count({
                    where: {
                        timestamp: {
                            gte: startOfHour.toISOString(),
                            lt: endOfHour.toISOString(),
                        },
                    },
                }),
                prisma.packetData.count({
                    where: {
                        timestamp: {
                            gte: startOfHour.toISOString(),
                            lt: endOfHour.toISOString(),
                        },
                    },
                })
            ]);
            hourlyCounts.push({ hour: startOfHour.getUTCHours(), SNI: countSNI, Packet: countPacket, by: "https://github.com/atailh4n/sakin-panel", err: 0 });
        } catch (error) {
            console.error(`Saat ${startOfHour.getUTCHours()} için hata:`, error);
            hourlyCounts.push({ hour: startOfHour.getUTCHours(), SNI: 0, Packet: 0, by: "https://github.com/atailh4n/sakin-panel", err: 1 });
        }
    }

    return hourlyCounts;
}

export async function GET() {
    try {
        const currentDate = new Date();

        const hourlyCounts = await fetchHourlyCounts(currentDate);

        return NextResponse.json(hourlyCounts);
    } catch (error) {
        console.error('Veri alırken bir hata oluştu:', error);
        return NextResponse.json({ error: 'Veriler alınırken bir hata oluştu.' }, { status: 500 });
    } finally {
        prisma.$disconnect();
    }
}
