import { ORNEK_KULLANICILAR } from '@/admin/baslat-menusu/master/ornekVeri';

const TIP_ETIKET: Record<string, string> = {
  merkez: 'Merkez',
  bayi: 'Bayi',
  firma: 'Firma',
  sube: 'Şube',
};

export function KullanicilarSekme() {
  return (
    <div className="ap-master-sekme">
      <p className="ap-master-ipucu">
        Kullanıcı ekleme ve şifre işlemleri <strong>Kullanıcılar</strong> modülünden yapılır. Burada organizasyon bağlamında özet listelenir.
      </p>

      <div className="ap-seo-tablo-ozet ap-master-ozet-3">
        <div className="ap-seo-ozet-kart">
          <span className="ap-seo-ozet-deger">{ORNEK_KULLANICILAR.length}</span>
          <span className="ap-seo-ozet-etiket">Kayıtlı kullanıcı</span>
        </div>
        <div className="ap-seo-ozet-kart ap-seo-ozet-yesil">
          <span className="ap-seo-ozet-deger">{ORNEK_KULLANICILAR.filter((k) => k.aktif).length}</span>
          <span className="ap-seo-ozet-etiket">Aktif</span>
        </div>
        <div className="ap-seo-ozet-kart">
          <span className="ap-seo-ozet-deger">4</span>
          <span className="ap-seo-ozet-etiket">Kullanıcı tipi</span>
        </div>
      </div>

      <div className="ap-master-liste">
        {ORNEK_KULLANICILAR.map((k) => (
          <div key={k.id} className="ap-master-liste-satir">
            <div className="ap-master-liste-sol">
              <span className="ap-master-avatar">{k.ad.charAt(0)}</span>
              <div>
                <p className="ap-heading font-medium">{k.ad}</p>
                <p className="ap-muted text-xs">{k.eposta}</p>
              </div>
            </div>
            <div className="ap-master-liste-meta">
              <span className="ap-master-etiket">{TIP_ETIKET[k.tip] ?? k.tip}</span>
              <span className="ap-master-etiket ap-master-etiket-mor">{k.rol}</span>
              <span className={`ap-master-durum ${k.aktif ? 'ap-master-durum-aktif' : ''}`}>
                {k.aktif ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
