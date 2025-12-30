/**
 * 角色配置数据
 * 添加新角色只需在这里添加配置即可！
 */
import type { MelodyNote } from '../core/AudioManager.js';

export interface CharacterAbility {
  name: string;
  description: string;
  gaugeCost?: number;
}

export interface CharacterConfig {
  id: string;
  name: string;
  color: string;
  bgmName: string;
  melody: MelodyNote[];
  tempo: number;
  oscillatorType: OscillatorType;
  baseStats: {
    hp: number;
    speed: number;
    damage: number;
    radius: number;
  };
  abilities: CharacterAbility[];
  gaugeName: string;
  gaugeColor: string;
  availableUpgrades: string[];
}

export const CHARACTERS: Record<string, CharacterConfig> = {
  // 露米娅 - 黑暗操控
  rumia: {
    id: 'rumia',
    name: '露米娅',
    color: '#ff3333',
    bgmName: '妖魔夜行',
    melody: ['B4', 0.5, 'C#5', 0.5, 'D5', 0.5, 'C#5', 0.5, 'B4', 0.5, 'F#4', 1.0,
             'G4', 0.5, 'F#4', 0.5, 'E4', 0.5, 'F#4', 0.5, 'G4', 0.5, 'A4', 0.5,
             'B4', 0.5, 'C#5', 0.5, 'D5', 0.5, 'C#5', 0.5, 'B4', 0.5, 'F#4', 1.0,
             'G4', 0.5, 'F#4', 0.5, 'E4', 0.5, 'D4', 0.5, 'C#4', 0.5, 'F#4', 0.5,
             'B4', 0.5, 'C#5', 0.5, 'D5', 0.5, 'E5', 0.5, 'F#5', 1.5, 'D5', 0.5,
             'C#5', 0.5, 'B4', 0.5, 'A4', 0.5, 'B4', 1.5, 'Rest', 0.5],
    tempo: 146,
    oscillatorType: 'square',
    baseStats: { hp: 10, speed: 4, damage: 10, radius: 15 },
    abilities: [
      { name: '黑暗吞噬', description: 'J键 (20点): 消耗宵暗，秒杀面前单位并回血' },
      { name: '黑暗力场', description: '满槽 (100点): 自动触发10秒全屏黑暗攻击' }
    ],
    gaugeName: '宵暗槽',
    gaugeColor: '#ff0000',
    availableUpgrades: ['penetrate', 'vuln', 'explode', 'speed', 'heal']
  },

  // 魂魄妖梦 - 剑技
  youmu: {
    id: 'youmu',
    name: '魂魄妖梦',
    color: '#00ffaa',
    bgmName: '广有射怪鸟事',
    melody: ['F4', 0.25, 'C5', 0.25, 'F5', 0.25, 'Ab5', 0.25, 'G5', 0.25,
             'Ab5', 0.25, 'G5', 0.25, 'Eb5', 0.25, 'F5', 0.5, 'C5', 0.25,
             'Bb4', 0.25, 'Ab4', 0.5, 'Bb4', 0.25, 'C5', 0.25, 'F4', 0.25,
             'C5', 0.25, 'F5', 0.25, 'Ab5', 0.25, 'G5', 0.25, 'Ab5', 0.25,
             'Bb5', 0.25, 'Ab5', 0.25, 'G5', 0.5, 'Eb5', 0.5, 'F5', 1.0, 'Rest', 0.5],
    tempo: 155,
    oscillatorType: 'sawtooth',
    baseStats: { hp: 10, speed: 4.5, damage: 50, radius: 15 },
    abilities: [
      { name: '被动', description: '受伤触发全屏时缓+无敌反击' },
      { name: '突进斩', description: 'J键 (30-59点): 向最近敌人突进' },
      { name: '剑气波模式', description: 'J键 (60-99点): 发射剑气波' },
      { name: '未来永劫斩', description: 'J键 (100点): 全屏秒杀' }
    ],
    gaugeName: '时髦值',
    gaugeColor: '#00ffff',
    availableUpgrades: ['sword_intent', 'blade_soul', 'speed', 'heal']
  },

  // 博丽灵梦 - 灵符和新技能
  reimu: {
    id: 'reimu',
    name: '博丽灵梦',
    color: '#ff6666',
    bgmName: '东方妖恋谈',
    melody: ['E5', 0.5, 'F#5', 0.5, 'G5', 0.5, 'A5', 0.5, 'B5', 1.0,
             'A5', 0.5, 'G5', 0.5, 'F#5', 0.5, 'E5', 0.5, 'D5', 1.0,
             'E5', 0.5, 'F#5', 0.5, 'G5', 0.5, 'A5', 0.5, 'B5', 0.5,
             'A5', 0.5, 'G5', 0.5, 'F#5', 0.5, 'E5', 0.5, 'Rest', 0.5],
    tempo: 140,
    oscillatorType: 'triangle',
    baseStats: { hp: 12, speed: 3.8, damage: 8, radius: 15 },
    abilities: [
      { name: '灵符', description: '自动发射追踪灵弹' },
      { name: '阴阳玉', description: 'J键 (30点): 投掷大范围阴阳玉' },
      { name: '博丽大结界', description: '满槽 (100点): 8秒无敌+反弹伤害' }
    ],
    gaugeName: '信仰槽',
    gaugeColor: '#ffcccc',
    availableUpgrades: ['homing', 'seal', 'barrier', 'speed', 'heal']
  },

  // 雾雨魔理沙 - 星尘魔法
  marisa: {
    id: 'marisa',
    name: '雾雨魔理沙',
    color: '#ffff00',
    bgmName: '恋色魔术',
    melody: ['E4', 0.25, 'E4', 0.25, 'B4', 0.25, 'B4', 0.25, 'D5', 0.25,
             'D5', 0.25, 'C5', 0.5, 'E4', 0.25, 'E4', 0.25, 'B4', 0.25,
             'B4', 0.25, 'D5', 0.25, 'C5', 0.25, 'B4', 0.5, 'A4', 0.25,
             'A4', 0.25, 'C4', 0.25, 'C4', 0.25, 'E4', 0.25, 'E4', 0.25,
             'A4', 0.25, 'G4', 0.25, 'E4', 0.5, 'Rest', 0.5],
    tempo: 150,
    oscillatorType: 'square',
    baseStats: { hp: 8, speed: 4.2, damage: 12, radius: 15 },
    abilities: [
      { name: '魔炮', description: '发射高伤害直线激光' },
      { name: '星屑', description: 'J键 (25点): 散射星尘' },
      { name: '魔炮轰击', description: '满槽 (100点): 全屏超高伤害激光' }
    ],
    gaugeName: '魔力槽',
    gaugeColor: '#ffffaa',
    availableUpgrades: ['laser', 'spread', 'blast', 'speed', 'heal']
  },

  // 十六夜咲夜 - 飞刀
  sakuya: {
    id: 'sakuya',
    name: '十六夜咲夜',
    color: '#6666ff',
    bgmName: '弗拉戈尔',
    melody: ['D4', 0.5, 'F4', 0.5, 'A4', 0.5, 'D5', 0.5, 'F5', 1.0,
             'E5', 0.5, 'D5', 0.5, 'C5', 0.5, 'A4', 0.5, 'G4', 1.0,
             'D4', 0.5, 'F4', 0.5, 'A4', 0.5, 'D5', 0.5, 'E5', 0.5,
             'C5', 0.5, 'A4', 0.5, 'G4', 0.5, 'F4', 0.5, 'Rest', 0.5],
    tempo: 145,
    oscillatorType: 'sine',
    baseStats: { hp: 9, speed: 4.0, damage: 9, radius: 15 },
    abilities: [
      { name: '飞刀', description: '自动投掷飞刀' },
      { name: '时停', description: 'J键 (40点): 时间停止2秒' },
      { name: '世界', description: '满槽 (100点): 时停5秒+全屏飞刀' }
    ],
    gaugeName: '时间槽',
    gaugeColor: '#aaaaff',
    availableUpgrades: ['knives', 'time', 'speed', 'heal']
  }
};

export function getCharacter(id: string): CharacterConfig | undefined {
  return CHARACTERS[id];
}

export function getAllCharacters(): CharacterConfig[] {
  return Object.values(CHARACTERS);
}
