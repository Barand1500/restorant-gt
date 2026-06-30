/** Panel modulleri — sube DB'de moduller tablosu yok; sanal liste olarak kullanilir */
export const PANEL_MODULLERI = [
  { modulAdi: 'Master', prefix: 'master' },
  { modulAdi: 'Kullanicilar', prefix: 'kullanicilar' },
  { modulAdi: 'Roller', prefix: 'roller' },
  { modulAdi: 'Tanimlar', prefix: 'tanimlar' },
  { modulAdi: 'Urunler Tanimlari', prefix: 'urunler_tanimlari' },
  { modulAdi: 'Menu Tanimlari', prefix: 'menu_tanimlari' },
  { modulAdi: 'Cari Tanimlari', prefix: 'cari_tanimlari' },
  { modulAdi: 'Yazici Tanimlari', prefix: 'yazici_tanimlari' },
  { modulAdi: 'Happy Hour Fiyat Listeleri', prefix: 'happy_hour_fiyat_listeleri' },
  { modulAdi: 'Tarilacak Urunler', prefix: 'tarilacak_urunler' },
  { modulAdi: 'Favoriler', prefix: 'favoriler' },
  { modulAdi: 'Odeme Gruplari', prefix: 'odeme_gruplari' },
  { modulAdi: 'Urun Eslestir', prefix: 'urun_eslestir' },
  { modulAdi: 'E Fatura Ayarlari', prefix: 'e_fatura_ayarlari' },
  { modulAdi: 'Marslanacak Urunler', prefix: 'marslanacak_urunler' },
  { modulAdi: 'Ayarlar', prefix: 'ayarlar' },
  { modulAdi: 'Sekme Yonetimi', prefix: 'sekme_yonetimi' },
  { modulAdi: 'Kisayol Ayarlari', prefix: 'kisayol_ayarlari' },
  { modulAdi: 'Loglar', prefix: 'loglar' },
  { modulAdi: 'Veri Yedekleme', prefix: 'veri_yedekleme' },
] as const;

export function sanalModulListesi() {
  return PANEL_MODULLERI.map((m, i) => ({
    id: i + 1,
    modulAdi: m.modulAdi,
    prefix: m.prefix,
    durum: true,
  }));
}
