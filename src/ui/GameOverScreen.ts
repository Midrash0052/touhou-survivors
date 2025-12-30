/**
 * 游戏结束界面
 */

import { eventBus } from '../core/EventEmitter.js';

export class GameOverScreen {
  private container: HTMLElement;
  private finalScoreElement: HTMLElement;
  private onRestart?: () => void;

  constructor() {
    this.container = document.getElementById('game-over-screen')!;
    this.finalScoreElement = document.getElementById('final-score')!;

    const restartButton = this.container.querySelector('button')!;
    restartButton.addEventListener('click', () => {
      if (this.onRestart) {
        this.onRestart();
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.on('player:death', () => {
      // 由主游戏处理
    });
  }

  show(score: number, onRestart: () => void): void {
    this.finalScoreElement.textContent = `Score: ${score}`;
    this.onRestart = onRestart;
    this.container.classList.remove('hidden');
  }

  hide(): void {
    this.container.classList.add('hidden');
  }
}
