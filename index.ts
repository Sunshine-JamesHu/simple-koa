import { Transient, Singleton, Injectable, Inject, GetInjectInfo, Container, Scoped, ReplaceService, AllowMultiple } from './src/di/Dependency';
import { ISettingManager, SettingManager } from './src/setting/SettingManager';
import { Router } from './src/router/Router';
import { RequestBody, RequestQuery } from './src/router/RequestData';
import { HttpRequest, HttpGet, HttpDelete, HttpPut, HttpOptions, HttpPost } from './src/router/Request';
import { IService, Service } from './src/service/Service';
import { IController, Controller } from './src/controller/Controller';
import { EventHandler, EventKey, IEventHandler } from './src/event/EventHandler';
import { IQueueManager, QueueManager } from './src/queue/QueueManager';
import { IQueueManagerFactory, QueueManagerFactory } from './src/queue/QueueManagerFactory';

import Program from './src/Program'; // 这一句必须放在最后面,否则打出来的包就会有问题
import { ArrayHelper } from './src/tools/ArrayHelper';

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
  EventKey,
  IEventHandler,
  EventHandler,
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
