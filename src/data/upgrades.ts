/**
 * 升级配置数据
 * 添加新升级只需在这里添加配置！
 */

export interface UpgradeConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  requiredCharacters: string[]; // 'all' 表示所有角色可用
  apply: (player: any) => void;
  maxStack?: number; // 最大叠加次数
}

export const UPGRADES: UpgradeConfig[] = [
  // 露米娅专属升级
  {
    id: 'penetrate',
    name: '穿透弹',
    type: '强化',
    description: '子弹可穿透额外 1 个单位',
    requiredCharacters: ['rumia'],
    apply: (player) => {
      player.penetration = (player.penetration || 0) + 1;
    },
    maxStack: 5
  },
  {
    id: 'vuln',
    name: '黑暗侵蚀',
    type: '特效',
    description: 'DoT伤害增加 20% 易伤效果',
    requiredCharacters: ['rumia'],
    apply: (player) => {
      player.vulnPercent = (player.vulnPercent || 0) + 0.2;
    },
    maxStack: 3
  },
  {
    id: 'explode',
    name: '暗爆',
    type: '特效',
    description: '子弹命中造成小范围爆炸',
    requiredCharacters: ['rumia'],
    apply: (player) => {
      player.explode = true;
    }
  },

  // 妖梦专属升级
  {
    id: 'sword_intent',
    name: '剑意',
    type: '范围',
    description: '剑气波数量增加',
    requiredCharacters: ['youmu'],
    apply: (player) => {
      player.waveCount = (player.waveCount || 2) + 1;
    },
    maxStack: 4
  },
  {
    id: 'blade_soul',
    name: '刀魂',
    type: '攻击',
    description: '斩击伤害提升 30%',
    requiredCharacters: ['youmu'],
    apply: (player) => {
      player.damage = Math.floor(player.damage * 1.3);
    },
    maxStack: 3
  },

  // 灵梦专属升级
  {
    id: 'homing',
    name: '追踪灵弹',
    type: '强化',
    description: '灵弹追踪范围提升 25%',
    requiredCharacters: ['reimu'],
    apply: (player) => {
      player.homingRange = (player.homingRange || 100) * 1.25;
    },
    maxStack: 5
  },
  {
    id: 'seal',
    name: '符札',
    type: '特效',
    description: '阴阳玉爆炸范围增大',
    requiredCharacters: ['reimu'],
    apply: (player) => {
      player.sealRadius = (player.sealRadius || 80) * 1.3;
    },
    maxStack: 3
  },
  {
    id: 'barrier',
    name: '博丽大结界',
    type: '防御',
    description: '结界持续时间 +2 秒',
    requiredCharacters: ['reimu'],
    apply: (player) => {
      player.barrierDuration = (player.barrierDuration || 8) + 2;
    },
    maxStack: 3
  },

  // 魔理沙专属升级
  {
    id: 'laser',
    name: '魔炮强化',
    type: '攻击',
    description: '激光伤害提升 25%',
    requiredCharacters: ['marisa'],
    apply: (player) => {
      player.laserDamage = (player.laserDamage || 1) * 1.25;
    },
    maxStack: 5
  },
  {
    id: 'spread',
    name: '星尘扩散',
    type: '范围',
    description: '星屑散射数量 +2',
    requiredCharacters: ['marisa'],
    apply: (player) => {
      player.spreadCount = (player.spreadCount || 5) + 2;
    },
    maxStack: 4
  },
  {
    id: 'blast',
    name: '爆裂魔法',
    type: '特效',
    description: '魔炮轰击造成爆炸',
    requiredCharacters: ['marisa'],
    apply: (player) => {
      player.blastEffect = true;
    }
  },

  // 咲夜专属升级
  {
    id: 'knives',
    name: '连射飞刀',
    type: '强化',
    description: '飞刀投掷速度提升 20%',
    requiredCharacters: ['sakuya'],
    apply: (player) => {
      player.knifeSpeed = (player.knifeSpeed || 1) * 1.2;
    },
    maxStack: 5
  },
  {
    id: 'time',
    name: '时间操控',
    type: '技能',
    description: '时停持续时间 +1 秒',
    requiredCharacters: ['sakuya'],
    apply: (player) => {
      player.timeStopDuration = (player.timeStopDuration || 2) + 1;
    },
    maxStack: 5
  },

  // 通用升级
  {
    id: 'speed',
    name: '妖怪步伐',
    type: '速度',
    description: '移动速度提升 10%',
    requiredCharacters: ['all'],
    apply: (player) => {
      player.speed *= 1.1;
    },
    maxStack: 5
  },
  {
    id: 'heal',
    name: '紧急包扎',
    type: '恢复',
    description: '恢复 3 点生命值',
    requiredCharacters: ['all'],
    apply: (player) => {
      player.hp = Math.min(player.hp + 3, player.maxHp);
    }
  },
  {
    id: 'max_hp',
    name: '体力增强',
    type: '生命',
    description: '最大生命值 +2',
    requiredCharacters: ['all'],
    apply: (player) => {
      player.maxHp += 2;
      player.hp += 2;
    },
    maxStack: 10
  },
  {
    id: 'damage',
    name: '攻击强化',
    type: '攻击',
    description: '攻击伤害提升 15%',
    requiredCharacters: ['all'],
    apply: (player) => {
      player.damage = Math.floor(player.damage * 1.15);
    },
    maxStack: 5
  }
];

/**
 * 获取角色可用的升级选项
 */
export function getAvailableUpgrades(characterId: string): UpgradeConfig[] {
  return UPGRADES.filter(upgrade =>
    upgrade.requiredCharacters.includes('all') ||
    upgrade.requiredCharacters.includes(characterId)
  );
}

/**
 * 随机获取若干升级选项
 */
export function getRandomUpgrades(characterId: string, count: number): UpgradeConfig[] {
  const available = getAvailableUpgrades(characterId);
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
