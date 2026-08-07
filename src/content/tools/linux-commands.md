---
title: Linux 常用命令指南
summary: 从文件操作、文本处理、进程管理到网络与权限，一份覆盖日常开发与运维场景的 Linux 命令速查与实战手册。
category: 编程基础
difficulty: 入门
tags: [Linux, 命令行, Shell]
official: https://www.kernel.org/
created: 2026-08-07
updated: 2026-08-07
---

## 工具简介

Linux 是服务器领域的主流操作系统，也是开发者的必备技能。无论部署应用、排查线上问题，还是在 WSL / macOS 终端里日常操作，熟练掌握常用命令都能大幅提升效率。本篇按「文件 → 文本 → 进程 → 网络 → 权限 → 实战」梳理高频命令，并给出真实场景用法与避坑提示。

## 文件与目录操作

### 1. 路径与导航

```bash
pwd                 # 显示当前绝对路径
cd /var/log         # 切换到指定目录
cd ~                # 回到用户主目录
cd -                # 回到上一次所在目录
cd ..               # 回到上级目录
ls                  # 列出当前目录
ls -la              # 详细列表（含隐藏文件、权限、大小）
ls -lh              # 人类可读的文件大小（K/M/G）
ls -lt              # 按修改时间排序（新在前）
tree -L 2           # 树状结构显示 2 层（需安装 tree）
```

### 2. 创建与删除

```bash
mkdir project               # 创建目录
mkdir -p a/b/c              # 递归创建多层目录
touch file.txt              # 创建空文件 / 更新时间戳
rm file.txt                 # 删除文件
rm -rf dist                 # 递归强删目录（危险，慎用）
rmdir empty-dir             # 删除空目录
```

### 3. 复制与移动

```bash
cp file.txt file.bak            # 复制文件
cp -r src/ src-backup/          # 递归复制目录
mv old.txt new.txt              # 重命名 / 移动
mv file.txt /tmp/               # 移动到 /tmp
```

### 4. 查看文件内容

```bash
cat file.txt                # 输出全部内容
less file.txt               # 分页查看（q 退出，/ 搜索）
head -n 20 file.txt         # 前 20 行
tail -n 50 file.txt         # 后 50 行
tail -f /var/log/app.log    # 持续追踪日志（调试常用）
wc -l file.txt              # 统计行数
```

### 5. 查找文件

```bash
find . -name "*.go"                 # 按名字查找
find /var/log -name "*.log" -mtime -7  # 7 天内修改的日志
find . -type f -size +10M           # 大于 10M 的文件
find . -name "*.tmp" -delete        # 查找并删除
which node                          # 查找命令位置
whereis nginx                       # 查找二进制、源码、man
```

## 文本处理

### 1. grep 搜索

```bash
grep "error" app.log               # 搜索关键字
grep -i "error" app.log            # 忽略大小写
grep -n "error" app.log            # 显示行号
grep -r "TODO" src/                # 递归搜索目录
grep -v "debug" app.log            # 反向匹配（排除 debug 行）
grep -E "error|warn" app.log       # 正则匹配多个关键词
grep -c "error" app.log            # 只输出匹配行数
```

### 2. 文本转换

```bash
sed 's/foo/bar/g' file.txt         # 全局替换 foo 为 bar
sed -i 's/foo/bar/g' file.txt      # 直接修改原文件
awk '{print $1, $3}' file.txt      # 打印第 1、3 列
awk -F: '{print $1}' /etc/passwd   # 按 : 分隔，打印用户名
sort file.txt                      # 排序
sort -u file.txt                   # 排序并去重
uniq file.txt                      # 去除相邻重复行（常配合 sort）
cut -d, -f2 data.csv               # 按逗号分隔取第 2 列
tr 'a-z' 'A-Z' < file.txt          # 小写转大写
```

### 3. 管道与重定向

```bash
command > out.txt          # 输出重定向（覆盖）
command >> out.txt         # 输出重定向（追加）
command 2> err.txt         # 错误输出重定向
command > all.txt 2>&1     # 合并标准输出与错误
command < input.txt        # 输入重定向
ls | grep ".go"            # 管道：前一个命令的输出作后一个的输入
```

