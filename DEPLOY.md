# ACM Board Frontend 部署指南

这版项目已经做过一轮部署整理：

- 所有动态配置统一进入环境变量
- 前端、Vite、Kafka 代理分别走同一套 `.env` / `.env.production`
- 提供 Docker Compose 方案
- 提供 Nginx 模板和 systemd 模板

如果你想尽快上线，优先走 Docker Compose。

## 一、部署前你需要准备什么

- 一台 Linux 服务器，推荐 Ubuntu 22.04 或 24.04
- Node.js 20 LTS
- Docker 与 Docker Compose 插件
- 可访问的后端 API
- 可访问的 Kafka

当前项目默认约定：

- 前端静态资源路径：`/`
- 后端接口前缀：`/api`
- 浏览器实时连接路径：`/ws`
- Kafka Topic：`acm.board.submission.events`

## 二、环境变量说明

建议做法：

1. 开发使用 [.env](/E:/acm_board_frontend/.env)
2. 生产新建 `.env.production`
3. 先从 [.env.production.example](/E:/acm_board_frontend/.env.production.example) 复制

```bash
cp .env.production.example .env.production
```

生产至少要确认这些值：

```env
VITE_EVENT_TITLE=华北水利水电大学第八届 ACM-ICPC 程序设计大赛
VITE_EVENT_START_AT=
VITE_EVENT_START_COUNTDOWN_TITLE=Contest Starts In
VITE_EVENT_START_COUNTDOWN_SUBTITLE=The board will open automatically at the configured time
VITE_RANK_LIST_PATH=/api/get_rank_list
VITE_FIRST_BLOOD_PATH=/api/get_first_blood
VITE_KAFKA_WS_URL=/ws

SERVER_NAME=_
STATIC_ROOT=/opt/acm-board/frontend/dist
API_PROXY_TARGET=http://127.0.0.1:8090
WS_PROXY_TARGET=http://127.0.0.1:8080
FRONTEND_PORT=80

KAFKA_BROKERS=49.234.197.24:9092
KAFKA_TOPIC=acm.board.submission.events
KAFKA_CLIENT_ID=acm-board-proxy
KAFKA_GROUP_ID=acm-board-ws-proxy
KAFKA_FROM_BEGINNING=false
KAFKA_SSL=false
KAFKA_SASL_MECHANISM=
KAFKA_USERNAME=
KAFKA_PASSWORD=
WS_HOST=0.0.0.0
WS_PORT=8080
```

如果 Kafka 开了 SASL：

- `KAFKA_SSL=true`
- `KAFKA_SASL_MECHANISM=scram-sha-256` 或 `scram-sha-512` 或 `plain`
- `KAFKA_USERNAME`
- `KAFKA_PASSWORD`

## 三、方案 A：Docker Compose 部署

这是最省事的方式。

### 1. 安装 Docker

Ubuntu 示例：

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. 上传项目

```bash
sudo mkdir -p /opt/acm-board
sudo chown -R $USER:$USER /opt/acm-board
cd /opt/acm-board
git clone <你的仓库地址> frontend
cd frontend
```

### 3. 准备生产环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```

重点确认：

- `API_PROXY_TARGET`
- `KAFKA_BROKERS`
- `KAFKA_TOPIC`
- 如果有鉴权，再补 `KAFKA_SSL` / `KAFKA_SASL_*`

### 4. 启动

```bash
docker compose --env-file .env.production up -d --build
```

### 5. 查看状态

```bash
docker compose ps
docker compose logs -f frontend
docker compose logs -f kafka-proxy
```

### 6. 更新发布

```bash
git pull
docker compose --env-file .env.production up -d --build
```

### 7. 这套方案实际做了什么

- `frontend` 容器：构建前端并用 Nginx 提供静态页面
- `kafka-proxy` 容器：消费 Kafka，转发给浏览器 WebSocket
- `frontend` 会把 `/api` 代理到 `API_PROXY_TARGET`
- `frontend` 会把 `/ws` 代理到 `kafka-proxy`

## 四、方案 B：Nginx + systemd 部署

如果你不想用 Docker，可以走传统方式。

### 1. 安装基础组件

```bash
sudo apt update
sudo apt install -y git curl nginx
```

安装 Node.js 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. 上传项目

```bash
sudo mkdir -p /opt/acm-board
sudo chown -R $USER:$USER /opt/acm-board
cd /opt/acm-board
git clone <你的仓库地址> frontend
cd frontend
```

### 3. 安装依赖

```bash
npm install
```

### 4. 准备生产环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```

### 5. 构建前端

```bash
npm run build
```

### 6. 生成 Nginx 配置

项目里已经提供了：

- 模板：[nginx.acm-board.conf.template](/E:/acm_board_frontend/nginx.acm-board.conf.template)
- 渲染脚本：[render-nginx-config.mjs](/E:/acm_board_frontend/render-nginx-config.mjs)

