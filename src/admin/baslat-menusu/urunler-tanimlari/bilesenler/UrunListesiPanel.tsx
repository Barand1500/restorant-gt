import { useMemo, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { UrunTanimi } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

interface UrunListesiPanelProps {
  urunler: UrunTanimi[];
  seciliId: string | null;
  onSec: (id: string) => void;
}

function fiyatGoster(fiyat: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(fiyat);
}

export function UrunListesiPanel({ urunler, seciliId, onSec }: UrunListesiPanelProps) {
  const [arama, setArama] = useState('');

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return urunler;
    return urunler.filter(
      (u) =>
        u.ad.toLocaleLowerCase('tr').includes(q) ||
        u.stokKodu.toLocaleLowerCase('tr').includes(q) ||
        u.urunGrubu.toLocaleLowerCase('tr').includes(q)
    );
  }, [arama, urunler]);

  return (
    <aside className="ap-urun-tanim-liste-panel">
      <div className="ap-urun-tanim-liste-ust">
        <h3 className="ap-heading text-xs font-semibold">Ürün Listesi</h3>
        <p className="ap-muted text-[10px]">{filtreli.length} kayıt</p>
      </div>

      <input
        type="search"
        className={`${formInputSinifi} ap-urun-tanim-liste-arama`}
        placeholder="Kod veya ad ara…"
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        aria-label="Ürün ara"
      />

      <ul className="ap-urun-tanim-liste" role="listbox">
        {filtreli.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              role="option"
              aria-selected={seciliId === u.id}
              className={`ap-urun-tanim-liste-oge ${seciliId === u.id ? 'ap-urun-tanim-liste-oge-secili' : ''}`}
              onClick={() => onSec(u.id)}
            >
              <span className="ap-urun-tanim-liste-kod">{u.stokKodu || '—'}</span>
              <span className="ap-urun-tanim-liste-ad">{u.ad || 'Yeni ürün'}</span>
              <span className="ap-urun-tanim-liste-meta">
                <span>{u.urunGrubu}</span>
                <span>{fiyatGoster(u.kdvDahilFiyat)}</span>
              </span>
            </button>
          </li>
        ))}
        {filtreli.length === 0 && (
          <li className="ap-muted px-2 py-6 text-center text-xs">Eşleşen ürün bulunamadı.</li>
        )}
      </ul>
    </aside>
  );
}
