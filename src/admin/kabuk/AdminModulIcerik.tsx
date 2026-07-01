import { LoglarSayfasi } from '@/admin/gizli-moduller/loglar/sayfa';
import { VeriYedeklemeSayfasi } from '@/admin/gizli-moduller/veri-yedekleme/sayfa';
import { MasterSayfasi } from '@/admin/baslat-menusu/master/sayfa';
import { SistemAyarlariSayfasi } from '@/admin/baslat-menusu/sistem/ayarlar/sayfa';
import { KullanicilarSayfasi } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/sayfa';
import { RollerSayfasi } from '@/admin/baslat-menusu/musteri-ajans/roller/sayfa';
import { SekmeYonetimiSayfasi } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/sayfa';
import { KisayolAyarlariSayfasi } from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/sayfa';
import { TanimlarBosSayfa } from '@/admin/baslat-menusu/tanimlar/TanimlarBosSayfa';
import { TanimlarSayfasi } from '@/admin/baslat-menusu/tanimlar/sayfa';
import { UrunlerTanimlariSayfasi } from '@/admin/baslat-menusu/urunler-tanimlari/sayfa';
import { TarilacakUrunlerSayfasi } from '@/admin/baslat-menusu/tarilacak-urunler/sayfa';
import { YaziciTanimlariSayfasi } from '@/admin/baslat-menusu/yazici-tanimlari/sayfa';
import { FavorilerSayfasi } from '@/admin/baslat-menusu/favoriler/sayfa';
import { OdemeGruplariSayfasi } from '@/admin/baslat-menusu/odeme-gruplari/sayfa';
import { UrunEslestirSayfasi } from '@/admin/baslat-menusu/urun-eslestir/sayfa';
import { tanimlarModulBul } from '@/admin/baslat-menusu/tanimlar/tanimlarModulleri';
import { ModulKabuk } from '@/baglamlar/ModulKabukContext';

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
  if (modulId === 'urunler-tanimlari') {
    return <UrunlerTanimlariSayfasi />;
  }
  if (modulId === 'yazici-tanimlari') {
    return <YaziciTanimlariSayfasi />;
  }
  if (modulId === 'tarilacak-urunler') {
    return <TarilacakUrunlerSayfasi />;
  }
  if (modulId === 'favoriler') {
    return <FavorilerSayfasi />;
  }
  if (modulId === 'odeme-gruplari') {
    return <OdemeGruplariSayfasi />;
  }
  if (modulId === 'urun-eslestir') {
    return <UrunEslestirSayfasi />;
  }

  const tanimModul = tanimlarModulBul(modulId);
  if (tanimModul) {
    if (modulId === 'tanimlar') {
      return <TanimlarSayfasi />;
    }
    return <TanimlarBosSayfa baslik={tanimModul.baslik} aciklama={tanimModul.aciklama} />;
  }

  switch (modulId) {
    case 'loglar':
      return <LoglarSayfasi />;
    case 'veri-yedekleme':
      return <VeriYedeklemeSayfasi />;
    case 'master':
      return <MasterSayfasi />;
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
