'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DogInfoForm, { DogInfo } from '@/components/DogInfoForm';

export default function EditDogInfoPage() {
  const router = useRouter();
  const [initialData, setInitialData] = useState<DogInfo | undefined>(undefined);
  const [isFirstTime, setIsFirstTime] = useState(true);

  // 页面加载时：从localStorage读取数据
  useEffect(() => {
    const savedDogInfo = localStorage.getItem('petbrain_dog_info');

    if (savedDogInfo) {
      try {
        const parsed = JSON.parse(savedDogInfo);
        setInitialData(parsed);
        setIsFirstTime(false);
      } catch (error) {
        console.error('Failed to parse dog info from localStorage:', error);
        setIsFirstTime(true);
      }
    } else {
      setIsFirstTime(true);
    }
  }, []);

  // 提交表单
  const handleSubmit = (data: DogInfo) => {
    // 存储到localStorage
    localStorage.setItem('petbrain_dog_info', JSON.stringify(data));
    localStorage.setItem('petbrain_last_visit_date', new Date().toDateString());

    // 返回主页面
    router.push('/with-dog');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1A1A1A] mb-3">
            {isFirstTime ? '告诉我关于你的狗狗' : '修改狗狗信息'}
          </h1>
          <p className="text-base text-[#666666]">
            {isFirstTime
              ? '请填写狗狗的基本信息，帮助我更好地陪伴你'
              : '更新狗狗的信息，让建议更加准确'}
          </p>
        </div>

        {/* 表单组件 */}
        <DogInfoForm initialData={initialData} onSubmit={handleSubmit} />

        {/* 取消按钮（仅在非首次填写时显示） */}
        {!isFirstTime && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => router.push('/with-dog')}
              className="text-sm text-[#A3A3A3] hover:text-[#666666] underline transition-colors duration-200"
            >
              取消并返回
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
