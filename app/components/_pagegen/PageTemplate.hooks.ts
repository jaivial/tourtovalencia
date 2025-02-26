import { useState, useEffect } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';

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

const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const processImages = async (content: Record<string, any>): Promise<Record<string, any>> => {
  const processObject = async (obj: any): Promise<any> => {
    if (!obj || typeof obj !== 'object') return obj;

    const result: any = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        if ('preview' in value && value.file instanceof File) {
          // Convert File to base64
          result[key] = {
            ...value,
            preview: await convertImageToBase64(value.file)
          };
        } else if (Array.isArray(value) && value.some(item => item?.source instanceof File)) {
          // Handle array of images (like in section3)
          result[key] = await Promise.all(
            value.map(async (item) => {
              if (item?.source instanceof File) {
                return {
                  ...item,
                  source: await convertImageToBase64(item.source)
                };
              }
              return item;
            })
          );
        } else {
          // Recursively process nested objects
          result[key] = await processObject(value);
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return processObject(content);
};

export const usePageCreation = () => {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePage = async (pageData: {
    name: string;
    content: Record<string, any>;
    status: 'active' | 'upcoming';
  }) => {
    setIsCreating(true);
    setError(null);
    
    try {
      // Process images before sending to server
      const processedContent = await processImages(pageData.content);
      
      // Ensure price is included at the top level of the content object
      const contentWithPrice = {
        ...processedContent,
        price: processedContent.price || 0
      };
      
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
