'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserStage, setUserStage } from '@/lib/storage';
import type { UserStage } from '@/types';
import HeroSection from '@/components/HeroSection';
import BentoStageCard from '@/components/BentoStageCard';

export default function Home() {
  const router = useRouter();
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    const currentStage = getUserStage();

    if (currentStage) {
      // 如果已有阶段，自动跳转到对应页面
      const routeMap: Record<UserStage, string> = {
        explore: '/explore',
        prep: '/prep',
        withDog: '/with-dog',
      };
      router.push(routeMap[currentStage]);
    }
  }, [router]);

  const handleStageSelect = (stage: UserStage) => {
    setUserStage(stage);
    const routeMap: Record<UserStage, string> = {
      explore: '/explore',
      prep: '/prep',
      withDog: '/with-dog',
    };
    router.push(routeMap[stage]);
  };

  // 三个阶段的配置数据（含主题色）
  const stages = [
    {
      id: 1,
      stage: 'explore' as UserStage,
      title: '探索阶段',
      subtitle: '先别急着买！聊聊你的生活，看你真的准备好了吗？',
      description:
        '养狗不是一场冲动决定，而是对狗狗和你生活方式的深刻承诺。先与我们聊聊，看看你是否真的准备好了。',
      buttonText: '开始探索',
      themeColor: '#64748B', // 理性蓝灰
    },
    {
      id: 2,
      stage: 'prep' as UserStage,
      title: '准备阶段',
      subtitle: '倒计时开始了，准备好迎接新成员！',
      description:
        '如果你已经选好狗狗，准备好迎接它的到来了吗？根据你的养狗方式，我们为你准备了一份清单，帮助你有条不紊地为狗狗做准备。',
      buttonText: '准备迎接',
      themeColor: '#718072', // 秩序苔绿
    },
    {
      id: 3,
      stage: 'withDog' as UserStage,
      title: '陪伴阶段',
      subtitle: '欢迎来到新生活，它会一直陪着你！',
      description:
        '你的狗狗已经到家了吗？回答 5 个问题，我陪你一起度过 30 天适应期。',
      buttonText: '陪伴计划',
      themeColor: '#A88876', // 温暖陶土
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <HeroSection />

      {/* 阶段选择区域 */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* 区块标题 */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-4">
              选择你的阶段
            </h2>
            <p className="text-base md:text-lg text-[#666666]">
              每个阶段都有专属的陪伴方式，选择最适合你的开始
            </p>
          </div>

          {/* Bento 手风琴卡片 - 扩充至 max-w-7xl + 响应式网格 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {stages.map((stage) => (
              <BentoStageCard
                key={stage.id}
                stageNumber={stage.id}
                title={stage.title}
                subtitle={stage.subtitle}
                description={stage.description}
                buttonText={stage.buttonText}
                themeColor={stage.themeColor}
                onClick={() => handleStageSelect(stage.stage)}
                isActive={activeCard === stage.id}
                onHover={(isHovered) => {
                  setActiveCard(isHovered ? stage.id : null);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer 留白 */}
      <div className="h-20 bg-[#FAFAFA]" />
    </div>
  );
}
