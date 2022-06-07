import { Container } from '../di/Dependency';
import { CRON_JOB_INJECT_TOKEN, ICronJob } from './Cron';

export async function StartCronJobs() {
  const jobs = Container.resolveAll<ICronJob>(CRON_JOB_INJECT_TOKEN);
  if (jobs && jobs.length) {
    for (let index = 0; index < jobs.length; index++) {
      const job = jobs[index];
      await job.StartAsync();
    }
  }
}
