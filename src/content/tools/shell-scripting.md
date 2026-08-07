
## 工具简介

Shell 脚本把多条命令组合成可重复执行的自动化程序。从批量重命名文件、定时备份、CI/CD 流程，到部署脚本和服务器初始化，都靠它。掌握 Shell 是 Linux 命令的进阶——从「敲命令」到「写脚本」，效率质变。本篇以 Bash 为主，按「脚本结构 → 变量 → 流程控制 → 函数 → 管道重定向 → 实战」梳理。

## 脚本结构

### 1. 第一行与执行

```bash
#!/usr/bin/env bash
# 上面这行叫 shebang，指定解释器

echo "Hello, Shell"
```

保存为 `hello.sh`，两种执行方式：

```bash
chmod +x hello.sh        # 加执行权限
./hello.sh               # 直接执行

# 或不设权限，用解释器跑
bash hello.sh
```

### 2. 严格模式（强烈推荐）

脚本开头加这两行，避免隐式错误：

```bash
set -euo pipefail
```

- `-e`：命令失败立即退出（默认会继续往下跑，埋雷）
- `-u`：用了未定义变量直接报错（避免 `$VAR` 为空造成 `rm -rf $DIR/*` 灾难）
- `-o pipefail`：管道中任一命令失败，整条管道算失败（默认只看最后一个）

调试时可加 `set -x` 打印每条执行的命令。

## 变量

### 1. 定义与使用

```bash
name="Shell"             # 赋值：等号两边不能有空格
echo $name               # 使用：加 $
echo "$name"             # 推荐带引号，防空格/通配
echo "${name}Script"     # 花括号界定变量边界
```

> 注意：`name = "Shell"`（带空格）会被当成命令执行，报错。

### 2. 引号差异

```bash
greeting="World"
echo "Hello, $greeting"  # 双引号：变量会被展开 → Hello, World
echo 'Hello, $greeting'  # 单引号：原样输出 → Hello, $greeting
```

### 3. 特殊变量

```bash
$0          # 脚本名
$1 $2 ...   # 第 1、2 个参数
$#          # 参数个数
$@          # 所有参数（每个独立）
$*          # 所有参数（合成一个字符串）
$?          # 上一条命令退出码（0 成功，非 0 失败）
$$          # 当前脚本 PID
$!          # 最近一个后台进程 PID
```

### 4. 命令替换

把命令输出存进变量：

```bash
now=$(date +%Y-%m-%d)           # 推荐写法
files=$(ls *.go)
count=`ls | wc -l`              # 旧写法（反引号），不推荐，难嵌套
```

### 5. 默认值与赋值

```bash
echo ${name:-anonymous}     # name 未设或空，用 anonymous（不改 name）
echo ${name:=anonymous}     # 同上，且把 anonymous 赋给 name
```

## 字符串与数组

### 1. 字符串操作

```bash
s="Hello, World"
echo ${#s}                  # 长度：12
echo ${s:7:5}               # 从第 7 位取 5 个字符：World
echo ${s%,*}                # 删右侧最短匹配：Hello
echo ${s%%,*}               # 删右侧最长匹配（同上例）
echo ${s#*,}                # 删左侧最短匹配： World
echo ${s##*,}               # 删左侧最长匹配：World
echo ${s/World/Shell}       # 替换第一个：Hello, Shell
echo ${s//l/L}              # 替换全部：HeLLo, WorLd
```

### 2. 数组

```bash
fruits=("apple" "banana" "cherry")
echo ${fruits[0]}           # apple
echo ${fruits[@]}           # 全部
echo ${#fruits[@]}          # 长度：3
fruits+=("date")            # 追加

# 遍历
for f in "${fruits[@]}"; do
  echo "$f"
done
```

## 流程控制

### 1. 条件判断

```bash
if [ "$age" -ge 18 ]; then
  echo "成年"
elif [ "$age" -ge 13 ]; then
  echo "少年"
else
  echo "儿童"
fi
```

`[ ]` 即 `test` 命令，常用判断：

```bash
[ -z "$var" ]          # 字符串为空
[ -n "$var" ]          # 字符串非空
[ "$a" = "$b" ]        # 字符串相等
[ "$a" != "$b" ]       # 不等
[ -f file.txt ]        # 文件存在且是普通文件
[ -d dir/ ]            # 目录存在
[ -e path ]            # 路径存在
[ -r file ]            # 可读 / -w 可写 / -x 可执行
[ "$a" -eq "$b" ]      # 整数相等
[ "$a" -lt "$b" ]      # 小于 (-le -gt -ge -ne)
```

> 习惯用 `[[ ]]` 代替 `[ ]`：支持 `&&` `||` `<` `>`，变量为空也不报错，是 Bash 增强版。

### 2. 循环

```bash
# for 遍历
for i in 1 2 3; do
  echo $i
done

# for C 风格
for ((i=0; i<5; i++)); do
  echo $i
done

# 遍历文件
for f in *.go; do
  echo "处理 $f"
done

# while
count=0
while [ $count -lt 3 ]; do
  echo $count
  ((count++))
done

# 逐行读文件
while IFS= read -r line; do
  echo "$line"
done < input.txt
```

### 3. case 分支

```bash
case "$1" in
  start)   echo "启动";;
  stop)    echo "停止";;
  restart) echo "重启";;
  *)       echo "用法: $0 {start|stop|restart}"; exit 1;;
esac
```

