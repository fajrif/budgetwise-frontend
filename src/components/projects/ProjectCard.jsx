import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Building2, Calendar, DollarSign, ExternalLink, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ProjectCard = ({ project, budgetData, transactionData, onEdit }) => {
  const navigate = useNavigate();

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const projectBudgetItems = budgetData.filter(b => b.project_id === project.id);
  const budget = projectBudgetItems
    .filter(b => b.is_parent || !b.parent_budget_id)
    .reduce((sum, b) => sum + (b.total_anggaran || b.jumlah_anggaran || 0), 0);

  const actual = transactionData
    .filter(t => t.project_id === project.id)
    .reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);

  const percentage = budget > 0 ? (actual / budget) * 100 : 0;

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      'Non Aktif': 'bg-slate-100 text-slate-800',
    };
    return colors[status] || colors['Non Aktif'];
  };

  return (
    <Card className="hover:shadow-xl transition-all">
      <div className={`h-2 ${percentage >= 90 ? 'bg-red-500' : percentage >= 80 ? 'bg-orange-500' : 'bg-green-500'}`} />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge className={getStatusColor(project.status_kontrak)}>{project.status_kontrak}</Badge>
          <Button variant="ghost" size="icon" onClick={() => onEdit(project)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
        <CardTitle className="text-lg">{project.judul_pekerjaan}</CardTitle>
        <p className="text-sm text-slate-500">SP2K: {project.no_sp2k}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>{project.client || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{project.tanggal_mulai ? format(new Date(project.tanggal_mulai), 'dd MMM yyyy') : '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>{formatRupiah(project.nilai_pekerjaan)}</span>
          </div>
        </div>

        <div className="pt-3 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span>Penyerapan</span>
            <span className="font-semibold">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{formatRupiah(actual)}</span>
            <span>{formatRupiah(budget)}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          Lihat Detail
          <ExternalLink className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
