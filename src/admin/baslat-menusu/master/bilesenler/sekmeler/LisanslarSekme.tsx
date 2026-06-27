import { useCallback, useEffect, useMemo, useState } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { LisansKayitModal } from '@/admin/baslat-menusu/master/bilesenler/LisansKayitModal';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import { masterFirmalariGetir } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  lisansDurumEtiketi,
  masterLisansGuncelle,
  masterLisansOlustur,
  masterLisanslariGetir,
  tarihGoster,
  type LisansFormGirdi,
  type MasterLisans,
} from '@/admin/baslat-menusu/master/lisanslar/api';
import { masterPaketleriGetir } from '@/admin/baslat-menusu/master/paketler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

type Filtre = 'tumu' | 'aktif' | 'yakinda' | 'pasif';

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
  const [islemId, setIslemId] = useState<number | null>(null);

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

  async function durumDegistir(l: MasterLisans, aktif: boolean) {
    setIslemId(l.id);
    try {
      await masterLisansGuncelle(l.id, { aktif });
      await yukle();
      basariBildir(`Lisans ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  async function kaydet(girdi: LisansFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterLisansGuncelle(duzenlenen.id, girdi);
        basariBildir('Lisans güncellendi.');
      } else {
        await masterLisansOlustur(girdi);
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

  if (yukleniyor) return <YukleniyorDurumu mesaj="Lisanslar yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const aktifFirmalar = firmalar.filter((f) => f.aktif);

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
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil shrink-0"
          onClick={() => {
            setDuzenlenen(null);
            setModalAcik(true);
          }}
          disabled={aktifFirmalar.length === 0 || (paketler ?? []).filter((p) => p.aktif).length === 0}
        >
          + Lisans Ata
        </button>
      </div>

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">Filtreye uygun lisans bulunamadı.</p>
        </div>
      ) : (
        <div className="ap-master-lisans-zaman">
          {liste.map((l) => (
            <article key={l.id} className="ap-master-lisans-satir">
              <div className="ap-master-lisans-cizgi">
                <span className={`ap-master-lisans-nokta ap-master-lisans-${l.durum}`} />
              </div>
              <div className="ap-master-lisans-icerik">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="ap-heading font-semibold">{l.firmaTabela ?? l.firmaUnvan}</p>
                    <p className="ap-muted text-sm">{l.paketAdi} paketi</p>
                  </div>
                  <span
                    className={`ap-master-lisans-badge ${
                      l.durum === 'aktif' ? 'ap-master-lisans-aktif' : l.durum === 'yakinda' ? 'ap-master-lisans-uyari' : ''
                    }`}
                  >
                    {lisansDurumEtiketi(l.durum)}
                  </span>
                </div>
                <p className="ap-muted mt-2 text-xs">
                  {tarihGoster(l.baslangicTarihi)} — {tarihGoster(l.bitisTarihi)}
                </p>

                <div className="ap-master-sube-toggle mt-3 max-w-sm">
                  <DurumAnahtari
                    etiket="Lisans durumu"
                    aciklama={l.aktif ? 'Geçerli lisans' : 'Pasif lisans'}
                    acik={l.aktif}
                    devreDisi={islemId === l.id}
                    onChange={(v) => void durumDegistir(l, v)}
                    renk={l.aktif ? 'yesil' : 'turuncu'}
                    kompakt
                  />
                </div>

                <button
                  type="button"
                  className="ap-master-link-btn mt-2 !cursor-pointer !opacity-100"
                  onClick={() => {
                    setDuzenlenen(l);
                    setModalAcik(true);
                  }}
                >
                  Düzenle →
                </button>
              </div>
            </article>
          ))}
        </div>
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
