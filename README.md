# 🐾 PetBrain

**告别养狗迷茫，感受纯粹陪伴**

PetBrain 是一个为新手养宠者设计的 AI 陪伴应用，从选狗到到家 30 天，全程陪伴你的养宠之旅。

🌐 **在线体验：** [https://petbrain.vercel.app](https://petbrain.vercel.app)

---

## ✨ 核心功能

### 🔍 探索阶段 - 养狗前咨询
- AI 对话咨询，帮助你了解不同犬种特性
- 评估你的生活方式是否适合养狗
- 实时对话记忆，持续深入讨论

### 📋 准备阶段 - 有序准备
- 个性化准备清单生成
- Markdown 格式渲染，清晰易读
- 对话历史持久化，随时查看

### 🏠 陪伴阶段 - 30天适应期
- 基于狗狗信息的个性化建议
- 每日关注卡片（今天该做什么、不该做什么）
- 实时 AI 陪伴，解答养宠疑问
- 到家天数自动计算，见证成长

---

## 🛠️ 技术栈

### 前端框架
- **Next.js 16.1.1** - React 框架（App Router）
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS

### UI 设计理念
- **Calm Tech** - 平静技术，不打扰的陪伴
- **Soft Brutalism** - 柔和粗野主义（24px 圆角 + 1.5px 边框）
- **Bento Grid** - 便当盒式卡片布局

### 核心依赖
- **react-markdown** - Markdown 渲染
- **@supabase/supabase-js** - 数据库和存储
- **Dify AI** - AI 对话能力

### 数据层
- **Supabase** - PostgreSQL 数据库
  - 用户管理（匿名用户）
  - 狗狗信息存储
  - 每日卡片缓存
- **localStorage** - 本地降级方案
  - 对话历史持久化
  - 离线数据缓存

### 部署
- **Vercel** - 自动化部署和全球 CDN
- **GitHub** - 代码托管和版本控制

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/m2hl2595/petbrain.git
cd petbrain
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local` 文件并填入你的配置：

```bash
# 应用配置
NEXT_PUBLIC_APP_NAME=PetBrain
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Dify AI 配置
DIFY_EXPLORE_API_KEY=your_explore_api_key
DIFY_PREP_API_KEY=your_prep_api_key
DIFY_WITHDOG_API_KEY=your_withdog_api_key
DIFY_API_URL=https://api.dify.ai/v1
```

详细配置说明见 [部署指南](#-部署指南)。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

---

## 📁 项目结构

```
petbrain/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # 首页（Bento 卡片布局）
│   │   ├── explore/              # 探索阶段页面
│   │   ├── prep/                 # 准备阶段页面
│   │   ├── with-dog/             # 陪伴阶段页面
│   │   └── api/                  # API 路由
│   │       ├── chat/             # Explore 对话 API
│   │       ├── prep-chat/        # Prep 对话 API
│   │       └── with-dog-chat/    # With-Dog 对话 API
│   ├── components/               # React 组件
│   │   ├── BentoStageCard.tsx    # Bento 阶段卡片
│   │   ├── ChatMessageBubble.tsx # 聊天气泡（Markdown 渲染）
│   │   ├── ChatInputArea.tsx     # 聊天输入框
│   │   ├── DogInfoForm.tsx       # 狗狗信息表单
│   │   ├── DogInfoModal.tsx      # 狗狗信息弹窗
│   │   ├── DailyFocusCard.tsx    # 每日关注卡片
│   │   ├── DailyCardOverlay.tsx  # 卡片覆盖层
│   │   └── DailyCardBentoTab.tsx # 卡片悬浮标签
│   └── lib/                      # 工具函数
│       ├── supabase.ts           # Supabase 客户端
│       ├── storage.ts            # localStorage 封装
│       └── dogInfoExtractor.ts   # 狗狗信息提取器
├── public/                       # 静态资源
├── .env.local                    # 环境变量（不提交）
├── package.json                  # 依赖配置
├── tailwind.config.ts            # Tailwind 配置
└── tsconfig.json                 # TypeScript 配置
```

---

## 🎯 核心特性说明

### 1. 对话记忆管理

每个阶段都使用 Dify 的 `conversation_id` 机制实现对话记忆：

```typescript
// API 调用时传递 conversation_id
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    query: userMessage,
    conversation_id: conversationId, // 维持上下文
  }),
});
```

### 2. 数据持久化策略

采用 **Supabase + localStorage 双写** 策略：

```typescript
// 1. 先保存到 localStorage（立即反馈）
localStorage.setItem('petbrain_dog_info', JSON.stringify(data));

// 2. 更新 UI
setDogInfo(data);

