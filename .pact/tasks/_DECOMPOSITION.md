# urbanbricks-poc —— pact 任务分解

Tier: **T3**（全新路由 · 认证边界 · 个人敏感数据 · 核心转化路径）
规范来源优先级：仓库规则 → 本 spec → PRODUCT.md / DESIGN.md → 全局 skill

## 座位

| seat | 角色 | harness | 职责 |
|---|---|---|---|
| `lead` | orchestrator | Claude Code (Opus 4.8) | 拆任务、assign、merge、维护 charter |
| `build` | worker | Kimi Code (K3) | 实现、checkpoint、留证据 |
| `review` | reviewer | Gemini CLI | 审 diff 与证据、accept / changes |

三家 vendor 互不相同，满足 v3.1 §2「T3 应当换 harness 降低共同盲点」。
worker 不得自我 accept —— 由 pact 状态机强制，非靠自觉。

## 依赖图

```
        ┌─ F1-tokens ─┐
        │             ├─→ F4-shell ─┬─→ P1-models  ─┐
F0-setup┼─ F2-content ┤             ├─→ P2-detail  ─┤
        │             ├─→ C1-form   ┼─→ P3-process ─┼─→ X1-seo ─→ X3-verify
        └─ F3-db ─────┘   C2-spec   ├─→ P4-home    ─┤
                          C3-image  ├─→ P5-contact ─┤
                                    ├─→ P6-about   ─┤
                                    ├─→ P7-privacy ─┘
                                    └─→ A1-admin ───→ X2-analytics
```

## 任务清单

### 地基层（串行，阻塞一切）

**F1-tokens** — DESIGN.md → 代码
把 DESIGN.md 的 token 落到 `globals.css`：全部 OKLCH 变量含深色变体与状态色；字体经 `next/font` 自托管（**Archivo 必须显式请求 `wdth` 轴**，否则宽度对比层级整个消失；配 `size-adjust` 防 CLS；确认 Golos Text 含 `tnum`）；模块网格工具类（5:2 基元）；圆角与间距标度。
验收：`pnpm verify:contrast` 通过；三道字体门禁均有实测证据（截图 + 计算值），非口头结论。

**F2-content** — 内容层与 `unverified()` 机制
`content/{site,models,process,faq}.ts`；`Unverified<T>` 分支类型，**漏标即编译失败**；`pnpm verify:content` 输出带路径的未核实清单；`factoryBuildDays: 30` 为已确认值；**渲染交付信息的组件在类型层面必须同时接收口径说明，只给数字不能编译**；货币走 `site.ts` 单一配置。
验收：故意漏标一个事实值 → 编译失败；故意只传数字给交付组件 → 编译失败。两条都要有失败输出为证。

**F3-db** — Neon + Drizzle
`leads` 表按 spec §4；不存 IP / user-agent；迁移脚本；env 只走 Vercel，`.env.example` 入库。
验收：本地跑通建表与一次插入。

### 组件层（F1/F2/F3 后可并行，各自独立文件）

**C1-form** — `<QuoteForm>` + Server Action ⚠️ 核心转化路径
zod schema 前后端共用；蜜罐 + 提交耗时 + IP 内存限流；**写库失败必须把完整表单以结构化 JSON 打进运行时日志并返回备用邮箱** —— 丢线索是本项目最贵的缺陷；隐私同意勾选必填；GA 事件 `quote_form_start` / `generate_lead`；完整状态矩阵（idle / 校验错误 / 提交中 / 成功 / 服务端失败 / 限流）。
验收：六种状态各一张截图；模拟 DB 故障验证日志兜底确实触发。

**C2-spec-table** — 签名组件
两栏、1px 分隔、tabular figures、无斑马纹无卡片壳；交付与价格值用 Deep Brass（浅底）/ Brass（深底）；开发环境 `unverified()` 值带可见角标。
验收：浅底与深底各一张截图，深底必须用深色变体 token。

**C3-image** — 带标注的渲染图组件
`Visualisation — not a photograph of a delivered building` 标注**在组件内不可移除**（不是可选 prop）；5:2 / 3:2 / 4:3 比例；加载中与加载失败回退；`next/image` AVIF/WebP。
验收：尝试从调用方移除标注 → 类型层面不可能。

