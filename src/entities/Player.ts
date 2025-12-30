/**
 * 玩家实体 - 支持多角色
 */

import { Entity } from './Entity.js';
import { getCharacter } from '../data/characters.js';
import { eventBus } from '../core/EventEmitter.js';
import { audioManager } from '../core/AudioManager.js';

export class Player extends Entity {
  public type: string;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public damage: number;
  public facingAngle = 0;

  // 能量槽系统
  public gauge = 0;
  public maxGauge = 100;

  // 技能冷却
  public skillCooldown = 0;

  // 无敌帧
  public invincible = 0;

  // 角色特定属性
  public rumiaMode = false;
  public rumiaTimer = 0;
  public youmuTimer = 0;
  public swordWaveMode = false;
  public dashState = 0;
  public dashTarget = { x: 0, y: 0 };

  // 升级属性
  public penetration = 0;
  public vulnPercent = 0;
  public explode = false;
  public waveCount = 2;
  public attackTimer = 0;
  public attackInterval = 60;

  // 灵梦专属
  public homingRange = 100;
  public sealRadius = 80;
  public barrierDuration = 8;
  public barrierActive = false;

  // 魔理沙专属
  public laserDamage = 1;
  public spreadCount = 5;
  public blastEffect = false;

  // 咲夜专属
  public knifeSpeed = 1;
  public timeStopDuration = 2;

  constructor(type: string, canvasWidth: number, canvasHeight: number) {
    super(canvasWidth / 2, canvasHeight / 2, 15);

    const config = getCharacter(type);
    if (!config) throw new Error(`Character "${type}" not found`);

    this.type = type;
    this.maxHp = config.baseStats.hp;
    this.hp = config.baseStats.hp;
    this.speed = config.baseStats.speed;
    this.damage = config.baseStats.damage;
    this.radius = config.baseStats.radius;
  }

  update(deltaTime: number, keys: Record<string, boolean>, canvasWidth: number, canvasHeight: number): void {
    // 更新冷却
    if (this.skillCooldown > 0) this.skillCooldown--;
    if (this.invincible > 0) this.invincible--;

    // 妖梦突进状态处理
    if (this.type === 'youmu' && this.dashState > 0) {
      this.dashState--;

      // 向目标位置移动
      this.x += (this.dashTarget.x - this.x) * 0.2;
      this.y += (this.dashTarget.y - this.y) * 0.2;

      // 突进时造成斩击伤害
      eventBus.emit('slash:create', {
        x: this.x,
        y: this.y,
        startAngle: 0,
        endAngle: Math.PI * 2,
        radius: 80,
        damage: this.damage * 2,
        duration: 2
      });

      // 突进结束
      if (this.dashState <= 0) {
        eventBus.emit('timeScale:reset');
      }
      return;  // 突进期间跳过其他更新
    }

    // 角色特定更新
    this.updateCharacterSpecific();

    // 更新攻击
    if (this.attackTimer > 0) {
      this.attackTimer--;
    } else {
      this.performAttack();
      this.attackTimer = this.attackInterval;
    }

    // 移动处理
    this.handleMovement(keys, canvasWidth, canvasHeight);

    // 如果没有移动，朝向最近的敌人
    if (!this.isMoving(keys)) {
      this.faceNearestEnemy();
    }
  }

  private isMoving(keys: Record<string, boolean>): boolean {
    return keys['KeyW'] || keys['ArrowUp'] ||
           keys['KeyS'] || keys['ArrowDown'] ||
           keys['KeyA'] || keys['ArrowLeft'] ||
           keys['KeyD'] || keys['ArrowRight'];
  }

  private faceNearestEnemy(): void {
    // 通过事件系统获取最近的敌人
    eventBus.emit('player:findNearestEnemy', this);
  }

  private updateCharacterSpecific(): void {
    // 露米娅黑暗模式
    if (this.type === 'rumia' && this.rumiaMode) {
      this.rumiaTimer--;

      // 每5帧造成一次全屏黑暗伤害
      if (this.rumiaTimer % 5 === 0) {
        eventBus.emit('slash:create', {
          x: this.x,
          y: this.y,
          startAngle: 0,
          endAngle: Math.PI * 2,
          radius: 150,
          damage: this.damage * 0.5,
          duration: 2
        });
      }

      if (this.rumiaTimer <= 0) {
        this.rumiaMode = false;
        this.attackTimer = 0;
      }
    }

    // 妖梦剑气波模式
    if (this.type === 'youmu' && this.youmuTimer > 0) {
      this.youmuTimer--;
      if (this.youmuTimer <= 0) {
        eventBus.emit('timeScale:reset');
        this.swordWaveMode = false;
        this.gauge = 0;
      }
    }

    // 露米娅满槽自动触发
    if (this.type === 'rumia' && this.gauge >= 100 && !this.rumiaMode) {
      this.gauge = 0;
      this.rumiaMode = true;
      this.rumiaTimer = 600;
      eventBus.emit('player:ult', 'DARKNESS MODE!');
    }
  }

  private handleMovement(keys: Record<string, boolean>, canvasWidth: number, canvasHeight: number): void {
    let dx = 0, dy = 0;

    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    // 妖梦时髦值系统
    if (this.type === 'youmu' && this.dashState <= 0) {
      if (dx === 0 && dy === 0) {
        this.gauge = Math.min(100, this.gauge + 0.05);
      } else {
        this.gauge = Math.max(0, this.gauge - 0.1);
      }
    }

    // 移动
    if ((dx !== 0 || dy !== 0) && this.dashState <= 0) {
      const len = Math.hypot(dx, dy);
      this.x += (dx / len) * this.speed;
      this.y += (dy / len) * this.speed;
      this.facingAngle = Math.atan2(dy, dx);
    }

    // 边界限制
    this.x = Math.max(20, Math.min(canvasWidth - 20, this.x));
    this.y = Math.max(20, Math.min(canvasHeight - 20, this.y));
  }

