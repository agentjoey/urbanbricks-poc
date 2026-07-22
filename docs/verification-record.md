# Verification Record — urbanbricks POC

按 `~/AgentWorks/FRONTEND-DESIGN-WORKFLOW.md` v3.1 §8 建立。T3 要求完整 Brief + Verification Record，本文件承载后者：独立复核与验证结论、Human Owner 走查确认、回滚方式、豁免清单。

| 属性 | 值 |
|---|---|
| Brief / spec | `docs/superpowers/specs/2026-07-21-urbanbricks-website-design.md` |
| 任务分解 | `.pact/tasks/_DECOMPOSITION.md` |
| Tier | T3 |
| 分支 | `feat/poc` |
| 状态机 | pactify（`PACT_AGENT_ID=lead pactify status`）|

---

## 豁免清单

豁免只能由 Human Owner 明示批准。Agent 不得自行豁免、不得把失败检查标记为通过。

| # | 条款 | 豁免内容 | 理由 | 批准 | 复议触发条件 |
|---|---|---|---|---|---|
| E1 | §8 可访问性门禁 | 按 WCAG 2.2 AA 建设，但不设独立 a11y 审计作为发布阻塞 | POC 阶段流量低；AA 在本项目近乎零额外成本（组件走 shadcn/Radix，唯一实际约束是对比度，而对比度本来就有自动门禁） | Human Owner 2026-07-21 | 站点承载真实流量规模前 |
| E2 | §2 Review 与 Verification 角色分离 | T3「SHOULD 使用不同 agent」不执行；由同一独立 agent（seat `review`，Claude Opus 4.8）顺序承担二者 | 采用 T2 的合并模式。worker↔reviewer 仍为跨厂商异构（Kimi K3 / Opus 4.8），最关键的一对独立性保留；`x3-verify` 作为最终独立验证兜底 | Human Owner 2026-07-22 | 若 `x3-verify` 发现本可在任务级捕获的缺陷 |
| E3 | §2 reviewer 与 orchestrator 异构 | reviewer 与 orchestrator 同为 Claude Opus 4.8 | Human Owner 取其审查能力。**残余盲区**：orchestrator 撰写了 PRODUCT.md / DESIGN.md / spec，reviewer 擅长发现「实现不符合 spec」，不擅长发现「spec 本身错了」。设计方向层已由异构模型（Kimi K3）独立复核闭环 | Human Owner 2026-07-22 | spec 发生重大变更时，异构复核须重做，不可由 reviewer 代替 |
| E4 | §3 Tier 一致性 | `f1-tokens` 按 T3 流程执行并完结，但严格对照 §3 触发器它不命中任何一条（无新路由、无认证、无敏感数据） | 全项目标为 T3，任务继承。实际执行强度高于其自身应得等级，无风险 | 记录性，无需批准 | — |
| E5 | 跨浏览器验证 | 全部测量为 Chrome-only | 涉及特性（百分比网格外边距、`repeat()` 中的 `var()`、`:focus-visible`）均为规范定义且互操作性良好 | 待办，非豁免 | **首个页面上线前必须补 Firefox / Safari** |

**审查强度分级**（Human Owner 2026-07-22）：
- **严格档**（完整 worker → 复核 → 返工循环）：`f2-content`、`f3-db`、`c1-form`、`a1-admin`
- **宽松档**（单轮复核 + orchestrator 抽查）：其余组件与页面任务
- **宽松档不适用于**：可访问性缺陷、表单交互缺陷、DESIGN.md 红线违规 —— 这三类无论在哪个任务发现都立即修复，不推迟到 `x3-verify`

---

## 任务验证记录

### `f1-tokens` — accepted 2026-07-22

**轮次**：3 轮，每轮均发现真实缺陷。

| 轮 | 发现 | 发现者 |
|---|---|---|
| 1 | Golos Text `tnum` 上游源文件损坏（`.tf` 字形五种宽度而非一种） | worker，orchestrator 独立复核确认 |
| 2 | 字体回退声明为死代码 —— `sans-serif` 排在覆盖字体之前，层叠不可达，Gate 2 实际失败 | reviewer，推翻 worker 的「通过」结论 |
| 2 | 规范漏洞：DESIGN.md 缺深色表面 line/stroke token | reviewer |
| 2 | `verify-contrast.mjs` 硬编码调色板，不读 CSS，属自我印证 | reviewer |
| 3 | 深色区块行高提升到不了 `.text-body`（`@theme inline` 把 `1.6` 编译成字面值） | reviewer，orchestrator 独立编译复核确认 |

**自动化检查**：`pnpm verify:contrast`（15 组配对，退出 0）· `pnpm build` · `pnpm lint` —— 三方各自独立运行。

**浏览器实测**（§8 铁律 3）：`.pact/tasks/f1-tokens-evidence/font-gates.png`，来自修复后的最终 build。视觉确认 tabular 数字等宽、比例数字不等宽、深浅两种表面焦点环可见、模块网格跨列正确。

> **该截图为测试探针页，非设计稿。** 它证明机制成立，不证明品牌视觉成立。真正的视觉审查在首个真实页面出现后进行。

**Human Owner 走查**：截图已提交给 Human Owner 查看（2026-07-22）。

**遗留项**（reviewer 判定为非阻塞，携带至下游）：
1. 无层级的作用域覆盖同时压制了 `leading-*` 工具类 —— 与 DESIGN.md §2 将 1.65 定为强制一致，但逃生舱已消失且注释未说明
2. `.ink-surface { line-height }` 影响所有继承元素，不限于正文尺寸文本
3. **给 `c1-form`**：`*:focus-visible` 位于 `@layer base`，特指度 0,1,0；任何带 `focus-visible:ring-*` 的 shadcn 组件都会盖过它 —— 表单任务必须重新测量
4. 跨浏览器未验（见 E5）

