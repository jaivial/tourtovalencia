import React, { useEffect, useRef, useState } from 'react';

type EditableTextProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
};

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  placeholder = 'Click to edit...',
  className = '',
  multiline = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at the end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(inputRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (inputRef.current) {
      onChange(inputRef.current.innerText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      handleBlur();
    }
  };

  return (
    <div
      ref={inputRef}
      contentEditable={true}
      onFocus={() => setIsEditing(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-h-[1.5em] ${
        !value ? 'text-gray-400' : ''
      } ${className}`}
      suppressContentEditableWarning={true}
    >
      {value || placeholder}
    </div>
  );
};

export default EditableText;
