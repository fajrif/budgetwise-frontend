import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { projectSchema } from "@/utils/validations";
import { formatRupiah } from "@/utils/formatters";

const ProjectForm = ({ project, clients, contractTypes, onSubmit, onCancel, isSubmitting }) => {

  // --- React Hook Form Setup ---
  const { register, control, handleSubmit, formState: { errors }, watch, reset } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: project || {
      no_sp2k: '',
      no_perjanjian: '',
      no_amandemen: '',
      tanggal_perjanjian: '',
      judul_pekerjaan: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      nilai_pekerjaan: 0,
      management_fee: '',
      tarif_management_fee_persen: 0,
      client_id: '',
      contract_type_id: '',
      status_kontrak: 'Active'
    }
  });

  // Gunakan useEffect untuk me-reset form setiap kali project data berubah
  useEffect(() => {
    if (project) {
      // 🔥 PENTING: Format ulang tanggal sebelum reset()
      // Konversi ISO string menjadi YYYY-MM-DD untuk input type="date"
      const formattedData = {
        ...project,
        tarif_management_fee_persen: project.tarif_management_fee_persen > 0 ? project.tarif_management_fee_persen : null,
        tanggal_mulai: project.tanggal_mulai ? project.tanggal_mulai.split('T')[0] : '',
        tanggal_selesai: project.tanggal_selesai ? project.tanggal_selesai.split('T')[0] : '',
        tanggal_perjanjian: project.tanggal_perjanjian ? project.tanggal_perjanjian.split('T')[0] : '',
      };

      reset(formattedData);
    }
  }, [project, reset]); // 'reset' dan 'project' adalah dependency

  const watchedNilaiPekerjaan = watch("nilai_pekerjaan");
  const watchedTarifPersen = watch("tarif_management_fee_persen");

  // 🔥🔥 Lakukan perhitungan derived state (computed value) 🔥🔥
  const calculatedFee = React.useMemo(() => {
      const nilaiPekerjaan = parseFloat(watchedNilaiPekerjaan) || 0;
      const tarifPersen = parseFloat(watchedTarifPersen) || 0;

      if (nilaiPekerjaan > 0 && tarifPersen > 0) {
        return (nilaiPekerjaan * tarifPersen) / 100;
      }
      return 0;
    }, [watchedNilaiPekerjaan, watchedTarifPersen]); // Dependensi perhitungan

  const onHandleSubmit = async (data) => {
    console.log(data);
    onSubmit(data);
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-semibold text-slate-900">
          {project ? 'Edit Proyek' : 'Tambah Proyek Baru'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onHandleSubmit)}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="no_sp2k">No SP2K *</Label>
              <Input
                id="no_sp2k"
                placeholder="Contoh: SP2K-2024-001"
                {...register("no_sp2k")}
              />
              {errors.no_sp2k && <p className="text-red-500 text-sm">{errors.no_sp2k.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_perjanjian">No Perjanjian</Label>
              <Input
                id="no_perjanjian"
                placeholder="Contoh: GATRA-2024-001"
                {...register("no_perjanjian")}
              />
              {errors.no_perjanjian && <p className="text-red-500 text-sm">{errors.no_perjanjian.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_amandemen">No Amandemen</Label>
              <Input
                id="no_amandemen"
                placeholder="Jika ada amandemen"
                {...register("no_amandemen")}
              />
              {errors.no_amandemen && <p className="text-red-500 text-sm">{errors.no_amandemen.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_perjanjian">Tanggal Perjanjian</Label>
              <Input
                id="tanggal_perjanjian"
                type="date"
                {...register("tanggal_perjanjian")}
              />
              {errors.tanggal_perjanjian && <p className="text-red-500 text-sm">{errors.tanggal_perjanjian.message}</p>}
            </div>

            <div className="space-y-2 col-span-full">
              <Label htmlFor="judul_pekerjaan">Judul Pekerjaan *</Label>
              <Input
                id="judul_pekerjaan"
                {...register("judul_pekerjaan")}
              />
              {errors.judul_pekerjaan && <p className="text-red-500 text-sm">{errors.judul_pekerjaan.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_mulai">Tanggal Mulai *</Label>
              <Input
                id="tanggal_mulai"
                type="date"
                {...register("tanggal_mulai")}
              />
              {errors.tanggal_mulai && <p className="text-red-500 text-sm">{errors.tanggal_mulai.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_selesai">Tanggal Selesai *</Label>
              <Input
                id="tanggal_selesai"
                type="date"
                {...register("tanggal_selesai")}
              />
              {errors.tanggal_selesai && <p className="text-red-500 text-sm">{errors.tanggal_selesai.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nilai_pekerjaan">Nilai Pekerjaan (Rp) *</Label>
              <CurrencyInput
                name="nilai_pekerjaan"
                control={control}
                placeholder="Contoh: Rp.100,000,000"
              />
              {errors.nilai_pekerjaan && <p className="text-red-500 text-sm">{errors.nilai_pekerjaan.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              {/* Use the Controller for your custom Select component */}
              <Controller
                name="client_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  // The render prop passes the necessary onChange and value handlers
                  <Select
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Map over your fetched clients data */}
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.client_id && <p className="text-red-500 text-sm">{errors.client_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_type_id">Jenis Kontrak</Label>
              <Controller
                name="contract_type_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jenis Kontrak" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypes.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id}>
                          {ct.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.contract_type_id && <p className="text-red-500 text-sm">{errors.contract_type_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_kontrak">Status Kontrak</Label>
              <Controller
                name="status_kontrak"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status Kontrak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status_kontrak && <p className="text-red-500 text-sm">{errors.status_kontrak.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="management_fee">Management Fee (Rp.)</Label>
              <CurrencyInput
                name="management_fee"
                control={control}
              />
              {errors.management_fee && <p className="text-red-500 text-sm">{errors.management_fee.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarif_management_fee_persen">Tarif Management Fee (%)</Label>
              <Input
                id="tarif_management_fee_persen"
                type="number"
                step="0.01"
                {...register("tarif_management_fee_persen")}
              />
              {errors.tarif_management_fee_persen && <p className="text-red-500 text-sm">{errors.tarif_management_fee_persen.message}</p>}
              <div className="mt-4 px-4 py-2 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
                <p className="font-base">Perkiraan Nilai Management Fee:</p>
                <p className="font-semibold">{formatRupiah(calculatedFee)}</p>
                {calculatedFee === 0 && <p className='text-slate-500 mt-1 italic text-xs'>Masukkan nilai pekerjaan dan persentase untuk kalkulasi.</p>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
            {isSubmitting ? 'Menyimpan...' : project ? 'Update' : 'Simpan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectForm;
