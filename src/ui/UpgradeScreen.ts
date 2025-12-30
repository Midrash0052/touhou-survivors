/**
 * 升级界面
 */

import type { UpgradeConfig } from '../data/upgrades.js';
import { eventBus } from '../core/EventEmitter.js';

export class UpgradeScreen {
  private container: HTMLElement;
  private upgradeContainer: HTMLElement;
  private onUpgradeSelected?: (upgrade: UpgradeConfig) => void;

  constructor() {
    this.container = document.getElementById('upgrade-screen')!;
    this.upgradeContainer = document.getElementById('upgrade-container')!;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.on('upgrade:show', () => {
      // 这个事件会由主游戏处理，这里只是占位
    });
  }

  show(options: UpgradeConfig[], onSelect: (upgrade: UpgradeConfig) => void): void {
    this.onUpgradeSelected = onSelect;
    this.upgradeContainer.innerHTML = '';

    options.forEach(upgrade => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div style="font-size:12px;color:#888">${upgrade.type}</div>
        <div style="font-size:18px;font-weight:bold;color:#ffcc00;margin:10px 0;">${upgrade.name}</div>
        <div style="font-size:13px;color:#ccc">${upgrade.description}</div>
      `;

      card.addEventListener('click', () => {
        if (this.onUpgradeSelected) {
          this.onUpgradeSelected(upgrade);
        }
        this.hide();
      });

      this.upgradeContainer.appendChild(card);
    });

    this.container.classList.remove('hidden');
  }

  hide(): void {
    this.container.classList.add('hidden');
  }
}
