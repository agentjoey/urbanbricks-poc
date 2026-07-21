# urbanbricks 官网 POC — 设计规格

| 属性 | 值 |
|---|---|
| 日期 | 2026-07-21 |
| 状态 | 待 Human Owner 审阅 |
| Tier | **T3**（全新路由 · 认证边界 · 个人敏感数据 · 核心转化路径）|
| 适用流程 | `~/AgentWorks/FRONTEND-DESIGN-WORKFLOW.md` v3.1 |
| 仓库 | https://github.com/agentjoey/urbanbricks-poc （**public**）|

---

## 1. 问题与结果

urbanbricks 是一家集装箱住宅（container home）制造商，面向海外英文市场。目前没有官网、没有品牌资产、没有线上获客渠道。

**这个 POC 要回答的问题**：这个市场对 urbanbricks 的产品有没有真实需求？

**因此网站的唯一核心目标是获取销售线索**，并通过埋点数据让"有没有需求"这个问题可被观测。网站不是展示品，是一次市场实验的测量仪器。

**产品三个卖点**：快速交付、高性价比、售后保障。

### 结果目标（Baseline → Target）

**当前未定。** Human Owner 决定暂不设定数值判据，改为上线后持续观测自然流量与线索转化。

> ⚠️ **风险记录**：v3.1 §8 要求 T3 Brief 包含 Baseline→Target 与测量窗口。当前缺失意味着 POC 跑完后缺少客观的"继续 / 收手"判据，结论将依赖主观判断。本项在首批真实流量数据产生后必须补齐，届时 Brief 转 `Reopened` 重新批准。

---

## 2. 范围

### 交付内容

**公开页面（7）**

| 路由 | 职责 | 转化链路角色 |
|---|---|---|
| `/` | 首页 | 三卖点各占一屏、精选户型、流程概览、FAQ 摘要 |
| `/models` | 户型库 | 按尺寸（20ft / 40ft / 多箱体）与用途（residential / commercial）筛选 |
| `/models/[slug]` | 户型详情 | 图集、规格、价格区间、交付周期、**内嵌报价表单** |
| `/how-it-works` | 流程与质保 | 承载「快速交付」「售后保障」两个卖点的实证页 |
| `/about` | 关于与工艺 | 信任建设 |
| `/contact` | 联系与报价 | 主转化页 |
| `/privacy` | 隐私政策 | GA 埋点与面向欧美市场的合规前提，非可选 |

**受保护页面（1）**：`/admin/leads` — 线索列表 + CSV 导出，口令 + httpOnly cookie。

**预留不实现**：`/guides/[slug]` 路由与 MDX 管线搭好，POC 阶段不写文章。

### 明确排除（YAGNI）

- 博客 / 资讯内容创作 — 管线预留，内容后补
- 在线配置器与实时报价 — 目标是线索获取而非在线选配
- 多语言 — 纯英文站
- CMS — 内容进代码；验证成立、需交付运营团队时再迁
- 深浅色主题切换 — 营销站需要一个笃定的视觉主张
- 邮件通知 — Human Owner 选择只写数据库

---

## 3. 内容真实性红线

网站将跑真实流量、面向真实客户收集线索，内容不得随意编造。分三档处理：

| 档位 | 内容 | 处理方式 |
|---|---|---|
| **可写** | 品牌调性文案、价值主张、流程说明、FAQ 问题结构 | 表达方式，非事实声明，直接写 |
| **须标占位** | 交付周期、尺寸参数、价格区间、材料规格 | 用 `unverified()` 包裹，上线前逐条核实 |
| **不生成** | 客户评价、项目案例、认证徽章、"已交付 N 套"类数字 | 做成结构化空槽位，等真实素材 |

**为什么第三档是硬红线**：这些一旦上线即构成虚假宣传，而它们恰恰是竞品建立信任的核心手段。POC 版的信任建设改由工艺细节、流程透明度、质保条款的具体表述承担 —— 这也是设计阶段的重点任务。

### `unverified()` 机制

未核实的事实性数值必须显式包裹才能通过类型检查：

```ts
priceBandUsd: unverified({ from: 45000, to: 65000 }),
leadTimeWeeks: unverified({ from: 8, to: 14 }),
name: 'The Harbor 40',   // 品牌命名，非事实声明，无需包裹
```

- 字段类型声明为 `Unverified<T>`，**漏标即编译失败**
- `pnpm verify:content` 扫描全部未核实值，输出带文件路径的清单 —— 上线前核实清单自动生成，无需人工维护
- 开发环境在这些值旁渲染角标，审页面截图时一眼可辨

