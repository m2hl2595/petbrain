'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// TypeScript类型定义
interface DogInfo {
  breed: string;           // 犬种
  ageMonths: string;       // 月龄区间
  companionHours: string;  // 陪伴时间
  daysHome: number;        // 到家天数
}

export default function EditDogInfoPage() {
  const router = useRouter();

  // 表单输入状态
  const [formData, setFormData] = useState<DogInfo>({
    breed: '',
    ageMonths: '',
    companionHours: '',
    daysHome: 1,
  });

  // 表单验证错误
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DogInfo, string>>>({});

  // 是否是首次填写（用于判断显示文案）
  const [isFirstTime, setIsFirstTime] = useState(true);

  // 页面加载时：从localStorage读取数据
  useEffect(() => {
    const savedDogInfo = localStorage.getItem('petbrain_dog_info');

    if (savedDogInfo) {
      try {
        const parsed = JSON.parse(savedDogInfo);
        setFormData(parsed);
        setIsFirstTime(false);
      } catch (error) {
        console.error('Failed to parse dog info from localStorage:', error);
        setIsFirstTime(true);
      }
    } else {
      setIsFirstTime(true);
    }
  }, []);

  // 处理表单输入变化
  const handleInputChange = (field: keyof DogInfo, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 清除该字段的错误
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof DogInfo, string>> = {};

    if (!formData.breed.trim()) {
      errors.breed = '请输入犬种';
    }

    if (!formData.ageMonths) {
      errors.ageMonths = '请选择月龄区间';
    }

    if (!formData.companionHours) {
      errors.companionHours = '请选择每天可陪伴时间';
    }

    if (!formData.daysHome || formData.daysHome < 1 || formData.daysHome > 30) {
      errors.daysHome = '到家天数必须在1-30之间';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 存储到localStorage
    localStorage.setItem('petbrain_dog_info', JSON.stringify(formData));
    localStorage.setItem('petbrain_last_visit_date', new Date().toDateString());

    // 返回主页面
    router.push('/with-dog');
  };

  // 取消并返回（仅在非首次填写时显示）
  const handleCancel = () => {
    router.push('/with-dog');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isFirstTime ? '告诉我关于你的狗狗' : '修改狗狗信息'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isFirstTime
            ? '填写这些信息，我将为你提供更精准的陪伴和建议'
            : '更新狗狗的信息，让建议更加准确'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 犬种输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              犬种 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.breed}
              onChange={(e) => handleInputChange('breed', e.target.value)}
              placeholder="例如：金毛、泰迪、边牧..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.breed && (
              <p className="text-red-500 text-sm mt-1">{formErrors.breed}</p>
            )}
          </div>

          {/* 月龄区间选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              月龄 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ageMonths}
              onChange={(e) => handleInputChange('ageMonths', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择</option>
              <option value="1-3">1-3个月</option>
              <option value="4-6">4-6个月</option>
              <option value="6-12">6-12个月</option>
              <option value="12+">12个月以上</option>
              <option value="未知">不确定</option>
            </select>
            {formErrors.ageMonths && (
              <p className="text-red-500 text-sm mt-1">{formErrors.ageMonths}</p>
            )}
          </div>

          {/* 陪伴时间选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              每天可陪伴时间 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.companionHours}
              onChange={(e) => handleInputChange('companionHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择</option>
              <option value="≤1h">1小时以内</option>
              <option value="2-3h">2-3小时</option>
              <option value="4-8h">4-8小时</option>
              <option value="≥8h">8小时以上</option>
            </select>
            {formErrors.companionHours && (
              <p className="text-red-500 text-sm mt-1">{formErrors.companionHours}</p>
            )}
          </div>

          {/* 到家天数输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              到家天数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.daysHome}
              onChange={(e) => handleInputChange('daysHome', parseInt(e.target.value) || 1)}
              placeholder="狗狗到家多少天了？（1-30）"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.daysHome && (
              <p className="text-red-500 text-sm mt-1">{formErrors.daysHome}</p>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-2">
            {!isFirstTime && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              >
                取消
              </button>
            )}
            <button
              type="submit"
              className={`${!isFirstTime ? 'flex-1' : 'w-full'} bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
            >
              {isFirstTime ? '开始使用' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
