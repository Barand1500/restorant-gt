import type { Paket } from '@prisma/client';
import { prisma } from './prisma.js';

export function paketYanitOlustur(p: Paket) {
  return {
    id: p.id,
    paketAdi: p.paketAdi,
    subeSayisi: p.subeSayisi,
    personelSayisi: p.personelSayisi,
    masaSayisi: p.masaSayisi,
    fiyat: Number(p.fiyat),
    paraBirimi: p.paraBirimi,
    aktif: p.durum,
    kayitTarihi: p.kayitTarihi.toISOString(),
    guncellemeTarihi: p.guncellemeTarihi.toISOString(),
  };
}

export async function paketListesiGetir() {
  const kayitlar = await prisma.paket.findMany({
    orderBy: [{ durum: 'desc' }, { fiyat: 'asc' }],
  });
  return kayitlar.map(paketYanitOlustur);
}

export async function paketLisansSayilariGetir() {
  const sayimlar = await prisma.lisans.groupBy({
    by: ['paketId'],
    where: { durum: true },
    _count: { id: true },
  });
  return new Map(sayimlar.map((s) => [s.paketId, s._count.id]));
}
