/** Tasarım önizlemesi — API bağlanınca kaldırılacak örnek veriler */

export const ORNEK_MODULLER = [
  { id: 1, ad: 'Restoran Paneli', prefix: 'restoran', rolSayisi: 6, aktif: true },
  { id: 2, ad: 'Ayarlar', prefix: 'ayarlar', rolSayisi: 2, aktif: true },
];

export const ORNEK_BAYILER = [
  { id: 1, unvan: 'Güzel Teknoloji Ana Bayi', il: 'İstanbul', altBayi: 0, firma: 1, aktif: true },
  { id: 2, unvan: 'Ege Bölge Bayi', il: 'İzmir', altBayi: 0, firma: 0, aktif: true, ust: 'Güzel Teknoloji' },
];

export const ORNEK_FIRMALAR = [
  { id: 1, tabela: 'Lezzet Durağı', unvan: 'Lezzet Durağı Gıda Ltd.', bayi: 'Güzel Teknoloji', sube: 2, lisans: 'Aktif' },
  { id: 2, tabela: 'Kahve Köşesi', unvan: 'Kahve Köşesi İşletmesi', bayi: 'Ege Bölge Bayi', sube: 1, lisans: 'Yakında bitiyor' },
];

export const ORNEK_SUBELER = [
  { id: 1, ad: 'Lezzet Durağı — Kadıköy', firma: 'Lezzet Durağı', tip: 'restoran', il: 'İstanbul', aktif: true },
  { id: 2, ad: 'Lezzet Durağı — Beşiktaş', firma: 'Lezzet Durağı', tip: 'restoran', il: 'İstanbul', aktif: true },
  { id: 3, ad: 'Kahve Köşesi Merkez', firma: 'Kahve Köşesi', tip: 'kafe', il: 'İzmir', aktif: true },
];

export const ORNEK_KULLANICILAR = [
  { id: 1, ad: 'Sistem Yöneticisi', eposta: 'admin@restorant.local', tip: 'merkez', rol: 'SUPER_ADMIN', aktif: true },
  { id: 2, ad: 'Ahmet Yılmaz', eposta: 'ahmet@lezzet.com', tip: 'firma', rol: 'MUSTERI_ADMIN', aktif: true },
];

export const ORNEK_PAKETLER = [
  { id: 1, ad: 'Başlangıç', sube: 1, personel: 5, masa: 20, fiyat: 499, aktif: true },
  { id: 2, ad: 'Profesyonel', sube: 3, personel: 15, masa: 80, fiyat: 1299, aktif: true },
  { id: 3, ad: 'Kurumsal', sube: 10, personel: 50, masa: 200, fiyat: 3499, aktif: true },
];

export const ORNEK_LISANSLAR = [
  { id: 1, firma: 'Lezzet Durağı', paket: 'Profesyonel', baslangic: '01.01.2026', bitis: '01.01.2027', durum: 'aktif' as const },
  { id: 2, firma: 'Kahve Köşesi', paket: 'Başlangıç', baslangic: '15.03.2026', bitis: '15.06.2026', durum: 'yakinda' as const },
];
