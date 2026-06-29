import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import {
  ondalikKabul,
  PaketKayitModal,
  tamSayiKabul,
} from '@/admin/baslat-menusu/master/bilesenler/PaketKayitModal';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import {
  masterPaketGuncelle,
  masterPaketOlustur,
  masterPaketleriGetir,
  masterPaketSil,
  type MasterPaket,
  type PaketFormGirdi,
} from '@/admin/baslat-menusu/master/paketler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

type PaketInlineAlan = 'paketAdi' | 'subeSayisi' | 'personelSayisi' | 'masaSayisi' | 'fiyat';

function DuzenleIkonu() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface KartHucreProps {
  alan: PaketInlineAlan;
  gosterim: string;
  duzenlemeAktif: boolean;
  inputDeger: string;
  onBasla: () => void;
  onDegistir: (deger: string) => void;
  onBitir: () => void;
  className?: string;
  ondalik?: boolean;
}

function KartHucre({
  alan,
  gosterim,
  duzenlemeAktif,
  inputDeger,
  onBasla,
  onDegistir,
  onBitir,
  className = '',
  ondalik = false,
}: KartHucreProps) {
  function tusBas(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      onBitir();
    }
  }

  if (duzenlemeAktif) {
    return (
      <input
        type="text"
        inputMode={ondalik ? 'decimal' : 'numeric'}
        className="ap-master-tablo-input w-full"
        value={inputDeger}
        onChange={(e) => {
          const v = ondalik ? e.target.value.replace(',', '.') : e.target.value;
          if (ondalik ? ondalikKabul(v) : tamSayiKabul(v)) onDegistir(v);
        }}
        onBlur={onBitir}
        onKeyDown={tusBas}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label={alan}
      />
    );
  }

  return (
    <span
      className={`ap-master-tablo-hucre-duzenlenebilir ${className}`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onBasla();
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {gosterim}
    </span>
  );
}

