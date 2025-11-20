import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Percent } from "lucide-react";
import { formatRupiah, formatRupiahShort } from "@/utils/formatters";

export default function ProjectStats({ project, budgetItems, transactions }) {
  // Calculate statistics
  const totalBudgetAllocated = budgetItems
    .filter(b => b.is_parent)
    .reduce((sum, b) => sum + (b.total_anggaran || 0), 0);

  const totalRealization = transactions.reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);

  const totalMgmtFee = transactions.reduce((sum, t) => sum + (t.nilai_management_fee || 0), 0);

  const avgMonthlySpend = project?.jangka_waktu
    ? totalRealization / project.jangka_waktu
    : 0;

  const utilizationRate = totalBudgetAllocated > 0
    ? (totalRealization / totalBudgetAllocated * 100)
    : 0;

  const stats = [
    {
      title: "Total Anggaran Dialokasikan",
      value: formatRupiahShort(totalBudgetAllocated),
      fullValue: formatRupiah(totalBudgetAllocated),
      icon: DollarSign,
      color: "blue",
      trend: null
    },
    {
      title: "Total Realisasi",
      value: formatRupiahShort(totalRealization),
      fullValue: formatRupiah(totalRealization),
      icon: TrendingUp,
      color: "green",
      trend: utilizationRate >= 80 ? "high" : "normal"
    },
    {
      title: "Management Fee Terkumpul",
      value: formatRupiahShort(totalMgmtFee),
      fullValue: formatRupiah(totalMgmtFee),
      icon: Percent,
      color: "purple",
      trend: null
    },
    {
      title: "Rata-rata Pengeluaran/Bulan",
      value: formatRupiahShort(avgMonthlySpend),
      fullValue: formatRupiah(avgMonthlySpend),
      icon: Calendar,
      color: "orange",
      trend: null
    },
    {
      title: "Tingkat Utilisasi",
      value: `${utilizationRate.toFixed(1)}%`,
      fullValue: `${utilizationRate.toFixed(2)}% dari anggaran terpakai`,
      icon: TrendingUp,
      color: utilizationRate >= 90 ? "red" : utilizationRate >= 80 ? "orange" : "green",
      trend: utilizationRate >= 80 ? "high" : "normal"
    },
    {
      title: "Jumlah Transaksi",
      value: transactions.length,
      fullValue: `${transactions.length} transaksi tercatat`,
      icon: Users,
      color: "indigo",
      trend: null
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 shadow-blue-200",
      green: "from-green-500 to-green-600 shadow-green-200",
      purple: "from-purple-500 to-purple-600 shadow-purple-200",
      orange: "from-orange-500 to-orange-600 shadow-orange-200",
      red: "from-red-500 to-red-600 shadow-red-200",
      indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
            <CardContent className="p-0">
              <div className="p-6 relative">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getColorClasses(stat.color)} opacity-10 rounded-bl-full`} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform">
                      {stat.value}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{stat.fullValue}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(stat.color)} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>

                {stat.trend && (
                  <div className="flex items-center gap-1 text-xs">
                    {stat.trend === "high" ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-red-500" />
                        <span className="text-red-600 font-medium">Tinggi</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 font-medium">Normal</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
