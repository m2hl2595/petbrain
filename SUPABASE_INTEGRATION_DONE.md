# ✅ Supabase 数据库集成完成

## 📊 集成状态

### ✅ 已完成

1. **Supabase 客户端**：`src/lib/supabase.ts` 已创建并更新
2. **数据库操作函数**：完整的 CRUD 功能
3. **With-Dog 页面集成**：优先从 Supabase 读取，降级到 localStorage
4. **数据同步**：双向同步（Supabase ↔ localStorage）
5. **SSR 兼容性**：所有 localStorage 访问已添加浏览器环境检查
6. **构建验证**：Next.js 生产构建通过

---

## 🚀 需要你执行的步骤

### **步骤 1：更新数据库表结构** ⚠️ 重要

**在 Supabase Dashboard 执行以下 SQL：**

```sql
-- 更新 dog_info 表，将 days_home 改为 home_date
ALTER TABLE dog_info
  DROP COLUMN IF EXISTS days_home,
  ADD COLUMN home_date DATE NOT NULL DEFAULT CURRENT_DATE;

COMMENT ON COLUMN dog_info.home_date IS '狗狗到家的日期，用于自动计算天数';
```

**执行位置：**
1. 打开 Supabase Dashboard
2. 进入你的项目
3. 左侧菜单 → SQL Editor
4. 粘贴上述 SQL → Run

---

### **步骤 2：配置环境变量** ⚠️ 重要

**检查 `.env.local` 文件是否包含：**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**获取这些值：**
1. Supabase Dashboard → Settings → API
2. 复制 `Project URL` → 粘贴到 `NEXT_PUBLIC_SUPABASE_URL`
3. 复制 `anon public` key → 粘贴到 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎯 数据流说明

### **数据读取优先级**

```
1. Supabase（云端）✅
   ↓ 失败/无数据
2. localStorage（本地）⚠️
   ↓ 失败/无数据
3. 打开表单（新用户）📝
```

### **数据保存策略**

```
用户操作
  ↓
保存到 Supabase ✅
  ↓
同步到 localStorage ✅（用于离线降级）
```

---

## 📋 已集成的功能

### **1. 用户管理**
- ✅ 匿名用户创建（自动生成 UUID）
- ✅ user_id 存储到 localStorage（持久化）
- ✅ 重复访问时复用 user_id

### **2. 狗狗信息**
- ✅ 从 Supabase 读取狗狗信息
- ✅ 自动计算天数（基于 `home_date`）
- ✅ 保存到 Supabase + localStorage
- ✅ 支持信息修改

### **3. 今日卡片**
- ✅ 从 Supabase 读取今日卡片
- ✅ 保存到 Supabase + localStorage
- ✅ 按日期查询（避免重复生成）

---

## 🧪 测试步骤

### **测试 1：新用户流程**

1. **清空数据**：
   ```javascript
   // 在浏览器控制台运行
   localStorage.clear();
   ```

2. **刷新页面**：
   - 应该看到"填写狗狗信息"弹窗
   - 控制台应该显示：`✅ 用户ID: xxxx-xxxx-xxxx`

3. **填写表单并提交**：
   - 控制台应该显示：`✅ 狗狗信息已保存到 Supabase`

4. **验证数据库**：
   - 在 Supabase Dashboard → Table Editor → dog_info
   - 应该看到新增的一条记录

---

### **测试 2：老用户流程**

1. **再次刷新页面**：
   - 不应该打开表单弹窗
   - 控制台应该显示：`✅ 从 Supabase 加载狗狗信息`
   - 应该看到之前填写的狗狗信息

2. **修改信息**：
   - 点击"修改信息"
   - 修改狗狗品种
   - 保存
   - 刷新页面，应该看到最新的信息

---

### **测试 3：天数自动增长**

1. **今天填写**：home_date = 2025-12-24
   - 应该显示"第 3 天"（2025-12-26）

2. **明天访问**（2025-12-27）：
   - 应该自动显示"第 4 天"

---

### **测试 4：离线降级**

