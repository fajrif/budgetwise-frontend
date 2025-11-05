import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Plus, FileText, Trash2, Search, Filter, Users, Pencil } from 'lucide-react';
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

const calculateSLAStatus = (tanggalPO, tanggalTransaksi) => {
  if (!tanggalPO || !tanggalTransaksi) return 'unknown';
  
  const po = new Date(tanggalPO);
  const tx = new Date(tanggalTransaksi);
  
  const endOfPOMonth = new Date(po.getFullYear(), po.getMonth() + 1, 0);
  const endOfNextMonth = new Date(po.getFullYear(), po.getMonth() + 2, 0);
  
  if (tx <= endOfPOMonth) return 'ontime';
  else if (tx <= endOfNextMonth) return 'h+1';
  else return 'late';
};

const getSLALabel = (status) => {
  const labels = {
    'ontime': 'Tepat Waktu',
    'h+1': 'H+1',
    'late': 'Terlambat',
    'unknown': '-'
  };
  return labels[status] || '-';
};

const getSLAColor = (status) => {
  const colors = {
    'ontime': 'text-green-600',
    'h+1': 'text-blue-600',
    'late': 'text-red-600',
    'unknown': 'text-slate-400'
  };
  return colors[status] || 'text-slate-400';
};

const Transactions = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterCostType, setFilterCostType] = useState('all');
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [formData, setFormData] = useState({
    project_id: '',
    tanggal_transaksi: '',
    tanggal_po_tagihan: '',
    bulan_realisasi: '',
    cost_type_id: '',
    deskripsi_realisasi: '',
    jumlah_realisasi: '',
    jumlah_tenaga_kerja: '',
    bukti_transaksi_url: ''
  });

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
    setFormData({
      project_id: '',
      tanggal_transaksi: '',
      tanggal_po_tagihan: '',
      bulan_realisasi: '',
      cost_type_id: '',
      deskripsi_realisasi: '',
      jumlah_realisasi: '',
      jumlah_tenaga_kerja: '',
      bukti_transaksi_url: ''
    });
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      project_id: transaction.project_id || '',
      tanggal_transaksi: transaction.tanggal_transaksi ? transaction.tanggal_transaksi.split('T')[0] : '',
      tanggal_po_tagihan: transaction.tanggal_po_tagihan ? transaction.tanggal_po_tagihan.split('T')[0] : '',
      bulan_realisasi: transaction.bulan_realisasi || '',
      cost_type_id: transaction.cost_type_id || '',
      deskripsi_realisasi: transaction.deskripsi_realisasi || '',
      jumlah_realisasi: transaction.jumlah_realisasi || '',
      jumlah_tenaga_kerja: transaction.jumlah_tenaga_kerja || '',
      bukti_transaksi_url: transaction.bukti_transaksi_url || ''
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedProject = projectsData.projects.find(p => p.id === formData.project_id);
    const selectedCostType = costTypesData.cost_types.find(ct => ct.id === formData.cost_type_id);
    
    const jumlahRealisasi = parseFloat(formData.jumlah_realisasi);
    const tarifManFee = selectedProject?.tarif_management_fee_persen || 0;
    const nilaiManFee = (tarifManFee / 100) * jumlahRealisasi;
    
    const data = {
      project_id: formData.project_id,
      no_sp2k: selectedProject?.no_sp2k || '',
      tanggal_transaksi: formData.tanggal_transaksi,
      tanggal_po_tagihan: formData.tanggal_po_tagihan || null,
      bulan_realisasi: formData.bulan_realisasi,
      cost_type_id: formData.cost_type_id,
      jenis_biaya_name: selectedCostType?.nama_biaya || '',
      deskripsi_realisasi: formData.deskripsi_realisasi,
      jumlah_realisasi: jumlahRealisasi,
      persentase_management_fee: tarifManFee,
      nilai_management_fee: nilaiManFee,
      jumlah_tenaga_kerja: formData.jumlah_tenaga_kerja ? parseInt(formData.jumlah_tenaga_kerja) : 0,
      bukti_transaksi_url: formData.bukti_transaksi_url
    };

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
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Transaksi</h1>
            <p className="text-slate-500 mt-1">Kelola semua realisasi anggaran</p>
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
                <Label className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter Proyek
                </Label>
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
                <Label className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter Jenis Biaya
                </Label>
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
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-bold">Daftar Transaksi</CardTitle>
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
                      <TableHead className="text-right">Realisasi</TableHead>
                      <TableHead className="text-right">Man Fee</TableHead>
                      <TableHead className="text-center">SLA</TableHead>
                      <TableHead className="w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => {
                      const project = projectsData.projects.find(p => p.id === tx.project_id);
                      const slaStatus = calculateSLAStatus(tx.tanggal_po_tagihan, tx.tanggal_transaksi);
                      
                      return (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {tx.tanggal_transaksi && format(new Date(tx.tanggal_transaksi), 'dd MMM yyyy', { locale: id })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{project?.judul_pekerjaan || '-'}</p>
                              <p className="text-xs text-slate-500">{tx.no_sp2k}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {tx.jenis_biaya_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {tx.deskripsi_realisasi}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatRupiah(tx.jumlah_realisasi)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-purple-600">
                            {formatRupiah(tx.nilai_management_fee || 0)}
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
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Proyek *</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(val) => setFormData({ ...formData, project_id: val })}
                  required
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal PO/Tagihan</Label>
                  <Input
                    type="date"
                    value={formData.tanggal_po_tagihan}
                    onChange={(e) => setFormData({ ...formData, tanggal_po_tagihan: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Transaksi *</Label>
                  <Input
                    type="date"
                    value={formData.tanggal_transaksi}
                    onChange={(e) => {
                      const date = e.target.value;
                      const bulan = date.substring(0, 7);
                      setFormData({ ...formData, tanggal_transaksi: date, bulan_realisasi: bulan });
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Jenis Biaya *</Label>
                <Select
                  value={formData.cost_type_id}
                  onValueChange={(val) => setFormData({ ...formData, cost_type_id: val })}
                  required
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
              </div>

              <div className="space-y-2">
                <Label>Deskripsi *</Label>
                <Textarea
                  value={formData.deskripsi_realisasi}
                  onChange={(e) => setFormData({ ...formData, deskripsi_realisasi: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Jumlah Realisasi (Rp) *</Label>
                <Input
                  type="number"
                  value={formData.jumlah_realisasi}
                  onChange={(e) => setFormData({ ...formData, jumlah_realisasi: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Jumlah Tenaga Kerja</Label>
                <Input
                  type="number"
                  value={formData.jumlah_tenaga_kerja}
                  onChange={(e) => setFormData({ ...formData, jumlah_tenaga_kerja: e.target.value })}
                />
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
