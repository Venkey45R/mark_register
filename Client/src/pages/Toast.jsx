import React from "react";
import { CheckCircleIcon, XCircleIcon, CloseIcon } from "./Icon";

const Toast = ({ message, type, show, onClose }) => {
  if (!show) return null;

  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-green-500" : "bg-red-500";
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center w-full max-w-xs p-4 text-white ${bgColor} rounded-lg shadow-lg`}
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 hover:bg-white/20"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
