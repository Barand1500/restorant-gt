import { useCallback, useState } from 'react';
import { BarkodDesenListesi } from '@/admin/baslat-menusu/tanimlar/bilesenler/barkod/BarkodDesenListesi';
import { BarkodDesenYardimPaneli } from '@/admin/baslat-menusu/tanimlar/bilesenler/barkod/BarkodDesenYardimPaneli';
import { TANIMLAR_VARSAYILAN_BARKOD_DESENLERI } from '@/admin/baslat-menusu/tanimlar/barkod/varsayilanBarkodDesenleri';
import { barkodDesenGecerli } from '@/admin/baslat-menusu/tanimlar/barkod/barkodTipler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

export function TanimlarBarkodSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [desenler, setDesenler] = useState<string[]>(() => [...TANIMLAR_VARSAYILAN_BARKOD_DESENLERI]);
  const [seciliIndex, setSeciliIndex] = useState<number | null>(0);

  const desenDegistir = useCallback((index: number, deger: string) => {
    setDesenler((onceki) => onceki.map((d, i) => (i === index ? deger : d)));
  }, []);

  const yeniDesen = useCallback(() => {
    setDesenler((onceki) => [...onceki, '']);
    setSeciliIndex(desenler.length);
  }, [desenler.length]);

  const desenSil = useCallback(() => {
    if (seciliIndex == null) return;
    setDesenler((onceki) => {
      const yeni = onceki.filter((_, i) => i !== seciliIndex);
      setSeciliIndex(yeni.length === 0 ? null : Math.min(seciliIndex, yeni.length - 1));
      return yeni;
    });
    basariBildir('Desen silindi.');
  }, [seciliIndex, basariBildir]);

  const kaydet = useCallback(() => {
    const temiz = desenler.map((d) => d.trim()).filter(Boolean);
    if (temiz.length === 0) {
      hataBildir('En az bir barkod deseni girilmelidir');
      return;
    }
    const gecersiz = temiz.find((d) => !barkodDesenGecerli(d));
    if (gecersiz) {
      hataBildir(`Geçersiz desen: "${gecersiz}". Yalnızca rakam ve B, G, A, C kullanılabilir.`);
      return;
    }
    const tekrar = new Set(temiz);
    if (tekrar.size !== temiz.length) {
      hataBildir('Aynı desen birden fazla kez eklenemez');
      return;
    }
    setDesenler(temiz);
    basariBildir('Barkod desenleri kaydedildi.');
  }, [desenler, basariBildir, hataBildir]);

  const ornekSec = useCallback(
    (desen: string) => {
      if (seciliIndex != null && seciliIndex < desenler.length) {
        desenDegistir(seciliIndex, desen);
        return;
      }
      setDesenler((onceki) => [...onceki, desen]);
      setSeciliIndex(desenler.length);
    },
    [seciliIndex, desenler.length, desenDegistir]
  );

  useModulAksiyonlari(
    { kaydet, ekle: yeniDesen, sil: desenSil },
    {
      kaydet: true,
      ekle: true,
      sil: seciliIndex != null && desenler.length > 0,
      onizle: false,
      yayinla: false,
    }
  );

  return (
    <div className="ap-tanimlar-barkod-sekme">
      <p className="ap-muted mb-4 text-xs">
        Tartılı ürün barkodlarını tanımlamak için desen listesini düzenleyin. Sağdaki örneklerden birine
        tıklayarak seçili satıra uygulayabilirsiniz. Alt çubuktan <strong className="ap-heading">Kaydet</strong>{' '}
        ile onaylayın.
      </p>

      <div className="ap-tanimlar-barkod-duzen">
        <BarkodDesenListesi
          desenler={desenler}
          seciliIndex={seciliIndex}
          onSec={setSeciliIndex}
          onDesenDegistir={desenDegistir}
        />
        <BarkodDesenYardimPaneli onOrnekSec={ornekSec} />
      </div>
    </div>
  );
}
