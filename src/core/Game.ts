/**
 * 游戏主类 - 管理游戏状态和核心逻辑
 */

import { GameLoop } from './GameLoop.js';
import { eventBus } from './EventEmitter.js';
import { audioManager } from './AudioManager.js';

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  timeScale: number;
  score: number;
  level: number;
  exp: number;
  expNext: number;
  frameCount: number;
  totalEnemiesSpawned: number;
  startTime: number;
}

export class Game {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly loop: GameLoop;
  public readonly state: GameState;

  private screenShake = 0;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas with id "${canvasId}" not found`);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.loop = new GameLoop();
    this.state = this.getInitialState();

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private getInitialState(): GameState {
    return {
      isRunning: false,
      isPaused: false,
      timeScale: 1.0,
      score: 0,
      level: 1,
      exp: 0,
      expNext: 100,
      frameCount: 0,
      totalEnemiesSpawned: 0,
      startTime: 0
    };
  }

  resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(): void {
    this.state.isRunning = true;
    this.state.startTime = Date.now();
    eventBus.emit('game:start');
    this.loop.start();
  }

  pause(): void {
    this.state.isPaused = true;
    eventBus.emit('game:pause');
  }

  resume(): void {
    this.state.isPaused = false;
    eventBus.emit('game:resume');
  }

  stop(): void {
    this.state.isRunning = false;
    this.loop.stop();
    eventBus.emit('game:stop');
  }

  reset(): void {
    Object.assign(this.state, this.getInitialState());
    eventBus.emit('game:reset');
  }

  addScore(amount: number): void {
    this.state.score += amount;
    eventBus.emit('score:changed', this.state.score);
  }

  addExp(amount: number): void {
    this.state.exp += amount;
    eventBus.emit('exp:changed', this.state.exp);

    if (this.state.exp >= this.state.expNext) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.state.level++;
    this.state.exp -= this.state.expNext;
    this.state.expNext = Math.floor(this.state.expNext * 1.4);
    eventBus.emit('player:levelup', this.state.level);
  }

  triggerScreenShake(intensity: number): void {
    this.screenShake = intensity;
  }

  updateScreenShake(): void {
    if (this.screenShake > 0) {
      this.ctx.save();
      const dx = (Math.random() - 0.5) * this.screenShake;
      const dy = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(dx, dy);
      this.screenShake *= 0.9;
      if (this.screenShake < 0.5) {
        this.screenShake = 0;
      }
    }
  }

  restoreAfterScreenShake(): void {
    if (this.screenShake > 0 || this.ctx.currentTransform) {
      this.ctx.restore();
    }
  }

  clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid(): void {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
}
