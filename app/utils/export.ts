export function transactionsToCSV(transactions) {
  const header = 'Date,Type,Category,Description,Amount\n';
  const rows = transactions.map(txn =>
    [
      new Date(txn.date).toLocaleDateString(),
      txn.type,
      txn.category,
      txn.description ? `"${txn.description.replace(/"/g, '""')}"` : '',
      txn.amount
    ].join(',')
  );
  return header + rows.join('\n');
}
