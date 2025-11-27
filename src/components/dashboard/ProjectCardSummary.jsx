import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Progress } from '../ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Percent } from "lucide-react";
import { formatRupiah, formatRupiahShort } from '@/utils/formatters';
import { getColorClasses } from '@/utils/ProjectHelper';

const ProjectCardSummary = ({ project, transactions }) => {

  const totalActual = transactions.reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);
  const totalBudget = project.nilai_pekerjaan || 0;
  const percentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalActual;

  const stats = [
    {
      title: "Total Anggaran",
      value: formatRupiahShort(totalBudget),
      fullValue: formatRupiah(totalBudget),
      icon: DollarSign,
      color: "blue",
      percentage: null
    },
    {
      title: "Total Realisasi",
      value: formatRupiahShort(totalActual),
      fullValue: formatRupiah(totalActual),
      icon: TrendingUp,
      color: "green",
      percentage: null
    },
    {
      title: "Sisa Anggaran",
      value: formatRupiahShort(remaining),
      fullValue: formatRupiah(remaining),
      icon: TrendingDown,
      color: "orange",
      percentage: null
    },
    {
      title: "Penyerapan",
      value: percentage.toFixed(0) + '%',
      fullValue: null,
      icon: Percent,
      color: "blue",
      percentage: percentage
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
            <CardContent className="p-0">
              <div className="p-6 relative">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getColorClasses(stat.color)} opacity-10 rounded-bl-full`} />
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-4">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform">
                      {stat.value}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{stat.fullValue}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(stat.color)} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>

                {stat.percentage && (
                  <Progress value={stat.percentage} className="h-2 mt-2" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

};

export default ProjectCardSummary;
