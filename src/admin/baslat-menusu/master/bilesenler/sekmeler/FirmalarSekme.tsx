import { useCallback, useEffect, useMemo, useState } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { masterBayileriGetir, type MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import { FirmaKayitModal } from '@/admin/baslat-menusu/master/bilesenler/FirmaKayitModal';
import {
  FirmaExcelTablo,
  type AktifHucre,
  type FirmaDuzenlenebilirAlan,
} from '@/admin/baslat-menusu/master/bilesenler/FirmaExcelTablo';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import {
  firmaTabloSutunlariKaydet,
  firmaTabloSutunlariOku,
} from '@/admin/baslat-menusu/master/firmalar/firmaTabloSutunlari';
import {
  masterFirmaGuncelle,
  masterFirmaOlustur,
  masterFirmaSil,
  masterFirmalariGetir,
  type FirmaFormGirdi,
  type MasterFirma,
} from '@/admin/baslat-menusu/master/firmalar/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

function hucreMevcutDeger(firma: MasterFirma, alan: FirmaDuzenlenebilirAlan): string {
  switch (alan) {
    case 'bayiId':
      return String(firma.bayiId);
    case 'aktif':
      return firma.aktif ? 'true' : 'false';
    case 'tabelaAdi':
      return firma.tabelaAdi ?? '';
    case 'iskonto':
      return firma.iskonto != null ? String(firma.iskonto) : '';
    default:
      return (firma[alan] as string | undefined) ?? '';
  }
}

export function FirmalarSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [firmalar, setFirmalar] = useState<MasterFirma[]>([]);
  const [bayiler, setBayiler] = useState<MasterBayi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [bayiFiltre, setBayiFiltre] = useState<number | ''>('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterFirma | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [aktifHucre, setAktifHucre] = useState<AktifHucre | null>(null);
  const [hucreTaslak, setHucreTaslak] = useState('');
  const [hucreKaydediliyor, setHucreKaydediliyor] = useState(false);
  const [gorunurSutunlar, setGorunurSutunlar] = useState(firmaTabloSutunlariOku);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [firmaVeri, bayiVeri] = await Promise.all([masterFirmalariGetir(), masterBayileriGetir()]);
      setFirmalar(firmaVeri.firmalar);
      setBayiler(bayiVeri.bayiler);
      setSeciliId((onceki) => {
        if (onceki !== null && !firmaVeri.firmalar.some((f) => f.id === onceki)) return null;
        return onceki;
      });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Firmalar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return firmalar.filter((f) => {
      if (filtre === 'aktif' && !f.aktif) return false;
      if (filtre === 'pasif' && f.aktif) return false;
      if (bayiFiltre !== '' && f.bayiId !== bayiFiltre) return false;
      if (!q) return true;
      return (
        f.unvan.toLowerCase().includes(q) ||
        (f.tabelaAdi?.toLowerCase().includes(q) ?? false) ||
        f.bayiUnvan.toLowerCase().includes(q) ||
        (f.il?.toLowerCase().includes(q) ?? false) ||
        (f.eposta?.toLowerCase().includes(q) ?? false) ||
        (f.vergiNo?.toLowerCase().includes(q) ?? false) ||
        (f.vergiDairesi?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [firmalar, arama, filtre, bayiFiltre]);

  const seciliFirma = useMemo(
    () => (seciliId !== null ? firmalar.find((f) => f.id === seciliId) ?? null : null),
    [firmalar, seciliId]
  );

  const aktifBayiler = useMemo(() => bayiler.filter((b) => b.aktif), [bayiler]);

  function hucreIptal() {
    setAktifHucre(null);
    setHucreTaslak('');
  }

  const hucreBaslat = useCallback((firma: MasterFirma, alan: FirmaDuzenlenebilirAlan) => {
    setAktifHucre({ firmaId: firma.id, alan });
    setHucreTaslak(hucreMevcutDeger(firma, alan));
  }, []);

  const hucreKaydet = useCallback(
    async (anlikDeger?: string) => {
      if (!aktifHucre || hucreKaydediliyor) return;
      const firma = firmalar.find((f) => f.id === aktifHucre.firmaId);
      if (!firma) {
        hucreIptal();
        return;
      }

      const ham = (anlikDeger ?? hucreTaslak).trim();
      const mevcut = hucreMevcutDeger(firma, aktifHucre.alan);
      if (ham === mevcut.trim() || (aktifHucre.alan !== 'unvan' && ham === mevcut)) {
        hucreIptal();
        return;
      }

      const girdi: Partial<FirmaFormGirdi> = {};
      const { alan } = aktifHucre;

      if (alan === 'unvan') {
        if (ham.length < 2) {
          hataBildir('Unvan en az 2 karakter olmalı');
          return;
        }
        girdi.unvan = ham;
      } else if (alan === 'bayiId') {
        const bayiId = Number(ham);
        if (!Number.isInteger(bayiId) || bayiId < 1) {
          hataBildir('Geçerli bir bayi seçin');
          return;
        }
        girdi.bayiId = bayiId;
      } else if (alan === 'aktif') {
        girdi.aktif = ham === 'true';
      } else if (alan === 'tabelaAdi') {
        girdi.tabelaAdi = ham || undefined;
      } else if (alan === 'iskonto') {
        if (!ham) {
          girdi.iskonto = null;
        } else {
          const n = Number(ham);
          if (Number.isNaN(n) || n < 0 || n > 100) {
            hataBildir('İskonto 0-100 arasında olmalı');
            return;
          }
          girdi.iskonto = n;
        }
      } else {
        girdi[alan] = ham || undefined;
      }

      setHucreKaydediliyor(true);
      try {
        const { firma: guncel } = await masterFirmaGuncelle(firma.id, girdi);
        setFirmalar((onceki) => onceki.map((f) => (f.id === guncel.id ? guncel : f)));
        hucreIptal();
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Hücre kaydedilemedi');
      } finally {
        setHucreKaydediliyor(false);
      }
    },
    [aktifHucre, hucreTaslak, hucreKaydediliyor, firmalar, hataBildir]
  );

  async function kaydet(girdi: FirmaFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterFirmaGuncelle(duzenlenen.id, girdi);
        basariBildir(`${girdi.unvan} güncellendi.`);
      } else {
        const { firma } = await masterFirmaOlustur(girdi);
        setSeciliId(firma.id);
        basariBildir(`${girdi.unvan} eklendi.`);
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

  const yeniFirma = useCallback(() => {
    setDuzenlenen(null);
    setModalAcik(true);
  }, []);

  const firmaSil = useCallback(async () => {
    if (!seciliFirma) return;
    if (
      !confirm(
        `"${seciliFirma.tabelaAdi ?? seciliFirma.unvan}" firmasını silmek istediğinize emin misiniz? Bağlı şubeler de kaldırılır.`
      )
    ) {
      return;
    }
    setKaydediliyor(true);
    try {
      await masterFirmaSil(seciliFirma.id);
      setSeciliId(null);
      await yukle();
      basariBildir('Firma silindi.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Firma silinemedi');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliFirma, yukle, basariBildir, hataBildir]);

  const sutunlarDegistir = useCallback((sira: string[]) => {
    setGorunurSutunlar(sira);
    firmaTabloSutunlariKaydet(sira);
  }, []);

  const islemde = kaydediliyor || hucreKaydediliyor;

  useModulAksiyonlari(
    { ekle: yeniFirma, sil: firmaSil },
    {
      kaydet: false,
      ekle: !islemde && aktifBayiler.length > 0 && !aktifHucre,
      sil: !!seciliFirma && !islemde && !aktifHucre,
    }
  );

  if (yukleniyor) return <YukleniyorDurumu mesaj="Firmalar yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  return (
    <div className="ap-master-sekme">
      <div className="ap-master-sekme-filtre">
        {(
          [
            ['tumu', 'Tümü'],
            ['aktif', 'Aktif'],
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
        <MasterArama placeholder="Tabela, unvan, bayi, il veya e-posta ara…" value={arama} onChange={setArama} />
        <select
          className={formSelectSinifi}
          value={bayiFiltre}
          onChange={(e) => setBayiFiltre(e.target.value ? Number(e.target.value) : '')}
          aria-label="Bayi filtresi"
        >
          <option value="">Tüm bayiler</option>
          {bayiler.map((b) => (
            <option key={b.id} value={b.id}>
              {b.unvan}
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
            {arama || filtre !== 'tumu' || bayiFiltre !== ''
              ? 'Filtreye uygun firma bulunamadı.'
              : aktifBayiler.length === 0
                ? 'Önce aktif bir bayi ekleyin.'
                : 'Henüz firma kaydı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : (
        <FirmaExcelTablo
          firmalar={liste}
          bayiler={bayiler}
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
          onModalDuzenle={(f) => {
            setDuzenlenen(f);
            setModalAcik(true);
          }}
        />
      )}

      <FirmaKayitModal
        acik={modalAcik}
        duzenlenen={duzenlenen}
        bayiSecenekleri={bayiler}
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
