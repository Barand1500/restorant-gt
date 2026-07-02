import { useCallback, useState } from 'react';
import type { AdminModul, AdminSekme } from '@/admin/ortak/tipler/admin';
import { modulBul } from '@/admin/veri/adminMenuYapisi';
import { sekmeAyarlariOku } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

const VARSAYILAN_SEKMELER: AdminSekme[] = [
  { id: 'kullanicilar', modulId: 'kullanicilar', baslik: 'Kullanıcılar' },
];

function sonrakiAktifSekme(liste: AdminSekme[], kapatilanId: string): string {
  const idx = liste.findIndex((s) => s.id === kapatilanId);
  if (idx < 0) return liste[0]?.id ?? 'kullanicilar';
  const komşu = liste[idx + 1] ?? liste[idx - 1];
  return komşu?.id ?? liste[0]?.id ?? 'kullanicilar';
}

function grupIdleriTemizle(liste: AdminSekme[]): AdminSekme[] {
  const sayilar = new Map<string, number>();
  for (const s of liste) {
    if (s.grupId) sayilar.set(s.grupId, (sayilar.get(s.grupId) ?? 0) + 1);
  }
  return liste.map((s) => {
    if (s.grupId && sayilar.get(s.grupId) === 1) {
      return { ...s, grupId: undefined };
    }
    return s;
  });
}

interface SekmeDurumu {
  sekmeler: AdminSekme[];
  aktifSekmeId: string;
}

