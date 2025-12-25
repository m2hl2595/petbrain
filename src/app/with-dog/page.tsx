'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setUserStage } from '@/lib/storage';

// TypeScript类型定义
interface DogInfo {
  breed: string;           // 犬种
  ageMonths: string;       // 月龄区间（"1-3" / "4-6" / "6-12" / "12+" / "未知"）
  companionHours: string;  // 陪伴时间（"≤1h" / "2-3h" / "4-8h" / "≥8h"）
  daysHome: number;        // 到家天数（1-30）
}

interface DailyCard {
  focus: string;           // 今天最需要关注的事
  forbidden: string;       // 今天容易犯的错误
  reason: string;          // 为什么
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function WithDogPage() {
  const router = useRouter();

  // State管理
  const [dogInfo, setDogInfo] = useState<DogInfo | null>(null);
  const [dailyCard, setDailyCard] = useState<DailyCard | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [error, setError] = useState('');


  // 页面加载时：检查localStorage并重定向到表单页面（如果需要）
  useEffect(() => {
    const savedDogInfo = localStorage.getItem('petbrain_dog_info');

    if (savedDogInfo) {
      // 已有数据，直接加载
      try {
        const parsed = JSON.parse(savedDogInfo);
        setDogInfo(parsed);

        // 检查今日卡片
        const savedDailyCard = localStorage.getItem('petbrain_daily_card');
        const savedCardDate = localStorage.getItem('petbrain_daily_card_date');
        const today = new Date().toDateString();

        if (savedDailyCard && savedCardDate === today) {
          // 有今天的卡片，直接加载
          try {
            const parsedCard = JSON.parse(savedDailyCard);
            setDailyCard(parsedCard);
          } catch (error) {
            console.error('Failed to parse daily card:', error);
          }
        }
        // 注意：不在这里自动生成卡片，让用户手动点击或在首次对话时生成
      } catch (error) {
        console.error('Failed to parse dog info from localStorage:', error);
        // 数据损坏，重定向到表单页面
        router.push('/with-dog/edit-info');
      }
    } else {
      // 首次进入，重定向到表单页面
      router.push('/with-dog/edit-info');
    }
  }, [router]);

  // 监听页面可见性变化，在返回页面时重新加载数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 页面重新可见时，重新从localStorage加载数据
        const savedDogInfo = localStorage.getItem('petbrain_dog_info');
        if (savedDogInfo) {
          try {
            const parsed = JSON.parse(savedDogInfo);
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

  // 导航到修改信息页面
  const handleEditInfo = () => {
    router.push('/with-dog/edit-info');
  };

  // 解析今日卡片内容
  const parseDailyCard = (content: string): boolean => {
    try {
      console.log('开始解析卡片内容...');

      // 使用更灵活的正则提取三个部分
      // 匹配 "✅ 今天最需要关注的事" 或 "✅ 今天最需要关注的事："
      const focusMatch = content.match(/✅\s*今天最需要关注的事[：:]?\s*\n([\s\S]*?)(?=\n*❌|$)/);
      const forbiddenMatch = content.match(/❌\s*今天容易犯的错误[：:]?\s*\n([\s\S]*?)(?=\n*ℹ️|$)/);
      const reasonMatch = content.match(/ℹ️\s*为什么[：:]?\s*\n([\s\S]*?)$/);

      console.log('focusMatch:', focusMatch);
      console.log('forbiddenMatch:', forbiddenMatch);
      console.log('reasonMatch:', reasonMatch);

      if (focusMatch && forbiddenMatch && reasonMatch) {
        const dailyCardData: DailyCard = {
          focus: focusMatch[1].trim(),
          forbidden: forbiddenMatch[1].trim(),
          reason: reasonMatch[1].trim(),
        };

        console.log('解析成功，卡片数据：', dailyCardData);

        setDailyCard(dailyCardData);

        // 保存到localStorage，避免刷新后丢失
        localStorage.setItem('petbrain_daily_card', JSON.stringify(dailyCardData));
        localStorage.setItem('petbrain_daily_card_date', new Date().toDateString());

        return true;
      } else {
        console.error('解析失败：正则匹配不成功');
        console.error('原始内容：', content);
        return false;
      }
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

  // 发送消息（支持传递generateDailyCard参数）
  const handleSend = async (generateDailyCard = false) => {
    if (!inputValue.trim() && !generateDailyCard) return;
    if (!dogInfo) return;

    const userMessage = inputValue.trim();

    // 如果是生成今日卡片，使用特殊消息
    const actualMessage = generateDailyCard
      ? '你好，请生成今日卡片'
      : userMessage;

    // 只在普通对话时添加用户消息到对话历史
    if (!generateDailyCard) {
      const newUserMessage: Message = {
        role: 'user',
        content: actualMessage,
      };
      setMessages(prev => [...prev, newUserMessage]);
    }

    setInputValue('');
    setError('');

    // 设置不同的loading状态
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

      // 保存 conversation_id
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // 如果是生成今日卡片，解析并保存卡片内容
      if (generateDailyCard) {
        console.log('尝试解析今日卡片，AI回复内容：', data.answer);
        const parseSuccess = parseDailyCard(data.answer);
        if (!parseSuccess) {
          // 解析失败，显示错误信息
          setError('今日卡片生成失败，请重试');
        }
      } else {
        // 普通对话，添加AI回复到对话历史
        const newAssistantMessage: Message = {
          role: 'assistant',
          content: data.answer,
        };
        setMessages(prev => [...prev, newAssistantMessage]);
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

  // 处理Enter键发送
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主界面 */}
      {dogInfo && (
        <div className="min-h-screen p-8">
          <div className="max-w-3xl mx-auto">
            {/* 页面标题和介绍 */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-4">
                狗狗已经到家，不要焦虑，一起度过30天
              </h1>
              <p className="text-gray-600">
                你正处于陪伴阶段，我会帮助你关注重要的事情，避免常见的错误
              </p>
              <button
                onClick={handleEditInfo}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                修改狗狗信息
              </button>
            </div>

            {/* 今日上下文卡片区域 */}
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  今天要关注的事
                </h2>
                {!dailyCard && !isGeneratingCard && (
                  <button
                    onClick={() => handleSend(true)}
                    disabled={isLoading || isGeneratingCard}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    生成今日卡片
                  </button>
                )}
              </div>
              {isGeneratingCard ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">正在生成今日卡片...</p>
                </div>
              ) : dailyCard ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">✅ 最需要关注：</h3>
                    <p className="text-gray-800">{dailyCard.focus}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">❌ 容易犯的错误：</h3>
                    <p className="text-gray-800">{dailyCard.forbidden}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">ℹ️ 为什么：</h3>
                    <p className="text-gray-800">{dailyCard.reason}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  点击"生成今日卡片"，我会根据你的狗狗信息生成今天需要关注的重点
                </p>
              )}
            </div>

            {/* 对话历史区 */}
            {messages.length > 0 && (
              <div className="mb-8 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800 border border-blue-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading状态 */}
            {isLoading && (
              <div className="mb-8 flex justify-start">
                <div className="max-w-[80%] p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <p className="text-gray-600">正在思考...</p>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* 输入区 */}
            <div className="mb-12">
              <div className="space-y-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="有什么问题或担心的事吗？随时告诉我..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  rows={4}
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    按 Enter 发送，Shift + Enter 换行
                  </p>
                  <button
                    onClick={() => handleSend(false)}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '发送中...' : '发送'}
                  </button>
                </div>
              </div>
            </div>

            {/* 阶段切换旁路提示 */}
            <div className="mt-24 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-400 mb-2">
                如果情况有变，你可以：
              </p>
              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => handleStageSwitch('explore')}
                  className="text-gray-400 hover:text-gray-600 underline"
                >
                  回到探索阶段
                </button>
                <button
                  onClick={() => handleStageSwitch('prep')}
                  className="text-gray-400 hover:text-gray-600 underline"
                >
                  回到准备阶段
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}