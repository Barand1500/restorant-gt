import { Router } from 'express';
import type { Response } from 'express';
import { rolYanit } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

const YETKI_ETIKETLERI: Record<string, string> = {
  goruntuleme: 'Goruntuleme',
  ekleme: 'Ekleme',
  duzenleme: 'Duzenleme',
  silme: 'Silme',
  kullanici_yonetimi: 'Kullanici Yonetimi',
};

async function rolleriGetir() {
  const roller = await prisma.rol.findMany({
    include: { yetkiler: true },
    orderBy: { kod: 'asc' },
  });

  const yetkiler = await prisma.yetki.findMany({ orderBy: { kod: 'asc' } });

  return {
    roller: roller.map(rolYanit),
    yetkiler: yetkiler.map((y) => ({ kod: y.kod, etiket: YETKI_ETIKETLERI[y.kod] ?? y.etiket })),
  };
}

router.get('/', async (_req: AuthRequest, res: Response) => {
  return res.json(await rolleriGetir());
});

router.put('/', async (req: AuthRequest, res: Response) => {
  const { roller } = req.body as {
    roller?: { kod: string; baslik: string; aciklama: string; yetkiler: string[]; sistemRolu?: boolean }[];
  };

  if (!Array.isArray(roller)) {
    return res.status(400).json({ mesaj: 'Roller listesi gerekli' });
  }

  for (const rol of roller) {
    const kayit = await prisma.rol.upsert({
      where: { kod: rol.kod },
      create: {
        kod: rol.kod,
        baslik: rol.baslik,
        aciklama: rol.aciklama ?? '',
        sistemRolu: rol.sistemRolu ?? false,
      },
      update: {
        baslik: rol.baslik,
        aciklama: rol.aciklama ?? '',
      },
    });

    await prisma.rolYetki.deleteMany({ where: { rolId: kayit.id } });
    if (rol.yetkiler?.length) {
      await prisma.rolYetki.createMany({
        data: rol.yetkiler.map((yetkiKodu) => ({ rolId: kayit.id, yetkiKodu })),
        skipDuplicates: true,
      });
    }
  }

  return res.json(await rolleriGetir());
});

export default router;
