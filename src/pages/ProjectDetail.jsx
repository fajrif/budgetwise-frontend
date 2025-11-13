import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getStatusColor } from '@/utils/ProjectHelper';

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId
  });

  const { data: transactionsData = { transactions: [] } } = useQuery({
    queryKey: ['transactions', projectId],
    queryFn: async () => {
      const response = await api.get(`/transactions?project_id=${projectId}`);
      return response.data;
    },
    enabled: !!projectId
  });

  if (!projectId) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Project ID tidak ditemukan</p>
        <Button className="mt-4" onClick={() => navigate('/projects')}>
          Kembali ke Daftar Proyek
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const project = projectsData?.project;

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Proyek tidak ditemukan</p>
        <Button className="mt-4" onClick={() => navigate('/projects')}>
          Kembali ke Daftar Proyek
        </Button>
      </div>
    );
  }

  const totalActual = transactionsData.transactions.reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);
  const totalBudget = project.nilai_pekerjaan || 0;
  const percentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalActual;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{project.judul_pekerjaan}</h1>
            <p className="text-slate-500">SP2K: {project.no_sp2k}</p>
          </div>
          <Badge className={`${getStatusColor(project.status_kontrak)} text-sm py-2 px-4 ml-auto`}>{project.status_kontrak}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Anggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupiah(totalBudget)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Realisasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatRupiah(totalActual)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sisa Anggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatRupiah(remaining)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Penyerapan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{percentage.toFixed(1)}%</div>
              <Progress value={percentage} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Informasi Proyek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500">Client</p>
                <p className="font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {project.client || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">PIC Client</p>
                <p className="font-medium">{project.pic_client || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tanggal Mulai</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {project.tanggal_mulai && format(new Date(project.tanggal_mulai), 'dd MMM yyyy', { locale: id })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Jangka Waktu</p>
                <p className="font-medium">{project.jangka_waktu || 0} Bulan</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Nilai Pekerjaan</p>
                <p className="font-medium flex items-center gap-2">
                  {formatRupiah(project.nilai_pekerjaan)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Jenis Kontrak</p>
                <p className="font-medium">{project.jenis_kontrak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;
