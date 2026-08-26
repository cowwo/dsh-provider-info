# 发布指南（上手版）

这份文档记录 dsh-provider-info 从本地改代码到发布到 GitHub / npm 的完整流程，
用大白话写，方便你以后照做。

---

## 一、你日常改代码的流程

1. 改插件源码（在本地开发文件夹 \`/root/test/12000006_输入框显示提供商/dsh-provider-info\`）
2. 本地验证：重启 \`dsh web\` + 刷新页面
   - ⚠️ 前提：DSH 读的是你的本地源码，不是 node_modules 里的旧拷贝。
     如果 DSH 加载的是旧代码，先确认 node_modules/dsh-provider-info 是一个指向你本地源码的 **快捷链接**（symlink）：
     \`\`\`bash
     cd /root/.dsh/profiles/web/node_modules
     rm -rf dsh-provider-info
     ln -s /root/test/12000006_输入框显示提供商/dsh-provider-info dsh-provider-info
     \`\`\`
3. 验证 OK 后，才提交到 GitHub

---

## 二、提交到 GitHub

\`\`\`bash
cd /root/test/12000006_输入框显示提供商/dsh-provider-info
git add -A
git commit -m "改动说明"
git push origin main
\`\`\`
提交信息建议写清楚做了什么（大白话即可）。

---

## 三、发布到 npm（每次发布必做）

发布是**自动的**，你只要打一个 tag 就行。步骤如下：

### 1. 升版本号
在 \`package.json\` 和 \`package-lock.json\` 顶部，把版本号 +0.0.1（如 0.1.4 → 0.1.5）。

\`\`\`bash
git add -A
git commit -m "chore: 版本号升到 0.1.5"
git push origin main
\`\`\`

### 2. 打 tag 并推送（这一步触发自动发布）
\`\`\`bash
git tag v0.1.5
git push origin v0.1.5
\`\`\`

### 3. 等 GitHub Actions 自动跑完（约 20-30 秒），它会自动做 3 件事：
- 发裸名包 \`dsh-provider-info\` 到 npm
- 发 scoped 包 \`@cowwo/dsh-provider-info\` 到 npm
- 在 GitHub 建一个 Release 版本页（含一键安装命令）

### 4. 验证发布成功
\`\`\`bash
npm view dsh-provider-info version
npm view @cowwo/dsh-provider-info version
gh release view v0.1.5 -R cowwo/dsh-provider-info
\`\`\`

---

## 四、注意事项（踩过的坑）

### 版本号
- **已发布的版本不能重发**。想再发，必须把版本号往上 +0.0.1。
- **tag 名要跟版本号对应**：版本 0.1.5 → tag \`v0.1.5\`。
- 改 \`package-lock.json\` 版本号时，**只改最前面两处**（根包的），别误改依赖包的版本。

### 包名
- 主包：\`dsh-provider-info\`（短名，别人好装）
- scoped 包：\`@cowwo/dsh-provider-info\`（带 @）
- 两个都是一次发布自动出的。别人装用短名：
  \`dsh plugin --profile web add dsh-provider-info\`

### token（发布用的钥匙）
- 存在 GitHub 的 secret 里，名字 \`NPM_TOKEN\`。
- **有效期 7 天**，到期要换新的（重新生成 npm token → 更新 GitHub secret）。
- 别把 token 发到聊天/公开地方。

### GitHub Release
- 每次打 tag 会自动建 release，名字 = tag 名 \`v0.1.5\`。
- release 里写好了安装命令，别人照抄就能装。

### 插件内部代号
- client id / typert / patch 的包名统一是 \`dsh-provider-info\`（裸名），别改成别的。

---

## 五、最关键的三个动作回顾

1. **改代码** → 重启 dsh web 本地验证
2. **提交** → \`git commit + push\`
3. **发布** → 升版本 → \`git tag vX.Y.Z && git push origin vX.Y.Z\` → 等自动跑完

> 第三次发布之后，你几乎不用碰 npm 网页，全自动。
