import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../utils/cn";
import { countries, type Country } from "../../data/countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: { country: string; countryCode: string }) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  className?: string;
  language: 'en' | 'es';
}

export const CountrySelect = ({
  value,
  onChange,
  placeholder = "Select country",
  searchPlaceholder = "Search country...",
  notFoundText = "No country found.",
  className,
  language = 'en',
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Find the selected country on mount or when value changes
  useEffect(() => {
    if (value) {
      const country = countries.find((c) => c.code === value);
      setSelectedCountry(country || null);
    }
  }, [value]);

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    onChange({ 
      country: country.name[language], 
      countryCode: country.code 
    });
    setOpen(false);
  };

  // Display the flag and name for the selected country in the button
  const displayValue = selectedCountry ? (
    <div className="flex items-center">
      <span className="mr-2">{selectedCountry.flag}</span>
      <span>{selectedCountry.name[language]}</span>
      <span className="ml-2 text-muted-foreground">{selectedCountry.dialCode}</span>
    </div>
  ) : (
    placeholder
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{notFoundText}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.code}
                value={country.name[language]}
                onSelect={() => handleSelect(country)}
              >
                <div className="flex items-center">
                  <span className="mr-2">{country.flag}</span>
                  <span>{country.name[language]}</span>
                  <span className="ml-2 text-muted-foreground">{country.dialCode}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedCountry?.code === country.code ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 