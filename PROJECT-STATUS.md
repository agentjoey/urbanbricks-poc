# urbanbricks POC — 项目状态

_最后更新：2026-07-24_

一句话：**完整的集装箱住宅公司官网已构建、通过全部独立复核、部署在真实域名 `urbanbricks.uk` 上，处于 noindex 保护的「预上线」状态**。剩下的全部是需要 Human Owner 真实数据的核实项，不是工程工作。

---

## 部署

| 项 | 状态 |
|---|---|
| 线上地址 | **https://urbanbricks.uk**（Vercel，SSL 有效，DNS 经 Cloudflare 解析）|
| 备用地址 | https://urbanbricks-poc.vercel.app |
| 收录状态 | **noindex（刻意）** — `SITE_INDEXABLE` 环境变量默认关，robots.txt `Disallow: /` + meta `noindex,nofollow`。占位数据核实完再开放 |
| 回滚 | Vercel Instant Rollback；线索表纯写入无破坏性迁移 |

---

## 交付内容

**8 个页面**：首页（双客群自识别）· 户型库（筛选）· 7 个户型详情（SSG，内嵌报价表单）· 流程页（并行时间线）· 关于 · 联系 · 隐私 · 口令保护的线索后台。

**关键机制**：
- 报价表单 → Neon Postgres，含签名 cookie 计时陷阱 + 蜜罐 + 限流 + 丢线索兜底，**无 JS 可用**
- GA4 + **PECR 同意闸门**（默认零加载）
- 完整 SEO（sitemap / robots / JSON-LD / canonical）
- `/admin` 认证边界 + CSV 导出（公式注入已中和）
- 设计系统「brass + daylight」，从集装箱模数推导的模块网格，WCAG 2.2 AA 零违规
- **20 张 AI 渲染图**（15 户型 + 5 工艺/关于），全站零占位框

---

## 质量门禁（全绿）

```
tsc · lint · verify:contrast · verify:image-label · verify:image-ratios  ✅
verify:content  → 45 unverified 值（故意保留，见下）
```

`verify:content` 非零退出是**设计如此** — 它是上线前核实清单，故意挡着直到占位事实清空。

---

## 编排

18 个 pact 任务，**全部 accepted**，每个走完整 worker → 独立复核 → 返工 循环。

| seat | 角色 | harness |
|---|---|---|
| lead | orchestrator | Claude Opus 4.8 |
| build | worker | Kimi K2.7 |
| build2 | worker | Claude Opus 4.8 |
| review | reviewer | Claude Opus 4.8 |

跨厂商异构（Moonshot / Anthropic），worker 不得自审由状态机强制。峰值 8 个页面并行，各自独立 worktree。

**独立复核抓到的、单看代码发现不了的关键缺陷**（完整记录见 `docs/verification-record.md`）：字体回退死代码 · 深色区块行高不可达 · spacing/宽度 token 命名冲突 · **CSV 公式注入** · 计时陷阱在静态页永不触发 · **三次 cookie 披露缺口**（末次由端到端 x3 抓到）。

---

## ⚠️ 上线前必办（只有 Human Owner 能做）

按优先级：

```
□ 45 个 unverified() 事实值核实（pnpm verify:content 列清单并把关）
   ├ 产品事实 ~38：7 户型的模块数/面积/卧浴/材料/价格 ← 需工程图纸
   └ 运营事实 ~7：电话、销售邮箱、售后响应、安装时长
     （质保期 10/5/2 年已确认；货币 USD、单位 sq ft 已确定）
□ verify:content 干净后 → Vercel 设 SITE_INDEXABLE=true → 重新部署 → 开放收录
□ 三个密钥填进 Vercel 环境变量（已配 production/preview，确认值正确）：
   DATABASE_URL · QUOTE_COOKIE_SECRET · ADMIN_PASSWORD
□ 真 GA4 measurement ID → NEXT_PUBLIC_GA_ID（现为占位 G-PLACEHOLDER0）
□ /privacy 的 [保留期限] 占位符填真实法律值
```

**非阻塞、可选**：
```
□ delivery-crane 图背景有个锈箱子，可用更干净场地重生（ASSET-LICENSES.md 已标 ⚠️）
□ 工厂过程实拍替换渲染占位（你确认会拍给客户的那些）
```

---

## 已记录的战略张力（首批流量后重估）

- **域名 vs 市场**：`.uk` 域名被 Google 绑到英国，但定价 USD + 单位 sq ft + 目标全球/北美 —— ccTLD 对北美 SEO 不利。取舍已接受，非英国数据偏弱时可重开（记于 spec §5、`site.ts`）。
- **结果目标缺失**：POC「验证成功」的 Baseline→Target 判据 Human Owner 暂缓，首批数据后补（记于 spec §1）。

---

## 关键文档索引

| 文档 | 内容 |
|---|---|
| `PRODUCT.md` | 定位、信念阶梯、设计原则、真实性红线 |
| `DESIGN.md` | 设计系统（token、字体、组件、Do/Don't）|
| `docs/superpowers/specs/2026-07-21-*.md` | 完整 T3 spec |
| `docs/verification-record.md` | T3 验证记录、豁免清单、编排事故 |
| `.pact/AGENT-BRIEF.md` | worker/reviewer 统一约束 |
| `.pact/tasks/_DECOMPOSITION.md` | 18 任务分解 |
| `ASSET-LICENSES.md` | 20 张图的来源/许可登记 |
| `docs/image-generation-worklist*.md` | 生图提示词清单 |
