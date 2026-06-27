import type { MasterSekmeId } from '@/admin/baslat-menusu/master/tipler';
import { BayilerSekme } from '@/admin/baslat-menusu/master/bilesenler/sekmeler/BayilerSekme';
import { FirmalarSekme } from '@/admin/baslat-menusu/master/bilesenler/sekmeler/FirmalarSekme';
import { KullanicilarSekme } from '@/admin/baslat-menusu/master/bilesenler/sekmeler/KullanicilarSekme';
import { LisanslarSekme } from '@/admin/baslat-menusu/master/bilesenler/sekmeler/LisanslarSekme';
import { ModullerSekme } from '@/admin/baslat-menusu/master/bilesenler/sekmeler/ModullerSekme';
import { PaketlerSekme } from '@/admin/baslat-menusu/master/bilesenler/sekmeler/PaketlerSekme';
import { SubelerSekme } from '@/admin/baslat-menusu/master/bilesenler/sekmeler/SubelerSekme';

interface MasterSekmeIcerikProps {
  sekme: MasterSekmeId;
}

export function MasterSekmeIcerik({ sekme }: MasterSekmeIcerikProps) {
  switch (sekme) {
    case 'moduller':
      return <ModullerSekme />;
    case 'bayiler':
      return <BayilerSekme />;
    case 'firmalar':
      return <FirmalarSekme />;
    case 'subeler':
      return <SubelerSekme />;
    case 'kullanicilar':
      return <KullanicilarSekme />;
    case 'paketler':
      return <PaketlerSekme />;
    case 'lisanslar':
      return <LisanslarSekme />;
    default:
      return null;
  }
}
