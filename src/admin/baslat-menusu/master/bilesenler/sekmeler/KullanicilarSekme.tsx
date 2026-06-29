import { useCallback, useEffect, useMemo, useState } from 'react';
import { KullaniciKayitModal } from '@/admin/baslat-menusu/master/bilesenler/KullaniciKayitModal';
import {
  KullaniciExcelTablo,
  type AktifKullaniciHucre,
  type KullaniciDuzenlenebilirAlan,
} from '@/admin/baslat-menusu/master/bilesenler/KullaniciExcelTablo';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import { masterBayileriGetir } from '@/admin/baslat-menusu/master/bayiler/api';
import { masterFirmalariGetir } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  kullaniciTabloSutunlariKaydet,
  kullaniciTabloSutunlariOku,
} from '@/admin/baslat-menusu/master/kullanicilar/kullaniciTabloSutunlari';
import {
  kullaniciTipiHesapla,
  masterKullaniciGuncelle,
  masterKullaniciOlustur,
  masterKullaniciSil,
  masterKullanicilariGetir,
  type KullaniciFormGirdi,
  type MasterKullanici,
} from '@/admin/baslat-menusu/master/kullanicilar/api';
import { masterSubeleriGetir } from '@/admin/baslat-menusu/master/subeler/api';
import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

function hucreMevcutDeger(k: MasterKullanici, alan: KullaniciDuzenlenebilirAlan): string {
  switch (alan) {
    case 'email':
      return k.eposta;
    case 'bayiId':
      return k.bayiId != null ? String(k.bayiId) : '';
    case 'firmaId':
      return k.firmaId != null ? String(k.firmaId) : '';
    case 'subeId':
      return k.subeId != null ? String(k.subeId) : '';
    case 'aktif':
      return k.aktif ? 'true' : 'false';
    case 'iskonto':
      return k.iskonto != null ? String(k.iskonto) : '';
    default:
      return (k[alan as keyof MasterKullanici] as string | undefined) ?? '';
  }
}