### `f3-db` — accepted 2026-07-22

**1 轮通过。** Reviewer 未止步于 `pnpm verify:db`（那只证明脚本路径可用），而是自建临时路由、跑真实生产构建 + `next start`，通过 HTTP 以**无 JS 渐进增强路径**（multipart + `$ACTION_ID`）驱动 Server Action —— 确认 `neon-http` + Drizzle 在 Next 16 生产服务器中、以 `c1-form` 将要使用的完全相同形态工作。

**Orchestrator 直连 Neon 独立核验**：16 列与 spec 完全一致 · 无 IP / 无 user-agent · `timeline` 枚举冷→热排序（排序即意愿强度）· `budget_band` 升序 · 三个枚举均可空（"未回答"可表示，表单不会被逼进死角）· 测试数据 0 行残留。

**密钥**：提交与源文件均 0 命中；`.env.local` 确认被忽略；`.env.example` 仅占位符。

**移交 `c1-form` 的建议**（非 f3 缺陷，但 c1 必须处理）：
1. `src/db/index.ts` 靠**注释**阻止客户端引入 —— 应加 `import "server-only"` 使其成为构建错误。无凭证泄露风险（`DATABASE_URL` 非 `NEXT_PUBLIC_`），但失败模式很差。`Lead`/`NewLead` 用 `import type`
2. `verify:db` 的探针行内联删除 —— insert 与 delete 之间抛错会残留一行，应用 `try/finally`
3. 否定测试断言的是错误文本而非 SQLSTATE `23502`，跨版本脆弱
4. `budget_band` 标签不带货币，而站点货币仍为 `unverified()` —— 已文档化为后续项，0 行时改动成本低
5. `@next/env` 在 `dependencies` 中，但只有 `drizzle.config.ts` 与 `scripts/verify-db.ts` 使用

**踩坑记录（移交 `c1-form`）**：App Router 将**下划线开头的文件夹视为私有目录，整个路由不渲染**。Reviewer 为此损失一个构建周期。

### `f2-content` — awaiting_review（第 2 轮）

Orchestrator 独立验证的类型强制（三探针，均按要求编译失败）：

| 探针 | 结果 |
|---|---|
| 裸数字 → `Unverified<number>` | `TS2322` |
| `FACTORY_BUILD_TIME.days` | `TS2339: Property 'days' does not exist` |
| 不经构造函数伪造 `Unverified` | `TS2739`（模块私有 symbol） |

正规路径（`unverified()`、`deliveryStatement()`）正常编译。

关键设计：交付天数藏于模块私有 symbol 之后，**裸数字路径不存在**而非仅被劝阻。

---

## 编排事故记录

留档是因为这些坑会重复出现，且每次都以"看起来像别的问题"的形式出现。

| # | 事故 | 真实原因 | 教训 |
|---|---|---|---|
| O1 | reviewer 日志 0 字节，判定进程被杀，重新派单 | 进程**一直在正常运行**，stdout 缓冲导致日志当时为空。结果多跑了一整轮 Opus 复核 | **不能从"日志为空"推断"进程已死"**。先 `ps` 确认存活，再看 CPU 与文件写入 |
| O2 | `&` 挂后台的 reviewer 未产出 | 父 shell 未 `wait` 直接退出 | 后台派单必须以 `wait` 收尾 |
| O3 | Kimi 额度耗尽，两个任务在收尾阶段被切断 | 计费周期用量上限 | 源码已提交故未丢失。**长任务应尽早提交**，不要攒到最后 |
| O4 | 换 opencode + MiniMax-M3 接手，两进程挂死 | bootstrap 完成后无任何模型响应，CPU 0%、会话存储 2 小时零写入。短提示词可用，2–3KB 长提示词卡住 | 换 harness 前应先用**等量长度**的提示词试探，短探针通过不代表可用 |
| O5 | 残留 `next-server` 进程运行 1.5+ 小时占用端口 | 探针路由测试后未清理 | 曾导致一次测量误连过期服务器（worker 主动上报）。**每轮结束清理探针进程与路由** |

**探针路由的系统性问题**：多个任务都需要临时路由做验证，而它们会进入生产构建的路由表。当前约定是"提交前删除"，依赖 worker 自觉。若后续再次遗留，应改为构建期检查强制拦截。

## 回滚

| 层 | 方式 |
|---|---|
| 前端部署 | Vercel Instant Rollback 回退至前一部署 |
| 数据库 | 线索表为纯写入，无破坏性迁移；回滚不影响已收集线索 |
| 任务级 | 每任务独立 commit 于 `feat/poc`；`pactify changes` 可将任一任务退回 `changes_requested` |
| 特性级 | `feat/poc` 未合入 `main`；整个 POC 可整体废弃而不影响主干 |

**回滚触发条件**：上线后冒烟失败、线索写入失败率异常、或发现内容真实性缺陷（编造的事实性声明进入生产）。

---

## 未完成的 T3 要求

诚实记录，非豁免：

- `impeccable detect` 反模式静态扫描 —— 尚未运行，应在首个页面任务后接入
- `impeccable critique` / `audit` —— 需要真实 UI surface，目前项目无任何真实页面，待页面任务完成后执行
- 结果目标（Baseline → Target 与测量窗口）—— Human Owner 暂缓，首批真实流量数据后补齐
