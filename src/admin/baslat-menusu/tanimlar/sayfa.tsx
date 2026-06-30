import { useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { TanimlarBilgiPaneli } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarBilgiPaneli';
import { TanimlarSekmeIcerik } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarSekmeIcerik';
import { TanimlarSekmeCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarSekmeCubugu';
import { tanimlarSekmeBul, type TanimlarSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';

export function TanimlarSayfasi() {
  const [sekme, setSekme] = useState<TanimlarSekmeId>('genel');
  const aktifSekme = tanimlarSekmeBul(sekme);

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
              <TanimlarSekmeIcerik sekme={sekme} />
            </AdminPanelKarti>
          </div>
        </div>
      </div>
    </AdminModulKabuk>
  );
}
