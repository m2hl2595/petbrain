'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { setUserStage } from '@/lib/storage';
import DailyFocusCard from '@/components/DailyFocusCard';
import DailyCardBentoTab from '@/components/DailyCardBentoTab';
import DailyCardOverlay from '@/components/DailyCardOverlay';
import ChatMessageBubble from '@/components/ChatMessageBubble';
import ChatInputArea from '@/components/ChatInputArea';
import DogInfoModal from '@/components/DogInfoModal';
import {
  getOrCreateUser,
  getDogInfo,
  saveDogInfo as saveToSupabase,
  getTodayCard,
  saveTodayCard,
} from '@/lib/supabase';

// TypeScript类型定义
interface DogInfo {
  breed: string;
  ageMonths: string;
  companionHours: string;
  homeDate: string; // 到家日期 (YYYY-MM-DD)
  daysHome?: number; // 自动计算的天数（可选，用于显示）
}

// 工具函数：计算到家天数
const calculateDaysHome = (homeDate: string): number => {
  const home = new Date(homeDate);
  const today = new Date();

  // 重置时间为0点，只比较日期
  home.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - home.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1; // +1 因为到家当天算第1天
};

interface DailyCard {
  focus: string;
  forbidden: string;
  reason: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function WithDogPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dailyCardRef = useRef<HTMLDivElement>(null);

  // State管理
  const [userId, setUserId] = useState<string | null>(null);
  const [dogInfo, setDogInfo] = useState<DogInfo | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<Partial<DogInfo> | undefined>(undefined);
  const [dailyCard, setDailyCard] = useState<DailyCard | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [error, setError] = useState('');

