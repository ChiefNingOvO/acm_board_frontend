# ACM Board Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-Realtime-231F20?logo=apachekafka&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Docker%20%7C%20Nginx-0EA5E9)

一个面向 ACM / ICPC 现场展示场景的大屏前端项目。

它负责把比赛过程里的核心信息以大屏形式实时展示出来，包括：

- 首刀信息
- 实时判题流
- 榜单轮播
- 总提交 / 通过统计
- 滚动消息与全局公告
- 开赛前倒计时与赛中倒计时

项目采用 `React + TypeScript + Vite` 构建，实时消息通过 `Kafka -> WebSocket Proxy -> Browser` 的方式推送到前端。

## 页面预览

![Project Preview](./README-preview.svg)

上图是当前项目的大屏结构预览示意，实际页面包含：

- 顶部赛事信息与实时统计
- 左侧首刀列表
- 中间判题流
- 右侧榜单轮播
- 底部滚动消息与全局公告

如果后续你有正式截图，可以直接替换掉 `README-preview.svg`。

## 场景截图

下面这组截图区域用于展示项目在不同比赛阶段下的页面效果，适合作为 GitHub 首页的功能预览。

当前仓库里这 4 张图还是 README 占位图，目的是先把版式和说明搭好。
你后续只需要把真实截图替换成同名文件，README 就会自动展示真实页面效果。

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="./README-scene-live.svg" alt="比赛实时图" />
      <p><strong>比赛实时图</strong><br />展示比赛进行中的主大屏，包括首刀、判题流、榜单轮播和滚动消息。</p>
    </td>
    <td width="50%" valign="top">
      <img src="./README-scene-freeze.svg" alt="封榜图" />
      <p><strong>封榜图</strong><br />进入封榜或赛中倒计时阶段后，左侧与中间区域切换为大尺寸倒计时展示。</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img src="./README-scene-broadcast.svg" alt="大屏消息" />
      <p><strong>大屏消息</strong><br />全局广播消息以高优先级弹窗形式覆盖在大屏之上，适合播放通知或现场提醒。</p>
    </td>
    <td width="50%" valign="top">
      <img src="./README-scene-prestart.svg" alt="赛前准备图" />
      <p><strong>赛前准备图</strong><br />比赛开始前展示全屏倒计时，明确提示开赛时间和当前准备状态。</p>
    </td>
  </tr>
</table>


## 功能特性

- 左侧首刀面板，支持页面初始化时通过接口恢复已有首刀
- 中间实时提交流，支持判题状态动画与滚动展示
- 右侧榜单轮播，支持分页展示与滚动结束后自动刷新
- 顶部统计栏，定时从后端拉取总提交数与通过数
- 支持开赛前全屏倒计时
- 支持赛中在指定时间切换为倒计时模式
- 支持全局公告弹窗
- 支持通过 `.env` 统一管理运行配置
- 提供 Docker Compose 和 Nginx + systemd 两种部署方案

## 技术栈

- React 18
- TypeScript
- Vite 5
- Tailwind CSS 3
- Framer Motion
- KafkaJS
- ws

## 页面结构

- 顶部：赛事标题、总提交、通过数、系统时钟
- 左侧：首刀列表
- 中间：实时判题流
- 右侧：榜单轮播
- 底部：滚动消息
- 全局层：公告弹窗、开赛前倒计时、赛中倒计时

## 数据来源

### HTTP 接口

- `GET /api/get_rank_list`
  用于右侧榜单分页展示

- `GET /api/get_first_blood`
  用于页面首次加载时恢复首刀数据

- `GET /api/get_submission_stats`
  用于顶部总提交 / 通过数统计

### Kafka 实时消息

默认通过 Kafka Topic 推送实时事件，再由本地 WebSocket 代理转发给浏览器。

当前前端主要消费这些类型：

- `message`
  实时提交消息，用于中间判题流

- `first_blood`
  实时首刀消息，用于更新左侧首刀面板

- `broadcast`
  公告消息，用于全局弹窗

## 目录结构

