import { useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { ORNEK_MODULLER } from '@/admin/baslat-menusu/master/ornekVeri';

export function ModullerSekme() {
  const [arama, setArama] = useState('');
  const q = arama.trim().toLowerCase();
  const liste = ORNEK_MODULLER.filter(
    (m) => !q || m.ad.toLowerCase().includes(q) || m.prefix.includes(q)
  );

  return (
    <div className="ap-master-sekme">
      <div className="ap-master-ust">
        <input
          type="search"
          className={`${formInputSinifi} ap-seo-arama`}
          placeholder="Modül veya prefix ara…"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" disabled title="Yakında">
          + Modül Ekle
        </button>
      </div>

      <div className="ap-master-kart-grid">
        {liste.map((m) => (
          <article key={m.id} className="ap-master-kart">
            <div className="ap-master-kart-ust">
              <span className="ap-master-kart-ikon">🧩</span>
              <span className={`ap-master-durum ${m.aktif ? 'ap-master-durum-aktif' : ''}`}>
                {m.aktif ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <h3 className="ap-heading text-sm font-semibold">{m.ad}</h3>
            <p className="ap-muted mt-1 font-mono text-xs">prefix: {m.prefix}</p>
            <div className="ap-master-kart-alt">
              <span className="ap-muted text-xs">{m.rolSayisi} rol tanımı</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
