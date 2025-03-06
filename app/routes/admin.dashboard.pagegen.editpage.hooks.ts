import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { Page } from "~/utils/db.schema.server";

export const useEditPageList = () => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirmation = (page: Page) => {
    setPageToDelete(page);
    setIsDeleteDialogOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setPageToDelete(null);
  };

  const confirmDelete = async () => {
    if (!pageToDelete?._id) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/pages/delete/${pageToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the page to show updated list
        navigate('.', { replace: true });
      } else {
        console.error('Failed to delete page');
        setDeleteError('Failed to delete page. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      setDeleteError('Failed to delete page. Please try again.');
    } finally {
      setIsDeleting(false);
      cancelDelete();
    }
  };

  return {
    isDeleteDialogOpen,
    pageToDelete,
    isDeleting,
    deleteError,
    handleDeleteConfirmation,
    confirmDelete,
    cancelDelete,
  };
}; 