import { PrismaClient, YedeklemeFormati } from '@prisma/client';
import { createHash, randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();

const VARSAYILAN_YETKILER = [
  { kod: 'goruntuleme', etiket: 'Goruntuleme' },
  { kod: 'ekleme', etiket: 'Ekleme' },
  { kod: 'duzenleme', etiket: 'Duzenleme' },
  { kod: 'silme', etiket: 'Silme' },
  { kod: 'kullanici_yonetimi', etiket: 'Kullanici Yonetimi' },
] as const;

const SISTEM_ROLLERI: {
  kod: string;
  baslik: string;
  aciklama: string;
  yetkiler: (typeof VARSAYILAN_YETKILER)[number]['kod'][];
}[] = [
  {
    kod: 'SUPER_ADMIN',
    baslik: 'Super Admin',
    aciklama: 'Tum sitelere tam erisim',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
  },
  {
    kod: 'AJANS_ADMIN',
    baslik: 'Ajans Admin',
    aciklama: 'Ajans musterilerini yonetir',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
  },
  {
    kod: 'MUSTERI_ADMIN',
    baslik: 'Musteri Admin',
    aciklama: 'Site sahibi yonetici',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
  },
  {
    kod: 'EDITOR',
    baslik: 'Editor',
    aciklama: 'Icerik duzenleme',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme'],
  },
  {
    kod: 'SEO_EDITOR',
    baslik: 'SEO Editoru',
    aciklama: 'SEO ve meta alanlari',
    yetkiler: ['goruntuleme', 'duzenleme'],
  },
  {
    kod: 'GORUNTULEME',
    baslik: 'Sadece Goruntuleme',
    aciklama: 'Salt okunur erisim',
    yetkiler: ['goruntuleme'],
  },
];

function sifreHashle(sifre: string): string {
  const tuz = randomBytes(16).toString('hex');
  const hash = scryptSync(sifre, tuz, 64).toString('hex');
  return `scrypt:${tuz}:${hash}`;
}

function pinHashle(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

async function main() {
  console.log('Veritabani tohum verisi yukleniyor...');

  for (const yetki of VARSAYILAN_YETKILER) {
    await prisma.yetki.upsert({
      where: { kod: yetki.kod },
      create: yetki,
      update: { etiket: yetki.etiket },
    });
  }

  const site = await prisma.site.upsert({
    where: { slug: 'restorant' },
    create: {
      ad: 'Restorant',
      slug: 'restorant',
      domain: null,
      aktif: true,
    },
    update: {
      ad: 'Restorant',
      aktif: true,
    },
  });

  await prisma.siteAyar.upsert({
    where: { siteId: site.id },
    create: {
      siteId: site.id,
      bakimModu: false,
      bakimBaslik: 'Bakim Calismasi',
      bakimMesaji: 'Site gecici olarak bakimda. Lutfen daha sonra tekrar deneyin.',
      logSaklamaGun: 90,
      panelDili: 'tr',
      otomatikYedekleme: false,
      otomatikYedeklemeGun: 7,
      yedeklemeFormati: YedeklemeFormati.json,
      guvenlikBasliklari: true,
      robotsEngelle: false,
      sayfa404: {
        baslik: 'Sayfa Bulunamadi',
        mesaj: 'Aradiginiz sayfa tasinmis, silinmis veya hic var olmamis olabilir.',
        gorselUrl: '',
        menuTipi: 'ust',
        oneriSayfaId: null,
        anaSayfaButonu: true,
      },
      sagTikPaneli: { aktif: true, ogeler: [], modulIdler: [] },
      scriptAyarlari: {
        googleAnalytics: '',
        headerScript: '',
        bodyAcilisScript: '',
        footerScript: '',
      },
    },
    update: {},
  });

  for (const rol of SISTEM_ROLLERI) {
    const kayit = await prisma.rol.upsert({
      where: {
        siteId_kod: { siteId: site.id, kod: rol.kod },
      },
      create: {
        siteId: site.id,
        kod: rol.kod,
        baslik: rol.baslik,
        aciklama: rol.aciklama,
        sistemRolu: true,
      },
      update: {
        baslik: rol.baslik,
        aciklama: rol.aciklama,
        sistemRolu: true,
      },
    });

    await prisma.rolYetki.deleteMany({ where: { rolId: kayit.id } });
    await prisma.rolYetki.createMany({
      data: rol.yetkiler.map((yetkiKodu) => ({
        rolId: kayit.id,
        yetkiKodu,
      })),
      skipDuplicates: true,
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@restorant.local';
  const adminSifre = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const adminPin = process.env.SEED_ADMIN_PIN ?? '1234';

  const admin = await prisma.kullanici.upsert({
    where: { email: adminEmail },
    create: {
      siteId: null,
      email: adminEmail,
      ad: 'Restorant Admin',
      sifreHash: sifreHashle(adminSifre),
      pinHash: pinHashle(adminPin),
      rolKodu: 'SUPER_ADMIN',
      aktif: true,
    },
    update: {
      ad: 'Restorant Admin',
      rolKodu: 'SUPER_ADMIN',
      aktif: true,
    },
  });

  await prisma.kullaniciTercih.upsert({
    where: { kullaniciId: admin.id },
    create: {
      kullaniciId: admin.id,
      dashboardHizliErisim: [],
    },
    update: {},
  });

  await prisma.kullaniciKisayol.upsert({
    where: { kullaniciId: admin.id },
    create: {
      kullaniciId: admin.id,
      harita: {
        rehber: 'F1',
        kaydet: 'Ctrl+S',
        ekle: 'Ctrl+N',
        onizle: 'Ctrl+P',
        sil: 'Delete',
        oncekiKayit: 'Alt+ArrowLeft',
        sonrakiKayit: 'Alt+ArrowRight',
      },
    },
    update: {},
  });

  console.log('Tohum verisi tamamlandi.');
  console.log(`  Site: ${site.slug} (${site.id})`);
  console.log(`  Admin: ${adminEmail}`);
  console.log(`  Sifre: ${adminSifre} (ortam degiskeni ile degistirilebilir)`);
  console.log(`  PIN: ${adminPin}`);
}

main()
  .catch((err) => {
    console.error('Tohum verisi hatasi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
