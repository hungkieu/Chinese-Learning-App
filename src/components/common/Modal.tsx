import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  children?: ReactNode;
  className?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  showFooter?: boolean;
}

const Modal = ({
  isOpen,
  setOpen,
  title,
  children,
  className,
  okText = "OK",
  cancelText = "Cancel",
  onOk,
  onCancel,
  showFooter = true,
}: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setOpen]);

  const handleCancel = () => {
    if (onCancel) onCancel();
    setOpen(false);
  };

  const handleOk = () => {
    if (onOk) onOk();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={clsx(
              "relative bg-white border-4 border-green-one rounded-3xl shadow-2xl max-w-lg w-11/12 mx-auto p-6",
              className
            )}
          >
            {title && (
              <h2 className="text-2xl font-bold text-green-one mb-4 text-center">
                {title}
              </h2>
            )}
            <div className="mb-4">{children}</div>

            {showFooter && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 text-green-950 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 active:scale-95 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleOk}
                  className="bg-green-one text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 active:scale-95 transition-all"
                >
                  {okText}
                </button>
              </div>
            )}

            <button
              onClick={handleCancel}
              className="absolute top-3 right-3 text-green-one hover:text-green-700 font-bold text-xl transition-transform hover:scale-110"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
