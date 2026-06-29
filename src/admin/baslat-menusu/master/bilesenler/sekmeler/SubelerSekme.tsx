import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { MasterArama } from '@/admin/baslat-menusu/master/bilesenler/MasterArama';
import { SubeKayitModal } from '@/admin/baslat-menusu/master/bilesenler/SubeKayitModal';
import { masterFirmalariGetir, type MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  SUBE_TIP_SECENEKLERI,
  masterSubeGuncelle,
  masterSubeOlustur,
  masterSubeleriGetir,
  masterSubeSil,
  subeTarihGoster,
  subeTipEtiketi,
  type MasterSube,
  type SubeFormGirdi,
  type SubeTipi,
} from '@/admin/baslat-menusu/master/subeler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

type SubeInlineAlan =
  | 'subeAdi'
  | 'eposta'
  | 'konum'
  | 'firma'
  | 'subeTipi'
  | 'vergiDairesi'
  | 'vergiNo'
  | 'iskonto';

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

function firmaEtiketi(firmaTabela: string | null, firmaUnvan: string): string {
  return firmaTabela ?? firmaUnvan;
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
  alan: string;
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
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      onBitir();
    }
  }

  if (duzenlemeAktif) {
    return (
      <input
        type={inputTipi}
        className={`${formInputSinifi} ap-master-excel-input`}
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
      className={`ap-master-excel-hucre-tiklanabilir ${className}`}
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

interface FirmaHucreProps {
  firmaId: number;
  gosterim: string;
  secenekler: MasterFirma[];
  duzenlemeAktif: boolean;
  onBasla: () => void;
  onSec: (firmaId: number) => void;
  onBitir: () => void;
}

function FirmaHucre({ firmaId, gosterim, secenekler, duzenlemeAktif, onBasla, onSec, onBitir }: FirmaHucreProps) {
  const aktifFirmalar = secenekler.filter((f) => f.aktif);

  if (duzenlemeAktif) {
    return (
      <select
        className={`${formSelectSinifi} ap-master-excel-input`}
        value={firmaId || ''}
        onChange={(e) => {
          onSec(Number(e.target.value));
          onBitir();
        }}
        onBlur={onBitir}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label="Firma"
      >
        {aktifFirmalar.map((f) => (
          <option key={f.id} value={f.id}>
            {f.tabelaAdi ?? f.unvan}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      className="ap-master-excel-hucre-tiklanabilir ap-muted"
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

interface SubeTipiHucreProps {
  subeTipi: SubeTipi;
  duzenlemeAktif: boolean;
  onBasla: () => void;
  onSec: (tip: SubeTipi) => void;
  onBitir: () => void;
}

function SubeTipiHucre({ subeTipi, duzenlemeAktif, onBasla, onSec, onBitir }: SubeTipiHucreProps) {
  if (duzenlemeAktif) {
    return (
      <select
        className={`${formSelectSinifi} ap-master-excel-input`}
        value={subeTipi}
        onChange={(e) => {
          onSec(e.target.value as SubeTipi);
          onBitir();
        }}
        onBlur={onBitir}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label="Şube tipi"
      >
        {SUBE_TIP_SECENEKLERI.map((t) => (
          <option key={t.kod} value={t.kod}>
            {t.etiket}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      className="ap-master-excel-hucre-tiklanabilir"
      onDoubleClick={(e) => {
        e.stopPropagation();
        onBasla();
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {subeTipEtiketi(subeTipi)}
    </span>
  );
}

export function SubelerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [subeler, setSubeler] = useState<MasterSube[]>([]);
  const [firmalar, setFirmalar] = useState<MasterFirma[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [firmaFiltre, setFirmaFiltre] = useState<number | ''>('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterSube | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [taslakMap, setTaslakMap] = useState<Record<number, Partial<SubeFormGirdi>>>({});
  const [duzenlemeHucre, setDuzenlemeHucre] = useState<{ subeId: number; alan: SubeInlineAlan } | null>(null);

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
        (s.firmaTabela?.toLowerCase().includes(q) ?? false) ||
        (s.il?.toLowerCase().includes(q) ?? false) ||
        (s.vergiNo?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [subeler, arama, filtre, firmaFiltre]);

  const seciliTaslak = seciliId != null ? taslakMap[seciliId] : undefined;
  const seciliDegisiklikVar = seciliTaslak != null && Object.keys(seciliTaslak).length > 0;

  function subeBirlestir(sube: MasterSube): MasterSube & { konumMetin: string; firmaGoster: string } {
    const taslak = taslakMap[sube.id];
    const il = taslak?.il !== undefined ? taslak.il ?? null : sube.il;
    const ilce = taslak?.ilce !== undefined ? taslak.ilce ?? null : sube.ilce;
    const firmaId = taslak?.firmaId ?? sube.firmaId;
    const firma = firmalar.find((f) => f.id === firmaId);
    const firmaUnvan = firma?.unvan ?? sube.firmaUnvan;
    const firmaTabela = firma?.tabelaAdi ?? sube.firmaTabela;

    return {
      ...sube,
      firmaId,
      firmaUnvan,
      firmaTabela,
      subeAdi: taslak?.subeAdi ?? sube.subeAdi,
      subeTipi: taslak?.subeTipi ?? sube.subeTipi,
      eposta: taslak?.eposta !== undefined ? taslak.eposta ?? null : sube.eposta,
      il,
      ilce,
      vergiDairesi: taslak?.vergiDairesi !== undefined ? taslak.vergiDairesi ?? null : sube.vergiDairesi,
      vergiNo: taslak?.vergiNo !== undefined ? taslak.vergiNo ?? null : sube.vergiNo,
      iskonto: taslak?.iskonto !== undefined ? taslak.iskonto ?? null : sube.iskonto,
      konumMetin: konumGoster(il, ilce),
      firmaGoster: firmaEtiketi(firmaTabela, firmaUnvan),
    };
  }

  const hucreBasla = useCallback((subeId: number, alan: SubeInlineAlan) => {
    setSeciliId(subeId);
    setDuzenlemeHucre({ subeId, alan });
  }, []);

  const hucreBitir = useCallback(() => {
    setDuzenlemeHucre(null);
  }, []);

  const firmaSec = useCallback((subeId: number, firmaId: number) => {
    setSeciliId(subeId);
    setTaslakMap((onceki) => ({
      ...onceki,
      [subeId]: { ...(onceki[subeId] ?? {}), firmaId },
    }));
  }, []);

  const subeTipiSec = useCallback((subeId: number, subeTipi: SubeTipi) => {
    setSeciliId(subeId);
    setTaslakMap((onceki) => ({
      ...onceki,
      [subeId]: { ...(onceki[subeId] ?? {}), subeTipi },
    }));
  }, []);

  const hucreGuncelle = useCallback((subeId: number, alan: SubeInlineAlan, ham: string) => {
    setSeciliId(subeId);
    setTaslakMap((onceki) => {
      const mevcut = onceki[subeId] ?? {};

      if (alan === 'konum') {
        const { il, ilce } = konumAyristir(ham);
        return { ...onceki, [subeId]: { ...mevcut, il, ilce } };
      }

      if (alan === 'iskonto') {
        const iskonto = ham.trim() === '' ? null : Number(ham);
        return { ...onceki, [subeId]: { ...mevcut, iskonto: Number.isNaN(iskonto) ? null : iskonto } };
      }

      const alanMap: Record<Exclude<SubeInlineAlan, 'konum' | 'iskonto' | 'firma' | 'subeTipi'>, keyof SubeFormGirdi> = {
        subeAdi: 'subeAdi',
        eposta: 'eposta',
        vergiDairesi: 'vergiDairesi',
        vergiNo: 'vergiNo',
      };
      const anahtar = alanMap[alan as keyof typeof alanMap];
      return { ...onceki, [subeId]: { ...mevcut, [anahtar]: ham.trim() || undefined } };
    });
  }, []);

  const yeniSube = useCallback(() => {
    setDuzenlenen(null);
    setModalAcik(true);
  }, []);

  const subeDuzenle = useCallback((sube: MasterSube) => {
    setSeciliId(sube.id);
    setDuzenlenen(sube);
    setModalAcik(true);
  }, []);

  const inlineKaydet = useCallback(async () => {
    if (seciliId == null || !seciliDegisiklikVar || !seciliTaslak) return;

    const subeAdi = seciliTaslak.subeAdi?.trim();
    if (subeAdi != null && subeAdi.length < 2) {
      hataBildir('Şube adı en az 2 karakter olmalı');
      return;
    }

    if (seciliTaslak.iskonto != null && (seciliTaslak.iskonto < 0 || seciliTaslak.iskonto > 100)) {
      hataBildir('İskonto 0–100 arasında olmalı');
      return;
    }

    setKaydediliyor(true);
    try {
      await masterSubeGuncelle(seciliId, seciliTaslak);
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

  const subeSil = useCallback(async () => {
    if (seciliId == null) return;
    const sube = subeler.find((s) => s.id === seciliId);
    if (!sube) return;
    if (!confirm(`"${sube.subeAdi}" şubesini silmek istediğinize emin misiniz?`)) return;

    setKaydediliyor(true);
    try {
      await masterSubeSil(seciliId);
      setSeciliId(null);
      setDuzenlenen(null);
      setModalAcik(false);
      setTaslakMap((onceki) => {
        const yeni = { ...onceki };
        delete yeni[seciliId];
        return yeni;
      });
      await yukle();
      basariBildir(`${sube.subeAdi} silindi.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, subeler, yukle, basariBildir, hataBildir]);

  const aktifFirmalar = firmalar.filter((f) => f.aktif);

  useModulAksiyonlari(
    { ekle: yeniSube, sil: subeSil, kaydet: inlineKaydet },
    {
      ekle: !kaydediliyor && !modalAcik && aktifFirmalar.length > 0,
      sil: seciliId != null && !kaydediliyor && !islemId && !seciliDegisiklikVar,
      kaydet: seciliDegisiklikVar && !kaydediliyor && !modalAcik,
    }
  );

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
        setTaslakMap((onceki) => {
          const yeni = { ...onceki };
          delete yeni[duzenlenen.id];
          return yeni;
        });
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
        <MasterArama placeholder="Şube, firma, il veya vergi no ara…" value={arama} onChange={setArama} />
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
      </div>

      {seciliDegisiklikVar && (
        <p className="ap-muted mb-2 text-xs">
          Kaydedilmemiş değişiklikler var — alttaki <strong className="ap-heading">Kaydet</strong> ile onaylayın.
        </p>
      )}

      {liste.length === 0 ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' || firmaFiltre !== ''
              ? 'Filtreye uygun şube bulunamadı.'
              : aktifFirmalar.length === 0
                ? 'Önce aktif bir firma ekleyin.'
                : 'Henüz şube kaydı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : (
        <div className="ap-master-excel-wrap">
          <div className="ap-master-excel-ust">
            <p className="ap-muted text-xs">11 sütun görünüyor — çift tıklayarak hücre düzenleyin</p>
          </div>
          <div className="ap-master-excel-scroll">
          <table className="ap-master-excel-tablo ap-master-bayi-tablo">
            <thead>
              <tr>
                <th>Şube adı</th>
                <th>Firma</th>
                <th>Tip</th>
                <th>Konum</th>
                <th>Vergi dairesi</th>
                <th>Vergi no</th>
                <th>İskonto</th>
                <th>Kayıt</th>
                <th>Güncelleme</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {liste.map((ham) => {
                const s = subeBirlestir(ham);
                const satirDegisti = taslakMap[ham.id] != null && Object.keys(taslakMap[ham.id]).length > 0;

                return (
                  <tr
                    key={s.id}
                    className={[
                      !s.aktif ? 'ap-master-tablo-pasif' : undefined,
                      seciliId === s.id ? 'ap-master-excel-satir-secili' : undefined,
                      satirDegisti ? 'ap-master-tablo-degisti' : undefined,
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined}
                    onClick={() => setSeciliId(s.id)}
                  >
                    <td className="ap-master-excel-hucre">
                      <TabloHucre
                        alan="subeAdi"
                        gosterim={s.subeAdi}
                        duzenlemeAktif={duzenlemeHucre?.subeId === s.id && duzenlemeHucre.alan === 'subeAdi'}
                        inputDeger={s.subeAdi}
                        onBasla={() => hucreBasla(s.id, 'subeAdi')}
                        onDegistir={(v) => hucreGuncelle(s.id, 'subeAdi', v)}
                        onBitir={hucreBitir}
                        className="ap-heading font-medium"
                      />
                      <TabloHucre
                        alan="eposta"
                        gosterim={s.eposta ?? '—'}
                        duzenlemeAktif={duzenlemeHucre?.subeId === s.id && duzenlemeHucre.alan === 'eposta'}
                        inputDeger={s.eposta ?? ''}
                        onBasla={() => hucreBasla(s.id, 'eposta')}
                        onDegistir={(v) => hucreGuncelle(s.id, 'eposta', v)}
                        onBitir={hucreBitir}
                        className="ap-muted ap-master-tablo-alt-satir block truncate"
                      />
                    </td>
                    <td className="ap-master-excel-hucre">
                      <FirmaHucre
                        firmaId={s.firmaId}
                        gosterim={s.firmaGoster}
                        secenekler={firmalar}
                        duzenlemeAktif={duzenlemeHucre?.subeId === s.id && duzenlemeHucre.alan === 'firma'}
                        onBasla={() => hucreBasla(s.id, 'firma')}
                        onSec={(firmaId) => firmaSec(s.id, firmaId)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-master-excel-hucre">
                      <SubeTipiHucre
                        subeTipi={s.subeTipi}
                        duzenlemeAktif={duzenlemeHucre?.subeId === s.id && duzenlemeHucre.alan === 'subeTipi'}
                        onBasla={() => hucreBasla(s.id, 'subeTipi')}
                        onSec={(tip) => subeTipiSec(s.id, tip)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-muted ap-master-excel-hucre">
                      <TabloHucre
                        alan="konum"
                        gosterim={s.konumMetin}
                        duzenlemeAktif={duzenlemeHucre?.subeId === s.id && duzenlemeHucre.alan === 'konum'}
                        inputDeger={s.konumMetin === '—' ? '' : s.konumMetin}
                        onBasla={() => hucreBasla(s.id, 'konum')}
                        onDegistir={(v) => hucreGuncelle(s.id, 'konum', v)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-muted ap-master-excel-hucre">
                      <TabloHucre
                        alan="vergiDairesi"
                        gosterim={s.vergiDairesi ?? '—'}
                        duzenlemeAktif={duzenlemeHucre?.subeId === s.id && duzenlemeHucre.alan === 'vergiDairesi'}
                        inputDeger={s.vergiDairesi ?? ''}
                        onBasla={() => hucreBasla(s.id, 'vergiDairesi')}
                        onDegistir={(v) => hucreGuncelle(s.id, 'vergiDairesi', v)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-muted ap-master-excel-hucre">
                      <TabloHucre
                        alan="vergiNo"
                        gosterim={s.vergiNo ?? '—'}
                        duzenlemeAktif={duzenlemeHucre?.subeId === s.id && duzenlemeHucre.alan === 'vergiNo'}
                        inputDeger={s.vergiNo ?? ''}
                        onBasla={() => hucreBasla(s.id, 'vergiNo')}
                        onDegistir={(v) => hucreGuncelle(s.id, 'vergiNo', v)}
                        onBitir={hucreBitir}
                      />
                    </td>
                    <td className="ap-master-excel-hucre">
                      <TabloHucre
                        alan="iskonto"
                        gosterim={iskontoGoster(s.iskonto)}
                        duzenlemeAktif={duzenlemeHucre?.subeId === s.id && duzenlemeHucre.alan === 'iskonto'}
                        inputDeger={s.iskonto != null ? String(s.iskonto) : ''}
                        onBasla={() => hucreBasla(s.id, 'iskonto')}
                        onDegistir={(v) => hucreGuncelle(s.id, 'iskonto', v)}
                        onBitir={hucreBitir}
                        inputTipi="number"
                      />
                    </td>
                    <td className="ap-master-excel-hucre-tarih">{subeTarihGoster(s.kayitTarihi)}</td>
                    <td className="ap-master-excel-hucre-tarih">{subeTarihGoster(s.guncellemeTarihi)}</td>
                    <td className="ap-master-tablo-toggle-hucre" onClick={(e) => e.stopPropagation()}>
                      <DurumAnahtari
                        etiket={s.aktif ? 'Aktif şube' : 'Pasif şube'}
                        acik={s.aktif}
                        devreDisi={islemId === s.id}
                        onChange={(v) => void durumDegistir(ham, v)}
                        renk={s.aktif ? 'yesil' : 'turuncu'}
                        sadeceToggle
                      />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="ap-master-tablo-ikon-btn"
                        onClick={() => subeDuzenle(ham)}
                        aria-label="Şube düzenle"
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
        </div>
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
