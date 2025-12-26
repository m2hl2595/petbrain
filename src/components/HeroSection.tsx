/**
 * Hero Section - Slogan 区块
 * Calm Tech + Soft Brutalism 设计
 */

export default function HeroSection() {
  return (
    <section className="w-full bg-[#FAFAFA] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* 左侧文字区域 */}
          <div className="flex-1 space-y-6">
            {/* 主标题 */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] leading-tight">
              petBrain — 让你的养狗之旅从第一天开始就充满信心与准备
            </h1>

            {/* 副标题 */}
            <p className="text-lg md:text-xl text-[#666666] leading-relaxed font-normal">
              为新手狗主人量身打造的陪伴型应用，从选狗到生活陪伴，帮你安心度过适应期
            </p>
          </div>

          {/* 右侧插画区域 - 增大尺寸与标题平衡 */}
          <div className="flex-shrink-0 w-full md:w-[500px] h-80 md:h-[500px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/petbrain_landingpage.png"
              alt="petBrain - 养狗陪伴应用插画"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
