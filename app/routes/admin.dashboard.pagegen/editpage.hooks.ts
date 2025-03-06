import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { Page } from "~/utils/db.schema.server";

export const useEditPageList = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const navigate = useNavigate();

  const handleDeleteConfirmation = (page: Page) => {
    setPageToDelete(page);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pageToDelete?._id) return;
    
    try {
      const response = await fetch(`/api/pages/delete/${pageToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the page to show updated list
        navigate('.', { replace: true });
      } else {
        console.error('Failed to delete page');
        // You could add toast notification here
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    } finally {
      cancelDelete();
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setPageToDelete(null);
  };

  return {
    isDeleteDialogOpen,
    pageToDelete,
    handleDeleteConfirmation,
    confirmDelete,
    cancelDelete,
  };
}; 