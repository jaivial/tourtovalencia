import { useState, useEffect } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { useImageProcessing } from '../../hooks/useImageProcessing';
import type { 
  IndexSection5Type, 
  sanJuanSection1Type, 
  sanJuanSection3Type, 
  sanJuansection2Type, 
  sanJuansection4Type, 
  sanJuanSection5Type, 
  SanJuanSection6Type 
} from '~/data/data';
import type { TimelineDataType } from '~/components/_index/EditableTimelineFeature';

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
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { processImages } = useImageProcessing();

  const handleCreatePage = async (pageData: {
    name: string;
    content: Record<string, any>;
    status: 'active' | 'upcoming';
  }) => {
    setIsCreating(true);
    setError(null);
    
    try {
      // Process images before sending to server using the new hook
      const processedContent = await processImages(pageData.content);
      
      // Ensure price is included at the top level of the content object
      const contentWithPrice = {
        ...processedContent,
        price: processedContent.price || 0
      };
      
      console.log('Processed content:', JSON.stringify(contentWithPrice).slice(0, 200) + '...');
      
      fetcher.submit(
        { 
          name: pageData.name,
          content: JSON.stringify(contentWithPrice),
          status: pageData.status
        },
        { 
          method: 'post',
          action: '/api/pages/create'
        }
      );
    } catch (error) {
      console.error('Error creating page:', error);
      setError('Error creating page. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (fetcher.data?.page?.slug && !fetcher.state.submitting) {
      // Navigate to the newly created page
      navigate(`/pages/${fetcher.data.page.slug}`);
    }
  }, [fetcher.data, fetcher.state, navigate]);

  return {
    handleCreatePage,
    isCreating: isCreating || fetcher.state === 'submitting',
    error,
    status: fetcher.state
  };
};
