import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { query } = body;
    console.log('Query value:', query, 'Type:', typeof query);

    if (!query || typeof query !== 'string') {
      console.log('Validation failed: query is empty or not a string');
      return NextResponse.json(
        { error: '请输入有效内容' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DIFY_EXPLORE_API_KEY;
    console.log('API Key exists:', !!apiKey);
    if (!apiKey) {
      return NextResponse.json(
        { error: '服务配置错误' },
        { status: 500 }
      );
    }

    console.log('Calling Dify API with query:', query);
    const response = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        response_mode: 'blocking',
        user: 'anonymous',
      }),
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
    });

  } catch (error) {
    console.error('Dify API error:', error);
    return NextResponse.json(
      { error: '请求失败，请稍后再试' },
      { status: 500 }
    );
  }
}
