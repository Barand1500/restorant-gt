import { useState } from 'react';
import { ORNEK_LISANSLAR } from '@/admin/baslat-menusu/master/ornekVeri';

type Filtre = 'tumu' | 'aktif' | 'yakinda';

export function LisanslarSekme() {
  const [filtre, setFiltre] = useState<Filtre>('tumu');

  const liste = ORNEK_LISANSLAR.filter((l) => {
    if (filtre === 'tumu') return true;
    return l.durum === filtre;
  });

  return (
    <div className="ap-master-sekme">
      <div className="ap-master-sekme-filtre">
        {(
          [
            ['tumu', 'Tümü'],
            ['aktif', 'Aktif'],
            ['yakinda', 'Süresi yakın'],
          ] as const
        ).map(([id, etiket]) => (
          <button
            key={id}
            type="button"
            className={`ap-master-filtre-btn ${filtre === id ? 'ap-master-filtre-btn-aktif' : ''}`}
            onClick={() => setFiltre(id)}
          >
            {etiket}
          </button>
        ))}
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil ml-auto" disabled>
          + Lisans Ata
        </button>
      </div>

      <div className="ap-master-lisans-zaman">
        {liste.map((l) => (
          <article key={l.id} className="ap-master-lisans-satir">
            <div className="ap-master-lisans-cizgi">
              <span className={`ap-master-lisans-nokta ap-master-lisans-${l.durum}`} />
            </div>
            <div className="ap-master-lisans-icerik">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="ap-heading font-semibold">{l.firma}</p>
                  <p className="ap-muted text-sm">{l.paket} paketi</p>
                </div>
                <span className={`ap-master-lisans-badge ap-master-lisans-${l.durum === 'aktif' ? 'aktif' : 'uyari'}`}>
                  {l.durum === 'aktif' ? 'Aktif' : 'Yakında bitiyor'}
                </span>
              </div>
              <p className="ap-muted mt-2 text-xs">
                {l.baslangic} — {l.bitis}
              </p>
              <button type="button" className="ap-master-link-btn mt-2" disabled>
                Yenile / uzat →
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
