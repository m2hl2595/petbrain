/**
 * 对话气泡组件 - Calm Tech + Soft Brutalism 设计（V2）
 * 更简洁、更克制的对话气泡 + Markdown渲染支持
 */

import ReactMarkdown from 'react-markdown';

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessageBubble({
  role,
  content,
}: ChatMessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-lg text-sm ${
          isUser ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'
        }`}
        style={!isUser ? { border: '1.5px solid #E5E5E5' } : undefined}
      >
        {isUser ? (
          // 用户消息：纯文本显示
          <p className="leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          // AI消息：Markdown渲染
          <div className="prose prose-sm max-w-none leading-relaxed">
            <ReactMarkdown
              components={{
                // 自定义样式
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1.5 mt-2">{children}</h3>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-2">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => <code className="bg-[#F5F5F5] px-1 py-0.5 rounded text-xs">{children}</code>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
