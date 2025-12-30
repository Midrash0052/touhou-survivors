/**
 * 角色选择菜单
 */

import { getAllCharacters } from '../data/characters.js';
import type { CharacterConfig } from '../data/characters.js';

export class CharacterSelect {
  private container: HTMLElement;
  private onCharacterSelect: (characterId: string) => void;

  constructor(onSelect: (characterId: string) => void) {
    this.container = document.getElementById('char-select-screen')!;
    this.onCharacterSelect = onSelect;
    this.render();
  }

  private render(): void {
    const characters = getAllCharacters();
    const container = this.container.querySelector('.char-select-container')!;

    characters.forEach(char => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.innerHTML = `
        <h2 style="color:${char.color}">${char.name}</h2>
        <p>BGM: ${char.bgmName}</p>
        <div class="char-desc">
          ${char.abilities.map(ability => `
            <b>${ability.name}:</b> ${ability.description}<br>
          `).join('')}
        </div>
      `;

      card.addEventListener('click', () => {
        this.onCharacterSelect(char.id);
        this.hide();
      });

      container.appendChild(card);
    });
  }

  show(): void {
    this.container.classList.remove('hidden');
  }

  hide(): void {
    this.container.classList.add('hidden');
  }
}
