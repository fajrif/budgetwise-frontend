import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Trash2, Search, Filter, Users, Pencil, Eye } from 'lucide-react';
import { getSLALabel, getSLAColor, getSLABgColor, calculateSLAStatus, formatRupiah, formatDate } from '@/utils/formatters';
import ViewTransactionDialog from '@/components/dialogs/ViewTransactionDialog';
import AddEditTransactionDialog from '@/components/dialogs/AddEditTransactionDialog';

const Transactions = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterCostType, setFilterCostType] = useState('all');

  const { data: projectsData = { projects: [] } } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    }
  });

  const { data: transactionsData = { transactions: [] }, isLoading } = useQuery({
    queryKey: ['transactions', searchTerm, filterProject, filterCostType],
    queryFn: async () => {
      const response = await api.get('/transactions', {
        params: {
          search: searchTerm,
          project_id: filterProject === "all" ? null : filterProject,
          cost_stype_id: filterCostType === "all" ? null : filterCostType,
        },
      });
      return response.data;
    },
    enabled: searchTerm.length === 0 || searchTerm.length >= 3,
    placeholderData: keepPreviousData,
  });

  const { data: costTypesData = { cost_types: [] } } = useQuery({
    queryKey: ['costTypes'],
    queryFn: async () => {
      const response = await api.get('/cost-types');
      return response.data;
    }
  });

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowDialog(true);
  };

  const handleViewTransaction = (transaction) => {
    setViewingTransaction(transaction);
    setShowViewDialog(true);
  };

  const finishSubmit = (isQuery=true) => {
    if(isQuery) {
      queryClient.invalidateQueries(['transactions']);
    }
    setShowDialog(false);
    setEditingTransaction(null);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
    }
  });

  const totalRealisasi = transactionsData.transactions.reduce((sum, tx) => sum + (tx.jumlah_realisasi || 0), 0);
  const totalManFee = transactionsData.transactions.reduce((sum, tx) => sum + (tx.nilai_management_fee || 0), 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
            <p className="text-slate-500 font-normal mt-1">Kelola semua realisasi anggaran</p>
          </div>
          <Button
            onClick={() => {
              setShowDialog(true);
            }}
            className="bg-green-600 hover:bg-green-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Transaksi
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Total Realisasi</p>
              <p className="text-2xl font-bold text-green-700">
                {formatRupiah(totalRealisasi)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Total Management Fee</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatRupiah(totalManFee)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Total Transaksi</p>
              <p className="text-2xl font-bold text-slate-900">
                {transactionsData.transactions.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <Label className="text-sm text-slate-600 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter Transaksi
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Proyek</SelectItem>
                    {projectsData.projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.judul_pekerjaan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <Select value={filterCostType} onValueChange={setFilterCostType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis Biaya</SelectItem>
                    {costTypesData.cost_types.map(ct => (
                      <SelectItem key={ct.id} value={ct.id}>
                        {ct.nama_biaya}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100 py-4">
            <CardTitle className="text-lg font-medium">Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : transactionsData.transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada transaksi
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Proyek</TableHead>
                      <TableHead className="text-center">Jenis Biaya</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-start">Realisasi</TableHead>
                      <TableHead className="text-center">SLA</TableHead>
                      <TableHead className="text-center w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.transactions.map((tx) => {
                      const slaStatus = calculateSLAStatus(tx.tanggal_po_tagihan, tx.tanggal_transaksi);

                      return (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {tx.tanggal_transaksi && formatDate(tx.tanggal_transaksi)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{tx.project_details?.judul_pekerjaan || '-'}</p>
                              <p className="text-xs text-slate-500">No.SP2K: {tx.project_details?.no_sp2k}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip content={tx.cost_type_details.nama_biaya}>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {tx.cost_type_details.kode}
                              </Badge>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {tx.deskripsi_realisasi}
                          </TableCell>
                          <TableCell className="text-start font-semibold">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-green-500">
                                {formatRupiah(tx.jumlah_realisasi)}
                              </span>
                              <span className="text-xs text-purple-500">
                                Fee: {formatRupiah(tx.nilai_management_fee || 0)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="larger" className={getSLABgColor(slaStatus)}>
                              {getSLALabel(slaStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewTransaction(tx)}
                                className="text-indigo-500 hover:text-indigo-700"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(tx)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Yakin ingin menghapus?')) {
                                    deleteMutation.mutate(tx.id);
                                  }
                                }}
                                className="text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Transaction Dialog */}
      <ViewTransactionDialog
          isOpen={showViewDialog}
          onClose={() => {
            setShowViewDialog(false);
            setViewingTransaction(null);
          }}
          transaction={viewingTransaction}
          onEdit={() => {
            setShowDialog(false);
            handleEdit(viewingTransaction);
          }}
        />

      {/* Transaction Form Dialog */}
      <AddEditTransactionDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        transaction={editingTransaction}
        onFinish={finishSubmit}
        />
    </div>
  );
};

export default Transactions;
