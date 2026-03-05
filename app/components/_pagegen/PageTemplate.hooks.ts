import { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { useImageProcessing } from '../../hooks/useImageProcessing';

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

/**
 * STRICT interface for page data
 */
export interface PageData {
  name: string;
  content: Record<string, unknown>;
  status: 'active' | 'upcoming';
}

type CreatePageStartResponse = {
  success?: boolean;
  page?: { slug: string };
  jobId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  error?: string;
};

type CreatePageJobStatusResponse = {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  slug?: string;
  error?: string;
};

const MAX_CREATE_PAYLOAD_BYTES = 18 * 1024 * 1024;
const POLL_INTERVAL_MS = 3000;
const POLL_RETRY_INTERVAL_MS = 5000;
const MAX_POLL_RETRIES = 5;

function getPayloadSizeBytes(payload: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(payload).length;
  }
  return payload.length;
}

async function parseJsonResponse<T extends Record<string, unknown>>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('La sesión expiró o el servidor devolvió una respuesta no válida.');
  }

  return response.json() as Promise<T>;
}

export const usePageCreation = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [createJobId, setCreateJobId] = useState<string | null>(null);
  const { processImages } = useImageProcessing();

  const handleCreatePage = async (pageData: PageData) => {
    setIsCreating(true);
    setError(null);
    setStatusMessage('Preparando imágenes...');
    let startedBackgroundJob = false;
    
    try {
      const processedContent = await processImages(pageData.content);
      const normalizedHasPrice = typeof processedContent.hasPrice === 'boolean' ? processedContent.hasPrice : true;
      const normalizedPrice =
        typeof processedContent.price === 'number' && Number.isFinite(processedContent.price) && processedContent.price >= 0
          ? processedContent.price
          : 0;
      
      const contentWithPrice = {
        ...processedContent,
        hasPrice: normalizedHasPrice,
        price: normalizedHasPrice ? normalizedPrice : 0,
      };

      const serializedContent = JSON.stringify(contentWithPrice);
      const payloadSizeBytes = getPayloadSizeBytes(serializedContent);
      if (payloadSizeBytes > MAX_CREATE_PAYLOAD_BYTES) {
        const payloadSizeMb = (payloadSizeBytes / (1024 * 1024)).toFixed(2);
        throw new Error(
          `El contenido del tour pesa ${payloadSizeMb}MB. Reduce el tamaño o número de imágenes antes de crear el tour.`,
        );
      }
      
      const formData = new FormData();
      formData.append('name', pageData.name);
      formData.append('content', serializedContent);
      formData.append('status', pageData.status);
      formData.append('background', 'true');
      
      setStatusMessage('Enviando solicitud...');

      const response = await fetch('/api/pages/create', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      if (response.status === 413) {
        throw new Error(
          'El servidor rechazó la creación por tamaño (413). Reduce el tamaño o número de imágenes e inténtalo de nuevo.',
        );
      }

      const data = await parseJsonResponse<CreatePageStartResponse>(response);
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'No se pudo iniciar la creación del tour.');
      }

      if (typeof data.jobId === 'string' && data.jobId) {
        startedBackgroundJob = true;
        setCreateJobId(data.jobId);
        setStatusMessage(data.message || 'Procesando en segundo plano...');
        return;
      }

      if (data.page?.slug) {
        setStatusMessage('Tour creado correctamente');
        navigate(`/pages/${data.page.slug}`);
        return;
      }

      throw new Error('No se recibió confirmación válida de creación del tour.');
    } catch (error) {
      console.error('Error creating page:', error);
      setError(error instanceof Error ? error.message : 'Error creating page. Please try again.');
      setStatusMessage(null);
    } finally {
      if (!startedBackgroundJob) {
        setIsCreating(false);
      }
    }
  };

  useEffect(() => {
    if (!createJobId) {
      return;
    }

    let isCancelled = false;
    let timeoutId: number | undefined;
    let retries = 0;

    const pollCreateStatus = async () => {
      if (isCancelled) {
        return;
      }

      try {
        const response = await fetch(`/api/pages/create?jobId=${encodeURIComponent(createJobId)}`, {
          credentials: 'same-origin',
        });

        const data = await parseJsonResponse<CreatePageJobStatusResponse>(response);
        if (!response.ok) {
          throw new Error(data.error || 'No se pudo verificar el estado del tour.');
        }

        retries = 0;

        if (data.status === 'completed') {
          setCreateJobId(null);
          setIsCreating(false);
          setStatusMessage(null);

          if (data.slug) {
            navigate(`/pages/${data.slug}`);
            return;
          }

          setError('El tour terminó de crearse, pero no devolvió un slug válido.');
          return;
        }

        if (data.status === 'failed') {
          setCreateJobId(null);
          setIsCreating(false);
          setStatusMessage(null);
          setError(data.error || data.message || 'Error al crear el tour.');
          return;
        }

        setStatusMessage(data.message || 'Procesando en segundo plano...');
        timeoutId = window.setTimeout(pollCreateStatus, POLL_INTERVAL_MS);
      } catch (error) {
        console.error('Error polling page creation status:', error);
        retries += 1;

        if (retries <= MAX_POLL_RETRIES) {
          setStatusMessage('Reconectando con el servidor...');
          timeoutId = window.setTimeout(pollCreateStatus, POLL_RETRY_INTERVAL_MS);
          return;
        }

        setCreateJobId(null);
        setIsCreating(false);
        setStatusMessage(null);
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo verificar el estado de creación del tour.',
        );
      }
    };

    pollCreateStatus();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [createJobId, navigate]);

  return {
    handleCreatePage,
    isCreating,
    error,
    statusMessage,
    status: isCreating ? (createJobId ? 'processing' : 'submitting') : 'idle',
  };
};
