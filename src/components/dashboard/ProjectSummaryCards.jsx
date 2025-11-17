import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Wallet, TrendingUp, AlertCircle, FolderKanban } from 'lucide-react';
import { formatRupiah } from '@/utils/formatters';

const ProjectSummaryCards = ({ metrics, isLoading }) => {
  const cards = [
    {
      title: 'Total Anggaran',
      value: formatRupiah(metrics.totalBudget),
      icon: Wallet,
      bgColor: 'bg-blue-500',
      trend: `${metrics.totalProjects} proyek`,
      trendColor: 'text-blue-600'
    },
    {
      title: 'Total Realisasi',
      value: formatRupiah(metrics.totalActual),
      icon: TrendingUp,
      bgColor: 'bg-green-500',
      trend: `${metrics.percentage.toFixed(1)}% terserap`,
      trendColor: metrics.percentage > 80 ? 'text-orange-600' : 'text-green-600'
    },
    {
      title: 'Sisa Anggaran',
      value: formatRupiah(metrics.remaining),
      icon: FolderKanban,
      bgColor: 'bg-purple-500',
      trend: `${metrics.activeProjects} proyek aktif`,
      trendColor: 'text-purple-600'
    },
    {
      title: 'Alert Anggaran',
      value: metrics.alertCount,
      icon: AlertCircle,
      bgColor: 'bg-orange-500',
      trend: metrics.alertCount > 0 ? 'Perlu perhatian' : 'Semua aman',
      trendColor: metrics.alertCount > 0 ? 'text-orange-600' : 'text-green-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-none shadow-md animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${card.bgColor} rounded-full opacity-10`} />
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${card.bgColor} bg-opacity-20`}>
                <card.icon className={`w-5 h-5 ${card.bgColor.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {card.value}
            </div>
            <p className={`text-sm font-medium ${card.trendColor}`}>
              {card.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectSummaryCards;
