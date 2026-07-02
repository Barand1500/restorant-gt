import { formInputSinifi } from '@/formlar/FormAlani';
import type { WebApiKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/web-api-ayarlari/tipler';

interface WebApiAyarlariFormProps {
  kayit: WebApiKayit;
  onKayitDegistir: (kayit: WebApiKayit) => void;
}

function metinAlani(
  etiket: string,
  deger: string,
  onChange: (v: string) => void,
  tip: 'text' | 'password' | 'url' = 'text'
) {
  return (
    <label className="ap-web-api-alan">
      <span className="ap-web-api-etiket">{etiket}</span>
      <input
        type={tip === 'password' ? 'password' : 'text'}
        className={formInputSinifi}
        value={deger}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={tip === 'password' ? 'off' : 'on'}
      />
    </label>
  );
}

function secenek(
  etiket: string,
  aciklama: string,
  acik: boolean,
  onDegistir: (v: boolean) => void
) {
  return (
    <label className="ap-web-api-secenek">
      <input
        type="checkbox"
        className="ap-tartilacak-checkbox"
        checked={acik}
        onChange={(e) => onDegistir(e.target.checked)}
      />
      <span className="ap-web-api-secenek-metin">
        <strong>{etiket}</strong>
        <span className="ap-web-api-secenek-aciklama">{aciklama}</span>
      </span>
    </label>
  );
}

export function WebApiAyarlariForm({
  kayit,
  onKayitDegistir,
}: WebApiAyarlariFormProps) {
  const guncelle = (parcalar: Partial<WebApiKayit>) => onKayitDegistir({ ...kayit, ...parcalar });

  return (
    <div className="ap-web-api-form">
      <header className="ap-web-api-baslik">
        <span className="ap-web-api-baslik-ikon" aria-hidden>
          🌐
        </span>
        <div>
          <h2 className="ap-web-api-baslik-metin">Web Api Ayarları</h2>
          <p className="ap-web-api-baslik-alt">Veritabanı, API adresleri ve entegrasyon seçeneklerini yapılandırın</p>
        </div>
      </header>

      <section className="ap-web-api-bolum">
        <h3 className="ap-web-api-bolum-baslik">Veritabanı Bağlantısı</h3>
        <div className="ap-web-api-ikili">
          {metinAlani('Sunucu IP', kayit.sunucuIp, (v) => guncelle({ sunucuIp: v }))}
          {metinAlani('Veritabanı Adı', kayit.veritabaniAdi, (v) => guncelle({ veritabaniAdi: v }))}
          {metinAlani('Kullanıcı Adı', kayit.kullaniciAdi, (v) => guncelle({ kullaniciAdi: v }))}
          {metinAlani('Kullanıcı Parola', kayit.kullaniciParola, (v) => guncelle({ kullaniciParola: v }), 'password')}
        </div>
      </section>

      <section className="ap-web-api-bolum">
        <h3 className="ap-web-api-bolum-baslik">API Adresleri</h3>
        <div className="ap-web-api-alanlar">
          {metinAlani('Token URL', kayit.tokenUrl, (v) => guncelle({ tokenUrl: v }), 'url')}
          {metinAlani('Servis URL', kayit.servisUrl, (v) => guncelle({ servisUrl: v }), 'url')}
          {metinAlani('vePosDB Adı', kayit.vePosDbAdi, (v) => guncelle({ vePosDbAdi: v }))}
        </div>
      </section>

      <section className="ap-web-api-bolum">
        <h3 className="ap-web-api-bolum-baslik">Seçenekler</h3>
        <div className="ap-web-api-secenekler">
          {secenek(
            'Daily Bill Number With Date Prefix',
            'Fatura numarasına tarih öneki ekler.',
            kayit.dailyBillNumberWithDatePrefix,
            (v) => guncelle({ dailyBillNumberWithDatePrefix: v })
          )}
          {secenek(
            'Telsam Calls',
            'Telsam çağrı entegrasyonunu etkinleştirir.',
            kayit.telsamCalls,
            (v) => guncelle({ telsamCalls: v })
          )}
          {secenek(
            'Transfer Use Matching',
            'Seçili ise Yemeksepeti vb. eşleştirme kullanır; seçili değilse direkt aktarılır.',
            kayit.transferUseMatching,
            (v) => guncelle({ transferUseMatching: v })
          )}
          {secenek(
            'Transfer Options',
            'Seçili ise seçenekleri integrationoption tablosuna göre aktarır; seçili değilse aktarım yapmaz, açıklama kısmına yazar.',
            kayit.transferOptions,
            (v) => guncelle({ transferOptions: v })
          )}
        </div>
      </section>
    </div>
  );
}
