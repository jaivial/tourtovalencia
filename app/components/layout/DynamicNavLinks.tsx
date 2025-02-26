import { Link } from "@remix-run/react";
import type { Page } from "~/utils/db.schema.server";
import { useLanguageContext } from "~/providers/LanguageContext";

interface DynamicNavLinksProps {
  pages: Page[];
  onLinkClick?: () => void;
  className?: string;
}

export function DynamicNavLinks({ pages, onLinkClick, className = "" }: DynamicNavLinksProps) {
  const { state } = useLanguageContext();
  const currentLanguage = state.currentLanguage === "English" ? "en" : "es";

  return (
    <>
      {pages.map((page) => {
        // Get the appropriate tour name based on the current language
        let displayName = page.name;

        // If the page has content with a title in the current language, use that
        if (page.content && page.content[currentLanguage] && page.content[currentLanguage].title) {
          displayName = page.content[currentLanguage].title as string;
        }

        return (
          <Link
            key={page.slug}
            to={`/pages/${page.slug}`}
            onClick={onLinkClick}
            className={`pl-4 text-blue-50 hover:text-blue-200 transition-colors font-sans text-lg block py-2 ${className}`}
          >
            {displayName}
          </Link>
        );
      })}
    </>
  );
}
