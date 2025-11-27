import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Calendar, User, Plus, Eye, Pencil, Trash2, Upload } from 'lucide-react';
import { formatRupiah, formatDate } from '@/utils/formatters';
import { getStatusColor } from '@/utils/ProjectHelper';
import ProjectStats from "@/components/dashboard/ProjectStats";
import BudgetTrendChart from "@/components/dashboard/BudgetTrendChart";
import PaymentSLAChart from "@/components/dashboard/PaymentSLAChart";
import ProjectCardSummary from '@/components/dashboard/ProjectCardSummary';
import ViewTransactionDialog from '@/components/dialogs/ViewTransactionDialog';
import AddEditTransactionDialog from '@/components/dialogs/AddEditTransactionDialog';


const ProjectDetail = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [expandedBudgets, setExpandedBudgets] = useState({});
  const [budgetForm, setBudgetForm] = useState({
    cost_type_id: '',
    jenis_biaya_name: '',
    kategori_anggaran: 'monthly',
    total_anggaran: '',
    deskripsi_anggaran: ''
  });

  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    tanggal_transaksi: '',
    tanggal_po_tagihan: '',
    bulan_realisasi: '',
    cost_type_id: '',
    deskripsi_realisasi: '',
    jumlah_realisasi: '',
    jumlah_tenaga_kerja: '',
    bukti_transaksi_url: ''
  });


  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId
  });

  const { data: budgetItemsData = { budget_items: [] } } = useQuery({
    queryKey: ['budgetItems', projectId],
    queryFn: async () => {
      const response = await api.get(`/budget-items?project_id=${projectId}`);
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

  const { data: costTypesData = { cost_types: [] } } = useQuery({
    queryKey: ['costTypes'],
    queryFn: () => base44.entities.CostType.list(),
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (budgets) => {
      const results = await Promise.all(
        budgets.map(budget => base44.entities.BudgetItem.create(budget))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budgetItems']);
      setShowBudgetDialog(false);
      resetBudgetForm();
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ parentId, data }) => {
      // Update parent
      await base44.entities.BudgetItem.update(parentId, data);

      // If monthly, update all children descriptions and amounts
      if (data.kategori_anggaran === 'monthly') {
        const children = budgetItems.filter(b => b.parent_budget_id === parentId);
        const jangkaWaktu = project?.jangka_waktu || 12;
        const anggaranPerBulan = data.total_anggaran / jangkaWaktu;

        await Promise.all(
          children.map((child, index) =>
            base44.entities.BudgetItem.update(child.id, {
              deskripsi_anggaran: `${data.deskripsi_anggaran} - Bulan ${index + 1}`,
              jenis_biaya_name: data.jenis_biaya_name,
              total_anggaran: data.total_anggaran,
              jumlah_anggaran: anggaranPerBulan
            })
          )
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budgetItems']);
      setShowBudgetDialog(false);
      setEditingBudget(null);
      resetBudgetForm();
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (parentId) => {
      // Delete parent and all children
      const itemsToDelete = budgetItems.filter(
        b => b.id === parentId || b.parent_budget_id === parentId
      );
      await Promise.all(
        itemsToDelete.map(item => base44.entities.BudgetItem.delete(item.id))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budgetItems']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
    }
  });

  const resetBudgetForm = () => {
    setBudgetForm({
      cost_type_id: '',
      jenis_biaya_name: '',
      kategori_anggaran: 'monthly',
      total_anggaran: '',
      deskripsi_anggaran: ''
    });
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      cost_type_id: budget.cost_type_id,
      jenis_biaya_name: budget.jenis_biaya_name,
      kategori_anggaran: budget.kategori_anggaran,
      total_anggaran: budget.total_anggaran.toString(),
      deskripsi_anggaran: budget.deskripsi_anggaran || ''
    });
    setShowBudgetDialog(true);
  };

  const handleViewTransaction = (transaction) => {
    setViewingTransaction(transaction);
    setShowViewDialog(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionDialog(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setTransactionForm({ ...transactionForm, bukti_transaksi_url: file_url });
    } catch (error) {
      alert('Gagal upload file: ' + error.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const finishSubmit = (isQuery=true) => {
    if(isQuery) {
      queryClient.invalidateQueries(['transactions']);
    }
    setShowTransactionDialog(false);
    setEditingTransaction(null);
  };

  const handleSubmitBudget = async (e) => {
    e.preventDefault();

    const selectedCostType = costTypesData.cost_types.find(ct => ct.id === budgetForm.cost_type_id);
    const totalAnggaran = parseFloat(budgetForm.total_anggaran);

    if (editingBudget) {
      // Update existing budget
      await updateBudgetMutation.mutateAsync({
        parentId: editingBudget.id,
        data: {
          cost_type_id: budgetForm.cost_type_id,
          jenis_biaya_name: selectedCostType?.nama_biaya || '',
          kategori_anggaran: budgetForm.kategori_anggaran,
          deskripsi_anggaran: budgetForm.deskripsi_anggaran,
          total_anggaran: totalAnggaran,
          jumlah_anggaran: totalAnggaran
        }
      });
      return;
    }

    const jangkaWaktu = project?.jangka_waktu || 12;
    const tanggalMulai = project?.tanggal_mulai ? parseISO(project.tanggal_mulai) : new Date();

    if (budgetForm.kategori_anggaran === 'monthly') {
      // Create parent budget
      const parentBudget = {
        project_id: projectId,
        no_sp2k: project?.no_sp2k || '',
        cost_type_id: budgetForm.cost_type_id,
        jenis_biaya_name: selectedCostType?.nama_biaya || '',
        kategori_anggaran: 'monthly',
        total_anggaran: totalAnggaran,
        deskripsi_anggaran: budgetForm.deskripsi_anggaran,
        jumlah_anggaran: totalAnggaran,
        is_parent: true,
        periode_bulan: formatDate(tanggalMulai, 'yyyy-MM')
      };

      // Create parent first
      const parentResult = await base44.entities.BudgetItem.create(parentBudget);

      // Generate monthly breakdown
      const anggaranPerBulan = totalAnggaran / jangkaWaktu;
      const monthlyBudgets = [];

      for (let i = 0; i < jangkaWaktu; i++) {
        const periodeBulan = formatDate(addMonths(tanggalMulai, i), 'yyyy-MM');
        monthlyBudgets.push({
          project_id: projectId,
          no_sp2k: project?.no_sp2k || '',
          cost_type_id: budgetForm.cost_type_id,
          jenis_biaya_name: selectedCostType?.nama_biaya || '',
          kategori_anggaran: 'monthly',
          total_anggaran: totalAnggaran,
          deskripsi_anggaran: `${budgetForm.deskripsi_anggaran} - Bulan ${i + 1}`,
          periode_bulan: periodeBulan,
          jumlah_anggaran: anggaranPerBulan,
          bulan_ke: i + 1,
          parent_budget_id: parentResult.id,
          is_parent: false
        });
      }

      await createBudgetMutation.mutateAsync(monthlyBudgets);
    } else {
      // Lumpsum budget
      const lumpsumBudget = {
        project_id: projectId,
        no_sp2k: project?.no_sp2k || '',
        cost_type_id: budgetForm.cost_type_id,
        jenis_biaya_name: selectedCostType?.nama_biaya || '',
        kategori_anggaran: 'lumpsum',
        total_anggaran: totalAnggaran,
        deskripsi_anggaran: budgetForm.deskripsi_anggaran,
        jumlah_anggaran: totalAnggaran,
        is_parent: true,
        periode_bulan: formatDate(tanggalMulai, 'yyyy-MM')
      };

      await base44.entities.BudgetItem.create(lumpsumBudget);
      queryClient.invalidateQueries(['budgetItems']);
      setShowBudgetDialog(false);
      resetBudgetForm();
    }
  };

  const toggleExpanded = (budgetId) => {
    setExpandedBudgets(prev => ({
      ...prev,
      [budgetId]: !prev[budgetId]
    }));
  };

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

  const parentBudgets = budgetItemsData.budget_items.filter(b => b.is_parent);

  const getMonthlyActual = (periodeBulan, costTypeId) => {
    return transactionsData.transactions
      .filter(t => t.bulan_realisasi === periodeBulan && t.cost_type_id === costTypeId)
      .reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);
  };

  const getCostTypeKode = (costTypeId) => {
    const costType = costTypesData.cost_types.find(ct => ct.id === costTypeId);
    return costType?.kode || costType?.nama_biaya || '';
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{project.judul_pekerjaan}</h1>
            <p className="text-slate-500">No.SP2K: {project.no_sp2k}</p>
          </div>
          <Badge className={`${getStatusColor(project.status_kontrak)} text-sm py-2 px-4 ml-auto`}>{project.status_kontrak}</Badge>
        </div>

        <ProjectCardSummary project={project} transactions={transactionsData.transactions} />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Informasi Proyek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500">Client</p>
                <p className="font-normal flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {project.client_details.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">PIC Client</p>
                <p className="font-normal flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {project.client_details.contact_name || '-'}
                </p>
                <p className="font-normal text-sm text-slate-400">
                  {project.client_details.phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tanggal Perjanjian</p>
                <p className="font-normal flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {project.tanggal_perjanjian && formatDate(project.tanggal_perjanjian)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Jangka Waktu</p>
                <p className="font-normal">{project.jangka_waktu || 0} Bulan</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Nilai Pekerjaan</p>
                <p className="font-normal flex items-center gap-2">
                  {formatRupiah(project.nilai_pekerjaan)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Jenis Kontrak</p>
                <p className="font-normal">{project.contract_type_details.name}</p>
              </div>
            </div>
          </CardContent>
          <CardHeader className="py-2">
            <CardTitle className="text-base">Management Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500">Management Fee (Rp.)</p>
                <p className="font-normal">{formatRupiah(project.management_fee) || '-' }</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tarif Management Fee Persen</p>
                <p className="font-normal">{project.tarif_management_fee_persen || '-' } %</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.SP2K</TableHead>
                  <TableHead>No.Perjanjian</TableHead>
                  <TableHead>No.Amandemen</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{project.no_sp2k}</TableCell>
                  <TableCell>{project.no_perjanjian || '-'}</TableCell>
                  <TableCell>{project.no_amandemen || '-'}</TableCell>
                  <TableCell>{project.tanggal_mulai && formatDate(project.tanggal_mulai)}</TableCell>
                  <TableCell>{project.tanggal_selesai && formatDate(project.tanggal_selesai)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

          {/* Dashboard Section */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="budget">Anggaran</TabsTrigger>
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ProjectStats
              project={project}
              budgetItems={budgetItemsData.budget_items}
              transactions={transactionsData.transactions}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <BudgetTrendChart
                project={project}
                budgetItems={budgetItemsData.budget_items}
                transactions={transactionsData.transactions}
              />
              <PaymentSLAChart transactions={transactionsData.transactions} />
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold">Detail Anggaran</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      Anggaran monthly otomatis terbagi per bulan sesuai jangka waktu proyek
                    </p>
                  </div>
                  <Button onClick={() => setShowBudgetDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Anggaran
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {parentBudgets.length > 0 && (() => {
                  const totalAnggaranSemua = parentBudgets.reduce((sum, p) => sum + (p.total_anggaran || 0), 0);
                  const totalRealisasiSemua = parentBudgets.reduce((sum, parentBudget) => {
                    let totalRealisasi = 0;
                    if (parentBudget.kategori_anggaran === 'lumpsum') {
                      // For lumpsum, sum all transactions with matching cost_type_id
                      totalRealisasi = transactions
                        .filter(t => t.cost_type_id === parentBudget.cost_type_id)
                        .reduce((s, t) => s + (t.jumlah_realisasi || 0), 0);
                    } else {
                      // For monthly, sum from child budgets
                      const childBudgets = budgetItemsData.budget_items.filter(b => b.parent_budget_id === parentBudget.id);
                      totalRealisasi = childBudgets.reduce((s, child) => {
                        return s + getMonthlyActual(child.periode_bulan, child.cost_type_id);
                      }, 0);
                    }
                    return sum + totalRealisasi;
                  }, 0);
                  const sisaAnggaranSemua = totalAnggaranSemua - totalRealisasiSemua;
                  const percentUsedSemua = totalAnggaranSemua > 0 ? (totalRealisasiSemua / totalAnggaranSemua) * 100 : 0;

                  return (
                    <Card className="border-2 border-blue-200 bg-blue-50 mb-6">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Total Anggaran</p>
                            <p className="text-2xl font-bold text-slate-900">{formatRupiah(totalAnggaranSemua)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Total Realisasi</p>
                            <p className="text-2xl font-bold text-green-600">{formatRupiah(totalRealisasiSemua)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Sisa Anggaran</p>
                            <p className={`text-2xl font-bold ${sisaAnggaranSemua < 0 ? 'text-red-600' : 'text-purple-600'}`}>
                              {formatRupiah(sisaAnggaranSemua)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Penyerapan</p>
                            <p className={`text-2xl font-bold ${
                              percentUsedSemua >= 90 ? 'text-red-600' :
                              percentUsedSemua >= 80 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {percentUsedSemua.toFixed(1)}%
                            </p>
                            <Progress
                              value={Math.min(percentUsedSemua, 100)}
                              className="h-2 mt-2"
                              indicatorClassName={
                                percentUsedSemua >= 90 ? 'bg-red-500' :
                                percentUsedSemua >= 80 ? 'bg-orange-500' :
                                'bg-green-500'
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {parentBudgets.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Belum ada anggaran. Tambahkan anggaran untuk proyek ini.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {parentBudgets.map((parentBudget) => {
                      const childBudgets = budgetItemsData.budget_items.filter(b => b.parent_budget_id === parentBudget.id);
                      const isExpanded = expandedBudgets[parentBudget.id];

                      // Calculate totalRealisasi based on kategori_anggaran
                      let totalRealisasi = 0;
                      if (parentBudget.kategori_anggaran === 'lumpsum') {
                        // For lumpsum, sum all transactions with matching cost_type_id
                        totalRealisasi = transactions
                          .filter(t => t.cost_type_id === parentBudget.cost_type_id)
                          .reduce((sum, t) => sum + (t.jumlah_realisasi || 0), 0);
                      } else {
                        // For monthly, sum from child budgets
                        totalRealisasi = childBudgets.reduce((sum, child) => {
                          return sum + getMonthlyActual(child.periode_bulan, child.cost_type_id);
                        }, 0);
                      }

                      const sisaAnggaran = parentBudget.total_anggaran - totalRealisasi;
                      const percentUsed = parentBudget.total_anggaran > 0
                        ? (totalRealisasi / parentBudget.total_anggaran) * 100
                        : 0;

                      return (
                        <Card key={parentBudget.id} className="border-2 border-slate-200">
                          <CardContent className="p-4">
                            {/* Parent Row */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                {parentBudget.kategori_anggaran === 'monthly' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleExpanded(parentBudget.id)}
                                    className="h-8 w-8"
                                  >
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </Button>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {getCostTypeKode(parentBudget.cost_type_id)}
                                    </Badge>
                                    <span className="font-semibold text-slate-900">
                                      {parentBudget.jenis_biaya_name}
                                    </span>
                                    <Badge className={
                                      parentBudget.kategori_anggaran === 'monthly'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-green-100 text-green-700'
                                    }>
                                      {parentBudget.kategori_anggaran === 'monthly' ? 'Bulanan' : 'Lumpsum'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-600">{parentBudget.deskripsi_anggaran}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-sm text-slate-500">Total Anggaran</p>
                                  <p className="text-lg font-bold text-slate-900">
                                    {formatRupiah(parentBudget.total_anggaran)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-slate-500">Realisasi</p>
                                  <p className="text-lg font-bold text-green-600">
                                    {formatRupiah(totalRealisasi)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-slate-500">Sisa</p>
                                  <p className={`text-lg font-bold ${sisaAnggaran < 0 ? 'text-red-600' : 'text-purple-600'}`}>
                                    {formatRupiah(sisaAnggaran)}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditBudget(parentBudget)}
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (confirm('Yakin ingin menghapus anggaran ini beserta detailnya?')) {
                                        deleteBudgetMutation.mutate(parentBudget.id);
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-slate-600">
                                <span>Progress Penyerapan</span>
                                <span className={percentUsed > 100 ? 'text-red-600 font-semibold' : ''}>
                                  {percentUsed.toFixed(1)}%
                                </span>
                              </div>
                              <Progress 
                                value={Math.min(percentUsed, 100)} 
                                className="h-2"
                                indicatorClassName={percentUsed >= 90 ? 'bg-red-500' : percentUsed >= 80 ? 'bg-orange-500' : 'bg-green-500'}
                              />
                            </div>

                            {/* Child Rows (Monthly Breakdown) */}
                            {isExpanded && childBudgets.length > 0 && (
                              <div className="mt-4 pl-12">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Bulan</TableHead>
                                      <TableHead>Periode</TableHead>
                                      <TableHead className="text-right">Anggaran</TableHead>
                                      <TableHead className="text-right">Realisasi</TableHead>
                                      <TableHead className="text-right">Sisa</TableHead>
                                      <TableHead className="text-right">%</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {childBudgets
                                      .sort((a, b) => (a.bulan_ke || 0) - (b.bulan_ke || 0))
                                      .map((child) => {
                                        const actualBulan = getMonthlyActual(child.periode_bulan, child.cost_type_id);
                                        const sisaBulan = child.jumlah_anggaran - actualBulan;
                                        const percentBulan = child.jumlah_anggaran > 0
                                          ? (actualBulan / child.jumlah_anggaran) * 100
                                          : 0;

                                        return (
                                          <TableRow key={child.id}>
                                            <TableCell>Bulan {child.bulan_ke}</TableCell>
                                            <TableCell>
                                              {child.periode_bulan}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                              {formatRupiah(child.jumlah_anggaran)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-green-600">
                                              {formatRupiah(actualBulan)}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${sisaBulan < 0 ? 'text-red-600' : 'text-purple-600'}`}>
                                              {formatRupiah(sisaBulan)}
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${
                                              percentBulan > 100 ? 'text-red-600' :
                                              percentBulan >= 90 ? 'text-orange-600' :
                                              'text-green-600'
                                            }`}>
                                              {percentBulan.toFixed(1)}%
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
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">Riwayat Transaksi</CardTitle>
                  <Button
                    onClick={() => {
                      setEditingTransaction(null);
                      setShowTransactionDialog(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Transaksi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {transactionsData.transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Belum ada transaksi untuk proyek ini.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      // Group transactions by jenis_biaya_name
                      const groupedTransactions = transactionsData.transactions.reduce((groups, tx) => {
                        const key = tx.jenis_biaya_name || 'Lainnya';
                        if (!groups[key]) {
                          groups[key] = [];
                        }
                        groups[key].push(tx);
                        return groups;
                      }, {});

                      return Object.entries(groupedTransactions).map(([jenisBiaya, txList]) => {
                        const totalPerJenis = txList.reduce((sum, tx) => sum + (tx.jumlah_realisasi || 0), 0);

                        return (
                          <div key={jenisBiaya} className="border-2 border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Badge className="bg-blue-100 text-blue-700">
                                  {getCostTypeKode(txList[0].cost_type_id)}
                                </Badge>
                                <h3 className="font-bold text-slate-900">{jenisBiaya}</h3>
                                <Badge variant="outline" className="bg-white">
                                  {txList.length} transaksi
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="text-lg font-bold text-green-600">
                                  {formatRupiah(totalPerJenis)}
                                </p>
                              </div>
                            </div>

                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tanggal</TableHead>
                                  <TableHead>Bulan Realisasi</TableHead>
                                  <TableHead>Deskripsi</TableHead>
                                  <TableHead className="text-right">Jumlah</TableHead>
                                  <TableHead>Bukti</TableHead>
                                  <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {txList
                                  .sort((a, b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi))
                                  .map((tx) => (
                                    <TableRow key={tx.id}>
                                      <TableCell>
                                        {formatDate(tx.tanggal_transaksi, 'dd MMM yyyy')}
                                      </TableCell>
                                      <TableCell>
                                        {tx.bulan_realisasi ? tx.bulan_realisasi : '-'}
                                      </TableCell>
                                      <TableCell>{tx.deskripsi_realisasi || '-'}</TableCell>
                                      <TableCell className="text-right font-semibold text-green-600">
                                        {formatRupiah(tx.jumlah_realisasi)}
                                      </TableCell>
                                      <TableCell>
                                        {tx.bukti_transaksi_url ? (
                                          <a href={tx.bukti_transaksi_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon">
                                              <FileText className="w-4 h-4" />
                                            </Button>
                                          </a>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
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
                                            onClick={() => handleEditTransaction(tx)}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Edit"
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              if (confirm('Yakin ingin menghapus transaksi ini?')) {
                                                deleteTransactionMutation.mutate(tx.id);
                                              }
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                            title="Hapus"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={(open) => {
        setShowBudgetDialog(open);
        if (!open) {
          setEditingBudget(null);
          resetBudgetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Anggaran' : 'Tambah Anggaran Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBudget}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cost_type">Jenis Biaya *</Label>
                <Select
                  value={budgetForm.cost_type_id}
                  onValueChange={(val) => setBudgetForm({ ...budgetForm, cost_type_id: val })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis biaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {costTypesData.cost_types.map((ct) => (
                      <SelectItem key={ct.id} value={ct.id}>
                        {ct.nama_biaya} ({ct.kode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori Anggaran *</Label>
                <Select
                  value={budgetForm.kategori_anggaran}
                  onValueChange={(val) => setBudgetForm({ ...budgetForm, kategori_anggaran: val })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      Monthly (Dibagi per bulan otomatis - untuk PO/Non PO)
                    </SelectItem>
                    <SelectItem value="lumpsum">
                      Lumpsum (Tidak dibagi - untuk Seragam/Suplisi)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {budgetForm.kategori_anggaran === 'monthly'
                    ? `Anggaran akan dibagi otomatis ke ${project?.jangka_waktu || 12} bulan`
                    : 'Anggaran tidak dibagi per bulan'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total">Total Anggaran (Rp) *</Label>
                <Input
                  id="total"
                  type="number"
                  value={budgetForm.total_anggaran}
                  onChange={(e) => setBudgetForm({ ...budgetForm, total_anggaran: e.target.value })}
                  required
                  placeholder="Contoh: 1000000000"
                />
                {budgetForm.kategori_anggaran === 'monthly' && budgetForm.total_anggaran && (
                  <p className="text-sm text-blue-600">
                    Per bulan: {formatRupiah((parseFloat(budgetForm.total_anggaran) / (project?.jangka_waktu || 12)))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={budgetForm.deskripsi_anggaran}
                  onChange={(e) => setBudgetForm({ ...budgetForm, deskripsi_anggaran: e.target.value })}
                  placeholder="Deskripsi anggaran"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBudgetDialog(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(createBudgetMutation.isPending || updateBudgetMutation.isPending) ? 'Menyimpan...' : editingBudget ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Transaction Dialog */}
      <ViewTransactionDialog
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setViewingTransaction(null);
        }}
        transaction={viewingTransaction}
        onEdit={handleEditTransaction}
        />

      {/* Transaction Form Dialog */}
      <AddEditTransactionDialog
        isOpen={showTransactionDialog}
        onClose={() => finishSubmit(false)}
        transaction={editingTransaction}
        onFinish={finishSubmit}
        />

    </div>
  );
};

export default ProjectDetail;
