import { Router } from 'express';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { lisansInclude, lisansListesiGetir, lisansYanitOlustur } from '../lib/lisansYardimci.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const lisanslar = await lisansListesiGetir();
  return res.json({ lisanslar });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const firmaId = Number(body.firmaId);
  const paketId = Number(body.paketId);
  if (!Number.isInteger(firmaId) || firmaId < 1) return res.status(400).json({ mesaj: 'Gecerli firma secin' });
  if (!Number.isInteger(paketId) || paketId < 1) return res.status(400).json({ mesaj: 'Gecerli paket secin' });

  const firma = await prisma.firma.findUnique({ where: { id: firmaId } });
  if (!firma) return res.status(400).json({ mesaj: 'Firma bulunamadi' });
  if (!firma.durum) return res.status(400).json({ mesaj: 'Pasif firmaya lisans atanamaz' });

  const paket = await prisma.paket.findUnique({ where: { id: paketId } });
  if (!paket) return res.status(400).json({ mesaj: 'Paket bulunamadi' });
  if (!paket.durum) return res.status(400).json({ mesaj: 'Pasif paket secilemez' });

  const baslangic = body.baslangicTarihi ? new Date(String(body.baslangicTarihi)) : new Date();
  const bitis = body.bitisTarihi ? new Date(String(body.bitisTarihi)) : null;
  if (Number.isNaN(baslangic.getTime())) return res.status(400).json({ mesaj: 'Gecersiz baslangic tarihi' });
  if (bitis && Number.isNaN(bitis.getTime())) return res.status(400).json({ mesaj: 'Gecersiz bitis tarihi' });

  const kayit = await prisma.lisans.create({
    data: {
      firmaId,
      paketId,
      baslangicTarihi: baslangic,
      bitisTarihi: bitis,
      durum: body.aktif === false ? false : true,
    },
    include: lisansInclude,
  });
  return res.status(201).json({ lisans: lisansYanitOlustur(kayit) });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ mesaj: 'Gecersiz lisans id' });

  const mevcut = await prisma.lisans.findUnique({ where: { id } });
  if (!mevcut) return res.status(404).json({ mesaj: 'Lisans bulunamadi' });

  const body = req.body as Record<string, unknown>;
  const data: Prisma.LisansUpdateInput = {};

  if (body.paketId !== undefined) {
    const paketId = Number(body.paketId);
    if (!Number.isInteger(paketId) || paketId < 1) return res.status(400).json({ mesaj: 'Gecersiz paket' });
    const paket = await prisma.paket.findUnique({ where: { id: paketId } });
    if (!paket?.durum) return res.status(400).json({ mesaj: 'Paket bulunamadi veya pasif' });
    data.paket = { connect: { id: paketId } };
  }

  if (body.baslangicTarihi !== undefined) {
    const d = new Date(String(body.baslangicTarihi));
    if (Number.isNaN(d.getTime())) return res.status(400).json({ mesaj: 'Gecersiz baslangic tarihi' });
    data.baslangicTarihi = d;
  }

  if (body.bitisTarihi !== undefined) {
    if (body.bitisTarihi === null || body.bitisTarihi === '') {
      data.bitisTarihi = null;
    } else {
      const d = new Date(String(body.bitisTarihi));
      if (Number.isNaN(d.getTime())) return res.status(400).json({ mesaj: 'Gecersiz bitis tarihi' });
      data.bitisTarihi = d;
    }
  }

  if (body.aktif !== undefined) data.durum = Boolean(body.aktif);

  if (Object.keys(data).length === 0) return res.status(400).json({ mesaj: 'Guncellenecek alan belirtilmedi' });

  const guncel = await prisma.lisans.update({
    where: { id },
    data,
    include: lisansInclude,
  });
  return res.json({ lisans: lisansYanitOlustur(guncel) });
});

export default router;