  // 状态机：今日卡片显示状态
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // 信息表单弹窗状态
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 加载提取的狗狗信息（用于表单初始值）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedExtractedInfo = localStorage.getItem('extracted_dog_info');
      if (savedExtractedInfo) {
        try {
          const parsed = JSON.parse(savedExtractedInfo);
          setExtractedInfo({
            breed: parsed.breed || '',
            ageMonths: parsed.ageMonths || '',
            companionHours: parsed.companionHours || '',
            homeDate: new Date().toISOString().split('T')[0],
          });
        } catch (error) {
          console.error('Failed to parse extracted info:', error);
        }
      }
    }
  }, []);

  // 页面加载时从localStorage读取对话历史
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('withdog_messages');
      const savedConversationId = localStorage.getItem('withdog_conversation_id');

      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error('Failed to parse saved messages:', e);
        }
      }

      if (savedConversationId) {
        setConversationId(savedConversationId);
      }
    }
  }, []);

  // 对话历史变化时保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('withdog_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // conversationId变化时保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && conversationId) {
      localStorage.setItem('withdog_conversation_id', conversationId);
    }
  }, [conversationId]);

  // 页面加载时：初始化用户并加载数据
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // 步骤1：获取或创建用户
        const uid = await getOrCreateUser();
        setUserId(uid);
        console.log('✅ 用户ID:', uid);

        // 步骤2：从 Supabase 加载狗狗信息
        const dbDogInfo = await getDogInfo(uid);

        if (dbDogInfo) {
          // 转换格式：Supabase → 前端
          const frontendDogInfo: DogInfo = {
            breed: dbDogInfo.breed,
            ageMonths: dbDogInfo.age_months,
            companionHours: dbDogInfo.companion_hours,
            homeDate: dbDogInfo.home_date,
            daysHome: calculateDaysHome(dbDogInfo.home_date),
          };

          setDogInfo(frontendDogInfo);
          console.log('✅ 从 Supabase 加载狗狗信息:', frontendDogInfo);

          // 同步到 localStorage（用于离线降级）
          localStorage.setItem('petbrain_dog_info', JSON.stringify(frontendDogInfo));
        } else {
          // Supabase 没有数据，尝试从 localStorage 读取
          const savedDogInfo = localStorage.getItem('petbrain_dog_info');

          if (savedDogInfo) {
            const parsed = JSON.parse(savedDogInfo);

            // 自动计算当前天数
            if (parsed.homeDate) {
              parsed.daysHome = calculateDaysHome(parsed.homeDate);
            }

            setDogInfo(parsed);
            console.log('⚠️ 从 localStorage 加载狗狗信息（Supabase 无数据）');
          } else {
            // 完全新用户：打开表单弹窗
            console.log('📝 新用户：打开信息表单');
            setShowInfoModal(true);
          }
        }

        // 步骤3：从 Supabase 加载今日卡片
        const todayCard = await getTodayCard(uid);

        if (todayCard) {
          const frontendCard: DailyCard = {
            focus: todayCard.focus,
            forbidden: todayCard.forbidden,
            reason: todayCard.reason,
          };

          setDailyCard(frontendCard);
          console.log('✅ 从 Supabase 加载今日卡片');

          // 同步到 localStorage
          localStorage.setItem('petbrain_daily_card', JSON.stringify(frontendCard));
          localStorage.setItem('petbrain_daily_card_date', new Date().toDateString());
        } else {
          // Supabase 没有今日卡片，尝试从 localStorage 读取
          const savedDailyCard = localStorage.getItem('petbrain_daily_card');
          const savedCardDate = localStorage.getItem('petbrain_daily_card_date');
          const today = new Date().toDateString();

          if (savedDailyCard && savedCardDate === today) {
            const parsedCard = JSON.parse(savedDailyCard);
            setDailyCard(parsedCard);
            console.log('⚠️ 从 localStorage 加载今日卡片（Supabase 无数据）');
          }
        }
      } catch (error) {
        console.error('❌ 初始化失败，降级到 localStorage:', error);

        // 降级方案：完全使用 localStorage
        const savedDogInfo = localStorage.getItem('petbrain_dog_info');

        if (savedDogInfo) {
          const parsed = JSON.parse(savedDogInfo);

          if (parsed.homeDate) {
            parsed.daysHome = calculateDaysHome(parsed.homeDate);
          }

          setDogInfo(parsed);
        } else {
          setShowInfoModal(true);
        }

        const savedDailyCard = localStorage.getItem('petbrain_daily_card');
        const savedCardDate = localStorage.getItem('petbrain_daily_card_date');
        const today = new Date().toDateString();

        if (savedDailyCard && savedCardDate === today) {
          setDailyCard(JSON.parse(savedDailyCard));
        }
      }
    };

    initializeUser();
  }, []);

  // 监听页面可见性变化（刷新天数）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const savedDogInfo = localStorage.getItem('petbrain_dog_info');
        if (savedDogInfo) {
          try {
            const parsed = JSON.parse(savedDogInfo);

            // 自动计算当前天数
            if (parsed.homeDate) {
              parsed.daysHome = calculateDaysHome(parsed.homeDate);
            }

            setDogInfo(parsed);
          } catch (error) {
            console.error('Failed to reload dog info:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 使用Intersection Observer检测今日卡片是否在视口内
  useEffect(() => {
    const dailyCardElement = dailyCardRef.current;
    if (!dailyCardElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当卡片不可见时（向下滚动，卡片滚出视口），显示悬浮按钮
        setShowFloatingCard(!entry.isIntersecting);
      },
      {
        root: scrollContainerRef.current,
        threshold: 0, // 卡片完全离开视口时触发
        rootMargin: '-100px 0px 0px 0px', // 向下滚动100px后触发
      }
    );

    observer.observe(dailyCardElement);

    return () => {
      observer.disconnect();
    };
  }, [dailyCard]);

  // 打开信息表单弹窗
  const handleEditInfo = () => {
    setShowInfoModal(true);
  };

  // 保存狗狗信息（从弹窗提交）
  const handleSaveDogInfo = async (data: DogInfo) => {
    console.log('🔄 开始保存狗狗信息...', data);

    try {
      // 自动计算当前天数
      if (data.homeDate) {
        data.daysHome = calculateDaysHome(data.homeDate);
      }

      // 先保存到 localStorage（立即反馈）
      localStorage.setItem('petbrain_dog_info', JSON.stringify(data));
      console.log('✅ 数据已保存到 localStorage');

      // 更新前端状态（立即显示）
      setDogInfo(data);
      setShowInfoModal(false);

      // 然后异步保存到 Supabase
      if (userId) {
        console.log('🔄 开始保存到 Supabase...');
        await saveToSupabase(userId, {
          breed: data.breed,
          age_months: data.ageMonths,
          companion_hours: data.companionHours,
          home_date: data.homeDate,
        });
        console.log('✅ 狗狗信息已保存到 Supabase');
      } else {
        console.warn('⚠️ userId 不存在，跳过 Supabase 保存');
      }
    } catch (error) {
      console.error('❌ 保存狗狗信息到 Supabase 失败:', error);

      // 显示友好的错误提示
      setError('信息已保存到本地，云端同步将在后台重试');

      // 3秒后自动清除错误提示
      setTimeout(() => setError(''), 3000);
    }
  };

  // 关闭弹窗处理（新用户必须填写信息）
  const handleCloseModal = () => {
    // 如果已有狗狗信息，允许关闭；否则阻止关闭（新用户必填）
    if (dogInfo) {
      setShowInfoModal(false);
    }
  };

  // 解析今日卡片内容
  const parseDailyCard = async (content: string): Promise<boolean> => {
    try {
      const focusMatch = content.match(/✅\s*今天最需要关注的事[：:]?\s*\n([\s\S]*?)(?=\n*❌|$)/);
      const forbiddenMatch = content.match(/❌\s*今天容易犯的错误[：:]?\s*\n([\s\S]*?)(?=\n*ℹ️|$)/);
      const reasonMatch = content.match(/ℹ️\s*为什么[：:]?\s*\n([\s\S]*?)$/);

      if (focusMatch && forbiddenMatch && reasonMatch) {
        const dailyCardData: DailyCard = {
          focus: focusMatch[1].trim(),
          forbidden: forbiddenMatch[1].trim(),
          reason: reasonMatch[1].trim(),
        };

        setDailyCard(dailyCardData);

        // 保存到 Supabase
        if (userId) {
          try {
            await saveTodayCard(userId, dailyCardData);
            console.log('✅ 今日卡片已保存到 Supabase');
          } catch (error) {
            console.error('⚠️ 保存今日卡片到 Supabase 失败:', error);
          }
        }

        // 同步到 localStorage（用于降级）
        localStorage.setItem('petbrain_daily_card', JSON.stringify(dailyCardData));
        localStorage.setItem('petbrain_daily_card_date', new Date().toDateString());

        return true;
      }
      return false;
    } catch (error) {
      console.error('解析卡片时发生错误:', error);
      return false;
    }
  };

  // 处理阶段切换
  const handleStageSwitch = (stage: 'explore' | 'prep') => {
    setUserStage(stage);
    const routeMap = {
      explore: '/explore',
      prep: '/prep',
    };
    router.push(routeMap[stage]);
  };

  // 发送消息
  const handleSend = async (generateDailyCard = false) => {
    if (!inputValue.trim() && !generateDailyCard) return;
    if (!dogInfo) return;

    const userMessage = inputValue.trim();
    const actualMessage = generateDailyCard ? '你好，请生成今日卡片' : userMessage;

    if (!generateDailyCard) {
      const newUserMessage: Message = {
        role: 'user',
        content: actualMessage,
      };
      setMessages((prev) => [...prev, newUserMessage]);
    }

    setInputValue('');
    setError('');

    if (generateDailyCard) {
      setIsGeneratingCard(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch('/api/with-dog-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: actualMessage,
          conversation_id: conversationId,
          dogInfo: dogInfo,
          generateDailyCard: generateDailyCard,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '请求失败');
        return;
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      if (generateDailyCard) {
        const parseSuccess = parseDailyCard(data.answer);
        if (!parseSuccess) {
          setError('今日卡片生成失败，请重试');
        }
      } else {
        const newAssistantMessage: Message = {
          role: 'assistant',
          content: data.answer,
        };
        setMessages((prev) => [...prev, newAssistantMessage]);
      }
    } catch (err) {
      setError('网络错误，请稍后再试');
      console.error('Send message error:', err);
    } finally {
      if (generateDailyCard) {
        setIsGeneratingCard(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const hasCard = !!(dailyCard?.focus || dailyCard?.forbidden || dailyCard?.reason);

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA]">
      {dogInfo && (
        <>
          {/* Sticky Header - 一行三段式 */}
          <div className="sticky top-0 z-50 bg-[#FAFAFA] border-b-[1.5px] border-[#E5E5E5]">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {/* 左侧：标题 */}
                <h2 className="text-2xl font-semibold text-[#1A1A1A]">
                  陪伴阶段
                </h2>

                {/* 中间：天数标签（深灰圆形） */}
                <div className="flex-1 flex justify-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 bg-[#1A1A1A] text-white text-sm font-medium rounded-full">
                    第 {dogInfo?.daysHome || 1} 天
                  </span>
                </div>

                {/* 右侧：修改信息 */}
                <button
                  onClick={handleEditInfo}
                  className="text-sm text-[#666666] hover:text-[#1A1A1A] underline decoration-1 underline-offset-2 transition-colors duration-200"
                >
                  修改信息
                </button>
              </div>
            </div>
          </div>

          {/* Bento Tab（右侧边缘） */}
          {showFloatingCard && hasCard && (
            <DailyCardBentoTab onClick={() => setShowOverlay(true)} />
          )}

          {/* Overlay展开态 */}
          {showOverlay && (
            <DailyCardOverlay
              focus={dailyCard?.focus}
              forbidden={dailyCard?.forbidden}
              reason={dailyCard?.reason}
              onClose={() => setShowOverlay(false)}
            />
          )}

          {/* 可滚动内容区域 */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

              {/* 今日卡片（初始态，顶部） */}
              <DailyFocusCard
                ref={dailyCardRef}
                focus={dailyCard?.focus}
                forbidden={dailyCard?.forbidden}
                reason={dailyCard?.reason}
                isLoading={isGeneratingCard}
                onGenerate={() => handleSend(true)}
              />

              {/* 对话历史 */}
              {messages.length > 0 && (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <ChatMessageBubble
                      key={index}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                </div>
              )}

              {/* Loading状态 */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-lg">
                    <p className="text-sm text-[#A3A3A3]">正在思考...</p>
                  </div>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="p-3 bg-white border border-[#DC2626] rounded-lg">
                  <p className="text-sm text-[#DC2626]">{error}</p>
                </div>
              )}

              {/* 底部留白（为固定输入框留空间） */}
              <div className="h-40" />
            </div>
          </div>

          {/* 固定底部输入框 + 阶段导航 */}
          <div className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
              {/* 输入区 */}
              <ChatInputArea
                value={inputValue}
                onChange={setInputValue}
                onSubmit={() => handleSend(false)}
                isLoading={isLoading}
              />

              {/* 阶段分流入口（输入框正下方） */}
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleStageSwitch('explore')}
                  className="text-[#A3A3A3] hover:text-[#666666] transition-colors duration-200"
                >
                  ← 回到探索
                </button>
                <span className="text-[#E5E5E5]">|</span>
                <button
                  onClick={() => handleStageSwitch('prep')}
                  className="text-[#A3A3A3] hover:text-[#666666] transition-colors duration-200"
                >
                  ← 回到准备
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 信息表单弹窗 - 独立于dogInfo条件渲染 */}
      <DogInfoModal
        isOpen={showInfoModal}
        onClose={handleCloseModal}
        initialData={dogInfo || (extractedInfo as DogInfo | undefined)}
        onSubmit={handleSaveDogInfo}
      />
    </div>
  );
}
