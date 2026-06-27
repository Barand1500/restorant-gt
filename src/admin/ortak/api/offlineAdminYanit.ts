import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

const OFFLINE_SISTEM_ANAHTAR = 'restorant-offline-sistem-ayarlari';
const OFFLINE_MODUL_ANAHTAR = 'restorant-offline-moduller';
const OFFLINE_BAYI_ANAHTAR = 'restorant-offline-bayiler';
const OFFLINE_FIRMA_ANAHTAR = 'restorant-offline-firmalar';
const OFFLINE_SUBE_ANAHTAR = 'restorant-offline-subeler';
const OFFLINE_PAKET_ANAHTAR = 'restorant-offline-paketler';
const OFFLINE_LISANS_ANAHTAR = 'restorant-offline-lisanslar';

interface OfflineModul {
  id: number;
  ad: string;
  prefix: string;
  aktif: boolean;
  rolSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineBayi {
  id: number;
  unvan: string;
  ustId: number | null;
  ustUnvan: string | null;
  il: string | null;
  ilce: string | null;
  adres: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  iskonto: number | null;
  aktif: boolean;
  firmaSayisi: number;
  altBayiSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineFirma {
  id: number;
  bayiId: number;
  bayiUnvan: string;
  tabelaAdi: string | null;
  unvan: string;
  il: string | null;
  ilce: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  aktif: boolean;
  subeSayisi: number;
  lisansDurum: 'aktif' | 'pasif' | 'yakinda' | 'yok';
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineSube {
  id: number;
  firmaId: number;
  firmaUnvan: string;
  firmaTabela: string | null;
  subeAdi: string;
  subeTipi: 'restoran' | 'kafe' | 'fast_food' | 'diger';
  il: string | null;
  ilce: string | null;
  adres: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  aktif: boolean;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflinePaket {
  id: number;
  paketAdi: string;
  subeSayisi: number;
  personelSayisi: number;
  masaSayisi: number;
  fiyat: number;
  aktif: boolean;
  aktifLisansSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineLisans {
  id: number;
  firmaId: number;
  firmaUnvan: string;
  firmaTabela: string | null;
  paketId: number;
  paketAdi: string;
  baslangicTarihi: string;
  bitisTarihi: string | null;
  durum: 'aktif' | 'pasif' | 'yakinda';
  aktif: boolean;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

const VARSAYILAN_OFFLINE_MODULLER: OfflineModul[] = [
  { id: 1, ad: 'Master', prefix: 'master', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 2, ad: 'Kullanicilar', prefix: 'kullanicilar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 3, ad: 'Roller', prefix: 'roller', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 4, ad: 'Ayarlar', prefix: 'ayarlar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
];

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
    if (p.includes('/moduller')) {
      return offlineModulYaz(body, m, p);
    }
    if (p.includes('/bayiler')) {
      return offlineBayiYaz(body, m, p);
    }
    if (p.includes('/firmalar')) {
      return offlineFirmaYaz(body, m, p);
    }
    if (p.includes('/subeler')) {
      return offlineSubeYaz(body, m, p);
    }
    if (p.includes('/paketler')) {
      return offlinePaketYaz(body, m, p);
    }
    if (p.includes('/lisanslar')) {
      return offlineLisansYaz(body, m, p);
    }
    return { mesaj: 'Kayıt (offline mod)' };
  }

  if (p.includes('/moduller')) return offlineModulListe();
  if (p.includes('/bayiler')) return offlineBayiListe();
  if (p.includes('/firmalar')) return offlineFirmaListe();
  if (p.includes('/subeler')) return offlineSubeListe();
  if (p.includes('/paketler')) return offlinePaketListe();
  if (p.includes('/lisanslar')) return offlineLisansListe();

  if (p.includes('/kullanicilar/siteler')) return { siteler: [] };
  if (p.includes('/kullanicilar/master')) return offlineMasterKullaniciListe();
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

function offlineModulOku(): OfflineModul[] {
  try {
    const ham = localStorage.getItem(OFFLINE_MODUL_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineModul[];
  } catch {
    /* bozuk kayıt */
  }
  return VARSAYILAN_OFFLINE_MODULLER.map((m) => ({
    ...m,
    kayitTarihi: new Date().toISOString(),
    guncellemeTarihi: new Date().toISOString(),
  }));
}

function offlineModulKaydet(liste: OfflineModul[]) {
  localStorage.setItem(OFFLINE_MODUL_ANAHTAR, JSON.stringify(liste));
}

function offlineModulListe() {
  const moduller = offlineModulOku();
  return {
    moduller,
    ozet: {
      toplam: moduller.length,
      aktif: moduller.filter((m) => m.aktif).length,
      pasif: moduller.filter((m) => !m.aktif).length,
    },
  };
}

function offlineModulYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineModulOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as { modulAdi?: string; prefix?: string };
    const ad = girdi.modulAdi?.trim() ?? 'Yeni Modul';
    const prefix = girdi.prefix?.trim() ?? `modul_${liste.length + 1}`;
    const modul: OfflineModul = {
      id: Math.max(0, ...liste.map((m) => m.id)) + 1,
      ad,
      prefix,
      aktif: true,
      rolSayisi: 6,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineModulKaydet([...liste, modul]);
    return { modul };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as { aktif?: boolean; modulAdi?: string; prefix?: string };
    const idx = liste.findIndex((m) => m.id === id);
    if (idx < 0) return { mesaj: 'Modul bulunamadi' };
    const guncel = {
      ...liste[idx],
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      ...(girdi.modulAdi ? { ad: girdi.modulAdi.trim() } : {}),
      ...(girdi.prefix ? { prefix: girdi.prefix.trim() } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineModulKaydet(yeni);
    return { modul: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineBayiOku(): OfflineBayi[] {
  try {
    const ham = localStorage.getItem(OFFLINE_BAYI_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineBayi[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  return [
    {
      id: 1,
      unvan: 'Guzel Teknoloji',
      ustId: null,
      ustUnvan: null,
      il: 'Istanbul',
      ilce: null,
      adres: null,
      telefon: null,
      gsm: null,
      eposta: 'info@guzelteknoloji.com',
      vergiDairesi: null,
      vergiNo: null,
      iskonto: null,
      aktif: true,
      firmaSayisi: 1,
      altBayiSayisi: 0,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineBayiKaydet(liste: OfflineBayi[]) {
  localStorage.setItem(OFFLINE_BAYI_ANAHTAR, JSON.stringify(liste));
}

function offlineBayiListe() {
  const bayiler = offlineBayiOku();
  return {
    bayiler,
    ozet: {
      toplam: bayiler.length,
      aktif: bayiler.filter((b) => b.aktif).length,
      pasif: bayiler.filter((b) => !b.aktif).length,
      toplamFirma: bayiler.reduce((s, b) => s + b.firmaSayisi, 0),
      altBayi: bayiler.filter((b) => b.ustId != null).length,
    },
  };
}

function offlineBayiYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineBayiOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as { unvan?: string; ustId?: number | null; il?: string; ilce?: string; eposta?: string; telefon?: string; gsm?: string };
    const ust = girdi.ustId ? liste.find((b) => b.id === girdi.ustId) : null;
    const bayi: OfflineBayi = {
      id: Math.max(0, ...liste.map((b) => b.id)) + 1,
      unvan: girdi.unvan?.trim() ?? 'Yeni Bayi',
      ustId: girdi.ustId ?? null,
      ustUnvan: ust?.unvan ?? null,
      il: girdi.il?.trim() ?? null,
      ilce: girdi.ilce?.trim() ?? null,
      adres: null,
      telefon: girdi.telefon?.trim() ?? null,
      gsm: girdi.gsm?.trim() ?? null,
      eposta: girdi.eposta?.trim() ?? null,
      vergiDairesi: null,
      vergiNo: null,
      iskonto: null,
      aktif: true,
      firmaSayisi: 0,
      altBayiSayisi: 0,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineBayiKaydet([...liste, bayi]);
    return { bayi };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflineBayi> & { aktif?: boolean };
    const idx = liste.findIndex((b) => b.id === id);
    if (idx < 0) return { mesaj: 'Bayi bulunamadi' };
    const ust = girdi.ustId ? liste.find((b) => b.id === girdi.ustId) : liste[idx].ustId ? liste.find((b) => b.id === liste[idx].ustId) : null;
    const guncel: OfflineBayi = {
      ...liste[idx],
      ...(girdi.unvan ? { unvan: girdi.unvan.trim() } : {}),
      ...(girdi.ustId !== undefined ? { ustId: girdi.ustId, ustUnvan: ust?.unvan ?? null } : {}),
      ...(girdi.il !== undefined ? { il: girdi.il } : {}),
      ...(girdi.ilce !== undefined ? { ilce: girdi.ilce } : {}),
      ...(girdi.eposta !== undefined ? { eposta: girdi.eposta } : {}),
      ...(girdi.telefon !== undefined ? { telefon: girdi.telefon } : {}),
      ...(girdi.gsm !== undefined ? { gsm: girdi.gsm } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineBayiKaydet(yeni);
    return { bayi: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineFirmaOku(): OfflineFirma[] {
  try {
    const ham = localStorage.getItem(OFFLINE_FIRMA_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineFirma[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  return [
    {
      id: 1,
      bayiId: 1,
      bayiUnvan: 'Guzel Teknoloji',
      tabelaAdi: 'Demo Restoran',
      unvan: 'Demo Restoran Grubu',
      il: 'Istanbul',
      ilce: null,
      telefon: null,
      gsm: null,
      eposta: 'demo@restoran.local',
      aktif: true,
      subeSayisi: 1,
      lisansDurum: 'aktif',
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineFirmaKaydet(liste: OfflineFirma[]) {
  localStorage.setItem(OFFLINE_FIRMA_ANAHTAR, JSON.stringify(liste));
}

function offlineFirmaListe() {
  return { firmalar: offlineFirmaOku() };
}

function offlineFirmaYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineFirmaOku();
  const bayiler = offlineBayiOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      bayiId?: number;
      unvan?: string;
      tabelaAdi?: string;
      il?: string;
      ilce?: string;
      eposta?: string;
      telefon?: string;
      gsm?: string;
    };
    const bayi = bayiler.find((b) => b.id === girdi.bayiId);
    const firma: OfflineFirma = {
      id: Math.max(0, ...liste.map((f) => f.id)) + 1,
      bayiId: girdi.bayiId ?? 1,
      bayiUnvan: bayi?.unvan ?? 'Bayi',
      tabelaAdi: girdi.tabelaAdi?.trim() ?? null,
      unvan: girdi.unvan?.trim() ?? 'Yeni Firma',
      il: girdi.il?.trim() ?? null,
      ilce: girdi.ilce?.trim() ?? null,
      telefon: girdi.telefon?.trim() ?? null,
      gsm: girdi.gsm?.trim() ?? null,
      eposta: girdi.eposta?.trim() ?? null,
      aktif: true,
      subeSayisi: 0,
      lisansDurum: 'yok',
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineFirmaKaydet([...liste, firma]);
    return { firma };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflineFirma> & { bayiId?: number; aktif?: boolean };
    const idx = liste.findIndex((f) => f.id === id);
    if (idx < 0) return { mesaj: 'Firma bulunamadi' };
    const bayi = girdi.bayiId ? bayiler.find((b) => b.id === girdi.bayiId) : null;
    const guncel: OfflineFirma = {
      ...liste[idx],
      ...(girdi.unvan ? { unvan: girdi.unvan.trim() } : {}),
      ...(girdi.tabelaAdi !== undefined ? { tabelaAdi: girdi.tabelaAdi?.trim() ?? null } : {}),
      ...(girdi.bayiId !== undefined
        ? { bayiId: girdi.bayiId, bayiUnvan: bayi?.unvan ?? liste[idx].bayiUnvan }
        : {}),
      ...(girdi.il !== undefined ? { il: girdi.il } : {}),
      ...(girdi.ilce !== undefined ? { ilce: girdi.ilce } : {}),
      ...(girdi.eposta !== undefined ? { eposta: girdi.eposta } : {}),
      ...(girdi.telefon !== undefined ? { telefon: girdi.telefon } : {}),
      ...(girdi.gsm !== undefined ? { gsm: girdi.gsm } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineFirmaKaydet(yeni);
    return { firma: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineSubeOku(): OfflineSube[] {
  try {
    const ham = localStorage.getItem(OFFLINE_SUBE_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineSube[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  return [
    {
      id: 1,
      firmaId: 1,
      firmaUnvan: 'Demo Restoran Grubu',
      firmaTabela: 'Demo Restoran',
      subeAdi: 'Merkez Sube',
      subeTipi: 'restoran',
      il: 'Istanbul',
      ilce: null,
      adres: null,
      telefon: null,
      gsm: null,
      eposta: null,
      aktif: true,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineSubeKaydet(liste: OfflineSube[]) {
  localStorage.setItem(OFFLINE_SUBE_ANAHTAR, JSON.stringify(liste));
}

function offlineSubeListe() {
  return { subeler: offlineSubeOku() };
}

function offlineSubeYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineSubeOku();
  const firmalar = offlineFirmaOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      firmaId?: number;
      subeAdi?: string;
      subeTipi?: OfflineSube['subeTipi'];
      il?: string;
      ilce?: string;
      adres?: string;
      eposta?: string;
      telefon?: string;
      gsm?: string;
    };
    const firma = firmalar.find((f) => f.id === girdi.firmaId);
    const sube: OfflineSube = {
      id: Math.max(0, ...liste.map((s) => s.id)) + 1,
      firmaId: girdi.firmaId ?? 1,
      firmaUnvan: firma?.unvan ?? 'Firma',
      firmaTabela: firma?.tabelaAdi ?? null,
      subeAdi: girdi.subeAdi?.trim() ?? 'Yeni Sube',
      subeTipi: girdi.subeTipi ?? 'restoran',
      il: girdi.il?.trim() ?? null,
      ilce: girdi.ilce?.trim() ?? null,
      adres: girdi.adres?.trim() ?? null,
      telefon: girdi.telefon?.trim() ?? null,
      gsm: girdi.gsm?.trim() ?? null,
      eposta: girdi.eposta?.trim() ?? null,
      aktif: true,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineSubeKaydet([...liste, sube]);
    return { sube };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflineSube> & { firmaId?: number; aktif?: boolean };
    const idx = liste.findIndex((s) => s.id === id);
    if (idx < 0) return { mesaj: 'Sube bulunamadi' };
    const firma = girdi.firmaId ? firmalar.find((f) => f.id === girdi.firmaId) : null;
    const guncel: OfflineSube = {
      ...liste[idx],
      ...(girdi.subeAdi ? { subeAdi: girdi.subeAdi.trim() } : {}),
      ...(girdi.subeTipi ? { subeTipi: girdi.subeTipi } : {}),
      ...(girdi.firmaId !== undefined
        ? {
            firmaId: girdi.firmaId,
            firmaUnvan: firma?.unvan ?? liste[idx].firmaUnvan,
            firmaTabela: firma?.tabelaAdi ?? liste[idx].firmaTabela,
          }
        : {}),
      ...(girdi.il !== undefined ? { il: girdi.il } : {}),
      ...(girdi.ilce !== undefined ? { ilce: girdi.ilce } : {}),
      ...(girdi.adres !== undefined ? { adres: girdi.adres } : {}),
      ...(girdi.eposta !== undefined ? { eposta: girdi.eposta } : {}),
      ...(girdi.telefon !== undefined ? { telefon: girdi.telefon } : {}),
      ...(girdi.gsm !== undefined ? { gsm: girdi.gsm } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineSubeKaydet(yeni);
    return { sube: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlinePaketOku(): OfflinePaket[] {
  try {
    const ham = localStorage.getItem(OFFLINE_PAKET_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflinePaket[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  return [
    {
      id: 1,
      paketAdi: 'Temel Paket',
      subeSayisi: 5,
      personelSayisi: 20,
      masaSayisi: 100,
      fiyat: 0,
      aktif: true,
      aktifLisansSayisi: 1,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlinePaketKaydet(liste: OfflinePaket[]) {
  localStorage.setItem(OFFLINE_PAKET_ANAHTAR, JSON.stringify(liste));
}

function offlinePaketListe() {
  return { paketler: offlinePaketOku() };
}

function offlinePaketYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlinePaketOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as Partial<OfflinePaket>;
    const paket: OfflinePaket = {
      id: Math.max(0, ...liste.map((p) => p.id)) + 1,
      paketAdi: girdi.paketAdi?.trim() ?? 'Yeni Paket',
      subeSayisi: girdi.subeSayisi ?? 1,
      personelSayisi: girdi.personelSayisi ?? 10,
      masaSayisi: girdi.masaSayisi ?? 50,
      fiyat: girdi.fiyat ?? 0,
      aktif: true,
      aktifLisansSayisi: 0,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlinePaketKaydet([...liste, paket]);
    return { paket };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflinePaket> & { aktif?: boolean };
    const idx = liste.findIndex((p) => p.id === id);
    if (idx < 0) return { mesaj: 'Paket bulunamadi' };
    const guncel: OfflinePaket = {
      ...liste[idx],
      ...(girdi.paketAdi ? { paketAdi: girdi.paketAdi.trim() } : {}),
      ...(girdi.subeSayisi !== undefined ? { subeSayisi: girdi.subeSayisi } : {}),
      ...(girdi.personelSayisi !== undefined ? { personelSayisi: girdi.personelSayisi } : {}),
      ...(girdi.masaSayisi !== undefined ? { masaSayisi: girdi.masaSayisi } : {}),
      ...(girdi.fiyat !== undefined ? { fiyat: girdi.fiyat } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlinePaketKaydet(yeni);
    return { paket: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineLisansOku(): OfflineLisans[] {
  try {
    const ham = localStorage.getItem(OFFLINE_LISANS_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineLisans[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  const bitis = new Date();
  bitis.setFullYear(bitis.getFullYear() + 1);
  return [
    {
      id: 1,
      firmaId: 1,
      firmaUnvan: 'Demo Restoran Grubu',
      firmaTabela: 'Demo Restoran',
      paketId: 1,
      paketAdi: 'Temel Paket',
      baslangicTarihi: simdi,
      bitisTarihi: bitis.toISOString(),
      durum: 'aktif',
      aktif: true,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineLisansKaydet(liste: OfflineLisans[]) {
  localStorage.setItem(OFFLINE_LISANS_ANAHTAR, JSON.stringify(liste));
}

function offlineLisansListe() {
  return { lisanslar: offlineLisansOku() };
}

function offlineLisansYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineLisansOku();
  const firmalar = offlineFirmaOku();
  const paketler = offlinePaketOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      firmaId?: number;
      paketId?: number;
      baslangicTarihi?: string;
      bitisTarihi?: string | null;
    };
    const firma = firmalar.find((f) => f.id === girdi.firmaId);
    const paket = paketler.find((p) => p.id === girdi.paketId);
    const lisans: OfflineLisans = {
      id: Math.max(0, ...liste.map((l) => l.id)) + 1,
      firmaId: girdi.firmaId ?? 1,
      firmaUnvan: firma?.unvan ?? 'Firma',
      firmaTabela: firma?.tabelaAdi ?? null,
      paketId: girdi.paketId ?? 1,
      paketAdi: paket?.paketAdi ?? 'Paket',
      baslangicTarihi: girdi.baslangicTarihi ?? simdi,
      bitisTarihi: girdi.bitisTarihi ?? null,
      durum: 'aktif',
      aktif: true,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineLisansKaydet([...liste, lisans]);
    return { lisans };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflineLisans> & { paketId?: number; aktif?: boolean };
    const idx = liste.findIndex((l) => l.id === id);
    if (idx < 0) return { mesaj: 'Lisans bulunamadi' };
    const paket = girdi.paketId ? paketler.find((p) => p.id === girdi.paketId) : null;
    const guncel: OfflineLisans = {
      ...liste[idx],
      ...(girdi.paketId !== undefined
        ? { paketId: girdi.paketId, paketAdi: paket?.paketAdi ?? liste[idx].paketAdi }
        : {}),
      ...(girdi.baslangicTarihi !== undefined ? { baslangicTarihi: girdi.baslangicTarihi } : {}),
      ...(girdi.bitisTarihi !== undefined ? { bitisTarihi: girdi.bitisTarihi } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif), durum: girdi.aktif ? 'aktif' : 'pasif' } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineLisansKaydet(yeni);
    return { lisans: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineMasterKullaniciListe() {
  const simdi = new Date().toISOString();
  return {
    kullanicilar: [
      {
        id: 1,
        ad: 'Sistem Admin',
        eposta: 'admin@restorant.local',
        gsm: null,
        rol: 'SUPER_ADMIN',
        kullaniciTipi: 'merkez',
        bayiId: 1,
        bayiUnvan: 'Guzel Teknoloji',
        firmaId: 1,
        firmaUnvan: 'Demo Restoran Grubu',
        firmaTabela: 'Demo Restoran',
        subeId: 1,
        subeAdi: 'Merkez Sube',
        aktif: true,
        sonGirisTarihi: null,
        kayitTarihi: simdi,
        guncellemeTarihi: simdi,
      },
    ],
  };
}
