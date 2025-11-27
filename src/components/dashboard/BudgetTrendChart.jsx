import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO, startOfMonth, eachMonthOfInterval } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah } from "@/utils/formatters";

export default function BudgetTrendChart({ project, budgetItems, transactions }) {
  // Generate monthly data
  const generateMonthlyData = () => {
    if (!project?.tanggal_mulai || !project?.jangka_waktu) return [];

    const startDate = parseISO(project.tanggal_mulai);
    const months = eachMonthOfInterval({
      start: startDate,
      end: new Date(startDate.getFullYear(), startDate.getMonth() + project.jangka_waktu - 1, 1)
    });

    return months.map(month => {
      const periodeBulan = format(month, 'yyyy-MM');

      // Get budget for this month
      const monthlyBudgets = budgetItems.filter(b =>
        !b.is_parent && b.periode_bulan === periodeBulan
      );
      const totalBudget = monthlyBudgets.reduce((sum, b) => sum + (b.jumlah_anggaran || 0), 0);

      // Get actual spending for this month
      const monthlyTransactions = transactions.filter(t => t.bulan_realisasi === periodeBulan);
      const totalActual = monthlyTransactions.reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);

      return {
        bulan: format(month, 'MMM yy', { locale: id }),
        anggaran: totalBudget / 1000000, // Convert to millions
        realisasi: totalActual / 1000000,
        variance: (totalBudget - totalActual) / 1000000
      };
    });
  };

  const monthlyData = generateMonthlyData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length >= 2) {
      const bulan = payload[0]?.payload?.bulan || '';
      const anggaran = payload[0]?.value || 0;
      const realisasi = payload[1]?.value || 0;
      const variance = anggaran - realisasi;

      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{bulan}</p>
          <p className="text-sm text-blue-600">
            Anggaran: {formatRupiah(anggaran * 1000000)}
          </p>
          <p className="text-sm text-green-600">
            Realisasi: {formatRupiah(realisasi * 1000000)}
          </p>
          <p className={`text-sm ${variance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
            Variance: {formatRupiah(variance * 1000000)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold">Trend Anggaran vs Realisasi</CardTitle>
        <p className="text-sm text-slate-500">Perbandingan anggaran dan realisasi per bulan (dalam juta rupiah)</p>
      </CardHeader>
      <CardContent className="pt-6">
        {monthlyData.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Belum ada data untuk ditampilkan
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="bulan"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#e2e8f0' }}
                label={{ value: 'Jutaan (Rp)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar
                dataKey="anggaran"
                fill="#3b82f6"
                name="Anggaran"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="realisasi"
                fill="#10b981"
                name="Realisasi"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
