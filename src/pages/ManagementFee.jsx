import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Lock, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '../components/ui/badge';

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

const ManagementFee = () => {
  const { data: projectsData = { projects: [] } } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    }
  });

  const { data: transactionsData = { transactions: [] } } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/transactions');
      return response.data;
    }
  });

  const calculateManagementFee = () => {
    const feeData = [];

    projectsData.projects.forEach(project => {
      if (!project.tarif_management_fee_persen) return;

      const projectTransactions = transactionsData.transactions.filter(t => t.project_id === project.id);
      
      const monthlyData = projectTransactions.reduce((acc, tx) => {
        if (!tx.bulan_realisasi) return acc;
        
        if (!acc[tx.bulan_realisasi]) {
          acc[tx.bulan_realisasi] = {
            month: tx.bulan_realisasi,
            totalRealisasi: 0,
            transactions: []
          };
        }
        
        acc[tx.bulan_realisasi].totalRealisasi += tx.jumlah_realisasi || 0;
        acc[tx.bulan_realisasi].transactions.push(tx);
        
        return acc;
      }, {});

      Object.values(monthlyData).forEach(data => {
        const manFee = (project.tarif_management_fee_persen / 100) * data.totalRealisasi;
        
        feeData.push({
          projectId: project.id,
          projectName: project.judul_pekerjaan,
          noSp2k: project.no_sp2k,
          month: data.month,
          tarif: project.tarif_management_fee_persen,
          totalRealisasi: data.totalRealisasi,
          managementFee: manFee,
          transactionCount: data.transactions.length
        });
      });
    });

    return feeData.sort((a, b) => b.month.localeCompare(a.month));
  };

  const feeData = calculateManagementFee();
  const totalManFee = feeData.reduce((sum, item) => sum + item.managementFee, 0);
  const totalRealisasi = feeData.reduce((sum, item) => sum + item.totalRealisasi, 0);

  const projectSummary = feeData.reduce((acc, item) => {
    if (!acc[item.projectId]) {
      acc[item.projectId] = {
        projectName: item.projectName,
        noSp2k: item.noSp2k,
        tarif: item.tarif,
        totalRealisasi: 0,
        totalManFee: 0,
        months: []
      };
    }
    acc[item.projectId].totalRealisasi += item.totalRealisasi;
    acc[item.projectId].totalManFee += item.managementFee;
    acc[item.projectId].months.push(item.month);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Management Fee</h1>
            <p className="text-slate-500 mt-1">Perhitungan internal management fee per proyek</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-orange-600">
            <Lock className="w-5 h-5" />
            <span className="font-semibold">Internal Only</span>
          </div>
        </div>

        <Alert className="border-orange-200 bg-orange-50">
          <Lock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>Peringatan:</strong> Data sensitif. Hanya untuk Administrator.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700">Total Management Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {formatRupiah(totalManFee)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">Total Realisasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {formatRupiah(totalRealisasi)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">Jumlah Proyek</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {Object.keys(projectSummary).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-bold">Detail Perhitungan Bulanan</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {feeData.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada data untuk ditampilkan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bulan</TableHead>
                      <TableHead>Proyek</TableHead>
                      <TableHead className="text-center">Tarif</TableHead>
                      <TableHead className="text-right">Total Realisasi</TableHead>
                      <TableHead className="text-right">Management Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {format(new Date(item.month + '-01'), 'MMMM yyyy', { locale: id })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{item.projectName}</p>
                            <p className="text-xs text-slate-500">{item.noSp2k}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-purple-100 text-purple-700">
                            {item.tarif}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatRupiah(item.totalRealisasi)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-purple-600">
                          {formatRupiah(item.managementFee)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagementFee;
