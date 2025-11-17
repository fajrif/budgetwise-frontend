import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Building2, Calendar, ExternalLink, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStatusColor } from '@/utils/ProjectHelper';
import { formatRupiah, formatDate } from '@/utils/formatters';

const ProjectCard = ({ project, transactions, onEdit }) => {
  const navigate = useNavigate();

  const actual = transactions
    .filter(t => t.project_id === project.id)
    .reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);

  const budget = project.nilai_pekerjaan - actual;

  const percentage = budget > 0 ? (actual / project.nilai_pekerjaan) * 100 : 0;

  return (
    <Card className="hover:shadow-xl transition-all">
      <div className={`h-2 ${percentage >= 90 ? 'bg-red-500' : percentage >= 80 ? 'bg-orange-500' : 'bg-green-500'}`} />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
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
            <span>{project.client_details?.name || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{project.tanggal_mulai ? formatDate(project.tanggal_mulai) : '-'} - {project.tanggal_selesai ? formatDate(project.tanggal_selesai) : '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatRupiah(project.nilai_pekerjaan)}</span>
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
            <span className={ actual > 0 ? percentage >= 90 ? 'text-red-500' : percentage >= 80 ? 'text-orange-500' : 'text-green-500' : ''}>{formatRupiah(budget)}</span>
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
