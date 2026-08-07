
## 工具简介

Git 是目前最主流的分布式版本控制系统。几乎所有团队协作、代码托管（GitHub / GitLab / Gitee）都以 Git 为底层。掌握常用命令，不仅是写代码的基本功，也是参与开源、做 Code Review、配合 AI 编程工具的前提。

本篇按「配置 → 日常 → 分支 → 历史 → 撤销 → 远程 → 进阶」的顺序梳理高频命令，并给出真实场景的用法与避坑提示。

## 初始配置

### 1. 全局身份配置

第一次安装 Git 后必须设置用户信息，否则无法提交：

```bash
git config --global user.name "你的名字"
git config --global user.email "you@example.com"
```

### 2. 常用全局配置

```bash
# 默认分支名改为 main
git config --global init.defaultBranch main

# 让 git pull 默认用 rebase，历史更干净
git config --global pull.rebase true

# 设置默认编辑器
git config --global core.editor "code --wait"

# 开启彩色输出
git config --global color.ui auto

# 查看所有配置
git config --list
```

### 3. 配置 SSH 密钥（推荐）

免密推送代码到 GitHub / GitLab：

```bash
ssh-keygen -t ed25519 -C "you@example.com"
# 一路回车，然后把 ~/.ssh/id_ed25519.pub 内容粘到代码托管平台
ssh -T git@github.com   # 测试连通性
```

## 基础工作流

### 1. 仓库初始化与克隆

```bash
# 把当前目录变成 Git 仓库
git init

# 克隆远程仓库
git clone git@github.com:user/repo.git

# 只克隆最近一次提交（大仓库省流量）
git clone --depth 1 git@github.com:user/repo.git
```

### 2. 查看状态

```bash
git status              # 工作区状态
git status -s           # 简洁模式
```

### 3. 暂存与提交

```bash
git add file.txt        # 暂存单个文件
git add .               # 暂存所有变更（不含删除）
git add -A              # 暂存所有变更（含删除、新增）
git add -p              # 交互式选择代码块暂存（强烈推荐）

git commit -m "feat: 新增用户注册接口"
git commit -am "fix: 修复登录跳转"   # 已跟踪文件跳过 add 直接提交
```

### 4. 提交信息规范（Conventional Commits）

推荐团队统一格式：

```text
<type>(<scope>): <subject>

type 可选：feat / fix / docs / style / refactor / perf / test / chore
```

示例：

```bash
git commit -m "feat(auth): 新增邮箱注册接口"
git commit -m "fix(ui): 修复移动端导航溢出"
```

## 分支管理

### 1. 查看与创建

```bash
git branch                  # 查看本地分支
git branch -a               # 查看所有分支（含远程）
git branch dev              # 创建 dev 分支但不切换
git switch -c feature/login # 创建并切换（推荐，比 checkout 语义清晰）
git switch main             # 切换到 main
```

### 2. 删除分支

```bash
git branch -d dev           # 安全删除（未合并会阻止）
git branch -D dev           # 强制删除
git push origin --delete dev # 删除远程分支
```

### 3. 合并

```bash
git merge feature/login     # 把 feature/login 合并到当前分支
git merge --no-ff feature/login  # 保留分支拓扑（推荐，可追溯）
git rebase main             # 把当前分支变基到 main 之上
```

### 4. 分支重命名

```bash
git branch -m old-name new-name          # 重命名当前分支
git push origin :old-name new-name       # 删旧远程 + 推新远程
git push origin -u new-name              # 重新建立跟踪
```

## 历史查看

```bash
git log                       # 完整历史
git log --oneline             # 每条一行
git log --oneline --graph --all  # 图形化全分支（常用）
git log -p file.txt           # 查看某文件的改动历史
git log --author="zhang"      # 按作者过滤
git log --since="2 weeks ago" # 按时间过滤
git blame file.txt            # 逐行查看最后修改者
git show <commit-id>          # 查看某次提交的详情
```

## 撤销与回退

撤销操作最容易踩坑，务必先理解三个区域：**工作区 / 暂存区 / 仓库**。

### 1. 撤销工作区改动

```bash
git restore file.txt          # 丢弃工作区改动（旧命令：git checkout -- file.txt）
git restore .                 # 丢弃所有工作区改动
```

### 2. 撤销暂存（unstage）

```bash
git restore --staged file.txt # 把文件移出暂存区（旧命令：git reset HEAD file.txt）
```

### 3. 修改最近一次提交

```bash
git commit --amend            # 修改提交信息或补文件
git commit --amend --no-edit  # 保持原信息，只补文件
```

> 注意：`--amend` 会改写提交哈希，**已推送的提交不要 amend**，否则团队历史会错乱。

### 4. 回退提交

```bash
git revert <commit-id>        # 生成一个反向提交，安全，适合公共分支
git reset --soft HEAD~1       # 撤销提交，改动留在暂存区
git reset --mixed HEAD~1      # 撤销提交，改动留在工作区（默认）
git reset --hard HEAD~1       # 撤销提交并丢弃改动（危险）
```

