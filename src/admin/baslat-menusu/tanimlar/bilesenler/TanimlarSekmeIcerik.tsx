import { TanimlarBarkodSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/barkod/TanimlarBarkodSekme';
import { TanimlarBosSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarBosSekme';
import { TanimlarDigerSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/diger/TanimlarDigerSekme';
import { TanimlarKullanicilarSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarKullanicilarSekme';
import { TanimlarMasaGruplariSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/masa-gruplari/TanimlarMasaGruplariSekme';
import { TanimlarPaketServisiUcretleriSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/paket-servisi/TanimlarPaketServisiUcretleriSekme';
import { TanimlarRestoranDurumuSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/restoran-durumu/TanimlarRestoranDurumuSekme';
import { TanimlarSmsAyarlariSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/sms-ayarlari/TanimlarSmsAyarlariSekme';
import type { TanimlarSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';

interface TanimlarSekmeIcerikProps {
  sekme: TanimlarSekmeId;
  onKirliDegisti?: (kirli: boolean) => void;
}

export function TanimlarSekmeIcerik({ sekme, onKirliDegisti }: TanimlarSekmeIcerikProps) {
  switch (sekme) {
    case 'kullanicilar':
      return <TanimlarKullanicilarSekme />;
    case 'masa-gruplari':
      return <TanimlarMasaGruplariSekme />;
    case 'barkod':
      return <TanimlarBarkodSekme />;
    case 'diger':
      return <TanimlarDigerSekme onKirliDegisti={onKirliDegisti} />;
    case 'paket-servisi-ucretleri':
      return <TanimlarPaketServisiUcretleriSekme />;
    case 'sms-ayarlari':
      return <TanimlarSmsAyarlariSekme onKirliDegisti={onKirliDegisti} />;
    case 'restoran-durumu':
      return <TanimlarRestoranDurumuSekme />;
    default:
      return <TanimlarBosSekme sekme={sekme} />;
  }
}
