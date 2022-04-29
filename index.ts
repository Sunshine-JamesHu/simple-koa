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

import { IDatabaseProviderFactory, INJECT_TOKEN as DBPF_INJECT_TOKEN } from './src/database/DatabaseProviderFactory';
import { IDatabaseProvider, INJECT_TOKEN as DBP_INJECT_TOKEN, GetDatabaseProviderToken } from './src/database/DatabaseProvider';
import { Database } from './src/database/Database';

import { IQueueManager } from './src/queue/QueueManager';
import { IQueueManagerFactory, INJECT_TOKEN as QMF_INJECT_TOKEN } from './src/queue/QueueManagerFactory';

import Program from './src/Program'; // 注意：这一句必须放在最后面,否则打出来的包就会有问题
import { SimpleKoaError } from './src/error/SimpleKoaError';
import { UserFriendlyError } from './src/error/UserFriendlyError';

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
  IQueueManagerFactory,
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
  Database,
  IDatabaseProviderFactory,
  DBPF_INJECT_TOKEN,
  IDatabaseProvider,
  DBP_INJECT_TOKEN,
  GetDatabaseProviderToken,
  SimpleKoaError,
  UserFriendlyError,
};

export default Program;
