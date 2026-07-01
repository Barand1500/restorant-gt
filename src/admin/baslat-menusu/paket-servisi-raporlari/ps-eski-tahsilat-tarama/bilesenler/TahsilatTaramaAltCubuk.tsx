interface TahsilatTaramaAltCubukProps {
  subeEtiket: string;
  onSubeDepartman: () => void;
  onYazdir: () => void;
}

export function TahsilatTaramaAltCubuk({
  subeEtiket,
  onSubeDepartman,
  onYazdir,
}: TahsilatTaramaAltCubukProps) {
  return (
    <footer className="ap-satis-rapor-alt ap-tahsilat-tarama-alt">
      <div className="ap-satis-rapor-alt-sol">
        <button type="button" className="ap-satis-rapor-sube-tus" onClick={onSubeDepartman}>
          Şube / Departman
          {subeEtiket && <span className="ap-satis-rapor-sube-etiket">{subeEtiket}</span>}
        </button>
      </div>

      <div className="ap-satis-rapor-alt-sag">
        <button type="button" className="ap-satis-rapor-aksiyon-tus" onClick={onYazdir}>
          Yazdır
        </button>
      </div>
    </footer>
  );
}
