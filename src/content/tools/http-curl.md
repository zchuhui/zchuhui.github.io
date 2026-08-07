---
title: HTTP 与 curl 实用指南
summary: 从请求方法、状态码、请求头到 curl 常用参数与认证，一份覆盖 API 调试、接口对接与网络排查的实战手册。
category: 编程基础
difficulty: 入门
tags: [HTTP, curl, API, 网络]
official: https://curl.se/
created: 2026-08-07
updated: 2026-08-07
---

## 工具简介

HTTP 是 Web 世界的通用语言，无论调接口、做爬虫、排查线上问题，还是配合 AI 编程工具联调 API，都绕不开它。curl 是最通用的命令行 HTTP 客户端，几乎预装在所有系统。本篇按「方法与状态码 → 请求头与参数 → curl 用法 → 认证 → 调试 → 实战」梳理，帮你把接口调试从「猜」变成「看」。

## HTTP 基础

### 1. 请求方法

| 方法 | 语义 | 幂等 | 典型用途 |
|------|------|------|----------|
| GET | 获取资源 | 是 | 查询列表、详情 |
| POST | 新建资源 | 否 | 提交表单、创建记录 |
| PUT | 全量替换 | 是 | 更新整条记录 |
| PATCH | 部分更新 | 否 | 改单个字段 |
| DELETE | 删除 | 是 | 删除记录 |
| HEAD | 只取响应头 | 是 | 检查资源是否存在 |
| OPTIONS | 查询支持的方法 | 是 | 预检请求（CORS） |

> 幂等：多次执行结果相同。GET/PUT/DELETE 幂等，POST/PATCH 不幂等。

### 2. 状态码

```text
2xx 成功
  200 OK               请求成功
  201 Created          资源已创建
  204 No Content       成功但无内容（DELETE 常用）

3xx 重定向
  301 Moved            永久重定向
  302 Found            临时重定向
  304 Not Modified     缓存命中

4xx 客户端错误
  400 Bad Request      参数错误
  401 Unauthorized     未认证（没登录或 token 无效）
  403 Forbidden        无权限（登录了但没权限）
  404 Not Found        资源不存在
  409 Conflict         冲突（如重复创建）
  422 Unprocessable    语法对但语义错（校验失败）
  429 Too Many Requests 限流

5xx 服务端错误
  500 Internal Error   服务器内部错误
  502 Bad Gateway      网关错误（上游挂了）
  503 Service Unavailable  服务不可用（过载/维护）
  504 Gateway Timeout  网关超时
```

### 3. 请求与响应结构

```text
POST /api/users HTTP/1.1          # 请求行：方法 路径 协议
Host: api.example.com             # 请求头
Content-Type: application/json
Authorization: Bearer xxx
                                 # 空行
{"name":"alice"}                  # 请求体
```

```text
HTTP/1.1 201 Created              # 状态行
Content-Type: application/json    # 响应头
Location: /api/users/123

{"id":123,"name":"alice"}         # 响应体
```

## curl 基础用法

### 1. 最简单的请求

```bash
curl https://example.com                    # GET 请求，输出响应体
curl -I https://example.com                 # 只看响应头（HEAD）
curl -i https://example.com                 # 响应头 + 响应体
curl -s https://example.com                 # 静默（不显示进度条）
curl -o file.html https://example.com       # 保存到文件
curl -O https://example.com/file.tar.gz     # 用原文件名保存
```

### 2. 指定方法与数据

```bash
curl -X POST https://api.example.com/users
curl -X PUT https://api.example.com/users/1
curl -X DELETE https://api.example.com/users/1

# 发送表单
curl -d "name=alice&age=20" https://api.example.com/users
# -d 默认 POST，Content-Type 自动设为 application/x-www-form-urlencoded

# 发送 JSON
curl -H "Content-Type: application/json" \
     -d '{"name":"alice","age":20}' \
     https://api.example.com/users

# 从文件读请求体
curl -H "Content-Type: application/json" \
     -d @body.json \
     https://api.example.com/users
```

### 3. 请求头与查询参数

```bash
# 添加请求头
curl -H "Authorization: Bearer xxx" \
     -H "Accept: application/json" \
     https://api.example.com/users

# 查询参数直接拼在 URL
curl "https://api.example.com/users?page=1&size=20"

# 用 --data-urlencode 自动编码
curl -G https://api.example.com/search \
     --data-urlencode "q=hello world" \
     --data-urlencode "lang=zh"
```

### 4. 跟随重定向与超时

```bash
curl -L https://example.com         # 跟随 3xx 重定向
curl --max-time 10 https://example.com   # 总超时 10 秒
curl --connect-timeout 5 https://...     # 连接超时 5 秒
curl --retry 3 https://example.com       # 失败重试 3 次
```

### 5. 详细调试

```bash
curl -v https://example.com         # 显示完整请求/响应过程（排查必备）
curl -v --trace-ascii - https://...  # 更底层，含传输细节
```

`-v` 会把请求头、响应头、TLS 握手都打出来，是排查「为什么接口不通」的第一工具。

## 认证方式

