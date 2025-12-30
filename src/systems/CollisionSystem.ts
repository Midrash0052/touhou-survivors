/**
 * 碰撞检测系统
 */

import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Bullet } from '../entities/Bullet.js';
import { ItemDrop } from '../entities/Effect.js';
import { eventBus } from '../core/EventEmitter.js';
import { audioManager } from '../core/AudioManager.js';

export class CollisionSystem {
  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 监听子弹命中事件
    eventBus.on('bullet:hit', this.handleBulletHit.bind(this));
  }

  checkPlayerEnemyCollisions(
    player: Player,
    enemies: Enemy[]
  ): void {
    if (player.invincible > 0) return;

    for (const enemy of enemies) {
      if (player.isCollidingWith(enemy)) {
        player.takeDamage(enemy.damage);
        eventBus.emit('screenShake', 10);

        // 红色闪屏效果
        eventBus.emit('damageOverlay');

        audioManager.playSFX('hit');
      }
    }
  }

  checkBulletEnemyCollisions(
    bullets: Bullet[],
    enemies: Enemy[],
    player: Player
  ): void {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      let remove = false;

      for (const enemy of enemies) {
        if (bullet.hitList.includes(enemy)) continue;

        if (bullet.isCollidingWith(enemy)) {
          // 露米娅的DoT效果
          if (player.type === 'rumia') {
            enemy.dotTicks += bullet.dotTicks;
            enemy.dotDamage = bullet.dotDamage;

            if (bullet.vulnPercent > 0) {
              enemy.vulnMultiplier = 1.0 + bullet.vulnPercent;
            }

            // 爆炸效果
            if (bullet.explode) {
              eventBus.emit('slash:create', {
                x: bullet.x,
                y: bullet.y,
                startAngle: 0,
                endAngle: Math.PI * 2,
                radius: 40,
                damage: player.damage * 0.5,
                duration: 5
              });
            }
          }

          enemy.takeDamage(bullet.damage);
          bullet.hitList.push(enemy);

          if (bullet.hitList.length > bullet.penetration) {
            remove = true;
            break;
          }
        }
      }

      if (bullet.life <= 0 || remove) {
        const index = bullets.indexOf(bullet);
        if (index > -1) {
          bullets.splice(index, 1);
        }
      }
    }
  }

  checkPlayerItemCollisions(
    player: Player,
    items: ItemDrop[]
  ): void {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const dist = Math.hypot(player.x - item.x, player.y - item.y);

      if (dist < player.radius + 10) {
        items.splice(i, 1);
        eventBus.emit('exp:gained', 10);
      }
    }
  }

  private handleBulletHit(data: { bullet: Bullet; enemy: Enemy }): void {
    // 可以在这里添加额外的命中处理逻辑
  }
}