export function KullanicilarSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kullanicilar, setKullanicilar] = useState<MasterKullanici[]>([]);
  const [roller, setRoller] = useState<{ kod: string; baslik: string }[]>([]);
  const [bayiler, setBayiler] = useState<Awaited<ReturnType<typeof masterBayileriGetir>>['bayiler']>([]);
  const [firmalar, setFirmalar] = useState<Awaited<ReturnType<typeof masterFirmalariGetir>>['firmalar']>([]);
  const [subeler, setSubeler] = useState<Awaited<ReturnType<typeof masterSubeleriGetir>>['subeler']>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterKullanici | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [aktifHucre, setAktifHucre] = useState<AktifKullaniciHucre | null>(null);
  const [hucreTaslak, setHucreTaslak] = useState('');
  const [hucreKaydediliyor, setHucreKaydediliyor] = useState(false);
  const [gorunurSutunlar, setGorunurSutunlar] = useState(kullaniciTabloSutunlariOku);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [kVeri, bVeri, fVeri, sVeri, rolVeri] = await Promise.all([
        masterKullanicilariGetir(),
        masterBayileriGetir(),
        masterFirmalariGetir(),
        masterSubeleriGetir(),
        adminJsonFetch<{ roller: { kod: string; baslik: string }[] }>('/roller', { headers: adminHeaders() }),
      ]);
      setKullanicilar(kVeri.kullanicilar);
      setBayiler(bVeri.bayiler);
      setFirmalar(fVeri.firmalar);
      setSubeler(sVeri.subeler);
      setRoller(rolVeri.roller ?? []);
      setSeciliId((onceki) => {
        if (onceki !== null && !kVeri.kullanicilar.some((k) => k.id === onceki)) return null;
        return onceki;
      });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kullanıcılar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return kullanicilar.filter((k) => {
      if (filtre === 'aktif' && !k.aktif) return false;
      if (filtre === 'pasif' && k.aktif) return false;
      if (!q) return true;
      return (
        k.ad.toLowerCase().includes(q) ||
        k.eposta.toLowerCase().includes(q) ||
        k.rol.toLowerCase().includes(q) ||
        (k.bayiUnvan?.toLowerCase().includes(q) ?? false) ||
        (k.firmaTabela?.toLowerCase().includes(q) ?? false) ||
        (k.subeAdi?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [kullanicilar, arama, filtre]);

  const seciliKullanici = useMemo(
    () => (seciliId !== null ? kullanicilar.find((k) => k.id === seciliId) ?? null : null),
    [kullanicilar, seciliId]
  );

  function hucreIptal() {
    setAktifHucre(null);
    setHucreTaslak('');
  }

  const hucreBaslat = useCallback((k: MasterKullanici, alan: KullaniciDuzenlenebilirAlan) => {
    setAktifHucre({ kullaniciId: k.id, alan });
    setHucreTaslak(hucreMevcutDeger(k, alan));
  }, []);

  const hucreKaydet = useCallback(
    async (anlikDeger?: string) => {
      if (!aktifHucre || hucreKaydediliyor) return;
      const k = kullanicilar.find((u) => u.id === aktifHucre.kullaniciId);
      if (!k) {
        hucreIptal();
        return;
      }

      const ham = (anlikDeger ?? hucreTaslak).trim();
      const mevcut = hucreMevcutDeger(k, aktifHucre.alan);
      if (ham === mevcut.trim() || (aktifHucre.alan !== 'ad' && ham === mevcut)) {
        hucreIptal();
        return;
      }

      const girdi: Partial<KullaniciFormGirdi> = {};
      const { alan } = aktifHucre;

      if (alan === 'ad') {
        if (ham.length < 2) {
          hataBildir('Ad en az 2 karakter olmalı');
          return;
        }
        girdi.ad = ham;
      } else if (alan === 'email') {
        if (!ham.includes('@')) {
          hataBildir('Geçerli e-posta girin');
          return;
        }
        girdi.email = ham;
      } else if (alan === 'aktif') {
        girdi.aktif = ham === 'true';
      } else if (alan === 'bayiId') {
        const bayiId = ham ? Number(ham) : null;
        girdi.bayiId = bayiId;
        girdi.firmaId = null;
        girdi.subeId = null;
        girdi.kullaniciTipi = kullaniciTipiHesapla(bayiId, null, null);
      } else if (alan === 'firmaId') {
        const firmaId = ham ? Number(ham) : null;
        girdi.firmaId = firmaId;
        girdi.subeId = null;
        girdi.kullaniciTipi = kullaniciTipiHesapla(k.bayiId, firmaId, null);
      } else if (alan === 'subeId') {
        const subeId = ham ? Number(ham) : null;
        girdi.subeId = subeId;
        girdi.kullaniciTipi = kullaniciTipiHesapla(k.bayiId, k.firmaId, subeId);
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
      } else if (alan === 'rol') {
        girdi.rol = ham;
      } else {
        girdi[alan] = ham || undefined;
      }

      setHucreKaydediliyor(true);
      try {
        const { kullanici: guncel } = await masterKullaniciGuncelle(k.id, girdi);
        setKullanicilar((onceki) => onceki.map((u) => (u.id === guncel.id ? guncel : u)));
        hucreIptal();
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Hücre kaydedilemedi');
      } finally {
        setHucreKaydediliyor(false);
      }
    },
    [aktifHucre, hucreTaslak, hucreKaydediliyor, kullanicilar, hataBildir]
  );

  async function kaydet(girdi: KullaniciFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterKullaniciGuncelle(duzenlenen.id, girdi);
        basariBildir(`${girdi.ad} güncellendi.`);
      } else {
        const { kullanici } = await masterKullaniciOlustur(girdi);
        setSeciliId(kullanici.id);
        basariBildir(`${girdi.ad} eklendi.`);
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

  const yeniKullanici = useCallback(() => {
    setDuzenlenen(null);
    setModalAcik(true);
  }, []);

  const kullaniciSil = useCallback(async () => {
    if (!seciliKullanici) return;
    if (!confirm(`"${seciliKullanici.ad}" kullanıcısını silmek istediğinize emin misiniz?`)) return;
    setKaydediliyor(true);
    try {
      await masterKullaniciSil(seciliKullanici.id);
      setSeciliId(null);
      await yukle();
      basariBildir('Kullanıcı silindi.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kullanıcı silinemedi');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliKullanici, yukle, basariBildir, hataBildir]);

  const sutunlarDegistir = useCallback((sira: string[]) => {
    setGorunurSutunlar(sira);
    kullaniciTabloSutunlariKaydet(sira);
  }, []);

  const islemde = kaydediliyor || hucreKaydediliyor;

  useModulAksiyonlari(
    { ekle: yeniKullanici, sil: kullaniciSil },
    {
      kaydet: false,
      ekle: !islemde && !aktifHucre,
      sil: !!seciliKullanici && !islemde && !aktifHucre,
    }
  );

  if (yukleniyor) return <YukleniyorDurumu mesaj="Kullanıcılar yükleniyor…" />;
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

      <div className="ap-master-ust">
        <MasterArama placeholder="Ad, e-posta, rol, bayi veya şube ara…" value={arama} onChange={setArama} />
        <p className="ap-muted text-xs">
          Restoran kullanıcıları için bayi / firma / şube atayın. ⚙️ ile sütunları özelleştirin; çift tıkla düzenleyin.
        </p>
      </div>

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu'
              ? 'Filtreye uygun kullanıcı bulunamadı.'
              : 'Henüz kullanıcı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : (
        <KullaniciExcelTablo
          kullanicilar={liste}
          roller={roller}
          bayiler={bayiler}
          firmalar={firmalar}
          subeler={subeler}
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
          onModalDuzenle={(k) => {
            setDuzenlenen(k);
            setModalAcik(true);
          }}
        />
      )}

      <KullaniciKayitModal
        acik={modalAcik}
        duzenlenen={duzenlenen}
        roller={roller}
        bayiler={bayiler}
        firmalar={firmalar}
        subeler={subeler}
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
