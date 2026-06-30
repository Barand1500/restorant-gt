import { useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { TanimlarBilgiPaneli } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarBilgiPaneli';
import { TanimlarBosSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarBosSekme';
import { TanimlarSekmeCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarSekmeCubugu';
import { tanimlarSekmeBul, type TanimlarSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

export function TanimlarSayfasi() {
  const [sekme, setSekme] = useState<TanimlarSekmeId>('genel');
  const aktifSekme = tanimlarSekmeBul(sekme);

  useModulAksiyonlari(
    {},
    {
      kaydet: false,
      ekle: false,
      sil: false,
      onizle: false,
      yayinla: false,
    }
  );

  return (
    <AdminModulKabuk
      baslik="Tanımlar"
      aciklama="Restoran kullanıcıları, masa grupları, barkod ve operasyon ayarları"
      onizleGoster={false}
    >
      <div className="ap-sistem-yonetimi">
        <div className="ap-sistem-layout">
          <aside className="ap-sistem-sol">
            <TanimlarSekmeCubugu aktif={sekme} onDegistir={setSekme} />
            <div className="mt-4">
              <TanimlarBilgiPaneli />
            </div>
          </aside>

          <div className="ap-sistem-icerik">
            <AdminPanelKarti baslik={aktifSekme.ad} altBaslik={aktifSekme.altBaslik}>
              <TanimlarBosSekme sekme={sekme} />
            </AdminPanelKarti>
          </div>
        </div>
      </div>
    </AdminModulKabuk>
  );
}
