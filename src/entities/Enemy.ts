/**
 * 敌人实体
 */

import { Entity } from './Entity.js';
import { getEnemyConfig, getEnemyScalingMultiplier } from '../data/enemies.js';
import { eventBus } from '../core/EventEmitter.js';
import { audioManager } from '../core/AudioManager.js';

export class Enemy extends Entity {
  public type: string;
  public maxHp: number;
  public hp: number;
  public speed: number;
  public damage: number;
  public color: string;

  // DoT (持续伤害)
  public dotTicks = 0;
  public dotDamage = 0;
  public vulnMultiplier = 1.0;

  constructor(type: string, x: number, y: number, totalSpawned: number) {
    const config = getEnemyConfig(type);
    if (!config) throw new Error(`Enemy type "${type}" not found`);

    const scaling = getEnemyScalingMultiplier(totalSpawned);

    super(x, y, config.radius);

    this.type = type;
    this.maxHp = Math.floor(config.baseHp * scaling);
    this.hp = this.maxHp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.color = config.color;
  }

  update(deltaTime: number, playerX: number, playerY: number, timeScale: number): void {
    // 向玩家移动
    const angle = Math.atan2(playerY - this.y, playerX - this.x);
    this.x += Math.cos(angle) * this.speed * timeScale;
    this.y += Math.sin(angle) * this.speed * timeScale;

    // DoT 处理
    if (this.dotTicks > 0) {
      if (Math.floor(Date.now() / 1000) % 1 === 0) {
        this.takeDamage(this.dotDamage, true);
        this.dotTicks--;
      }
    }
  }

  takeDamage(amount: number, isDot = false): void {
    const finalDamage = Math.floor(amount * this.vulnMultiplier);
    this.hp -= finalDamage;

    eventBus.emit('enemy:damaged', {
      enemy: this,
      damage: finalDamage,
      isDot
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.markedForDeletion = true;
    audioManager.playSFX('kill');
    eventBus.emit('enemy:killed', {
      type: this.type,
      x: this.x,
      y: this.y
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // 受到DoT时颜色变化
    const fillColor = this.dotTicks > 0 ? '#550000' : this.color;

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 血条
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x - 10, this.y - 20, 20, 4);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(this.x - 10, this.y - 20, 20 * (this.hp / this.maxHp), 4);
  }
}
