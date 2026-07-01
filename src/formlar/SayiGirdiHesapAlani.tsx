import { useEffect, useRef, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { MinimalHesapMakinesi } from '@/formlar/MinimalHesapMakinesi';

interface SayiGirdiHesapAlaniProps {
  deger: string;
  onDegistir: (deger: string) => void;
  placeholder?: string;
  onEk?: string;
}

export function SayiGirdiHesapAlani({ deger, onDegistir, placeholder, onEk }: SayiGirdiHesapAlaniProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hesapAcik, setHesapAcik] = useState(false);

  useEffect(() => {
    if (!hesapAcik) return;

    const disTikla = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setHesapAcik(false);
    };

    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHesapAcik(false);
    };

    document.addEventListener('mousedown', disTikla);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', disTikla);
      document.removeEventListener('keydown', esc);
    };
  }, [hesapAcik]);

  const uygula = (yeni: string) => {
    onDegistir(yeni);
    setHesapAcik(false);
  };

  return (
    <div ref={wrapRef} className="ap-sayi-girdi-hesap-wrap">
      <div className={`ap-sayi-girdi-hesap-kutu${onEk ? ' ap-sayi-girdi-hesap-kutu-on-ekli' : ''}`}>
        {onEk ? (
          <span className="ap-sayi-girdi-hesap-on-ek" aria-hidden>
            {onEk}
          </span>
        ) : null}
        <input
          type="text"
          inputMode="decimal"
          className={`${formInputSinifi} ap-sayi-girdi-hesap-girdi`}
          value={deger}
          onChange={(e) => onDegistir(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="ap-sayi-girdi-hesap-tus"
          onClick={() => setHesapAcik((a) => !a)}
          aria-expanded={hesapAcik}
          aria-haspopup="dialog"
          title="Hesap makinesi"
        >
          <span aria-hidden>▼</span>
        </button>
      </div>

      {hesapAcik ? <MinimalHesapMakinesi baslangicDeger={deger} onUygula={uygula} /> : null}
    </div>
  );
}
