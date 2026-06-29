import { useState, useEffect } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { MasterSekmeCubugu } from '@/admin/baslat-menusu/master/bilesenler/MasterSekmeCubugu';
import { MasterSekmeIcerik } from '@/admin/baslat-menusu/master/bilesenler/MasterSekmeIcerik';
import { masterSekmeBul, type MasterSekmeId } from '@/admin/baslat-menusu/master/tipler';
import { masterRehberModulId } from '@/admin/veri/adminMasterRehberleri';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';

export function MasterSayfasi() {
  const [sekme, setSekme] = useState<MasterSekmeId>('bayiler');
  const { setRehberModulId } = useAdminAksiyon();
  const tanim = masterSekmeBul(sekme);

  useEffect(() => {
    setRehberModulId(masterRehberModulId(sekme));
    return () => setRehberModulId(null);
  }, [sekme, setRehberModulId]);

  return (
    <AdminModulKabuk
      baslik="Master"
      aciklama="Organizasyon yönetimi — bayi, firma, şube, paket ve lisans"
      onizleGoster={false}
    >
      <div className="ap-sistem-yonetimi">
        <div className="ap-sistem-layout">
          <aside className="ap-sistem-sol">
            <MasterSekmeCubugu aktif={sekme} onDegistir={setSekme} />
          </aside>

          <div className="ap-sistem-icerik">
            <AdminPanelKarti baslik={tanim.baslik} altBaslik={tanim.altBaslik}>
              <MasterSekmeIcerik sekme={sekme} />
            </AdminPanelKarti>
          </div>
        </div>
      </div>
    </AdminModulKabuk>
  );
}
