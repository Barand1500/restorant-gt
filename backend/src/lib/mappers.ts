import type { Kullanici, Rol, RolYetki, SiteAyar } from '@prisma/client';
import { prisma } from './prisma.js';

const VARSAYILAN_SITE = {
  id: 1,
  ad: 'Restorant',
  slug: 'restorant',
  domain: null as string | null,
  aktif: true,
};

export async function varsayilanSiteAyarBul(): Promise<SiteAyar> {
  const ayar = await prisma.siteAyar.findUnique({ where: { siteId: 1 } });
  if (!ayar) throw new Error('Site ayari bulunamadi. Once npm run db:seed calistirin.');
  return ayar;
}

export async function kullaniciYetkileriAl(kullanici: Kullanici): Promise<string[]> {
  const rol = await prisma.rol.findUnique({
    where: { kod: kullanici.rolKodu },
    include: { yetkiler: true },
  });
  return rol?.yetkiler.map((y: RolYetki) => y.yetkiKodu) ?? [];
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
    pin: null,
    olusturma: tarihIso(k.olusturma),
    guncelleme: tarihIso(k.guncelleme),
  };
}

export function sistemAyarlariYanit(ayar: SiteAyar, surum: string) {
  const sayfa404 = (ayar.sayfa404 ?? {}) as Record<string, unknown>;
  const scriptAyarlari = (ayar.scriptAyarlari ?? {}) as Record<string, string>;
  const sagTikPaneli = (ayar.sagTikPaneli ?? {}) as Record<string, unknown>;

  return {
    site: { ...VARSAYILAN_SITE },
    sistem: {
      siteAktif: VARSAYILAN_SITE.aktif,
      domain: VARSAYILAN_SITE.domain ?? '',
      bakimModu: ayar.bakimModu,
      bakimBaslik: ayar.bakimBaslik,
      bakimMesaji: ayar.bakimMesaji,
      bakimGorselUrl: ayar.bakimGorselUrl ?? '',
      bakimTahminiSure: ayar.bakimTahminiSure ?? '',
      bakimIpBeyazListe: Array.isArray(ayar.bakimIpBeyazListe)
        ? (ayar.bakimIpBeyazListe as string[])
        : [],
      logSaklamaGun: ayar.logSaklamaGun,
      panelDili: ayar.panelDili,
      panelCeviriler: (ayar.panelCeviriler as Record<string, Record<string, string>>) ?? {},
      sayfa404: {
        baslik: String(sayfa404.baslik ?? 'Sayfa Bulunamadi'),
        mesaj: String(sayfa404.mesaj ?? ''),
        gorselUrl: String(sayfa404.gorselUrl ?? ''),
        menuTipi: (sayfa404.menuTipi as string) ?? 'ust',
        oneriSayfaId: (sayfa404.oneriSayfaId as string | null) ?? null,
        anaSayfaButonu: sayfa404.anaSayfaButonu !== false,
      },
      otomatikYedekleme: ayar.otomatikYedekleme,
      otomatikYedeklemeGun: ayar.otomatikYedeklemeGun,
      yedeklemeFormati: ayar.yedeklemeFormati,
      guvenlikBasliklari: ayar.guvenlikBasliklari,
      robotsEngelle: ayar.robotsEngelle,
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

export function rolYanit(rol: Rol & { yetkiler: RolYetki[] }) {
  return {
    kod: rol.kod,
    baslik: rol.baslik,
    aciklama: rol.aciklama,
    yetkiler: rol.yetkiler.map((y) => y.yetkiKodu),
    sistemRolu: rol.sistemRolu,
  };
}
