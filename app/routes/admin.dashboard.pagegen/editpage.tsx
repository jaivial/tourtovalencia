import { json } from "@remix-run/server-runtime";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowLeftIcon, PencilIcon, TrashIcon, EyeIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getAllPages } from "~/utils/page.server";
import type { Page } from "~/utils/db.schema.server";
import { useEditPageList } from "./admin.dashboard.pagegen.editpage.hooks";
import { motion } from "framer-motion";

export const loader = async () => {
  try {
    const pages = await getAllPages();
    return json({ pages });
  } catch (error) {
    console.error("Error loading pages:", error);
    return json({ pages: [], error: "Failed to load pages" });
  }
};

export default function EditPageRoute() {
  const { pages } = useLoaderData<typeof loader>();
  const { 
    handleDeleteConfirmation, 
    isDeleteDialogOpen, 
    pageToDelete, 
    confirmDelete, 
    cancelDelete 
  } = useEditPageList();

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/admin/dashboard/pagegen" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Volver</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tours</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Tours Existentes</h2>
            
            {pages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No hay tours disponibles</p>
                <Link to="/admin/dashboard/pagegen">
                  <Button>Crear Nuevo Tour</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Creación
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pages.map((page: Page) => (
                      <tr key={page._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{page.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">/pages/{page.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            page.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {page.status === 'active' ? 'Activo' : 'Próximamente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(page.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link to={`/pages/${page.slug}`} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">Ver</span>
                              </Button>
                            </Link>
                            <Link to={`/admin/dashboard/pagegen/edit/${page.slug}`}>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleDeleteConfirmation(page)}
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {isDeleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar el tour "{pageToDelete?.name}"? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={cancelDelete}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 