export const formatRupiah = (amount) => {
  if (amount === null || amount === undefined) return 'Rp 0';

  const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numberAmount);
};

export const calculateSLAStatus = (tanggalPO, tanggalTransaksi) => {
  if (!tanggalPO || !tanggalTransaksi) return 'unknown';

  const po = new Date(tanggalPO);
  const tx = new Date(tanggalTransaksi);

  const endOfPOMonth = new Date(po.getFullYear(), po.getMonth() + 1, 0);
  const endOfNextMonth = new Date(po.getFullYear(), po.getMonth() + 2, 0);

  if (tx <= endOfPOMonth) {
    return 'ontime';
  } else if (tx <= endOfNextMonth) {
    return 'h+1';
  } else {
    return 'late';
  }
};

export const getSLALabel = (status) => {
  const labels = {
    'ontime': 'Tepat Waktu',
    'h+1': 'H+1',
    'late': 'Terlambat',
    'unknown': 'Tidak Ada Data'
  };
  return labels[status] || 'Tidak Ada Data';
};

export const getSLAColor = (status) => {
  const colors = {
    'ontime': 'text-green-600',
    'h+1': 'text-blue-600',
    'late': 'text-red-600',
    'unknown': 'text-slate-400'
  };
  return colors[status] || 'text-slate-400';
};
