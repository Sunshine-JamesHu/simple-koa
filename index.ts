import { Transient, Singleton, Injectable, Inject, GetInjectInfo, Container, Scoped, ReplaceService, AllowMultiple } from './src/di/Dependency';
import { ArrayHelper } from './src/core/ArrayHelper';
import { ILogger, Logger, LOGGER_INJECT_TOKEN } from './src/logger/Logger';
import { IEventBus, EventBus, EVENT_BUS_INJECT_TOKEN } from './src/event/EventBus';
import { EventHandler, EventKey, IEventHandler, IEventData, GetEventKey, EVENT_HANDLER_INJECT_TOKEN } from './src/event/EventHandler';
import { ISettingManager, SettingManager, SETTING_INJECT_TOKEN } from './src/setting/SettingManager';
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
import { IDatabaseClient } from './src/database/DatabaseClient';
import { IHttpClient, HTTPCLIENT_INJECT_TOKEN } from './src/httpClient/HttpClient';
import { DISTRIBUTED_CACHE_INJECT_TOKEN, ICache, IDistributedCache, IMemoryCache, MEMORY_CACHE_INJECT_TOKEN } from './src/cache/Cache';

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
  LOGGER_INJECT_TOKEN,
  ILogger,
  Logger,
  EVENT_BUS_INJECT_TOKEN,
  IEventBus,
  EventBus,
  EventKey,
  IEventData,
  EVENT_HANDLER_INJECT_TOKEN,
  IEventHandler,
  EventHandler,
  GetEventKey,
  IController,
  Controller,
  IService,
  Service,
  SETTING_INJECT_TOKEN,
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
  IDatabaseClient,
  HTTPCLIENT_INJECT_TOKEN,
  IHttpClient,
  MEMORY_CACHE_INJECT_TOKEN as MEMORY_INJECT_TOKEN,
  IMemoryCache,
  DISTRIBUTED_CACHE_INJECT_TOKEN as DISTRIBUTED_INJECT_TOKEN,
  IDistributedCache,
  ICache,
};

export default Program;