```text
.
├─ src/                        前端源码
├─ public/                     静态资源
├─ .env                        本地开发配置
├─ .env.example                通用配置模板
├─ .env.production             生产配置
├─ .env.production.example     生产配置模板
├─ kafka-websocket-proxy.mjs   Kafka -> WebSocket 转发服务
├─ Dockerfile                  前端镜像构建文件
├─ Dockerfile.proxy            Kafka 代理镜像构建文件
├─ docker-compose.yml          Docker Compose 部署文件
├─ nginx.acm-board.conf.template
├─ render-nginx-config.mjs     Nginx 配置渲染脚本
└─ DEPLOY.md                   详细部署文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 检查环境变量

推荐先查看：

- [.env](/E:/acm_board_frontend/.env)
- [.env.example](/E:/acm_board_frontend/.env.example)

最少确认这些值：

- `DEV_API_PROXY_TARGET`
- `DEV_WS_PROXY_TARGET`
- `KAFKA_BROKERS`
- `KAFKA_TOPIC`

### 3. 启动 Kafka WebSocket 代理

```bash
npm run proxy:kafka
```

### 4. 启动前端开发环境

```bash
npm run dev
```

### 5. 构建生产包

```bash
npm run build
```

## 环境变量说明

### 前端配置

- `VITE_EVENT_TITLE`
  赛事名称，会显示在页头与浏览器标题中

- `VITE_EVENT_START_AT`
  开赛时间；如果当前时间未到，会优先显示开赛前倒计时

- `VITE_EVENT_START_COUNTDOWN_TITLE`
  开赛前倒计时标题

- `VITE_EVENT_START_COUNTDOWN_SUBTITLE`
  开赛前倒计时副标题

- `VITE_API_BASE_PATH`
  接口前缀，默认 `/api`

- `VITE_RANK_LIST_PATH`
  榜单接口

- `VITE_FIRST_BLOOD_PATH`
  首刀初始化接口

- `VITE_SUBMISSION_STATS_PATH`
  提交统计接口

- `VITE_SUBMISSION_STATS_POLL_MS`
  提交统计轮询间隔，单位毫秒

- `VITE_KAFKA_WS_URL`
  前端连接的 WebSocket 地址

- `VITE_COUNTDOWN_TRIGGER_AT`
  赛中倒计时触发时间

- `VITE_COUNTDOWN_DURATION_MINUTES`
  赛中倒计时持续时长，单位分钟

- `VITE_COUNTDOWN_TITLE`
  赛中倒计时标题

- `VITE_COUNTDOWN_SUBTITLE`
  赛中倒计时副标题

- `VITE_RANK_PAGE_SIZE`
  榜单每页显示条数

- `VITE_RANK_ROTATE_MS`
  榜单翻页 / 刷新节奏，单位毫秒

- `VITE_RANK_AUTO_START`
  榜单是否自动开始轮播

### 开发环境配置

- `DEV_SERVER_HOST`
- `DEV_SERVER_PORT`
- `DEV_ALLOWED_HOSTS`
- `DEV_API_PROXY_TARGET`
- `DEV_WS_PROXY_TARGET`

### Kafka 代理配置

- `KAFKA_BROKERS`
- `KAFKA_TOPIC`
- `KAFKA_CLIENT_ID`
- `KAFKA_GROUP_ID`
- `KAFKA_FROM_BEGINNING`
- `KAFKA_SSL`
- `KAFKA_SASL_MECHANISM`
- `KAFKA_USERNAME`
- `KAFKA_PASSWORD`
- `WS_HOST`
- `WS_PORT`

### 部署配置

- `SERVER_NAME`
- `STATIC_ROOT`
- `API_PROXY_TARGET`
- `WS_PROXY_TARGET`
- `FRONTEND_PORT`

## 常用脚本

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run proxy:kafka
npm run render:nginx
```

## 部署方式

### 方式一：Docker Compose

项目已经内置：

- [Dockerfile](/E:/acm_board_frontend/Dockerfile)
- [Dockerfile.proxy](/E:/acm_board_frontend/Dockerfile.proxy)
- [docker-compose.yml](/E:/acm_board_frontend/docker-compose.yml)

适合快速部署到服务器。

### 方式二：Nginx + systemd

项目已经提供：

- [nginx.acm-board.conf.template](/E:/acm_board_frontend/nginx.acm-board.conf.template)
- [render-nginx-config.mjs](/E:/acm_board_frontend/render-nginx-config.mjs)
- [acm-board-kafka-proxy.service](/E:/acm_board_frontend/acm-board-kafka-proxy.service)

适合传统部署场景。

更完整的部署说明请查看：

- [DEPLOY.md](/E:/acm_board_frontend/DEPLOY.md)

## 开源协作

- 许可证：[LICENSE](/E:/acm_board_frontend/LICENSE)
- 贡献指南：[CONTRIBUTING.md](/E:/acm_board_frontend/CONTRIBUTING.md)
- 开源前检查清单：[OPEN_SOURCE_CHECKLIST.md](/E:/acm_board_frontend/OPEN_SOURCE_CHECKLIST.md)

## 适用场景

- ACM / ICPC 校赛、选拔赛、训练赛现场大屏
- 需要把榜单、首刀、判题流、公告集中展示的比赛场景
- 希望通过 Kafka 实时推送消息到前端的大屏项目
