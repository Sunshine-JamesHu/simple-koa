import { container } from 'tsyringe';
import { ILogger, LOGGER_INJECT_TOKEN as Logger_INJECT_TOKEN } from '../logger/Logger';

export interface IService {}

export abstract class Service implements IService {
  private readonly _logger: ILogger;

  constructor() {
    this._logger = container.resolve<ILogger>(Logger_INJECT_TOKEN);
  }

  protected get Logger() {
    return this._logger;
  }
}
