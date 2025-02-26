import { json } from "@remix-run/server-runtime";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import PageTemplate from "~/components/_pagegen/PageTemplate";
import { useEditPage } from "./admin.dashboard.pagegen.edit.$slug.hooks";
import { getPageBySlug } from "~/utils/page.server";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { motion } from "framer-motion";
import type { IndexSection5Type, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type, sanJuansection4Type, sanJuanSection5Type, SanJuanSection6Type } from "~/data/data";
import type { TimelineDataType } from "~/components/_index/EditableTimelineFeature";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;
  
  if (!slug) {
    throw new Response("Slug is required", { status: 400 });
  }

  try {
    const page = await getPageBySlug(slug);
    
    if (!page) {
      throw new Response("Page not found", { status: 404 });
    }

    return json({ page });
  } catch (error) {
    console.error("Error loading page:", error);
    throw new Response("Failed to load page", { status: 500 });
  }
};

export default function EditPageRoute() {
  const { page } = useLoaderData<typeof loader>();
  const {
    pageName,
    status,
    price,
    section1Data,
    section2Data,
    section3Data,
    section4Data,
    section5Data,
    section6Data,
    indexSection5Data,
    timelineData,
    isSaving,
    saveError,
    saveSuccess,
    setPageName,
    handleStatusChange,
    handlePriceChange,
    handleSection1Update,
    handleSection2Update,
    handleSection3ImageUpdate,
    handleSection3ImageRemove,
    handleSection4Update,
    handleSection5Update,
    handleSection6Update,
    handleIndexSection5Update,
    handleTimelineUpdate,
    handleSavePage,
    handleCancel
  } = useEditPage(page);

  // Adapter functions to match PageTemplate prop types
  const adaptStatusChange = (checked: boolean) => {
    handleStatusChange(checked ? 'active' : 'upcoming');
  };

  const adaptSection1Update = (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => {
    const updatedData = { ...section1Data, [field]: value };
    handleSection1Update(updatedData);
  };

  const adaptSection2Update = (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => {
    const updatedData = { ...section2Data, [field]: value };
    handleSection2Update(updatedData);
  };

  const adaptSection3ImageUpdate = (index: number, file: File) => {
    // Convert File to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleSection3ImageUpdate(index, e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const adaptSection4Update = (field: keyof sanJuansection4Type, value: string) => {
    const updatedData = { ...section4Data, [field]: value };
    handleSection4Update(updatedData);
  };

  const adaptSection5Update = (field: keyof sanJuanSection5Type, value: string) => {
    const updatedData = { ...section5Data, [field]: value };
    handleSection5Update(updatedData);
  };

  const adaptSection6Update = (field: keyof SanJuanSection6Type, value: string) => {
    const updatedData = { ...section6Data, [field]: value };
    handleSection6Update(updatedData);
  };

  const adaptIndexSection5Update = (field: keyof IndexSection5Type, value: string) => {
    const updatedData = { ...indexSection5Data, [field]: value };
    handleIndexSection5Update(updatedData);
  };

  const adaptTimelineUpdate = (field: keyof TimelineDataType, value: string | Array<{title: string, description: string}>) => {
    const updatedData = { ...timelineData, [field]: value };
    handleTimelineUpdate(updatedData);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center p-6">
          <Link to="/admin/dashboard/pagegen/editpage" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Volver</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Editar Tour</h1>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePage}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Guardando...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>

        {saveError && (
          <Alert variant="destructive" className="mb-4 mx-6">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert className="mb-4 mx-6 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>¡Tour actualizado con éxito! Redirigiendo...</AlertDescription>
          </Alert>
        )}

        <div className="p-6 bg-white rounded-lg shadow mb-6 mx-6">
          <div className="mb-4">
            <Label htmlFor="page-name" className="text-lg font-medium text-gray-700">
              Nombre del Tour
            </Label>
            <Input 
              id="page-name" 
              value={pageName} 
              onChange={(e) => setPageName(e.target.value)} 
              className="mt-1 block w-full text-lg p-3" 
              placeholder="Ingrese el nombre del tour..." 
            />
          </div>
        </div>

        <div className="w-full">
          <PageTemplate
            status={status}
            onStatusChange={adaptStatusChange}
            pageName={pageName}
            price={price}
            onPriceChange={handlePriceChange}
            indexSection5Data={indexSection5Data}
            onIndexSection5Update={adaptIndexSection5Update}
            section1Data={section1Data}
            onSection1Update={adaptSection1Update}
            section2Data={section2Data}
            onSection2Update={adaptSection2Update}
            section3Data={section3Data}
            onSection3ImageUpdate={adaptSection3ImageUpdate}
            onSection3ImageRemove={handleSection3ImageRemove}
            section4Data={section4Data}
            onSection4Update={adaptSection4Update}
            section5Data={section5Data}
            onSection5Update={adaptSection5Update}
            section6Data={section6Data}
            onSection6Update={adaptSection6Update}
            timelineData={timelineData}
            onTimelineUpdate={adaptTimelineUpdate}
            isEditMode={true}
          />
        </div>
      </div>
    </div>
  );
} 