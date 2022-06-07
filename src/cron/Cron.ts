import cron from 'cron';
import { TimeZone } from '../core/TimeZone';
import { IRunnable } from '../core/Runnable';
import { AllowMultiple, Container } from '../di/Dependency';
import { SimpleKoaError } from '../error/SimpleKoaError';
import { ILogger, LOGGER_INJECT_TOKEN } from '../logger/Logger';

const CRON_JOB_METADATA = 'Metadata:CronJob';
export const CRON_JOB_INJECT_TOKEN = 'Sys:ICronJob';

//#region Cron装饰器相关

export interface CronInfo {
  /**
   * Cron表达式
   * PS:不支持[?]通配符
   */
  cron: string;

  /**
   * 时区(默认:Asia/Shanghai)
   */
  timeZone?: string;
}

export function Cron(info: CronInfo) {
  return (target: Function) => {
    if (!info.timeZone) {
      info.timeZone = TimeZone.Shanghai;
    }
    Reflect.defineMetadata(CRON_JOB_METADATA, info, target);
  };
}

export function GetCronInfo(target: Function): CronInfo | undefined {
  return Reflect.getMetadata(CRON_JOB_METADATA, target);
}

//#endregion

export interface ICronJob extends IRunnable {
  DoWorkAsync(): Promise<void>;
}

@AllowMultiple()
export abstract class CronJob implements ICronJob {
  protected readonly Logger: ILogger;
  protected readonly JobIns: cron.CronJob | undefined;

  constructor() {
    this.Logger = Container.resolve<ILogger>(LOGGER_INJECT_TOKEN);

    const cronInfo = this.GetCronInfo();
    this.JobIns = this.GenCronJob(cronInfo as any);
  }

  abstract DoWorkAsync(): Promise<void>;

  StartAsync(): Promise<void> {
    if (this._job) this._job.start();
    return Promise.resolve();
  }

  StopAsync(): Promise<void> {
    if (this._job) this._job.stop();
    return Promise.resolve();
  }

  protected GetCronInfo(): CronInfo | undefined {
    return GetCronInfo((this as any).constructor);
  }

  protected GenCronJob(cronInfo: CronInfo): cron.CronJob {
    if (!cronInfo || !cronInfo.cron) {
      throw new SimpleKoaError('CronInfo is not null or empty');
    }
    const job = new cron.CronJob(
      cronInfo.cron,
      async () => {
        await this.DoWorkAsync();
      },
      null,
      false,
      cronInfo.timeZone ?? TimeZone.Shanghai
    );
    return job;
  }
}
