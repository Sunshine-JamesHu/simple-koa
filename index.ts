import { Transient, Singleton, Injectable, Inject, GetInjectInfo, Container, Scoped, ReplaceService, AllowMultiple } from './src/di/Dependency';
import { ArrayHelper } from './src/core/ArrayHelper';
import { ILogger, Logger } from './src/logger/Logger';
import { IEventBus, EventBus } from './src/event/EventBus';
import { EventHandler, EventKey, IEventHandler, IEventData, GetEventKey } from './src/event/EventHandler';
import { ISettingManager, SettingManager } from './src/setting/SettingManager';
import { Router } from './src/router/Router';
import { RequestBody, RequestQuery } from './src/router/RequestData';
import { HttpRequest, HttpGet, HttpDelete, HttpPut, HttpOptions, HttpPost } from './src/router/Request';
import { IService, Service } from './src/service/Service';
import { IController, Controller } from './src/controller/Controller';
import { IQueueManager, QueueManager } from './src/queue/QueueManager';
import { IQueueManagerFactory, QueueManagerFactory, INJECT_TOKEN as QMF_INJECT_TOKEN } from './src/queue/QueueManagerFactory';

import Program from './src/Program'; // 这一句必须放在最后面,否则打出来的包就会有问题

export {
  Container,
  Singleton,
  Transient,
  Scoped,
  Injectable,
  Inject,
  GetInjectInfo,
  ReplaceService,
  AllowMultiple,
  ILogger,
  Logger,
  IEventBus,
  EventBus,
  EventKey,
  IEventData,
  IEventHandler,
  EventHandler,
  GetEventKey,
  IController,
  Controller,
  IService,
  Service,
  ISettingManager,
  SettingManager,
  IQueueManager,
  QueueManager,
  IQueueManagerFactory,
  QueueManagerFactory,
  QMF_INJECT_TOKEN,
  HttpGet,
  HttpPost,
  HttpPut,
  HttpDelete,
  HttpOptions,
  HttpRequest,
  Router,
  RequestBody,
  RequestQuery,
  ArrayHelper,
};

export default Program;
