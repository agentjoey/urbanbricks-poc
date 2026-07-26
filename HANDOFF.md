# urbanbricks POC — Handoff 文档

_最后更新：2026-07-27_

写给接手继续开发的下一个 agent（或人）。按风险从高到低排列，不是功能清单——功能清单看 `PROJECT-STATUS.md`。

---

## 1. 冷启动顺序

```
PROJECT-STATUS.md            ← 单一权威状态入口，先看这个，不要东拼西凑
CLAUDE.md / AGENTS.md        ← pact seat 身份、Next.js 16 版本差异警告
docs/verification-record.md  ← T3 豁免清单 + 编排事故记录（教训不要重犯）
```

**不要跳过 `AGENTS.md` 第一行的警告**：这个 Next.js 版本 API 和训练数据不一致（例如 `middleware.ts` 已改名 `proxy.ts`），动手前必须读 `node_modules/next/dist/docs/`。

---

## 2. pact 协议的两条硬规则

- **worker 不能自己批准自己的工作**——如果新 agent 是 worker 身份，完成任务后不能自己跑 `accept`，必须等 reviewer seat。
- **reviewer 的 verdict 必须在主树跑**，不能在 worktree 里跑 `pactify accept/changes`——本项目已经因为这个坑丢过 8+ 次 reviewer 判定，靠手工从 worktree 账本 graft 回主账本才救回来。如果要并发开发，先看 `docs/verification-record.md` 里「已验证的 worktree 并发流程」那段，照着抄，不要自己发明。

---

## 3. 内容红线——这是本项目最容易被破坏的地方

- 任何事实性数值（尺寸/价格/交付周期/质保条款）不能裸写，必须过 `unverified()` 包裹，否则 `tsc` 直接编译失败（这是故意设计，不是 bug）。
- `pnpm verify:content` 非零退出（当前 45 项）是**预期状态**，不是要修的错误——第一次看到容易误判为构建坏了。
- **绝不能编造**客户证言、案例、认证徽章、「已交付 N 套」这类数字——`PRODUCT.md` 明令禁止，不是「先占位后面填」，是完全不能生成。
- `deliveryStatement()` 的公开 API 不存在裸数字「30」——如果新代码想拼出「30 天入住」这种表述，类型系统会挡住，这是有意为之，不要绕过去。

---

## 4. 技术陷阱（已交过学费，不要重踩）

| 陷阱 | 后果 | 规避 |
|---|---|---|
| Tailwind 4 声明 `--spacing-sm` 会静默改写 `max-w-sm` | 丢过一次移动导航面板（压缩到 16px） | spacing key 用语义命名（`inline`/`stack`/`group`），不要用 `xs`/`sm`/`md` |
| 字体广告 `tnum` 不等于真能用 | Golos Text 骗过了「是否声明」检查，字形前进宽度实际不等 | 换字体先验证到二进制字形级 |
| 静态预渲染会把运行时值烤死 | 表单计时陷阱曾经从未真正触发过 | 需要运行时新鲜值的逻辑走 `proxy.ts`，不要指望预渲染页面的字段 |
| worktree 软链 `node_modules` | 主仓库 `node_modules` 变自引用符号链接，ELOOP | 每个 worktree 独立 `pnpm install` |
| `NEXT_PUBLIC_*` 只在构建时内联 | 改 Vercel 环境变量后若走 redeploy（非全新构建）不生效 | 必须触发全新 production 构建，不能只改变量 |

---

## 5. 图片系统——组件级强制，不要绕开

`RenderImage`/`ContextPhoto` 的「Visualisation」标签是闭集白名单机制（不是黑名单），新加的 CSS class 如果不在 `verify-image-label.mjs` 白名单里会导致构建失败——这是故意的，标签被移除过三次都是靠「看起来能用但其实在隐藏标签」的手法。**不要因为构建报错就把 class 加进白名单**，先确认不是在移除标签。

---

## 6. 当前谁欠什么

- 45 个 `unverified()` 值是 **Human Owner** 的工作量，不是 agent 能自己填的（需要工程图纸/运营决策）。
- E5（跨浏览器验证，目前 Chrome-only）是**真实未完成项**，不是豁免——首个页面承载真实流量前必须补 Firefox / Safari。
- Baseline → Target 判据缺失是记录在案的已知风险，首批真实数据后必须补齐，不要自己拍脑袋定数字。

---

## 7. 一句话总结

这个项目的复杂度不在代码，在**约束的强制机制**——真实性红线靠类型系统强制、图片标签靠白名单强制、多 agent 独立性靠协议强制。新 agent 最大的风险不是写错代码，是为了「让某个检查通过」而绕开某个强制机制，而没意识到那个机制是在防一个已经发生过的真实事故。

---

## 相关文档

| 文档 | 内容 |
|---|---|
| `PROJECT-STATUS.md` | 部署/门禁/任务的实时状态 |
| `PRODUCT.md` | 定位、信念阶梯、真实性红线 |
| `DESIGN.md` | 设计系统（token、字体、组件、Do/Don't） |
| `docs/verification-record.md` | T3 验证记录、豁免清单、编排事故 |
| `docs/superpowers/specs/2026-07-21-*.md` | 完整 T3 spec |
