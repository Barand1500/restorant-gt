import { Router } from 'express';
import type { Response } from 'express';
import { config } from '../config.js';
import { sistemAyarlariYanit, varsayilanSiteAyarBul } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';

const router = Router();
router.use(authZorunlu);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const ayar = await varsayilanSiteAyarBul();
  return res.json(sistemAyarlariYanit(ayar, config.surum));
});

router.put('/', async (req: AuthRequest, res: Response) => {
  const form = req.body as Record<string, unknown>;

  const ayar = await prisma.siteAyar.update({
    where: { siteId: 1 },
    data: {
      bakimModu: Boolean(form.bakimModu),
      bakimBaslik: String(form.bakimBaslik ?? ''),
      bakimMesaji: String(form.bakimMesaji ?? ''),
      bakimGorselUrl: String(form.bakimGorselUrl ?? '') || null,
      bakimTahminiSure: String(form.bakimTahminiSure ?? '') || null,
      bakimIpBeyazListe: Array.isArray(form.bakimIpBeyazListe) ? form.bakimIpBeyazListe : [],
      logSaklamaGun: Number(form.logSaklamaGun ?? 90),
      panelDili: String(form.panelDili ?? 'tr'),
      panelCeviriler: form.panelCeviriler ?? {},
      sayfa404: form.sayfa404 ?? {},
      otomatikYedekleme: Boolean(form.otomatikYedekleme),
      otomatikYedeklemeGun: Number(form.otomatikYedeklemeGun ?? 7),
      yedeklemeFormati: (form.yedeklemeFormati as 'json' | 'sql' | 'rar' | 'zip') ?? 'json',
      guvenlikBasliklari: form.guvenlikBasliklari !== false,
      robotsEngelle: Boolean(form.robotsEngelle),
      sagTikPaneli: form.sagTikPaneli ?? {},
      scriptAyarlari: form.scriptAyarlari ?? {},
    },
  });

  return res.json(sistemAyarlariYanit(ayar, config.surum));
});

export default router;
