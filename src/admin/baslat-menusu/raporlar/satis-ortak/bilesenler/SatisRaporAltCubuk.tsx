interface SatisRaporAltCubukProps {
  miktarToplam: number;
  tutarToplam: number;
  subeEtiket: string;
  onSubeDepartman: () => void;
  onExcel: () => void;
  onYazdir: () => void;
  excelAktif?: boolean;
}

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(deger);
}

export function SatisRaporAltCubuk({
  miktarToplam,
  tutarToplam,
  subeEtiket,
  onSubeDepartman,
  onExcel,
  onYazdir,
  excelAktif = true,
}: SatisRaporAltCubukProps) {
  return (
    <footer className="ap-satis-rapor-alt">
      <div className="ap-satis-rapor-alt-sol">
        <button type="button" className="ap-satis-rapor-sube-tus" onClick={onSubeDepartman}>
          Şube / Departman
          {subeEtiket && <span className="ap-satis-rapor-sube-etiket">{subeEtiket}</span>}
        </button>
      </div>

      <div className="ap-satis-rapor-alt-ozet">
        <div className="ap-satis-rapor-ozet-kutu">
          <span className="ap-satis-rapor-ozet-etiket">Miktar</span>
          <strong>{miktarToplam}</strong>
        </div>
        <div className="ap-satis-rapor-ozet-kutu">
          <span className="ap-satis-rapor-ozet-etiket">Tutar</span>
          <strong>{para(tutarToplam)}</strong>
        </div>
      </div>

      <div className="ap-satis-rapor-alt-sag">
        <button type="button" className="ap-satis-rapor-aksiyon-tus" onClick={onExcel} disabled={!excelAktif}>
          Excel
        </button>
        <button type="button" className="ap-satis-rapor-aksiyon-tus" onClick={onYazdir}>
          Yazdır
        </button>
      </div>
    </footer>
  );
}
