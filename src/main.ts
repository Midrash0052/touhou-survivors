/**
 * 露米娅幸存者 - 主入口文件
 * 整合所有游戏模块
 */

import { Game } from './core/Game.js';
import { audioManager } from './core/AudioManager.js';
import { eventBus } from './core/EventEmitter.js';
import { Player } from './entities/Player.js';
import { Bullet } from './entities/Bullet.js';
import { Slash, FloatingText, ItemDrop } from './entities/Effect.js';
import { SpawnSystem } from './systems/SpawnSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { UpgradeSystem } from './systems/UpgradeSystem.js';
import { CharacterSelect } from './ui/CharacterSelect.js';
import { HUD } from './ui/HUD.js';
import { UpgradeScreen } from './ui/UpgradeScreen.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { getCharacter } from './data/characters.js';

class Main {
  private game: Game;
  private spawnSystem: SpawnSystem;
  private collisionSystem: CollisionSystem;
  private upgradeSystem: UpgradeSystem;
  private characterSelect: CharacterSelect;
  private hud: HUD;
  private upgradeScreen: UpgradeScreen;
  private gameOverScreen: GameOverScreen;

  private player: Player | null = null;
  private bullets: Bullet[] = [];
  private slashes: Slash[] = [];
  private floatingTexts: FloatingText[] = [];
  private items: ItemDrop[] = [];

  private keys: Record<string, boolean> = {};
  private globalFreeze = 0;
  private currentTimeScale = 1.0;
  private selectedCharacter = 'rumia';

  constructor() {
    this.game = new Game('gameCanvas');
    this.spawnSystem = new SpawnSystem();
    this.collisionSystem = new CollisionSystem();
    this.upgradeSystem = new UpgradeSystem();
    this.characterSelect = new CharacterSelect((id) => this.startGame(id));
    this.hud = new HUD();
    this.upgradeScreen = new UpgradeScreen();
    this.gameOverScreen = new GameOverScreen();

    this.setupEventListeners();
    this.setupGameLoop();
  }

