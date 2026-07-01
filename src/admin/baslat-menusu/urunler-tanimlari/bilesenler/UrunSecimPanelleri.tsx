import { useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { AdminAnahtarDugme, AdminSekmeler } from '@/admin/ortak/AdminFormBilesenleri';
import { FiyatTanimlariButonu } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/FiyatTanimlariModal';
import { bosFiyatListesi } from '@/admin/baslat-menusu/urunler-tanimlari/fiyatListesiTipler';
import type { FiyatListesiKaydi } from '@/admin/baslat-menusu/urunler-tanimlari/fiyatListesiTipler';
import {
  SECENEK_KATEGORILERI,
  type UrunSecenekKategori,
  type UrunSecenekSatiri,
  type UrunSecimSatiri,
  type UrunTanimi,
} from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

function yeniId() {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function yeniKategoriId() {
  return `kat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface UrunSecimPanelProps {
  baslik: string;
  aciklama: string;
  satirlar: UrunSecimSatiri[];
  onDegistir: (satirlar: UrunSecimSatiri[]) => void;
}

export function UrunSecimPanel({ baslik, aciklama, satirlar, onDegistir }: UrunSecimPanelProps) {
  const satirGuncelle = (id: string, parca: Partial<UrunSecimSatiri>) => {
    onDegistir(satirlar.map((s) => (s.id === id ? { ...s, ...parca } : s)));
  };

  const satirEkle = () => {
    const sira = satirlar.reduce((max, s) => Math.max(max, s.sira), 0) + 1;
    onDegistir([
      ...satirlar,
      { id: yeniId(), sira, secim: '', fiyat: 0, fiyatListeleri: bosFiyatListesi() },
    ]);
  };

  const satirSil = (id: string) => {
    onDegistir(satirlar.filter((s) => s.id !== id));
  };

  return (
    <section className="ap-urun-secim-panel">
      <header className="ap-urun-secim-panel-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">{baslik}</h3>
          <p className="ap-muted text-xs">{aciklama}</p>
        </div>
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" onClick={satirEkle}>
          + Seçim Ekle
        </button>
      </header>

      {satirlar.length === 0 ? (
        <p className="ap-urun-secim-bos">Henüz seçim tanımlanmadı.</p>
      ) : (
        <ul className="ap-urun-secim-liste">
          {satirlar.map((s) => (
            <li key={s.id} className="ap-urun-secim-satir">
              <label className="ap-urun-secim-alan ap-urun-secim-alan-sira">
                <span className="ap-urun-secim-etiket">Sıra</span>
                <input
                  type="number"
                  className={formInputSinifi}
                  value={s.sira}
                  min={1}
                  onChange={(e) => satirGuncelle(s.id, { sira: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="ap-urun-secim-alan ap-urun-secim-alan-ad">
                <span className="ap-urun-secim-etiket">Seçim</span>
                <input
                  className={formInputSinifi}
                  value={s.secim}
                  onChange={(e) => satirGuncelle(s.id, { secim: e.target.value })}
                  placeholder="Seçim adı"
                />
              </label>
              <label className="ap-urun-secim-alan ap-urun-secim-alan-fiyat">
                <span className="ap-urun-secim-etiket">Fiyat (+/-)</span>
                <div className="ap-urun-fiyat-satir">
                  <input
                    type="number"
                    className={formInputSinifi}
                    value={s.fiyat}
                    step={0.01}
                    onChange={(e) => satirGuncelle(s.id, { fiyat: Number(e.target.value) || 0 })}
                  />
                  <FiyatTanimlariButonu
                    liste={s.fiyatListeleri}
                    modalBaslik={`${s.secim || 'Seçim'} — Fiyat Tanımları`}
                    modalAltBaslik="Bu seçim için liste bazlı özel fiyatlar"
                    onKaydet={(fiyatListeleri) => satirGuncelle(s.id, { fiyatListeleri })}
                  />
                </div>
              </label>
              <button
                type="button"
                className="ap-urun-secim-sil"
                onClick={() => satirSil(s.id)}
                title="Seçimi sil"
                aria-label="Seçimi sil"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type SecenekSekme = 'secenekler' | 'kategoriler';

interface UrunSecenekPanelProps {
  urun: UrunTanimi;
  onDegistir: (urun: UrunTanimi) => void;
}

export function UrunSecenekPanel({ urun, onDegistir }: UrunSecenekPanelProps) {
  const [sekme, setSekme] = useState<SecenekSekme>('secenekler');
  const [yeniKategori, setYeniKategori] = useState('');

  const kategoriler = urun.secenekKategorileri;

  const kategoriEkle = (ad: string) => {
    const temiz = ad.trim();
    if (!temiz || kategoriler.some((k) => k.kategori === temiz)) return;
    const sira = kategoriler.reduce((max, k) => Math.max(max, k.sira), 0) + 1;
    const yeni: UrunSecenekKategori = {
      id: yeniKategoriId(),
      sira,
      kategori: temiz,
      enAzSecim: 0,
      enFazlaSecim: 1,
    };
    onDegistir({ ...urun, secenekKategorileri: [...kategoriler, yeni] });
    setYeniKategori('');
  };

  const kategoriGuncelle = (id: string, parca: Partial<UrunSecenekKategori>) => {
    const eski = kategoriler.find((k) => k.id === id);
    if (!eski) return;
    const yeniAd = parca.kategori?.trim() ?? eski.kategori;
    const guncelKategoriler = kategoriler.map((k) => (k.id === id ? { ...k, ...parca, kategori: yeniAd } : k));
    const guncelSecenekler =
      parca.kategori && parca.kategori !== eski.kategori
        ? urun.secenekler.map((s) =>
            s.kategori === eski.kategori ? { ...s, kategori: yeniAd } : s
          )
        : urun.secenekler;
    onDegistir({ ...urun, secenekKategorileri: guncelKategoriler, secenekler: guncelSecenekler });
  };

  const kategoriSil = (id: string) => {
    const kat = kategoriler.find((k) => k.id === id);
    if (!kat) return;
    if (!confirm(`"${kat.kategori}" kategorisini ve içindeki tüm seçenekleri silmek istiyor musunuz?`)) return;
    onDegistir({
      ...urun,
      secenekKategorileri: kategoriler.filter((k) => k.id !== id),
      secenekler: urun.secenekler.filter((s) => s.kategori !== kat.kategori),
    });
  };

  const secenekGuncelle = (id: string, parca: Partial<UrunSecenekSatiri>) => {
    onDegistir({
      ...urun,
      secenekler: urun.secenekler.map((s) => (s.id === id ? { ...s, ...parca } : s)),
    });
  };

  const secenekEkle = (kategoriAd: string) => {
    const sira = urun.secenekler.reduce((max, s) => Math.max(max, s.sira), 0) + 1;
    const yeni: UrunSecenekSatiri = {
      id: yeniId(),
      sira,
      secenekAdi: '',
      kategori: kategoriAd,
      fiyat: 0,
      miktarli: false,
      fiyatListeleri: bosFiyatListesi(),
    };
    onDegistir({ ...urun, secenekler: [...urun.secenekler, yeni] });
  };

  const secenekSil = (id: string) => {
    onDegistir({ ...urun, secenekler: urun.secenekler.filter((s) => s.id !== id) });
  };

  return (
    <section className="ap-urun-secim-panel ap-urun-secenek-panel">
      <header className="ap-urun-secim-panel-baslik ap-urun-secenek-panel-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">Seçenekler</h3>
          <p className="ap-muted text-xs">Seçenek satırları ve kategori kuralları</p>
        </div>
        <AdminSekmeler
          sekmeler={[
            { id: 'secenekler', etiket: 'Seçenekler' },
            { id: 'kategoriler', etiket: 'Seçenek Kategorileri' },
          ]}
          aktif={sekme}
          onDegistir={setSekme}
        />
      </header>

      {sekme === 'kategoriler' ? (
        <div className="ap-urun-kategori-tablo-bolum">
          <div className="ap-urun-kategori-ekle ap-urun-kategori-ekle-tablo">
            <select
              className={formSelectSinifi}
              value=""
              onChange={(e) => {
                if (e.target.value) kategoriEkle(e.target.value);
              }}
            >
              <option value="">Hazır kategori seç…</option>
              {SECENEK_KATEGORILERI.filter(
                (k) => !kategoriler.some((kat) => kat.kategori === k)
              ).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <input
              className={formInputSinifi}
              value={yeniKategori}
              onChange={(e) => setYeniKategori(e.target.value)}
              placeholder="Yeni kategori adı"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  kategoriEkle(yeniKategori);
                }
              }}
            />
            <button
              type="button"
              className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
              onClick={() => kategoriEkle(yeniKategori)}
            >
              + Kategori Ekle
            </button>
          </div>

          {kategoriler.length === 0 ? (
            <p className="ap-urun-secim-bos">Henüz seçenek kategorisi yok.</p>
          ) : (
            <div className="ap-master-excel-wrap ap-urun-kategori-tablo-wrap">
              <div className="ap-master-excel-scroll">
                <table className="ap-master-excel-tablo ap-urun-kategori-tablo">
                  <thead>
                    <tr>
                      <th>Sıra</th>
                      <th>Kategori</th>
                      <th>En az seçim</th>
                      <th>En fazla seçim</th>
                      <th aria-label="İşlem" />
                    </tr>
                  </thead>
                  <tbody>
                    {kategoriler.map((kat) => (
                      <tr key={kat.id}>
                        <td className="ap-master-excel-hucre ap-urun-kategori-hucre-sira">
                          <input
                            type="number"
                            className={formInputSinifi}
                            value={kat.sira}
                            min={1}
                            onChange={(e) =>
                              kategoriGuncelle(kat.id, { sira: Number(e.target.value) || 1 })
                            }
                          />
                        </td>
                        <td className="ap-master-excel-hucre">
                          <input
                            className={formInputSinifi}
                            value={kat.kategori}
                            onChange={(e) => kategoriGuncelle(kat.id, { kategori: e.target.value })}
                          />
                        </td>
                        <td className="ap-master-excel-hucre ap-urun-kategori-hucre-sayi">
                          <input
                            type="number"
                            className={formInputSinifi}
                            value={kat.enAzSecim}
                            min={0}
                            onChange={(e) =>
                              kategoriGuncelle(kat.id, { enAzSecim: Number(e.target.value) || 0 })
                            }
                          />
                        </td>
                        <td className="ap-master-excel-hucre ap-urun-kategori-hucre-sayi">
                          <input
                            type="number"
                            className={formInputSinifi}
                            value={kat.enFazlaSecim}
                            min={0}
                            onChange={(e) =>
                              kategoriGuncelle(kat.id, {
                                enFazlaSecim: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td className="ap-master-excel-hucre ap-urun-kategori-hucre-islem">
                          <button
                            type="button"
                            className="ap-urun-secim-sil"
                            onClick={() => kategoriSil(kat.id)}
                            title="Kategoriyi sil"
                            aria-label="Kategoriyi sil"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : kategoriler.length === 0 ? (
        <p className="ap-urun-secim-bos">
          Önce <button type="button" className="ap-tanimlar-urun-mini-tus" onClick={() => setSekme('kategoriler')}>Seçenek Kategorileri</button> sekmesinden kategori ekleyin.
        </p>
      ) : (
        <div className="ap-urun-secenek-gruplar">
          {kategoriler.map((kat) => {
            const satirlar = urun.secenekler.filter((s) => s.kategori === kat.kategori);
            return (
              <div key={kat.id} className="ap-urun-secenek-grup">
                <div className="ap-urun-secenek-grup-baslik">
                  <div className="min-w-0">
                    <h4 className="ap-heading text-xs font-semibold">{kat.kategori}</h4>
                    <p className="ap-muted text-[10px]">
                      Min {kat.enAzSecim} · Max {kat.enFazlaSecim} · {satirlar.length} seçenek
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil ap-urun-secenek-ekle-tus"
                    onClick={() => secenekEkle(kat.kategori)}
                  >
                    + Seçenek
                  </button>
                </div>

                {satirlar.length === 0 ? (
                  <p className="ap-muted px-3 py-4 text-xs">Bu kategoride seçenek yok.</p>
                ) : (
                  <ul className="ap-urun-secim-liste">
                    {satirlar.map((s) => (
                      <li key={s.id} className="ap-urun-secim-satir ap-urun-secenek-satir">
                        <label className="ap-urun-secim-alan ap-urun-secim-alan-sira">
                          <span className="ap-urun-secim-etiket">Sıra</span>
                          <input
                            type="number"
                            className={formInputSinifi}
                            value={s.sira}
                            min={1}
                            onChange={(e) =>
                              secenekGuncelle(s.id, { sira: Number(e.target.value) || 1 })
                            }
                          />
                        </label>
                        <label className="ap-urun-secim-alan ap-urun-secim-alan-ad">
                          <span className="ap-urun-secim-etiket">Seçenek Adı</span>
                          <input
                            className={formInputSinifi}
                            value={s.secenekAdi}
                            onChange={(e) => secenekGuncelle(s.id, { secenekAdi: e.target.value })}
                            placeholder="Seçenek adı"
                          />
                        </label>
                        <label className="ap-urun-secim-alan ap-urun-secim-alan-kategori">
                          <span className="ap-urun-secim-etiket">Kategori</span>
                          <select
                            className={formSelectSinifi}
                            value={s.kategori}
                            onChange={(e) => secenekGuncelle(s.id, { kategori: e.target.value })}
                          >
                            {kategoriler.map((k) => (
                              <option key={k.id} value={k.kategori}>
                                {k.kategori}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="ap-urun-secim-alan ap-urun-secim-alan-fiyat">
                          <span className="ap-urun-secim-etiket">Fiyat (+/-)</span>
                          <div className="ap-urun-fiyat-satir">
                            <input
                              type="number"
                              className={formInputSinifi}
                              value={s.fiyat}
                              step={0.01}
                              onChange={(e) =>
                                secenekGuncelle(s.id, { fiyat: Number(e.target.value) || 0 })
                              }
                            />
                            <FiyatTanimlariButonu
                              liste={s.fiyatListeleri}
                              modalBaslik={`${s.secenekAdi || 'Seçenek'} — Fiyat Tanımları`}
                              onKaydet={(fiyatListeleri: FiyatListesiKaydi[]) =>
                                secenekGuncelle(s.id, { fiyatListeleri })
                              }
                            />
                          </div>
                        </label>
                        <div className="ap-urun-secim-alan ap-urun-secim-alan-miktar">
                          <span className="ap-urun-secim-etiket">Miktarlı</span>
                          <AdminAnahtarDugme
                            etiket={s.miktarli ? 'Evet' : 'Hayır'}
                            acik={s.miktarli}
                            onDegistir={(miktarli: boolean) => secenekGuncelle(s.id, { miktarli })}
                          />
                        </div>
                        <button
                          type="button"
                          className="ap-urun-secim-sil"
                          onClick={() => secenekSil(s.id)}
                          title="Seçeneği sil"
                          aria-label="Seçeneği sil"
                        >
                          🗑
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
