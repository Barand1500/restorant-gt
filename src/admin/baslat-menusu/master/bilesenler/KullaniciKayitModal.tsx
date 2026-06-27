import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { TelefonAlani } from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import type { KullaniciFormGirdi, KullaniciTipi, MasterKullanici } from '@/admin/baslat-menusu/master/kullanicilar/api';
import { KULLANICI_TIP_ETIKET } from '@/admin/baslat-menusu/master/kullanicilar/api';
import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import type { MasterSube } from '@/admin/baslat-menusu/master/subeler/api';

interface KullaniciKayitModalProps {
  acik: boolean;
  duzenlenen: MasterKullanici | null;
  roller: { kod: string; baslik: string }[];
  bayiler: MasterBayi[];
  firmalar: MasterFirma[];
  subeler: MasterSube[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: KullaniciFormGirdi) => void;
}

const bosForm: KullaniciFormGirdi = {
  ad: '',
  email: '',
  sifre: '',
  rol: 'EDITOR',
  kullaniciTipi: 'merkez',
  gsm: '',
  aktif: true,
};

export function KullaniciKayitModal({
  acik,
  duzenlenen,
  roller,
  bayiler,
  firmalar,
  subeler,
  kaydediliyor,
  onKapat,
  onKaydet,
}: KullaniciKayitModalProps) {
  const [form, setForm] = useState<KullaniciFormGirdi>(bosForm);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    if (duzenlenen) {
      setForm({
        ad: duzenlenen.ad,
        email: duzenlenen.eposta,
        rol: duzenlenen.rol,
        kullaniciTipi: duzenlenen.kullaniciTipi,
        bayiId: duzenlenen.bayiId,
        firmaId: duzenlenen.firmaId,
        subeId: duzenlenen.subeId,
        gsm: duzenlenen.gsm ?? '',
        aktif: duzenlenen.aktif,
      });
    } else {
      setForm({ ...bosForm, rol: roller[0]?.kod ?? 'EDITOR' });
    }
    setHata('');
  }, [acik, duzenlenen, roller]);

  useEffect(() => {
    if (!acik) return;
    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onKapat();
      }
    }
    document.addEventListener('keydown', tusHandler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, onKapat]);

  if (!acik) return null;

  function kaydet() {
    const ad = form.ad.trim();
    const email = form.email.trim();
    if (ad.length < 2) {
      setHata('Ad en az 2 karakter olmalı');
      return;
    }
    if (!email.includes('@')) {
      setHata('Geçerli e-posta girin');
      return;
    }
    if (!duzenlenen && !form.sifre?.trim()) {
      setHata('Şifre zorunlu');
      return;
    }
    onKaydet({
      ...form,
      ad,
      email,
      gsm: form.gsm?.trim() || undefined,
      sifre: form.sifre?.trim() || undefined,
    });
  }

  return (
    <div className="ap-sistem-modal-arka" role="dialog" aria-modal="true" aria-labelledby="kullanici-kayit-baslik">
      <div
        className="ap-sistem-modal ap-master-modal ap-master-modul-modal ap-master-firma-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ap-sistem-modal-baslik">
          <h2 id="kullanici-kayit-baslik" className="ap-heading text-base font-bold">
            {duzenlenen ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
          </h2>
          <button type="button" className="ap-sistem-modal-kapat" onClick={onKapat} aria-label="Kapat">
            ✕
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Ad soyad *</label>
            <input
              className={formInputSinifi}
              value={form.ad}
              onChange={(e) => setForm((f) => ({ ...f, ad: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">E-posta *</label>
            <input
              type="email"
              className={formInputSinifi}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">
              {duzenlenen ? 'Yeni şifre (opsiyonel)' : 'Şifre *'}
            </label>
            <input
              type="password"
              className={formInputSinifi}
              value={form.sifre ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, sifre: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">GSM</label>
            <TelefonAlani value={form.gsm ?? ''} onChange={(v) => setForm((f) => ({ ...f, gsm: v }))} placeholder="05XX XXX XX XX" />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Rol</label>
            <select
              className={formSelectSinifi}
              value={form.rol}
              onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
            >
              {roller.map((r) => (
                <option key={r.kod} value={r.kod}>
                  {r.baslik}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Kullanıcı tipi</label>
            <select
              className={formSelectSinifi}
              value={form.kullaniciTipi}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  kullaniciTipi: e.target.value as KullaniciTipi,
                  bayiId: null,
                  firmaId: null,
                  subeId: null,
                }))
              }
            >
              {(Object.keys(KULLANICI_TIP_ETIKET) as KullaniciTipi[]).map((t) => (
                <option key={t} value={t}>
                  {KULLANICI_TIP_ETIKET[t]}
                </option>
              ))}
            </select>
          </div>
          {(form.kullaniciTipi === 'bayi' || form.kullaniciTipi === 'firma' || form.kullaniciTipi === 'sube') && (
            <div className="sm:col-span-2">
              <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Bayi</label>
              <select
                className={formSelectSinifi}
                value={form.bayiId ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    bayiId: e.target.value ? Number(e.target.value) : null,
                    firmaId: null,
                    subeId: null,
                  }))
                }
              >
                <option value="">Seçin</option>
                {bayiler.filter((b) => b.aktif).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.unvan}
                  </option>
                ))}
              </select>
            </div>
          )}
          {(form.kullaniciTipi === 'firma' || form.kullaniciTipi === 'sube') && (
            <div className="sm:col-span-2">
              <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Firma</label>
              <select
                className={formSelectSinifi}
                value={form.firmaId ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    firmaId: e.target.value ? Number(e.target.value) : null,
                    subeId: null,
                  }))
                }
              >
                <option value="">Seçin</option>
                {firmalar
                  .filter((fr) => fr.aktif && (!form.bayiId || fr.bayiId === form.bayiId))
                  .map((fr) => (
                    <option key={fr.id} value={fr.id}>
                      {fr.tabelaAdi ?? fr.unvan}
                    </option>
                  ))}
              </select>
            </div>
          )}
          {form.kullaniciTipi === 'sube' && (
            <div className="sm:col-span-2">
              <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube</label>
              <select
                className={formSelectSinifi}
                value={form.subeId ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, subeId: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">Seçin</option>
                {subeler
                  .filter((s) => s.aktif && (!form.firmaId || s.firmaId === form.firmaId))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subeAdi}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {hata && <p className="mt-3 text-sm text-red-400">{hata}</p>}

        <div className="ap-sistem-modal-aksiyonlar ap-master-modal-aksiyonlar">
          <button type="button" className="ap-sistem-modal-btn" onClick={onKapat} disabled={kaydediliyor}>
            İptal
          </button>
          <button
            type="button"
            className="ap-sistem-modal-btn ap-sistem-modal-btn-birincil"
            onClick={kaydet}
            disabled={kaydediliyor}
          >
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Kullanıcı Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
