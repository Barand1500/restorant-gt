import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { IlIlceArama, TelefonAlani } from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import type { BayiFormGirdi, MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';

interface BayiKayitModalProps {
  acik: boolean;
  duzenlenen: MasterBayi | null;
  ustBayiSecenekleri: MasterBayi[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: BayiFormGirdi) => void;
}

const bosForm: BayiFormGirdi = { unvan: '', ustId: null, il: '', ilce: '', eposta: '', telefon: '', gsm: '' };

export function BayiKayitModal({
  acik,
  duzenlenen,
  ustBayiSecenekleri,
  kaydediliyor,
  onKapat,
  onKaydet,
}: BayiKayitModalProps) {
  const [form, setForm] = useState<BayiFormGirdi>(bosForm);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    if (duzenlenen) {
      setForm({
        unvan: duzenlenen.unvan,
        ustId: duzenlenen.ustId,
        il: duzenlenen.il ?? '',
        ilce: duzenlenen.ilce ?? '',
        eposta: duzenlenen.eposta ?? '',
        telefon: duzenlenen.telefon ?? '',
        gsm: duzenlenen.gsm ?? '',
      });
    } else {
      setForm(bosForm);
    }
    setHata('');
  }, [acik, duzenlenen]);

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

  const ustSecenekler = ustBayiSecenekleri.filter((b) => b.id !== duzenlenen?.id && b.aktif);

  function kaydet() {
    const unvan = form.unvan.trim();
    if (unvan.length < 2) {
      setHata('Unvan en az 2 karakter olmalı');
      return;
    }
    onKaydet({
      ...form,
      unvan,
      il: form.il?.trim() || undefined,
      ilce: form.ilce?.trim() || undefined,
      eposta: form.eposta?.trim() || undefined,
      telefon: form.telefon?.trim() || undefined,
      gsm: form.gsm?.trim() || undefined,
      ustId: form.ustId ?? null,
    });
  }

  return (
    <div
      className="ap-sistem-modal-arka"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bayi-kayit-baslik"
    >
      <div className="ap-sistem-modal ap-master-modal ap-master-modul-modal ap-master-bayi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ap-sistem-modal-baslik">
          <h2 id="bayi-kayit-baslik" className="ap-heading text-base font-bold">
            {duzenlenen ? 'Bayi Düzenle' : 'Yeni Bayi Ekle'}
          </h2>
          <button type="button" className="ap-sistem-modal-kapat" onClick={onKapat} aria-label="Kapat">
            ✕
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Unvan *</label>
            <input
              className={formInputSinifi}
              placeholder="Bayi / distribütör unvanı"
              value={form.unvan}
              onChange={(e) => setForm({ ...form, unvan: e.target.value })}
              autoFocus
            />
          </div>
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Üst bayi</label>
            <select
              className={formSelectSinifi}
              value={form.ustId ?? ''}
              onChange={(e) =>
                setForm({ ...form, ustId: e.target.value ? Number(e.target.value) : null })
              }
            >
              <option value="">Bağımsız (ana bayi)</option>
              {ustSecenekler.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.unvan}
                </option>
              ))}
            </select>
          </div>
          <IlIlceArama
            il={form.il ?? ''}
            ilce={form.ilce ?? ''}
            onDegistir={(g) => setForm((f) => ({ ...f, ...g }))}
          />
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">E-posta</label>
            <input
              type="email"
              className={formInputSinifi}
              value={form.eposta ?? ''}
              onChange={(e) => setForm({ ...form, eposta: e.target.value })}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Telefon</label>
            <TelefonAlani value={form.telefon ?? ''} onChange={(v) => setForm({ ...form, telefon: v })} />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">GSM</label>
            <TelefonAlani
              value={form.gsm ?? ''}
              onChange={(v) => setForm({ ...form, gsm: v })}
              placeholder="05XX XXX XX XX"
              aria-label="GSM"
            />
          </div>
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
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Bayi Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
