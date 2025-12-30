/**
 * 游戏循环 - 使用 requestAnimationFrame 管理帧率
 */

export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = () => void;

export class GameLoop {
  private isRunning = false;
  private lastTime = 0;
  private updateCallbacks: UpdateCallback[] = [];
  private renderCallbacks: RenderCallback[] = [];

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
    this.lastTime = currentTime;

    // 执行更新回调
    this.updateCallbacks.forEach(callback => callback(deltaTime));

    // 执行渲染回调
    this.renderCallbacks.forEach(callback => callback());

    requestAnimationFrame(this.tick);
  };

  onUpdate(callback: UpdateCallback): void {
    this.updateCallbacks.push(callback);
  }

  onRender(callback: RenderCallback): void {
    this.renderCallbacks.push(callback);
  }

  removeUpdateCallback(callback: UpdateCallback): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  removeRenderCallback(callback: RenderCallback): void {
    const index = this.renderCallbacks.indexOf(callback);
    if (index > -1) {
      this.renderCallbacks.splice(index, 1);
    }
  }
}
