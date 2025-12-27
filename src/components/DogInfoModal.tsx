/**
 * 狗狗信息弹窗组件 - Modal Refactor
 * Soft Brutalism: 24px 圆角 + 1.5px 粗边框
 * 半透明遮罩 backdrop-blur-sm
 */

'use client';

import { useEffect } from 'react';
import DogInfoForm, { DogInfo } from './DogInfoForm';

interface DogInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DogInfo;
  onSubmit: (data: DogInfo) => void;
  isLoading?: boolean;
}

export default function DogInfoModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isLoading = false,
}: DogInfoModalProps) {
  // ESC键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (data: DogInfo) => {
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:pt-20 px-4 overflow-y-auto">
      {/* 遮罩层 - 半透明 + backdrop blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 - Soft Brutalism: 24px 圆角 + 1.5px 边框 + 无阴影 */}
      <div className="relative w-full max-w-3xl bg-[#FAFAFA] rounded-3xl animate-in fade-in slide-in-from-top-4 duration-200"
        style={{ border: '1.5px solid #E5E5E5' }}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-5 border-b-[1.5px] border-[#E5E5E5]">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">
            {initialData ? '确认狗狗信息' : '填写狗狗信息'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#A3A3A3] hover:text-[#666666] transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 表单内容区 */}
        <div className="px-6 py-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          <DogInfoForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
