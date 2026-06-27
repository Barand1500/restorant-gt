import { useCallback, useEffect, useMemo, useState } from 'react';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { KullaniciKayitModal } from '@/admin/baslat-menusu/master/bilesenler/KullaniciKayitModal';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import { masterBayileriGetir } from '@/admin/baslat-menusu/master/bayiler/api';
import { masterFirmalariGetir } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  KULLANICI_TIP_ETIKET,
  masterKullaniciGuncelle,
  masterKullaniciOlustur,
  masterKullanicilariGetir,
  type KullaniciFormGirdi,
  type MasterKullanici,
} from '@/admin/baslat-menusu/master/kullanicilar/api';
import { masterSubeleriGetir } from '@/admin/baslat-menusu/master/subeler/api';
import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

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
  const [islemId, setIslemId] = useState<number | null>(null);

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
        k.rol.toLowerCase().includes(q)
      );
    });
  }, [kullanicilar, arama, filtre]);

  async function durumDegistir(k: MasterKullanici, aktif: boolean) {
    setIslemId(k.id);
    try {
      await masterKullaniciGuncelle(k.id, { aktif });
      await yukle();
      basariBildir(`${k.ad} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  async function kaydet(girdi: KullaniciFormGirdi) {
    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterKullaniciGuncelle(duzenlenen.id, girdi);
        basariBildir(`${girdi.ad} güncellendi.`);
      } else {
        await masterKullaniciOlustur(girdi);
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
        <MasterArama placeholder="Ad, e-posta veya rol ara…" value={arama} onChange={setArama} />
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
          onClick={() => {
            setDuzenlenen(null);
            setModalAcik(true);
          }}
        >
          + Kullanıcı Ekle
        </button>
      </div>

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">Filtreye uygun kullanıcı bulunamadı.</p>
        </div>
      ) : (
        <div className="ap-master-liste">
          {liste.map((k) => (
            <article
              key={k.id}
              className={`ap-master-liste-satir ap-master-bayi-satir ${!k.aktif ? 'ap-master-modul-kart-pasif' : ''}`}
            >
              <div className="ap-master-liste-sol">
                <span className="ap-master-avatar">{k.ad.charAt(0).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="ap-heading font-medium">{k.ad}</p>
                  <p className="ap-muted text-xs">{k.eposta}</p>
                  <p className="ap-muted mt-0.5 text-xs">
                    {KULLANICI_TIP_ETIKET[k.kullaniciTipi]}
                    {k.subeAdi && ` · ${k.subeAdi}`}
                    {k.firmaTabela && !k.subeAdi && ` · ${k.firmaTabela}`}
                    {k.bayiUnvan && k.kullaniciTipi === 'bayi' && ` · ${k.bayiUnvan}`}
                  </p>
                </div>
              </div>

              <div className="ap-master-liste-meta">
                <span className="ap-master-etiket">{KULLANICI_TIP_ETIKET[k.kullaniciTipi]}</span>
                <span className="ap-master-etiket ap-master-etiket-mor">{k.rol}</span>
              </div>

              <div className="ap-master-bayi-aksiyonlar">
                <DurumAnahtari
                  etiket="Kullanıcı durumu"
                  aciklama={k.aktif ? 'Giriş yapabilir' : 'Hesap pasif'}
                  acik={k.aktif}
                  devreDisi={islemId === k.id}
                  onChange={(v) => void durumDegistir(k, v)}
                  renk={k.aktif ? 'yesil' : 'turuncu'}
                  kompakt
                />
                <button
                  type="button"
                  className="ap-master-link-btn !cursor-pointer !opacity-100"
                  onClick={() => {
                    setDuzenlenen(k);
                    setModalAcik(true);
                  }}
                >
                  Düzenle
                </button>
              </div>
            </article>
          ))}
        </div>
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
