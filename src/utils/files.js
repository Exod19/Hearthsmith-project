// =============================================================
//  files.js — Téléchargements, impression et images
// =============================================================

import { formatQuantity, formatUnit } from './ingredients.js';

export function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slugify = (text) =>
  String(text || 'menu')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function exportGroceryCSV(groceryList, checks, menuName) {
  const headers = ['Rayon', 'Article', 'Quantité', 'Unité', 'Repas', 'Coché'];
  const rows = groceryList.items.map((item) => [
    item.category,
    item.name,
    formatQuantity(item.quantity),
    formatUnit(item.unit, item.quantity),
    item.meals.join(' | '),
    checks[item.key]?.done ? 'Oui' : 'Non',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');
  downloadFile(`epicerie-${slugify(menuName)}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8');
}

export function exportBackup(state) {
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(`hearthsmith-sauvegarde-${date}.json`, JSON.stringify(state, null, 2), 'application/json');
}

/** Réduit une photo pour qu'elle tienne dans le stockage du navigateur. */
export function resizeImageFile(file, maxSize = 900, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Ce fichier n’est pas une image.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image illisible.'));
    };
    image.src = url;
  });
}