export function useAdminSekmeler() {
  const [durum, setDurum] = useState<SekmeDurumu>({
    sekmeler: VARSAYILAN_SEKMELER,
    aktifSekmeId: 'kullanicilar',
  });

  const { sekmeler, aktifSekmeId } = durum;

  const sekmeAc = useCallback((modul: AdminModul) => {
    const ayarlar = sekmeAyarlariOku();
    setDurum((onceki) => {
      if (ayarlar.varsayilanAcilis !== 'yeni-sekme') {
        const mevcut = onceki.sekmeler.find((s) => s.modulId === modul.id);
        if (mevcut) {
          return {
            aktifSekmeId: mevcut.id,
            sekmeler: onceki.sekmeler,
          };
        }
      }
      const yeni: AdminSekme = {
        id: `${modul.id}-${Date.now()}`,
        modulId: modul.id,
        baslik: modul.baslik,
      };
      return {
        aktifSekmeId: yeni.id,
        sekmeler: [yeni, ...onceki.sekmeler],
      };
    });
  }, []);

  const sekmeKapat = useCallback((sekmeId: string) => {
    setDurum((onceki) => {
      if (onceki.sekmeler.length <= 1) return onceki;

      const kapatilan = onceki.sekmeler.find((s) => s.id === sekmeId);
      let yeni = onceki.sekmeler.filter((s) => s.id !== sekmeId);

      if (kapatilan?.grupId) {
        const gruptakiler = yeni.filter((s) => s.grupId === kapatilan.grupId);
        if (gruptakiler.length === 1) {
          yeni = yeni.map((s) =>
            s.grupId === kapatilan.grupId ? { ...s, grupId: undefined } : s
          );
        }
      }

      const yeniAktif =
        onceki.aktifSekmeId === sekmeId
          ? sonrakiAktifSekme(onceki.sekmeler, sekmeId)
          : onceki.aktifSekmeId;

      return { sekmeler: yeni, aktifSekmeId: yeniAktif };
    });
  }, []);

  const sekmeTopluKapat = useCallback((kapatilacakIds: string[], yeniAktifId: string) => {
    setDurum((onceki) => {
      const kapatSet = new Set(kapatilacakIds);
      if (kapatSet.size === 0) return onceki;

      let yeni = onceki.sekmeler.filter((s) => !kapatSet.has(s.id));
      if (yeni.length === 0 || yeni.length >= onceki.sekmeler.length) return onceki;

      yeni = grupIdleriTemizle(yeni);
      const aktifId = yeni.some((s) => s.id === yeniAktifId) ? yeniAktifId : yeni[0].id;

      return { sekmeler: yeni, aktifSekmeId: aktifId };
    });
  }, []);

  const sekmeSec = useCallback((sekmeId: string) => {
    setDurum((onceki) => ({
      aktifSekmeId: sekmeId,
      sekmeler: onceki.sekmeler,
    }));
  }, []);

  const sekmeTasi = useCallback((kaynakId: string, hedefId: string, mod: 'once' | 'sonra') => {
    if (kaynakId === hedefId) return;

    setDurum((onceki) => {
      let liste = [...onceki.sekmeler];
      const kaynakIdx = liste.findIndex((s) => s.id === kaynakId);
      const hedefIdx = liste.findIndex((s) => s.id === hedefId);
      if (kaynakIdx < 0 || hedefIdx < 0) return onceki;

      const kaynak = liste[kaynakIdx];
      const hedef = liste[hedefIdx];

      if (kaynak.grupId && kaynak.grupId !== hedef.grupId) {
        liste[kaynakIdx] = { ...kaynak, grupId: undefined };
      }

      const guncelKaynakIdx = liste.findIndex((s) => s.id === kaynakId);
      const [tasinan] = liste.splice(guncelKaynakIdx, 1);
      let yeniHedefIdx = liste.findIndex((s) => s.id === hedefId);
      if (mod === 'sonra') yeniHedefIdx += 1;
      liste.splice(yeniHedefIdx, 0, tasinan);

      if (tasinan.grupId) {
        const gruptakiler = liste.filter((s) => s.grupId === tasinan.grupId);
        if (gruptakiler.length === 1) {
          liste = liste.map((s) =>
            s.grupId === tasinan.grupId ? { ...s, grupId: undefined } : s
          );
        }
      }

      return { ...onceki, sekmeler: liste };
    });
  }, []);

  const sekmeBirlestir = useCallback((kaynakId: string, hedefId: string) => {
    if (kaynakId === hedefId) return;

    setDurum((onceki) => {
      const kaynak = onceki.sekmeler.find((s) => s.id === kaynakId);
      const hedef = onceki.sekmeler.find((s) => s.id === hedefId);
      if (!kaynak || !hedef) return onceki;

      const grupId = hedef.grupId ?? kaynak.grupId ?? `grup-${Date.now()}`;
      let guncellenmis = onceki.sekmeler.map((s) => {
        if (s.id === kaynakId || s.id === hedefId) return { ...s, grupId };
        if (kaynak.grupId && s.grupId === kaynak.grupId && s.id !== kaynakId) {
          return { ...s, grupId };
        }
        return s;
      });

      const kaynakIdx = guncellenmis.findIndex((s) => s.id === kaynakId);
      const liste = [...guncellenmis];
      const [tasinan] = liste.splice(kaynakIdx, 1);
      const yeniHedefIdx = liste.findIndex((s) => s.id === hedefId);
      liste.splice(yeniHedefIdx + 1, 0, tasinan);

      return { sekmeler: liste, aktifSekmeId: kaynakId };
    });
  }, []);

  const aktifModul = modulBul(
    sekmeler.find((s) => s.id === aktifSekmeId)?.modulId ?? 'dashboard'
  );

  const kaydedilmediIsaretle = useCallback((sekmeId: string, kirli: boolean) => {
    setDurum((onceki) => ({
      ...onceki,
      sekmeler: onceki.sekmeler.map((s) =>
        s.id === sekmeId ? { ...s, kaydedilmedi: kirli } : s
      ),
    }));
  }, []);

  return {
    sekmeler,
    aktifSekmeId,
    aktifModul,
    setAktifSekmeId: sekmeSec,
    sekmeAc,
    sekmeKapat,
    sekmeTopluKapat,
    sekmeTasi,
    sekmeBirlestir,
    kaydedilmediIsaretle,
  };
}
