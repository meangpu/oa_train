import { create } from "zustand";
import { ReactNode } from "react";

export interface ModalOptions {
  title?: string;
  onClose?: () => void;

  closeBtnClass?: string;
  closeOnClickEmpty?: boolean;
}

interface ModalState {
  isOpen: boolean;
  content?: ReactNode | null;
  title?: string;
  onClose?: () => void;
  closeOnClickEmpty?: boolean;
  closeBtnClass?: string;

  showModal: (content: ReactNode, options?: ModalOptions) => void;
  hideModal: () => void;
}

const useGlobalModal = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  title: undefined,
  closeBtnClass: "white",
  onClose: undefined,
  closeOnClickEmpty: true,
  showModal: (content: ReactNode, options = {}) =>
    set({
      isOpen: true,
      content,
      ...options,
      closeBtnClass: options.closeBtnClass ?? "white",
      closeOnClickEmpty: options.closeOnClickEmpty ?? true,
    }),
  hideModal: () =>
    set((state) => {
      state.onClose?.();
      return {
        isOpen: false,
        content: null,
        title: undefined,
        onClose: undefined,
        closeOnClickEmpty: true,
      };
    }),
}));

export default useGlobalModal;