// 3. 异步保存到 Supabase
await saveToSupabase(userId, data);
```

### 3. 日期验证时区处理

使用本地时区而非 UTC，避免日期选择器错误：

```typescript
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

### 4. 性能优化

使用 `next/dynamic` 懒加载大型组件：

```typescript
const DogInfoModal = dynamic(() => import('@/components/DogInfoModal'), {
  ssr: false,
});
```

---

## 📋 部署指南

### Vercel 部署（推荐）

1. **Fork 本项目到你的 GitHub**

2. **访问 [Vercel Dashboard](https://vercel.com/dashboard)**

3. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库

4. **配置环境变量**（参考 `.env.local`）
   - 所有以 `NEXT_PUBLIC_` 开头的变量
   - Dify API Keys
   - Supabase 连接信息

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待 2-3 分钟自动构建完成

### Supabase 数据库配置

#### 1. 创建项目

访问 [Supabase Dashboard](https://supabase.com/dashboard) 创建新项目。

#### 2. 执行数据库迁移

在 SQL Editor 中执行以下 SQL：

```sql
-- 创建 users 表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 dog_info 表
CREATE TABLE dog_info (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  breed TEXT NOT NULL,
  age_months TEXT NOT NULL,
  companion_hours TEXT NOT NULL,
  home_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 daily_card 表
CREATE TABLE daily_card (
  user_id UUID NOT NULL REFERENCES users(id),
  card_date DATE NOT NULL,
  focus TEXT NOT NULL,
  forbidden TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, card_date)
);
```

#### 3. 配置 RLS 策略（可选）

如果需要更细粒度的权限控制，可以配置 Row Level Security。

### Dify AI 配置

1. 访问 [Dify.ai](https://dify.ai) 创建账号
2. 创建三个 AI 应用：
   - **Explore App** - 养狗前咨询
   - **Prep App** - 准备阶段
   - **With-Dog App** - 陪伴阶段
3. 获取每个应用的 API Key 并配置到环境变量

---

## 🧑‍💻 开发指南

### 代码规范

项目已配置 ESLint 和 TypeScript 严格检查：

```bash
# 运行 ESLint 检查
npm run lint

# 运行 TypeScript 类型检查
npx tsc --noEmit
```

### 构建生产版本

```bash
npm run build
```

构建产物位于 `.next` 目录。

### 本地预览生产版本

```bash
npm run build
npm start
```

---

## 🐛 常见问题

### 1. 对话记忆丢失？

**原因：** `conversation_id` 未正确传递给 API。

**解决方案：** 检查 API 路由中是否正确接收并传递 `conversation_id` 参数。

### 2. 日期选择器显示"不能晚于今天"？

**原因：** 时区问题，使用了 UTC 时间而非本地时间。

**解决方案：** 已在 `DogInfoForm.tsx` 中使用 `formatLocalDate` 函数修复。

### 3. Supabase 保存失败？

**原因：** 数据库表结构未迁移或 RLS 策略配置错误。

**解决方案：**
- 检查数据库表是否存在 `home_date` 列（而非旧的 `days_home`）
- 检查 Supabase Dashboard → Logs 查看详细错误

### 4. 环境变量不生效？

**原因：** Next.js 需要重启才能读取新的环境变量。

**解决方案：** 修改 `.env.local` 后，重启开发服务器（`npm run dev`）。

---

## 📊 技术指标

- ✅ **ESLint**: 0 错误 0 警告
- ✅ **TypeScript**: 100% 类型检查通过
- ✅ **构建时间**: ~15 秒
- ✅ **静态页面**: 8 个预渲染页面
- ✅ **代码分割**: 懒加载弹窗组件
- ✅ **生产部署**: Vercel 全球 CDN

---

## 📜 开发历程

- **Day 1-10**: 基础功能实现
- **Day 11**: Supabase 数据库集成
- **Day 12**: UI 高级感重构（Calm Tech + Soft Brutalism）
- **Day 13**:
  - 端到端测试
  - Bug 修复（对话记忆、日期验证、数据持久化）
  - 代码质量提升（ESLint、TypeScript）
  - 性能优化（代码分割、懒加载）
  - Vercel 生产部署

---

## 🙏 致谢

- [Next.js](https://nextjs.org) - React 框架
- [Supabase](https://supabase.com) - 开源 Firebase 替代方案
- [Dify.ai](https://dify.ai) - AI 应用开发平台
- [Vercel](https://vercel.com) - 部署平台
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架

---

## 📄 许可证

MIT License

---

**Made with ❤️ by PetBrain Team**

🤖 Powered by [Claude Code](https://claude.com/claude-code)