## 函数

```bash
# 定义
greet() {
  local name="$1"          # local 限定局部变量，避免污染全局
  echo "Hello, $name"
}

# 调用
greet "Shell"              # Hello, Shell

# 带返回值（用命令替换捕获输出）
add() {
  echo $(($1 + $2))
}
result=$(add 3 5)          # 8

# 用 return 返回状态码（0-255）
is_root() {
  [ "$(id -u)" -eq 0 ]
}
if is_root; then
  echo "是 root"
fi
```

## 管道与重定向

```bash
command > out.txt            # 标准输出覆盖写
command >> out.txt           # 追加
command 2> err.txt           # 错误输出
command > all.txt 2>&1       # 合并输出与错误
command &> all.txt           # 合并（简写）
command < input.txt          # 输入重定向

# 管道
ls *.log | grep error | wc -l
```

### here-doc 多行文本

```bash
cat > config.ini <<EOF
[server]
port = 8080
host = 0.0.0.0
EOF
```

## 输入与交互

```bash
read -p "请输入名字: " name     # 带提示
read -s -p "密码: " pwd         # 静默输入（不回显）
read -t 5 answer                # 5 秒超时

select opt in "部署" "回滚" "退出"; do
  case $opt in
    部署)  deploy;;
    回滚)  rollback;;
    退出)  break;;
  esac
done
```

## 实用技巧

### 1. 安全处理路径与文件名

文件名带空格、特殊字符时，`for f in $(ls)` 会拆错：

```bash
# 错误：ls 输出按空格拆分
for f in $(ls); do ...

# 正确：通配符直接展开，或用 find -print0
for f in *.txt; do
  echo "$f"
done

find . -name "*.log" -print0 | while IFS= read -r -d '' f; do
  echo "$f"
done
```

### 2. trap 捕获退出做清理

脚本中途被 Ctrl+C 或出错退出，临时文件会残留：

```bash
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT      # 退出时（无论正常异常）清理
# 业务逻辑...
```

### 3. 并行加速批量任务

```bash
for f in *.png; do
  convert "$f" "${f%.png}.jpg" &
done
wait                          # 等所有后台任务完成
echo "全部转换完成"
```

### 4. 检查命令是否存在

```bash
if ! command -v docker &>/dev/null; then
  echo "请先安装 docker" >&2
  exit 1
fi
```

### 5. 调试三件套

```bash
bash -n script.sh        # 只做语法检查，不执行
bash -x script.sh        # 执行并打印每条命令（排查逻辑）
set -x                   # 在脚本内开启 / set +x 关闭
```

## 注意事项

- **变量赋值等号两边不能有空格**：`a = 1` 会被当命令 `a` 带参数 `=` `1`。
- **变量引用务必加双引号**：`"$var"` 防空格、通配符展开，是脚本地雷的最大来源。
- **`set -euo pipefail` 应成默认**：否则失败不退出、空变量传下去会引发诡异 bug。
- **`rm -rf $DIR/*` 危险**：`$DIR` 为空时变成 `rm -rf /*`，加 `set -u` 或判空。
- **Bash 不能算浮点数**：`echo $((1/3))` 得 0，要用 `bc` 或 `awk`。
- **可移植性**：`[[ ]]` 数组 `(( ))` 是 Bash 扩展，纯 POSIX sh（如 Alpine 的默认 sh）不支持，写 `#!/bin/sh` 时慎用。
- **别用 Shell 写复杂逻辑**：超过 100 行、有复杂数据结构时，换 Python/Go，可维护性强得多。
- **密码别硬编码**：从环境变量或 secrets 文件读，脚本本身别带密钥。

## 实战案例

### 案例 1：批量重命名文件

把所有 `.jpeg` 改成 `.jpg`：

```bash
#!/usr/bin/env bash
set -euo pipefail

for f in *.jpeg; do
  mv -- "$f" "${f%.jpeg}.jpg"
done
```

`${f%.jpeg}` 删除后缀，`--` 防文件名以 `-` 开头被当选项。

### 案例 2：日志按日期归档

```bash
#!/usr/bin/env bash
set -euo pipefail

log_dir="/var/log/myapp"
archive_dir="/backup/logs"
date=$(date +%Y%m%d)

mkdir -p "$archive_dir"
tar -czf "$archive_dir/app-$date.tar.gz" -C "$log_dir" .
echo "归档完成: $archive_dir/app-$date.tar.gz"
```

配 `crontab` 每天跑，自动归档。

### 案例 3：批量压缩图片并并行

```bash
#!/usr/bin/env bash
set -euo pipefail

for f in *.png; do
  (
    convert "$f" -resize 50% "thumb-$f"
    echo "完成: $f"
  ) &
done
wait
echo "全部完成"
```

子 shell `( ) &` 让每个任务并行，`wait` 等齐。

### 案例 4：带参数的部署脚本

```bash
#!/usr/bin/env bash
set -euo pipefail

env="${1:-dev}"              # 第一个参数，默认 dev

deploy() {
  local target=$1
  echo "部署到 $target..."
  # 实际部署逻辑
}

case "$env" in
  dev|staging|prod) deploy "$env" ;;
  *) echo "用法: $0 [dev|staging|prod]"; exit 1 ;;
esac
```

## 相关条目

- [Linux 常用命令指南](../linux-commands)
- [Git 常用命令指南](../git-commands)
- [Docker 常用命令指南](../docker-commands)
