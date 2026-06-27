export function exportGroceryCSV(groceryList = []) {
  const headers = [
    'Catégorie',
    'Ingrédient',
    'Quantité',
    'Unité',
    'Repas',
    'Coché',
  ];

  const rows = groceryList.map((item) => [
    item.category || 'Autres',
    item.name || '',
    item.quantity ?? '',
    item.unit || '',
    Array.isArray(item.meals) ? item.meals.join(' | ') : '',
    item.done ? 'Oui' : 'Non',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '');
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'liste-epicerie.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function printSection(sectionName) {
  document.body.setAttribute('data-print', sectionName);

  window.print();

  setTimeout(() => {
    document.body.removeAttribute('data-print');
  }, 500);
}