export function PaketlerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [paketler, setPaketler] = useState<MasterPaket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterPaket | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [taslakMap, setTaslakMap] = useState<Record<number, Partial<PaketFormGirdi>>>({});
  const [duzenlemeHucre, setDuzenlemeHucre] = useState<{ paketId: number; alan: PaketInlineAlan } | null>(null);
  const [duzenlemeMetin, setDuzenlemeMetin] = useState('');

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

  const seciliTaslak = seciliId != null ? taslakMap[seciliId] : undefined;
  const seciliDegisiklikVar = seciliTaslak != null && Object.keys(seciliTaslak).length > 0;

  function paketBirlestir(paket: MasterPaket): MasterPaket {
    const taslak = taslakMap[paket.id];
    return {
      ...paket,
      paketAdi: taslak?.paketAdi ?? paket.paketAdi,
      subeSayisi: taslak?.subeSayisi ?? paket.subeSayisi,
      personelSayisi: taslak?.personelSayisi ?? paket.personelSayisi,
      masaSayisi: taslak?.masaSayisi ?? paket.masaSayisi,
      fiyat: taslak?.fiyat ?? paket.fiyat,
    };
  }

  const hucreBasla = useCallback((paketId: number, alan: PaketInlineAlan, mevcut: string) => {
    setSeciliId(paketId);
    setDuzenlemeHucre({ paketId, alan });
    setDuzenlemeMetin(mevcut);
  }, []);

  const hucreBitir = useCallback(() => {
    if (!duzenlemeHucre) {
      setDuzenlemeMetin('');
      return;
    }

    const { paketId, alan } = duzenlemeHucre;
    const ham = duzenlemeMetin.trim();

    setTaslakMap((onceki) => {
      const mevcut = onceki[paketId] ?? {};
      if (alan === 'paketAdi') {
        if (!ham) return onceki;
        return { ...onceki, [paketId]: { ...mevcut, paketAdi: ham } };
      }
      if (alan === 'fiyat') {
        if (ham === '') return onceki;
        const fiyat = Number(ham);
        if (Number.isNaN(fiyat) || fiyat < 0) return onceki;
        return { ...onceki, [paketId]: { ...mevcut, fiyat } };
      }
      if (ham === '') return onceki;
      const n = Number(ham);
      if (!Number.isInteger(n) || n < 1) return onceki;
      const anahtar = alan as 'subeSayisi' | 'personelSayisi' | 'masaSayisi';
      return { ...onceki, [paketId]: { ...mevcut, [anahtar]: n } };
    });

    setDuzenlemeHucre(null);
    setDuzenlemeMetin('');
  }, [duzenlemeHucre, duzenlemeMetin]);

  const yeniPaket = useCallback(() => {
    setDuzenlenen(null);
    setModalAcik(true);
  }, []);

  const paketDuzenle = useCallback((paket: MasterPaket) => {
    setSeciliId(paket.id);
    setDuzenlenen(paket);
    setModalAcik(true);
  }, []);

  const inlineKaydet = useCallback(async () => {
    if (seciliId == null || !seciliDegisiklikVar || !seciliTaslak) return;

    const ad = seciliTaslak.paketAdi?.trim();
    if (ad != null && ad.length < 2) {
      hataBildir('Paket adı en az 2 karakter olmalı');
      return;
    }
    for (const [alan, etiket] of [
      ['subeSayisi', 'Şube sayısı'],
      ['personelSayisi', 'Personel sayısı'],
      ['masaSayisi', 'Masa sayısı'],
    ] as const) {
      const n = seciliTaslak[alan];
      if (n != null && (!Number.isInteger(n) || n < 1)) {
        hataBildir(`${etiket} en az 1 olmalı`);
        return;
      }
    }
    if (seciliTaslak.fiyat != null && (Number.isNaN(seciliTaslak.fiyat) || seciliTaslak.fiyat < 0)) {
      hataBildir('Geçerli bir fiyat girin');
      return;
    }

    setKaydediliyor(true);
    try {
      await masterPaketGuncelle(seciliId, seciliTaslak);
      setTaslakMap((onceki) => {
        const yeni = { ...onceki };
        delete yeni[seciliId];
        return yeni;
      });
      await yukle();
      basariBildir('Değişiklikler kaydedildi.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, seciliDegisiklikVar, seciliTaslak, yukle, basariBildir, hataBildir]);

  const paketSil = useCallback(async () => {
    if (seciliId == null) return;
    const paket = paketler.find((p) => p.id === seciliId);
    if (!paket) return;
    if (!confirm(`"${paket.paketAdi}" paketini silmek istediğinize emin misiniz?`)) return;

    setKaydediliyor(true);
    try {
      await masterPaketSil(seciliId);
      setSeciliId(null);
      setDuzenlenen(null);
      setModalAcik(false);
      setTaslakMap((onceki) => {
        const yeni = { ...onceki };
        delete yeni[seciliId];
        return yeni;
      });
      await yukle();
      basariBildir(`${paket.paketAdi} silindi.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, paketler, yukle, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { ekle: yeniPaket, sil: paketSil, kaydet: inlineKaydet },
    {
      ekle: !kaydediliyor && !modalAcik,
      sil: seciliId != null && !kaydediliyor && !islemId && !seciliDegisiklikVar,
      kaydet: seciliDegisiklikVar && !kaydediliyor && !modalAcik,
    }
  );

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
        setTaslakMap((onceki) => {
          const yeni = { ...onceki };
          delete yeni[duzenlenen.id];
          return yeni;
        });
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
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" onClick={yeniPaket}>
          + Yeni Paket
        </button>
      </div>

      {seciliDegisiklikVar && (
        <p className="ap-muted mb-2 text-xs">
          Kaydedilmemiş değişiklikler var — alttaki <strong className="ap-heading">Kaydet</strong> ile onaylayın.
        </p>
      )}

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">Filtreye uygun paket bulunamadı.</p>
        </div>
      ) : (
        <div className="ap-master-paket-grid">
          {liste.map((ham) => {
            const p = paketBirlestir(ham);
            const kartDegisti = taslakMap[ham.id] != null && Object.keys(taslakMap[ham.id]).length > 0;

            return (
              <article
                key={p.id}
                className={[
                  'ap-master-paket-kart',
                  !p.aktif ? 'ap-master-modul-kart-pasif' : undefined,
                  seciliId === p.id ? 'ap-master-paket-kart-secili' : undefined,
                  kartDegisti ? 'ap-master-paket-kart-degisti' : undefined,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSeciliId(p.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="ap-heading min-w-0 flex-1 text-lg font-bold">
                    <KartHucre
                      alan="paketAdi"
                      gosterim={p.paketAdi}
                      duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'paketAdi'}
                      inputDeger={duzenlemeMetin}
                      onBasla={() => hucreBasla(p.id, 'paketAdi', p.paketAdi)}
                      onDegistir={setDuzenlemeMetin}
                      onBitir={hucreBitir}
                    />
                  </h3>
                  <button
                    type="button"
                    className="ap-master-tablo-ikon-btn shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      paketDuzenle(ham);
                    }}
                    aria-label="Paket düzenle"
                    title="Tüm alanları düzenle"
                  >
                    <DuzenleIkonu />
                  </button>
                </div>

                <p className="ap-master-paket-fiyat">
                  <span className="text-2xl font-bold">
                    ₺
                    <KartHucre
                      alan="fiyat"
                      gosterim={p.fiyat.toLocaleString('tr-TR')}
                      duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'fiyat'}
                      inputDeger={duzenlemeMetin}
                      onBasla={() => hucreBasla(p.id, 'fiyat', String(p.fiyat))}
                      onDegistir={setDuzenlemeMetin}
                      onBitir={hucreBitir}
                      ondalik
                      className="inline"
                    />
                  </span>
                  <span className="ap-muted text-xs"> / ay</span>
                </p>

                <ul className="ap-master-paket-ozellikler">
                  <li>
                    <KartHucre
                      alan="subeSayisi"
                      gosterim={String(p.subeSayisi)}
                      duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'subeSayisi'}
                      inputDeger={duzenlemeMetin}
                      onBasla={() => hucreBasla(p.id, 'subeSayisi', String(p.subeSayisi))}
                      onDegistir={setDuzenlemeMetin}
                      onBitir={hucreBitir}
                      className="inline font-semibold"
                    />{' '}
                    şube
                  </li>
                  <li>
                    <KartHucre
                      alan="personelSayisi"
                      gosterim={String(p.personelSayisi)}
                      duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'personelSayisi'}
                      inputDeger={duzenlemeMetin}
                      onBasla={() => hucreBasla(p.id, 'personelSayisi', String(p.personelSayisi))}
                      onDegistir={setDuzenlemeMetin}
                      onBitir={hucreBitir}
                      className="inline font-semibold"
                    />{' '}
                    personel
                  </li>
                  <li>
                    <KartHucre
                      alan="masaSayisi"
                      gosterim={String(p.masaSayisi)}
                      duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'masaSayisi'}
                      inputDeger={duzenlemeMetin}
                      onBasla={() => hucreBasla(p.id, 'masaSayisi', String(p.masaSayisi))}
                      onDegistir={setDuzenlemeMetin}
                      onBitir={hucreBitir}
                      className="inline font-semibold"
                    />{' '}
                    masa
                  </li>
                  <li>{p.aktifLisansSayisi} aktif lisans</li>
                </ul>

                <div className="ap-master-paket-toggle mt-3" onClick={(e) => e.stopPropagation()}>
                  <DurumAnahtari
                    etiket={p.aktif ? 'Satışta' : 'Pasif paket'}
                    acik={p.aktif}
                    devreDisi={islemId === p.id}
                    onChange={(v) => void durumDegistir(ham, v)}
                    renk={p.aktif ? 'yesil' : 'turuncu'}
                    sadeceToggle
                  />
                </div>
              </article>
            );
          })}
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
