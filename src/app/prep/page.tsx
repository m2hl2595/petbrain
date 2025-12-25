'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setUserStage } from '@/lib/storage';

// 消息类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PrepPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [checklistGenerated, setChecklistGenerated] = useState(false);

  // 发送消息（支持传递shouldGenerate参数）
  const handleSend = async (shouldGenerate = false) => {
    if (!inputValue.trim() && !shouldGenerate) return;

    const userMessage = inputValue.trim();

    // 如果是生成清单，自动填充提示语
    const actualMessage = shouldGenerate
      ? '请根据我们的对话生成准备清单'
      : userMessage;

    // 添加用户消息到对话历史
    const newUserMessage: Message = {
      role: 'user',
      content: actualMessage,
    };
    setMessages(prev => [...prev, newUserMessage]);

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
            shouldGenerateChecklist: shouldGenerate ? 'true' : 'false'
          }
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
      setMessages(prev => [...prev, newAssistantMessage]);

      // 如果生成了清单，标记状态
      if (shouldGenerate) {
        setChecklistGenerated(true);
      }

    } catch (err) {
      setError('网络错误，请稍后再试');
      console.error('Send message error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理生成清单按钮点击
  const handleGenerateChecklist = () => {
    setInputValue('请根据我们的对话生成准备清单');
    handleSend(true);
  };

  // 处理Enter键发送
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(false);
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
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">
          倒计时开始了，准备好迎接新成员
        </h1>
        <p className="text-gray-600 mb-8">
          你正处于准备阶段，你可以问我任何关于养狗准备的问题
        </p>

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

        {/* 生成清单按钮区（未生成清单时显示） */}
        {!checklistGenerated && messages.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 font-medium mb-1">
                  💡 准备好了吗？
                </p>
                <p className="text-gray-600 text-sm">
                  点击下方按钮，我会根据我们的对话生成专属准备清单
                </p>
              </div>
              <button
                onClick={handleGenerateChecklist}
                disabled={isLoading}
                className="ml-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap font-medium"
              >
                📋 生成清单
              </button>
            </div>
          </div>
        )}

        {/* 已生成清单提示 */}
        {checklistGenerated && (
          <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800">
              ✅ 清单已生成！你还可以继续咨询其他问题。
            </p>
          </div>
        )}

        {/* 输入区 */}
        <div className="mb-12">
          <div className="space-y-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                messages.length === 0
                  ? "比如：我想养一只金毛，家里有小孩..."
                  : "继续提问或聊天..."
              }
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              rows={4}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {messages.length === 0
                  ? "💬 开始对话，我会帮你规划准备工作"
                  : "按 Enter 发送，Shift + Enter 换行"}
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

        {/* 阶段切换旁路提示（弱存在） */}
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
              onClick={() => handleStageSwitch('withDog')}
              className="text-gray-400 hover:text-gray-600 underline"
            >
              狗狗已经到家了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
