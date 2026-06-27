import { useCallback, useEffect, useMemo, useState } from 'react';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { BayiKayitModal } from '@/admin/baslat-menusu/master/bilesenler/BayiKayitModal';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import {
  masterBayiGuncelle,
  masterBayiOlustur,
  masterBayileriGetir,
  type BayiFormGirdi,
  type MasterBayi,
} from '@/admin/baslat-menusu/master/bayiler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

export function BayilerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [bayiler, setBayiler] = useState<MasterBayi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterBayi | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const veri = await masterBayileriGetir();
      setBayiler(veri.bayiler);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Bayiler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return bayiler.filter((b) => {
      if (filtre === 'aktif' && !b.aktif) return false;
      if (filtre === 'pasif' && b.aktif) return false;
      if (!q) return true;
      return (
        b.unvan.toLowerCase().includes(q) ||
        (b.il?.toLowerCase().includes(q) ?? false) ||
        (b.ustUnvan?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [bayiler, arama, filtre]);

  async function durumDegistir(bayi: MasterBayi, aktif: boolean) {
    setIslemId(bayi.id);
    try {
      await masterBayiGuncelle(bayi.id, { aktif });
      await yukle();
      basariBildir(`${bayi.unvan} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  async function kaydet(girdi: BayiFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterBayiGuncelle(duzenlenen.id, girdi);
        basariBildir(`${girdi.unvan} güncellendi.`);
      } else {
        await masterBayiOlustur(girdi);
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

  function yeniBayi() {
    setDuzenlenen(null);
    setModalAcik(true);
  }

  function bayiDuzenle(bayi: MasterBayi) {
    setDuzenlenen(bayi);
    setModalAcik(true);
  }

  if (yukleniyor) return <YukleniyorDurumu mesaj="Bayiler yükleniyor…" />;
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
        <MasterArama placeholder="Unvan, il veya üst bayi ara…" value={arama} onChange={setArama} />
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" onClick={yeniBayi}>
          + Bayi Ekle
        </button>
      </div>

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' ? 'Filtreye uygun bayi bulunamadı.' : 'Henüz bayi kaydı yok.'}
          </p>
        </div>
      ) : (
        <div className="ap-master-liste">
          {liste.map((b) => (
            <article
              key={b.id}
              className={`ap-master-liste-satir ap-master-bayi-satir ${!b.aktif ? 'ap-master-modul-kart-pasif' : ''}`}
            >
              <div className="ap-master-liste-sol">
                <span className="ap-master-liste-ikon">🤝</span>
                <div className="min-w-0">
                  <p className="ap-heading font-medium">{b.unvan}</p>
                  <p className="ap-muted text-xs">
                    {[b.il, b.ilce].filter(Boolean).join(' / ') || 'Konum belirtilmemiş'}
                    {b.ustUnvan && ` · Alt bayi: ${b.ustUnvan}`}
                  </p>
                  {b.eposta && <p className="ap-muted mt-0.5 truncate text-xs">{b.eposta}</p>}
                </div>
              </div>

              <div className="ap-master-liste-meta">
                <span className="ap-master-etiket">{b.firmaSayisi} firma</span>
                {b.altBayiSayisi > 0 && (
                  <span className="ap-master-etiket">{b.altBayiSayisi} alt bayi</span>
                )}
              </div>

              <div className="ap-master-bayi-aksiyonlar">
                <DurumAnahtari
                  etiket="Bayi durumu"
                  aciklama={b.aktif ? 'Aktif bayi' : 'Pasif bayi firmaya atanamaz'}
                  acik={b.aktif}
                  devreDisi={islemId === b.id}
                  onChange={(v) => void durumDegistir(b, v)}
                  renk={b.aktif ? 'yesil' : 'turuncu'}
                  kompakt
                />
                <button type="button" className="ap-master-link-btn !cursor-pointer !opacity-100" onClick={() => bayiDuzenle(b)}>
                  Düzenle
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <BayiKayitModal
        acik={modalAcik}
        duzenlenen={duzenlenen}
        ustBayiSecenekleri={bayiler}
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
