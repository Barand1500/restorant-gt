import { useCallback, useState } from 'react';
import { modulAra, adminKategoriler, adminModulleri, modulleriMenuyeGoreFiltrele } from '@/admin/veri/adminMenuYapisi';
import { useModulKatalog } from '@/baglamlar/ModulKatalogContext';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import type { AdminModul } from '@/admin/ortak/tipler/admin';
import { BaslatMenuArama } from './BaslatMenuArama';
import {
  baslatMenuKapaliKategorileriKaydet,
  baslatMenuKapaliKategorileriOku,
} from './baslatMenuKategoriDurumu';

const KATEGORI_IKON: Record<string, string> = {
  Master: '🗄️',
  'Hızlı Erişim': '⚡',
  'Site Yönetimi': '🏠',
  'İçerik Yönetimi': '📝',
  'Müşteri / Ajans': '👥',
  Tanımlar: '📋',
  Raporlar: '📊',
  'Paket Servisi Raporları': '📦',
  'Rezervasyon Raporları': '📆',
  Ayarlar: '🛠️',
  Sistem: '⚙️',
};

interface BaslatMenuProps {
  acik: boolean;
  onKapat: () => void;
  onModulSec: (modul: AdminModul) => void;
}

export function BaslatMenu({ acik, onKapat, onModulSec }: BaslatMenuProps) {
  if (!acik) return null;

  return (
    <>
      <div className="ap-baslat-overlay fixed inset-0 z-40 bg-black/25" onClick={onKapat} />
      <BaslatMenuIcerik onModulSec={onModulSec} onKapat={onKapat} />
    </>
  );
}

function BaslatMenuIcerik({
  onModulSec,
  onKapat,
}: {
  onModulSec: (modul: AdminModul) => void;
  onKapat: () => void;
}) {
  const [arama, setArama] = useState('');
  const [kapaliKategoriler, setKapaliKategoriler] = useState<Set<string>>(() =>
    baslatMenuKapaliKategorileriOku()
  );
  const { t } = usePanelDil();
  const { aktifPrefixler } = useModulKatalog();
  const sonuclar = modulAra(arama, aktifPrefixler);
  const gorunurModuller = modulleriMenuyeGoreFiltrele(adminModulleri, aktifPrefixler);

  const kategoriToggle = useCallback((kategori: string) => {
    setKapaliKategoriler((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(kategori)) yeni.delete(kategori);
      else yeni.add(kategori);
      baslatMenuKapaliKategorileriKaydet(yeni);
      return yeni;
    });
  }, []);

  return (
    <div className="ap-baslat-menu-dock fixed left-0 top-12 z-50 flex max-h-[calc(100vh-3rem)] w-[min(440px,92vw)] flex-col overflow-hidden border border-[var(--ap-border)] border-l-0 bg-[var(--ap-surface)] shadow-2xl">
      <div className="border-b border-[var(--ap-border)] bg-[var(--ap-header-bg)] px-3 py-2">
        <p className="ap-heading text-xs font-bold">{t('header.baslatMenu', 'Başlat Menüsü')}</p>
        <p className="ap-muted text-[10px]">{t('header.modulAra', 'Modül veya ayar ara')}</p>
      </div>

      <BaslatMenuArama deger={arama} onDegistir={setArama} />

      <div className="ap-scroll flex-1 overflow-y-auto p-2">
        {arama ? (
          <ModulListesi
            baslik={`Arama: "${arama}"`}
            kategori=""
            moduller={sonuclar}
            katlanmis={false}
            onKategoriToggle={undefined}
            onSec={(m) => {
              onModulSec(m);
              onKapat();
            }}
          />
        ) : (
          adminKategoriler.map((kategori) => (
            <ModulListesi
              key={kategori}
              baslik={t(`kategori.${kategori}`, kategori)}
              kategori={kategori}
              moduller={gorunurModuller.filter((m) => m.kategori === kategori)}
              katlanmis={kapaliKategoriler.has(kategori)}
              onKategoriToggle={() => kategoriToggle(kategori)}
              onSec={(m) => {
                onModulSec(m);
                onKapat();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ModulListesi({
  baslik,
  kategori,
  moduller,
  katlanmis,
  onKategoriToggle,
  onSec,
}: {
  baslik: string;
  kategori: string;
  moduller: AdminModul[];
  katlanmis: boolean;
  onKategoriToggle?: () => void;
  onSec: (modul: AdminModul) => void;
}) {
  const { t } = usePanelDil();
  if (moduller.length === 0) return null;

  const katlanabilir = Boolean(kategori && onKategoriToggle);

  return (
    <div className={`ap-menu-kategori${katlanmis ? ' ap-menu-kategori-kapali' : ''}`}>
      {katlanabilir ? (
        <button
          type="button"
          className="ap-menu-kategori-baslik ap-menu-kategori-baslik-tus"
          onClick={onKategoriToggle}
          aria-expanded={!katlanmis}
        >
          <span className="ap-menu-kategori-baslik-ikon" aria-hidden>
            {KATEGORI_IKON[kategori] ?? '•'}
          </span>
          <span className="ap-menu-kategori-baslik-metin">{baslik}</span>
          <span className="ap-menu-kategori-ok" aria-hidden>
            ▼
          </span>
        </button>
      ) : (
        <p className="ap-menu-kategori-baslik">
          {kategori && <span>{KATEGORI_IKON[kategori] ?? '•'}</span>}
          {baslik}
        </p>
      )}

      {!katlanmis && (
        <ul className="ap-menu-kategori-liste space-y-0.5">
          {moduller.map((modul) => (
            <li key={modul.id}>
              <button type="button" onClick={() => onSec(modul)} className="ap-menu-oge">
                <span className="ap-menu-oge-ikon">{modul.ikon}</span>
                <span className="font-medium">{t(`modul.${modul.id}`, modul.baslik)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
