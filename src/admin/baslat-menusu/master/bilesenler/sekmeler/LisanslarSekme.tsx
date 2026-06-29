import { useCallback, useEffect, useMemo, useState } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { LisansKayitModal } from '@/admin/baslat-menusu/master/bilesenler/LisansKayitModal';
import {
  LisansExcelTablo,
  type AktifLisansHucre,
  type LisansDuzenlenebilirAlan,
} from '@/admin/baslat-menusu/master/bilesenler/LisansExcelTablo';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import { masterFirmalariGetir } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  lisansTabloSutunlariKaydet,
  lisansTabloSutunlariOku,
} from '@/admin/baslat-menusu/master/lisanslar/lisansTabloSutunlari';
import {
  masterLisansGuncelle,
  masterLisansOlustur,
  masterLisansSil,
  masterLisanslariGetir,
  type LisansFormGirdi,
  type MasterLisans,
} from '@/admin/baslat-menusu/master/lisanslar/api';
import { masterPaketleriGetir } from '@/admin/baslat-menusu/master/paketler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

type Filtre = 'tumu' | 'aktif' | 'yakinda' | 'pasif';

function hucreMevcutDeger(lisans: MasterLisans, alan: LisansDuzenlenebilirAlan): string {
  switch (alan) {
    case 'paketId':
      return String(lisans.paketId);
    case 'baslangicTarihi':
      return lisans.baslangicTarihi.slice(0, 10);
    case 'bitisTarihi':
      return lisans.bitisTarihi ? lisans.bitisTarihi.slice(0, 10) : '';
    case 'aktif':
      return lisans.aktif ? 'true' : 'false';
    default:
      return '';
  }
}

