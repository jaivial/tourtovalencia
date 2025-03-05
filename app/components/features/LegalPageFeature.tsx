import React from "react";
import { useLegalPageContext } from "~/context/LegalPageContext";
import LegalPageUI from "~/components/ui/LegalPageUI";

const LegalPageFeature: React.FC = () => {
  // Get the states from the context
  const { states } = useLegalPageContext();
  const { legalContent } = states;

  return (
    <LegalPageUI 
      termsOfUse={legalContent.termsOfUse}
      legalNotice={legalContent.legalNotice}
      dataProtection={legalContent.dataProtection}
      cookies={legalContent.cookies}
      payments={legalContent.payments}
    />
  );
};

export default LegalPageFeature; 