  private setupEventListeners(): void {
    // 键盘输入
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyJ' && this.game.state.isRunning && !this.game.state.isPaused) {
        this.player?.useSkill();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // 游戏事件
    eventBus.on('game:start', () => {
      audioManager.playMusic(
        getCharacter(this.selectedCharacter)!.melody,
        getCharacter(this.selectedCharacter)!.tempo,
        getCharacter(this.selectedCharacter)!.oscillatorType
      );
    });

    eventBus.on('player:death', () => {
      this.gameOver();
    });

    eventBus.on('enemy:killed', (data: { x: number; y: number }) => {
      this.game.addScore(10);
      this.game.addExp(10);
      this.items.push(new ItemDrop(data.x, data.y));
    });

    eventBus.on('enemy:damaged', (data: { enemy: any; damage: number; isDot: boolean }) => {
      this.floatingTexts.push(
        new FloatingText(data.enemy.x, data.enemy.y, data.damage, data.isDot ? 'purple' : 'white')
      );

      // 露米娅攻击积攒能量
      if (this.player && this.player.type === 'rumia' && !data.isDot && !this.player.rumiaMode) {
        this.player.gauge = Math.min(100, this.player.gauge + 1);
      }
    });

    eventBus.on('player:attack', (data: { type: string; x: number; y: number; angle: number }) => {
      if (!this.player) return;

      if (data.type === 'rumia') {
        // 露米娅：子弹攻击
        this.bullets.push(new Bullet(data.x, data.y, data.angle, {
          damage: this.player.damage,
          penetration: this.player.penetration,
          dotDamage: this.player.dotDamage,
          vulnPercent: this.player.vulnPercent,
          explode: this.player.explode
        }));
      } else if (data.type === 'youmu') {
        // 妖梦：斩击
        if (this.player.swordWaveMode) {
          // 剑气波模式
          const startAngle = this.player.facingAngle - Math.PI / 4;
          for (let i = 0; i < this.player.waveCount; i++) {
            const angle = startAngle + (i * Math.PI / 4);
            this.bullets.push(new Bullet(data.x, data.y, angle, {
              isWave: true,
              damage: this.player.damage  // 使用妖梦的伤害
            }));
          }
        } else {
          // 普通斩击
          this.slashes.push(new Slash(
            data.x, data.y,
            this.player.facingAngle - Math.PI / 2,
            this.player.facingAngle + Math.PI / 2,
            100, this.player.damage, 10
          ));
        }
      }
      // 其他角色的攻击可以继续添加...
    });

    eventBus.on('player:skill', (data: any) => {
      if (!this.player) return;

      if (data.type === 'consume') {
        // 露米娅：黑暗吞噬
        this.slashes.push(new Slash(
          data.x, data.y,
          this.player.facingAngle - Math.PI / 3,
          this.player.facingAngle + Math.PI / 3,
          200, 9999, 15
        ));
        this.floatingTexts.push(new FloatingText(data.x, data.y - 40, 'CONSUME!', 'red'));
      }
    });

    // 妖梦突进斩
    eventBus.on('player:shortDash', (data: { x: number; y: number; angle: number }) => {
      if (!this.player) return;

      // 计算突进目标位置
      this.player.dashTarget = {
        x: this.player.x + Math.cos(data.angle) * 200,
        y: this.player.y + Math.sin(data.angle) * 200
      };
    });

    // 妖梦被动反击突进
    eventBus.on('player:dashAttack', (data: { x: number; y: number; duration: number }) => {
      if (!this.player) return;

      // 找到最近的敌人方向
      const enemies = this.spawnSystem.getEnemies();
      let nearestEnemy = null;
      let minDist = Infinity;

      for (const enemy of enemies) {
        const dist = Math.hypot(enemy.x - data.x, enemy.y - data.y);
        if (dist < minDist) {
          minDist = dist;
          nearestEnemy = enemy;
        }
      }

      if (nearestEnemy) {
        const angle = Math.atan2(nearestEnemy.y - data.y, nearestEnemy.x - data.x);
        const dist = Math.min(this.game.canvas.width, this.game.canvas.height) * 0.33;
        this.player.dashTarget = {
          x: data.x + Math.cos(angle) * dist,
          y: data.y + Math.sin(angle) * dist
        };
      }
    });

    eventBus.on('slash:create', (data: any) => {
      this.slashes.push(new Slash(
        data.x, data.y, data.startAngle, data.endAngle,
        data.radius, data.damage, data.duration,
        data.render !== undefined ? data.render : true
      ));
    });

    eventBus.on('slash:hit', (data: { slash: Slash; processedEnemies: any[] }) => {
      const enemies = this.spawnSystem.getEnemies();
      const slash = data.slash;

      for (const enemy of enemies) {
        if (data.processedEnemies.includes(enemy)) continue;

        const dist = Math.hypot(enemy.x - slash.x, enemy.y - slash.y);
        if (dist < slash.radius + enemy.radius) {
          const angle = Math.atan2(enemy.y - slash.y, enemy.x - slash.x);
          let angleDiff = angle - (slash.startAngle + (slash.endAngle - slash.startAngle) / 2);

          // 标准化角度差
          while (angleDiff <= -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

          const angleThreshold = Math.abs(slash.endAngle - slash.startAngle) / 2 + 0.5;
          if (Math.abs(slash.endAngle - slash.startAngle) > 6 || Math.abs(angleDiff) < angleThreshold) {
            enemy.takeDamage(slash.damage);
            data.processedEnemies.push(enemy);
          }
        }
      }
    });

    eventBus.on('upgrade:show', () => {
      if (!this.player) return;

      // 先暂停游戏
      this.game.pause();

      const options = this.upgradeSystem.getUpgradeOptions(this.player.type);
      this.upgradeScreen.show(options, (upgrade) => {
        this.upgradeSystem.applyUpgrade(this.player!, upgrade);
        this.game.resume();
      });
    });

    eventBus.on('screenShake', (intensity: number) => {
      this.game.triggerScreenShake(intensity);
    });

    eventBus.on('exp:gained', (amount: number) => {
      this.game.addExp(amount);
    });

    eventBus.on('timeScale:set', (scale: number) => {
      this.currentTimeScale = scale;
    });

    eventBus.on('timeScale:reset', () => {
      this.currentTimeScale = 1.0;
    });

    eventBus.on('player:globalKill', () => {
      this.triggerGlobalKill();
    });

    // 查找最近的敌人
    eventBus.on('player:findNearestEnemy', (player: Player) => {
      const enemies = this.spawnSystem.getEnemies();
      if (enemies.length === 0) return;

      let nearest = enemies[0];
      let minDist = Infinity;

      for (const enemy of enemies) {
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = enemy;
        }
      }

      player.facingAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    });
  }