| 场景 | 推荐命令 |
|------|----------|
| 已推送到远程的提交想撤销 | `git revert` |
| 本地刚提交，想改信息/补文件 | `git commit --amend` |
| 本地提交错了，想重做 | `git reset --soft HEAD~1` |
| 本地提交错了，改动不要了 | `git reset --hard HEAD~1`（谨慎） |

## 远程协作

### 1. 查看与管理远程

```bash
git remote -v                       # 查看远程地址
git remote add origin git@...       # 添加远程
git remote set-url origin git@...   # 修改远程地址
```

### 2. 拉取与推送

```bash
git fetch origin                # 拉取远程更新但不合并
git pull                        # fetch + merge（或 rebase，取决于配置）
git pull --rebase               # 强制用 rebase 拉取
git push                        # 推送当前分支
git push -u origin feature/x    # 首次推送并建立跟踪
git push --force-with-lease     # 安全强推（推荐，比 -f 更安全）
```

> 永远不要对公共分支用 `git push -f`，用 `--force-with-lease` 代替。

## 暂存

临时切分支又不想提交半成品：

```bash
git stash                       # 暂存当前改动
git stash push -m "wip: 登录页" # 带说明暂存
git stash list                  # 查看暂存列表
git stash pop                   # 恢复最近一次暂存并删除
git stash apply stash@{1}       # 恢复指定暂存但不删除
git stash drop stash@{0}        # 删除指定暂存
```

## 标签

发布版本时打标签：

```bash
git tag v1.0.0                  # 轻量标签
git tag -a v1.0.0 -m "正式版"   # 附注标签（推荐）
git tag                         # 查看标签
git push origin v1.0.0          # 推送单个标签
git push origin --tags          # 推送所有标签
```

## 实用技巧

### 1. 二分查找定位 Bug

```bash
git bisect start
git bisect bad                  # 标记当前是坏的
git bisect good v1.0.0          # 标记 v1.0.0 是好的
# Git 自动切到中间提交，测试后：
git bisect good   # 或 git bisect bad
# 直到定位到引入 Bug 的提交
git bisect reset
```

### 2. 查找引入某行的提交

```bash
git log -L 42,42:src/auth.go    # 查看某文件第 42 行的变更历史
```

### 3. 清理未跟踪文件

```bash
git clean -n        # 预览要删的文件（dry run）
git clean -fd       # 删除未跟踪的文件和目录（谨慎）
```

### 4. 别名提速

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all"
# 之后 git lg 就能看到漂亮的历史图
```

### 5. 只 cherry-pick 某次提交

```bash
git cherry-pick <commit-id>     # 把别处的提交应用到当前分支
```

## 注意事项

- **公共分支不要 rebase / reset / amend**：会改写历史，污染团队仓库。公共分支只用 `git revert`。
- **`reset --hard` 是不可逆的**：执行前先 `git status` 确认，或先 `git stash` 留底。
- **强推用 `--force-with-lease`**：它会在远程被别人更新时拒绝推送，避免覆盖他人提交。
- **`.gitignore` 要早建**：node_modules、dist、.env、IDE 配置等一旦提交进仓库，后续清理很麻烦。
- **大文件不要进 Git**：二进制、视频、数据库用 Git LFS 或外部存储。
- **提交要小而原子**：一次提交只做一件事，方便 review 和回退，别把多个功能揉在一起。
- **pull 前先 commit 或 stash**：避免冲突时把未提交改动搞丢。

## 实战案例

### 案例 1：把半成品暂存后切分支修 Bug

正在写新功能，线上突发 Bug：

```bash
git stash push -m "wip: 用户中心"
git switch main
git switch -c hotfix/login-redirect
# 修复并提交
git commit -am "fix: 修复登录后跳转首页"
git push -u origin hotfix/login-redirect
# 修完回来继续
git switch feature/user-center
git stash pop
```

### 案例 2：撤销已推送的提交

已经 `git push` 到远程，发现提交有问题，想干净地撤销：

```bash
# 不要用 reset，团队会拉到错乱历史
git revert <commit-id>
git push
```

Git 会生成一个反向提交，历史保留，安全协作。

### 案例 3：合并冲突解决

`git merge feature/x` 报冲突：

```bash
git merge feature/x
# 冲突文件会标记 <<<<<<< ======= >>>>>>>
# 编辑器中解决冲突后：
git add <冲突文件>
git commit            # 完成合并
# 如果想放弃合并：
git merge --abort
```

### 案例 4：误删分支找回

```bash
git branch -D feature/old
# 后悔了，用 reflog 找回
git reflog                 # 找到该分支最后一次提交的哈希
git switch -c feature/old <commit-id>
```

`git reflog` 记录了本地所有 HEAD 变化，是误操作的救命稻草。

## 相关条目

- [GitHub Copilot 使用指南](../github-copilot)
- [Cursor 使用指南](../cursor)
- [Claude Code 使用指南](../claude-code)