执行：

```bash
NODE_ENV=production npm run render:nginx
```

生成结果：

- [nginx.acm-board.conf](/E:/acm_board_frontend/nginx.acm-board.conf)

然后部署到服务器：

```bash
sudo cp nginx.acm-board.conf /etc/nginx/sites-available/acm-board
sudo ln -sf /etc/nginx/sites-available/acm-board /etc/nginx/sites-enabled/acm-board
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 7. 配置 Kafka 代理 systemd

项目已经提供模板：

- [acm-board-kafka-proxy.service](/E:/acm_board_frontend/acm-board-kafka-proxy.service)

复制到系统目录：

```bash
sudo cp acm-board-kafka-proxy.service /etc/systemd/system/acm-board-kafka-proxy.service
```

如果部署用户不是 `www-data`，先改一下 `User=`

然后启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable acm-board-kafka-proxy
sudo systemctl start acm-board-kafka-proxy
```

查看状态：

```bash
sudo systemctl status acm-board-kafka-proxy
journalctl -u acm-board-kafka-proxy -f
```

### 8. 更新发布

```bash
cd /opt/acm-board/frontend
git pull
npm install
npm run build
NODE_ENV=production npm run render:nginx
sudo cp nginx.acm-board.conf /etc/nginx/sites-available/acm-board
sudo systemctl restart acm-board-kafka-proxy
sudo systemctl reload nginx
```

## 五、项目里哪些配置已经支持 .env

前端构建配置：

- `VITE_EVENT_TITLE`
- `VITE_EVENT_START_AT`
- `VITE_EVENT_START_COUNTDOWN_TITLE`
- `VITE_EVENT_START_COUNTDOWN_SUBTITLE`
- `VITE_RANK_LIST_PATH`
- `VITE_FIRST_BLOOD_PATH`
- `VITE_KAFKA_WS_URL`
- `VITE_COUNTDOWN_TRIGGER_AT`
- `VITE_COUNTDOWN_DURATION_MINUTES`
- `VITE_COUNTDOWN_TITLE`
- `VITE_COUNTDOWN_SUBTITLE`
- `VITE_RANK_PAGE_SIZE`
- `VITE_RANK_ROTATE_MS`
- `VITE_RANK_AUTO_START`

本地开发配置：

- `DEV_SERVER_HOST`
- `DEV_SERVER_PORT`
- `DEV_ALLOWED_HOSTS`
- `DEV_API_PROXY_TARGET`
- `DEV_WS_PROXY_TARGET`

Kafka WebSocket 代理：

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

Nginx 模板：

- `SERVER_NAME`
- `STATIC_ROOT`
- `API_PROXY_TARGET`
- `WS_PROXY_TARGET`
- `FRONTEND_PORT`

## 六、上线后怎么验证

### 1. 页面是否能打开

浏览器访问：

```text
http://你的服务器IP/
```

### 2. 后端接口是否正常

```bash
curl http://127.0.0.1:8090/api/get_rank_list
curl http://127.0.0.1:8090/api/get_first_blood
```

### 3. Kafka 代理是否正常

传统部署：

```bash
sudo systemctl status acm-board-kafka-proxy
journalctl -u acm-board-kafka-proxy -f
```

Docker 部署：

```bash
docker compose logs -f kafka-proxy
```

正常时应该能看到类似：

- `Kafka connected`
- `Kafka subscribed to topic`
- `Frontend client connected`

### 4. WebSocket 是否握手成功

打开浏览器开发者工具，查看 `/ws`：

- 期望状态：`101 Switching Protocols`

## 七、常见问题

### 1. 页面能打开，但没有实时消息

先查：

- Kafka 代理是否真的在运行
- Kafka broker 是否可达
- topic 是否写对
- `/ws` 是否握手成功
- Kafka 消息内容是否是 JSON

### 2. 页面刷新 404

说明 Nginx 没配好 SPA 回退，确认有：

```nginx
try_files $uri $uri/ /index.html;
```

### 3. HTTPS 下 WebSocket 连不上

先查：

- 页面是否通过 `https://` 访问
- Nginx 的 `/ws` 是否带了 `Upgrade`
- 前端是否仍然在连错误的绝对 `ws://` 地址

### 4. Kafka 能连上，但收不到消息

先查：

- `KAFKA_BROKERS`
- `KAFKA_TOPIC`
- `KAFKA_GROUP_ID`
- 如果 Kafka 开了认证，`KAFKA_SSL` / `KAFKA_SASL_*` 是否正确

## 八、推荐做法

如果你只是想尽快上线：

1. 复制 [.env.production.example](/E:/acm_board_frontend/.env.production.example) 为 `.env.production`
2. 改好 Kafka 和后端地址
3. 执行 `docker compose --env-file .env.production up -d --build`

这是目前这套项目里最省心的部署方式。
