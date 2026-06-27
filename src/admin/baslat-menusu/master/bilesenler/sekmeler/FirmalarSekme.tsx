import { useCallback, useEffect, useMemo, useState } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { masterBayileriGetir, type MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import { FirmaKayitModal } from '@/admin/baslat-menusu/master/bilesenler/FirmaKayitModal';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import {
  lisansDurumEtiketi,
  masterFirmaGuncelle,
  masterFirmaOlustur,
  masterFirmalariGetir,
  type FirmaFormGirdi,
  type MasterFirma,
} from '@/admin/baslat-menusu/master/firmalar/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

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

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [firmaVeri, bayiVeri] = await Promise.all([masterFirmalariGetir(), masterBayileriGetir()]);
      setFirmalar(firmaVeri.firmalar);
      setBayiler(bayiVeri.bayiler);
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
        f.bayiUnvan.toLowerCase().includes(q)
      );
    });
  }, [firmalar, arama, filtre, bayiFiltre]);

  async function kaydet(girdi: FirmaFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterFirmaGuncelle(duzenlenen.id, girdi);
        basariBildir(`${girdi.unvan} güncellendi.`);
      } else {
        await masterFirmaOlustur(girdi);
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

  function yeniFirma() {
    setDuzenlenen(null);
    setModalAcik(true);
  }

  function firmaDuzenle(firma: MasterFirma) {
    setDuzenlenen(firma);
    setModalAcik(true);
  }

  if (yukleniyor) return <YukleniyorDurumu mesaj="Firmalar yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const aktifBayiler = bayiler.filter((b) => b.aktif);

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
        <MasterArama placeholder="Tabela, unvan veya bayi ara…" value={arama} onChange={setArama} />
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
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil shrink-0"
          onClick={yeniFirma}
          disabled={aktifBayiler.length === 0}
          title={aktifBayiler.length === 0 ? 'Önce aktif bir bayi ekleyin' : undefined}
        >
          + Firma Ekle
        </button>
      </div>

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' || bayiFiltre !== ''
              ? 'Filtreye uygun firma bulunamadı.'
              : 'Henüz firma kaydı yok.'}
          </p>
        </div>
      ) : (
        <div className="ap-seo-tablo-scroll">
          <table className="ap-seo-tablo">
            <thead>
              <tr>
                <th>Tabela</th>
                <th>Unvan</th>
                <th>Bayi</th>
                <th>Şube</th>
                <th>Lisans</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {liste.map((f) => (
                <tr key={f.id} className={!f.aktif ? 'ap-master-tablo-pasif' : undefined}>
                  <td>
                    <span className="ap-heading font-medium">{f.tabelaAdi ?? '—'}</span>
                  </td>
                  <td className="ap-muted text-sm">{f.unvan}</td>
                  <td>
                    <span className="ap-master-etiket">{f.bayiUnvan}</span>
                  </td>
                  <td>{f.subeSayisi}</td>
                  <td>
                    <span
                      className={`ap-master-lisans-badge ${
                        f.lisansDurum === 'aktif'
                          ? 'ap-master-lisans-aktif'
                          : f.lisansDurum === 'yakinda'
                            ? 'ap-master-lisans-uyari'
                            : ''
                      }`}
                    >
                      {lisansDurumEtiketi(f.lisansDurum)}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ap-master-link-btn !cursor-pointer !opacity-100"
                      onClick={() => firmaDuzenle(f)}
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