### 4. 经典组合

```bash
# 统计每种 HTTP 状态码出现次数
cat access.log | awk '{print $9}' | sort | uniq -c | sort -rn

# 找出占用最大的 10 个文件
du -ah | sort -rh | head -n 10
```

## 进程与资源

### 1. 查看进程

```bash
ps aux                     # 查看所有进程
ps aux | grep nginx        # 查找 nginx 进程
top                        # 实时进程（按 CPU/内存排序）
htop                       # 更友好的 top（需安装）
pgrep -f "node app"        # 按命令名查 PID
```

### 2. 控制进程

```bash
kill 1234                  # 发送默认 TERM 信号
kill -9 1234               # 强制杀死（SIGKILL，最后手段）
killall nginx              # 按进程名杀
pkill -f "node app"        # 按命令行匹配杀
nohup node app.js &        # 后台运行，退出终端不中断
jobs                       # 查看后台任务
fg %1                      # 把后台任务调到前台
```

### 3. 系统资源

```bash
free -h                    # 内存使用
df -h                      # 磁盘使用
du -sh /var/log            # 某目录总大小
du -h --max-depth=1 /var   # 一层子目录大小
uptime                     # 负载与运行时间
uname -a                   # 内核信息
```

## 网络相关

### 1. 连通性检查

```bash
ping example.com           # 测试连通性
ping -c 4 example.com      # 只发 4 个包
curl -I https://example.com   # 只看响应头
curl -X POST -d 'a=1' https://api.example.com  # 发 POST
wget https://example.com/file.tar.gz           # 下载文件
```

### 2. 端口与连接

```bash
ss -tlnp                   # 查看监听的 TCP 端口（推荐，替代 netstat）
ss -ant                    # 所有 TCP 连接
lsof -i:8080               # 查看占用 8080 端口的进程
netstat -tlnp              # 旧命令，查看监听端口
```

### 3. 网络排查

```bash
dig example.com            # DNS 查询
nslookup example.com       # DNS 查询（简单）
traceroute example.com     # 路由跟踪
ip addr                    # 查看 IP 地址（替代 ifconfig）
ip route                   # 查看路由表
```

## 权限与用户

### 1. 文件权限

```bash
ls -l file.txt             # 查看 -rwxr-xr--
chmod 755 file.sh          # rwxr-xr-x
chmod +x deploy.sh         # 给所有用户加执行权限
chmod u+x file.sh          # 仅给所有者加执行权限
chown user:group file.txt  # 修改所有者和组
chown -R user:group dist/  # 递归修改
```

权限数字含义：读 `r=4`，写 `w=2`，执行 `x=1`，三位分别对应所有者 / 组 / 其他。

### 2. 用户管理

```bash
whoami                     # 当前用户
id                         # 用户与组信息
sudo command               # 以管理员权限执行
su - deploy                # 切换到 deploy 用户
useradd -m newuser         # 创建用户并建主目录
passwd newuser             # 设置密码
userdel -r olduser         # 删除用户及主目录
groupadd devteam           # 创建组
usermod -aG devteam alice  # 把 alice 加入 devteam（不离开原组）
```

## 压缩与解压

```bash
tar -czvf dist.tar.gz dist/      # 打包并 gzip 压缩
tar -xzvf dist.tar.gz            # 解压
tar -cjvf dist.tar.bz2 dist/     # bzip2 压缩（更小更慢）
tar -xjvf dist.tar.bz2           # 解压 bzip2
zip -r dist.zip dist/            # zip 压缩
unzip dist.zip                   # 解压 zip
gzip file.txt                    # 压缩单个文件（原文件消失）
gunzip file.txt.gz               # 解压
```

> tar 选项记忆：**c**reate / e**x**tract / **z** gzip / **j** bzip2 / **v** verbose / **f** file。

## 实用技巧

### 1. 历史命令与快捷键