### 图片素材

- **主干**：Unsplash / Pexels 等免费商用图库（CC0 或等价许可）
- **补充**：允许抓取参考图作占位，必须标记，上线前替换
- **`ASSET-LICENSES.md`**：逐张记录来源、许可、是否需替换。替换责任归 Human Owner。

---

## 4. 技术架构

**路线 A：内容进代码 + 极薄后端。**

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16 App Router + TypeScript |
| 样式 | Tailwind CSS |
| 组件 | shadcn/ui（`-b radix -p nova`）|
| 数据库 | Neon Postgres + Drizzle ORM |
| 包管理 | **pnpm**（shadcn runner 用 `pnpm dlx shadcn@latest`）|
| 部署 | Vercel |
| 渲染 | 全站 SSG 静态预渲染 |

**为何不用 CMS**：POC 阶段内容由 agent 撰写、Human Owner 审阅，CMS 解决的「非技术同事自主改文案」问题此刻不存在。内容进代码可 diff、可回滚、协作直接。验证成立后再迁，届时数据结构已理清，迁移更省事。

### 内容层

四个 TypeScript 文件：`content/site.ts`（公司信息、联系方式、卖点文案）、`content/models.ts`（户型库）、`content/process.ts`（流程与质保）、`content/faq.ts`。

### 数据层

```
leads
  id            uuid pk
  created_at    timestamptz
  name, email               必填
  phone, country            选填
  model_slug                来源户型（详情页提交时自动带上）
  project_type              residential / commercial
  timeline                  意愿强度核心指标
  budget_band               预算区间
  message                   自由文本
  source_path               提交页面
  utm_source / utm_medium / utm_campaign   投放归因
  consent_at                同意隐私政策的时间戳
```

**不存 IP、不存 user-agent** — 面向欧美市场，属个人数据，POC 阶段收了无用且徒增合规负担。

`timeline` 与 `budget_band` 是设计重点：它们区分「随便看看」与「真要买」，直接服务于「验证客户意愿」这一目标。

### 表单

- 单一 `<QuoteForm>` 组件，复用于 `/contact` 与 `/models/[slug]`
- **内嵌到户型详情页**是关键决定：访客在看具体户型时意愿最强，跳转到独立页面会漏掉一批人；同时线索自带「对哪个户型感兴趣」，对市场验证而言这条数据比线索本身更有价值
- 提交走 Server Action，zod schema 客户端与服务端共用
- 必须包含隐私政策同意勾选项（必填）

**防护**：蜜罐字段 + 提交耗时检测（< 3 秒判定为机器人）+ 服务端按 IP 内存限流。仓库为 public，表单地址会被爬取。真实上量后升级 Vercel BotID。

**失败模式处理**：Human Owner 选择只写数据库、不发邮件，因此 Neon 写入失败会导致线索静默丢失。Server Action 必须：
1. 写库失败时将完整表单内容以结构化 JSON 打入 Vercel 运行时日志
2. 向用户返回明确错误 + 备用联系邮箱

丢线索是本项目最昂贵的缺陷 —— 等同于流量预算白费。

### 后台

`/admin/leads`：`ADMIN_PASSWORD` 环境变量校验（常量时间比较）→ httpOnly + Secure cookie → 中间件拦截 `/admin/*`，未认证跳登录页。页面为时间倒序表格 + CSV 导出（销售需要可操作的数据交付物）。

**不采用 Vercel Deployment Protection** —— 它保护整个部署包括官网本身，会使 GA 拿不到任何流量。

### 安全

仓库为 **public**。Neon 连接串、`ADMIN_PASSWORD`、GA measurement ID 一律只走 Vercel 环境变量，`.env` 已在 `.gitignore` 中屏蔽。证据与截图不得包含真实凭证。

---

## 5. 埋点与 SEO

### GA4 事件

仅有 pageview 无法区分「没人来」「来了不感兴趣」「感兴趣但表单劝退」三种情况。因此埋点为意愿信号：

| 事件 | 触发 | 用途 |
|---|---|---|
| `view_model` | 户型详情页浏览（带 slug） | 哪些产品有吸引力 |
| `quote_form_start` | 表单首次聚焦输入框 | 意愿转化的中间节点 |
| `generate_lead` | 提交成功（GA4 标准转化事件） | 最终转化 |

三者构成「户型浏览 → 表单开始 → 提交」漏斗。

### SEO

