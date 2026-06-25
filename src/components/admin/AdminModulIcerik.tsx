import { LoglarSayfasi } from '@/pages/admin/LoglarSayfasi';
import { VeriYedeklemeSayfasi } from '@/pages/admin/VeriYedeklemeSayfasi';
import { SistemAyarlariSayfasi } from '@/pages/admin/SistemAyarlariSayfasi';
import { KullanicilarSayfasi } from '@/pages/admin/KullanicilarSayfasi';
import { RollerSayfasi } from '@/pages/admin/RollerSayfasi';
import { SekmeYonetimiSayfasi } from '@/pages/admin/SekmeYonetimiSayfasi';
import { KisayolAyarlariSayfasi } from '@/pages/admin/KisayolAyarlariSayfasi';
import { ModulKabuk } from '@/contexts/ModulKabukContext';

interface AdminModulIcerikProps {
  modulId: string;
  onModulAc: (modulId: string) => void;
}

export function AdminModulIcerik({ modulId, onModulAc }: AdminModulIcerikProps) {
  return (
    <ModulKabuk modulId={modulId}>
      <AdminModulGovde modulId={modulId} onModulAc={onModulAc} />
    </ModulKabuk>
  );
}

function AdminModulGovde({ modulId }: AdminModulIcerikProps) {
  switch (modulId) {
    case 'loglar':
      return <LoglarSayfasi />;
    case 'veri-yedekleme':
      return <VeriYedeklemeSayfasi />;
    case 'ayarlar':
      return <SistemAyarlariSayfasi />;
    case 'kullanicilar':
      return <KullanicilarSayfasi />;
    case 'roller':
      return <RollerSayfasi />;
    case 'sekme-yonetimi':
      return <SekmeYonetimiSayfasi />;
    case 'kisayol-ayarlari':
      return <KisayolAyarlariSayfasi />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl">🚧</p>
          <h1 className="ap-heading mt-4 text-xl font-bold">{modulId}</h1>
          <p className="ap-muted mt-2 text-sm">Bu modül bu projede tanımlı değil.</p>
        </div>
      );
  }
}
