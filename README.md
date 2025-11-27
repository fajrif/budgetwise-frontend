# BudgetWise Frontend

Frontend aplikasi BudgetWise menggunakan Vite + React + Tailwind CSS

## Requirements

- Node.js >= 18
- Backend API (Golang + PostgreSQL) running di `http://localhost:8080`

## Installation & Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dan sesuaikan VITE_API_BASE_URL

# Run development server
npm run dev

# Build for production
npm run build
```

# BudgetWise - Budget Management System

Sistem manajemen anggaran dan monitoring proyek dengan Golang (Fiber) backend + PostgreSQL + React (Vite) frontend.

## 🚀 Tech Stack

### Backend
- **Golang** - Programming language
- **Fiber** - Web framework
- **PostgreSQL** - Database
- **GORM** - ORM
- **JWT** - Authentication

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Router** - Routing
- **Recharts** - Charts
- **date-fns** - Date utilities
- **Axios** - HTTP client

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:
- Go 1.21 atau lebih tinggi
- PostgreSQL 15 atau lebih tinggi
- Node.js 18 atau lebih tinggi
- npm atau yarn

## 🔧 Setup Backend

1. **Clone repository**
```bash
git clone <repository-url>
cd budgetwise-backend
```

### Default Credentials
Admin: admin@budgetwise.com / admin123
User: user@budgetwise.com / user123

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={(open) => {
        setShowTransactionDialog(open);
        if (!open) {
          setEditingTransaction(null);
          resetTransactionForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const selectedCostType = costTypesData.cost_types.find(ct => ct.id === transactionForm.cost_type_id);
            const data = {
              project_id: projectId,
              no_sp2k: project?.no_sp2k || '',
              tanggal_transaksi: transactionForm.tanggal_transaksi,
              tanggal_po_tagihan: transactionForm.tanggal_po_tagihan || null,
              bulan_realisasi: transactionForm.bulan_realisasi,
              cost_type_id: transactionForm.cost_type_id,
              jenis_biaya_name: selectedCostType?.nama_biaya || '',
              deskripsi_realisasi: transactionForm.deskripsi_realisasi,
              jumlah_realisasi: parseFloat(transactionForm.jumlah_realisasi),
              jumlah_tenaga_kerja: transactionForm.jumlah_tenaga_kerja ? parseInt(transactionForm.jumlah_tenaga_kerja) : null,
              persentase_management_fee: project?.tarif_management_fee_persen || 0,
              nilai_management_fee: (parseFloat(transactionForm.jumlah_realisasi) * (project?.tarif_management_fee_persen || 0)) / 100,
              bukti_transaksi_url: transactionForm.bukti_transaksi_url || null
            };

            if (editingTransaction) {
              updateTransactionMutation.mutate({ id: editingTransaction.id, data });
            } else {
              createTransactionMutation.mutate(data);
            }
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggal_transaksi">Tanggal Transaksi *</Label>
                  <Input
                    id="tanggal_transaksi"
                    type="date"
                    value={transactionForm.tanggal_transaksi}
                    onChange={(e) => setTransactionForm({ ...transactionForm, tanggal_transaksi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulan_realisasi">Bulan Realisasi *</Label>
                  <Input
                    id="bulan_realisasi"
                    type="month"
                    value={transactionForm.bulan_realisasi}
                    onChange={(e) => setTransactionForm({ ...transactionForm, bulan_realisasi: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_type_tx">Jenis Biaya *</Label>
                <Select
                  value={transactionForm.cost_type_id}
                  onValueChange={(val) => setTransactionForm({ ...transactionForm, cost_type_id: val })}
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
                <Label htmlFor="deskripsi_realisasi">Deskripsi</Label>
                <Textarea
                  id="deskripsi_realisasi"
                  value={transactionForm.deskripsi_realisasi}
                  onChange={(e) => setTransactionForm({ ...transactionForm, deskripsi_realisasi: e.target.value })}
                  placeholder="Deskripsi realisasi"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jumlah_realisasi">Jumlah Realisasi (Rp) *</Label>
                  <Input
                    id="jumlah_realisasi"
                    type="number"
                    value={transactionForm.jumlah_realisasi}
                    onChange={(e) => setTransactionForm({ ...transactionForm, jumlah_realisasi: e.target.value })}
                    required
                    placeholder="Contoh: 50000000"
                  />
                  {transactionForm.jumlah_realisasi && (
                    <p className="text-sm text-blue-600">
                      = {formatRupiah(transactionForm.jumlah_realisasi)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah_tenaga_kerja">Jumlah Tenaga Kerja</Label>
                  <Input
                    id="jumlah_tenaga_kerja"
                    type="number"
                    value={transactionForm.jumlah_tenaga_kerja}
                    onChange={(e) => setTransactionForm({ ...transactionForm, jumlah_tenaga_kerja: e.target.value })}
                    placeholder="Jumlah pekerja"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_po_tagihan">Tanggal PO/Tagihan</Label>
                <Input
                  id="tanggal_po_tagihan"
                  type="date"
                  value={transactionForm.tanggal_po_tagihan}
                  onChange={(e) => setTransactionForm({ ...transactionForm, tanggal_po_tagihan: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bukti_transaksi">Bukti Transaksi</Label>
                <div className="space-y-2">
                  {transactionForm.bukti_transaksi_url && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border border-slate-200">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <a 
                        href={transactionForm.bukti_transaksi_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex-1 truncate"
                      >
                        {transactionForm.bukti_transaksi_url.split('/').pop()}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setTransactionForm({ ...transactionForm, bukti_transaksi_url: '' })}
                        className="h-6 w-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id="bukti_transaksi_file"
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('bukti_transaksi_file').click()}
                      disabled={uploadingFile}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingFile ? 'Mengupload...' : 'Upload File'}
                    </Button>
                    <Input
                      type="url"
                      value={transactionForm.bukti_transaksi_url}
                      onChange={(e) => setTransactionForm({ ...transactionForm, bukti_transaksi_url: e.target.value })}
                      placeholder="Atau masukkan URL..."
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Upload file atau masukkan URL bukti transaksi</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTransactionDialog(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createTransactionMutation.isPending || updateTransactionMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {(createTransactionMutation.isPending || updateTransactionMutation.isPending) ? 'Menyimpan...' : editingTransaction ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

