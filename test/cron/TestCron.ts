import { Singleton } from '../../src/di/Dependency';
import { Cron, CronInfo, CronJob, CRON_JOB_INJECT_TOKEN } from '../../src/cron/Cron';

@Cron({ cron: '0/5 * * * * *' })
@Singleton(CRON_JOB_INJECT_TOKEN)
export class TestCronJob extends CronJob {
  DoWorkAsync(): Promise<void> {
    this.Logger.LogDebug('我是每5秒执行一次的任务');
    return Promise.resolve();
  }
}

@Singleton(CRON_JOB_INJECT_TOKEN)
export class TestCronJob2 extends CronJob {
  DoWorkAsync(): Promise<void> {
    this.Logger.LogDebug('我是每10秒执行一次的任务');
    return Promise.resolve();
  }

  protected GetCronInfo(): CronInfo | undefined {
    return {
      cron: '0/10 * * * * *',
    };
  }
}

@Cron({ cron: '0/30 * * * * *' })
@Singleton(CRON_JOB_INJECT_TOKEN)
export class TestCronJob3 extends CronJob {
  DoWorkAsync(): Promise<void> {
    this.Logger.LogDebug('我是每30秒执行一次的任务');
    return Promise.resolve();
  }
}
