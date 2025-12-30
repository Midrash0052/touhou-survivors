/**
 * 子弹实体
 */

import { Entity } from './Entity.js';

export interface BulletOptions {
  isWave?: boolean;
  damage?: number;
  penetration?: number;
  dotDamage?: number;
  dotTicks?: number;
  vulnPercent?: number;
  explode?: boolean;
}

export class Bullet extends Entity {
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public hitList: Enemy[] = [];

  // 子弹属性
  public isWave: boolean;
  public damage: number;
  public penetration: number;
  public dotDamage: number;
  public dotTicks: number;
  public vulnPercent: number;
  public explode: boolean;

  constructor(
    x: number,
    y: number,
    angle: number,
    options: BulletOptions = {}
  ) {
    super(x, y, options.isWave ? 10 : 6);

    const speed = options.isWave ? 10 : 7;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.life = 100;
    this.maxLife = 100;

    this.isWave = options.isWave || false;
    this.damage = options.damage || 10;
    this.penetration = options.penetration || 0;
    this.dotDamage = options.dotDamage || 2;
    this.dotTicks = options.dotTicks || 10;
    this.vulnPercent = options.vulnPercent || 0;
    this.explode = options.explode || false;
  }

  update(deltaTime: number): void {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    if (this.life <= 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.isWave) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.atan2(this.vy, this.vx));
      ctx.fillStyle = 'rgba(200, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-10, 10);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-10, -10);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = 'black';
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

// 为了避免循环依赖，在这里简单引用
type Enemy = any;
