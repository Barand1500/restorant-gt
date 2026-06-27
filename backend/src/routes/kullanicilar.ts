import { Router } from 'express';
import type { Response } from 'express';
import { sifreHashle } from '../lib/crypto.js';
import { adminKullaniciYanit } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const kullanicilar = await prisma.kullanici.findMany({
    orderBy: { olusturma: 'desc' },
  });
  return res.json({ kullanicilar: kullanicilar.map(adminKullaniciYanit) });
});

/** Eski frontend uyumlulugu — site modulu kaldirildi */
router.get('/siteler', (_req: AuthRequest, res: Response) => {
  return res.json({ siteler: [] });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { email, ad, sifre, rol, aktif } = req.body as {
    email?: string;
    ad?: string;
    sifre?: string;
    rol?: string;
    aktif?: boolean;
  };

  if (!email?.trim() || !ad?.trim() || !sifre?.trim() || !rol) {
    return res.status(400).json({ mesaj: 'Zorunlu alanlar eksik' });
  }

  const kullanici = await prisma.kullanici.create({
    data: {
      email: email.trim().toLowerCase(),
      ad: ad.trim(),
      sifreHash: sifreHashle(sifre),
      rolKodu: rol,
      aktif: aktif !== false,
    },
  });

  await prisma.kullaniciKisayol.create({
    data: { kullaniciId: kullanici.id, harita: {} },
  });

  return res.status(201).json({ kullanici: adminKullaniciYanit(kullanici) });
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { email, ad, sifre, rol, aktif } = req.body as {
    email?: string;
    ad?: string;
    sifre?: string;
    rol?: string;
    aktif?: boolean;
  };

  const veri: Record<string, unknown> = {};
  if (email) veri.email = email.trim().toLowerCase();
  if (ad) veri.ad = ad.trim();
  if (rol) veri.rolKodu = rol;
  if (aktif !== undefined) veri.aktif = aktif;
  if (sifre?.trim()) veri.sifreHash = sifreHashle(sifre);

  const kullanici = await prisma.kullanici.update({
    where: { id },
    data: veri,
  });

  return res.json({ kullanici: adminKullaniciYanit(kullanici) });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (id === req.kullanici?.id) {
    return res.status(400).json({ mesaj: 'Kendi hesabinizi silemezsiniz' });
  }
  await prisma.kullanici.delete({ where: { id } });
  return res.json({ mesaj: 'Silindi' });
});

export default router;
