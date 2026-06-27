import { useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { ORNEK_SUBELER } from '@/admin/baslat-menusu/master/ornekVeri';

const TIP_ETIKET: Record<string, string> = {
  restoran: '🍽️ Restoran',
  kafe: '☕ Kafe',
  fast_food: '🍔 Fast Food',
  diger: '📍 Diğer',
};

export function SubelerSekme() {
  const [arama, setArama] = useState('');
  const q = arama.trim().toLowerCase();
  const liste = ORNEK_SUBELER.filter(
    (s) => !q || s.ad.toLowerCase().includes(q) || s.firma.toLowerCase().includes(q) || s.il.toLowerCase().includes(q)
  );

  const firmaGruplari = [...new Set(liste.map((s) => s.firma))];

  return (
    <div className="ap-master-sekme">
      <div className="ap-master-ust">
        <input
          type="search"
          className={`${formInputSinifi} ap-seo-arama`}
          placeholder="Şube, firma veya il ara…"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" disabled>
          + Şube Ekle
        </button>
      </div>

      {firmaGruplari.map((firma) => (
        <div key={firma} className="ap-master-grup">
          <h3 className="ap-heading mb-2 flex items-center gap-2 text-sm font-semibold">
            <span>🏢</span> {firma}
          </h3>
          <div className="ap-master-sube-grid">
            {liste
              .filter((s) => s.firma === firma)
              .map((s) => (
                <article key={s.id} className="ap-master-sube-kart">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="ap-heading text-sm font-medium">{s.ad}</p>
                      <p className="ap-muted mt-0.5 text-xs">{s.il}</p>
                    </div>
                    <span className={`ap-master-durum ${s.aktif ? 'ap-master-durum-aktif' : ''}`}>
                      {s.aktif ? 'Açık' : 'Kapalı'}
                    </span>
                  </div>
                  <p className="ap-muted mt-2 text-xs">{TIP_ETIKET[s.tip] ?? s.tip}</p>
                  <button type="button" className="ap-master-link-btn mt-3" disabled>
                    Şube detayı →
                  </button>
                </article>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
