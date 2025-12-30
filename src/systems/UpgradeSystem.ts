/**
 * 升级系统
 */

import { Player } from '../entities/Player.js';
import { getRandomUpgrades } from '../data/upgrades.js';
import { eventBus } from '../core/EventEmitter.js';
import type { UpgradeConfig } from '../data/upgrades.js';

export class UpgradeSystem {
  private currentLevel = 1;
  private playerUpgradeHistory: Map<string, number> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.on('player:levelup', this.handleLevelUp.bind(this));
  }

  private handleLevelUp(level: number): void {
    this.currentLevel = level;
    eventBus.emit('game:pause');
    eventBus.emit('upgrade:show');
  }

  getUpgradeOptions(characterId: string, count: number = 3): UpgradeConfig[] {
    return getRandomUpgrades(characterId, count);
  }

  applyUpgrade(player: Player, upgrade: UpgradeConfig): void {
    // 检查最大叠加次数
    if (upgrade.maxStack) {
      const currentCount = this.playerUpgradeHistory.get(upgrade.id) || 0;
      if (currentCount >= upgrade.maxStack) {
        console.warn(`Upgrade "${upgrade.name}" has reached max stack`);
        return;
      }
      this.playerUpgradeHistory.set(upgrade.id, currentCount + 1);
    }

    // 应用升级效果
    upgrade.apply(player);

    eventBus.emit('upgrade:applied', {
      upgradeId: upgrade.id,
      upgradeName: upgrade.name
    });
  }

  reset(): void {
    this.currentLevel = 1;
    this.playerUpgradeHistory.clear();
  }
}
