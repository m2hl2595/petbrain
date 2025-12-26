/**
 * 狗狗信息提取器 - 基于确定性意图识别
 * 核心规则：动作动词 + 目标信息 + 语境判断
 */

interface ExtractedDogInfo {
  breed: string | null;
  ageMonths: string | null;
  companionHours: string | null;
}

export class DogInfoExtractor {
  // ==================== 犬种库 ====================
  private static DOG_BREEDS = [
    // 大型犬
    '金毛', '拉布拉多', '拉拉', '哈士奇', '萨摩耶', '萨摩', '阿拉斯加',
    '德牧', '德国牧羊犬', '边牧', '边境牧羊犬', '秋田', '柴犬', '松狮',

    // 中型犬
    '柯基', '比格', '雪纳瑞', '法斗', '法国斗牛犬', '英斗', '英国斗牛犬',
    '可卡', '巴哥', '沙皮',

    // 小型犬
    '泰迪', '贵宾', '比熊', '博美', '吉娃娃', '约克夏', '马尔济斯',
    '西施', '京巴', '蝴蝶犬', '小鹿犬', '雪纳瑞',
  ];

  // ==================== 动作动词库（Trigger Verbs）====================
  private static TRIGGER_VERBS = {
    // 直接拥有类
    ownership: [
      '定了', '买了', '买了只', '领养了', '马上要带回', '是只', '养了',
      '接回来了', '带回家了', '已经有了', '家里有只', '养的是',
    ],

    // 确定意图类
    decision: [
      '确定买', '选好了', '决定养', '最终选了', '就是', '确定是',
      '选定了', '定下来了', '准备养', '打算养',
    ],
  };

  // ==================== 排除词库（Negative Patterns）====================
  private static NEGATIVE_PATTERNS = {
    // 咨询/假设类
    consulting: [
      '好养吗', '怎么样', '考虑', '纠结', '想养', '推荐', '合适吗',
      '如何', '还是', '或者', '哪个好', '选哪个', '建议',
    ],

    // 否定类
    negation: [
      '不是', '不买', '没有', '不要', '不养', '不考虑', '不打算',
    ],
  };

  // ==================== 核心提取逻辑 ====================

  /**
   * 检查是否包含排除词
   */
  private static hasNegativePattern(text: string): boolean {
    const allNegatives = [
      ...this.NEGATIVE_PATTERNS.consulting,
      ...this.NEGATIVE_PATTERNS.negation,
    ];

    return allNegatives.some(pattern => text.includes(pattern));
  }

  /**
   * 检查是否包含动作动词
   */
  private static hasTriggerVerb(text: string): boolean {
    const allTriggers = [
      ...this.TRIGGER_VERBS.ownership,
      ...this.TRIGGER_VERBS.decision,
    ];

    return allTriggers.some(verb => text.includes(verb));
  }

  /**
   * 提取犬种（需要动作动词支持）
   */
  static extractBreed(text: string): string | null {
    // 步骤1：检查排除词
    if (this.hasNegativePattern(text)) {
      return null;
    }

    // 步骤2：检查动作动词
    if (!this.hasTriggerVerb(text)) {
      return null;
    }

    // 步骤3：提取犬种
    for (const breed of this.DOG_BREEDS) {
      if (text.includes(breed)) {
        return breed;
      }
    }

    return null;
  }

  /**
   * 提取月龄（需要动作动词支持）
   */
  static extractAgeMonths(text: string): string | null {
    // 步骤1：检查排除词
    if (this.hasNegativePattern(text)) {
      return null;
    }

    // 步骤2：检查动作动词
    if (!this.hasTriggerVerb(text)) {
      return null;
    }

    // 步骤3：提取月龄
    // 幼犬/成犬描述
    if (/幼犬|幼年|小狗|刚出生/.test(text)) {
      return '1-3';
    }
    if (/成犬|成年|大狗/.test(text)) {
      return '12+';
    }

    // 精确月龄匹配
    const patterns = [
      /(\d+)\s*个?月(?:龄|大)?/,  // 3个月、3月龄、3个月大
      /(\d+)\s*月大/,              // 3月大
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const months = parseInt(match[1]);
        return this.mapToAgeRange(months);
      }
    }

