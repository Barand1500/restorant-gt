import { useMemo } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import type { AksiyonButonu } from '@/admin/ortak/tipler/admin';
import type { AksiyonId } from '@/baglamlar/AdminAksiyonContext';
import { useYetkiler } from '@/kancalar/useYetkiler';
import type { YetkiKodu } from '@/admin/baslat-menusu/musteri-ajans/roller/api';
import { TANIMLAR_MODUL_TANIMLARI } from '@/admin/baslat-menusu/tanimlar/tanimlarModulleri';
import { RAPORLAR_MODUL_TANIMLARI } from '@/admin/baslat-menusu/raporlar/raporlarModulleri';
import { RAPOR_SABLON_MODUL_IDLERI } from '@/admin/baslat-menusu/raporlar/raporSablonModulleri';
import {
  PAKET_SERVISI_RAPORLARI_MODUL_TANIMLARI,
} from '@/admin/baslat-menusu/paket-servisi-raporlari/paketServisiRaporlariModulleri';
import { PAKET_SERVISI_SABLON_MODUL_IDLERI } from '@/admin/baslat-menusu/paket-servisi-raporlari/paketServisiSablonModulleri';
import {
  REZERVASYON_RAPORLARI_MODUL_TANIMLARI,
} from '@/admin/baslat-menusu/rezervasyon-raporlari/rezervasyonRaporlariModulleri';
import { REZERVASYON_SABLON_MODUL_IDLERI } from '@/admin/baslat-menusu/rezervasyon-raporlari/rezervasyonSablonModulleri';
import { UYGULAMA_AYARLAR_MODUL_TANIMLARI } from '@/admin/baslat-menusu/uygulama-ayarlari/uygulamaAyarlarModulleri';

const A = (id: AksiyonButonu['id'], etiket: string, aktif: boolean, birincil?: boolean): AksiyonButonu => ({
  id,
  etiket,
  aktif,
  ...(birincil ? { birincil: true } : {}),
});

