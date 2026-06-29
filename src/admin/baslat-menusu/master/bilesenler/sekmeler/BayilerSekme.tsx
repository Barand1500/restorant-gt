import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { BayiKayitModal } from '@/admin/baslat-menusu/master/bilesenler/BayiKayitModal';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import {
  bayiTarihGoster,
  masterBayiGuncelle,
  masterBayiOlustur,
  masterBayileriGetir,
  masterBayiSil,
  type BayiFormGirdi,
  type MasterBayi,
} from '@/admin/baslat-menusu/master/bayiler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

type BayiInlineAlan = 'unvan' | 'eposta' | 'konum' | 'ustBayi' | 'vergiDairesi' | 'vergiNo' | 'iskonto';

function iskontoGoster(deger: number | null): string {
  if (deger == null) return '—';
  return `%${deger}`;
}

function konumGoster(il: string | null, ilce: string | null): string {
  const metin = [il, ilce].filter(Boolean).join(' / ');
  return metin || '—';
}

function konumAyristir(metin: string): { il?: string; ilce?: string } {
  const parcalar = metin.split('/').map((s) => s.trim());
  if (parcalar.length <= 1) {
    return { il: parcalar[0] || undefined, ilce: undefined };
  }
  return { il: parcalar[0] || undefined, ilce: parcalar.slice(1).join(' / ') || undefined };
}

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

interface TabloHucreProps {
  bayiId: number;
  alan: BayiInlineAlan;
  gosterim: string;
  duzenlemeAktif: boolean;
  inputDeger: string;
  onBasla: () => void;
  onDegistir: (deger: string) => void;
  onBitir: () => void;
  className?: string;
  inputTipi?: 'text' | 'number';
}

