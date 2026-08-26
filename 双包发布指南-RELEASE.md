# 一份代码 → 同时发两个 npm 包 + GitHub Release

这套机制的核心：**同一个仓库、同一份代码，打一次 tag，自动发出 2 个 npm 包 + 1 个 GitHub Release**。

这条命令触发（看你 \`.github/workflows/release.yml\`）：
\`\`\`bash
git tag v0.1.5 && git push origin v0.1.5
\`\`\`

---

## 发布时自动做的 3 件事（顺序）

1. **发裸名包** \`dsh-provider-info\`
   - 用仓库里 \`package.json\` 的 \`name\`（仓库里就是裸名）直接发。
2. **发 scoped 包** \`@cowwo/dsh-provider-info\`
   - 发之前先临时把名字改成 scoped：\`npm pkg set name=@cowwo/dsh-provider-info\`，再发。
   - \`npm pkg set\` 只在发布那一步临时改，**不会写进仓库**（仓库里 \`package.json\` 永远保持裸名）。
3. **建 GitHub Release**
   - \`gh release create v0.1.5 --title v0.1.5 --notes-file release-notes.md\`
   - 名称 = tag 名，页面上写好了安装命令。

---

## 核心规则（为什么这样能同时发两个）

### 1. 两个包是"同一个内容、两个名字"，版本号必须一致
- 裸名 0.1.5 和 scoped 0.1.5 内容相同、版本相同。
- 所以**升版本时只改一次**（package.json + package-lock 顶部），两个包自动用同一个新版本。

### 2. 为什么能发两个不同名字
- 仓库里 \`package.json\` 的 name 是一个（裸名），所以第 1 步能发裸名。
- 第 2 步用 \`npm pkg set name=...\` 临时覆盖成 scoped，就能发另一个名字。
- 发布进程是"从头到尾一次跑"的，中间改一下 name 不影响仓库文件。

### 3. token 要能发这两个包
- \`NPM_TOKEN\` 属于 \`cowwo\` 账号，能发 \`@cowwo/*\`。
- 裸名 \`dsh-provider-info\` 是第一个发布的（你是 owner），也能发。
- 所以一把钥匙两个包都能发。

---

## ⚠️ 注意事项（踩过的坑）

### 版本号
- **同一个版本的两个包名，发过一次就不能重发**。
- 想再发，必须升版本：0.1.5 → 0.1.6，两个包同升。
- 否则第 2 次发布会因"版本已存在"失败。

### GitHub Release 名字
- **别多写一个 v**。
- tag 名 \`v0.1.5\` 本身就带 v，所以 release 名直接写 \`v0.1.5\` 就行。
- 我踩过：写成 \`vv0.1.5\`（两个 v），要改成 \`v0.1.5\`。

### 权限
- 建 GitHub Release 需要 **\`contents: write\`** 权限（不是 read）。
- 发 npm 包用 \`NODE_AUTH_TOKEN\`（= secret 里的 \`NPM_TOKEN\`）。
- 建 release 用 \`GH_TOKEN\`（= GitHub 自动给的 \`secrets.GITHUB_TOKEN\`）。

### 包名对应关系
- 主包：\`dsh-provider-info\`（短名，别人好装）
- scoped：\`@cowwo/dsh-provider-info\`（带 @）
- 别人用短名装：\`dsh plugin --profile web add dsh-provider-info\`

### 插件内部代号
- client id / typert / patch 的包名统一用裸名 \`dsh-provider-info\`（主包角度），别乱改。

---

## 触发后的验证清单
\`\`\`bash
npm view dsh-provider-info version        # 期待 0.1.5
npm view @cowwo/dsh-provider-info version # 期待 0.1.5
gh release view v0.1.5 -R cowwo/dsh-provider-info  # 名字= v0.1.5
\`\`\`
