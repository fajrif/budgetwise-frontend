import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectList = ({ projects, budgetData, transactionData, isLoading }) => {
  const navigate = useNavigate();

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProjectMetrics = (project) => {
    const projectBudgetItems = budgetData.filter(b => b.project_id === project.id);
    const budget = projectBudgetItems
      .filter(b => b.is_parent || !b.parent_budget_id)
      .reduce((sum, b) => sum + (b.total_anggaran || b.jumlah_anggaran || 0), 0);

    const actual = transactionData
      .filter(t => t.project_id === project.id)
      .reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);

    const percentage = budget > 0 ? (actual / budget) * 100 : 0;

    return { budget, actual, percentage };
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Non Aktif': 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colors[status] || colors['Non Aktif'];
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-slate-200 rounded animate-pulse"></div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">
          Daftar Proyek
        </CardTitle>
        <p className="text-sm text-slate-500">Status anggaran per proyek</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Belum ada proyek.</p>
            </div>
          ) : (
            projects.slice(0, 5).map((project) => {
              const metrics = getProjectMetrics(project);
              return (
                <div key={project.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{project.judul_pekerjaan}</h3>
                        {metrics.percentage > 80 && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500">SP2K: {project.no_sp2k}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(project.status_kontrak)}>
                      {project.status_kontrak}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Anggaran: {formatRupiah(metrics.budget)}</span>
                      <span className="text-slate-600">Realisasi: {formatRupiah(metrics.actual)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Penyerapan</span>
                        <span className={`font-semibold ${
                          metrics.percentage >= 90 ? 'text-red-600' :
                          metrics.percentage >= 80 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {metrics.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={metrics.percentage}
                        className="h-2"
                        indicatorClassName={getProgressColor(metrics.percentage)}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      Lihat Detail
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {projects.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/projects')}>
              Lihat Semua Proyek
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectList;