**取舍原则：地基现在做全，内容后补。** URL 结构、渲染方式、结构化数据一旦错误，后期修改会丢失已积累的索引与外链；内容深度可无损追加。

**地基（全做）**

- 全站 SSG — 爬虫获得完整 HTML，不依赖 JS 执行
- Next.js Metadata API：每页独立 title / description / canonical / Open Graph
- `sitemap.ts` + `robots.ts` 自动生成，户型页随数据文件增删自动进出
- **JSON-LD**：`Organization`、每户型页 `Product` + `Offer`（价格区间与交付周期进富媒体摘要）、`FAQPage`、`BreadcrumbList` —— 竞品两家此块均粗糙，是可抢占位
- Core Web Vitals：`next/image` 输出 AVIF/WebP、字体自托管（同时消除向 Google 字体服务器泄露访客 IP 的 GDPR 问题）、LCP 图片优先加载

**长尾入口**：`/models/[slug]` 为长尾着陆页主力（"40ft container home"、"container cabin"）。`/guides/[slug]` 路由与 MDX 管线预留但不写内容。

**Search Console 与 GA 双轨**：GA 看行为漏斗，Search Console 看查询词与收录状态 —— 后者才是判断自然流量是否起效的依据，上线即接。

### 域名

**决定：尽快购入真实域名。**

Vercel 预览部署带 `X-Robots-Tag: noindex`，搜索引擎不收录；即便推至生产的 `*.vercel.app` 也无品牌信号与域名权重，商业词上无法获得自然流量。域名年龄与索引积累是纯粹的时间函数。

开发期使用预览域名，域名到手后立即绑定。

---

## 6. 设计方向

> **产出方式**：视觉方向不由本 spec 直接裁定。按 v3.1 §1 决策优先级，项目设计系统（PRODUCT.md / DESIGN.md）优先级高于 agent 默认审美判断。本节内容作为 `/impeccable init` 的**输入素材**，DESIGN.md 为最终 canonical 来源。

### 竞品站位

| 竞品 | 定位 | 手法 |
|---|---|---|
| BackCountry Containers | 暖色调、德州乡村、HGTV 真人秀气质 | 家庭作坊人情味 + 大量实拍 + Google 评价 |
| Container Alliance | 纯功能主义目录站 | 电话优先，几乎无设计 |

两者之间存在空位。

### 方向假设

`urbanbricks` = urban（都市）+ bricks（标准化模块），指向**工业模块化建造**而非手作小木屋。此定位既与 BackCountry 拉开距离，又与三个卖点咬合。

**核心张力**：工程可信度 vs. 居住向往感。纯工业风冷得无人愿住；纯温馨风撑不起「快速交付 + 质保」的承诺。

**解法假设：结构工业化，影像人情化。**
- 排版、网格、数据呈现走工程感（模块化栅格呼应集装箱模数；规格用等宽字体如规格书般排列）→ 撑起制造可信度
- 摄影与文案给温度（生活场景、光线、人在空间中的状态）→ 撑起居住向往感

**候选提案（供 DESIGN.md 讨论，非结论）**：标题 Archivo / 正文 Inter / 规格 IBM Plex Mono，全部经 `next/font` 自托管；基底冷调深灰阶，主强调色取压低饱和度的货运橙，中性色承载 90% 画面，橙色仅出现于 CTA 与关键数据。

### 已识别的红线风险（v3.1 §7）

| 风险 | 约束 |
|---|---|
| 规格数字计数动画 → 逼近「大数字 hero-metric 模板」 | 限制在规格表内，**禁止用于首页 hero** |
| 流程页序列感 → 易滑向「每节挂 01/02/03 编号」 | 序列感必须由版式与空间关系表达，禁用序号装饰 |

其余红线（米色默认底、gradient text、侧边色条、装饰性玻璃拟态、全大写小眉标、同尺寸卡片无限重复、无意义装饰背景）一并适用。正文对比度 ≥ 4.5:1（大字号 ≥ 3:1）；不得仅用颜色传达状态；大胆只用在一处签名元素。

### 动效

三档（CSS / React Bits / anime.js v4）按需选用。每项动效必须能回答「它让哪个卖点更可信」—— 职责是让「精密制造」被感知，而非炫技。全部提供 `prefers-reduced-motion` 降级；核心内容不得依赖动画触发才可见；effect / scope / timeline / listener 卸载时清理。

---

## 7. 状态矩阵

所有异步与条件 surface 必须覆盖：

