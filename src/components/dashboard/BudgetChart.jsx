import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { parseISO } from 'date-fns';
import { formatRupiah, formatDate } from '@/utils/formatters';

const BudgetChart = ({ budgetData, transactionData }) => {

  const prepareMonthlyData = () => {
    const monthlyMap = {};

    // Sum up budget by month
    budgetData.forEach(item => {
      if (!item.periode_bulan) return;

      if (!monthlyMap[item.periode_bulan]) {
        monthlyMap[item.periode_bulan] = {
          month: item.periode_bulan,
          anggaran: 0,
          realisasi: 0
        };
      }

      if (item.is_parent || !item.parent_budget_id) {
        monthlyMap[item.periode_bulan].anggaran += item.total_anggaran || item.jumlah_anggaran || 0;
      }
    });

    // Sum up transactions by month
    transactionData.forEach(tx => {
      if (tx.bulan_realisasi) {
        if (!monthlyMap[tx.bulan_realisasi]) {
          monthlyMap[tx.bulan_realisasi] = {
            month: tx.bulan_realisasi,
            anggaran: 0,
            realisasi: 0
          };
        }
        monthlyMap[tx.bulan_realisasi].realisasi += tx.jumlah_realisasi || 0;
      }
    });

    const sortedData = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    return sortedData.map(item => ({
      month: formatDate(parseISO(item.month + '-01'), 'MMM yy'),
      'Anggaran (Juta)': Math.round(item.anggaran / 1000000),
      'Realisasi (Juta)': Math.round(item.realisasi / 1000000),
      anggaranRaw: item.anggaran,
      realisasiRaw: item.realisasi
    }));
  };

  const chartData = prepareMonthlyData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-1">{payload[0].payload.month}</p>
          <p className="text-sm text-blue-600">
            Anggaran: {formatRupiah(payload[0].payload.anggaranRaw)}
          </p>
          <p className="text-sm text-green-600">
            Realisasi: {formatRupiah(payload[0].payload.realisasiRaw)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">
          Trend Anggaran vs Realisasi
        </CardTitle>
        <p className="text-sm text-slate-500">Perbandingan bulanan (dalam jutaan rupiah)</p>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              label={{ value: 'Jutaan Rupiah', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
            <Bar dataKey="Anggaran (Juta)" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Realisasi (Juta)" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BudgetChart;
