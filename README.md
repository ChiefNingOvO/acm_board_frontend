# ACM Board Frontend

用于 ACM/ICPC 竞赛现场展示的大屏前端，包含：

- 左侧首刀面板
- 中间实时判题流
- 底部滚动消息
- 全局公告弹窗
- 右侧榜单轮播
- Kafka -> WebSocket -> 浏览器 的实时链路

## 技术栈

- React 18
- TypeScript
- Vite 5
- Tailwind CSS 3
- Framer Motion
- KafkaJS
- ws

## 现在的配置方式

项目里所有可动态调整的运行项都已经统一收口到环境变量。

常用文件：

- 开发默认值：[.env](/E:/acm_board_frontend/.env)
- 通用模板：[.env.example](/E:/acm_board_frontend/.env.example)
- 生产模板：[.env.production.example](/E:/acm_board_frontend/.env.production.example)

前端读取：

- `VITE_*`

开发服务器读取：

- `DEV_*`

Kafka WebSocket 代理读取：

- `KAFKA_*`
- `WS_*`

部署模板读取：

- `SERVER_NAME`
- `STATIC_ROOT`
- `API_PROXY_TARGET`
- `WS_PROXY_TARGET`
- `FRONTEND_PORT`

## 常用脚本

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
npm run proxy:kafka
npm run render:nginx
```

## 关键环境变量

前端：

- `VITE_EVENT_TITLE`：赛事名称，页头和浏览器标题会一起使用
- `VITE_EVENT_START_AT`：开赛时间，当前时间早于这个时间时整页显示开始倒计时
- `VITE_EVENT_START_COUNTDOWN_TITLE`：开赛前倒计时标题
- `VITE_EVENT_START_COUNTDOWN_SUBTITLE`：开赛前倒计时副标题
- `VITE_RANK_LIST_PATH`：榜单接口，默认 `/api/get_rank_list`
- `VITE_FIRST_BLOOD_PATH`：首刀接口，默认 `/api/get_first_blood`
- `VITE_KAFKA_WS_URL`：浏览器连接的 WebSocket 地址，默认 `/ws`
- `VITE_COUNTDOWN_TRIGGER_AT`：触发大倒计时的时间点
- `VITE_COUNTDOWN_DURATION_MINUTES`：倒计时持续分钟数，默认 `60`
- `VITE_RANK_PAGE_SIZE`：榜单每页条数，默认 `10`
- `VITE_RANK_ROTATE_MS`：榜单翻页/刷新间隔，默认 `5000`
- `VITE_RANK_AUTO_START`：榜单是否自动开始，默认 `true`

开发：

- `DEV_API_PROXY_TARGET`：Vite 开发代理的后端地址
- `DEV_WS_PROXY_TARGET`：Vite 开发代理的 WebSocket 地址

Kafka 代理：

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

## 本地开发

1. 安装依赖

```bash
npm install
```

2. 检查 [.env](/E:/acm_board_frontend/.env)

至少确认：

- `DEV_API_PROXY_TARGET`
- `DEV_WS_PROXY_TARGET`
- `KAFKA_BROKERS`
- `KAFKA_TOPIC`

3. 启动 Kafka WebSocket 代理

```bash
npm run proxy:kafka
```

4. 启动前端

```bash
npm run dev
```

## 项目里新增的部署辅助文件

- [Dockerfile](/E:/acm_board_frontend/Dockerfile)
- [Dockerfile.proxy](/E:/acm_board_frontend/Dockerfile.proxy)
- [docker-compose.yml](/E:/acm_board_frontend/docker-compose.yml)
- [nginx.acm-board.conf.template](/E:/acm_board_frontend/nginx.acm-board.conf.template)
- [render-nginx-config.mjs](/E:/acm_board_frontend/render-nginx-config.mjs)
- [acm-board-kafka-proxy.service](/E:/acm_board_frontend/acm-board-kafka-proxy.service)

这样你现在可以选择两种部署方式：

- Docker Compose：最省事，推荐
- Nginx + systemd：传统部署，控制更细

## 部署文档

完整从 0 部署说明见 [DEPLOY.md](/E:/acm_board_frontend/DEPLOY.md)。
