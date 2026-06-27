import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { MERKEZ_SUBE_ID, varsayilanAyarlarOlustur } from '../src/lib/ayarlar.js';

const prisma = new PrismaClient();

const PANEL_MODULLERI = [
  { modulAdi: 'Kullanicilar', prefix: 'kullanicilar' },
  { modulAdi: 'Roller', prefix: 'roller' },
  { modulAdi: 'Ayarlar', prefix: 'ayarlar' },
  { modulAdi: 'Sekme Yonetimi', prefix: 'sekme_yonetimi' },
  { modulAdi: 'Kisayol Ayarlari', prefix: 'kisayol_ayarlari' },
  { modulAdi: 'Loglar', prefix: 'loglar' },
  { modulAdi: 'Veri Yedekleme', prefix: 'veri_yedekleme' },
];

const SISTEM_ROLLERI = [
  {
    kod: 'SUPER_ADMIN',
    baslik: 'Super Admin',
    aciklama: 'Tam erisim',
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
    aciklama: 'Yonetici',
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

function sifreHashle(sifre: string) {
  const tuz = randomBytes(16).toString('hex');
  const hash = scryptSync(sifre, tuz, 64).toString('hex');
  return `scrypt:${tuz}:${hash}`;
}

async function modulleriOlustur() {
  const modulMap = new Map<string, number>();
  for (const m of PANEL_MODULLERI) {
    const kayit = await prisma.modul.upsert({
      where: { prefix: m.prefix },
      create: { modulAdi: m.modulAdi, prefix: m.prefix },
      update: { modulAdi: m.modulAdi, durum: true },
    });
    modulMap.set(m.prefix, kayit.id);
  }
  return modulMap;
}

async function rolleriOlustur(modulIds: number[]) {
  for (const rol of SISTEM_ROLLERI) {
    for (const modulId of modulIds) {
      await prisma.rol.upsert({
        where: {
          rolKodu_modulId_subeId: {
            rolKodu: rol.kod,
            modulId,
            subeId: MERKEZ_SUBE_ID,
          },
        },
        create: {
          rolKodu: rol.kod,
          rolAdi: rol.baslik,
          modulId,
          yetki: rol.yetkiler,
          subeId: MERKEZ_SUBE_ID,
          sistemRolu: true,
          aciklama: rol.aciklama,
        },
        update: {
          rolAdi: rol.baslik,
          yetki: rol.yetkiler,
          sistemRolu: true,
          aciklama: rol.aciklama,
          durum: true,
        },
      });
    }
  }
}

async function organizasyonOlustur() {
  const bayi = await prisma.bayi.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      unvan: 'Guzel Teknoloji',
      eposta: 'info@guzelteknoloji.com',
      il: 'Istanbul',
      durum: true,
    },
    update: { unvan: 'Guzel Teknoloji', durum: true },
  });

  const firma = await prisma.firma.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      bayiId: bayi.id,
      tabelaAdi: 'Demo Restoran',
      unvan: 'Demo Restoran Grubu',
      eposta: 'demo@restoran.local',
      il: 'Istanbul',
      durum: true,
    },
    update: { unvan: 'Demo Restoran Grubu', durum: true },
  });

  const paket = await prisma.paket.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      paketAdi: 'Temel Paket',
      aciklama: 'Baslangic paketi',
      subeSayisi: 5,
      personelSayisi: 20,
      masaSayisi: 100,
      fiyat: 0,
      durum: true,
    },
    update: { paketAdi: 'Temel Paket', durum: true },
  });

  await prisma.lisans.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      firmaId: firma.id,
      paketId: paket.id,
      durum: true,
    },
    update: { durum: true },
  });

  const sube = await prisma.sube.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      firmaId: firma.id,
      subeAdi: 'Merkez Sube',
      subeTipi: 'restoran',
      dbBilgileri: { not: 'Tek MySQL — restoran-db' },
      lisansBilgileri: { paketId: paket.id },
      durum: true,
    },
    update: { subeAdi: 'Merkez Sube', durum: true },
  });

  return { bayi, firma, sube, paket };
}

async function main() {
  console.log('Veritabani tohum verisi yukleniyor...');

  const modulMap = await modulleriOlustur();
  const modulIds = [...modulMap.values()];
  await rolleriOlustur(modulIds);
  await varsayilanAyarlarOlustur(MERKEZ_SUBE_ID);

  const { sube } = await organizasyonOlustur();

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@restorant.local';
  const adminSifre = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

  const admin = await prisma.kullanici.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      ad: 'Sistem Admin',
      sifreHash: sifreHashle(adminSifre),
      rolKodu: 'SUPER_ADMIN',
      kullaniciTipi: 'merkez',
      subeId: sube.id,
      aktif: true,
    },
    update: {
      ad: 'Sistem Admin',
      rolKodu: 'SUPER_ADMIN',
      kullaniciTipi: 'merkez',
      subeId: sube.id,
      aktif: true,
      sifreHash: sifreHashle(adminSifre),
    },
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

  await prisma.kullaniciSekmeAyar.upsert({
    where: { kullaniciId: admin.id },
    create: { kullaniciId: admin.id, ayarlar: {} },
    update: {},
  });

  console.log('Tohum verisi tamamlandi.');
  console.log(`  Admin id: ${admin.id} — ${adminEmail}`);
  console.log(`  Sube id: ${sube.id} — ${sube.subeAdi}`);
}

main()
  .catch((err) => {
    console.error('Tohum verisi hatasi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
