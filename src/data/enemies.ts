/**
 * 敌人配置数据
 * 添加新敌人类型只需在这里添加配置！
 */

export interface EnemyConfig {
  id: string;
  name: string;
  baseHp: number;
  speed: number;
  radius: number;
  damage: number;
  color: string;
  special?: string; // 特殊能力描述
  spawnWeight?: number; // 生成权重
}

export const ENEMIES: Record<string, EnemyConfig> = {
  fairy: {
    id: 'fairy',
    name: '妖精',
    baseHp: 20,
    speed: 1.0,
    radius: 12,
    damage: 1,
    color: '#ff8888',
    spawnWeight: 60
  },
  ghost: {
    id: 'ghost',
    name: '幽灵',
    baseHp: 30,
    speed: 0.8,
    radius: 15,
    damage: 1,
    color: '#88ffff',
    spawnWeight: 20
  },
  youkai: {
    id: 'youkai',
    name: '妖怪',
    baseHp: 50,
    speed: 1.2,
    radius: 14,
    damage: 2,
    color: '#ffff88',
    spawnWeight: 15
  },
  elite: {
    id: 'elite',
    name: '精英怪',
    baseHp: 100,
    speed: 1.5,
    radius: 18,
    damage: 2,
    color: '#ff44ff',
    special: '血量高，移动快',
    spawnWeight: 4
  },
  boss: {
    id: 'boss',
    name: 'Boss',
    baseHp: 500,
    speed: 0.6,
    radius: 30,
    damage: 3,
    color: '#ff0000',
    special: '超多血量，范围伤害',
    spawnWeight: 1
  }
};

/**
 * 根据总生成数获取敌人成长倍率
 */
export function getEnemyScalingMultiplier(totalSpawned: number): number {
  // 每300个敌人，血量增加20%
  const scale = Math.floor(totalSpawned / 300);
  return 1 + (scale * 0.2);
}

/**
 * 随机选择一个敌人类型
 */
export function getRandomEnemyType(totalSpawned: number): string {
  const types = Object.values(ENEMIES);
  const totalWeight = types.reduce((sum, e) => sum + (e.spawnWeight || 1), 0);
  let random = Math.random() * totalWeight;

  for (const enemy of types) {
    random -= (enemy.spawnWeight || 1);
    if (random <= 0) {
      return enemy.id;
    }
  }

  return 'fairy'; // 默认
}

/**
 * 获取敌人配置
 */
export function getEnemyConfig(id: string): EnemyConfig | undefined {
  return ENEMIES[id];
}
