---
title: Docker 常用命令指南
summary: 从镜像、容器、Compose 到数据卷、网络与排查实战，一份覆盖环境搭建与部署场景的 Docker 命令速查手册。
category: 编程基础
difficulty: 入门
tags: [Docker, 容器, 部署]
official: https://docs.docker.com/
created: 2026-08-07
updated: 2026-08-07
---

## 工具简介

Docker 把应用及其依赖打包成标准化容器，解决「在我机器上能跑」的环境差异问题。无论本地起数据库、部署后端服务，还是做 CI/CD，Docker 都是现代开发的必备基础。本篇按「镜像 → 容器 → Compose → 数据 → 网络 → 排查」梳理高频命令，并给出真实场景用法与避坑提示。

## 基础配置

### 1. 安装与验证

```bash
docker --version             # 查看版本
docker info                  # 查看 Docker 引擎详情
docker version               # 客户端 + 服务端版本
```

### 2. 配置镜像加速

国内拉镜像慢，编辑 `/etc/docker/daemon.json`（Windows/Mac 在 Docker Desktop 设置里）：

```json
{
  "registry-mirrors": ["https://mirror.example.com"]
}
```

```bash
sudo systemctl restart docker
```

## 镜像操作

### 1. 拉取与查看

```bash
docker pull nginx:1.27        # 拉取指定版本镜像
docker pull nginx             # 拉取 latest（不推荐生产用）
docker images                 # 列出本地镜像
docker image ls -a            # 同上
docker image rm nginx:1.27    # 删除镜像
docker rmi <image-id>         # 删除镜像（旧命令）
```

### 2. 构建镜像

`Dockerfile` 示例：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

构建命令：

```bash
docker build -t myapp:1.0 .                # 在当前目录构建，打标签
docker build -t myapp:1.0 -f Dockerfile.prod .  # 指定 Dockerfile
docker build -t myapp:1.0 --no-cache .     # 不用缓存（排查构建问题）
```

### 3. 清理镜像

```bash
docker image prune            # 删除悬空镜像（无标签的中间层）
docker image prune -a         # 删除所有未被容器使用的镜像
docker system prune -a        # 一键清理镜像、停止的容器、网络、构建缓存
```

## 容器操作

### 1. 运行容器

```bash
docker run -d --name web -p 8080:80 nginx:1.27
# -d 后台运行
# --name 容器名
# -p 主机端口:容器端口
# -v 主机路径:容器路径（挂载卷）
# -e KEY=value（环境变量）

docker run -it --rm alpine sh    # 交互式进入，退出即删
```

### 2. 查看与日志

```bash
docker ps                     # 查看运行中的容器
docker ps -a                  # 查看所有容器（含已停止）
docker logs web               # 查看日志
docker logs -f web            # 持续追踪日志
docker logs --tail 100 web    # 最后 100 行
docker logs -t web            # 带时间戳
```

### 3. 生命周期

```bash
docker start web              # 启动已停止的容器
docker stop web               # 优雅停止（发 SIGTERM）
docker restart web            # 重启
docker kill web               # 强制停止（SIGKILL）
docker rm web                 # 删除已停止的容器
docker rm -f web              # 强制删除运行中的容器
```

### 4. 进入与执行

```bash
docker exec -it web sh        # 进入运行中的容器（推荐 sh，alpine 没 bash）
docker exec web ls /app       # 在容器内执行命令
docker cp web:/app/log.txt ./  # 从容器拷文件到主机
docker cp ./app.js web:/app/  # 从主机拷进容器
```

### 5. 查看详情

```bash
docker inspect web            # 完整配置（IP、挂载、环境变量等）
docker stats                  # 实时资源占用（CPU/内存/网络）
docker top web                # 容器内进程
docker port web               # 端口映射
```

## Docker Compose

多容器编排，用 `docker-compose.yml` 描述。

### 1. 示例文件

```yaml
services:
  web:
    build: .
    ports:
      - "8080:3000"
    environment:
      - DB_HOST=db
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:
```

### 2. 常用命令

```bash
docker compose up -d          # 构建并后台启动所有服务
docker compose up -d --build  # 强制重新构建镜像
docker compose down           # 停止并删除容器/网络
docker compose down -v        # 同时删除数据卷（清数据，谨慎）
docker compose ps             # 查看服务状态
docker compose logs -f web    # 追踪某服务日志
docker compose exec web sh    # 进入服务容器
docker compose restart web    # 重启某服务
docker compose pull           # 拉取服务镜像更新
```

## 数据持久化

### 1. 数据卷

```bash
docker volume create db-data          # 创建命名卷
docker volume ls                      # 列出卷
docker volume inspect db-data         # 查看卷在主机路径
docker volume rm db-data              # 删除卷
docker volume prune                   # 删除未被使用的卷
```

