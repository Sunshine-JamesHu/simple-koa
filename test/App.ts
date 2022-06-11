import 'reflect-metadata';
import Program, { Container, GetEventKey, IQueueManagerFactory, QMF_INJECT_TOKEN } from '../index';
import { KafkaSubTest } from './eventHandlers/KafkaSubTest';
import { MqttSubTest } from './eventHandlers/MqttSubTest';

import { UseOssProvider } from '../src/oss/OssProvider';

class App extends Program {
  override OnPreApplicationInitialization() {
    super.OnPreApplicationInitialization();
    UseOssProvider('local');
  }

  override StartQueues() {
    const factory = Container.resolve<IQueueManagerFactory>(QMF_INJECT_TOKEN);

    const kafkaManager = factory.GetQueueManager('kafkaTest');
    const mqttManager = factory.GetQueueManager('mqttTest');

    const mqttTestTopic = GetEventKey(MqttSubTest);
    mqttManager.Subscription(mqttTestTopic, 'simple_koa_test/#');

    const kafkaTestTopic = GetEventKey(KafkaSubTest);
    kafkaManager.Subscription(kafkaTestTopic, kafkaTestTopic);

    super.StartQueues();
  }
}

const app = new App(__dirname);
app.Start();
