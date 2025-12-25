'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserStage, setUserStage } from '@/lib/storage';
import type { UserStage } from '@/types';

export default function Home() {
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-semibold mb-8 text-center">
          你现在处于哪个阶段？
        </h1>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleStageSelect('explore')}
            className="p-6 border border-gray-300 rounded-lg hover:border-gray-500 text-left"
          >
            <h2 className="text-xl font-medium mb-2">我在纠结要不要养狗</h2>
            <p className="text-gray-600 text-sm">还在探索阶段</p>
          </button>

          <button
            onClick={() => handleStageSelect('prep')}
            className="p-6 border border-gray-300 rounded-lg hover:border-gray-500 text-left"
          >
            <h2 className="text-xl font-medium mb-2">我已经选好狗了，但还没到家</h2>
            <p className="text-gray-600 text-sm">准备阶段</p>
          </button>

          <button
            onClick={() => handleStageSelect('withDog')}
            className="p-6 border border-gray-300 rounded-lg hover:border-gray-500 text-left"
          >
            <h2 className="text-xl font-medium mb-2">狗已经到家了</h2>
            <p className="text-gray-600 text-sm">陪伴阶段</p>
          </button>
        </div>
      </div>
    </div>
  );
}
