export type YedeklemeFormati = 'json' | 'sql' | 'rar' | 'zip';

export const YEDEKLEME_FORMATLARI: { deger: YedeklemeFormati; ad: string; aciklama: string }[] = [
  { deger: 'json', ad: 'JSON', aciklama: 'Tüm site verisi JSON dosyası' },
  { deger: 'sql', ad: 'SQL', aciklama: 'Veritabanı SQL dökümü' },
  { deger: 'zip', ad: 'ZIP', aciklama: 'Sıkıştırılmış arşiv' },
  { deger: 'rar', ad: 'RAR', aciklama: 'RAR arşivi' },
];

export const VARSAYILAN_YEDEKLEME_FORMATI: YedeklemeFormati = 'json';

export function yedekDosyaAdiFormatla(ad: string, format: YedeklemeFormati): string {
  const temiz = ad.replace(/\.(json|sql|rar|zip)$/i, '');
  return `${temiz}.${format}`;
}

export function yedeklemeFormatiUzantisi(format: YedeklemeFormati): string {
  return `.${format}`;
}
