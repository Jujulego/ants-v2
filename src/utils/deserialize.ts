import { Disk, type IDisk, type IRect, Rect, Shape } from '@jujulego/2d-maths';

// Utils
export function deserializeShape(shape: IDisk | IRect): Shape {
  if ('cx' in shape) {
    return new Disk(shape);
  } else {
    return new Rect(shape);
  }
}
