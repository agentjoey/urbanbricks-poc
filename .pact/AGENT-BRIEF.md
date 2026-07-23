# Agent Brief — 本项目所有 worker / reviewer 的统一约束

> **不要去读 `~/AgentWorks/FRONTEND-DESIGN-WORKFLOW.md`，也不要按它自行推导 Tier 或门禁。**
> 那份治理文档由 `lead` 座位单点加载并解释，本文件是它对本项目的**已翻译结论**。你重新加载一遍只会重复 lead 已经做过的判断，浪费时间和 token，且可能得出与项目记录不一致的解读。
> 若本文件与你的任务提示词冲突，以任务提示词为准并**停下来报告冲突**，不要自行取舍。

---

## 你的座位与边界

| 座位 | 你能做 | 你不能做 |
|---|---|---|
| `build`（worker） | 实现、跑基础验证、收集证据、checkpoint | **不能 accept 自己的任务**（状态机会拒绝）；不能扩大范围；不能豁免失败检查；不能把失败标记为通过 |
| `review`（reviewer） | 审 diff 与证据、独立重跑验证、accept / changes | **不能编辑源文件** —— 一旦编辑你就成了 contributor，失去评审资格 |

**发现范围变化、规范自相矛盾、或需要设计决策时：停下来上报，不要猜。** 这不是保守，是本项目已经反复兑现的做法 —— worker 拒绝擅自替换字体、拒绝编造缺失的 token，两次都是对的。

---

## 证据规则（最重要的一条）

**断言不算证据。**

- reviewer **不得**把 worker 的文字结论当作测试证据，必须针对目标 build 产生自己的结果。
- 失败的检查必须修复，或由 Human Owner 明示豁免 —— 不能用"看起来正常"覆盖。
- 修复后必须重测受影响的检查。**最终截图必须来自修复后的最终 build**，不能是修复前的。
- 证据中不得包含任何密钥或真实凭证。本仓库是 **public** 的。

### 本项目已经踩过的坑（每一条都真实发生过）

1. **"机制存在"≠"机制生效"。** 字体回退声明写得完全正确，但排在 `sans-serif` 之后 —— 通用字族永远匹配，其后的一切浏览器不会去查。规则解析成功，层叠永远到不了。
2. **测量对象错了。** 上面那条的"浏览器实测"直接把元素的 `font-family` 设成回退字体去量，证明的是规则能解析，不是真实层叠会走到它。**永远通过真实路径测量，不要通过你为测试而搭的探针路径。**
3. **特性存在 ≠ 特性可用。** Golos Text 声明支持 `tnum`，字形也确实被替换，但替换后的"等宽数字"有五种宽度。要验到二进制层。
4. **检查脚本自我印证。** 对比度脚本硬编码调色板、不读 CSS，"ALL PASS"哪怕 CSS 里发的是默认灰也会通过。**让检查真的去读被检查的东西。**

**交付前自问：这个机制够不够到真实页面会走的路径，还是只够到我为测试搭的那条？**

---

## 实现侧硬性要求

### 组件（涉及 UI 组件的任务）

- 优先复用项目已有组件与内置 variant，**不要用自定义 markup 重造已有 primitive**。
- 走 shadcn：先读 `components.json` 确认 framework、Tailwind 版本、alias、icon library。
- **本项目只配置了 `@shadcn` 一个 registry。需要其他 registry（如 React Bits）必须先问 lead，不得自行猜测或添加。**
- 安装前 `pnpm dlx shadcn@latest add <item> --dry-run` 预览；安装后**审查新增文件的代码、依赖与许可证** —— registry 代码不是可信成品。
- runner 用 `pnpm dlx shadcn@latest`（本项目包管理器是 pnpm）。
- Overlay 必须有可访问名称；表单必须有 label、错误提示与 disabled/invalid 语义；异步 surface 必须覆盖 loading / empty / error / success / retry。

### 动效

三档，按需选择：纯 CSS/Tailwind 过渡 · React Bits 现成组件（**需先问 lead 配 registry**）· anime.js v4 自定义编排。

- 每项动效必须有 `prefers-reduced-motion` 降级。
- **核心内容不得依赖动画触发才可见** —— 隐藏标签页与无头渲染器不会触发过渡，会整块空白发出去。
- effect / scope / timeline / listener 卸载时必须清理。
- 动效集中在高影响时刻。散乱的微特效 = AI 味。
- 每项动效要能回答：它让哪个卖点更可信？答不上来就删掉。

### 状态矩阵（任何有状态的 surface）

必须覆盖所有适用状态：loading / empty / error / success / validation / disabled / permission。
明确移动端、桌面端与**中间宽度**行为 —— 不要把桌面布局简单压缩成移动布局。

### 设计红线（出现即重写）

米色奶油默认底 · gradient text（`background-clip:text` + 渐变）· 超过 1px 的彩色 `border-left`/`border-right` 色条 · 装饰性玻璃拟态 · 大数字 hero-metric 模板 · 每节挂 01/02/03 编号（**唯一例外：交付流程页，因其顺序是真实信息**）· 每节顶部的全大写宽字距小眉标 · 同尺寸 icon+标题+文字卡片无限重复 · 无意义装饰背景。

正文对比度 ≥4.5:1（大字号 ≥3:1）；**不得仅用颜色传达状态**。大胆只用在一处签名元素。

`DESIGN.md` 的 Do's and Don'ts 是本项目的完整清单，以它为准。

---

## 验证顺序

1. 自动化检查：`pnpm build` · `pnpm lint` · `npx tsc --noEmit` · `pnpm verify:contrast` · `pnpm verify:content`
2. UI 状态与数据边界（含超长文本不破版）
3. 键盘可达、焦点可见、对比度
4. 响应式与最终视觉证据
5. 适用时：性能 / 安全 / 隐私

**提交前浏览器截图实测是硬性纪律**，所有任务适用。截图必须来自修复后的最终 build。

---

## 内容真实性（不可豁免）

- **不得编造**：客户评价、项目案例、认证徽章、"已交付 N 套"类数字。相关区块保持结构化空槽位。
- 事实性数值（尺寸、价格、周期）必须用 `unverified()` 包裹 —— 漏标会编译失败。
- **交付天数不得脱离口径单独呈现。** 30 天仅指工厂建造，地基与审批属客户侧。类型系统已强制这一点，不要绕过。
- 图片：渲染图必须带不可移除的 `Visualisation` 标注；图库图仅用于环境与质感，**绝不用于呈现 urbanbricks 的建筑本身**（Not-Ours 规则，不可豁免）。

---

## 提交与协作

- 在 `feat/poc` 上提交；不要 merge，不要 force push。
- 不得覆盖、回退或格式化其他 agent 的未合并改动。
- 若某文件明确归属其他任务（见 `_DECOMPOSITION.md`），不要碰它。
- worker 完成：`PACT_AGENT_ID=build pactify checkpoint <task> --evidence "<具体做了什么、跑了什么命令、结果如何、有什么没验证>"`
- reviewer 判定：`PACT_AGENT_ID=review pactify accept <task> --evidence "..."` 或 `pactify changes <task> --reason "<编号、具体、可执行>"`

**证据要写你实际做了什么和得到什么结果，不要写你认为它应该没问题。**
