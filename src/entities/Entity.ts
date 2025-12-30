/**
 * 实体基类 - 所有游戏对象的基类
 */

export abstract class Entity {
  public x: number;
  public y: number;
  public radius: number;
  public markedForDeletion = false;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  abstract update(deltaTime: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;

  distanceTo(other: Entity): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  isCollidingWith(other: Entity): boolean {
    return this.distanceTo(other) < this.radius + other.radius;
  }

  delete(): void {
    this.markedForDeletion = true;
  }
}
