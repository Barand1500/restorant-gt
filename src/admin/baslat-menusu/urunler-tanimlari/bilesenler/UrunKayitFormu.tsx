import { formInputSinifi, formSelectSinifi, FormAlani } from '@/formlar/FormAlani';

import { AdminAnahtarDugme } from '@/admin/ortak/AdminFormBilesenleri';

import { FiyatTanimlariButonu } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/FiyatTanimlariModal';

import {

  FATURA_GRUPLARI,

  FAVORI_SECENEKLERI,

  URUN_GRUPLARI,

  URUN_TIPLERI,

  type UrunTanimi,

} from '@/admin/baslat-menusu/urunler-tanimlari/tipler';



interface UrunKayitFormuProps {

  urun: UrunTanimi;

  onDegistir: (urun: UrunTanimi) => void;

}



function sayiAlan(

  urun: UrunTanimi,

  alan: 'sira' | 'kdvDahilFiyat' | 'kdvOrani',

  onDegistir: (urun: UrunTanimi) => void

) {

  return (

    <input

      type="number"

      className={formInputSinifi}

      value={urun[alan]}

      min={alan === 'kdvOrani' ? 0 : undefined}

      step={alan === 'kdvOrani' ? 0.01 : 1}

      onChange={(e) => {

        const deger = e.target.value === '' ? 0 : Number(e.target.value);

        onDegistir({ ...urun, [alan]: Number.isFinite(deger) ? deger : 0 });

      }}

    />

  );

}