**F4-shell** — 根布局与导航
sticky nav（激活态用 Deep Brass 下划线 **+ 字重变化**，颜色不可单独承载状态）；900px 以下折叠为全高抽屉且 CTA 固定在拇指可及处；footer；metadata 默认值；`Organization` JSON-LD；skip-link；字体挂载。
验收：键盘全程可达 + 焦点可见（深浅两种表面各验一次）。

### 页面层（组件层后大幅并行，各自独立 worktree）

**P1-models** `/models` — 按尺寸与用途筛选；空结果态含清除出口。
**P2-detail** `/models/[slug]` — 图集 + C2 + 内嵌 C1（自动带 model_slug）+ `Product`/`Offer` JSON-LD + 404 + `view_model` 事件。
**P3-process** `/how-it-works` ⚠️ **最难的一页**
承载「30 天」的全部论证。**必须呈现并行时间线**：工厂建造 vs 客户侧场地/审批两条轨道，让「建造不再占用你的时间」这件事被看见而非被声称。**允许用序号**（唯一获准处，因顺序是真实信息）。**无过程实拍可用** —— 按 Not-Ours 规则不得拿他人工厂图充数，靠图解与版式承载。质保条款要具体到可对账。
**P4-home** `/` — 首屏主张（**禁止出现不带口径的孤立「30 天」**）；**客群自识别发生在精选户型区**，禁止双 hero / 入口弹窗 / 分叉；两类客群视觉权重与排序位置对等；流程概览；FAQ 摘要各含住宅与商业至少一条。
**P5-contact** `/contact` — 主转化页 + C1。
**P6-about** `/about` — 工艺与流程透明度；**评价 / 案例 / 认证保持结构化空槽位**，不得填充编造内容。
**P7-privacy** `/privacy` — 覆盖 GA 埋点、表单数据、cookie；面向英国 + 全球英语市场（UK GDPR / PECR）。

**A1-admin** `/admin/leads` ⚠️ T3 认证边界 + 敏感数据
`ADMIN_PASSWORD` 常量时间比较 → httpOnly + Secure cookie → 中间件拦 `/admin/*`；倒序表格 + CSV 导出；状态：未认证 / 口令错 / 加载 / 空 / 有数据 / 查询失败。
验收：未认证直访被拦、错误口令不泄露信息、CSV 内容正确。

### 收尾层

**X1-seo** — `sitemap.ts` / `robots.ts`（户型随数据自动进出）；每页 canonical + OG；`FAQPage` + `BreadcrumbList` JSON-LD；canonical 域 `urbanbricks.uk`。
**X2-analytics** — GA4 三事件；**PECR 要求 cookie 同意后才可埋点**，需同意闸门，不能默认加载。
**X3-verify** ⚠️ 独立 Verification（新会话，不得继承实现上下文）
三条关键旅程 E2E：首页→户型→详情→内嵌表单→成功态；直达 /contact 提交→数据落库可验证；未认证访问 /admin→拦截→登录→看到线索→导出 CSV。
外加：a11y 扫描、响应式、`impeccable critique` + `audit`。
**最终截图必须来自修复后的最终 build。**

## 并行与隔离规则（v3.1 §4）

- 页面层任务各自独立 worktree，不同任务不得改同一文件
- `globals.css` 归 F1 所有；后续任务需要新 token 必须回 F1 改，不得就地追加
- 组件层三个任务文件互不重叠，可并发
- 切换 agent / worktree / 跨会话暂停必须留 Handoff Record

## 未决事项（不阻塞开工，但阻塞上线）

| 项 | 状态 |
|---|---|
| 3D 渲染图 | 提示词已交付 `docs/render-prompts.md`，等 Human Owner 生图；期间用带标注占位图 |
| 价格区间真实值 | `unverified()`，上线前必须核实 |
| 货币与计量单位 | 待定，`site.ts` 单一配置 |
| 真实评价 / 案例 / 认证 | 无，相关区块保持空槽位 |
| 结果目标（Baseline→Target） | Human Owner 暂缓，首批数据后补齐 |
