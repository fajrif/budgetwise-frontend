import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI, budgetItemsAPI, transactionsAPI } from '../api/endpoints';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Wallet, TrendingUp, AlertCircle, FolderKanban } from 'lucide-react';
import { formatRupiah } from '../components/shared/formatters';

const Dashboard = () => {
  const { data: projectsData = { projects: [] } } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.getAll();
      return response.data;
    },
  });

  const { data: budgetItemsData = { budget_items: [] } } = useQuery({
    queryKey: ['budgetItems'],
    queryFn: async () => {
      const response = await budgetItemsAPI.getAll();
      console.log('Response data:', response.data);
      return response.data;
    },
  });

  const { data: transactionsData = { transactions: [] } } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await transactionsAPI.getAll();
      return response.data;
    },
  });

  const calculateMetrics = () => {
    const totalBudget = budgetItemsData.budget_items
      .filter(b => b.is_parent || !b.parent_budget_id)
      .reduce((sum, item) => sum + (item.total_anggaran || item.jumlah_anggaran || 0), 0);

    const totalActual = transactionsData.transactions.reduce((sum, tx) => sum + (tx.jumlah_realisasi || 0), 0);
    const remaining = totalBudget - totalActual;
    const percentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

    const activeProjects = projectsData.projects.filter(p => p.status_kontrak === 'Active').length;

    const alertProjects = projectsData.projects.filter(project => {
      const projectBudgetItems = budgetItemsData.budget_items.filter(b => b.project_id === project.id);
      const projectBudget = projectBudgetItems
        .filter(b => b.is_parent || !b.parent_budget_id)
        .reduce((sum, b) => sum + (b.total_anggaran || b.jumlah_anggaran || 0), 0);

      const projectActual = transactionsData.transactions
        .filter(t => t.project_id === project.id)
        .reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);

      return projectBudget > 0 && (projectActual / projectBudget) > 0.8;
    });

    return {
      totalBudget,
      totalActual,
      remaining,
      percentage,
      activeProjects,
      totalProjects: projectsData.projects.length,
      alertCount: alertProjects.length,
    };
  };

  const metrics = calculateMetrics();

  const cards = [
    {
      title: "Total Anggaran",
      value: formatRupiah(metrics.totalBudget),
      icon: Wallet,
      bgColor: "bg-blue-500",
      trend: `${metrics.totalProjects} proyek`,
      trendColor: "text-blue-600"
    },
    {
      title: "Total Realisasi",
      value: formatRupiah(metrics.totalActual),
      icon: TrendingUp,
      bgColor: "bg-green-500",
      trend: `${metrics.percentage.toFixed(1)}% terserap`,
      trendColor: metrics.percentage > 80 ? "text-orange-600" : "text-green-600"
    },
    {
      title: "Sisa Anggaran",
      value: formatRupiah(metrics.remaining),
      icon: FolderKanban,
      bgColor: "bg-purple-500",
      trend: `${metrics.activeProjects} proyek aktif`,
      trendColor: "text-purple-600"
    },
    {
      title: "Alert Anggaran",
      value: metrics.alertCount,
      icon: AlertCircle,
      bgColor: "bg-orange-500",
      trend: metrics.alertCount > 0 ? "Perlu perhatian" : "Semua aman",
      trendColor: metrics.alertCount > 0 ? "text-orange-600" : "text-green-600"
    }
  ];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Monitoring Anggaran & Realisasi Proyek</p>
          </div>
          <Link to="/projects">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Proyek Baru
            </Button>
          </Link>
        </div>

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

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Link to="/projects">
              <Button variant="outline">Lihat Semua Proyek</Button>
            </Link>
            <Link to="/transactions">
              <Button variant="outline">Lihat Transaksi</Button>
            </Link>
            <Link to="/master-data">
              <Button variant="outline">Master Data</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
