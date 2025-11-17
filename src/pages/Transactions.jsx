import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Tooltip } from '../components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Plus, FileText, Trash2, Search, Filter, Users, Pencil } from 'lucide-react';
import { getSLALabel, getSLAColor, calculateSLAStatus, formatRupiah, formatDate } from '@/utils/formatters';
import { transactionSchema } from "@/utils/validations";

const Transactions = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterCostType, setFilterCostType] = useState('all');
  const [uploadingFile, setUploadingFile] = useState(false);

  const initialData = {
    project_id: '',
    tanggal_transaksi: '',
    tanggal_po_tagihan: '',
    cost_type_id: '',
    deskripsi_realisasi: '',
    jumlah_tenaga_kerja: '',
    bukti_transaksi_url: ''
  }

  // --- React Hook Form Setup ---
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: editingTransaction || initialData
  });

  useEffect(() => {
    if (editingTransaction) {
      const formattedData = {
        ...editingTransaction,
        tanggal_transaksi: editingTransaction.tanggal_transaksi ? editingTransaction.tanggal_transaksi.split('T')[0] : '',
        tanggal_po_tagihan: editingTransaction.tanggal_po_tagihan ? editingTransaction.tanggal_po_tagihan.split('T')[0] : '',
      };

      reset(formattedData);
    }
  }, [editingTransaction, reset]);

  const { data: projectsData = { projects: [] } } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    }
  });

  const { data: transactionsData = { transactions: [] }, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/transactions');
      return response.data;
    }
  });

  const { data: costTypesData = { cost_types: [] } } = useQuery({
    queryKey: ['costTypes'],
    queryFn: async () => {
      const response = await api.get('/cost-types');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/transactions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/transactions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
    }
  });

  const resetForm = () => {
    reset(initialData);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowDialog(true);
  };

  const onHandleSubmit = async (data) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredTransactions = transactionsData.transactions.filter(tx => {
    const project = projectsData.projects.find(p => p.id === tx.project_id);
    const matchSearch = tx.deskripsi_realisasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.jenis_biaya_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.judul_pekerjaan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.no_sp2k?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchProject = filterProject === "all" || tx.project_id === filterProject;
    const matchCostType = filterCostType === "all" || tx.cost_type_id === filterCostType;

    return matchSearch && matchProject && matchCostType;
  });

  const totalRealisasi = filteredTransactions.reduce((sum, tx) => sum + (tx.jumlah_realisasi || 0), 0);
  const totalManFee = filteredTransactions.reduce((sum, tx) => sum + (tx.nilai_management_fee || 0), 0);

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
              resetForm();
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
                {filteredTransactions.length}
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
            ) : filteredTransactions.length === 0 ? (
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
                      <TableHead>Jenis Biaya</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-start">Realisasi</TableHead>
                      <TableHead className="text-center">SLA</TableHead>
                      <TableHead className="w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => {
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
                            <span className={`text-sm font-medium ${getSLAColor(slaStatus)}`}>
                              {getSLALabel(slaStatus)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
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

      {/* Transaction Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onHandleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Proyek *</Label>
                {/* Use the Controller for your custom Select component */}
                <Controller
                  name="project_id"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    // The render prop passes the necessary onChange and value handlers
                    <Select
                      value={value}
                      onValueChange={onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih proyek" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectsData.projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.judul_pekerjaan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    )}
                  />
                  {errors.project_id && <p className="text-red-500 text-sm">{errors.project_id.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggal_po_tagihan">Tanggal PO/Tagihan</Label>
                  <Input
                    id="tanggal_po_tagihan"
                    type="date"
                    {...register("tanggal_po_tagihan")}
                  />
                  {errors.tanggal_po_tagihan && <p className="text-red-500 text-sm">{errors.tanggal_po_tagihan.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggal_transaksi">Tanggal Transaksi *</Label>
                  <Input
                    id="tanggal_transaksi"
                    type="date"
                    {...register("tanggal_transaksi")}
                  />
                  {errors.tanggal_transaksi && <p className="text-red-500 text-sm">{errors.tanggal_transaksi.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_type_id">Jenis Biaya *</Label>
                <Controller
                  name="cost_type_id"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={value}
                      onValueChange={onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis biaya" />
                      </SelectTrigger>
                      <SelectContent>
                        {costTypesData.cost_types.map((ct) => (
                          <SelectItem key={ct.id} value={ct.id}>
                            {ct.nama_biaya}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cost_type_id && <p className="text-red-500 text-sm">{errors.cost_type_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi_realisasi">Deskripsi *</Label>
                <Textarea
                  id="deskripsi_realisasi"
                  rows={3}
                  {...register("deskripsi_realisasi")}
                />
                {errors.deskripsi_realisasi && <p className="text-red-500 text-sm">{errors.deskripsi_realisasi.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlah_realisasi">Jumlah Realisasi (Rp) *</Label>
                <Input
                  id="jumlah_realisasi"
                  type="number"
                  {...register("jumlah_realisasi", { valueAsNumber: true })}
                />
                {errors.jumlah_realisasi && <p className="text-red-500 text-sm">{errors.jumlah_realisasi.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlah_tenaga_kerja">Jumlah Tenaga Kerja</Label>
                <Input
                  id="jumlah_tenaga_kerja"
                  type="number"
                  {...register("jumlah_tenaga_kerja")}
                />
                {errors.jumlah_tenaga_kerja && <p className="text-red-500 text-sm">{errors.jumlah_tenaga_kerja.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {(createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
