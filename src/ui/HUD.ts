/**
 * HUD - 抬头显示
 */

import { eventBus } from '../core/EventEmitter.js';

export class HUD {
  private scoreElement: HTMLElement;
  private levelElement: HTMLElement;
  private hpTextElement: HTMLElement;
  private expBarElement: HTMLElement;
  private damageOverlay: HTMLElement;
  private ultTextElement: HTMLElement;

  constructor() {
    this.scoreElement = document.getElementById('score-display')!;
    this.levelElement = document.getElementById('level-display')!;
    this.hpTextElement = document.getElementById('hp-text')!;
    this.expBarElement = document.getElementById('exp-bar')!;
    this.damageOverlay = document.getElementById('damage-overlay')!;
    this.ultTextElement = document.getElementById('ult-text')!;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.on('score:changed', (score: number) => {
      this.updateScore(score);
    });

    eventBus.on('player:levelup', (level: number) => {
      this.updateLevel(level);
    });

    eventBus.on('player:damaged', (data: { hp: number; maxHp: number }) => {
      this.updateHp(data.hp, data.maxHp);
    });

    eventBus.on('exp:changed', (exp: number, expNext: number) => {
      this.updateExp(exp, expNext);
    });

    eventBus.on('damageOverlay', () => {
      this.showDamageOverlay();
    });

    eventBus.on('player:ult', (text: string) => {
      this.showUltText(text);
    });
  }

  private updateScore(score: number): void {
    this.scoreElement.textContent = `Score: ${score}`;
  }

  private updateLevel(level: number): void {
    this.levelElement.textContent = `Lv. ${level}`;
  }

  private updateHp(hp: number, maxHp: number): void {
    this.hpTextElement.textContent = `${Math.ceil(hp)}/${maxHp}`;
  }

  private updateExp(exp: number, expNext: number): void {
    const percentage = (exp / expNext) * 100;
    this.expBarElement.style.width = `${percentage}%`;
  }

  private showDamageOverlay(): void {
    this.damageOverlay.style.opacity = '1';
    setTimeout(() => {
      this.damageOverlay.style.opacity = '0';
    }, 200);
  }

  private showUltText(text: string): void {
    this.ultTextElement.textContent = text;
    this.ultTextElement.style.opacity = '1';
    this.ultTextElement.style.transform = 'translate(-50%, -50%) scale(1.2)';

    setTimeout(() => {
      this.ultTextElement.style.transform = 'translate(-50%, -50%) scale(1)';
      setTimeout(() => {
        this.ultTextElement.style.opacity = '0';
      }, 1000);
    }, 100);
  }
}
