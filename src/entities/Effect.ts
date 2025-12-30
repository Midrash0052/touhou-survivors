/**
 * 特效实体 - 斩击、爆炸、漂浮文字等
 */

import { eventBus } from '../core/EventEmitter.js';

export class Slash {
  public x: number;
  public y: number;
  public startAngle: number;
  public endAngle: number;
  public radius: number;
  public damage: number;
  public life: number;
  public maxLife: number;
  public render: boolean;

  private processedEnemies: any[] = [];
  private killCount = 0;

  constructor(
    x: number,
    y: number,
    startAngle: number,
    endAngle: number,
    radius: number,
    damage: number,
    duration: number,
    render = true
  ) {
    this.x = x;
    this.y = y;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.radius = radius;
    this.damage = damage;
    this.life = duration;
    this.maxLife = duration;
    this.render = render;

    this.checkHit();
  }

  private checkHit(): void {
    eventBus.emit('slash:hit', {
      slash: this,
      processedEnemies: this.processedEnemies
    });
  }

  update(): void {
    this.life--;
    if (this.life % 5 === 0) {
      this.checkHit();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.render) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = 'rgba(200, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.radius, this.startAngle, this.endAngle);
    ctx.fill();
    ctx.restore();
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}

export class FloatingText {
  public x: number;
  public y: number;
  public text: string | number;
  public color: string;
  public life: number;
  public maxLife: number;

  constructor(
    x: number,
    y: number,
    text: string | number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 40;
    this.maxLife = 40;
  }

  update(): void {
    this.y -= 1;
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.font = 'bold 16px Arial';
    ctx.fillText(String(this.text), this.x, this.y);
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}

export class ItemDrop {
  public x: number;
  public y: number;
  public magnet = false;
  public markedForDeletion = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(playerX: number, playerY: number): void {
    const dist = Math.hypot(playerX - this.x, playerY - this.y);

    if (this.magnet || dist < 100) {
      this.x += (playerX - this.x) * 0.2;
      this.y += (playerY - this.y) * 0.2;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'cyan';
    ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
  }
}
