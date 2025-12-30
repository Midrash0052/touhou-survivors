/**
 * 敌人生成系统
 */

import { Enemy } from '../entities/Enemy.js';
import { getRandomEnemyType } from '../data/enemies.js';
import { eventBus } from '../core/EventEmitter.js';

export class SpawnSystem {
  private enemies: Enemy[] = [];
  private totalSpawned = 0;
  private spawnTimer = 0;
  private spawnInterval = 60; // 每秒生成一个敌人

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  update(frameCount: number, canvasWidth: number, canvasHeight: number): void {
    // 清理已标记删除的敌人
    this.enemies = this.enemies.filter(e => !e.markedForDeletion);

    // 定期生成敌人
    if (frameCount % this.spawnInterval === 0) {
      this.spawnEnemy(canvasWidth, canvasHeight);
    }
  }

  private spawnEnemy(canvasWidth: number, canvasHeight: number): void {
    const type = getRandomEnemyType(this.totalSpawned);
    const position = this.getRandomSpawnPosition(canvasWidth, canvasHeight);

    const enemy = new Enemy(type, position.x, position.y, this.totalSpawned);
    this.enemies.push(enemy);
    this.totalSpawned++;
  }

  private getRandomSpawnPosition(canvasWidth: number, canvasHeight: number) {
    const r = Math.random();
    let x: number, y: number;

    if (r < 0.25) {
      // 上方
      x = Math.random() * canvasWidth;
      y = -30;
    } else if (r < 0.5) {
      // 右方
      x = canvasWidth + 30;
      y = Math.random() * canvasHeight;
    } else if (r < 0.75) {
      // 下方
      x = Math.random() * canvasWidth;
      y = canvasHeight + 30;
    } else {
      // 左方
      x = -30;
      y = Math.random() * canvasHeight;
    }

    return { x, y };
  }

  clearAll(): void {
    this.enemies = [];
  }

  reset(): void {
    this.enemies = [];
    this.totalSpawned = 0;
  }

  getTotalSpawned(): number {
    return this.totalSpawned;
  }
}
