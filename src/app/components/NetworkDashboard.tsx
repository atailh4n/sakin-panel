/*
 * MIT License
 * Copyright (c) 2025 Ata İlhan Köktürk
 */

'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { groupDataByHour } from '@/utils/formatData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function NetworkDashboard() {
  const [last24ActivityData, setLast24ActivityData] = useState<any[]>([]); // Adjusted for an array
  const [sniData, setSniData] = useState<any>({ data: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch last-24-activity data (only once)
  const fetchLast24ActivityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/last-24-activity`);
      const result = await response.json();

      if (!result || !Array.isArray(result)) {
        setMessage('No activity data found.');
      } else {
        setLast24ActivityData(result);
      }
    } catch (error) {
      console.error('Error fetching last 24 activity data:', error);
      setMessage('Error fetching last 24 activity data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch SNI data
  const fetchSniData = async () => {
    try {
      const response = await fetch(`/api/sni-data?currentPage=${currentPage}`);
      const result = await response.json();

      if (!result || !result.data || !result.pagination) {
        setMessage('No SNI data found.');
      } else {
        setSniData(result);
      }
    } catch (error) {
      console.error('Error fetching SNI data:', error);
      setMessage('Error fetching SNI data. Please try again later.');
    }
  };

  // Fetch both the last-24-activity data and SNI data on first load and when page changes
  useEffect(() => {
    if (last24ActivityData.length === 0) {
      fetchLast24ActivityData();
    }
    fetchSniData();
  }, [currentPage]);

  const hourLabels = last24ActivityData.length > 0
    ? last24ActivityData.map((entry) => `${entry.hour}:00`)
    : Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Chart data preparation for last-24-activity (Network Activity)
  const last24ActivityChartData = {
    labels: hourLabels,
    datasets: [
      {
        label: 'Packet Count',
        data: groupDataByHour(last24ActivityData).map((d) => d.Packet), // Ensure groupDataByHour handles last24ActivityData correctly
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Chart data preparation for SNI (Network Activity by SNI)
  const sniChartData = {
    labels: hourLabels,
    datasets: [
      {
        label: 'SNI Count',
        data: groupDataByHour(last24ActivityData).map((d) => d.SNI), // Assuming groupDataByHour works similarly for sniData.data
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Pagination controls
  const totalSniPages = sniData?.pagination?.totalPages > 0 ? sniData.pagination.totalPages : 1;

  // Loading state or error message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-gray-700 dark:text-gray-300">
        Loading data...
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 p-4 dark:bg-gray-900 dark:text-white">
      {message && (
        <Alert className="md:col-span-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200">
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Last 24 Activity Chart */}
      <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Network Activity (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={last24ActivityChartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* SNI Activity Chart */}
      <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>SNI Activity (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={sniChartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* Recent SNI Entries Table */}
      <Card className="md:col-span-2 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Recent SNI Entries (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-separate border-spacing-0 dark:text-white">
              <thead>
                <tr className="border-b dark:border-gray-600">
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">SNI</th>
                  <th className="px-4 py-2 text-left">Source IP</th>
                  <th className="px-4 py-2 text-left">Destination IP</th>
                </tr>
              </thead>
              <tbody>
                {sniData.data.map((entry: any) => (
                  <tr key={entry.id} className="border-b dark:border-gray-600">
                    <td className="px-4 py-2">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2">{entry.sni}</td>
                    <td className="px-4 py-2">{entry.srcIp}</td>
                    <td className="px-4 py-2">{entry.dstIp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for SNI Entries */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalSniPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalSniPages))}
              disabled={currentPage === totalSniPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
