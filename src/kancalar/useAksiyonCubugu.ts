import { useMemo } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import type { AksiyonButonu } from '@/admin/ortak/tipler/admin';
import type { AksiyonId } from '@/baglamlar/AdminAksiyonContext';
import { useYetkiler } from '@/kancalar/useYetkiler';
import type { YetkiKodu } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

const A = (id: AksiyonButonu['id'], etiket: string, aktif: boolean, birincil?: boolean): AksiyonButonu => ({
  id,
  etiket,
  aktif,
  ...(birincil ? { birincil: true } : {}),
});

const modulAksiyonlari: Record<string, AksiyonButonu[]> = {
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
      const etiket = t(`aksiyon.${aksiyon.id}`, aksiyon.etiket);
      const guncel = { ...aksiyon, etiket };

      const yetkiKodu = modulYetki[aksiyon.id as AksiyonId] ?? AKSIYON_YETKI[aksiyon.id as AksiyonId];
      const yetkiUygun = !yetkiKodu || yetkiVar(yetkiKodu);
      const temelAktif = dinamik !== undefined ? dinamik : aksiyon.aktif;

      return { ...guncel, aktif: temelAktif && yetkiUygun };
    });
  }, [modulId, aksiyonDurumlari, t, yetkiler]);
}
