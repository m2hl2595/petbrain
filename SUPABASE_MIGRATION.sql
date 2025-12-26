-- ============================================
-- PetBrain Database Schema Migration
-- 更新 dog_info 表以支持 home_date
-- Day 12 - 2025-12-26
-- ============================================

-- 1. 删除旧的 days_home 列，添加 home_date 列
ALTER TABLE dog_info
  DROP COLUMN IF EXISTS days_home,
  ADD COLUMN home_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 2. 添加注释
COMMENT ON COLUMN dog_info.home_date IS '狗狗到家的日期，用于自动计算天数';

-- 3. 如果需要回滚（可选）
-- ALTER TABLE dog_info
--   DROP COLUMN home_date,
--   ADD COLUMN days_home INTEGER NOT NULL DEFAULT 1 CHECK (days_home >= 1 AND days_home <= 30);
