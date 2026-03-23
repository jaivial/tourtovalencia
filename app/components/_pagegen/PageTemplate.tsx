/* eslint-disable react/prop-types */
import { useWindowSize } from "@uidotdev/usehooks";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Input } from "@heroui/input";
import EditableIndexSection5 from "./EditableIndexSection5";
import EditableSanJuanSection1 from "./EditableSanJuanSection1";
import EditableSanJuanSection2 from "./EditableSanJuanSection2";
import EditableSanJuanSection3 from "./EditableSanJuanSection3";
import EditableSanJuanSection4 from "./EditableSanJuanSection4";
import EditableSanJuanSection5 from "./EditableSanJuanSection5";
import EditableSanJuanSection6 from "./EditableSanJuanSection6";
import EditableCard from "~/components/_cards/EditableCard";
import { EditableTimelineFeature, TimelineDataType } from "~/components/_index/EditableTimelineFeature";
import { EditableCardType, IndexSection5Type, InfoRequestContactType, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type, sanJuansection4Type, sanJuanSection5Type, SanJuanSection6Type } from "~/data/data";
import { PublishModal } from "./PublishModal";
import { usePublishModal, usePageCreation } from "./PageTemplate.hooks";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { CountrySelect } from "~/components/ui/CountrySelect";
import { Textarea } from "~/components/ui/textarea";
import { SectionOrderEditor } from "./SectionOrderEditor";
import { SectionOrderItem } from "~/data/data";

export type PageTemplateProps = {
  status: "active" | "upcoming";
  onStatusChange?: (checked: boolean) => void;
  indexSection5Data?: IndexSection5Type;
  onIndexSection5Update?: (field: keyof IndexSection5Type, value: string) => void;
  section1Data?: sanJuanSection1Type;
  onSection1Update: (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string } | null) => void | Promise<void>;
  section2Data?: sanJuansection2Type;
  onSection2Update: (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string } | { enabled: boolean; src: string } | null) => void | Promise<void>;
  section3Data?: sanJuanSection3Type;
  onSection3ImageUpdate: (index: number, file: File) => void | Promise<void>;
  onSection3ImageRemove: (index: number) => void;
  section4Data?: sanJuansection4Type;
  onSection4Update: (field: keyof sanJuansection4Type, value: string | { enabled: boolean; src: string }) => void;
  section5Data?: sanJuanSection5Type;
  onSection5Update: (field: keyof sanJuanSection5Type, value: string | { enabled: boolean; src: string } | null) => void;
  onSection5ImageUpdate?: (file: File) => void | Promise<void>;
  onSection5ImageRemove?: () => void | Promise<void>;
  section6Data?: SanJuanSection6Type;
  onSection6Update: (field: keyof SanJuanSection6Type, value: string) => void;
  timelineData?: TimelineDataType;
  onTimelineUpdate?: (field: keyof TimelineDataType, value: string | Array<{title: string, description: string}>) => void;
  cardData?: EditableCardType;
  onCardUpdate?: (field: keyof EditableCardType, value: string | { file?: File; preview: string } | null) => void | Promise<void>;
  pageName: string;
  price: number;
  hasPrice: boolean;
  infoRequestContact: InfoRequestContactType;
  onPriceChange: (value: number) => void;
  onHasPriceChange: (checked: boolean) => void;
  onInfoRequestCountryChange: (countryCode: string) => void;
  onInfoRequestPhoneChange: (phoneNumber: string) => void;
  onInfoRequestMessageChange: (message: string) => void;
  onInfoRequestEmailChange: (email: string) => void;
  onInfoRequestEnablePhoneChange: (enabled: boolean) => void;
  onInfoRequestEnableEmailChange: (enabled: boolean) => void;
  isEditMode?: boolean;
  sectionOrderData?: SectionOrderItem[];
  onSectionOrderChange?: (sections: SectionOrderItem[]) => void;
  availableSections?: Array<{ id: string; label: string; items?: Array<{ id: string; label: string }> }>;
  minPeople?: number;
  maxPeople?: number;
  onMinPeopleChange?: (value: number) => void;
  onMaxPeopleChange?: (value: number) => void;
};

