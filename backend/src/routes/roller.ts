import { Router } from 'express';
import type { Response } from 'express';
import { MERKEZ_SUBE_ID } from '../lib/ayarlar.js';
import { rolSatirlarindanOzet, yetkiListesiYanit } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

async function rolleriGetir() {
  const [satirlar, moduller] = await Promise.all([
    prisma.rol.findMany({
      where: { subeId: MERKEZ_SUBE_ID },
      orderBy: [{ rolKodu: 'asc' }, { modulId: 'asc' }],
    }),
    prisma.modul.findMany({ where: { durum: true }, orderBy: { prefix: 'asc' } }),
  ]);

  return {
    roller: rolSatirlarindanOzet(satirlar),
    yetkiler: yetkiListesiYanit(),
    moduller: moduller.map((m) => ({
      id: m.id,
      ad: m.modulAdi,
      prefix: m.prefix,
    })),
    matris: satirlar.map((s) => ({
      rolKodu: s.rolKodu,
      modulId: s.modulId,
      yetkiler: Array.isArray(s.yetki) ? s.yetki : [],
    })),
  };
}

router.get('/', async (_req: AuthRequest, res: Response) => {
  return res.json(await rolleriGetir());
});

router.put('/', async (req: AuthRequest, res: Response) => {
  const { roller } = req.body as {
    roller?: {
      kod: string;
      baslik: string;
      aciklama: string;
      yetkiler: string[];
      sistemRolu?: boolean;
    }[];
  };

  if (!Array.isArray(roller)) {
    return res.status(400).json({ mesaj: 'Roller listesi gerekli' });
  }

  const moduller = await prisma.modul.findMany({ where: { durum: true } });
  if (!moduller.length) {
    return res.status(400).json({ mesaj: 'Modul tanimi bulunamadi' });
  }

  const gelenKodlar = new Set(roller.map((r) => r.kod));

  await prisma.rol.deleteMany({
    where: {
      subeId: MERKEZ_SUBE_ID,
      sistemRolu: false,
      rolKodu: { notIn: [...gelenKodlar] },
    },
  });

  for (const rol of roller) {
    for (const modul of moduller) {
      await prisma.rol.upsert({
        where: {
          rolKodu_modulId_subeId: {
            rolKodu: rol.kod,
            modulId: modul.id,
            subeId: MERKEZ_SUBE_ID,
          },
        },
        create: {
          rolKodu: rol.kod,
          rolAdi: rol.baslik,
          modulId: modul.id,
          yetki: rol.yetkiler ?? [],
          subeId: MERKEZ_SUBE_ID,
          sistemRolu: rol.sistemRolu ?? false,
          aciklama: rol.aciklama ?? '',
        },
        update: {
          rolAdi: rol.baslik,
          yetki: rol.yetkiler ?? [],
          aciklama: rol.aciklama ?? '',
        },
      });
    }
  }

  return res.json(await rolleriGetir());
});

export default router;
