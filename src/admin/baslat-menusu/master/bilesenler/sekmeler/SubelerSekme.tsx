import { useCallback, useEffect, useMemo, useState } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import { SubeKayitModal } from '@/admin/baslat-menusu/master/bilesenler/SubeKayitModal';
import { masterFirmalariGetir, type MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  masterSubeGuncelle,
  masterSubeOlustur,
  masterSubeleriGetir,
  subeTipEtiketi,
  type MasterSube,
  type SubeFormGirdi,
} from '@/admin/baslat-menusu/master/subeler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

const TIP_IKON: Record<string, string> = {
  restoran: '🍽️',
  kafe: '☕',
  fast_food: '🍔',
  diger: '📍',
};

export function SubelerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [subeler, setSubeler] = useState<MasterSube[]>([]);
  const [firmalar, setFirmalar] = useState<MasterFirma[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [firmaFiltre, setFirmaFiltre] = useState<number | ''>('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterSube | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [subeVeri, firmaVeri] = await Promise.all([masterSubeleriGetir(), masterFirmalariGetir()]);
      setSubeler(subeVeri.subeler);
      setFirmalar(firmaVeri.firmalar);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Şubeler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return subeler.filter((s) => {
      if (filtre === 'aktif' && !s.aktif) return false;
      if (filtre === 'pasif' && s.aktif) return false;
      if (firmaFiltre !== '' && s.firmaId !== firmaFiltre) return false;
      if (!q) return true;
      return (
        s.subeAdi.toLowerCase().includes(q) ||
        s.firmaUnvan.toLowerCase().includes(q) ||
        (s.il?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [subeler, arama, filtre, firmaFiltre]);

  const firmaGruplari = useMemo(() => {
    const gruplar = new Map<string, MasterSube[]>();
    for (const s of liste) {
      const anahtar = s.firmaTabela ?? s.firmaUnvan;
      const mevcut = gruplar.get(anahtar) ?? [];
      mevcut.push(s);
      gruplar.set(anahtar, mevcut);
    }
    return [...gruplar.entries()].sort(([a], [b]) => a.localeCompare(b, 'tr'));
  }, [liste]);

  async function durumDegistir(sube: MasterSube, aktif: boolean) {
    setIslemId(sube.id);
    try {
      await masterSubeGuncelle(sube.id, { aktif });
      await yukle();
      basariBildir(`${sube.subeAdi} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  async function kaydet(girdi: SubeFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterSubeGuncelle(duzenlenen.id, girdi);
        basariBildir(`${girdi.subeAdi} güncellendi.`);
      } else {
        await masterSubeOlustur(girdi);
        basariBildir(`${girdi.subeAdi} eklendi.`);
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

  if (yukleniyor) return <YukleniyorDurumu mesaj="Şubeler yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const aktifFirmalar = firmalar.filter((f) => f.aktif);

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
        <MasterArama placeholder="Şube, firma veya il ara…" value={arama} onChange={setArama} />
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
          disabled={aktifFirmalar.length === 0}
          title={aktifFirmalar.length === 0 ? 'Önce aktif bir firma ekleyin' : undefined}
        >
          + Şube Ekle
        </button>
      </div>

      {firmaGruplari.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' || firmaFiltre !== ''
              ? 'Filtreye uygun şube bulunamadı.'
              : 'Henüz şube kaydı yok.'}
          </p>
        </div>
      ) : (
        firmaGruplari.map(([firma, satirlar]) => (
          <div key={firma} className="ap-master-grup">
            <h3 className="ap-heading mb-2 flex items-center gap-2 text-sm font-semibold">
              <span>🏢</span> {firma}
            </h3>
            <div className="ap-master-sube-grid">
              {satirlar.map((s) => (
                <article
                  key={s.id}
                  className={`ap-master-sube-kart ${!s.aktif ? 'ap-master-modul-kart-pasif' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="ap-heading text-sm font-medium">{s.subeAdi}</p>
                      <p className="ap-muted mt-0.5 text-xs">
                        {[s.il, s.ilce].filter(Boolean).join(' / ') || 'Konum belirtilmemiş'}
                      </p>
                    </div>
                    <span className={`ap-master-durum shrink-0 ${s.aktif ? 'ap-master-durum-aktif' : ''}`}>
                      {s.aktif ? 'Açık' : 'Kapalı'}
                    </span>
                  </div>
                  <p className="ap-muted mt-2 text-xs">
                    {TIP_IKON[s.subeTipi] ?? '📍'} {subeTipEtiketi(s.subeTipi)}
                  </p>

                  <div className="ap-master-sube-toggle mt-3">
                    <DurumAnahtari
                      etiket="Şube durumu"
                      aciklama={s.aktif ? 'Operasyonel şube' : 'Pasif şube kullanılamaz'}
                      acik={s.aktif}
                      devreDisi={islemId === s.id}
                      onChange={(v) => void durumDegistir(s, v)}
                      renk={s.aktif ? 'yesil' : 'turuncu'}
                      kompakt
                    />
                  </div>

                  <button
                    type="button"
                    className="ap-master-link-btn mt-2 !cursor-pointer !opacity-100"
                    onClick={() => {
                      setDuzenlenen(s);
                      setModalAcik(true);
                    }}
                  >
                    Düzenle →
                  </button>
                </article>
              ))}
            </div>
          </div>
        ))
      )}

      <SubeKayitModal
        acik={modalAcik}
        duzenlenen={duzenlenen}
        firmaSecenekleri={firmalar}
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