    return null;
  }

  /**
   * 提取陪伴时间（需要动作动词或陪伴相关动词）
   */
  static extractCompanionHours(text: string): string | null {
    // 对于陪伴时间，放宽触发条件（可以单独提到陪伴时间）
    // 但仍需检查排除词
    if (this.hasNegativePattern(text)) {
      return null;
    }

    // 陪伴时间的特定触发词
    const companionTriggers = [
      '每天', '一天', '工作日', '周末', '在家', '陪伴',
      ...this.TRIGGER_VERBS.ownership,
      ...this.TRIGGER_VERBS.decision,
    ];

    const hasCompanionContext = companionTriggers.some(trigger =>
      text.includes(trigger)
    );

    if (!hasCompanionContext) {
      return null;
    }

    // 全天相关
    if (/全天|整天|一整天|24小?时|一直在家/.test(text)) {
      return '≥8h';
    }

    // 大部分时间
    if (/大部分|基本在家|经常在家|多数时间/.test(text)) {
      return '4-8h';
    }

    // 上班族（陪伴时间少）
    if (/上班族|朝九晚五|白天上班|工作日上班/.test(text)) {
      return '≤1h';
    }

    // 精确小时数匹配
    const hourPatterns = [
      /[每一]\s*天\s*(\d+)\s*[-到至]?\s*(\d+)?\s*个?小?时/,
      /能陪\s*(\d+)\s*[-到至]?\s*(\d+)?\s*个?小?时/,
      /陪伴\s*(\d+)\s*[-到至]?\s*(\d+)?\s*个?小?时/,
    ];

    for (const pattern of hourPatterns) {
      const match = text.match(pattern);
      if (match) {
        const hours = parseInt(match[1]);
        const hours2 = match[2] ? parseInt(match[2]) : null;

        // 如果是区间，取中间值
        const avgHours = hours2 ? (hours + hours2) / 2 : hours;

        if (avgHours <= 1) return '≤1h';
        if (avgHours <= 3) return '2-3h';
        if (avgHours <= 8) return '4-8h';
        return '≥8h';
      }
    }

    return null;
  }

  /**
   * 综合提取所有信息
   */
  static extract(text: string): ExtractedDogInfo {
    return {
      breed: this.extractBreed(text),
      ageMonths: this.extractAgeMonths(text),
      companionHours: this.extractCompanionHours(text),
    };
  }

  /**
   * 月龄数值映射到区间
   */
  private static mapToAgeRange(months: number): string {
    if (months <= 3) return '1-3';
    if (months <= 6) return '4-6';
    if (months <= 12) return '6-12';
    return '12+';
  }
}

// ==================== 测试用例（开发时使用）====================
export const TEST_CASES = {
  // ✅ 应该提取
  shouldExtract: [
    { text: '我买了只金毛', expected: { breed: '金毛' } },
    { text: '定了一只3个月的拉布拉多', expected: { breed: '拉布拉多', ageMonths: '1-3' } },
    { text: '领养了只泰迪，5个月大', expected: { breed: '泰迪', ageMonths: '4-6' } },
    { text: '确定买金毛了', expected: { breed: '金毛' } },
    { text: '选好了，就是柯基', expected: { breed: '柯基' } },
    { text: '家里养了只哈士奇', expected: { breed: '哈士奇' } },
    { text: '我每天能陪8小时', expected: { companionHours: '≥8h' } },
    { text: '上班族，陪伴时间少', expected: { companionHours: '≤1h' } },
  ],

  // ❌ 不应该提取
  shouldNotExtract: [
    { text: '金毛好养吗？', expected: { breed: null } },
    { text: '我在考虑养金毛', expected: { breed: null } },
    { text: '金毛和泰迪选哪个？', expected: { breed: null } },
    { text: '我想养只狗', expected: { breed: null } },
    { text: '推荐一个犬种', expected: { breed: null } },
    { text: '不养金毛', expected: { breed: null } },
    { text: '我没有狗', expected: { breed: null } },
  ],
};