```bash
history                    # 查看历史命令
!!                         # 执行上一条命令
sudo !!                    # 用 sudo 重跑上一条
!100                       # 执行历史第 100 条
Ctrl + R                   # 反向搜索历史（输入关键词即查）
Ctrl + C                   # 终止当前命令
Ctrl + Z                   # 挂起到后台
Ctrl + D                   # 退出当前 shell / EOF
Ctrl + L                   # 清屏（等同 clear）
Tab                        # 自动补全
```

### 2. 任务定时

```bash
crontab -e                 # 编辑定时任务
crontab -l                 # 查看定时任务
# 每天凌晨 3 点备份数据库
# 0 3 * * * /opt/scripts/backup.sh
```

### 3. 文件传输

```bash
scp file.txt user@host:/tmp/                 # 上传文件
scp user@host:/var/log/app.log ./            # 下载文件
scp -r dist/ user@host:/opt/app/             # 传目录
rsync -avz --progress dist/ user@host:/opt/app/  # 增量同步（推荐）
```

### 4. 环境变量

```bash
echo $PATH                 # 查看环境变量
export NODE_ENV=production # 设置临时变量
env                        # 查看所有环境变量
# 永久生效：写入 ~/.bashrc 或 ~/.zshrc，然后 source
source ~/.bashrc
```

## 注意事项

- **`rm -rf` 是高危命令**：路径一定要确认，尤其是带变量时（`rm -rf $DIR/*` 当 `$DIR` 为空会删当前目录）。可加 `set -u` 防止变量未定义。
- **生产环境慎用 `kill -9`**：进程无法做清理，可能导致数据损坏或锁残留。先用 `kill`（TERM），不行再 `-9`。
- **不要用 root 跑业务**：权限过大风险高，建独立用户并配 sudo。
- **改配置先备份**：`cp nginx.conf nginx.conf.bak`，改完 `nginx -t` 测试再 reload。
- **`tail -f` 看日志要配合 `grep`**：`tail -f app.log | grep error` 才不会被刷屏。
- **管道只传 stdout**：错误信息要加 `2>&1` 才能进入管道。
- **`chmod -R` 谨慎用**：尤其 `chmod -R 777 /` 是灾难，按需设置最小权限。
- **后台任务用 `nohup` 或 `systemd`**：直接 `&` 在终端关闭时会被 SIGHUP 杀掉。

## 实战案例

### 案例 1：排查线上 CPU 飙高

应用 CPU 突然 100%，定位元凶：

```bash
top                        # 找到 CPU 最高的 PID，比如 12345
top -Hp 12345              # 查看该进程内线程 CPU（-H 显示线程）
# 记下 CPU 最高的线程 ID，转 16 进制
printf "%x\n" 12367        # 假设是 304f
# 打印线程堆栈
jstack 12345 | grep 304f -A 30   # Java 应用
```

### 案例 2：磁盘空间突然占满

`df -h` 显示 `/var` 满，定位大文件：

```bash
df -h                                      # 确认哪个分区满
du -h --max-depth=1 /var 2>/dev/null | sort -rh | head
# 顺藤摸瓜找到 /var/log/app.log 占了 50G
# 查看谁在写，不能直接删（进程还持有文件句柄）
lsof /var/log/app.log                      # 找到写入进程
truncate -s 0 /var/log/app.log             # 清空而不删文件，进程继续写
```

> 直接 `rm` 被进程持有的日志文件，磁盘空间不会释放（进程还拿着句柄）。`truncate` 或重启进程才释放。

### 案例 3：批量替换代码里的旧域名

把项目里所有 `old.example.com` 换成 `new.example.com`：

```bash
grep -rl "old.example.com" src/ | xargs sed -i 's/old\.example\.com/new.example.com/g'
```

先 `grep -rl` 列出受影响文件，确认无误再执行 sed。

### 案例 4：端口被占用启动失败

应用报 `address already in use`：

```bash
ss -tlnp | grep :8080       # 找到占用 8080 的 PID
lsof -i:8080                # 确认进程信息
kill 12345                  # 干掉残留进程后重启
```

## 相关条目

- [Git 常用命令指南](../git-commands)
- [Claude Code 使用指南](../claude-code)
- [Codex 使用指南](../codex)
