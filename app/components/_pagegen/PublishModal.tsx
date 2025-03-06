import { useCallback } from 'react';

type PublishModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  translations: {
    confirmText: string;
    cancelText: string;
    title: string;
    description: string;
  };
};

export const PublishModal = ({ 
  isOpen,
  onConfirm,
  onCancel,
  translations
}: PublishModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-60">
        <h3 className="text-lg font-semibold mb-4">{translations.title}</h3>
        <p className="mb-6 text-gray-600">{translations.description}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {translations.cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {translations.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