1. **断开网络**：
   - 模拟 Supabase 失败

2. **刷新页面**：
   - 控制台应该显示：`❌ 初始化失败，降级到 localStorage`
   - 仍然能看到之前的狗狗信息（从 localStorage 读取）

---

## 🔧 故障排查

### **问题 1：控制台报错 "Missing Supabase environment variables"**

**解决方案：**
- 检查 `.env.local` 是否存在
- 检查环境变量名称是否正确（必须是 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- 重启开发服务器（`npm run dev`）

---

### **问题 2：保存数据时报错 "Error saving dog info"**

**解决方案：**
1. 检查数据库表是否已执行迁移 SQL
2. 检查 RLS 策略是否正确配置
3. 在 Supabase Dashboard → Logs 查看错误详情

---

### **问题 3：数据保存成功，但刷新后看不到**

**解决方案：**
1. 检查控制台日志，确认是从 Supabase 还是 localStorage 读取
2. 在 Supabase Dashboard → Table Editor 查看数据是否真的保存了
3. 检查 user_id 是否一致（`localStorage.getItem('petbrain_user_id')`）

---

## 📊 数据库表结构（最终版）

### **users 表**
| 列名 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户ID（主键）|
| created_at | TIMESTAMP | 创建时间 |

### **dog_info 表**
| 列名 | 类型 | 说明 |
|------|------|------|
| user_id | UUID | 用户ID（外键）|
| breed | TEXT | 犬种 |
| age_months | TEXT | 月龄区间 |
| companion_hours | TEXT | 陪伴时间 |
| **home_date** | **DATE** | **到家日期（新）** |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### **daily_card 表**
| 列名 | 类型 | 说明 |
|------|------|------|
| user_id | UUID | 用户ID（外键）|
| card_date | DATE | 卡片日期 |
| focus | TEXT | 关注事项 |
| forbidden | TEXT | 禁止事项 |
| reason | TEXT | 原因说明 |
| created_at | TIMESTAMP | 创建时间 |

---

## 🎉 集成完成后的优势

1. ✅ **数据持久化**：用户数据保存到云端，换设备也不会丢失
2. ✅ **自动同步**：Supabase 和 localStorage 双向同步
3. ✅ **降级方案**：Supabase 失败时自动降级到 localStorage
4. ✅ **性能优化**：优先从云端读取，本地缓存加速
5. ✅ **扩展性强**：后续可以添加用户登录、数据分析等功能

---

## 🚧 后续可选优化

1. **用户登录**：替换匿名用户为真实用户（Supabase Auth）
2. **数据分析**：统计用户行为、使用时长等
3. **跨设备同步**：用户在多个设备上无缝切换
4. **备份恢复**：导出/导入用户数据
5. **性能监控**：Supabase 查询性能分析

---

## ✅ 技术修复记录

### SSR 兼容性修复（2025-12-26）

**问题**：Next.js 构建时出现 `localStorage is not defined` 错误

**原因**：在服务端渲染(SSR)期间访问了浏览器专有的 `localStorage` API

**修复**：
1. **src/lib/supabase.ts**：在所有 localStorage 访问前添加 `typeof window !== 'undefined'` 检查
   - `getOrCreateUser()`: 添加浏览器环境检查
   - `clearUserData()`: 添加浏览器环境检查
   - `updateUserStage()`: localStorage 同步前添加检查

2. **src/app/with-dog/page.tsx**：将渲染时的 localStorage 访问移到 useEffect
   - 创建 `extractedInfo` state 存储提取的狗狗信息
   - 在独立的 useEffect 中加载提取的信息
   - 移除 DogInfoModal initialData 中的 IIFE localStorage 访问

3. **src/app/with-dog/edit-info/page.tsx**：添加防御性检查
   - useEffect 开头添加浏览器环境检查
   - handleSubmit 函数添加浏览器环境检查

**验证**：
```bash
npm run build  # ✅ 构建成功，所有 11 个页面预渲染完成
```

---

**现在就执行步骤 1 和步骤 2，然后测试一下！** 🚀
