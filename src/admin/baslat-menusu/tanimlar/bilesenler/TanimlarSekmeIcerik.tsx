import { TanimlarBosSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarBosSekme';
import { TanimlarKullanicilarSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarKullanicilarSekme';
import type { TanimlarSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';

interface TanimlarSekmeIcerikProps {
  sekme: TanimlarSekmeId;
}

export function TanimlarSekmeIcerik({ sekme }: TanimlarSekmeIcerikProps) {
  switch (sekme) {
    case 'kullanicilar':
      return <TanimlarKullanicilarSekme />;
    default:
      return <TanimlarBosSekme sekme={sekme} />;
  }
}
