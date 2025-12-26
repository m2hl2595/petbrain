'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setUserStage } from '@/lib/storage';
import ChatMessageBubble from '@/components/ChatMessageBubble';
import ChatInputArea from '@/components/ChatInputArea';

// 消息类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();

    // 添加用户消息到对话历史
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setInputValue('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          conversation_id: conversationId,
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

  const handleStageSwitch = (stage: 'prep' | 'withDog') => {
    setUserStage(stage);
    const routeMap = {
      prep: '/prep',
      withDog: '/with-dog',
    };
    router.push(routeMap[stage]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA]">
      {/* Sticky Header - 主题色点缀 */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA] border-b-[1.5px] border-[#E5E5E5]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧：标题 */}
            <h2 className="text-2xl font-semibold text-[#1A1A1A]">
              探索阶段
            </h2>

            {/* 右侧：主题色标签 */}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#64748B' }}
              />
              <span className="text-sm text-[#666666]">理性思考</span>
            </div>
          </div>

          {/* 副标题 */}
          <p className="text-sm text-[#666666] mt-2">
            养狗这件事，值得好好想想。慢慢来，我们一起想清楚
          </p>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          {/* 欢迎提示（首次进入） */}
          {messages.length === 0 && (
            <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                👋 欢迎来到探索阶段
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed mb-4">
                养狗不是一场冲动决定，而是对狗狗和你生活方式的深刻承诺。在这里，你可以：
              </p>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li className="flex items-start gap-2">
                  <span className="text-[#64748B] mt-0.5">•</span>
                  <span>聊聊你的生活状态和养狗动机</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#64748B] mt-0.5">•</span>
                  <span>了解不同犬种的特点和需求</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#64748B] mt-0.5">•</span>
                  <span>评估你是否真的准备好了</span>
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

          {/* 底部留白（为固定输入框留空间） */}
          <div className="h-40" />
        </div>
      </div>

      {/* 固定底部输入框 + 阶段导航 */}
      <div className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {/* 输入区 */}
          <ChatInputArea
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSend}
            isLoading={isLoading}
            placeholder={
              messages.length === 0
                ? '比如：我想养狗，但不知道自己适合养什么品种...'
                : '继续聊聊你的想法...'
            }
          />

          {/* 阶段分流入口（输入框正下方） */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleStageSwitch('prep')}
                className="text-[#A3A3A3] hover:text-[#666666] transition-colors duration-200"
              >
                我已经选好狗了 →
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