| Surface | 需覆盖状态 |
|---|---|
| `<QuoteForm>` | idle / 字段校验错误 / 提交中（禁用+指示）/ 成功 / 服务端失败（含备用邮箱）/ 限流拒绝 |
| `/models` 筛选 | 有结果 / 空结果（含清除筛选出口）/ 初始加载 |
| `/models/[slug]` | 正常 / slug 不存在（404）/ 图片加载失败回退 / 无图占位 |
| `/admin/leads` | 未认证 / 口令错误 / 加载中 / 空列表 / 有数据 / 查询失败 |
| 全站图片 | 加载中 / 失败回退 |
| 全站文本 | 超长内容（产品名、地址、留言）不破版 |

**响应式**：移动端、桌面端与中间宽度均须明确定义行为，不得将桌面布局简单压缩。

---

## 8. 执行模型

| 角色 | Harness | 职责 |
|---|---|---|
| Human Owner | — | 批准 Brief、Tier、设计方向、例外与发布 |
| Primary Agent | Claude Code (Opus 4.8) | Brief 起草、架构、实现 |
| Worker | Kimi Code (K3) | 页面实现、组件落地 |
| Review / Verification Agent | 另一 harness、新会话 | `impeccable critique` / `audit`、浏览器实测 |

**编排**：使用 `pactify`（pact 协议 CLI）承载 v3.1 §2 / §4 的治理要求 —— assign / checkpoint / accept / changes / merge 状态机提供强制的评审门禁，worktree 隔离与权限审计替代靠自觉维护的 Handoff Record。canonical Brief 落在仓库中（`docs/brief.md`），不只存在于对话。

> 待确认：`pactify agent scan` 显示 kimi-cli 当前 model pin 为 `kimi-code/kimi-for-coding`，K3 是否需改 pin 由 Human Owner 确认后调整。

**Agent 权限边界**：agent 不得批准自己的工作、自行降级 Tier、豁免门禁、将失败检查标记为通过、未询问扩大范围。

---

## 9. 验证与发布

**验证顺序**（v3.1 §8）：type / lint / test → 关键旅程 E2E（T3 要求）→ UI 状态与数据边界 → 键盘、焦点、对比度与自动化 a11y 扫描 → 响应式与最终视觉证据 → 性能 / 安全 / 隐私。

**T3 必须有独立 Verification Agent / Run。**

**关键旅程 E2E**：
1. 首页 → 户型库 → 户型详情 → 内嵌表单提交 → 成功态
2. 直达 `/contact` → 表单提交 → 数据落库可验证
3. 未认证访问 `/admin/leads` → 被拦截 → 口令登录 → 看到线索 → CSV 导出

**铁律**：失败检查必须修复或由 Human Owner 明示豁免；修复后重测；**最终截图必须来自修复后的最终 build**；提交前浏览器截图实测（所有 Tier）；证据不含 secret。

**上线前门禁**：
- [ ] `pnpm verify:content` 清单逐条核实完毕
- [ ] `ASSET-LICENSES.md` 中标记为占位的图片全部替换
- [ ] 结构化空槽位（评价 / 案例 / 认证）已填真实素材，或该区块整体下线
- [ ] `/privacy` 内容经确认适用于目标市场
- [ ] 环境变量在 Vercel 配置完毕且未进入 git 历史

**回滚**：Vercel Instant Rollback 回退至前一部署。数据库为纯写入（无迁移破坏性操作），回滚不影响已收集线索。

---

## 10. 待办与开放问题

| 项 | 责任人 | 状态 |
|---|---|---|
| 购入真实域名并配置 DNS | Human Owner | 待办（时间敏感）|
| 结果目标（Baseline → Target 与测量窗口） | Human Owner | 暂缓，首批数据后补齐 |
| Kimi model pin 是否改为 K3 | Human Owner | 待确认 |
| Neon 项目开通、连接串写入 Vercel | Primary Agent | 待办 |
| GA4 property 与 Search Console 开通 | Human Owner | 待办 |
| 真实品牌资产（logo / 色彩 / 字体） | 无，由设计阶段产出 | 已决 |
| 真实客户评价 / 项目案例 / 认证 | Human Owner | 缺失，相关区块保持空槽位 |

---

## 11. 下一步

1. Human Owner 审阅本 spec
2. **Bootstrap**：Next.js 脚手架 → `pnpm dlx shadcn@latest init -y -b radix -p nova` → `/impeccable init` 产出 PRODUCT.md + DESIGN.md
3. DESIGN.md 交独立 Review Agent 复核设计方向 → Human Owner 确认
4. 编写实施计划（writing-plans），按页面拆解为 pact 任务
5. 进入开发四阶段
