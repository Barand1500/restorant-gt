import { formInputSinifi } from '@/formlar/FormAlani';
import type { ArctosDbKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/arctos-db-ayarlari/tipler';

interface ArctosDbBaglantiFormProps {
  kayit: ArctosDbKayit;
  onKayitDegistir: (kayit: ArctosDbKayit) => void;
  onSina: () => void;
  onKaydet: () => void;
  sinaniyor?: boolean;
  kaydediliyor?: boolean;
}

export function ArctosDbBaglantiForm({
  kayit,
  onKayitDegistir,
  onSina,
  onKaydet,
  sinaniyor,
  kaydediliyor,
}: ArctosDbBaglantiFormProps) {
  const alan = (alan: keyof ArctosDbKayit, etiket: string, tip: 'text' | 'password' = 'text') => (
    <label className="ap-arctos-db-alan">
      <span className="ap-arctos-db-etiket">{etiket}</span>
      <input
        type={tip}
        className={formInputSinifi}
        value={kayit[alan]}
        onChange={(e) => onKayitDegistir({ ...kayit, [alan]: e.target.value })}
        autoComplete={tip === 'password' ? 'off' : 'on'}
      />
    </label>
  );

  return (
    <div className="ap-arctos-db-form">
      <header className="ap-arctos-db-baslik">
        <span className="ap-arctos-db-baslik-ikon" aria-hidden>
          🗄️
        </span>
        <div>
          <h2 className="ap-arctos-db-baslik-metin">Arctos Veritabanı Bağlantı Ayarları</h2>
          <p className="ap-arctos-db-baslik-alt">Sunucu ve kimlik bilgilerini girerek Arctos veritabanına bağlanın</p>
        </div>
      </header>

      <div className="ap-arctos-db-alanlar">
        {alan('sunucu', 'Sunucu')}
        {alan('kullaniciAdi', 'Kullanıcı Adı')}
        {alan('kullaniciParola', 'Kullanıcı Parola', 'password')}
        {alan('veritabani', 'Veritabanı')}
      </div>

      <footer className="ap-arctos-db-alt">
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
          onClick={onSina}
          disabled={sinaniyor || kaydediliyor}
        >
          {sinaniyor ? 'Sınanıyor…' : 'Sına'}
        </button>
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
          onClick={onKaydet}
          disabled={kaydediliyor || sinaniyor}
        >
          {kaydediliyor ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </footer>
    </div>
  );
}
