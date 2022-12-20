import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';

import 'reflect-metadata';

// Container
export const container = new Container();

// Utils
export const { lazyInject } = getDecorators(container);
