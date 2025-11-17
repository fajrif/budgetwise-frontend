import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const MasterJenisBiaya = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCostType, setEditingCostType] = useState(null);
  const [formData, setFormData] = useState({
    nama_biaya: '',
    kode: '',
    deskripsi: ''
  });

  const { data: costTypesData = { cost_types: [] }, isLoading } = useQuery({
    queryKey: ['costTypes'],
    queryFn: async () => {
      const response = await api.get('/cost-types');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/cost-types', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['costTypes']);
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/cost-types/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['costTypes']);
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/cost-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['costTypes']);
    }
  });

  const resetForm = () => {
    setFormData({
      nama_biaya: '',
      kode: '',
      deskripsi: ''
    });
    setEditingCostType(null);
  };

  const handleOpenDialog = (costType = null) => {
    if (costType) {
      setFormData({
        nama_biaya: costType.nama_biaya || '',
        kode: costType.kode || '',
        deskripsi: costType.deskripsi || ''
      });
      setEditingCostType(costType);
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCostType) {
      updateMutation.mutate({ id: editingCostType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Master Jenis Biaya</h1>
            <p className="text-slate-500 font-normal mt-1">Kelola jenis biaya dan kategori</p>
          </div>
        </div>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Tentang Master Jenis Biaya</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Master Jenis Biaya digunakan untuk mengkategorikan anggaran dan transaksi dalam sistem.
                </p>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>• <strong className="font-semibold">Nama Biaya:</strong> Nama lengkap jenis biaya</p>
                  <p>• <strong className="font-semibold">Kode:</strong> Singkatan untuk identifikasi cepat</p>
                  <p>• <strong className="font-semibold">Deskripsi:</strong> Penjelasan detail tentang jenis biaya</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  Master Jenis Biaya
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">Daftar jenis biaya untuk anggaran dan transaksi</p>
              </div>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Jenis Biaya
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : costTypesData.cost_types.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada jenis biaya. Tambahkan jenis biaya pertama.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {costTypesData.cost_types.map((costType) => (
                  <Card key={costType.id} className="border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-2">
                            {costType.kode || 'N/A'}
                          </Badge>
                          <CardTitle className="text-lg">
                            {costType.nama_biaya}
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(costType)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Yakin ingin menghapus jenis biaya ini?')) {
                                deleteMutation.mutate(costType.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">
                        {costType.deskripsi || 'Tidak ada deskripsi'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCostType ? 'Edit Jenis Biaya' : 'Tambah Jenis Biaya Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nama Biaya *</Label>
                <Input
                  value={formData.nama_biaya}
                  onChange={(e) => setFormData({ ...formData, nama_biaya: e.target.value })}
                  required
                  placeholder="Contoh: Gaji & Tunjangan"
                />
              </div>

              <div className="space-y-2">
                <Label>Kode</Label>
                <Input
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                  placeholder="Contoh: SAL"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Penjelasan tentang jenis biaya ini"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-900 hover:bg-blue-800"
              >
                {(createMutation.isPending || updateMutation.isPending)
                  ? 'Menyimpan...'
                  : editingCostType ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterJenisBiaya;
