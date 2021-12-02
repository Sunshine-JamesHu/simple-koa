import { container } from 'tsyringe';
import { ILogger, INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';

export interface IService {}

export abstract class Service implements IService {
  protected Logger: ILogger;
  constructor() {
    this.Logger = container.resolve<ILogger>(Logger_INJECT_TOKEN);
  }
}
