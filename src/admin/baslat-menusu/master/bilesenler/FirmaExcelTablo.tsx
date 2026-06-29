import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import { DuzenleIkonu } from '@/admin/baslat-menusu/master/bilesenler/DuzenleIkonu';
import { MasterTabloSutunAyarlari } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSutunAyarlari';
import { MasterDuzenlenebilirHucre } from '@/admin/baslat-menusu/master/bilesenler/MasterDuzenlenebilirHucre';
import {
  FIRMA_TABLO_SUTUNLARI,
  FIRMA_TABLO_VARSAYILAN_SIRA,
  firmaTabloSutunTanimiBul,
} from '@/admin/baslat-menusu/master/firmalar/firmaTabloSutunlari';
import {
  lisansDurumEtiketi,
  type FirmaFormGirdi,
  type MasterFirma,
} from '@/admin/baslat-menusu/master/firmalar/api';

export type FirmaDuzenlenebilirAlan = keyof Pick<
  FirmaFormGirdi,
  | 'tabelaAdi'
  | 'unvan'
  | 'bayiId'
  | 'il'
  | 'ilce'
  | 'eposta'
  | 'telefon'
  | 'gsm'
  | 'vergiDairesi'
  | 'vergiNo'
  | 'iskonto'
  | 'aktif'
>;

export interface AktifHucre {
  firmaId: number;
  alan: FirmaDuzenlenebilirAlan;
}

interface FirmaExcelTabloProps {
  firmalar: MasterFirma[];
  bayiler: MasterBayi[];
  seciliId: number | null;
  aktifHucre: AktifHucre | null;
  hucreTaslak: string;
  hucreKaydediliyor: boolean;
  gorunurSutunlar: string[];
  onSutunlarDegistir: (sira: string[]) => void;
  onSatirSec: (id: number) => void;
  onHucreBaslat: (firma: MasterFirma, alan: FirmaDuzenlenebilirAlan) => void;
  onHucreTaslak: (v: string) => void;
  onHucreKaydet: (deger?: string) => void;
  onHucreIptal: () => void;
  onModalDuzenle: (firma: MasterFirma) => void;
}

export function FirmaExcelTablo({
  firmalar,
  bayiler,
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
}: FirmaExcelTabloProps) {
  const aktifBayiler = bayiler.filter((b) => b.aktif);
  const bayiSecenekleri = aktifBayiler.map((b) => ({ value: b.id, label: b.unvan }));

  function sutunBaslik(id: string) {
    return firmaTabloSutunTanimiBul(id)?.etiket ?? id;
  }

  function hucre(
    f: MasterFirma,
    alan: FirmaDuzenlenebilirAlan,
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
        duzenleniyor={aktifHucre?.firmaId === f.id && aktifHucre.alan === alan}
        deger={deger}
        taslak={hucreTaslak}
        onTaslakDegistir={onHucreTaslak}
        onDuzenleBaslat={() => onHucreBaslat(f, alan)}
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

  function sutunHucre(f: MasterFirma, sutunId: string) {
    switch (sutunId) {
      case 'tabelaAdi':
        return hucre(f, 'tabelaAdi', f.tabelaAdi ?? '', {
          gosterim: f.tabelaAdi ? <span className="ap-heading font-medium">{f.tabelaAdi}</span> : undefined,
        });
      case 'unvan':
        return hucre(f, 'unvan', f.unvan, {
          gosterim: <span className="font-medium">{f.unvan}</span>,
        });
      case 'bayiId':
        return hucre(f, 'bayiId', String(f.bayiId), {
          tip: 'select',
          secenekler: bayiSecenekleri,
          gosterim: <span className="ap-master-etiket">{f.bayiUnvan}</span>,
        });
      case 'il':
        return hucre(f, 'il', f.il ?? '');
      case 'ilce':
        return hucre(f, 'ilce', f.ilce ?? '');
      case 'eposta':
        return hucre(f, 'eposta', f.eposta ?? '', { tip: 'email' });
      case 'telefon':
        return hucre(f, 'telefon', f.telefon ?? '', { tip: 'tel' });
      case 'gsm':
        return hucre(f, 'gsm', f.gsm ?? '', { tip: 'tel', placeholder: '05XX XXX XX XX' });
      case 'vergiDairesi':
        return hucre(f, 'vergiDairesi', f.vergiDairesi ?? '');
      case 'vergiNo':
        return hucre(f, 'vergiNo', f.vergiNo ?? '', { placeholder: 'VKN / TCKN' });
      case 'iskonto':
        return hucre(f, 'iskonto', f.iskonto != null ? String(f.iskonto) : '', {
          tip: 'number',
          gosterim:
            f.iskonto != null ? (
              <span className="font-mono text-xs">%{f.iskonto}</span>
            ) : undefined,
          placeholder: '0-100',
        });
      case 'subeSayisi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt ap-master-excel-hucre-sayi">
            {f.subeSayisi}
          </td>
        );
      case 'lisansDurum':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt">
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
        );
      case 'aktif':
        return hucre(f, 'aktif', f.aktif ? 'true' : 'false', {
          tip: 'select',
          secenekler: [
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Pasif' },
          ],
          gosterim: (
            <span className={`ap-master-durum ${f.aktif ? 'ap-master-durum-aktif' : ''}`}>
              {f.aktif ? 'Aktif' : 'Pasif'}
            </span>
          ),
        });
      default:
        return null;
    }
  }

  return (
    <div className="ap-master-excel-wrap">
      <div className="ap-master-excel-ust">
        <p className="ap-muted text-xs">
          {gorunurSutunlar.length} sütun görünüyor — çift tıklayarak hücre düzenleyin
        </p>
        <MasterTabloSutunAyarlari
          baslik="Firma tablosu sütunları"
          sutunlar={FIRMA_TABLO_SUTUNLARI}
          gorunurSira={gorunurSutunlar}
          varsayilanSira={FIRMA_TABLO_VARSAYILAN_SIRA}
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
            {firmalar.map((f) => (
              <tr
                key={f.id}
                className={`${seciliId === f.id ? 'ap-master-excel-satir-secili' : ''} ${
                  !f.aktif ? 'ap-master-tablo-pasif' : ''
                }`}
                onClick={() => onSatirSec(f.id)}
              >
                {gorunurSutunlar.map((id) => sutunHucre(f, id))}
                <td className="ap-master-excel-hucre ap-master-excel-th-aksiyon" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ap-master-tablo-ikon-btn"
                    onClick={() => onModalDuzenle(f)}
                    aria-label="Firma düzenle"
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
