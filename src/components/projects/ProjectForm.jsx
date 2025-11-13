import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { projectSchema } from "@/utils/validations";

const ProjectForm = ({ project, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState(project || {
    no_sp2k: '',
    no_perjanjian: '',
    no_amandemen: '',
    tanggal_perjanjian: '',
    judul_pekerjaan: '',
    jangka_waktu: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    nilai_pekerjaan: '',
    management_fee: '',
    tarif_management_fee_persen: '',
    client: '',
    pic_client: '',
    contact_client: '',
    alamat_client: '',
    jenis_kontrak: 'Project Aplikasi',
    status_kontrak: 'Active'
  });
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = projectSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    console.log("✅ Valid data:", parsed.data);
    setError("");
    onSubmit(formData);
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-semibold text-slate-900">
          {project ? 'Edit Proyek' : 'Tambah Proyek Baru'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="no_sp2k">No SP2K *</Label>
              <Input
                id="no_sp2k"
                value={formData.no_sp2k}
                placeholder="Contoh: SP2K-2024-001"
                onChange={(e) => handleChange('no_sp2k', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_perjanjian">No Perjanjian</Label>
              <Input
                id="no_perjanjian"
                placeholder="Contoh: GATRA-2024-001"
                value={formData.no_perjanjian}
                onChange={(e) => handleChange('no_perjanjian', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_amandemen">No Amandemen</Label>
              <Input
                id="no_amandemen"
                placeholder="Jika ada amandemen"
                value={formData.no_amandemen}
                onChange={(e) => handleChange('no_amandemen', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_perjanjian">Tanggal Perjanjian</Label>
              <Input
                id="tanggal_perjanjian"
                type="date"
                value={formData.tanggal_perjanjian}
                onChange={(e) => handleChange('tanggal_perjanjian', e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-full">
              <Label htmlFor="judul_pekerjaan">Judul Pekerjaan *</Label>
              <Input
                id="judul_pekerjaan"
                value={formData.judul_pekerjaan}
                onChange={(e) => handleChange('judul_pekerjaan', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_mulai">Tanggal Mulai *</Label>
              <Input
                id="tanggal_mulai"
                type="date"
                value={formData.tanggal_mulai}
                onChange={(e) => handleChange('tanggal_mulai', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_selesai">Tanggal Selesai *</Label>
              <Input
                id="tanggal_selesai"
                type="date"
                value={formData.tanggal_selesai}
                onChange={(e) => handleChange('tanggal_selesai', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nilai_pekerjaan">Nilai Pekerjaan (Rp) *</Label>
              <Input
                id="nilai_pekerjaan"
                type="number"
                value={formData.nilai_pekerjaan}
                onChange={(e) => handleChange('nilai_pekerjaan', e.target.value)}
                placeholder="Contoh: Rp.100,000,000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleChange('client', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis_kontrak">Jenis Kontrak</Label>
              <Select value={formData.jenis_kontrak} onValueChange={(val) => handleChange('jenis_kontrak', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TAD">TAD</SelectItem>
                  <SelectItem value="EOS">EOS</SelectItem>
                  <SelectItem value="Project Aplikasi">Project Aplikasi</SelectItem>
                  <SelectItem value="Perangkat">Perangkat</SelectItem>
                  <SelectItem value="Barang & Jasa">Barang & Jasa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_kontrak">Status Kontrak</Label>
              <Select value={formData.status_kontrak} onValueChange={(val) => handleChange('status_kontrak', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="management_fee">Management Fee (Rp)</Label>
              <Input
                id="management_fee"
                type="number"
                value={formData.management_fee}
                onChange={(e) => handleChange('management_fee', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarif_management_fee">Tarif Management Fee (%)</Label>
              <Input
                id="tarif_management_fee"
                type="number"
                step="0.1"
                value={formData.tarif_management_fee_persen}
                onChange={(e) => handleChange('tarif_management_fee_persen', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-900 hover:bg-blue-800">
            {isSubmitting ? 'Menyimpan...' : project ? 'Update' : 'Simpan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectForm;
