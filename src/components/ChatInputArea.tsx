/**
 * 输入区组件 - Calm Tech 优化版（去掉提示文案）
 */

'use client';

import { KeyboardEvent } from 'react';

interface ChatInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ChatInputArea({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = '有问题随时告诉我...',
}: ChatInputAreaProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full min-h-[80px] md:min-h-[100px] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#A3A3A3] bg-white rounded-lg resize-none focus:outline-none disabled:opacity-50 transition-colors duration-200"
        style={{ fontSize: '16px', border: '1.5px solid #E5E5E5' }}
      />

      {/* 发送按钮 */}
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="h-9 px-5 bg-[#1A1A1A] text-white text-sm rounded-lg transition-colors duration-200 hover:bg-[#333333] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:cursor-not-allowed"
        >
          {isLoading ? '发送中' : '发送'}
        </button>
      </div>
    </div>
  );
}