export function LisanslarSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [lisanslar, setLisanslar] = useState<MasterLisans[]>([]);
  const [firmalar, setFirmalar] = useState<Awaited<ReturnType<typeof masterFirmalariGetir>>['firmalar']>([]);
  const [paketler, setPaketler] = useState<Awaited<ReturnType<typeof masterPaketleriGetir>>['paketler']>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [firmaFiltre, setFirmaFiltre] = useState<number | ''>('');
  const [filtre, setFiltre] = useState<Filtre>('tumu');
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterLisans | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [aktifHucre, setAktifHucre] = useState<AktifLisansHucre | null>(null);
  const [hucreTaslak, setHucreTaslak] = useState('');
  const [hucreKaydediliyor, setHucreKaydediliyor] = useState(false);
  const [gorunurSutunlar, setGorunurSutunlar] = useState(lisansTabloSutunlariOku);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [lVeri, fVeri, pVeri] = await Promise.all([
        masterLisanslariGetir(),
        masterFirmalariGetir(),
        masterPaketleriGetir(),
      ]);
      setLisanslar(lVeri.lisanslar ?? []);
      setFirmalar(fVeri.firmalar ?? []);
      setPaketler(pVeri.paketler ?? []);
      setSeciliId((onceki) => {
        if (onceki !== null && !(lVeri.lisanslar ?? []).some((l) => l.id === onceki)) return null;
        return onceki;
      });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Lisanslar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return lisanslar.filter((l) => {
      if (filtre !== 'tumu' && l.durum !== filtre) return false;
      if (firmaFiltre !== '' && l.firmaId !== firmaFiltre) return false;
      if (!q) return true;
      return (
        l.firmaUnvan.toLowerCase().includes(q) ||
        (l.firmaTabela?.toLowerCase().includes(q) ?? false) ||
        l.paketAdi.toLowerCase().includes(q)
      );
    });
  }, [lisanslar, arama, filtre, firmaFiltre]);

  const seciliLisans = useMemo(
    () => (seciliId !== null ? lisanslar.find((l) => l.id === seciliId) ?? null : null),
    [lisanslar, seciliId]
  );

  const aktifFirmalar = useMemo(() => firmalar.filter((f) => f.aktif), [firmalar]);
  const aktifPaketler = useMemo(() => paketler.filter((p) => p.aktif), [paketler]);

  function hucreIptal() {
    setAktifHucre(null);
    setHucreTaslak('');
  }

  const hucreBaslat = useCallback((lisans: MasterLisans, alan: LisansDuzenlenebilirAlan) => {
    setAktifHucre({ lisansId: lisans.id, alan });
    setHucreTaslak(hucreMevcutDeger(lisans, alan));
  }, []);

  const hucreKaydet = useCallback(
    async (anlikDeger?: string) => {
      if (!aktifHucre || hucreKaydediliyor) return;
      const lisans = lisanslar.find((l) => l.id === aktifHucre.lisansId);
      if (!lisans) {
        hucreIptal();
        return;
      }

      const ham = (anlikDeger ?? hucreTaslak).trim();
      const mevcut = hucreMevcutDeger(lisans, aktifHucre.alan);
      if (ham === mevcut.trim()) {
        hucreIptal();
        return;
      }

      const girdi: Partial<LisansFormGirdi> = {};
      const { alan } = aktifHucre;

      if (alan === 'paketId') {
        const paketId = Number(ham);
        if (!Number.isInteger(paketId) || paketId < 1) {
          hataBildir('Geçerli bir paket seçin');
          return;
        }
        girdi.paketId = paketId;
      } else if (alan === 'baslangicTarihi') {
        if (!ham) {
          hataBildir('Başlangıç tarihi gerekli');
          return;
        }
        girdi.baslangicTarihi = ham;
      } else if (alan === 'bitisTarihi') {
        girdi.bitisTarihi = ham || null;
      } else if (alan === 'aktif') {
        girdi.aktif = ham === 'true';
      }

      setHucreKaydediliyor(true);
      try {
        const { lisans: guncel } = await masterLisansGuncelle(lisans.id, girdi);
        setLisanslar((onceki) => onceki.map((l) => (l.id === guncel.id ? guncel : l)));
        hucreIptal();
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Hücre kaydedilemedi');
      } finally {
        setHucreKaydediliyor(false);
      }
    },
    [aktifHucre, hucreTaslak, hucreKaydediliyor, lisanslar, hataBildir]
  );

  async function kaydet(girdi: LisansFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterLisansGuncelle(duzenlenen.id, girdi);
        basariBildir('Lisans güncellendi.');
      } else {
        const { lisans } = await masterLisansOlustur(girdi);
        setSeciliId(lisans.id);
        basariBildir('Lisans oluşturuldu.');
      }
      setModalAcik(false);
      setDuzenlenen(null);
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }

  const yeniLisans = useCallback(() => {
    setDuzenlenen(null);
    setModalAcik(true);
  }, []);

  const lisansSil = useCallback(async () => {
    if (!seciliLisans) return;
    const firmaAd = seciliLisans.firmaTabela ?? seciliLisans.firmaUnvan;
    if (!confirm(`"${firmaAd}" firmasının lisansını silmek istediğinize emin misiniz?`)) return;

    setKaydediliyor(true);
    try {
      await masterLisansSil(seciliLisans.id);
      setSeciliId(null);
      await yukle();
      basariBildir('Lisans silindi.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Lisans silinemedi');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliLisans, yukle, basariBildir, hataBildir]);

  const sutunlarDegistir = useCallback((sira: string[]) => {
    setGorunurSutunlar(sira);
    lisansTabloSutunlariKaydet(sira);
  }, []);

  const islemde = kaydediliyor || hucreKaydediliyor;

  useModulAksiyonlari(
    { ekle: yeniLisans, sil: lisansSil },
    {
      kaydet: false,
      ekle: !islemde && aktifFirmalar.length > 0 && aktifPaketler.length > 0 && !aktifHucre,
      sil: !!seciliLisans && !islemde && !aktifHucre,
    }
  );

  if (yukleniyor) return <YukleniyorDurumu mesaj="Lisanslar yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  return (
    <div className="ap-master-sekme">
      <div className="ap-master-sekme-filtre">
        {(
          [
            ['tumu', 'Tümü'],
            ['aktif', 'Aktif'],
            ['yakinda', 'Süresi yakın'],
            ['pasif', 'Pasif'],
          ] as const
        ).map(([id, etiket]) => (
          <button
            key={id}
            type="button"
            className={`ap-master-filtre-btn ${filtre === id ? 'ap-master-filtre-btn-aktif' : ''}`}
            onClick={() => setFiltre(id)}
          >
            {etiket}
          </button>
        ))}
      </div>

      <div className="ap-master-ust ap-master-ust-filtre">
        <MasterArama placeholder="Firma veya paket ara…" value={arama} onChange={setArama} />
        <select
          className={formSelectSinifi}
          value={firmaFiltre}
          onChange={(e) => setFirmaFiltre(e.target.value ? Number(e.target.value) : '')}
          aria-label="Firma filtresi"
        >
          <option value="">Tüm firmalar</option>
          {firmalar.map((f) => (
            <option key={f.id} value={f.id}>
              {f.tabelaAdi ?? f.unvan}
            </option>
          ))}
        </select>
        <p className="ap-muted text-xs sm:col-span-2">
          Satır seçmek için tıklayın; hücreyi çift tıklayarak düzenleyin. Sütunları ⚙️ ile özelleştirin.
        </p>
      </div>

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' || firmaFiltre !== ''
              ? 'Filtreye uygun lisans bulunamadı.'
              : aktifFirmalar.length === 0
                ? 'Önce aktif bir firma ekleyin.'
                : aktifPaketler.length === 0
                  ? 'Önce aktif bir paket tanımlayın.'
                  : 'Henüz lisans kaydı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : (
        <LisansExcelTablo
          lisanslar={liste}
          paketler={paketler}
          seciliId={seciliId}
          aktifHucre={aktifHucre}
          hucreTaslak={hucreTaslak}
          hucreKaydediliyor={hucreKaydediliyor}
          gorunurSutunlar={gorunurSutunlar}
          onSutunlarDegistir={sutunlarDegistir}
          onSatirSec={setSeciliId}
          onHucreBaslat={hucreBaslat}
          onHucreTaslak={setHucreTaslak}
          onHucreKaydet={hucreKaydet}
          onHucreIptal={hucreIptal}
          onModalDuzenle={(l) => {
            setDuzenlenen(l);
            setModalAcik(true);
          }}
        />
      )}

      <LisansKayitModal
        acik={modalAcik}
        duzenlenen={duzenlenen}
        firmalar={firmalar}
        paketler={paketler}
        kaydediliyor={kaydediliyor}
        onKapat={() => {
          if (!kaydediliyor) {
            setModalAcik(false);
            setDuzenlenen(null);
          }
        }}
        onKaydet={kaydet}
      />
    </div>
  );
}
