import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { LegalSection } from "~/hooks/useLegalPageHooks";

interface LegalPageUIProps {
  termsOfUse: LegalSection;
  legalNotice: LegalSection;
  dataProtection: LegalSection;
  cookies: LegalSection;
  payments: LegalSection;
  translations: {
    pageTitle: string;
    pageDescription: string;
    tabs: {
      termsOfUse: string;
      legalNotice: string;
      dataProtection: string;
      cookies: string;
      payments: string;
    };
    readCarefully: string;
    lastUpdated: string;
    contactUs: string;
    contactEmail: string;
  };
}

const LegalPageUI: React.FC<LegalPageUIProps> = ({
  termsOfUse,
  legalNotice,
  dataProtection,
  cookies,
  payments,
  translations,
}) => {
  const [activeTab, setActiveTab] = useState("terms");

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {translations.pageTitle}
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {translations.pageDescription}
          </p>
        </div>

        <Tabs
          defaultValue="terms"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-4xl">
              <TabsTrigger value="terms" className="text-sm md:text-base">
                {translations.tabs.termsOfUse}
              </TabsTrigger>
              <TabsTrigger value="legal" className="text-sm md:text-base">
                {translations.tabs.legalNotice}
              </TabsTrigger>
              <TabsTrigger value="data" className="text-sm md:text-base">
                {translations.tabs.dataProtection}
              </TabsTrigger>
              <TabsTrigger value="cookies" className="text-sm md:text-base">
                {translations.tabs.cookies}
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-sm md:text-base">
                {translations.tabs.payments}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <TabsContent value="terms" className="p-0">
              <LegalSectionCard section={termsOfUse} readCarefully={translations.readCarefully} />
            </TabsContent>

            <TabsContent value="legal" className="p-0">
              <LegalSectionCard section={legalNotice} readCarefully={translations.readCarefully} />
            </TabsContent>

            <TabsContent value="data" className="p-0">
              <LegalSectionCard section={dataProtection} readCarefully={translations.readCarefully} />
            </TabsContent>

            <TabsContent value="cookies" className="p-0">
              <LegalSectionCard section={cookies} readCarefully={translations.readCarefully} />
            </TabsContent>

            <TabsContent value="payments" className="p-0">
              <LegalSectionCard section={payments} readCarefully={translations.readCarefully} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>{translations.lastUpdated} {new Date().toLocaleDateString()}</p>
          <p className="mt-2">
            {translations.contactUs}{" "}
            <a href="mailto:tourtovalencia@gmail.com" className="text-blue-600 hover:underline">
              {translations.contactEmail}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

interface LegalSectionCardProps {
  section: LegalSection;
  readCarefully: string;
}

const LegalSectionCard: React.FC<LegalSectionCardProps> = ({ section, readCarefully }) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">{section.title}</CardTitle>
        <CardDescription className="text-gray-600">
          {readCarefully}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] md:h-[50vh] pr-4">
          <div className="space-y-6">
            {section.content.map((paragraph, index) => (
              <div key={index} className="text-gray-700">
                {paragraph.includes(":") && !paragraph.startsWith("Contact") ? (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {paragraph.split(":")[0]}:
                    </h3>
                    <p className="text-gray-700">{paragraph.split(":")[1]}</p>
                  </>
                ) : (
                  <p>{paragraph}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LegalPageUI; 