/**
 * Determines the Tailwind CSS classes for a given status.
 * @param {'active' | 'Non Aktif' | 'pending'} status
 * @returns {string}
 */
export const getStatusColor = (status) => {
  const colors = {
    Active: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    'Non Aktif': 'bg-slate-100 text-slate-800',
  };
  return colors[status] || colors['Non Aktif'];
};