const PageTemplate: React.FC<PageTemplateProps> = ({ 
  status, 
  onStatusChange, 
  indexSection5Data, 
  onIndexSection5Update, 
  section1Data, 
  onSection1Update, 
  section2Data, 
  onSection2Update, 
  section3Data, 
  onSection3ImageUpdate, 
  onSection3ImageRemove, 
  section4Data, 
  onSection4Update, 
  section5Data, 
  onSection5Update, 
  onSection5ImageUpdate, 
  onSection5ImageRemove, 
  section6Data, 
  onSection6Update, 
  timelineData, 
  onTimelineUpdate,
  cardData,
  onCardUpdate,
  pageName, 
  price, 
  hasPrice,
  infoRequestContact,
  onPriceChange, 
  onHasPriceChange,
  onInfoRequestCountryChange,
  onInfoRequestPhoneChange,
  onInfoRequestMessageChange,
  onInfoRequestEmailChange,
  onInfoRequestEnablePhoneChange,
  onInfoRequestEnableEmailChange,
  isEditMode = false,
  sectionOrderData,
  onSectionOrderChange,
  availableSections,
  minPeople = 1,
  maxPeople = 10,
  onMinPeopleChange,
  onMaxPeopleChange
}) => {
  const size = useWindowSize();
  const { isModalOpen, closeModal } = usePublishModal();
  const { handleCreatePage, isCreating, error, statusMessage } = usePageCreation();
  const width = size.width ?? 0;
  const [loadingMessage, setLoadingMessage] = useState("Creando página...");

  // Add wrapper functions to handle async updates
  const handleSection1Update = async (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string } | null) => {
    try {
      console.log(`PageTemplate: Processing section1 update for field ${String(field)}:`, 
        typeof value === 'string'
          ? value
          : value && typeof value === 'object'
            ? `File: ${value.file?.name || 'none'}, Preview: ${value.preview.substring(0, 30)}...`
            : 'null');
      
      // Call the original onSection1Update
      await onSection1Update(field, value);
    } catch (error) {
      console.error(`PageTemplate: Error updating section1 field ${String(field)}:`, error);
    }
  };

  const handleSection2Update = async (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string } | { enabled: boolean; src: string } | null) => {
    try {
      if (typeof value === 'string') {
        console.log(`PageTemplate: Processing section2 update for field ${String(field)}:`, value);
      } else if (value && ('file' in value || 'preview' in value)) {
        const imgObj = value as { file?: File; preview: string };
        console.log(`PageTemplate: Processing section2 update for field ${String(field)}:`, 
          `File: ${imgObj.file?.name || 'none'}, Preview: ${imgObj.preview.substring(0, 30)}...`);
      } else if (value && 'enabled' in value && 'src' in value) {
        const lottieObj = value as { enabled: boolean; src: string };
        console.log(`PageTemplate: Processing section2 update for field ${String(field)}:`, 
          `Lottie: enabled=${lottieObj.enabled}, src=${lottieObj.src.substring(0, 30)}...`);
      } else {
        console.log(`PageTemplate: Processing section2 update for field ${String(field)}: null`);
      }
      
      // Call the original onSection2Update
      await onSection2Update(field, value);
    } catch (error) {
      console.error(`PageTemplate: Error updating section2 field ${String(field)}:`, error);
    }
  };

  // Add a wrapper function to convert File to base64 before passing to EditableSanJuanSection3
  const handleSection3ImageUpdate = async (index: number, file: File) => {
    try {
      console.log(`PageTemplate: Processing image update for index ${index}:`, file.name, file.type, file.size);
      
      // Call the original onSection3ImageUpdate with the File
      await onSection3ImageUpdate(index, file);
    } catch (error) {
      console.error(`PageTemplate: Error updating image at index ${index}:`, error);
    }
  };

  // Add a wrapper function for section5 image update
  const handleSection5ImageUpdate = async (file: File) => {
    try {
      console.log(`PageTemplate: Processing section5 image update:`, file.name, file.type, file.size);
      
      // Call the original onSection5ImageUpdate if provided
      if (onSection5ImageUpdate) {
        await onSection5ImageUpdate(file);
      }
    } catch (error) {
      console.error(`PageTemplate: Error updating section5 image:`, error);
    }
  };

  // Add a wrapper function for section5 image removal
  const handleSection5ImageRemove = async () => {
    try {
      console.log(`PageTemplate: Processing section5 image removal`);
      
      // Call the original onSection5ImageRemove if provided
      if (onSection5ImageRemove) {
        await onSection5ImageRemove();
      }
    } catch (error) {
      console.error(`PageTemplate: Error removing section5 image:`, error);
    }
  };

  // Add a wrapper function for card updates
  const handleCardUpdate = async (field: keyof EditableCardType, value: string | { file?: File; preview: string } | null) => {
    try {
      console.log(`PageTemplate: Processing card update for field ${String(field)}:`, 
        typeof value === 'string'
          ? value
          : value && typeof value === 'object'
            ? `File: ${value.file?.name || 'none'}, Preview: ${value.preview.substring(0, 30)}...`
            : 'null');
      
      // Call the original onCardUpdate if provided
      if (onCardUpdate) {
        await onCardUpdate(field, value);
      }
    } catch (error) {
      console.error(`PageTemplate: Error updating card field ${String(field)}:`, error);
    }
  };

  // Add a wrapper function for section4 updates
  const handleSection4Update = (field: keyof sanJuansection4Type, value: string | { enabled: boolean; src: string }) => {
    try {
      console.log(`PageTemplate: Processing section4 update for field ${String(field)}:`, 
        typeof value === 'string' ? value : 
        `Lottie: enabled=${value.enabled}, src=${value.src.substring(0, 30)}...`);
      
      // Call the original onSection4Update
      onSection4Update(field, value);
    } catch (error) {
      console.error(`PageTemplate: Error updating section4 field ${String(field)}:`, error);
    }
  };

  // Add a wrapper function for section5 updates
  const handleSection5Update = (field: keyof sanJuanSection5Type, value: string | { enabled: boolean; src: string } | null) => {
    try {
      console.log(`PageTemplate: Processing section5 update for field ${String(field)}:`, 
        typeof value === 'string' ? value : 
        value
          ? `Lottie: enabled=${value.enabled}, src=${value.src.substring(0, 30)}...`
          : 'null');
      
      // Call the original onSection5Update
      onSection5Update(field, value);
    } catch (error) {
      console.error(`PageTemplate: Error updating section5 field ${String(field)}:`, error);
    }
  };

  useEffect(() => {
    if (!isCreating) return;

    const messages = ["Creando página...", "Subiendo imágenes...", "Traduciendo texto..."];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingMessage(messages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isCreating]);

  const handleCreatePageClick = () => {
    const section6Content = hasPrice || !section6Data
      ? section6Data
      : {
          ...section6Data,
          button: "Solicitar información",
        };

    const content = {
      indexSection5: indexSection5Data,
      section1: section1Data,
      section2: section2Data,
      section3: section3Data,
      section4: section4Data,
      section5: section5Data,
      section6: section6Content,
      timeline: timelineData,
      card: cardData,
      price: hasPrice ? price : 0,
      hasPrice,
      minPeople,
      maxPeople,
      infoRequestContact,
    };

    handleCreatePage({
      name: pageName,
      content,
      status
    });
  };

  return (
    <div className="space-y-6">
      <div className="w-full min-h-screen bg-gray-100 overflow-x-hidden">
        <div className="w-full mx-auto p-4 mb-8">
          {sectionOrderData && onSectionOrderChange && availableSections && (
            <div className="mb-6">
              <SectionOrderEditor
                sections={sectionOrderData}
                onSectionsChange={onSectionOrderChange}
                availableSections={availableSections}
              />
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-6 p-8 bg-white rounded-lg shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900">{pageName}</h2>

            <div className="max-w-2xl text-center space-y-2 text-gray-600">
              <p className="text-sm">Para editar el contenido, haz clic en cualquier texto que desees modificar.</p>
              <p className="text-sm">Para cambiar las imágenes, pasa el cursor sobre ellas y haz clic en el icono de la cámara.</p>
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <div className="flex flex-col items-center gap-3">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  {status === "active" ? "Activo" : "Próximamente"}
                </Label>
                <Switch id="status" checked={status === "active"} onCheckedChange={onStatusChange} />
              </div>
              
              <div className="flex flex-col w-full sm:w-auto items-center">
                <Label htmlFor="has-price" className="text-sm font-medium text-gray-700 mb-1 text-center">
                  {hasPrice ? "Con precio" : "Sin precio"}
                </Label>
                <Switch id="has-price" checked={hasPrice} onCheckedChange={onHasPriceChange} />
              </div>

              <div className="flex flex-col w-full sm:w-auto items-center">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-1 text-center">
                  Precio
                </Label>
                <div className="relative flex justify-center">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={Number.isFinite(price) ? price.toString() : "0"}
                    onChange={(e) => {
                      const parsed = Number.parseFloat(e.target.value);
                      onPriceChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
                    }}
                    disabled={!hasPrice}
                    className="w-full sm:w-32 pl-3 pr-7 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    placeholder="0.00"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>

              <div className="flex flex-col w-full sm:w-auto items-center">
                <Label htmlFor="min-people" className="text-sm font-medium text-gray-700 mb-1 text-center">
                  Mín. personas
                </Label>
                <Input
                  id="min-people"
                  type="number"
                  min="1"
                  max={maxPeople}
                  value={minPeople.toString()}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    onMinPeopleChange?.(Math.min(val, maxPeople));
                  }}
                  className="w-full sm:w-20"
                />
              </div>

              <div className="flex flex-col w-full sm:w-auto items-center">
                <Label htmlFor="max-people" className="text-sm font-medium text-gray-700 mb-1 text-center">
                  Máx. personas
                </Label>
                <Input
                  id="max-people"
                  type="number"
                  min={minPeople}
                  max="100"
                  value={maxPeople.toString()}
                  onChange={(e) => onMaxPeopleChange?.(Math.max(minPeople, parseInt(e.target.value) || 10))}
                  className="w-full sm:w-20"
                />
              </div>

              {!hasPrice && (
                <div className="w-full max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <p className="text-sm font-medium text-amber-800">
                    Este tour no se podrá reservar. Solo se podrá solicitar información.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-md border border-amber-200 bg-white px-3 py-2">
                      <Label htmlFor="enable-info-phone" className="text-sm text-gray-700">
                        Canal teléfono/WhatsApp
                      </Label>
                      <Switch
                        id="enable-info-phone"
                        checked={infoRequestContact.enablePhone}
                        onCheckedChange={onInfoRequestEnablePhoneChange}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-amber-200 bg-white px-3 py-2">
                      <Label htmlFor="enable-info-email" className="text-sm text-gray-700">
                        Canal email
                      </Label>
                      <Switch
                        id="enable-info-email"
                        checked={infoRequestContact.enableEmail}
                        onCheckedChange={onInfoRequestEnableEmailChange}
                      />
                    </div>
                  </div>

                  {infoRequestContact.enableEmail && (
                    <div className="space-y-2">
                      <Label htmlFor="info-email" className="text-sm font-medium text-gray-700">
                        Email para solicitudes
                      </Label>
                      <Input
                        id="info-email"
                        type="email"
                        value={infoRequestContact.email}
                        onChange={(e) => onInfoRequestEmailChange(e.target.value)}
                        placeholder="tourtovalencia@gmail.com"
                        className="w-full"
                      />
                    </div>
                  )}

                  {infoRequestContact.enablePhone && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="info-country" className="text-sm font-medium text-gray-700">
                          País / prefijo
                        </Label>
                        <CountrySelect
                          value={infoRequestContact.countryCode}
                          onChange={({ countryCode }) => onInfoRequestCountryChange(countryCode)}
                          placeholder="Selecciona un país"
                          language="es"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="info-phone" className="text-sm font-medium text-gray-700">
                          Número de WhatsApp
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="info-dial-code"
                            type="text"
                            readOnly
                            value={infoRequestContact.dialCode}
                            className="w-24 bg-gray-100 text-center"
                          />
                          <Input
                            id="info-phone"
                            type="tel"
                            value={infoRequestContact.phoneNumber}
                            onChange={(e) => onInfoRequestPhoneChange(e.target.value.replace(/\D/g, ""))}
                            placeholder="Número"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="info-message" className="text-sm font-medium text-gray-700">
                          Mensaje predefinido de WhatsApp
                        </Label>
                        <Textarea
                          id="info-message"
                          value={infoRequestContact.message}
                          onChange={(e) => onInfoRequestMessageChange(e.target.value)}
                          placeholder="Escribe el mensaje que se abrirá en WhatsApp"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12">
          {indexSection5Data && onIndexSection5Update && <EditableIndexSection5 width={width} data={indexSection5Data} onUpdate={onIndexSection5Update} />}

          {section1Data && <EditableSanJuanSection1 width={width} data={section1Data} onUpdate={handleSection1Update} />}

          {section2Data && <EditableSanJuanSection2 width={width} data={section2Data} onUpdate={handleSection2Update} />}

          {section3Data && <EditableSanJuanSection3 width={width} data={section3Data} onUpdate={handleSection3ImageUpdate} onRemove={onSection3ImageRemove} />}

          {section4Data && <EditableSanJuanSection4 width={width} data={section4Data} onUpdate={handleSection4Update} />}

          {section5Data && <EditableSanJuanSection5 width={width} data={section5Data} onUpdate={handleSection5Update} onImageUpdate={handleSection5ImageUpdate} onImageRemove={handleSection5ImageRemove} />}

          {timelineData && onTimelineUpdate && (
            <EditableTimelineFeature 
              timelineData={timelineData}
              onTimelineUpdate={onTimelineUpdate}
            />
          )}

          {section6Data && (
            <EditableSanJuanSection6
              width={width}
              data={hasPrice ? section6Data : { ...section6Data, button: "Solicitar información" }}
              onUpdate={onSection6Update}
            />
          )}
          
          {/* Editable Card Section */}
          {cardData && onCardUpdate && (
            <div className="w-full py-12 bg-blue-50">
              <div className="w-[95%] max-w-[1280px] mx-auto">
                <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
                  {status === "active" ? "Vista previa de la tarjeta del tour" : "Vista previa de la tarjeta de próximamente"}
                </h2>
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <EditableCard
                      width={width}
                      data={cardData}
                      price={price}
                      hasPrice={hasPrice}
                      status={status}
                      onUpdate={handleCardUpdate}
                      isEditMode={isEditMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isCreating && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 h-[100vh] w-[100vw] mt-0" style={{ marginTop: '0px' }}>
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4 max-w-md w-full mx-4">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-700 font-medium text-lg">{statusMessage || loadingMessage}</span>
            </div>
            <p className="text-gray-500 text-sm text-center">Por favor, espere mientras procesamos su solicitud. Esto puede tardar unos momentos.</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-4 mt-8 w-full px-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        {!isEditMode && (
          <div className="flex justify-center pb-24">
            <Button 
              onClick={handleCreatePageClick} 
              disabled={isCreating || !pageName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? 'Creando...' : 'Crear Página'}
            </Button>
          </div>
        )}
      </div>

      <PublishModal
        isOpen={isModalOpen}
        onConfirm={() => {
          // Will implement publish logic next
          closeModal();
        }}
        onCancel={closeModal}
        translations={{
          title: "Confirmar publicación",
          description: "¿Seguro que todos los datos están correctos y quieres proceder a publicar la página?",
          confirmText: "Sí, publicar",
          cancelText: "Cancelar",
        }}
      />

    </div>
  );
};

export default PageTemplate;
