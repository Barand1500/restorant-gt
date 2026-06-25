import type { AdminModul } from '@/types/admin';

export const adminModulleri: AdminModul[] = [
  {
    id: 'kullanicilar',
    baslik: 'Kullanıcılar',
    ikon: '👥',
    kategori: 'Müşteri / Ajans',
    yol: '/gt-admin/kullanicilar',
  },
  {
    id: 'roller',
    baslik: 'Roller ve Yetkiler',
    ikon: '🔐',
    kategori: 'Müşteri / Ajans',
    yol: '/gt-admin/roller',
  },
  {
    id: 'ayarlar',
    baslik: 'Ayarlar',
    ikon: '🔧',
    kategori: 'Sistem',
    yol: '/gt-admin/ayarlar',
  },
  {
    id: 'sekme-yonetimi',
    baslik: 'Sekme Yönetimi',
    ikon: '🗂️',
    kategori: 'Sistem',
    yol: '/gt-admin/sekme-yonetimi',
  },
  {
    id: 'kisayol-ayarlari',
    baslik: 'Kısayol Ayarları',
    ikon: '⌨️',
    kategori: 'Sistem',
    yol: '/gt-admin/kisayol-ayarlari',
  },
];

/** Footer vb. üzerinden açılan, başlat menüsünde görünmeyen modüller */
export const adminGizliModuller: AdminModul[] = [
  {
    id: 'loglar',
    baslik: 'Log Takibi',
    ikon: '📜',
    kategori: 'Sistem',
    yol: '/gt-admin/loglar',
    menuGizle: true,
  },
  {
    id: 'veri-yedekleme',
    baslik: 'Veri Yedekleme',
    ikon: '💾',
    kategori: 'Sistem',
    yol: '/gt-admin/veri-yedekleme',
    menuGizle: true,
  },
];

export const adminKategoriler = ['Müşteri / Ajans', 'Sistem'];

export function modulBul(id: string): AdminModul | undefined {
  return adminModulleri.find((m) => m.id === id) ?? adminGizliModuller.find((m) => m.id === id);
}

/** /gt-admin/... yolundan modül bulur (iç linkler için) */
export function modulYolundanBul(pathname: string): AdminModul | undefined {
  const normalized = pathname.replace(/\/+$/, '') || '/gt-admin';
  const tumModuller = [...adminModulleri, ...adminGizliModuller];
  return tumModuller
    .slice()
    .sort((a, b) => b.yol.length - a.yol.length)
    .find((m) => {
      const yol = m.yol.replace(/\/+$/, '') || '/gt-admin';
      return normalized === yol;
    });
}

export function modulAra(terim: string): AdminModul[] {
  const q = terim.toLowerCase().trim();
  if (!q) return adminModulleri;
  return adminModulleri.filter(
    (m) =>
      m.baslik.toLowerCase().includes(q) ||
      m.kategori.toLowerCase().includes(q) ||
      m.id.includes(q)
  );
}