export function UrunKayitFormu({ urun, onDegistir }: UrunKayitFormuProps) {

  const alanGuncelle = <K extends keyof UrunTanimi>(alan: K, deger: UrunTanimi[K]) => {

    onDegistir({ ...urun, [alan]: deger });

  };



  return (

    <div className="ap-urun-tanim-form">

      <section className="ap-form-bolum">

        <div className="ap-form-bolum-baslik">

          <h3 className="ap-heading text-xs font-semibold">Temel Bilgiler</h3>

        </div>

        <div className="ap-form-bolum-icerik ap-urun-tanim-form-grid">

          <FormAlani etiket="Ürün / Stok Kodu">

            <input

              className={formInputSinifi}

              value={urun.stokKodu}

              onChange={(e) => alanGuncelle('stokKodu', e.target.value)}

              placeholder="00000"

            />

          </FormAlani>

          <FormAlani etiket="Ürün Adı">

            <input

              className={formInputSinifi}

              value={urun.ad}

              onChange={(e) => alanGuncelle('ad', e.target.value)}

              placeholder="Ürün adı"

            />

          </FormAlani>

          <FormAlani etiket="Sıra">

            {sayiAlan(urun, 'sira', onDegistir)}

          </FormAlani>

        </div>

      </section>



      <section className="ap-form-bolum">

        <div className="ap-form-bolum-baslik">

          <h3 className="ap-heading text-xs font-semibold">Fiyat &amp; Vergi</h3>

        </div>

        <div className="ap-form-bolum-icerik ap-urun-tanim-form-grid">

          <FormAlani etiket="KDV Dahil Fiyat">

            <div className="ap-urun-fiyat-satir">

              {sayiAlan(urun, 'kdvDahilFiyat', onDegistir)}

              <FiyatTanimlariButonu

                liste={urun.fiyatListeleri}

                modalBaslik={`${urun.ad || 'Ürün'} — Fiyat Tanımları`}

                modalAltBaslik="PAKET, SALON gibi listelere özel fiyat girin"

                onKaydet={(fiyatListeleri) => alanGuncelle('fiyatListeleri', fiyatListeleri)}

              />

            </div>

          </FormAlani>

          <FormAlani etiket="KDV Oranı (%)">

            {sayiAlan(urun, 'kdvOrani', onDegistir)}

          </FormAlani>

          <FormAlani etiket="İstisna Kodu">

            <input

              className={formInputSinifi}

              value={urun.istisnaKodu}

              onChange={(e) => alanGuncelle('istisnaKodu', e.target.value)}

              placeholder="—"

            />

          </FormAlani>

        </div>

      </section>



      <section className="ap-form-bolum">

        <div className="ap-form-bolum-baslik">

          <h3 className="ap-heading text-xs font-semibold">Sınıflandırma</h3>

        </div>

        <div className="ap-form-bolum-icerik ap-urun-tanim-form-grid">

          <FormAlani etiket="Ürün Grubu">

            <select

              className={formSelectSinifi}

              value={urun.urunGrubu}

              onChange={(e) => alanGuncelle('urunGrubu', e.target.value)}

            >

              {URUN_GRUPLARI.map((g) => (

                <option key={g} value={g}>

                  {g}

                </option>

              ))}

            </select>

          </FormAlani>

          <FormAlani etiket="Ürün Tipi">

            <select

              className={formSelectSinifi}

              value={urun.urunTipi}

              onChange={(e) => alanGuncelle('urunTipi', e.target.value as UrunTanimi['urunTipi'])}

            >

              {URUN_TIPLERI.map((t) => (

                <option key={t} value={t}>

                  {t}

                </option>

              ))}

            </select>

          </FormAlani>

          <FormAlani etiket="Fatura Grubu">

            <select

              className={formSelectSinifi}

              value={urun.faturaGrubu}

              onChange={(e) => alanGuncelle('faturaGrubu', e.target.value)}

            >

              {FATURA_GRUPLARI.map((f) => (

                <option key={f} value={f}>

                  {f}

                </option>

              ))}

            </select>

          </FormAlani>

          <FormAlani etiket="Favoriler">

            <select

              className={formSelectSinifi}

              value={urun.favori}

              onChange={(e) => alanGuncelle('favori', e.target.value)}

            >

              {FAVORI_SECENEKLERI.map((f) => (

                <option key={f} value={f}>

                  {f}

                </option>

              ))}

            </select>

          </FormAlani>

        </div>

      </section>



      <section className="ap-form-bolum">

        <div className="ap-form-bolum-baslik">

          <h3 className="ap-heading text-xs font-semibold">Diğer</h3>

        </div>

        <div className="ap-form-bolum-icerik ap-urun-tanim-form-grid">

          <FormAlani etiket="Ürün Resmi">

            <div className="ap-urun-tanim-resim-alan">

              <div className="ap-urun-tanim-resim-onizleme">

                {urun.resimUrl ? (

                  <img src={urun.resimUrl} alt="" className="ap-urun-tanim-resim-img" />

                ) : (

                  <span className="ap-muted text-xs">Resim yok</span>

                )}

              </div>

              <div className="ap-urun-tanim-resim-tuslar">

                <label className="ap-tanimlar-urun-mini-tus">

                  Ekle

                  <input

                    type="file"

                    accept="image/*"

                    className="sr-only"

                    onChange={(e) => {

                      const dosya = e.target.files?.[0];

                      if (!dosya) return;

                      const url = URL.createObjectURL(dosya);

                      alanGuncelle('resimUrl', url);

                      e.target.value = '';

                    }}

                  />

                </label>

                {urun.resimUrl && (

                  <button

                    type="button"

                    className="ap-tanimlar-urun-mini-tus"

                    onClick={() => alanGuncelle('resimUrl', null)}

                  >

                    Kaldır

                  </button>

                )}

              </div>

            </div>

          </FormAlani>

          <FormAlani etiket="İkram">

            <AdminAnahtarDugme
              etiket={urun.ikram ? 'Evet' : 'Hayır'}
              acik={urun.ikram}
              onDegistir={(ikram: boolean) => alanGuncelle('ikram', ikram)}
            />

          </FormAlani>

          <FormAlani etiket="PLU">

            <input

              className={formInputSinifi}

              value={urun.plu}

              onChange={(e) => alanGuncelle('plu', e.target.value)}

              placeholder="PLU kodu"

            />

          </FormAlani>

          <FormAlani etiket="Özel Matrah Kodu">

            <input

              className={formInputSinifi}

              value={urun.ozelMatrahKodu}

              onChange={(e) => alanGuncelle('ozelMatrahKodu', e.target.value)}

              placeholder="—"

            />

          </FormAlani>

        </div>

      </section>

    </div>

  );

}


