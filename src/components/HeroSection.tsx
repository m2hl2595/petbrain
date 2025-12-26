/**
 * Hero Section - Slogan 区块
 * Soft Brutalism 设计 - 激进压缩高度 + 释放文字宽度 + 强制露出下方内容
 */

export default function HeroSection() {
  return (
    <section className="w-full bg-[#FAFAFA]">
      {/* 激进压缩至 75vh - 强制露出下方 BentoStageCard */}
      <div className="relative w-full h-[75vh] overflow-hidden">

        {/* 内容容器 - 精准垂直居中 + 极简左侧留白 */}
        <div className="max-w-7xl mx-auto h-full flex items-center pl-4 md:pl-6 lg:pl-8 pr-4">

          {/* 文字区域 - 释放至 75% 宽度 + 层级置顶 */}
          <div className="relative z-10 max-w-[75%] space-y-6">

            {/* 主标题 - 单行展示 + 悬浮感 */}
            <h1 className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-extrabold text-[#1A1A1A]
                          leading-tight tracking-tighter
                          drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              petBrain：告别养狗迷茫，感受纯粹陪伴
            </h1>

            {/* 副标题 - 最多两行 + 轻盈感 */}
            <p className="text-base md:text-lg lg:text-xl text-[#666666]
                         leading-relaxed font-normal
                         drop-shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              为新手狗主人量身打造的陪伴型 AI，告别盲目焦虑，帮你安心度过 30 天适应期
            </p>

          </div>

          {/* SVG 插画 - 右偏移 + 溢出 + 底层 */}
          <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 z-0
                         w-[55vw] h-[55vw] max-h-[70vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/petbrain_landingpage.svg"
              alt="petBrain - 养狗陪伴应用插画"
              className="w-full h-full object-contain object-center"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
