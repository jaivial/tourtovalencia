import { useState } from 'react';
import { useFetcher } from '@remix-run/react';

export const usePublishModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return {
    isModalOpen,
    openModal,
    closeModal
  };
};

export const usePageCreation = () => {
  const fetcher = useFetcher();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePage = async (pageData: {
    name: string;
    content: Record<string, any>;
  }) => {
    setIsCreating(true);
    try {
      fetcher.submit(
        { 
          ...pageData,
          content: JSON.stringify(pageData.content)
        },
        { 
          method: 'post',
          action: '/api/pages/create'
        }
      );
    } catch (error) {
      console.error('Error creating page:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    handleCreatePage,
    isCreating,
    status: fetcher.state
  };
};
