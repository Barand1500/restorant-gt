import { useCallback, useEffect, useMemo, useState } from 'react';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import { ModulEkleModal } from '@/admin/baslat-menusu/master/bilesenler/ModulEkleModal';
import {
  masterModulGuncelle,
  masterModulOlustur,
  masterModulleriGetir,
  type MasterModul,
} from '@/admin/baslat-menusu/master/moduller/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

export function ModullerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [moduller, setModuller] = useState<MasterModul[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [modalAcik, setModalAcik] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const veri = await masterModulleriGetir();
      setModuller(veri.moduller);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Modüller alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return moduller.filter((m) => {
      if (filtre === 'aktif' && !m.aktif) return false;
      if (filtre === 'pasif' && m.aktif) return false;
      if (!q) return true;
      return m.ad.toLowerCase().includes(q) || m.prefix.includes(q);
    });
  }, [moduller, arama, filtre]);

  async function durumDegistir(modul: MasterModul, aktif: boolean) {
    setIslemId(modul.id);
    try {
      await masterModulGuncelle(modul.id, { aktif });
      await yukle();
      basariBildir(`${modul.ad} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  async function modulEkle(girdi: { modulAdi: string; prefix: string }) {
    setKaydediliyor(true);
    try {
      const { modul } = await masterModulOlustur(girdi);
      setModalAcik(false);
      await yukle();
      basariBildir(`${modul.ad} eklendi — ${modul.rolSayisi} rol otomatik oluşturuldu.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Modül eklenemedi');
    } finally {
      setKaydediliyor(false);
    }
  }

  if (yukleniyor) return <YukleniyorDurumu mesaj="Modüller yükleniyor…" />;
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
        <MasterArama placeholder="Modül adı veya prefix ara…" value={arama} onChange={setArama} />
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
          onClick={() => setModalAcik(true)}
        >
          + Modül Ekle
        </button>
      </div>

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' ? 'Filtreye uygun modül bulunamadı.' : 'Henüz modül kaydı yok.'}
          </p>
        </div>
      ) : (
        <div className="ap-master-kart-grid">
          {liste.map((m) => (
            <article
              key={m.id}
              className={`ap-master-kart ap-master-modul-kart ${!m.aktif ? 'ap-master-modul-kart-pasif' : ''}`}
            >
              <div className="ap-master-kart-ust">
                <span className="ap-master-kart-ikon">🧩</span>
                <span className={`ap-master-durum ${m.aktif ? 'ap-master-durum-aktif' : ''}`}>
                  {m.aktif ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <h3 className="ap-heading text-sm font-semibold">{m.ad}</h3>
              <p className="ap-muted mt-1 font-mono text-xs">{m.prefix}</p>
              <p className="ap-muted mt-2 text-xs">{m.rolSayisi} rol tanımı</p>

              <div className="ap-master-modul-toggle">
                <DurumAnahtari
                  etiket="Modül durumu"
                  aciklama={m.aktif ? 'Panelde kullanılabilir' : 'Pasif modüller rol matrisinde gizlenir'}
                  acik={m.aktif}
                  devreDisi={islemId === m.id}
                  onChange={(v) => void durumDegistir(m, v)}
                  renk={m.aktif ? 'yesil' : 'turuncu'}
                  ikon="🧩"
                  kompakt
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <ModulEkleModal
        acik={modalAcik}
        mevcutPrefixler={moduller.map((m) => m.prefix)}
        kaydediliyor={kaydediliyor}
        onKapat={() => !kaydediliyor && setModalAcik(false)}
        onEkle={modulEkle}
      />
    </div>
  );
}
