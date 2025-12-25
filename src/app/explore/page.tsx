'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setUserStage } from '@/lib/storage';

export default function ExplorePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setLastUserMessage(userMessage);
    setInputValue('');
    setAiReply('');
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '请求失败');
        return;
      }

      setAiReply(data.answer);

    } catch (err) {
      setError('网络错误，请稍后再试');
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
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">
          养狗这件事，值得好好想想
        </h1>
        <p className="text-gray-600 mb-8">
          你正处于探索阶段，慢慢来，我们一起想清楚
        </p>

        {/* 聊天主区域 */}
        <div className="mb-12">
          {/* 用户输入回显 */}
          {lastUserMessage && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="text-gray-800">{lastUserMessage}</p>
            </div>
          )}

          {/* AI 回复 */}
          {isLoading && (
            <div className="mb-4 p-4 bg-blue-50 rounded">
              <p className="text-gray-600">正在思考...</p>
            </div>
          )}

          {aiReply && (
            <div className="mb-6 p-4 bg-blue-50 rounded">
              <p className="text-gray-800">{aiReply}</p>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 输入区域 */}
          <div className="space-y-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="说说你的想法..."
              className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:border-gray-400"
              rows={4}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? '发送中...' : '发送'}
            </button>
          </div>
        </div>

        {/* 阶段切换旁路提示（弱存在） */}
        <div className="mt-24 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 mb-2">
            如果你已经有了明确决定，也可以直接告诉我：
          </p>
          <div className="flex gap-4 text-sm">
            <button
              onClick={() => handleStageSwitch('prep')}
              className="text-gray-400 hover:text-gray-600 underline"
            >
              我已经选好狗了
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
