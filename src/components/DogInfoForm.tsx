/**
 * 狗狗信息表单组件 - Calm Tech + Soft Brutalism + Bento Grid 设计
 * 用于收集和编辑狗狗的基本信息
 */

'use client';

import { useState, FormEvent } from 'react';

export interface DogInfo {
  breed: string;
  ageMonths: string;
  companionHours: string;
  homeDate: string; // 到家日期 (YYYY-MM-DD)
  daysHome?: number; // 自动计算的天数（可选，用于显示）
}

interface DogInfoFormProps {
  initialData?: DogInfo;
  onSubmit: (data: DogInfo) => void;
  isLoading?: boolean;
}

export default function DogInfoForm({
  initialData,
  onSubmit,
  isLoading = false,
}: DogInfoFormProps) {
  // 计算默认到家日期（今天）
  const getDefaultHomeDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const [formData, setFormData] = useState<DogInfo>(
    initialData || {
      breed: '',
      ageMonths: '',
      companionHours: '',
      homeDate: getDefaultHomeDate(),
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof DogInfo, string>>>({});

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DogInfo, string>> = {};

    if (!formData.breed.trim()) {
      newErrors.breed = '请输入犬种';
    }

    if (!formData.ageMonths) {
      newErrors.ageMonths = '请选择月龄区间';
    }

    if (!formData.companionHours) {
      newErrors.companionHours = '请选择陪伴时间';
    }

    if (!formData.homeDate) {
      newErrors.homeDate = '请选择到家日期';
    } else {
      // 验证日期不能超过今天
      const selectedDate = new Date(formData.homeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.homeDate = '到家日期不能晚于今天';
      }

      // 验证日期不能超过30天前
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      if (selectedDate < thirtyDaysAgo) {
        newErrors.homeDate = '到家日期不能早于30天前';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理提交
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // 更新字段值
  const updateField = (field: keyof DogInfo, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    // 清除该字段的错误
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      {/* 字段1: 犬种 */}
      <div className="bg-white rounded-xl p-8"
        style={{ border: '1.5px solid #E5E5E5' }}
      >
        <label
          htmlFor="breed"
          className="block text-lg font-medium text-[#1A1A1A] mb-2"
        >
          犬种
        </label>
        <input
          id="breed"
          type="text"
          value={formData.breed}
          onChange={(e) => updateField('breed', e.target.value)}
          placeholder="例如：金毛、泰迪、拉布拉多"
          disabled={isLoading}
          className="w-full h-12 px-4 text-base text-[#1A1A1A] placeholder:text-[#A3A3A3] rounded-lg focus:outline-none disabled:opacity-50"
          style={{ fontSize: '16px', border: '1.5px solid #E5E5E5' }} // 防止iOS自动缩放
        />
        {errors.breed && (
          <p className="mt-2 text-[13px] text-[#DC2626]">{errors.breed}</p>
        )}
      </div>

      {/* 字段2: 月龄区间 */}
      <div className="bg-white rounded-xl p-8"
        style={{ border: '1.5px solid #E5E5E5' }}
      >
        <label
          htmlFor="ageMonths"
          className="block text-lg font-medium text-[#1A1A1A] mb-2"
        >
          月龄区间
        </label>
        <select
          id="ageMonths"
          value={formData.ageMonths}
          onChange={(e) => updateField('ageMonths', e.target.value)}
          disabled={isLoading}
          className="w-full h-12 px-4 text-base text-[#1A1A1A] rounded-lg focus:outline-none disabled:opacity-50 bg-white"
          style={{ fontSize: '16px', border: '1.5px solid #E5E5E5' }}
        >
          <option value="">请选择月龄区间</option>
          <option value="1-3">1-3个月</option>
          <option value="4-6">4-6个月</option>
          <option value="6-12">6-12个月</option>
          <option value="12+">12个月以上</option>
          <option value="未知">未知</option>
        </select>
        {errors.ageMonths && (
          <p className="mt-2 text-[13px] text-[#DC2626]">{errors.ageMonths}</p>
        )}
      </div>

      {/* 字段3: 每天陪伴时间 */}
      <div className="bg-white rounded-xl p-8"
        style={{ border: '1.5px solid #E5E5E5' }}
      >
        <label
          htmlFor="companionHours"
          className="block text-lg font-medium text-[#1A1A1A] mb-2"
        >
          每天陪伴时间
        </label>
        <select
          id="companionHours"
          value={formData.companionHours}
          onChange={(e) => updateField('companionHours', e.target.value)}
          disabled={isLoading}
          className="w-full h-12 px-4 text-base text-[#1A1A1A] rounded-lg focus:outline-none disabled:opacity-50 bg-white"
          style={{ fontSize: '16px', border: '1.5px solid #E5E5E5' }}
        >
          <option value="">请选择陪伴时间</option>
          <option value="≤1h">≤1小时</option>
          <option value="2-3h">2-3小时</option>
          <option value="4-8h">4-8小时</option>
          <option value="≥8h">≥8小时</option>
        </select>
        {errors.companionHours && (
          <p className="mt-2 text-[13px] text-[#DC2626]">
            {errors.companionHours}
          </p>
        )}
      </div>

      {/* 字段4: 到家日期 */}
      <div className="bg-white rounded-xl p-8"
        style={{ border: '1.5px solid #E5E5E5' }}
      >
        <label
          htmlFor="homeDate"
          className="block text-lg font-medium text-[#1A1A1A] mb-2"
        >
          到家日期
        </label>
        <p className="text-sm text-[#666666] mb-3">
          选择狗狗到家的日期，天数会自动计算
        </p>
        <input
          id="homeDate"
          type="date"
          value={formData.homeDate}
          onChange={(e) => updateField('homeDate', e.target.value)}
          disabled={isLoading}
          max={new Date().toISOString().split('T')[0]}
          min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          className="w-full h-12 px-4 text-base text-[#1A1A1A] rounded-lg focus:outline-none disabled:opacity-50"
          style={{ fontSize: '16px', border: '1.5px solid #E5E5E5' }}
        />
        {errors.homeDate && (
          <p className="mt-2 text-[13px] text-[#DC2626]">{errors.homeDate}</p>
        )}
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-60 h-14 bg-[#1A1A1A] text-white text-lg font-semibold rounded-xl transition-colors duration-200 hover:bg-[#333333] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '保存并继续'}
        </button>
      </div>
    </form>
  );
}