  private performAttack(): void {
    // 露米娅黑暗模式下不攻击
    if (this.type === 'rumia' && this.rumiaMode) return;

    // 妖梦突进状态下不攻击（剑气波模式下要发射剑气波！）
    if (this.type === 'youmu' && this.dashState > 0) return;

    audioManager.playSFX('shoot');
    eventBus.emit('player:attack', {
      type: this.type,
      x: this.x,
      y: this.y,
      angle: this.facingAngle
    });
  }

  takeDamage(amount: number): void {
    if (this.invincible > 0) return;

    this.hp -= amount;
    this.invincible = 30;
    eventBus.emit('player:damaged', { amount, hp: this.hp, maxHp: this.maxHp });

    // 妖梦受伤触发被动
    if (this.type === 'youmu') {
      this.triggerYoumuPassive();
    }

    if (this.hp <= 0) {
      eventBus.emit('player:death');
    }
  }

  private triggerYoumuPassive(): void {
    eventBus.emit('timeScale:set', 0.1);
    this.dashState = 60;
    this.invincible = 60;

    eventBus.emit('player:ult', '人鬼「未来永劫斩」');
    audioManager.playSFX('ult');

    // 触发突进斩击
    eventBus.emit('player:dashAttack', {
      x: this.x,
      y: this.y,
      duration: 60
    });
  }

  useSkill(): void {
    if (this.skillCooldown > 0) return;

    if (this.type === 'rumia') {
      if (this.gauge >= 20 && !this.rumiaMode) {
        this.gauge -= 20;
        this.skillCooldown = 600;
        eventBus.emit('player:skill', {
          type: 'consume',
          x: this.x,
          y: this.y,
          angle: this.facingAngle
        });
        audioManager.playSFX('slash');
      }
    } else if (this.type === 'youmu') {
      if (this.youmuTimer > 0) return;

      if (this.gauge >= 30 && this.gauge < 60) {
        this.gauge = 0;
        this.dashState = 20;
        this.invincible = 20;
        eventBus.emit('player:shortDash', {
          x: this.x,
          y: this.y,
          angle: this.facingAngle
        });
        audioManager.playSFX('slash');
      } else if (this.gauge >= 60 && this.gauge < 100) {
        this.youmuTimer = 1200;
        this.swordWaveMode = true;
        eventBus.emit('timeScale:set', 0.2);
        eventBus.emit('player:skill', { type: 'swordWave' });
        audioManager.playSFX('ult');
      } else if (this.gauge >= 99) {
        this.gauge = 0;
        eventBus.emit('player:globalKill');
      }
    }
    // 其他角色的技能可以在这里继续添加...
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const config = getCharacter(this.type);
    const color = config?.color || '#fff';

    ctx.save();
    ctx.translate(this.x, this.y);

    // 绘制能量槽背景
    ctx.fillStyle = '#333';
    ctx.fillRect(-20, -35, 40, 6);

    // 绘制能量槽填充
    ctx.fillStyle = config?.gaugeColor || '#fff';
    ctx.fillRect(-20, -35, 40 * (this.gauge / 100), 6);

    // 妖梦专属：绘制刻度标记
    if (this.type === 'youmu') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;

      // 30点刻度（突进斩）
      const x30 = -20 + 40 * 0.3;
      ctx.beginPath();
      ctx.moveTo(x30, -35);
      ctx.lineTo(x30, -29);
      ctx.stroke();

      // 60点刻度（剑气波）
      const x60 = -20 + 40 * 0.6;
      ctx.beginPath();
      ctx.moveTo(x60, -35);
      ctx.lineTo(x60, -29);
      ctx.stroke();

      // 100点刻度（未来永劫斩）
      const x100 = 20;
      ctx.strokeStyle = '#ffff00';  // 终点用黄色标记
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x100, -36);
      ctx.lineTo(x100, -28);
      ctx.stroke();

      // 如果能量足够，高亮对应刻度
      if (this.gauge >= 30) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x30 - 0.5, -35, 1, 6);
      }
      if (this.gauge >= 60) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x60 - 0.5, -35, 1, 6);
      }
      if (this.gauge >= 100) {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x100 - 1, -36, 2, 8);
      }
    }

    // 露米娅专属：绘制刻度标记
    if (this.type === 'rumia') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;

      // 20点刻度（黑暗吞噬）
      const x20 = -20 + 40 * 0.2;
      ctx.beginPath();
      ctx.moveTo(x20, -35);
      ctx.lineTo(x20, -29);
      ctx.stroke();

      // 100点刻度（黑暗模式）
      const x100 = 20;
      ctx.strokeStyle = '#ff0000';  // 终点用红色标记
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x100, -36);
      ctx.lineTo(x100, -28);
      ctx.stroke();

      // 如果能量足够，高亮对应刻度
      if (this.gauge >= 20) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x20 - 0.5, -35, 1, 6);
      }
      if (this.gauge >= 100) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x100 - 1, -36, 2, 8);
      }
    }

    // 无敌闪烁
    if (this.invincible > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 绘制角色
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 绘制朝向指示器
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(this.facingAngle) * 25, Math.sin(this.facingAngle) * 25);
    ctx.stroke();

    ctx.restore();
  }
}
