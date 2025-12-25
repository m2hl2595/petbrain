import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { query, conversation_id, variables } = body;
    console.log('Query value:', query, 'Type:', typeof query);
    console.log('conversation_id value:', conversation_id);
    console.log('variables:', variables);

    if (!query || typeof query !== 'string') {
      console.log('Validation failed: query is empty or not a string');
      return NextResponse.json(
        { error: '请输入有效内容' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DIFY_PREP_API_KEY;
    console.log('API Key exists:', !!apiKey);
    if (!apiKey) {
      return NextResponse.json(
        { error: '服务配置错误' },
        { status: 500 }
      );
    }

    console.log('Calling Dify API with query:', query);
    const requestBody: any = {
      // 传递输入变量到Dify（用于控制LLM行为）
      inputs: variables || {
        shouldGenerateChecklist: 'false'  // 默认值：字符串 "false"
      },
      query: query,
      response_mode: 'blocking',
      user: 'anonymous',
    };

    // 如果有 conversation_id，添加到请求中以维持会话上下文
    if (conversation_id) {
      requestBody.conversation_id = conversation_id;
    }

    const response = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Dify API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Dify API error response:', errorData);
      return NextResponse.json(
        { error: '无法获取回复' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      answer: data.answer || '没有收到回复',
      conversation_id: data.conversation_id, // 返回 conversation_id 以便前端维持会话
    });

  } catch (error) {
    console.error('Dify API error:', error);
    return NextResponse.json(
      { error: '请求失败，请稍后再试' },
      { status: 500 }
    );
  }
}
