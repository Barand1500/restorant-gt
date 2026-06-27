import { useEffect, useRef, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { telefonFormatla, telefonRakamlari } from '@/araclar/telefonYardimci';
import {
  illeriFiltrele,
  ilceleriFiltrele,
  turkiyeIlceleriniYukle,
  turkiyeIlleriniYukle,
  YEDEK_ILLER,
} from '@/veri/turkiyeIlIlce';

interface TelefonAlaniProps {
  value: string;
  onChange: (deger: string) => void;
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
}

/** Türkiye telefon formatı: 0XXX XXX XX XX */
export function TelefonAlani({
  value,
  onChange,
  placeholder = '0XXX XXX XX XX',
  id,
  'aria-label': ariaLabel,
}: TelefonAlaniProps) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      className={formInputSinifi}
      placeholder={placeholder}
      value={telefonFormatla(value)}
      aria-label={ariaLabel ?? 'Telefon'}
      onChange={(e) => onChange(telefonRakamlari(e.target.value))}
    />
  );
}

interface IlIlceAramaProps {
  il: string;
  ilce: string;
  onDegistir: (guncel: { il?: string; ilce?: string }) => void;
  ilEtiket?: string;
  ilceEtiket?: string;
}

export function IlIlceArama({
  il,
  ilce,
  onDegistir,
  ilEtiket = 'İl',
  ilceEtiket = 'İlçe',
}: IlIlceAramaProps) {
  return (
    <>
      <IlAramaInput
        etiket={ilEtiket}
        deger={il}
        onYazi={(v) => onDegistir({ il: v, ilce: '' })}
        onSec={(v) => onDegistir({ il: v, ilce: '' })}
      />
      <IlceAramaInput
        etiket={ilceEtiket}
        il={il}
        deger={ilce}
        onYazi={(v) => onDegistir({ ilce: v })}
        onSec={(v) => onDegistir({ ilce: v })}
      />
    </>
  );
}

function IlAramaInput({
  etiket,
  deger,
  onYazi,
  onSec,
}: {
  etiket: string;
  deger: string;
  onYazi: (v: string) => void;
  onSec: (v: string) => void;
}) {
  const [iller, setIller] = useState<string[]>(YEDEK_ILLER);
  const [acik, setAcik] = useState(false);
  const kapsayiciRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    turkiyeIlleriniYukle()
      .then(setIller)
      .catch(() => setIller(YEDEK_ILLER));
  }, []);

  useEffect(() => {
    function disTik(e: MouseEvent) {
      if (kapsayiciRef.current && !kapsayiciRef.current.contains(e.target as Node)) setAcik(false);
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, []);

  const filtreli = acik ? illeriFiltrele(iller, deger) : [];

  return (
    <div ref={kapsayiciRef} className="ap-master-il-arama">
      <label className="ap-muted mb-1 block text-xs font-semibold uppercase">{etiket}</label>
      <input
        className={formInputSinifi}
        value={deger}
        placeholder="İl yazın…"
        autoComplete="off"
        spellCheck={false}
        onFocus={() => setAcik(true)}
        onChange={(e) => {
          onYazi(e.target.value);
          setAcik(true);
        }}
      />
      {acik && filtreli.length > 0 && (
        <ul className="ap-master-il-arama-liste" role="listbox">
          {filtreli.map((ad) => (
            <li key={ad}>
              <button
                type="button"
                role="option"
                className="ap-master-il-arama-oge"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSec(ad);
                  setAcik(false);
                }}
              >
                {ad}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IlceAramaInput({
  etiket,
  il,
  deger,
  onYazi,
  onSec,
}: {
  etiket: string;
  il: string;
  deger: string;
  onYazi: (v: string) => void;
  onSec: (v: string) => void;
}) {
  const [ilceler, setIlceler] = useState<string[]>([]);
  const [acik, setAcik] = useState(false);
  const kapsayiciRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!il.trim()) {
      setIlceler([]);
      return;
    }
    const eslesenIl = il.trim();
    turkiyeIlceleriniYukle(eslesenIl)
      .then(setIlceler)
      .catch(() => setIlceler([]));
  }, [il]);

  useEffect(() => {
    function disTik(e: MouseEvent) {
      if (kapsayiciRef.current && !kapsayiciRef.current.contains(e.target as Node)) setAcik(false);
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, []);

  const filtreli = acik && il.trim() ? ilceleriFiltrele(ilceler, deger) : [];

  return (
    <div ref={kapsayiciRef} className="ap-master-il-arama">
      <label className="ap-muted mb-1 block text-xs font-semibold uppercase">{etiket}</label>
      <input
        className={formInputSinifi}
        value={deger}
        placeholder={il.trim() ? 'İlçe yazın…' : 'Önce il seçin'}
        autoComplete="off"
        spellCheck={false}
        onFocus={() => setAcik(true)}
        onChange={(e) => {
          onYazi(e.target.value);
          setAcik(true);
        }}
      />
      {acik && filtreli.length > 0 && (
        <ul className="ap-master-il-arama-liste" role="listbox">
          {filtreli.map((ad) => (
            <li key={ad}>
              <button
                type="button"
                role="option"
                className="ap-master-il-arama-oge"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSec(ad);
                  setAcik(false);
                }}
              >
                {ad}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
