/*
 * MIT License
 * Copyright (c) 2025 Ata İlhan Köktürk
 */

export function groupDataByHour(data: any[]) {
  if (!data || data.length === 0) {
    console.warn("Data is empty or undefined");
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      SNI: 0,
      Packet: 0
    }));
  }

  const grouped = data.reduce((acc, curr) => {
    const hour = curr.hour;
    if (curr.err === 1) {
      return acc;
    }

    if (!acc[hour]) {
      acc[hour] = {
        hour: hour,
        SNI: 0,
        Packet: 0
      };
    }

    acc[hour].SNI += curr.SNI;
    acc[hour].Packet += curr.Packet;

    return acc;
  }, {});

  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    SNI: grouped[i]?.SNI || 0,
    Packet: grouped[i]?.Packet || 0
  }));
}

export function formatIPAddress(ip: string) {
  return ip.padStart(15, ' ');
}