function TabloHucre({
  alan,
  gosterim,
  duzenlemeAktif,
  inputDeger,
  onBasla,
  onDegistir,
  onBitir,
  className = '',
  inputTipi = 'text',
}: TabloHucreProps) {
  function tusBas(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onBitir();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onBitir();
    }
  }

  if (duzenlemeAktif) {
    return (
      <input
        type={inputTipi}
        className="ap-master-tablo-input"
        value={inputDeger}
        onChange={(e) => onDegistir(e.target.value)}
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

interface UstBayiHucreProps {
  bayiId: number;
  ustId: number | null;
  gosterim: string;
  secenekler: MasterBayi[];
  duzenlemeAktif: boolean;
  onBasla: () => void;
  onSec: (ustId: number | null) => void;
  onBitir: () => void;
}

function UstBayiHucre({
  bayiId,
  ustId,
  gosterim,
  secenekler,
  duzenlemeAktif,
  onBasla,
  onSec,
  onBitir,
}: UstBayiHucreProps) {
  const uygunSecenekler = secenekler.filter((b) => b.id !== bayiId && b.aktif);

  if (duzenlemeAktif) {
    return (
      <select
        className={`${formSelectSinifi} ap-master-tablo-input`}
        value={ustId ?? ''}
        onChange={(e) => {
          onSec(e.target.value ? Number(e.target.value) : null);
          onBitir();
        }}
        onBlur={onBitir}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label="Üst bayi"
      >
        <option value="">Bağımsız (ana bayi)</option>
        {uygunSecenekler.map((b) => (
          <option key={b.id} value={b.id}>
            {b.unvan}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      className="ap-master-tablo-hucre-duzenlenebilir ap-muted text-sm"
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

export function BayilerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [bayiler, setBayiler] = useState<MasterBayi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterBayi | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [taslakMap, setTaslakMap] = useState<Record<number, Partial<BayiFormGirdi>>>({});
  const [duzenlemeHucre, setDuzenlemeHucre] = useState<{ bayiId: number; alan: BayiInlineAlan } | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const veri = await masterBayileriGetir();
      setBayiler(veri.bayiler ?? []);
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
        (b.ustUnvan?.toLowerCase().includes(q) ?? false) ||
        (b.vergiNo?.toLowerCase().includes(q) ?? false) ||
        (b.vergiDairesi?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [bayiler, arama, filtre]);

  const seciliTaslak = seciliId != null ? taslakMap[seciliId] : undefined;
  const seciliDegisiklikVar = seciliTaslak != null && Object.keys(seciliTaslak).length > 0;

  function bayiBirlestir(bayi: MasterBayi): MasterBayi & { konumMetin: string; ustUnvanGoster: string } {
    const taslak = taslakMap[bayi.id];
    const il = taslak?.il !== undefined ? taslak.il ?? null : bayi.il;
    const ilce = taslak?.ilce !== undefined ? taslak.ilce ?? null : bayi.ilce;
    const ustId = taslak?.ustId !== undefined ? taslak.ustId ?? null : bayi.ustId;
    const ustUnvan =
      ustId != null ? (bayiler.find((x) => x.id === ustId)?.unvan ?? bayi.ustUnvan) : null;
    return {
      ...bayi,
      ustId,
      ustUnvan,
      unvan: taslak?.unvan ?? bayi.unvan,
      eposta: taslak?.eposta !== undefined ? taslak.eposta ?? null : bayi.eposta,
      il,
      ilce,
      vergiDairesi: taslak?.vergiDairesi !== undefined ? taslak.vergiDairesi ?? null : bayi.vergiDairesi,
      vergiNo: taslak?.vergiNo !== undefined ? taslak.vergiNo ?? null : bayi.vergiNo,
      iskonto: taslak?.iskonto !== undefined ? taslak.iskonto ?? null : bayi.iskonto,
      konumMetin: konumGoster(il, ilce),
      ustUnvanGoster: ustUnvan ?? 'Bağımsız',
    };
  }

  const hucreBasla = useCallback((bayiId: number, alan: BayiInlineAlan) => {
    setSeciliId(bayiId);
    setDuzenlemeHucre({ bayiId, alan });
  }, []);

  const hucreBitir = useCallback(() => {
    setDuzenlemeHucre(null);
  }, []);

  const ustBayiSec = useCallback((bayiId: number, ustId: number | null) => {
    setSeciliId(bayiId);
    setTaslakMap((onceki) => ({
      ...onceki,
      [bayiId]: { ...(onceki[bayiId] ?? {}), ustId },
    }));
  }, []);

  const hucreGuncelle = useCallback((bayiId: number, alan: BayiInlineAlan, ham: string) => {
    setSeciliId(bayiId);
    setTaslakMap((onceki) => {
      const mevcut = onceki[bayiId] ?? {};
      const bayi = bayiler.find((b) => b.id === bayiId);
      if (!bayi) return onceki;

      if (alan === 'konum') {
        const { il, ilce } = konumAyristir(ham);
        return { ...onceki, [bayiId]: { ...mevcut, il, ilce } };
      }

      if (alan === 'iskonto') {
        const iskonto = ham.trim() === '' ? null : Number(ham);
        return { ...onceki, [bayiId]: { ...mevcut, iskonto: Number.isNaN(iskonto) ? null : iskonto } };
      }

      const alanMap: Record<Exclude<BayiInlineAlan, 'konum' | 'iskonto' | 'ustBayi'>, keyof BayiFormGirdi> = {
        unvan: 'unvan',
        eposta: 'eposta',
        vergiDairesi: 'vergiDairesi',
        vergiNo: 'vergiNo',
      };
      const anahtar = alanMap[alan as keyof typeof alanMap];
      return { ...onceki, [bayiId]: { ...mevcut, [anahtar]: ham.trim() || undefined } };
    });
  }, [bayiler]);

  const yeniBayi = useCallback(() => {
    setDuzenlenen(null);
    setModalAcik(true);
  }, []);

  const bayiDuzenle = useCallback((bayi: MasterBayi) => {
    setSeciliId(bayi.id);
    setDuzenlenen(bayi);
    setModalAcik(true);
  }, []);

  const inlineKaydet = useCallback(async () => {
    if (seciliId == null || !seciliDegisiklikVar || !seciliTaslak) return;

    const unvan = seciliTaslak.unvan?.trim();
    if (unvan != null && unvan.length < 2) {
      hataBildir('Unvan en az 2 karakter olmalı');
      return;
    }

    if (seciliTaslak.iskonto != null && (seciliTaslak.iskonto < 0 || seciliTaslak.iskonto > 100)) {
      hataBildir('İskonto 0–100 arasında olmalı');
      return;
    }

    setKaydediliyor(true);
    try {
      await masterBayiGuncelle(seciliId, seciliTaslak);
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

  const bayiSil = useCallback(async () => {
    if (seciliId == null) return;
    const bayi = bayiler.find((b) => b.id === seciliId);
    if (!bayi) return;
    if (!confirm(`"${bayi.unvan}" bayisini silmek istediğinize emin misiniz?`)) return;

    setKaydediliyor(true);
    try {
      await masterBayiSil(seciliId);
      setSeciliId(null);
      setDuzenlenen(null);
      setModalAcik(false);
      setTaslakMap((onceki) => {
        const yeni = { ...onceki };
        delete yeni[seciliId];
        return yeni;
      });
      await yukle();
      basariBildir(`${bayi.unvan} silindi.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, bayiler, yukle, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { ekle: yeniBayi, sil: bayiSil, kaydet: inlineKaydet },
    {
      ekle: !kaydediliyor && !modalAcik,
      sil: seciliId != null && !kaydediliyor && !islemId && !seciliDegisiklikVar,
      kaydet: seciliDegisiklikVar && !kaydediliyor && !modalAcik,
    }
  );

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
        setTaslakMap((onceki) => {
          const yeni = { ...onceki };
          delete yeni[duzenlenen.id];
          return yeni;
        });
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
        <MasterArama placeholder="Unvan, il, vergi no veya üst bayi ara…" value={arama} onChange={setArama} />
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" onClick={yeniBayi}>
          + Bayi Ekle
        </button>
      </div>

      {seciliDegisiklikVar && (
        <p className="ap-muted mb-2 text-xs">
          Kaydedilmemiş değişiklikler var — alttaki <strong className="ap-heading">Kaydet</strong> ile onaylayın.
        </p>
      )}

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' ? 'Filtreye uygun bayi bulunamadı.' : 'Henüz bayi kaydı yok.'}
          </p>
        </div>
      ) : (
        <div className="ap-seo-tablo-scroll">
          <table className="ap-seo-tablo ap-master-bayi-tablo">
            <thead>
              <tr>
                <th>Unvan</th>
                <th>Konum</th>
                <th>Üst bayi</th>
                <th>Vergi dairesi</th>
                <th>Vergi no</th>
                <th>İskonto</th>
                <th
                  className="ap-master-tablo-bilgi-baslik"
                  title="Bu bayiye bağlı müşteri firma adedi — Firmalar sekmesinden yönetilir, burada salt okunur özet"
                >
                  Firma sayısı
                </th>
                <th>Kayıt</th>
                <th>Güncelleme</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {liste.map((ham) => {
                const b = bayiBirlestir(ham);
                const satirDegisti = taslakMap[ham.id] != null && Object.keys(taslakMap[ham.id]).length > 0;

                return (
                  <tr
                    key={b.id}
                    className={[
                      !b.aktif ? 'ap-master-tablo-pasif' : undefined,
                      seciliId === b.id ? 'ap-master-tablo-secili' : undefined,
                      satirDegisti ? 'ap-master-tablo-degisti' : undefined,
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined}
                    onClick={() => setSeciliId(b.id)}
                  >
                    <td className="ap-master-tablo-hucre">
                      <TabloHucre
                        bayiId={b.id}
                        alan="unvan"
                        gosterim={b.unvan}
                        duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'unvan'}
                        inputDeger={b.unvan}
                        onBasla={() => hucreBasla(b.id, 'unvan')}
                        onDegistir={(v) => hucreGuncelle(b.id, 'unvan', v)}
                        onBitir={hucreBitir}
                        className="ap-heading font-medium"
                      />
                      <TabloHucre
                        bayiId={b.id}
                        alan="eposta"
                        gosterim={b.eposta ?? '—'}
                        duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'eposta'}
                        inputDeger={b.eposta ?? ''}
                        onBasla={() => hucreBasla(b.id, 'eposta')}
                        onDegistir={(v) => hucreGuncelle(b.id, 'eposta', v)}
                        onBitir={hucreBitir}
                        className="ap-muted mt-0.5 block truncate text-xs"
                      />
                    </td>
                    <td className="ap-muted ap-master-tablo-hucre text-sm">
                      <TabloHucre
                        bayiId={b.id}
                        alan="konum"
                        gosterim={b.konumMetin}
                        duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'konum'}
                        inputDeger={b.konumMetin === '—' ? '' : b.konumMetin}
                        onBasla={() => hucreBasla(b.id, 'konum')}
                        onDegistir={(v) => hucreGuncelle(b.id, 'konum', v)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-master-tablo-hucre">
                      <UstBayiHucre
                        bayiId={b.id}
                        ustId={b.ustId}
                        gosterim={b.ustUnvanGoster}
                        secenekler={bayiler}
                        duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'ustBayi'}
                        onBasla={() => hucreBasla(b.id, 'ustBayi')}
                        onSec={(ustId) => ustBayiSec(b.id, ustId)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-muted ap-master-tablo-hucre text-sm">
                      <TabloHucre
                        bayiId={b.id}
                        alan="vergiDairesi"
                        gosterim={b.vergiDairesi ?? '—'}
                        duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'vergiDairesi'}
                        inputDeger={b.vergiDairesi ?? ''}
                        onBasla={() => hucreBasla(b.id, 'vergiDairesi')}
                        onDegistir={(v) => hucreGuncelle(b.id, 'vergiDairesi', v)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-muted ap-master-tablo-hucre text-sm">
                      <TabloHucre
                        bayiId={b.id}
                        alan="vergiNo"
                        gosterim={b.vergiNo ?? '—'}
                        duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'vergiNo'}
                        inputDeger={b.vergiNo ?? ''}
                        onBasla={() => hucreBasla(b.id, 'vergiNo')}
                        onDegistir={(v) => hucreGuncelle(b.id, 'vergiNo', v)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-master-tablo-hucre">
                      <TabloHucre
                        bayiId={b.id}
                        alan="iskonto"
                        gosterim={iskontoGoster(b.iskonto)}
                        duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'iskonto'}
                        inputDeger={b.iskonto != null ? String(b.iskonto) : ''}
                        onBasla={() => hucreBasla(b.id, 'iskonto')}
                        onDegistir={(v) => hucreGuncelle(b.id, 'iskonto', v)}
                        onBitir={hucreBitir}
                        inputTipi="number"
                      />
                    </td>
                    <td className="ap-muted text-center text-sm" title="Bağlı müşteri firma adedi">
                      <span className="ap-master-etiket">{b.firmaSayisi}</span>
                      {b.altBayiSayisi > 0 && (
                        <span className="ap-muted ml-1 text-xs" title="Alt bayi sayısı">
                          · {b.altBayiSayisi} alt
                        </span>
                      )}
                    </td>
                    <td className="ap-muted text-xs whitespace-nowrap">{bayiTarihGoster(b.kayitTarihi)}</td>
                    <td className="ap-muted text-xs whitespace-nowrap">{bayiTarihGoster(b.guncellemeTarihi)}</td>
                    <td className="ap-master-tablo-toggle-hucre" onClick={(e) => e.stopPropagation()}>
                      <DurumAnahtari
                        etiket={b.aktif ? 'Aktif bayi' : 'Pasif bayi'}
                        acik={b.aktif}
                        devreDisi={islemId === b.id}
                        onChange={(v) => void durumDegistir(ham, v)}
                        renk={b.aktif ? 'yesil' : 'turuncu'}
                        sadeceToggle
                      />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="ap-master-tablo-ikon-btn"
                        onClick={() => bayiDuzenle(ham)}
                        aria-label="Bayi düzenle"
                        title="Tüm alanları düzenle"
                      >
                        <DuzenleIkonu />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
