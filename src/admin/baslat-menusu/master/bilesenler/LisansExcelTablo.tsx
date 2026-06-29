import { DuzenleIkonu } from '@/admin/baslat-menusu/master/bilesenler/DuzenleIkonu';
import { MasterTabloSutunAyarlari } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSutunAyarlari';
import { MasterDuzenlenebilirHucre } from '@/admin/baslat-menusu/master/bilesenler/MasterDuzenlenebilirHucre';
import {
  LISANS_TABLO_SUTUNLARI,
  LISANS_TABLO_VARSAYILAN_SIRA,
  lisansTabloSutunTanimiBul,
} from '@/admin/baslat-menusu/master/lisanslar/lisansTabloSutunlari';
import {
  lisansDurumEtiketi,
  tarihGoster,
  type LisansFormGirdi,
  type MasterLisans,
} from '@/admin/baslat-menusu/master/lisanslar/api';
import type { MasterPaket } from '@/admin/baslat-menusu/master/paketler/api';

export type LisansDuzenlenebilirAlan = keyof Pick<
  LisansFormGirdi,
  'paketId' | 'baslangicTarihi' | 'bitisTarihi' | 'aktif'
>;

export interface AktifLisansHucre {
  lisansId: number;
  alan: LisansDuzenlenebilirAlan;
}

function isoTarih(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

interface LisansExcelTabloProps {
  lisanslar: MasterLisans[];
  paketler: MasterPaket[];
  seciliId: number | null;
  aktifHucre: AktifLisansHucre | null;
  hucreTaslak: string;
  hucreKaydediliyor: boolean;
  gorunurSutunlar: string[];
  onSutunlarDegistir: (sira: string[]) => void;
  onSatirSec: (id: number) => void;
  onHucreBaslat: (l: MasterLisans, alan: LisansDuzenlenebilirAlan) => void;
  onHucreTaslak: (v: string) => void;
  onHucreKaydet: (deger?: string) => void;
  onHucreIptal: () => void;
  onModalDuzenle: (l: MasterLisans) => void;
}

export function LisansExcelTablo({
  lisanslar,
  paketler,
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
}: LisansExcelTabloProps) {
  const aktifPaketler = paketler.filter((p) => p.aktif);
  const paketSecenekleri = aktifPaketler.map((p) => ({
    value: p.id,
    label: `${p.paketAdi} — ₺${p.fiyat}`,
  }));

  function sutunBaslik(id: string) {
    return lisansTabloSutunTanimiBul(id)?.etiket ?? id;
  }

  function hucre(
    l: MasterLisans,
    alan: LisansDuzenlenebilirAlan,
    deger: string,
    opts?: {
      tip?: 'text' | 'email' | 'select' | 'tel' | 'number' | 'date';
      secenekler?: { value: string | number; label: string }[];
      gosterim?: React.ReactNode;
      placeholder?: string;
    }
  ) {
    return (
      <MasterDuzenlenebilirHucre
        key={alan}
        duzenleniyor={aktifHucre?.lisansId === l.id && aktifHucre.alan === alan}
        deger={deger}
        taslak={hucreTaslak}
        onTaslakDegistir={onHucreTaslak}
        onDuzenleBaslat={() => onHucreBaslat(l, alan)}
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

  function sutunHucre(l: MasterLisans, sutunId: string) {
    switch (sutunId) {
      case 'firma':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt">
            <span className="ap-heading font-medium">{l.firmaTabela ?? l.firmaUnvan}</span>
            {l.firmaTabela && l.firmaUnvan && l.firmaTabela !== l.firmaUnvan && (
              <span className="ap-muted block text-xs">{l.firmaUnvan}</span>
            )}
          </td>
        );
      case 'paketId':
        return hucre(l, 'paketId', String(l.paketId), {
          tip: 'select',
          secenekler: paketSecenekleri,
          gosterim: <span className="ap-master-etiket ap-master-etiket-mor">{l.paketAdi}</span>,
        });
      case 'baslangicTarihi':
        return hucre(l, 'baslangicTarihi', isoTarih(l.baslangicTarihi), {
          tip: 'date',
          gosterim: <span className="ap-master-excel-hucre-tarih">{tarihGoster(l.baslangicTarihi)}</span>,
        });
      case 'bitisTarihi':
        return hucre(l, 'bitisTarihi', isoTarih(l.bitisTarihi), {
          tip: 'date',
          placeholder: 'Süresiz',
          gosterim: (
            <span className="ap-master-excel-hucre-tarih">
              {l.bitisTarihi ? tarihGoster(l.bitisTarihi) : <span className="ap-muted">Süresiz</span>}
            </span>
          ),
        });
      case 'durum':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt">
            <span
              className={`ap-master-lisans-badge ${
                l.durum === 'aktif'
                  ? 'ap-master-lisans-aktif'
                  : l.durum === 'yakinda'
                    ? 'ap-master-lisans-uyari'
                    : ''
              }`}
            >
              {lisansDurumEtiketi(l.durum)}
            </span>
          </td>
        );
      case 'aktif':
        return hucre(l, 'aktif', l.aktif ? 'true' : 'false', {
          tip: 'select',
          secenekler: [
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Pasif' },
          ],
          gosterim: (
            <span className={`ap-master-durum ${l.aktif ? 'ap-master-durum-aktif' : ''}`}>
              {l.aktif ? 'Aktif' : 'Pasif'}
            </span>
          ),
        });
      case 'kayitTarihi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt ap-master-excel-hucre-tarih">
            {tarihGoster(l.kayitTarihi)}
          </td>
        );
      case 'guncellemeTarihi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt ap-master-excel-hucre-tarih">
            {tarihGoster(l.guncellemeTarihi)}
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
          {gorunurSutunlar.length} sütun — firmalara paket lisansı atayın ve süreleri takip edin
        </p>
        <MasterTabloSutunAyarlari
          baslik="Lisans tablosu sütunları"
          sutunlar={LISANS_TABLO_SUTUNLARI}
          gorunurSira={gorunurSutunlar}
          varsayilanSira={LISANS_TABLO_VARSAYILAN_SIRA}
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
            {lisanslar.map((l) => (
              <tr
                key={l.id}
                className={`${seciliId === l.id ? 'ap-master-excel-satir-secili' : ''} ${
                  !l.aktif || l.durum === 'pasif' ? 'ap-master-tablo-pasif' : ''
                } ${l.durum === 'yakinda' ? 'ap-master-excel-satir-uyari' : ''}`}
                onClick={() => onSatirSec(l.id)}
              >
                {gorunurSutunlar.map((id) => sutunHucre(l, id))}
                <td className="ap-master-excel-hucre ap-master-excel-th-aksiyon" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ap-master-tablo-ikon-btn"
                    onClick={() => onModalDuzenle(l)}
                    aria-label="Lisans düzenle"
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
