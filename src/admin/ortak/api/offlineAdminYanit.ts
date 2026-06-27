import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

const OFFLINE_SISTEM_ANAHTAR = 'restorant-offline-sistem-ayarlari';

const OFFLINE_YETKILER = [
  { kod: 'goruntuleme', etiket: 'Görüntüleme' },
  { kod: 'ekleme', etiket: 'Ekleme' },
  { kod: 'duzenleme', etiket: 'Düzenleme' },
  { kod: 'silme', etiket: 'Silme' },
  { kod: 'kullanici_yonetimi', etiket: 'Kullanıcı Yönetimi' },
] as const;

const OFFLINE_ROLLER = [
  {
    kod: 'SUPER_ADMIN',
    baslik: 'Super Admin',
    aciklama: 'Tum sitelere tam erisim',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
    sistemRolu: true,
  },
  {
    kod: 'EDITOR',
    baslik: 'Editor',
    aciklama: 'Icerik duzenleme',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme'],
    sistemRolu: true,
  },
];

/** Backend olmadan admin sayfalarının boş açılması için minimal yanıtlar */
export function offlineAdminYanit(path: string, method: string, body?: BodyInit | null): unknown {
  const m = method.toUpperCase();
  const p = path.split('?')[0];

  if (m !== 'GET') {
    if (p.includes('/kullanicilar')) {
      return {
        kullanici: {
          id: '1',
          email: 'admin@restorant.local',
          ad: 'Admin',
          rol: 'SUPER_ADMIN',
          aktif: true,
        },
      };
    }
    if (p.includes('/roller')) {
      return { roller: OFFLINE_ROLLER, yetkiler: [...OFFLINE_YETKILER] };
    }
    if (p.includes('/sistem-ayarlari')) {
      if (m === 'PUT' && typeof body === 'string') {
        try {
          const form = JSON.parse(body) as SistemAyarlariForm;
          offlineSistemKaydet(form);
          return offlineSistemAyarlari(form);
        } catch {
          return offlineSistemAyarlari();
        }
      }
      return offlineSistemAyarlari();
    }
    return { mesaj: 'Kayıt (offline mod)' };
  }

  if (p.includes('/kullanicilar/siteler')) return { siteler: [] };
  if (p.includes('/kullanicilar')) return { kullanicilar: [] };
  if (p.includes('/sayfalar') || p.endsWith('/menu')) return { sayfalar: [] };
  if (p.includes('/roller/yetkiler')) return { yetkiler: [] };
  if (p.includes('/roller')) {
    return { roller: OFFLINE_ROLLER, yetkiler: [...OFFLINE_YETKILER] };
  }
  if (p.includes('/loglar')) return { loglar: [], toplam: 0 };
  if (p.includes('/yedek/varsayilan-dosya-adi')) return { dosyaAdi: 'restorant-yedek.json' };
  if (p.includes('/yedek/gecmis')) return { kayitlar: [], sonKayit: null };
  if (p.includes('/sistem-ayarlari')) return offlineSistemAyarlari();
  if (p.includes('/bildirim')) return { bildirimler: [], okunmamisSayi: 0 };
  if (p.includes('/eklentiler')) return { eklentiler: [] };

  return {};
}

function offlineSistemOku(): Partial<SistemAyarlariForm> {
  try {
    const ham = localStorage.getItem(OFFLINE_SISTEM_ANAHTAR);
    if (ham) return JSON.parse(ham) as Partial<SistemAyarlariForm>;
  } catch {
    /* bozuk kayıt */
  }
  return {};
}

function offlineSistemKaydet(form: SistemAyarlariForm) {
  localStorage.setItem(OFFLINE_SISTEM_ANAHTAR, JSON.stringify(form));
}

function offlineSistemAyarlari(form?: Partial<SistemAyarlariForm>) {
  const sistem = form ?? offlineSistemOku();
  return {
    site: {
      id: '1',
      ad: 'Restorant',
      slug: 'restorant',
      domain: null,
      aktif: form?.siteAktif ?? (sistem as SistemAyarlariForm).siteAktif ?? true,
    },
    sistem,
    surum: '0.1.0-offline',
  };
}
