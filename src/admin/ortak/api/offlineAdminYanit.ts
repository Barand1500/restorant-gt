/** Backend olmadan admin sayfalarının boş açılması için minimal yanıtlar */
export function offlineAdminYanit(path: string, method: string): unknown {
  const m = method.toUpperCase();
  const p = path.split('?')[0];

  if (m !== 'GET') {
    if (p.includes('/kullanicilar')) {
      return {
        kullanici: {
          id: '1',
          email: 'admin@restorant.local',
          ad: 'Admin',
          rol: 'SUPER_ADMIN',
          siteId: null,
          aktif: true,
        },
      };
    }
    if (p.includes('/roller')) {
      return {
        roller: [],
        yetkiler: [
          { kod: 'goruntuleme', etiket: 'Görüntüleme' },
          { kod: 'ekleme', etiket: 'Ekleme' },
          { kod: 'duzenleme', etiket: 'Düzenleme' },
          { kod: 'silme', etiket: 'Silme' },
          { kod: 'kullanici_yonetimi', etiket: 'Kullanıcı Yönetimi' },
        ],
      };
    }
    if (p.includes('/sistem-ayarlari')) {
      return offlineSistemAyarlari();
    }
    return { mesaj: 'Kayıt (offline mod)' };
  }

  if (p.includes('/kullanicilar/siteler')) return { siteler: [] };
  if (p.includes('/kullanicilar')) return { kullanicilar: [] };
  if (p.includes('/roller/yetkiler')) return { yetkiler: [] };
  if (p.includes('/roller')) {
    return {
      roller: [],
      yetkiler: [
        { kod: 'goruntuleme', etiket: 'Görüntüleme' },
        { kod: 'ekleme', etiket: 'Ekleme' },
        { kod: 'duzenleme', etiket: 'Düzenleme' },
        { kod: 'silme', etiket: 'Silme' },
        { kod: 'kullanici_yonetimi', etiket: 'Kullanıcı Yönetimi' },
      ],
    };
  }
  if (p.includes('/loglar')) return { loglar: [], toplam: 0 };
  if (p.includes('/yedek/varsayilan-dosya-adi')) return { dosyaAdi: 'restorant-yedek.json' };
  if (p.includes('/yedek/gecmis')) return { kayitlar: [], sonKayit: null };
  if (p.includes('/sistem-ayarlari')) return offlineSistemAyarlari();
  if (p.includes('/bildirim')) return { bildirimler: [] };

  return {};
}

function offlineSistemAyarlari() {
  return {
    site: {
      id: '1',
      ad: 'Restorant',
      slug: 'restorant',
      domain: null,
      aktif: true,
    },
    sistem: {},
    surum: '0.1.0-offline',
  };
}
