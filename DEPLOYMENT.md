# 📦 PetBrain 部署指南

完整的部署流程说明，包含 Vercel、Supabase 和 Dify AI 的配置步骤。

---

## 🎯 部署架构

```
用户浏览器
    ↓
Vercel 全球 CDN
    ↓
Next.js App (SSR + API Routes)
    ├─→ Dify AI API (对话能力)
    └─→ Supabase (数据存储)
```

---

## 📋 前置准备

### 1. 必需账号

- ✅ [GitHub](https://github.com) 账号
- ✅ [Vercel](https://vercel.com) 账号（可用 GitHub 登录）
- ✅ [Supabase](https://supabase.com) 账号
- ✅ [Dify.ai](https://dify.ai) 账号

### 2. 本地环境

- Node.js 18.17 或更高版本
- npm 或 yarn
- Git

---

## 🚀 一、Vercel 部署

### 步骤 1：导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → 选择 **"Project"**
3. 授权访问你的 GitHub 账号
4. 找到并选择 `petbrain` 仓库
5. 点击 **"Import"**

### 步骤 2：项目配置

#### Framework Preset
Vercel 会自动识别为 **Next.js** 项目，无需修改。

#### Build Settings
默认配置即可：
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Root Directory
保持默认 `./`

### 步骤 3：配置环境变量

在 **Environment Variables** 部分，逐个添加以下变量：

#### 应用配置

```bash
# 变量名
NEXT_PUBLIC_APP_NAME

# 值
PetBrain

# 环境（全选）
✅ Production
✅ Preview
✅ Development
```

```bash
# 变量名
NEXT_PUBLIC_APP_URL

# 值（部署后需要更新为实际域名）
https://your-project.vercel.app

# 环境
✅ Production
✅ Preview
✅ Development
```

#### Supabase 配置

参考 [二、Supabase 配置](#二supabase-配置) 获取这些值。

```bash
NEXT_PUBLIC_SUPABASE_URL
# 值：https://your-project.supabase.co
```

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY
# 值：你的 Supabase anon key（长字符串）
```

#### Dify AI 配置

参考 [三、Dify AI 配置](#三dify-ai-配置) 获取这些值。

```bash
DIFY_EXPLORE_API_KEY
# 值：app-xxxxxxxxxxxxxxx
```

```bash
DIFY_PREP_API_KEY
# 值：app-xxxxxxxxxxxxxxx
```

```bash
DIFY_WITHDOG_API_KEY
# 值：app-xxxxxxxxxxxxxxx
```

```bash
DIFY_API_URL
# 值：https://api.dify.ai/v1
```

### 步骤 4：开始部署

1. 检查所有配置无误
2. 点击 **"Deploy"** 按钮
3. 等待 2-3 分钟，Vercel 会自动：
   - 克隆 GitHub 仓库
   - 安装依赖
   - 运行构建
   - 部署到全球 CDN

### 步骤 5：获取部署 URL

部署成功后，你会看到：
- **Production URL**: `https://petbrain.vercel.app`（或你的自定义域名）
- 每次 `git push` 到 main 分支都会自动触发重新部署

### 步骤 6：更新环境变量

回到 **Settings** → **Environment Variables**：
1. 找到 `NEXT_PUBLIC_APP_URL`
2. 点击 **Edit**
3. 更新为实际的生产 URL（如 `https://petbrain.vercel.app`）
4. 点击 **Save**

然后触发重新部署：
- **Deployments** 页面 → 最新部署 → **"..."** → **"Redeploy"**

---

## 🗄️ 二、Supabase 配置

### 步骤 1：创建项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 **"New Project"**
3. 填写项目信息：
   - **Name**: `petbrain`
   - **Database Password**: 设置一个强密码（请妥善保存）
   - **Region**: 选择离你用户最近的区域（如 `East Asia (Singapore)`）
4. 点击 **"Create new project"**
5. 等待 2-3 分钟初始化完成

### 步骤 2：执行数据库迁移

项目创建完成后：

1. 左侧菜单 → **SQL Editor**
2. 点击 **"New query"**
3. 复制以下 SQL 并粘贴：

```sql
-- ============================================
-- PetBrain 数据库表结构
-- ============================================

-- 1. 创建 users 表（匿名用户管理）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 dog_info 表（狗狗信息）
CREATE TABLE dog_info (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  breed TEXT NOT NULL,
  age_months TEXT NOT NULL,
  companion_hours TEXT NOT NULL,
  home_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加注释
COMMENT ON COLUMN dog_info.home_date IS '狗狗到家的日期，用于自动计算天数';

-- 3. 创建 daily_card 表（每日关注卡片）
CREATE TABLE daily_card (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_date DATE NOT NULL,
  focus TEXT NOT NULL,
  forbidden TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, card_date)
);

-- 添加索引（提升查询性能）
CREATE INDEX idx_daily_card_user_date ON daily_card(user_id, card_date DESC);

-- ============================================
-- Row Level Security (RLS) 策略（可选）
-- ============================================

-- 如果需要更细粒度的权限控制，可以启用 RLS
-- 注意：当前应用使用匿名用户，默认不启用 RLS

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dog_info ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_card ENABLE ROW LEVEL SECURITY;
```

4. 点击 **"Run"** 按钮执行
5. 确认 SQL 执行成功（底部显示 "Success. No rows returned"）

### 步骤 3：验证表结构

1. 左侧菜单 → **Table Editor**
2. 确认看到三个表：
   - ✅ `users`
   - ✅ `dog_info`
   - ✅ `daily_card`

### 步骤 4：获取 API 密钥

1. 左侧菜单 → **Settings** → **API**
2. 复制以下两个值：

**Project URL**
```
https://xxxxxxxxxxxxx.supabase.co
```
→ 用于 `NEXT_PUBLIC_SUPABASE_URL`

**anon public key**（长字符串，以 `eyJh...` 开头）
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```
→ 用于 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 步骤 5：配置到 Vercel

回到 Vercel 项目，在环境变量中添加这两个值（见步骤一）。

---

## 🤖 三、Dify AI 配置

Dify 是一个开源的 LLM 应用开发平台，PetBrain 使用它提供 AI 对话能力。

### 步骤 1：创建账号

1. 访问 [Dify.ai](https://dify.ai)
2. 点击 **"Get Started"** 注册账号
3. 登录后进入控制台

### 步骤 2：创建 Explore 应用（养狗前咨询）

1. 点击 **"Create App"** → 选择 **"Chat App"**
2. 填写信息：
   - **App Name**: `PetBrain Explore`
   - **Description**: `养狗前咨询阶段，帮助用户选狗`
3. 点击 **"Create"**

#### 配置提示词（Prompt）

进入应用后，在 **Prompt** 编辑器中输入：

```
你是 PetBrain 的养狗咨询专家。你的任务是帮助用户在养狗前做出明智的决策。

## 你的目标
1. 了解用户的生活方式（居住环境、工作时间、家庭成员）
2. 推荐适合的犬种
3. 评估用户是否适合养狗
4. 回答用户关于养狗的疑问

## 回答风格
- 友好、耐心、专业
- 避免说教，引导式提问
- 提供具体、可操作的建议

## 重要提醒
- 如果用户明显不适合养狗，温和地说明原因
- 强调养狗是长期承诺（10-15年）
- 提醒考虑经济成本
```

#### 发布应用

1. 点击右上角 **"Publish"**
2. 确认发布

#### 获取 API Key

1. 点击左侧 **"API Access"**
2. 复制 **API Key**（以 `app-` 开头）
3. 保存为 `DIFY_EXPLORE_API_KEY`

### 步骤 3：创建 Prep 应用（准备阶段）

重复步骤 2，创建第二个应用：

**App Name**: `PetBrain Prep`

**Prompt**:
```
你是 PetBrain 的养狗准备顾问。用户已经决定养狗，需要你帮助他们做好准备。

## 你的任务
1. 了解用户选择的犬种和到家时间
2. 提供个性化的准备建议
3. 回答关于物品采购、环境准备的问题
4. 当用户请求时，生成准备清单

## 清单生成格式
当用户说"生成清单"或"请根据我们的对话生成准备清单"时，使用 Markdown 格式输出：

### 🛒 必备物品
- [ ] 狗粮（幼犬专用）
- [ ] 食碗、水碗
- ...

### 🏠 环境准备
- [ ] 清理地面危险物品
- [ ] 设置狗狗专属区域
- ...

## 回答风格
- 专业、细致、有条理
- 使用 Markdown 格式，便于阅读
- 提供具体品牌和价格参考
```

获取 API Key 保存为 `DIFY_PREP_API_KEY`。

### 步骤 4：创建 With-Dog 应用（陪伴阶段）

**App Name**: `PetBrain With-Dog`

**Prompt**:
```
你是 PetBrain 的养宠陪伴专家。狗狗已经到家，你要陪伴主人度过适应期的前 30 天。

## 输入变量
你会收到以下信息（通过 Input Variables）：
- breed: 犬种
- ageMonths: 月龄区间
- companionHours: 每天陪伴时间
- daysHome: 到家第几天
- generateDailyCard: 是否生成今日卡片（"true" 或 "false"）

## 你的任务

### 1. 日常对话
回答主人关于养狗的任何问题，基于：
- 犬种特性（breed）
- 狗狗月龄（ageMonths）
- 到家天数（daysHome）

### 2. 生成今日卡片
当 generateDailyCard == "true" 时，必须严格按以下格式输出：

✅ 今天最需要关注的事：
[基于 daysHome 给出当天最重要的一件事]

❌ 今天容易犯的错误：
[基于新手常见问题，提醒今天要避免的事]

ℹ️ 为什么：
[解释原因，简洁易懂]

## 回答风格
- 温暖、鼓励、专业
- 关注主人的情绪（养狗初期压力大）
- 提供具体、可操作的建议
```

#### 配置 Input Variables

1. 进入应用后，点击 **"Variables"**
2. 添加以下变量：

| Variable Name | Type | Required |
|--------------|------|----------|
| breed | Text | Yes |
| ageMonths | Text | Yes |
| companionHours | Text | Yes |
| daysHome | Number | Yes |
| generateDailyCard | Text | Yes |

3. 在 Prompt 中使用：`{{breed}}`, `{{ageMonths}}`, `{{daysHome}}` 等

获取 API Key 保存为 `DIFY_WITHDOG_API_KEY`。

### 步骤 5：配置到 Vercel

将三个 API Key 添加到 Vercel 环境变量（见步骤一）。

---

## ✅ 部署验证

### 1. 检查环境变量

Vercel 项目 → **Settings** → **Environment Variables**

确认所有 8 个变量都已配置：
- ✅ NEXT_PUBLIC_APP_NAME
- ✅ NEXT_PUBLIC_APP_URL
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ DIFY_EXPLORE_API_KEY
- ✅ DIFY_PREP_API_KEY
- ✅ DIFY_WITHDOG_API_KEY
- ✅ DIFY_API_URL

### 2. 触发重新部署

**Deployments** → 最新部署 → **"..."** → **"Redeploy"**

### 3. 功能测试

访问你的生产 URL，依次测试：

#### Explore 页面 (`/explore`)
- [ ] 发送消息"我想养一只金毛"
- [ ] 检查 AI 是否正常回复
- [ ] 刷新页面，确认对话历史保留

#### Prep 页面 (`/prep`)
- [ ] 发送消息"我需要准备哪些东西"
- [ ] 检查 Markdown 是否正确渲染
- [ ] 检查对话历史持久化

#### With-Dog 页面 (`/with-dog`)
- [ ] 填写狗狗信息表单（犬种、月龄、陪伴时间、到家日期）
- [ ] 点击"保存并继续"
- [ ] 检查是否显示"第 X 天"
- [ ] 点击"生成今日卡片"
- [ ] 检查卡片内容格式是否正确
- [ ] 发送普通消息，测试对话功能
- [ ] 刷新页面，确认狗狗信息和对话历史保留

### 4. 数据库验证

Supabase Dashboard → **Table Editor**

- [ ] `users` 表中有新用户记录
- [ ] `dog_info` 表中有狗狗信息
- [ ] `daily_card` 表中有今日卡片（如果生成过）

---

## 🔧 故障排查

### 问题 1：部署失败

**症状**: Vercel 构建时报错

**排查步骤**:
1. 查看 Vercel Deployments → 失败的部署 → **Build Logs**
2. 检查是否是依赖安装失败：
   ```bash
   # 本地测试
   npm install
   npm run build
   ```
3. 检查 TypeScript 错误：
   ```bash
   npx tsc --noEmit
   ```

### 问题 2：环境变量未生效

**症状**: API 调用失败，提示"服务配置错误"

**排查步骤**:
1. Vercel → Settings → Environment Variables
2. 确认变量名拼写正确（区分大小写）
3. 确认变量已应用到 Production 环境
4. 修改环境变量后，必须重新部署

### 问题 3：Supabase 连接失败

**症状**: 控制台报错 "Missing Supabase environment variables"

**排查步骤**:
1. 检查 Supabase URL 和 Key 是否正确
2. 检查 Supabase 项目是否处于活跃状态
3. 查看 Supabase Dashboard → Settings → API 确认值

### 问题 4：Dify AI 无响应

**症状**: 发送消息后一直加载，无回复

**排查步骤**:
1. 检查 Dify API Key 是否正确
2. 检查 Dify 应用是否已发布（状态为 Published）
3. 查看浏览器控制台 Network 标签，检查 API 请求：
   - 如果返回 401：API Key 错误
   - 如果返回 404：应用未发布或 API URL 错误
   - 如果返回 500：Dify 服务异常

### 问题 5：页面空白

**症状**: 访问页面显示空白或"500 Internal Server Error"

**排查步骤**:
1. 查看 Vercel → Deployments → Functions → Errors
2. 检查浏览器控制台是否有 JavaScript 错误
3. 尝试访问其他页面（如 `/explore`）确认是否个别页面问题

---

## 📊 监控和维护

### Vercel Analytics

1. Vercel 项目 → **Analytics**
2. 查看：
   - 页面访问量
   - 地理分布
   - 设备类型
   - 加载性能

### Supabase 使用情况

1. Supabase Dashboard → **Usage**
2. 监控：
   - 数据库存储
   - API 请求次数
   - 带宽使用

### 日志查看

**Vercel 实时日志**:
```bash
# 安装 Vercel CLI
npm i -g vercel

# 查看实时日志
vercel logs --follow
```

**Supabase 日志**:
Supabase Dashboard → **Logs** → **API Logs**

---

## 🔄 持续部署

### 自动部署

每次 `git push` 到 main 分支，Vercel 会自动：
1. 检测到代码变更
2. 运行构建
3. 部署到生产环境
4. 更新 CDN 缓存

### 预览部署

每个 Pull Request 都会自动创建预览部署：
- 独立的预览 URL
- 与生产环境隔离
- 便于测试新功能

---

## 🌐 自定义域名（可选）

### 步骤 1：购买域名

推荐域名注册商：
- [Namecheap](https://www.namecheap.com)
- [GoDaddy](https://www.godaddy.com)
- [阿里云](https://wanwang.aliyun.com)

### 步骤 2：添加到 Vercel

1. Vercel 项目 → **Settings** → **Domains**
2. 输入你的域名（如 `petbrain.com`）
3. 点击 **"Add"**

### 步骤 3：配置 DNS

Vercel 会提供 DNS 记录配置指南：

```
Type: A
Name: @
Value: 76.76.21.21
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 步骤 4：等待 DNS 生效

通常需要 24-48 小时，可通过以下命令检查：

```bash
nslookup petbrain.com
```

---

## 🎉 部署完成

恭喜！你已经成功部署 PetBrain 到生产环境。

**下一步建议**:
- 📊 启用 Vercel Analytics 监控用户访问
- 🔔 配置 Vercel 部署通知（Slack/Email）
- 📱 测试移动端体验
- 🐛 集成错误监控（Sentry）
- 📈 收集用户反馈，持续优化

---

**需要帮助？** 查看项目 [README.md](./README.md) 或提交 [GitHub Issue](https://github.com/m2hl2595/petbrain/issues)。
