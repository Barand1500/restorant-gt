import type { Kullanici, Rol } from '@prisma/client';
import { MERKEZ_SUBE_ID, tumAyarlarOku } from './ayarlar.js';
import { prisma } from './prisma.js';

const VARSAYILAN_SITE = {
  id: 1,
  ad: 'Guzel Teknoloji',
  slug: 'guzel-teknoloji',
  domain: null as string | null,
  aktif: true,
};

const YETKI_ETIKETLERI: Record<string, string> = {
  goruntuleme: 'Goruntuleme',
  ekleme: 'Ekleme',
  duzenleme: 'Duzenleme',
  silme: 'Silme',
  kullanici_yonetimi: 'Kullanici Yonetimi',
};

export const GECERLI_YETKILER = Object.keys(YETKI_ETIKETLERI);

export async function kullaniciYetkileriAl(kullanici: Kullanici): Promise<string[]> {
  const satirlar = await prisma.rol.findMany({
    where: { rolKodu: kullanici.rolKodu, subeId: MERKEZ_SUBE_ID, durum: true },
  });

  const birlesik = new Set<string>();
  for (const satir of satirlar) {
    const liste = Array.isArray(satir.yetki) ? (satir.yetki as string[]) : [];
    for (const y of liste) birlesik.add(y);
  }
  return [...birlesik];
}

export function tarihIso(d: Date): string {
  return d.toISOString();
}

export function kullaniciYanit(k: Kullanici, yetkiler: string[]) {
  return {
    id: k.id,
    email: k.email,
    ad: k.ad,
    rol: k.rolKodu,
    yetkiler,
  };
}

export function adminKullaniciYanit(k: Kullanici) {
  return {
    id: k.id,
    email: k.email,
    ad: k.ad,
    rol: k.rolKodu,
    aktif: k.aktif,
    olusturma: tarihIso(k.olusturma),
    guncelleme: tarihIso(k.guncelleme),
  };
}

export async function sistemAyarlariYanitOlustur(surum: string) {
  const ayarlar = await tumAyarlarOku(MERKEZ_SUBE_ID);
  const bakim = ayarlar.bakim as {
    modu?: boolean;
    baslik?: string;
    mesaj?: string;
    gorselUrl?: string;
    tahminiSure?: string;
    ipBeyazListe?: string[];
  };
  const sayfa404 = ayarlar.sayfa404 as Record<string, unknown>;
  const yedekleme = ayarlar.yedekleme as { otomatik?: boolean; gun?: number; format?: string };
  const guvenlik = ayarlar.guvenlik as { basliklari?: boolean; robotsEngelle?: boolean };
  const scriptAyarlari = ayarlar.script as Record<string, string>;
  const sagTikPaneli = ayarlar.sagTikPaneli as Record<string, unknown>;

  return {
    site: {
      ...VARSAYILAN_SITE,
      aktif: Boolean(ayarlar.siteAktif),
      domain: String(ayarlar.domain || '') || null,
    },
    sistem: {
      siteAktif: Boolean(ayarlar.siteAktif),
      domain: String(ayarlar.domain ?? ''),
      bakimModu: Boolean(bakim.modu),
      bakimBaslik: String(bakim.baslik ?? 'Bakim Calismasi'),
      bakimMesaji: String(bakim.mesaj ?? ''),
      bakimGorselUrl: String(bakim.gorselUrl ?? ''),
      bakimTahminiSure: String(bakim.tahminiSure ?? ''),
      bakimIpBeyazListe: Array.isArray(bakim.ipBeyazListe) ? bakim.ipBeyazListe : [],
      logSaklamaGun: Number(ayarlar.logSaklamaGun ?? 90),
      panelDili: String(ayarlar.panelDili ?? 'tr'),
      panelCeviriler: ayarlar.panelCeviriler ?? {},
      sayfa404: {
        baslik: String(sayfa404.baslik ?? 'Sayfa Bulunamadi'),
        mesaj: String(sayfa404.mesaj ?? ''),
        gorselUrl: String(sayfa404.gorselUrl ?? ''),
        menuTipi: (sayfa404.menuTipi as string) ?? 'ust',
        oneriSayfaId: (sayfa404.oneriSayfaId as string | null) ?? null,
        anaSayfaButonu: sayfa404.anaSayfaButonu !== false,
      },
      otomatikYedekleme: Boolean(yedekleme.otomatik),
      otomatikYedeklemeGun: Number(yedekleme.gun ?? 7),
      yedeklemeFormati: yedekleme.format ?? 'json',
      guvenlikBasliklari: guvenlik.basliklari !== false,
      robotsEngelle: Boolean(guvenlik.robotsEngelle),
      sagTikPaneli,
      scriptAyarlari: {
        googleAnalytics: scriptAyarlari.googleAnalytics ?? '',
        headerScript: scriptAyarlari.headerScript ?? '',
        bodyAcilisScript: scriptAyarlari.bodyAcilisScript ?? '',
        footerScript: scriptAyarlari.footerScript ?? '',
      },
    },
    surum,
  };
}

export function rolSatirlarindanOzet(satirlar: Rol[]) {
  const gruplar = new Map<
    string,
    { kod: string; baslik: string; aciklama: string; yetkiler: Set<string>; sistemRolu: boolean }
  >();

  for (const satir of satirlar) {
    const mevcut = gruplar.get(satir.rolKodu) ?? {
      kod: satir.rolKodu,
      baslik: satir.rolAdi,
      aciklama: satir.aciklama,
      yetkiler: new Set<string>(),
      sistemRolu: satir.sistemRolu,
    };
    const liste = Array.isArray(satir.yetki) ? (satir.yetki as string[]) : [];
    for (const y of liste) mevcut.yetkiler.add(y);
    gruplar.set(satir.rolKodu, mevcut);
  }

  return [...gruplar.values()]
    .sort((a, b) => a.kod.localeCompare(b.kod))
    .map((g) => ({
      kod: g.kod,
      baslik: g.baslik,
      aciklama: g.aciklama,
      yetkiler: [...g.yetkiler].filter((y) => GECERLI_YETKILER.includes(y)),
      sistemRolu: g.sistemRolu,
    }));
}

export function yetkiListesiYanit() {
  return GECERLI_YETKILER.map((kod) => ({
    kod,
    etiket: YETKI_ETIKETLERI[kod] ?? kod,
  }));
}
