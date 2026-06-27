import { Router } from 'express';
import type { Response } from 'express';
import { tarihIso } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const loglar = await prisma.islemLogu.findMany({
    orderBy: { olusturma: 'desc' },
    take: 500,
  });

  return res.json({
    loglar: loglar.map((l) => ({
      id: l.id,
      kullaniciId: l.kullaniciId,
      kullaniciAd: l.kullaniciAd,
      kullaniciEmail: l.kullaniciEmail,
      islem: l.islem,
      modulId: l.modulId,
      aksiyonId: l.aksiyonId,
      olusturma: tarihIso(l.olusturma),
    })),
  });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const k = req.kullanici!;
  const { islem, modulId, aksiyonId } = req.body as {
    islem?: string;
    modulId?: string;
    aksiyonId?: string;
  };

  if (!islem?.trim()) {
    return res.status(400).json({ mesaj: 'Islem metni gerekli' });
  }

  await prisma.islemLogu.create({
    data: {
      kullaniciId: k.id,
      kullaniciAd: k.ad,
      kullaniciEmail: k.email,
      islem: islem.trim(),
      modulId: modulId ?? null,
      aksiyonId: aksiyonId ?? null,
    },
  });

  return res.json({ mesaj: 'Kaydedildi' });
});

router.delete('/temizle', async (_req: AuthRequest, res: Response) => {
  const ayar = await prisma.siteAyar.findUnique({ where: { siteId: 1 } });
  const gun = ayar?.logSaklamaGun ?? 90;
  const esik = new Date();
  esik.setDate(esik.getDate() - gun);

  await prisma.islemLogu.deleteMany({
    where: { olusturma: { lt: esik } },
  });

  return res.json({ mesaj: 'Eski loglar temizlendi' });
});

export default router;
