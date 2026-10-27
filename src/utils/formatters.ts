export function formatCurrency(
  amount: number,
  currencySymbol: string = '$',
  decimals: number = 2
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${isNegative ? '-' : ''}${currencySymbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    
    // Check if today or yesterday
    const today = new Date();
    const isToday = today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.getFullYear() === year && yesterday.getMonth() === month - 1 && yesterday.getDate() === day;

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
