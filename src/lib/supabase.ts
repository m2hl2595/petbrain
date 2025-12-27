/**
 * Supabase Client & Database Operations
 * Day 11 - 2025-12-25
 *
 * 功能：
 * 1. Supabase客户端初始化
 * 2. 匿名用户管理
 * 3. 数据库CRUD操作
 * 4. 记忆管理机制（explore不存、prep存、withDog存）
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// 类型定义
// ============================================

export interface User {
  id: string;
  created_at: string;
}

export interface UserState {
  user_id: string;
  current_stage: 'explore' | 'prep' | 'withDog';
  updated_at: string;
}

export interface DogInfo {
  user_id: string;
  breed: string;
  age_months: string;
  companion_hours: string;
  home_date: string; // 到家日期 (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}

export interface DailyCard {
  user_id: string;
  card_date: string; // ISO date string (YYYY-MM-DD)
  focus: string;
  forbidden: string;
  reason: string;
  created_at: string;
}

// ============================================
// Supabase客户端初始化
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// 用户管理
// ============================================

/**
 * 获取或创建匿名用户
 * 策略：
 * 1. 首先从localStorage读取user_id
 * 2. 如果不存在，创建新用户并存储到localStorage
 * 3. 返回user_id
 */
export async function getOrCreateUser(): Promise<string> {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined') {
    throw new Error('getOrCreateUser can only be called in browser environment');
  }

  // 检查localStorage中是否已有user_id
  const storedUserId = localStorage.getItem('petbrain_user_id');

  if (storedUserId) {
    // 验证user_id在数据库中是否存在
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', storedUserId)
      .single();

    if (data && !error) {
      return storedUserId;
    }
  }

  // 创建新用户
  const { data, error } = await supabase
    .from('users')
    .insert({})
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  // 存储到localStorage
  localStorage.setItem('petbrain_user_id', data.id);

  return data.id;
}

/**
 * 清除用户数据（用于测试或重置）
 */
export function clearUserData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('petbrain_user_id');
  localStorage.removeItem('petbrain_current_stage');
}

// ============================================
// 阶段状态管理（user_state表）
// ============================================

/**
 * 获取用户当前阶段
 */
export async function getUserStage(userId: string): Promise<'explore' | 'prep' | 'withDog' | null> {
  const { data, error } = await supabase
    .from('user_state')
    .select('current_stage')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 没有找到记录，返回null
      return null;
    }
    console.error('Error fetching user stage:', error);
    throw error;
  }

  return data.current_stage;
}

/**
 * 更新用户当前阶段
 */
export async function updateUserStage(
  userId: string,
  stage: 'explore' | 'prep' | 'withDog'
): Promise<void> {
  const { error } = await supabase
    .from('user_state')
    .upsert({
      user_id: userId,
      current_stage: stage,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating user stage:', error);
    throw error;
  }

  // 同步到localStorage（用于快速访问）
  if (typeof window !== 'undefined') {
    localStorage.setItem('petbrain_current_stage', stage);
  }
}

// ============================================
// 狗狗信息管理（dog_info表）
// ============================================

/**
 * 获取狗狗信息
 */
export async function getDogInfo(userId: string): Promise<DogInfo | null> {
  const { data, error } = await supabase
    .from('dog_info')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 没有找到记录，返回null
      return null;
    }
    console.error('Error fetching dog info:', error);
    throw error;
  }

  return data;
}

/**
 * 保存狗狗信息（prep阶段产出）
 */
export async function saveDogInfo(
  userId: string,
  dogInfo: Omit<DogInfo, 'user_id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const { error } = await supabase
    .from('dog_info')
    .upsert({
      user_id: userId,
      ...dogInfo,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving dog info:', error);
    throw error;
  }
}

/**
 * 删除狗狗信息（用于重置）
 */
export async function deleteDogInfo(userId: string): Promise<void> {
  const { error } = await supabase
    .from('dog_info')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting dog info:', error);
    throw error;
  }
}

// ============================================
// 今日卡片管理（daily_card表）
// ============================================

/**
 * 获取今日卡片
 */
export async function getTodayCard(userId: string): Promise<DailyCard | null> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('daily_card')
    .select('*')
    .eq('user_id', userId)
    .eq('card_date', today)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 没有找到记录，返回null
      return null;
    }
    console.error('Error fetching today card:', error);
    throw error;
  }

  return data;
}

/**
 * 保存今日卡片
 */
export async function saveTodayCard(
  userId: string,
  card: { focus: string; forbidden: string; reason: string }
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { error } = await supabase
    .from('daily_card')
    .upsert({
      user_id: userId,
      card_date: today,
      ...card
    });

  if (error) {
    console.error('Error saving today card:', error);
    throw error;
  }
}

/**
 * 获取用户所有卡片历史（可选，用于未来扩展）
 */
export async function getCardHistory(userId: string): Promise<DailyCard[]> {
  const { data, error } = await supabase
    .from('daily_card')
    .select('*')
    .eq('user_id', userId)
    .order('card_date', { ascending: false });

  if (error) {
    console.error('Error fetching card history:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// 记忆管理机制
// ============================================

/**
 * 阶段切换时的数据处理
 *
 * 规则：
 * 1. explore → prep: 无需处理（explore不存储数据）
 * 2. prep → withDog: 自动传递dog_info
 * 3. withDog → prep: 保留dog_info（用户可修改）
 */
export async function handleStageTransition(
  userId: string,
  fromStage: 'explore' | 'prep' | 'withDog' | null,
  toStage: 'explore' | 'prep' | 'withDog'
): Promise<void> {
  // 更新阶段状态
  await updateUserStage(userId, toStage);

  // 根据阶段切换规则处理数据
  if (fromStage === 'explore' && toStage === 'prep') {
    // explore → prep: 无需处理
    console.log('Stage transition: explore → prep (no data to transfer)');
  } else if (fromStage === 'prep' && toStage === 'withDog') {
    // prep → withDog: 自动传递dog_info
    const dogInfo = await getDogInfo(userId);
    if (dogInfo) {
      console.log('Stage transition: prep → withDog (dog_info transferred)');
    } else {
      console.warn('Stage transition: prep → withDog (no dog_info found)');
    }
  } else if (fromStage === 'withDog' && toStage === 'prep') {
    // withDog → prep: 保留dog_info
    console.log('Stage transition: withDog → prep (dog_info retained)');
  }
}

// ============================================
// 导出所有功能
// ============================================

const supabaseAPI = {
  // 客户端
  supabase,

  // 用户管理
  getOrCreateUser,
  clearUserData,

  // 阶段状态
  getUserStage,
  updateUserStage,

  // 狗狗信息
  getDogInfo,
  saveDogInfo,
  deleteDogInfo,

  // 今日卡片
  getTodayCard,
  saveTodayCard,
  getCardHistory,

  // 阶段切换
  handleStageTransition
};

export default supabaseAPI;
