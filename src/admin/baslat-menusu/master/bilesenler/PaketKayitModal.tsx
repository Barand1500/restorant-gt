import { useEffect, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { MasterPaket, PaketFormGirdi } from '@/admin/baslat-menusu/master/paketler/api';

interface PaketKayitModalProps {
  acik: boolean;
  duzenlenen: MasterPaket | null;
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: PaketFormGirdi) => void;
}

const bosForm: PaketFormGirdi = {
  paketAdi: '',
  subeSayisi: 1,
  personelSayisi: 10,
  masaSayisi: 50,
  fiyat: 0,
};

export function PaketKayitModal({ acik, duzenlenen, kaydediliyor, onKapat, onKaydet }: PaketKayitModalProps) {
  const [form, setForm] = useState<PaketFormGirdi>(bosForm);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    if (duzenlenen) {
      setForm({
        paketAdi: duzenlenen.paketAdi,
        subeSayisi: duzenlenen.subeSayisi,
        personelSayisi: duzenlenen.personelSayisi,
        masaSayisi: duzenlenen.masaSayisi,
        fiyat: duzenlenen.fiyat,
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

  function kaydet() {
    const paketAdi = form.paketAdi.trim();
    if (paketAdi.length < 2) {
      setHata('Paket adı en az 2 karakter olmalı');
      return;
    }
    onKaydet({ ...form, paketAdi });
  }

  return (
    <div className="ap-sistem-modal-arka" role="dialog" aria-modal="true" aria-labelledby="paket-kayit-baslik">
      <div className="ap-sistem-modal ap-master-modal ap-master-modul-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ap-sistem-modal-baslik">
          <h2 id="paket-kayit-baslik" className="ap-heading text-base font-bold">
            {duzenlenen ? 'Paket Düzenle' : 'Yeni Paket'}
          </h2>
          <button type="button" className="ap-sistem-modal-kapat" onClick={onKapat} aria-label="Kapat">
            ✕
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Paket adı *</label>
            <input
              className={formInputSinifi}
              value={form.paketAdi}
              onChange={(e) => setForm((f) => ({ ...f, paketAdi: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube limiti</label>
            <input
              type="number"
              min={1}
              className={formInputSinifi}
              value={form.subeSayisi}
              onChange={(e) => setForm((f) => ({ ...f, subeSayisi: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Personel limiti</label>
            <input
              type="number"
              min={1}
              className={formInputSinifi}
              value={form.personelSayisi}
              onChange={(e) => setForm((f) => ({ ...f, personelSayisi: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Masa limiti</label>
            <input
              type="number"
              min={1}
              className={formInputSinifi}
              value={form.masaSayisi}
              onChange={(e) => setForm((f) => ({ ...f, masaSayisi: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Aylık fiyat (₺)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              className={formInputSinifi}
              value={form.fiyat}
              onChange={(e) => setForm((f) => ({ ...f, fiyat: Number(e.target.value) }))}
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
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Paket Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
