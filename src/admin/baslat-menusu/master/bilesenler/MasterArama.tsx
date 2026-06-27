import { formInputSinifi } from '@/formlar/FormAlani';

interface MasterAramaProps {
  placeholder: string;
  value: string;
  onChange: (deger: string) => void;
  'aria-label'?: string;
}

/** Master ekranlarında arama — ap-seo-arama padding:0 sorununu önler */
export function MasterArama({ placeholder, value, onChange, 'aria-label': ariaLabel }: MasterAramaProps) {
  return (
    <input
      type="search"
      className={`${formInputSinifi} ap-master-arama`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel ?? placeholder}
    />
  );
}
