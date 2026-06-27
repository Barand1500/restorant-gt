import { useCallback, useEffect, useMemo, useState } from 'react';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { PaketKayitModal } from '@/admin/baslat-menusu/master/bilesenler/PaketKayitModal';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import {
  masterPaketGuncelle,
  masterPaketOlustur,
  masterPaketleriGetir,
  type MasterPaket,
  type PaketFormGirdi,
} from '@/admin/baslat-menusu/master/paketler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

export function PaketlerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [paketler, setPaketler] = useState<MasterPaket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterPaket | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const veri = await masterPaketleriGetir();
      setPaketler(veri.paketler ?? []);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Paketler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return paketler.filter((p) => {
      if (filtre === 'aktif' && !p.aktif) return false;
      if (filtre === 'pasif' && p.aktif) return false;
      if (!q) return true;
      return p.paketAdi.toLowerCase().includes(q);
    });
  }, [paketler, arama, filtre]);

  async function durumDegistir(p: MasterPaket, aktif: boolean) {
    setIslemId(p.id);
    try {
      await masterPaketGuncelle(p.id, { aktif });
      await yukle();
      basariBildir(`${p.paketAdi} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  async function kaydet(girdi: PaketFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterPaketGuncelle(duzenlenen.id, girdi);
        basariBildir(`${girdi.paketAdi} güncellendi.`);
      } else {
        await masterPaketOlustur(girdi);
        basariBildir(`${girdi.paketAdi} eklendi.`);
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

  if (yukleniyor) return <YukleniyorDurumu mesaj="Paketler yükleniyor…" />;
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
        <MasterArama placeholder="Paket adı ara…" value={arama} onChange={setArama} />
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
          onClick={() => {
            setDuzenlenen(null);
            setModalAcik(true);
          }}
        >
          + Yeni Paket
        </button>
      </div>

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">Filtreye uygun paket bulunamadı.</p>
        </div>
      ) : (
        <div className="ap-master-paket-grid">
          {liste.map((p) => (
            <article
              key={p.id}
              className={`ap-master-paket-kart ${!p.aktif ? 'ap-master-modul-kart-pasif' : ''}`}
            >
              <h3 className="ap-heading text-lg font-bold">{p.paketAdi}</h3>
              <p className="ap-master-paket-fiyat">
                <span className="text-2xl font-bold">₺{p.fiyat.toLocaleString('tr-TR')}</span>
                <span className="ap-muted text-xs"> / ay</span>
              </p>
              <ul className="ap-master-paket-ozellikler">
                <li>{p.subeSayisi} şube</li>
                <li>{p.personelSayisi} personel</li>
                <li>{p.masaSayisi} masa</li>
                <li>{p.aktifLisansSayisi} aktif lisans</li>
              </ul>

              <div className="ap-master-sube-toggle mt-3">
                <DurumAnahtari
                  etiket="Paket durumu"
                  aciklama={p.aktif ? 'Satışta' : 'Pasif paket'}
                  acik={p.aktif}
                  devreDisi={islemId === p.id}
                  onChange={(v) => void durumDegistir(p, v)}
                  renk={p.aktif ? 'yesil' : 'turuncu'}
                  kompakt
                />
              </div>

              <button
                type="button"
                className="ap-master-link-btn mt-2 !cursor-pointer !opacity-100"
                onClick={() => {
                  setDuzenlenen(p);
                  setModalAcik(true);
                }}
              >
                Düzenle
              </button>
            </article>
          ))}
        </div>
      )}

      <PaketKayitModal
        acik={modalAcik}
        duzenlenen={duzenlenen}
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
