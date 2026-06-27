import { useEffect, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { prefixNormalize, prefixUret } from '@/admin/baslat-menusu/master/moduller/api';

export interface ModulFormDegeri {
  modulAdi: string;
  prefix: string;
}

interface ModulEkleModalProps {
  acik: boolean;
  mevcutPrefixler: string[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onEkle: (deger: ModulFormDegeri) => void;
}

const bosForm: ModulFormDegeri = { modulAdi: '', prefix: '' };

export function ModulEkleModal({ acik, mevcutPrefixler, kaydediliyor, onKapat, onEkle }: ModulEkleModalProps) {
  const [form, setForm] = useState<ModulFormDegeri>(bosForm);
  const [prefixElle, setPrefixElle] = useState(false);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    setForm(bosForm);
    setPrefixElle(false);
    setHata('');
  }, [acik]);

  useEffect(() => {
    if (!acik || prefixElle) return;
    setForm((f) => ({
      ...f,
      prefix: f.modulAdi.trim() ? prefixUret(f.modulAdi, mevcutPrefixler) : '',
    }));
  }, [acik, form.modulAdi, mevcutPrefixler, prefixElle]);

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
    const ad = form.modulAdi.trim();
    const prefix = prefixNormalize(form.prefix);
    if (ad.length < 2) {
      setHata('Modül adı en az 2 karakter olmalı');
      return;
    }
    if (prefix.length < 2) {
      setHata('Geçerli bir prefix girin (ör. restoran_panel)');
      return;
    }
    if (mevcutPrefixler.includes(prefix)) {
      setHata('Bu prefix zaten kullanılıyor');
      return;
    }
    onEkle({ modulAdi: ad, prefix });
  }

  return (
    <div
      className="ap-sistem-modal-arka"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modul-ekle-baslik"
    >
      <div className="ap-sistem-modal ap-master-modal ap-master-modul-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ap-sistem-modal-baslik">
          <h2 id="modul-ekle-baslik" className="ap-heading text-base font-bold">
            Yeni Modül Ekle
          </h2>
          <button type="button" className="ap-sistem-modal-kapat" onClick={onKapat} aria-label="Kapat">
            ✕
          </button>
        </div>
        <p className="ap-muted mt-2 text-sm">
          Modül kaydedildiğinde varsayılan sistem rolleri otomatik oluşturulur ve listede görünür.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Modül adı</label>
            <input
              className={formInputSinifi}
              placeholder="ör. Stok Yönetimi"
              value={form.modulAdi}
              onChange={(e) => setForm({ ...form, modulAdi: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="ap-muted text-xs font-semibold uppercase">Prefix (benzersiz kod)</label>
              <button
                type="button"
                className="ap-master-link-btn !cursor-pointer !opacity-100"
                onClick={() => setPrefixElle((v) => !v)}
              >
                {prefixElle ? 'Otomatik üret' : 'Elle düzenle'}
              </button>
            </div>
            <input
              className={`${formInputSinifi} font-mono text-sm`}
              placeholder="stok_yonetimi"
              value={form.prefix}
              readOnly={!prefixElle}
              onChange={(e) => setForm({ ...form, prefix: prefixNormalize(e.target.value) })}
            />
          </div>
          {hata && <p className="text-sm text-red-400">{hata}</p>}
        </div>
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
            {kaydediliyor ? 'Kaydediliyor…' : 'Modül Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
