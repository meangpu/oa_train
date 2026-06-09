import useGlobalModal from "../services/GlobalModal";
import React from "react";

const Modal: React.FC = () => {
  const {
    isOpen,
    title,
    content,
    hideModal,
    closeBtnClass,
    closeOnClickEmpty,
  } = useGlobalModal();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnClickEmpty) return;
    if (e.target === e.currentTarget) {
      hideModal();
    }
  };

  return (
    <div>
      {isOpen && (
        <div
          className='fixed top-0 bottom-0 right-0 left-0 bg-black-overlay flex-center z-100'
          onClick={handleBackdropClick}
        >
          <div className='relative'>
            <button
              className={`absolute flex-center top-[10px] right-[12px] w-[20px] h-[20px]  p-1 bg-transparent z-60 ${closeBtnClass}`}
              onClick={hideModal}
              aria-label='Close modal'
            >
              ×
            </button>
            {title && (
              <div className='flex justify-between items-center m-0 p-0 mb-[15px] '>
                <h2>{title}</h2>
              </div>
            )}
            <div>{content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