  private setupGameLoop(): void {
    this.game.loop.onUpdate((deltaTime) => {
      if (!this.game.state.isRunning || this.game.state.isPaused) return;

      // 更新全局冻结
      if (this.globalFreeze > 0) {
        this.globalFreeze--;
        return;
      }

      // 更新时间缩放
      this.game.state.timeScale = this.currentTimeScale;

      // 更新玩家
      if (this.player) {
        this.player.update(
          deltaTime * 60,
          this.keys,
          this.game.canvas.width,
          this.game.canvas.height
        );
      }

      // 更新生成系统
      this.spawnSystem.update(
        this.game.state.frameCount,
        this.game.canvas.width,
        this.game.canvas.height
      );

      // 更新敌人
      const enemies = this.spawnSystem.getEnemies();
      enemies.forEach(enemy => {
        if (this.player) {
          enemy.update(deltaTime * 60, this.player.x, this.player.y, this.game.state.timeScale);
        }
      });

      // 更新子弹
      this.bullets.forEach(bullet => bullet.update(deltaTime * 60));
      this.bullets = this.bullets.filter(b => !b.markedForDeletion);

      // 更新斩击
      this.slashes.forEach(slash => slash.update());
      this.slashes = this.slashes.filter(s => !s.isDead());

      // 更新特效
      this.floatingTexts.forEach(text => text.update());
      this.floatingTexts = this.floatingTexts.filter(t => !t.isDead());

      this.items.forEach(item => {
        if (this.player) item.update(this.player.x, this.player.y);
      });

      // 碰撞检测
      if (this.player) {
        this.collisionSystem.checkPlayerEnemyCollisions(this.player, enemies);
        this.collisionSystem.checkBulletEnemyCollisions(this.bullets, enemies, this.player);
        this.collisionSystem.checkPlayerItemCollisions(this.player, this.items);
      }

      // 更新帧计数
      this.game.state.frameCount++;
    });

    this.game.loop.onRender(() => {
      // 游戏未运行或暂停时不渲染（让UI界面显示）
      if (!this.game.state.isRunning || this.game.state.isPaused) return;

      // 清空画布
      this.game.clearCanvas();
      this.game.updateScreenShake();

      // 绘制网格
      this.game.drawGrid();

      // 绘制所有实体
      this.items.forEach(item => item.draw(this.game.ctx));
      this.spawnSystem.getEnemies().forEach(enemy => enemy.draw(this.game.ctx));
      this.bullets.forEach(bullet => bullet.draw(this.game.ctx));
      this.slashes.forEach(slash => slash.draw(this.game.ctx));
      this.floatingTexts.forEach(text => text.draw(this.game.ctx));

      if (this.player) {
        this.player.draw(this.game.ctx);
      }

      this.game.restoreAfterScreenShake();
    });
  }

  private startGame(characterId: string): void {
    this.selectedCharacter = characterId;
    audioManager.init();

    this.game.reset();
    this.spawnSystem.reset();
    this.upgradeSystem.reset();

    this.player = new Player(characterId, this.game.canvas.width, this.game.canvas.height);
    this.bullets = [];
    this.slashes = [];
    this.floatingTexts = [];
    this.items = [];
    this.globalFreeze = 0;
    this.currentTimeScale = 1.0;

    // 更新HUD
    this.hud.updateHp(this.player.hp, this.player.maxHp);

    this.game.start();
  }

  private gameOver(): void {
    this.game.stop();
    audioManager.stopMusic();
    this.gameOverScreen.show(this.game.state.score, () => {
      this.gameOverScreen.hide();
      this.characterSelect.show();
    });
  }

  private triggerGlobalKill(): void {
    this.globalFreeze = 60;
    audioManager.playSFX('ult');

    const overlay = document.getElementById('flash-overlay')!;
    overlay.style.opacity = '1';
    const ultText = document.getElementById('ult-text')!;
    ultText.textContent = '人鬼「未来永劫斩」';
    ultText.style.opacity = '1';
    ultText.style.transform = 'translate(-50%, -50%) scale(1.5)';

    setTimeout(() => {
      overlay.style.opacity = '0';
      ultText.style.opacity = '0';
      ultText.style.transform = 'translate(-50%, -50%) scale(1)';

      // 全屏秒杀
      const enemies = this.spawnSystem.getEnemies();
      enemies.forEach(enemy => {
        this.game.addScore(10);
        this.game.addExp(10);
        this.items.push(new ItemDrop(enemy.x, enemy.y));
      });

      this.spawnSystem.clearAll();
    }, 1000);
  }
}

// 初始化游戏
new Main();