const modulAksiyonlari: Record<string, AksiyonButonu[]> = {
  master: [
    A('kaydet', 'Kaydet', false),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  ayarlar: [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  kullanicilar: [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', true),
    A('sil', 'Sil', true),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  roller: [
    A('kaydet', 'Kaydet', true),
    A('ekle', 'Yeni Ekle', true),
    A('sil', 'Sil', true),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'sekme-yonetimi': [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'kisayol-ayarlari': [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  loglar: [
    A('kaydet', 'Kaydet', false),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', true),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'veri-yedekleme': [
    A('kaydet', 'Kaydet', false),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  tanimlar: [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'urunler-tanimlari': [
    A('oncekiKayit', 'Önceki', false),
    A('sonrakiKayit', 'Sonraki', false),
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni', true),
    A('sil', 'Sil', false),
    A('onizle', 'Liste', false),
  ],
  'yazici-tanimlari': [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'tarilacak-urunler': [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  favoriler: [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'odeme-gruplari': [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', true),
    A('sil', 'Sil', true),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'urun-eslestir': [
    A('kaydet', 'Kaydet', true, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Eşleştir', false),
    A('yayinla', 'Yayınla', false),
  ],
  ...Object.fromEntries(
    TANIMLAR_MODUL_TANIMLARI.filter(
      (t) =>
        t.id !== 'tanimlar' &&
        t.id !== 'urunler-tanimlari' &&
        t.id !== 'yazici-tanimlari' &&
        t.id !== 'tarilacak-urunler' &&
        t.id !== 'favoriler' &&
        t.id !== 'odeme-gruplari' &&
        t.id !== 'urun-eslestir' &&
        t.id !== 'menu-tanimlari' &&
        t.id !== 'cari-tanimlari' &&
        t.id !== 'happy-hour-fiyat-listeleri' &&
        t.id !== 'e-fatura-ayarlari' &&
        t.id !== 'marslanacak-urunler'
    ).map((t) => [
      t.id,
      [
        A('kaydet', 'Kaydet', false),
        A('ekle', 'Yeni Ekle', false),
        A('sil', 'Sil', false),
        A('onizle', 'Önizle', false),
        A('yayinla', 'Yayınla', false),
      ],
    ])
  ),
  'menu-tanimlari': [
    A('ekle', 'Yeni', true),
    A('guncelle', 'Düzelt', false),
    A('kaydet', 'Kaydet', false, true),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'cari-tanimlari': [
    A('ekle', 'Yeni', true),
    A('guncelle', 'Düzenle', false),
    A('kaydet', 'Kaydet', false, true),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'happy-hour-fiyat-listeleri': [
    A('ekle', 'Yeni Ekle', true),
    A('guncelle', 'Fiyat Güncelle', false),
    A('kaydet', 'Kaydet', false, true),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'e-fatura-ayarlari': [
    A('kaydet', 'Kaydet', false, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'marslanacak-urunler': [
    A('kaydet', 'Kaydet', false, true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('onizle', 'Önizle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'aktif-masalar': [
    A('guncelle', 'Güncelle', true, true),
    A('onizle', 'Yazdır', true),
    A('kaydet', 'Kaydet', false),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('yayinla', 'Yayınla', false),
  ],
  'fiyat-listesi': [
    A('kaydet', 'Tamam', true, true),
    A('onizle', 'Önizleme', true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('guncelle', 'Düzenle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'acik-hesap-listesi': [
    A('kaydet', 'Tamam', true, true),
    A('onizle', 'Önizleme', true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('guncelle', 'Düzenle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'satis-raporu': [
    A('kaydet', 'Excel', true, true),
    A('onizle', 'Yazdır', true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('guncelle', 'Düzenle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'satis-toplamlari': [
    A('kaydet', 'Excel', true, true),
    A('onizle', 'Yazdır', true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('guncelle', 'Düzenle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'ozel-raporlar': [
    A('kaydet', 'Tamam', true, true),
    A('onizle', 'Önizleme', true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('guncelle', 'Düzenle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'ps-satis-raporu': [
    A('kaydet', 'Excel', true, true),
    A('onizle', 'Yazdır', true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('guncelle', 'Düzenle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'ps-satis-toplamlari': [
    A('kaydet', 'Excel', true, true),
    A('onizle', 'Yazdır', true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('guncelle', 'Düzenle', false),
    A('yayinla', 'Yayınla', false),
  ],
  'ps-eski-tahsilat-tarama': [
    A('kaydet', 'Kaydet', false),
    A('onizle', 'Yazdır', true),
    A('ekle', 'Yeni Ekle', false),
    A('sil', 'Sil', false),
    A('guncelle', 'Düzenle', false),
    A('yayinla', 'Yayınla', false),
  ],
  ...Object.fromEntries(
    RAPORLAR_MODUL_TANIMLARI.filter(
      (r) =>
        r.id !== 'aktif-masalar' &&
        r.id !== 'fiyat-listesi' &&
        r.id !== 'acik-hesap-listesi' &&
        r.id !== 'satis-raporu' &&
        r.id !== 'satis-toplamlari' &&
        r.id !== 'ozel-raporlar'
    ).map((r) => {
      const sablon = (RAPOR_SABLON_MODUL_IDLERI as readonly string[]).includes(r.id);
      return [
        r.id,
        sablon
          ? [
              A('kaydet', 'Kaydet', false, true),
              A('ekle', 'Yeni Ekle', false),
              A('sil', 'Sil', false),
              A('onizle', 'Yazdır', false),
              A('yayinla', 'Yayınla', false),
            ]
          : [
              A('kaydet', 'Kaydet', false),
              A('ekle', 'Yeni Ekle', false),
              A('sil', 'Sil', false),
              A('onizle', 'Yazdır', false),
              A('yayinla', 'Yayınla', false),
            ],
      ];
    })
  ),
  ...Object.fromEntries(
    PAKET_SERVISI_RAPORLARI_MODUL_TANIMLARI.filter(
      (r) =>
        r.id !== 'ps-satis-raporu' &&
        r.id !== 'ps-satis-toplamlari' &&
        r.id !== 'ps-eski-tahsilat-tarama'
    ).map((r) => {
      const sablon = (PAKET_SERVISI_SABLON_MODUL_IDLERI as readonly string[]).includes(r.id);
      return [
        r.id,
        sablon
          ? [
              A('kaydet', 'Kaydet', false, true),
              A('ekle', 'Yeni Ekle', false),
              A('sil', 'Sil', false),
              A('onizle', 'Yazdır', false),
              A('yayinla', 'Yayınla', false),
            ]
          : [
              A('kaydet', 'Kaydet', false),
              A('ekle', 'Yeni Ekle', false),
              A('sil', 'Sil', false),
              A('onizle', 'Yazdır', false),
              A('yayinla', 'Yayınla', false),
            ],
      ];
    })
  ),
  ...Object.fromEntries(
    REZERVASYON_RAPORLARI_MODUL_TANIMLARI.map((r) => {
      const sablon = (REZERVASYON_SABLON_MODUL_IDLERI as readonly string[]).includes(r.id);
      return [
        r.id,
        sablon
          ? [
              A('kaydet', 'Kaydet', false, true),
              A('ekle', 'Yeni Ekle', false),
              A('sil', 'Sil', false),
              A('onizle', 'Yazdır', false),
              A('yayinla', 'Yayınla', false),
            ]
          : [
              A('kaydet', 'Kaydet', false),
              A('ekle', 'Yeni Ekle', false),
              A('sil', 'Sil', false),
              A('onizle', 'Yazdır', false),
              A('yayinla', 'Yayınla', false),
            ],
      ];
    })
  ),
  ...Object.fromEntries(
    UYGULAMA_AYARLAR_MODUL_TANIMLARI.map((m) => {
      if (m.id === 'arctos-db-ayarlari') {
        return [
          m.id,
          [
            A('kaydet', 'Kaydet', false, true),
            A('guncelle', 'Sına', true),
            A('ekle', 'Yeni Ekle', false),
            A('sil', 'Sil', false),
            A('onizle', 'Önizle', false),
            A('yayinla', 'Yayınla', false),
          ],
        ];
      }
      if (m.id === 'firma-donem-secimi') {
        return [
          m.id,
          [
            A('kaydet', 'Kaydet', false, true),
            A('ekle', 'Yeni Ekle', false),
            A('sil', 'Sil', false),
            A('guncelle', 'Düzenle', false),
            A('onizle', 'Önizle', false),
            A('yayinla', 'Yayınla', false),
          ],
        ];
      }
      if (m.id === 'lisans-ayarlari') {
        return [
          m.id,
          [
            A('ekle', 'Lisans Ekle', true, true),
            A('kaydet', 'Kaydet', false, true),
            A('sil', 'Sil', false),
            A('guncelle', 'Düzenle', false),
            A('onizle', 'Önizle', false),
            A('yayinla', 'Yayınla', false),
          ],
        ];
      }
      if (m.id === 'web-api-ayarlari') {
        return [
          m.id,
          [
            A('kaydet', 'Kaydet', true, true),
            A('ekle', 'Yeni Ekle', false),
            A('sil', 'Sil', false),
            A('guncelle', 'Düzenle', false),
            A('onizle', 'Önizle', false),
            A('yayinla', 'Yayınla', false),
          ],
        ];
      }
      return [
        m.id,
        [
          A('kaydet', 'Kaydet', false),
          A('ekle', 'Yeni Ekle', false),
          A('sil', 'Sil', false),
          A('onizle', 'Önizle', false),
          A('yayinla', 'Yayınla', false),
        ],
      ];
    })
  ),
};

const varsayilanAksiyonlar: AksiyonButonu[] = [
  A('kaydet', 'Kaydet', true),
  A('ekle', 'Yeni Ekle', false),
  A('sil', 'Sil', false),
  A('onizle', 'Önizle', false),
  A('yayinla', 'Yayınla', false),
];

const MODUL_AKSIYON_YETKI: Partial<Record<string, Partial<Record<AksiyonId, YetkiKodu>>>> = {
  kullanicilar: {
    kaydet: 'kullanici_yonetimi',
    ekle: 'kullanici_yonetimi',
    sil: 'kullanici_yonetimi',
  },
};

const AKSIYON_YETKI: Partial<Record<AksiyonId, YetkiKodu>> = {
  kaydet: 'duzenleme',
  ekle: 'ekleme',
  sil: 'silme',
  onizle: 'goruntuleme',
  yayinla: 'duzenleme',
};

export function useAksiyonCubugu(modulId: string) {
  const { aksiyonDurumlari } = useAdminAksiyon();
  const { t } = usePanelDil();
  const { yetkiler } = useYetkiler();

  return useMemo(() => {
    const temel = modulAksiyonlari[modulId] ?? varsayilanAksiyonlar;
    const modulYetki = MODUL_AKSIYON_YETKI[modulId] ?? {};
    const yetkiVar = (kod: YetkiKodu) => yetkiler.includes(kod);

    return temel.map((aksiyon) => {
      const dinamik = aksiyonDurumlari[aksiyon.id as AksiyonId];
      const varsayilan = varsayilanAksiyonlar.find((a) => a.id === aksiyon.id);
      const modulOzelEtiket = varsayilan && aksiyon.etiket !== varsayilan.etiket ? aksiyon.etiket : undefined;
      const etiket = modulOzelEtiket ?? t(`aksiyon.${aksiyon.id}`, aksiyon.etiket);
      const guncel = { ...aksiyon, etiket };

      const yetkiKodu = modulYetki[aksiyon.id as AksiyonId] ?? AKSIYON_YETKI[aksiyon.id as AksiyonId];
      const yetkiUygun = !yetkiKodu || yetkiVar(yetkiKodu);
      const temelAktif = dinamik !== undefined ? dinamik : aksiyon.aktif;

      return { ...guncel, aktif: temelAktif && yetkiUygun };
    });
  }, [modulId, aksiyonDurumlari, t, yetkiler]);
}
