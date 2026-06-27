import { ORNEK_PAKETLER } from '@/admin/baslat-menusu/master/ornekVeri';

export function PaketlerSekme() {
  return (
    <div className="ap-master-sekme">
      <p className="ap-master-ipucu">
        Paket limitleri lisans atamasında firmaya uygulanır. Fiyat ve kota değişiklikleri buradan yönetilecek.
      </p>

      <div className="ap-master-paket-grid">
        {ORNEK_PAKETLER.map((p, i) => (
          <article
            key={p.id}
            className={`ap-master-paket-kart ${i === 1 ? 'ap-master-paket-one-cikan' : ''}`}
          >
            {i === 1 && <span className="ap-master-paket-rozet">Popüler</span>}
            <h3 className="ap-heading text-lg font-bold">{p.ad}</h3>
            <p className="ap-master-paket-fiyat">
              <span className="text-2xl font-bold">₺{p.fiyat}</span>
              <span className="ap-muted text-xs"> / ay</span>
            </p>
            <ul className="ap-master-paket-ozellikler">
              <li>{p.sube} şube</li>
              <li>{p.personel} personel</li>
              <li>{p.masa} masa</li>
            </ul>
            <div className="ap-master-paket-alt">
              <span className={`ap-master-durum ${p.aktif ? 'ap-master-durum-aktif' : ''}`}>
                {p.aktif ? 'Satışta' : 'Pasif'}
              </span>
              <button type="button" className="ap-master-link-btn" disabled>
                Düzenle
              </button>
            </div>
          </article>
        ))}
      </div>

      <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil mt-4" disabled>
        + Yeni Paket
      </button>
    </div>
  );
}
