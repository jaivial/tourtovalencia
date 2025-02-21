import { Link } from "@remix-run/react";
import type { Page } from "~/utils/db.schema.server";

interface DynamicNavLinksProps {
  pages: Page[];
  onLinkClick?: () => void;
  className?: string;
}

export function DynamicNavLinks({ pages, onLinkClick, className = "" }: DynamicNavLinksProps) {
  return (
    <>
      {pages.map((page) => (
        <Link
          key={page.slug}
          to={`/pages/${page.slug}`}
          onClick={onLinkClick}
          className={`pl-4 text-blue-50 hover:text-blue-200 transition-colors font-sans text-lg block py-2 ${className}`}
        >
          {page.name}
        </Link>
      ))}
    </>
  );
}
