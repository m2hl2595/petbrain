'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setUserStage } from '@/lib/storage';
import ChatMessageBubble from '@/components/ChatMessageBubble';
import ChatInputArea from '@/components/ChatInputArea';
import { DogInfoExtractor } from '@/lib/dogInfoExtractor';

// 消息类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// 提取的狗狗信息类型
interface ExtractedDogInfo {
  breed: string | null;
  ageMonths: string | null;
  companionHours: string | null;
}

export default function PrepPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

  // 页面加载时从localStorage读取对话历史
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('prep_messages');
      const savedConversationId = localStorage.getItem('prep_conversation_id');

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
      localStorage.setItem('prep_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // conversationId变化时保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && conversationId) {
      localStorage.setItem('prep_conversation_id', conversationId);
    }
  }, [conversationId]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 发送消息（支持传递shouldGenerate参数）
  const handleSend = async (shouldGenerate = false) => {
    if (!inputValue.trim() && !shouldGenerate) return;

    const userMessage = inputValue.trim();

    // 如果是生成清单，自动填充提示语
    const actualMessage = shouldGenerate
      ? '请根据我们的对话生成准备清单'
      : userMessage;

    // 🔥 实时提取狗狗信息（基于确定性意图识别）
    if (!shouldGenerate) {
      const extracted = DogInfoExtractor.extract(userMessage);

      // 读取已存储的信息
      const savedInfo = localStorage.getItem('extracted_dog_info');
      const currentInfo: ExtractedDogInfo = savedInfo
        ? JSON.parse(savedInfo)
        : { breed: null, ageMonths: null, companionHours: null };

      // 合并新提取的信息（只覆盖非空值）
      const updatedInfo: ExtractedDogInfo = {
        breed: extracted.breed || currentInfo.breed,
        ageMonths: extracted.ageMonths || currentInfo.ageMonths,
        companionHours: extracted.companionHours || currentInfo.companionHours,
      };

      // 如果提取到任何信息，保存到 localStorage
      if (extracted.breed || extracted.ageMonths || extracted.companionHours) {
        localStorage.setItem('extracted_dog_info', JSON.stringify(updatedInfo));
        console.log('✅ 提取到狗狗信息:', extracted);
      }
    }

    // 添加用户消息到对话历史
    const newUserMessage: Message = {
      role: 'user',
      content: actualMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setInputValue('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/prep-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: actualMessage,
          conversation_id: conversationId,
          // 关键：通过会话变量控制LLM行为
          variables: {
            shouldGenerateChecklist: shouldGenerate ? 'true' : 'false',
          },
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

      // 添加AI回复到对话历史
      const newAssistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
      };
      setMessages((prev) => [...prev, newAssistantMessage]);
    } catch (err) {
      setError('网络错误，请稍后再试');
      console.error('Send message error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageSwitch = (stage: 'explore' | 'withDog') => {
    setUserStage(stage);
    const routeMap = {
      explore: '/explore',
      withDog: '/with-dog',
    };
    router.push(routeMap[stage]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA]">
      {/* Sticky Header - 主题色点缀 */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA] border-b-[1.5px] border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧：标题 */}
            <h2 className="text-2xl font-semibold text-[#1A1A1A]">
              准备阶段
            </h2>

            {/* 右侧：主题色标签 */}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#718072' }}
              />
              <span className="text-sm text-[#666666]">有序准备</span>
            </div>
          </div>

          {/* 副标题 */}
          <p className="text-sm text-[#666666] mt-2">
            倒计时开始了，准备好迎接新成员。你可以问我任何关于养狗准备的问题
          </p>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* 欢迎提示（首次进入） */}
          {messages.length === 0 && (
            <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                📋 欢迎来到准备阶段
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed mb-4">
                如果你已经选好狗狗，准备好迎接它的到来了吗？在这里，你可以：
              </p>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li className="flex items-start gap-2">
                  <span className="text-[#718072] mt-0.5">•</span>
                  <span>咨询养狗准备的具体事项</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#718072] mt-0.5">•</span>
                  <span>了解需要购买的物品清单</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#718072] mt-0.5">•</span>
                  <span>生成专属的准备清单</span>
                </li>
              </ul>
            </div>
          )}

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

          {/* 生成清单按钮区（未生成清单时显示） - 暂时注释掉 */}
          {/* {!checklistGenerated && messages.length > 0 && (
            <div
              className="p-6 bg-white border-[1.5px] rounded-2xl"
              style={{ borderColor: '#718072' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#1A1A1A] font-semibold mb-1">
                    💡 准备好了吗？
                  </p>
                  <p className="text-sm text-[#666666]">
                    点击下方按钮，我会根据我们的对话生成专属准备清单
                  </p>
                </div>
                <button
                  onClick={handleGenerateChecklist}
                  disabled={isLoading}
                  className="ml-4 px-6 py-3 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity whitespace-nowrap font-semibold"
                  style={{ backgroundColor: '#718072' }}
                >
                  📋 生成清单
                </button>
              </div>
            </div>
          )} */}

          {/* 已生成清单提示 - 暂时注释掉 */}
          {/* {checklistGenerated && (
            <div className="p-4 bg-white border border-[#10B981] rounded-lg">
              <p className="text-sm text-[#10B981]">
                ✅ 清单已生成！你还可以继续咨询其他问题。
              </p>
            </div>
          )} */}

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
            placeholder="输入你的问题..."
          />

          {/* 阶段分流入口（输入框正下方） */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleStageSwitch('explore')}
                className="text-[#A3A3A3] hover:text-[#666666] transition-colors duration-200"
              >
                ← 回到探索
              </button>
              <span className="text-[#E5E5E5]">|</span>
              <button
                onClick={() => handleStageSwitch('withDog')}
                className="text-[#A3A3A3] hover:text-[#666666] transition-colors duration-200"
              >
                狗狗已经到家了 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
