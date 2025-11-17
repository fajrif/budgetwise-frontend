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

const MasterJenisKontrak = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingContractType, setEditingContractType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const { data: contractTypesData = { contract_types: [] }, isLoading } = useQuery({
    queryKey: ['contractTypes'],
    queryFn: async () => {
      const response = await api.get('/contract-types');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/contract-types', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contractTypes']);
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/contract-types/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contractTypes']);
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/contract-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contractTypes']);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: ''
    });
    setEditingContractType(null);
  };

  const handleOpenDialog = (contractType = null) => {
    if (contractType) {
      setFormData({
        name: contractType.name || '',
        code: contractType.code || '',
        description: contractType.description || ''
      });
      setEditingContractType(contractType);
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingContractType) {
      updateMutation.mutate({ id: editingContractType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Master Jenis Kontrak</h1>
            <p className="text-slate-500 font-normal mt-1">Kelola jenis kategori kontrak</p>
          </div>
        </div>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Tentang Master Jenis Kontrak</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Master Jenis Kontrak digunakan untuk mengkategorikan proyek.
                </p>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>• <strong className="font-semibold">Nama Jenis Kontrak:</strong> Nama lengkap jenis kontrak</p>
                  <p>• <strong className="font-semibold">Kode:</strong> Singkatan untuk identifikasi cepat</p>
                  <p>• <strong className="font-semibold">Deskripsi:</strong> Penjelasan detail tentang jenis kontrak</p>
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
                  Master Jenis Kontrak
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">Daftar jenis kontrak untuk setiap proyek</p>
              </div>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Jenis Kontrak
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : contractTypesData.contract_types.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada jenis kontrak. Tambahkan jenis kontrak pertama.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractTypesData.contract_types.map((contractType) => (
                  <Card key={contractType.id} className="border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-2">
                            {contractType.code || 'N/A'}
                          </Badge>
                          <CardTitle className="text-lg">
                            {contractType.name}
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(contractType)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Yakin ingin menghapus jenis kontrak ini?')) {
                                deleteMutation.mutate(contractType.id);
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
                        {contractType.description || 'Tidak ada deskripsi'}
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
              {editingContractType ? 'Edit Jenis Kontrak' : 'Tambah Jenis Kontrak Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nama Jenis Kontrak *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Contoh: TAD, Proyek Aplikasi, dll.."
                />
              </div>

              <div className="space-y-2">
                <Label>Kode</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Contoh: TAD"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Penjelasan tentang jenis kontrak ini"
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
                  : editingContractType ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterJenisKontrak;
