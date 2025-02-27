import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { countries, type Country } from "../../data/countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: { country: string; countryCode: string }) => void;
  placeholder?: string;
  className?: string;
  language: 'en' | 'es';
}

export const CountrySelect = ({
  value,
  onChange,
  placeholder = "Select country",
  className,
  language = 'en',
}: CountrySelectProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  
  // Find the selected country on mount or when value changes
  useEffect(() => {
    if (value) {
      const country = countries.find((c) => c.code === value);
      setSelectedCountry(country || null);
    }
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const country = countries.find((c) => c.code === countryCode);
    
    if (country) {
      setSelectedCountry(country);
      onChange({ 
        country: country.name[language], 
        countryCode: country.code 
      });
    }
  };

  return (
    <div className={cn("relative", className)}>
      <select
        value={value || ""}
        onChange={handleSelectChange}
        className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
        aria-label={placeholder}
      >
        {!selectedCountry && <option value="" disabled>{placeholder}</option>}
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.name[language]} ({country.dialCode})
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}; 