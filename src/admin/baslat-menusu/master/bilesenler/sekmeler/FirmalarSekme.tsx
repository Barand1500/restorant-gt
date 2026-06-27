import { useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { ORNEK_FIRMALAR } from '@/admin/baslat-menusu/master/ornekVeri';

export function FirmalarSekme() {
  const [arama, setArama] = useState('');
  const [bayiFiltre, setBayiFiltre] = useState('');
  const q = arama.trim().toLowerCase();

  const liste = ORNEK_FIRMALAR.filter((f) => {
    if (bayiFiltre && f.bayi !== bayiFiltre) return false;
    if (!q) return true;
    return f.tabela.toLowerCase().includes(q) || f.unvan.toLowerCase().includes(q);
  });

  const bayiler = [...new Set(ORNEK_FIRMALAR.map((f) => f.bayi))];

  return (
    <div className="ap-master-sekme">
      <div className="ap-master-ust ap-master-ust-filtre">
        <input
          type="search"
          className={`${formInputSinifi} ap-seo-arama`}
          placeholder="Tabela veya unvan ara…"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
        <select
          className={formInputSinifi}
          value={bayiFiltre}
          onChange={(e) => setBayiFiltre(e.target.value)}
          aria-label="Bayi filtresi"
        >
          <option value="">Tüm bayiler</option>
          {bayiler.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil shrink-0" disabled>
          + Firma Ekle
        </button>
      </div>

      <div className="ap-seo-tablo-scroll">
        <table className="ap-seo-tablo">
          <thead>
            <tr>
              <th>Tabela</th>
              <th>Unvan</th>
              <th>Bayi</th>
              <th>Şube</th>
              <th>Lisans</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {liste.map((f) => (
              <tr key={f.id}>
                <td>
                  <span className="ap-heading font-medium">{f.tabela}</span>
                </td>
                <td className="ap-muted text-sm">{f.unvan}</td>
                <td>
                  <span className="ap-master-etiket">{f.bayi}</span>
                </td>
                <td>{f.sube}</td>
                <td>
                  <span
                    className={`ap-master-lisans-badge ${
                      f.lisans === 'Aktif' ? 'ap-master-lisans-aktif' : 'ap-master-lisans-uyari'
                    }`}
                  >
                    {f.lisans}
                  </span>
                </td>
                <td>
                  <button type="button" className="ap-master-link-btn" disabled>
                    Aç
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
