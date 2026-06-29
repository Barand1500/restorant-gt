import { useEffect, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { prefixNormalize, prefixUret } from '@/admin/baslat-menusu/master/moduller/api';
import { SistemModal } from '@/admin/ortak/SistemModal';

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
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Yeni Modül Ekle"
      altBaslik="Kataloga yeni bir panel modülü tanımlayın"
      ikon="🧩"
      genislik="sm"
      baslikId="modul-ekle-baslik"
      kapatmaDevreDisi={kaydediliyor}
      footer={
        <>
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
        </>
      }
    >
      <div className="ap-sistem-modal-bilgi-kutu">
        <span className="ap-sistem-modal-bilgi-ikon" aria-hidden>
          ℹ️
        </span>
        <p>Modül kaydedildiğinde varsayılan sistem rolleri otomatik oluşturulur ve katalogda listelenir.</p>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Modül adı</label>
          <input
            className={formInputSinifi}
            placeholder="ör. Stok Yönetimi"
            value={form.modulAdi}
            onChange={(e) => setForm({ ...form, modulAdi: e.target.value })}
            autoFocus
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="ap-muted text-xs font-semibold uppercase tracking-wide">Prefix (benzersiz kod)</label>
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
          <p className="ap-muted mt-1.5 text-xs">Küçük harf, rakam ve alt çizgi. Harf ile başlamalı.</p>
        </div>
        {hata && <p className="text-sm text-red-400">{hata}</p>}
      </div>
    </SistemModal>
  );
}
