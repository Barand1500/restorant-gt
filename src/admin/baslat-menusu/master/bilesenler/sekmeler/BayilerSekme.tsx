import { useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { ORNEK_BAYILER } from '@/admin/baslat-menusu/master/ornekVeri';

export function BayilerSekme() {
  const [arama, setArama] = useState('');
  const q = arama.trim().toLowerCase();
  const liste = ORNEK_BAYILER.filter((b) => !q || b.unvan.toLowerCase().includes(q) || b.il.toLowerCase().includes(q));

  return (
    <div className="ap-master-sekme">
      <div className="ap-seo-tablo-ozet ap-master-ozet-4">
        <div className="ap-seo-ozet-kart">
          <span className="ap-seo-ozet-deger">{liste.length}</span>
          <span className="ap-seo-ozet-etiket">Toplam bayi</span>
        </div>
        <div className="ap-seo-ozet-kart ap-seo-ozet-yesil">
          <span className="ap-seo-ozet-deger">{liste.filter((b) => b.aktif).length}</span>
          <span className="ap-seo-ozet-etiket">Aktif</span>
        </div>
        <div className="ap-seo-ozet-kart">
          <span className="ap-seo-ozet-deger">{liste.reduce((s, b) => s + b.firma, 0)}</span>
          <span className="ap-seo-ozet-etiket">Bağlı firma</span>
        </div>
        <div className="ap-seo-ozet-kart">
          <span className="ap-seo-ozet-deger">{liste.filter((b) => b.ust).length}</span>
          <span className="ap-seo-ozet-etiket">Alt bayi</span>
        </div>
      </div>

      <div className="ap-master-ust">
        <input
          type="search"
          className={`${formInputSinifi} ap-seo-arama`}
          placeholder="Unvan veya il ara…"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" disabled>
          + Bayi Ekle
        </button>
      </div>

      <div className="ap-master-liste">
        {liste.map((b) => (
          <div key={b.id} className="ap-master-liste-satir">
            <div className="ap-master-liste-sol">
              <span className="ap-master-liste-ikon">🤝</span>
              <div>
                <p className="ap-heading font-medium">{b.unvan}</p>
                <p className="ap-muted text-xs">
                  {b.il}
                  {b.ust && ` · Alt bayi: ${b.ust}`}
                </p>
              </div>
            </div>
            <div className="ap-master-liste-meta">
              <span className="ap-master-etiket">{b.firma} firma</span>
              <span className={`ap-master-durum ${b.aktif ? 'ap-master-durum-aktif' : ''}`}>{b.aktif ? 'Aktif' : 'Pasif'}</span>
            </div>
            <button type="button" className="ap-master-link-btn" disabled>
              Detay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
