import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AlertsWidget = ({ alertProjects, budgetData, transactionData }) => {
  const navigate = useNavigate();

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader className="border-b border-orange-100">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Alert Anggaran
        </CardTitle>
        <p className="text-sm text-slate-600">Proyek dengan penyerapan &gt; 80%</p>
      </CardHeader>
      <CardContent className="pt-6">
        {alertProjects.length === 0 ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Semua proyek dalam kondisi baik. Tidak ada alert anggaran saat ini.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {alertProjects.map((project) => {
              const projectBudgetItems = budgetData.filter(b => b.project_id === project.id);
              const budget = projectBudgetItems
                .filter(b => b.is_parent || !b.parent_budget_id)
                .reduce((sum, b) => sum + (b.total_anggaran || b.jumlah_anggaran || 0), 0);

              const actual = transactionData
                .filter(t => t.project_id === project.id)
                .reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);

              const percentage = budget > 0 ? (actual / budget) * 100 : 0;
              const remaining = budget - actual;

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="cursor-pointer"
                >
                  <Alert className={`hover:shadow-md transition-shadow ${
                    percentage >= 90 ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      percentage >= 90 ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <AlertDescription>
                      <div className="font-semibold text-slate-900 mb-1">
                        {project.judul_pekerjaan}
                      </div>
                      <div className="text-sm text-slate-700">
                        <span className={`font-bold ${
                          percentage >= 90 ? 'text-red-700' : 'text-orange-700'
                        }`}>
                          {percentage.toFixed(1)}%
                        </span> dari anggaran telah terserap
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Sisa: {formatRupiah(remaining)}
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;