### 1. Bearer Token

```bash
curl -H "Authorization: Bearer eyJhbGci..." https://api.example.com/me
```

### 2. Basic Auth

```bash
curl -u user:pass https://api.example.com/data
# 等价于 -H "Authorization: Basic base64(user:pass)"
```

### 3. API Key（Header 或 Query）

```bash
# Header
curl -H "X-API-Key: abc123" https://api.example.com/data
# Query
curl "https://api.example.com/data?api_key=abc123"
```

### 4. Cookie / Session

```bash
# 保存返回的 cookie
curl -c cookies.txt -d "user=alice&pass=xxx" https://example.com/login
# 后续请求带上 cookie
curl -b cookies.txt https://example.com/dashboard
```

### 5. OAuth 客户端凭证（机器对机器）

```bash
# 1. 换 token
TOKEN=$(curl -s -u clientId:clientSecret \
  -d "grant_type=client_credentials" \
  https://auth.example.com/oauth/token | jq -r .access_token)
# 2. 用 token 调接口
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/data
```

## 实用技巧

### 1. 美化 JSON 输出

curl 返回的 JSON 是一坨，配合 `jq` 格式化与查询：

```bash
curl -s https://api.example.com/users | jq .
# 取字段
curl -s https://api.example.com/users | jq '.[0].name'
# 过滤
curl -s https://api.example.com/users | jq '.[] | select(.age>18)'
```

### 2. 只看关键信息

```bash
# 只看状态码
curl -s -o /dev/null -w "%{http_code}\n" https://example.com
# 看耗时
curl -s -o /dev/null -w "dns:%{time_namelookup} connect:%{time_connect} total:%{time_total}\n" https://example.com
```

### 3. 调试 HTTPS 证书问题

```bash
curl -v https://example.com            # 看证书链
curl --cacert custom-ca.pem https://... # 用自签 CA
curl -k https://self-signed.example.com # 跳过证书校验（仅调试，别生产用）
```

### 4. 上传文件

```bash
# multipart/form-data 上传
curl -F "file=@photo.jpg" https://upload.example.com
curl -F "file=@photo.jpg" -F "name=alice" https://upload.example.com
```

### 5. 用配置文件存公共参数

`~/.curlrc`：

```text
silent
show-error
write-out "\n"
```

之后所有 curl 默认带这些参数。

### 6. 复制浏览器请求为 curl

Chrome DevTools → Network → 右键某请求 → Copy → Copy as cURL。粘贴到终端即可复现，含完整 cookie/header，排查问题极快。

## 注意事项

- **URL 要加引号**：`curl "https://...?a=1&b=2"`，否则 `&` 会被 shell 当后台执行符。
- **`-d` 默认 POST**：想用 GET 带 body 要显式 `-X GET`，但多数服务器不接受 GET body。
- **JSON 要单引号包**：`-d '{"a":1}'`，内部双引号不冲突；若 JSON 里要单引号需转义。
- **`-k` 别进生产**：跳过证书校验是调试用，生产代码里关掉会有中间人风险。
- **敏感信息别进命令历史**：`-u user:pass` 会留在 `~/.bash_history`，用 `.netrc` 或环境变量。
- **POST/PUT 别忘 `Content-Type`**：服务器靠它解析 body，错了会 415 或解析失败。
- **重试要幂等**：`--retry` 只对网络错误重试，非幂等的 POST 自动重试可能重复创建，需谨慎。
- **超时必设**：不设超时的 curl 会一直挂，尤其在脚本里调用接口时。

## 实战案例

### 案例 1：调试接口返回 500

```bash
curl -v -H "Authorization: Bearer xxx" \
     -H "Content-Type: application/json" \
     -d '{"name":"alice"}' \
     https://api.example.com/users
```

`-v` 看请求是否带对了头、body 格式对不对，响应头里常有错误细节。确认请求无误后再找后端。

### 案例 2：批量测试接口性能

```bash
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{http_code} %{time_total}\n" \
       https://api.example.com/users
done
```

看 100 次的状态码与耗时分布，判断是否稳定、是否有限流。

### 案例 3：调用第三方 API（带鉴权）

```bash
# 1. 拿 token
TOKEN=$(curl -s -X POST https://auth.example.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=xxx&client_secret=yyy" \
  | jq -r .access_token)

# 2. 调业务接口
curl -s -H "Authorization: Bearer $TOKEN" \
     "https://api.example.com/orders?status=paid" | jq .
```

### 案例 4：排查「浏览器能访问、curl 不行」

```bash
# 浏览器复制完整请求头，逐个减，定位是哪个头关键
curl -H "User-Agent: Mozilla/5.0..." \
     -H "Referer: https://example.com" \
     -H "Cookie: ..." \
     https://example.com/api
```

常见原因：服务器校验 `User-Agent`、`Referer`、或需要 `Cookie`。用 `-v` 对比浏览器请求头逐项排查。

## 相关条目

- [Linux 常用命令指南](../linux-commands)
- [正则表达式速查指南](../regex-cheatsheet)
- [Docker 常用命令指南](../docker-commands)
