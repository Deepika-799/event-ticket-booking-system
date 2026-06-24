export function formatINR(amount: number) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
}
