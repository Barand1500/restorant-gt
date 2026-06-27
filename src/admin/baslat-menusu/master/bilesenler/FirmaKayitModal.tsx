import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { IlIlceArama, TelefonAlani } from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import type { FirmaFormGirdi, MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';

interface FirmaKayitModalProps {
  acik: boolean;
  duzenlenen: MasterFirma | null;
  bayiSecenekleri: MasterBayi[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: FirmaFormGirdi) => void;
}

const bosForm: FirmaFormGirdi = {
  bayiId: 0,
  unvan: '',
  tabelaAdi: '',
  il: '',
  ilce: '',
  eposta: '',
  telefon: '',
  gsm: '',
};

export function FirmaKayitModal({
  acik,
  duzenlenen,
  bayiSecenekleri,
  kaydediliyor,
  onKapat,
  onKaydet,
}: FirmaKayitModalProps) {
  const [form, setForm] = useState<FirmaFormGirdi>(bosForm);
  const [hata, setHata] = useState('');

  const aktifBayiler = bayiSecenekleri.filter((b) => b.aktif);

  useEffect(() => {
    if (!acik) return;
    const aktif = bayiSecenekleri.filter((b) => b.aktif);
    if (duzenlenen) {
      setForm({
        bayiId: duzenlenen.bayiId,
        unvan: duzenlenen.unvan,
        tabelaAdi: duzenlenen.tabelaAdi ?? '',
        il: duzenlenen.il ?? '',
        ilce: duzenlenen.ilce ?? '',
        eposta: duzenlenen.eposta ?? '',
        telefon: duzenlenen.telefon ?? '',
        gsm: duzenlenen.gsm ?? '',
      });
    } else {
      setForm({
        ...bosForm,
        bayiId: aktif[0]?.id ?? 0,
      });
    }
    setHata('');
  }, [acik, duzenlenen, bayiSecenekleri]);

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
    const unvan = form.unvan.trim();
    if (!form.bayiId || form.bayiId < 1) {
      setHata('Bayi seçin');
      return;
    }
    if (unvan.length < 2) {
      setHata('Unvan en az 2 karakter olmalı');
      return;
    }
    onKaydet({
      ...form,
      unvan,
      tabelaAdi: form.tabelaAdi?.trim() || undefined,
      il: form.il?.trim() || undefined,
      ilce: form.ilce?.trim() || undefined,
      eposta: form.eposta?.trim() || undefined,
      telefon: form.telefon?.trim() || undefined,
      gsm: form.gsm?.trim() || undefined,
    });
  }

  return (
    <div className="ap-sistem-modal-arka" role="dialog" aria-modal="true" aria-labelledby="firma-kayit-baslik">
      <div
        className="ap-sistem-modal ap-master-modal ap-master-modul-modal ap-master-firma-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ap-sistem-modal-baslik">
          <h2 id="firma-kayit-baslik" className="ap-heading text-base font-bold">
            {duzenlenen ? 'Firma Düzenle' : 'Yeni Firma Ekle'}
          </h2>
          <button type="button" className="ap-sistem-modal-kapat" onClick={onKapat} aria-label="Kapat">
            ✕
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Bayi *</label>
            <select
              className={formSelectSinifi}
              value={form.bayiId || ''}
              onChange={(e) => setForm({ ...form, bayiId: Number(e.target.value) })}
            >
              <option value="" disabled>
                Bayi seçin
              </option>
              {aktifBayiler.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.unvan}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Tabela adı</label>
            <input
              className={formInputSinifi}
              placeholder="Müşteriye görünen ad"
              value={form.tabelaAdi ?? ''}
              onChange={(e) => setForm({ ...form, tabelaAdi: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Unvan *</label>
            <input
              className={formInputSinifi}
              placeholder="Resmi unvan"
              value={form.unvan}
              onChange={(e) => setForm({ ...form, unvan: e.target.value })}
            />
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
            disabled={kaydediliyor || aktifBayiler.length === 0}
          >
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Firma Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