```bash
# 命名卷：由 Docker 管理，跨容器共享、迁移方便
docker run -v db-data:/var/lib/postgresql/data postgres:16

# 绑定挂载：直接映射主机目录，开发时改代码即时生效
docker run -v /home/me/app:/app myapp:1.0
```

### 2. 临时卷

```bash
docker run --rm -v /cache tmp-img     # 容器停止自动删
```

## 网络

### 1. 网络管理

```bash
docker network ls                      # 列出网络
docker network create my-net           # 创建自定义网络
docker network inspect my-net          # 查看网络详情
docker network rm my-net               # 删除网络
```

### 2. 容器互联

```bash
# 同一自定义网络内容器可用服务名互相访问
docker run -d --name app --network my-net myapp:1.0
docker run -d --name db --network my-net postgres:16
# app 容器内可直接用主机名 db 连数据库
```

> 默认 bridge 网络不支持用容器名访问，要用 IP。自定义 bridge 网络才支持 DNS 解析容器名。

## 镜像仓库

```bash
docker login registry.example.com        # 登录私有仓库
docker tag myapp:1.0 registry.example.com/team/myapp:1.0
docker push registry.example.com/team/myapp:1.0
docker pull registry.example.com/team/myapp:1.0
docker logout registry.example.com
```

## 实用技巧

### 1. 多阶段构建减小镜像

```dockerfile
# 构建阶段
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# 运行阶段：只带产物
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

最终镜像只有 nginx + 静态文件，体积从 1GB 降到几十 MB。

### 2. .dockerignore 别忘

```
node_modules
dist
.git
*.log
.env
```

避免把本地依赖、构建产物打进镜像，加快构建、减小体积、防泄密。

### 3. 合并 RUN 层

```dockerfile
# 不好：3 个层
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# 好：1 个层，清理在同一层
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

### 4. 别用 latest 标签

`latest` 会随上游变化，今天能跑明天可能崩。生产环境一律用具体版本号，可追溯可回滚。

### 5. 一键导出/导入镜像

```bash
docker save -o myapp.tar myapp:1.0      # 导出
docker load -i myapp.tar                # 导入（内网部署常用）
```

## 注意事项

- **数据别存在容器里**：容器删除数据就没了，数据库类服务务必挂卷。
- **`down -v` 是清数据开关**：调试时慎用，会删掉所有命名卷。
- **权限问题**：Linux 上挂载卷常出现容器内写不进去（uid 不匹配），用 `chown` 或指定 `user`。
- **端口冲突**：`-p 8080:80` 时主机 8080 被占会启动失败，`docker ps` 看状态或换端口。
- **镜像别太大**：用 alpine 变体、多阶段构建，生产镜像控制在几百 MB 内。
- **不要在镜像里放密钥**：用环境变量或 secrets 管理，`.env` 别打进镜像。
- **磁盘易爆**：旧镜像、停止容器会累积，定期 `docker system prune` 清理。
- **CMD 与 ENTRYPOINT**：`CMD` 可被 `docker run` 参数覆盖，`ENTRYPOINT` 更固定，配合 `CMD` 当默认参数。

## 实战案例

### 案例 1：本地一键起数据库 + 缓存

开发时不想装 MySQL、Redis，用 Compose 起依赖：

```bash
docker compose up -d
# 几秒后 MySQL、Redis 就绪，应用连 localhost:3306 / localhost:6379
```

用完 `docker compose down`，环境干净。

### 案例 2：容器频繁退出，排查原因

`docker ps` 看不到容器，`docker ps -a` 发现已退出：

```bash
docker ps -a
docker logs <container-id>        # 看退出前的报错
docker inspect <container-id> --format '{{.State.ExitCode}}'  # 退出码
```

退出码 137 多为 OOM 被杀，加 `--memory` 限制并排查内存泄漏。

### 案例 3：构建缓存失效变慢

每次 `docker build` 都重新 `npm ci`，几秒钟变几分钟。检查 `Dockerfile` 顺序：

```dockerfile
# 不好：COPY . . 在 npm ci 之前，改任意代码都重装依赖
COPY . .
RUN npm ci

# 好：先拷 package.json 装依赖，再拷代码，依赖层可缓存
COPY package*.json ./
RUN npm ci
COPY . .
```

### 案例 4：进入容器调试

容器起不来或行为异常，进去看个究竟：

```bash
docker exec -it web sh
# 容器内
ls /app
cat /etc/hosts
# 容器已退出？用镜像起一个临时容器
docker run -it --rm --entrypoint sh myapp:1.0
```

## 相关条目

- [Linux 常用命令指南](../linux-commands)
- [Shell 脚本基础](../shell-scripting)
- [HTTP 与 curl 实用指南](../http-curl)
