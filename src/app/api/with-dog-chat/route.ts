import { NextRequest, NextResponse } from 'next/server';

// Dify API 请求体类型定义
interface DifyRequestBody {
  inputs: {
    breed: string;
    ageMonths: string;
    companionHours: string;
    daysHome: string;
    generateDailyCard: string;
  };
  query: string;
  response_mode: string;
  user: string;
  conversation_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('With-Dog Chat - Received request body:', body);

    const { query, conversation_id, dogInfo, generateDailyCard } = body;
    console.log('Query:', query);
    console.log('conversation_id:', conversation_id);
    console.log('dogInfo:', dogInfo);
    console.log('generateDailyCard:', generateDailyCard);

    if (!query || typeof query !== 'string') {
      console.log('Validation failed: query is empty or not a string');
      return NextResponse.json(
        { error: '请输入有效内容' },
        { status: 400 }
      );
    }

    if (!dogInfo || !dogInfo.breed || !dogInfo.ageMonths || !dogInfo.companionHours || !dogInfo.daysHome) {
      console.log('Validation failed: dogInfo is incomplete');
      return NextResponse.json(
        { error: '狗狗信息不完整' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DIFY_WITHDOG_API_KEY;
    console.log('API Key exists:', !!apiKey);
    if (!apiKey) {
      return NextResponse.json(
        { error: '服务配置错误' },
        { status: 500 }
      );
    }

    console.log('Calling Dify API with query:', query);
    const requestBody: DifyRequestBody = {
      // 传递5个Input Variables到Dify
      inputs: {
        breed: dogInfo.breed,
        ageMonths: dogInfo.ageMonths,
        companionHours: dogInfo.companionHours,
        daysHome: String(dogInfo.daysHome), // 转为字符串
        generateDailyCard: generateDailyCard ? 'true' : 'false', // 转为字符串
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
    console.error('With-Dog Chat API error:', error);
    return NextResponse.json(
      { error: '请求失败，请稍后再试' },
      { status: 500 }
    );
  }
}
