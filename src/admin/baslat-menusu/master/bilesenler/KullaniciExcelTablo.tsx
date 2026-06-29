import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import { DuzenleIkonu } from '@/admin/baslat-menusu/master/bilesenler/DuzenleIkonu';
import { MasterTabloSutunAyarlari } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSutunAyarlari';
import { MasterDuzenlenebilirHucre } from '@/admin/baslat-menusu/master/bilesenler/MasterDuzenlenebilirHucre';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  KULLANICI_TABLO_SUTUNLARI,
  KULLANICI_TABLO_VARSAYILAN_SIRA,
  kullaniciTabloSutunTanimiBul,
} from '@/admin/baslat-menusu/master/kullanicilar/kullaniciTabloSutunlari';
import {
  KULLANICI_TIP_ETIKET,
  sonGirisGoster,
  type KullaniciFormGirdi,
  type MasterKullanici,
} from '@/admin/baslat-menusu/master/kullanicilar/api';
import type { MasterSube } from '@/admin/baslat-menusu/master/subeler/api';

export type KullaniciDuzenlenebilirAlan = keyof Pick<
  KullaniciFormGirdi,
  'ad' | 'email' | 'gsm' | 'rol' | 'bayiId' | 'firmaId' | 'subeId' | 'iskonto' | 'aktif'
>;

export interface AktifKullaniciHucre {
  kullaniciId: number;
  alan: KullaniciDuzenlenebilirAlan;
}

interface KullaniciExcelTabloProps {
  kullanicilar: MasterKullanici[];
  roller: { kod: string; baslik: string }[];
  bayiler: MasterBayi[];
  firmalar: MasterFirma[];
  subeler: MasterSube[];
  seciliId: number | null;
  aktifHucre: AktifKullaniciHucre | null;
  hucreTaslak: string;
  hucreKaydediliyor: boolean;
  gorunurSutunlar: string[];
  onSutunlarDegistir: (sira: string[]) => void;
  onSatirSec: (id: number) => void;
  onHucreBaslat: (k: MasterKullanici, alan: KullaniciDuzenlenebilirAlan) => void;
  onHucreTaslak: (v: string) => void;
  onHucreKaydet: (deger?: string) => void;
  onHucreIptal: () => void;
  onModalDuzenle: (k: MasterKullanici) => void;
}

