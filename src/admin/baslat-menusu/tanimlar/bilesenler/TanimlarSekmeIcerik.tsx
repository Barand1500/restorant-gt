import { TanimlarBarkodSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/barkod/TanimlarBarkodSekme';
import { TanimlarBosSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarBosSekme';
import { TanimlarKullanicilarSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarKullanicilarSekme';
import { TanimlarPaketServisiUcretleriSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/paket-servisi/TanimlarPaketServisiUcretleriSekme';
import { TanimlarRestoranDurumuSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/restoran-durumu/TanimlarRestoranDurumuSekme';
import type { TanimlarSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';

interface TanimlarSekmeIcerikProps {
  sekme: TanimlarSekmeId;
}

export function TanimlarSekmeIcerik({ sekme }: TanimlarSekmeIcerikProps) {
  switch (sekme) {
    case 'kullanicilar':
      return <TanimlarKullanicilarSekme />;
    case 'barkod':
      return <TanimlarBarkodSekme />;
    case 'paket-servisi-ucretleri':
      return <TanimlarPaketServisiUcretleriSekme />;
    case 'restoran-durumu':
      return <TanimlarRestoranDurumuSekme />;
    default:
      return <TanimlarBosSekme sekme={sekme} />;
  }
}