export function KullaniciExcelTablo({
  kullanicilar,
  roller,
  bayiler,
  firmalar,
  subeler,
  seciliId,
  aktifHucre,
  hucreTaslak,
  hucreKaydediliyor,
  gorunurSutunlar,
  onSutunlarDegistir,
  onSatirSec,
  onHucreBaslat,
  onHucreTaslak,
  onHucreKaydet,
  onHucreIptal,
  onModalDuzenle,
}: KullaniciExcelTabloProps) {
  const aktifBayiler = bayiler.filter((b) => b.aktif);
  const bayiSecenekleri = aktifBayiler.map((b) => ({ value: b.id, label: b.unvan }));
  const rolSecenekleri = roller.map((r) => ({ value: r.kod, label: r.baslik }));

  function sutunBaslik(id: string) {
    return kullaniciTabloSutunTanimiBul(id)?.etiket ?? id;
  }

  function hucre(
    k: MasterKullanici,
    alan: KullaniciDuzenlenebilirAlan,
    deger: string,
    opts?: {
      tip?: 'text' | 'email' | 'select' | 'tel' | 'number';
      secenekler?: { value: string | number; label: string }[];
      gosterim?: React.ReactNode;
      placeholder?: string;
    }
  ) {
    return (
      <MasterDuzenlenebilirHucre
        key={alan}
        duzenleniyor={aktifHucre?.kullaniciId === k.id && aktifHucre.alan === alan}
        deger={deger}
        taslak={hucreTaslak}
        onTaslakDegistir={onHucreTaslak}
        onDuzenleBaslat={() => onHucreBaslat(k, alan)}
        onKaydet={onHucreKaydet}
        onIptal={onHucreIptal}
        kaydediliyor={hucreKaydediliyor}
        tip={opts?.tip}
        secenekler={opts?.secenekler}
        placeholder={opts?.placeholder}
        gosterim={opts?.gosterim}
      />
    );
  }

  function sutunHucre(k: MasterKullanici, sutunId: string) {
    const firmaSecenekleri = firmalar
      .filter((f) => f.aktif && (!k.bayiId || f.bayiId === k.bayiId))
      .map((f) => ({ value: f.id, label: f.tabelaAdi ?? f.unvan }));

    const subeSecenekleri = subeler
      .filter((s) => s.aktif && (!k.firmaId || s.firmaId === k.firmaId))
      .map((s) => ({ value: s.id, label: s.subeAdi }));

    switch (sutunId) {
      case 'ad':
        return hucre(k, 'ad', k.ad, { gosterim: <span className="font-medium">{k.ad}</span> });
      case 'eposta':
        return hucre(k, 'email', k.eposta, { tip: 'email' });
      case 'gsm':
        return hucre(k, 'gsm', k.gsm ?? '', { tip: 'tel', placeholder: '05XX XXX XX XX' });
      case 'rol':
        return hucre(k, 'rol', k.rol, {
          tip: 'select',
          secenekler: rolSecenekleri,
          gosterim: <span className="ap-master-etiket ap-master-etiket-mor">{k.rol}</span>,
        });
      case 'kullaniciTipi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt">
            <span className="ap-master-etiket">{KULLANICI_TIP_ETIKET[k.kullaniciTipi]}</span>
          </td>
        );
      case 'bayiId':
        return hucre(k, 'bayiId', k.bayiId != null ? String(k.bayiId) : '', {
          tip: 'select',
          secenekler: [{ value: '', label: '—' }, ...bayiSecenekleri],
          gosterim: k.bayiUnvan ? <span className="ap-master-etiket">{k.bayiUnvan}</span> : undefined,
        });
      case 'firmaId':
        return hucre(k, 'firmaId', k.firmaId != null ? String(k.firmaId) : '', {
          tip: 'select',
          secenekler: [{ value: '', label: '—' }, ...firmaSecenekleri],
          gosterim: k.firmaTabela || k.firmaUnvan ? (
            <span>{k.firmaTabela ?? k.firmaUnvan}</span>
          ) : undefined,
        });
      case 'subeId':
        return hucre(k, 'subeId', k.subeId != null ? String(k.subeId) : '', {
          tip: 'select',
          secenekler: [{ value: '', label: '—' }, ...subeSecenekleri],
          gosterim: k.subeAdi ? <span>{k.subeAdi}</span> : undefined,
        });
      case 'iskonto':
        return hucre(k, 'iskonto', k.iskonto != null ? String(k.iskonto) : '', {
          tip: 'number',
          placeholder: '0-100',
          gosterim:
            k.iskonto != null ? (
              <span className="font-mono text-xs">%{k.iskonto}</span>
            ) : undefined,
        });
      case 'aktif':
        return hucre(k, 'aktif', k.aktif ? 'true' : 'false', {
          tip: 'select',
          secenekler: [
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Pasif' },
          ],
          gosterim: (
            <span className={`ap-master-durum ${k.aktif ? 'ap-master-durum-aktif' : ''}`}>
              {k.aktif ? 'Aktif' : 'Pasif'}
            </span>
          ),
        });
      case 'sonGirisTarihi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt ap-master-excel-hucre-tarih">
            {sonGirisGoster(k.sonGirisTarihi)}
          </td>
        );
      default:
        return null;
    }
  }

  return (
    <div className="ap-master-excel-wrap">
      <div className="ap-master-excel-ust">
        <p className="ap-muted text-xs">
          {gorunurSutunlar.length} sütun — restoran kullanıcılarını bayi / firma / şube ile eşleştirin
        </p>
        <MasterTabloSutunAyarlari
          baslik="Kullanıcı tablosu sütunları"
          sutunlar={KULLANICI_TABLO_SUTUNLARI}
          gorunurSira={gorunurSutunlar}
          varsayilanSira={KULLANICI_TABLO_VARSAYILAN_SIRA}
          onDegistir={onSutunlarDegistir}
        />
      </div>
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              {gorunurSutunlar.map((id) => (
                <th key={id}>{sutunBaslik(id)}</th>
              ))}
              <th className="ap-master-excel-th-aksiyon" />
            </tr>
          </thead>
          <tbody>
            {kullanicilar.map((k) => (
              <tr
                key={k.id}
                className={`${seciliId === k.id ? 'ap-master-excel-satir-secili' : ''} ${
                  !k.aktif ? 'ap-master-tablo-pasif' : ''
                }`}
                onClick={() => onSatirSec(k.id)}
              >
                {gorunurSutunlar.map((id) => sutunHucre(k, id))}
                <td className="ap-master-excel-hucre ap-master-excel-th-aksiyon" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ap-master-tablo-ikon-btn"
                    onClick={() => onModalDuzenle(k)}
                    aria-label="Kullanıcı düzenle"
                    title="Tüm alanları düzenle"
                  >
                    <DuzenleIkonu />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
