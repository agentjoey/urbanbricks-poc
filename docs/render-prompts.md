# 户型渲染图 —— 生图提示词

> **给 Human Owner 的使用说明**
>
> 我没有图像生成能力，这份文件是交给你去生图的输入。每个户型一组提示词，已按 DESIGN.md 的视觉规范约束（5:2 模块比例、自然光、去工业感、住宅与商业双线覆盖）。
>
> **所有构型均为 20ft / 40ft 标准模块的常规组合**，是集装箱模块化建筑行业已验证可建造的形态 —— 因为产品线未定，我刻意不画任何需要非常规工程的造型。产品线确定后，按实际参数回来修正提示词再重生。
>
> **每张生成图上线时必须带不可移除标注**：`Visualisation — not a photograph of a delivered building`（见 DESIGN.md § Imagery policy）。
>
> 建议工具：Midjourney / Nano Banana Pro / Seedream 等。参数写法按你所用工具调整，比例保持一致。

---

## 通用约束（每条提示词都应包含）

**必须有：**
- 自然日光，柔和方向性光线，清晨或黄昏偏侧光；真实天气感
- 建筑处在真实场景中（有地面、植被、周边环境），不是白底产品图
- 干净的现代外立面：平整金属或复合板墙面、大面积玻璃、简洁收边
- 可见的模块接缝 —— 这是产品诚实性，也是 DESIGN.md 模块网格的视觉呼应
- 人的痕迹（家具、灯光、门口的物件），但不必有人物出镜

**必须避免（对应 DESIGN.md 硬约束）：**
- 集装箱货运特征：波纹钢板外露、货运编号、模板字、锈迹、警示黄
- 工业/工地感、脏污、堆场环境
- 北欧小木屋、原木外墙、乡村手作气质
- HDR 过曝、假光晕、夸张广角畸变
- 任何品牌 logo、可识别的现实存在的建筑

**画幅：**
- 主图（hero / 户型详情首图）：`--ar 5:2`（对应模块网格基元比例）
- 网格卡片图：`--ar 3:2`
- 内景图：`--ar 4:3`

---

## 住宅线

### 1. The Harbor 20 — 单模块紧凑住宅（20ft × 1）

```
A single-module compact modern home built from one 20-foot prefabricated
steel module, clad in smooth dark charcoal composite panels with a warm
timber-lined entrance recess. Full-height glazing across the long facade,
slim black frames. Sitting on a low concrete plinth on a grassy plot with
scattered birch trees. Early morning side light, soft shadows, clear sky
with light cloud. Visible clean module seam lines. Interior lights warm
against the cool morning. Architectural visualisation, photoreal,
50mm lens, eye level, no people. --ar 5:2
```

**用途：** 户型详情主图 · 首页住宅线代表

---

### 2. The Harbor 40 — 单模块标准住宅（40ft × 1）

```
A modern single-storey prefabricated home made from one 40-foot steel
module, matte off-white composite cladding with a recessed covered terrace
at one end, slender steel columns. Sliding glass doors open to a timber
deck. Positioned on a gentle slope with low native grasses. Late afternoon
sun, long soft shadows, warm daylight. Module seams visible as fine
vertical lines. Outdoor chair and a folded blanket on the deck.
Architectural visualisation, photoreal, 35mm lens, no people. --ar 5:2
```

**用途：** 户型详情主图 · 网格卡片（裁 3:2）

---

### 3. The Meridian — 双模块并联住宅（40ft × 2 并联）

```
A modern prefabricated house formed from two 40-foot modules joined side by
side, creating a wide open-plan interior. Exterior in deep graphite panels
with one full-height glazed gable end. Flat roof with a slim overhang.
Set on a level plot with a gravel approach and young trees. Overcast-bright
daylight, even soft shadows, subtle sky texture. The join between the two
modules reads as a clean vertical line. Architectural visualisation,
photoreal, 40mm lens, three-quarter view, no people. --ar 5:2
```

**用途：** 户型详情主图 —— 体现"模块可组合"这一核心叙事

---

### 4. The Meridian Stack — 双层住宅（40ft × 2 上下堆叠）

```
A two-storey prefabricated home built from two stacked 40-foot steel
modules, upper level cantilevering slightly over the entrance. Warm grey
composite cladding with vertical dark battens on the upper volume. Large
corner window on the first floor, glass balustrade balcony. Standing in a
clearing with tall grass and distant treeline. Golden hour light raking
across the facade, deep soft shadows, warm sky. Horizontal seam between the
stacked modules clearly legible. Architectural visualisation, photoreal,
35mm lens, slight low angle, no people. --ar 5:2
```

**用途：** 户型详情主图 —— 体现纵向扩展能力

---

### 5. 内景 —— 通用住宅室内

```
Interior of a modern prefabricated modular home, open-plan living and
kitchen. White walls, pale oak floor, simple flat-front kitchen units in
muted sage. Full-height window along one wall flooding the room with soft
daylight, view of grass and trees outside. Low linen sofa, one woven rug,
a few books, a plant. Ceiling shows a subtle structural line where two
modules meet. Calm, uncluttered, lived-in but tidy. Interior architectural
visualisation, photoreal, 24mm lens, natural light only, no people.
--ar 4:3
```

**用途：** 户型详情图集 · 关于/工艺页

---

## 商业线

### 6. The Counter — 集装箱酒吧 / 咖啡（20ft × 1 带开窗）

```
A compact modern bar built from a single 20-foot prefabricated module with
a large fold-up serving hatch open along the long side, forming a canopy
over a timber counter. Matte deep-green composite cladding, warm concealed
lighting under the canopy, simple bar stools on a gravel forecourt. Set in
a small urban courtyard with string lights and planters. Blue hour, warm
interior glow against cool ambient light. Clean modern detailing, no
shipping-container corrugation. Architectural visualisation, photoreal,
35mm lens, no people. --ar 5:2
```

**用途：** 商业线代表图 · 首页商业线入口

---

### 7. The Workroom — 模块化办公（40ft × 2 并联）

```
A modern modular office building formed from two joined 40-foot modules,
clad in light warm grey panels with a fully glazed entrance bay and a slim
steel canopy. Landscaped edge with low hedging and a paved approach path.
Interior visible through glass: desks, task lighting, greenery. Bright
midday daylight with soft clouds, crisp shadows. Contemporary commercial
architecture, clean seams, no industrial styling. Architectural
visualisation, photoreal, 35mm lens, no people. --ar 5:2
```

**用途：** 商业线户型详情主图

---

### 8. The Basecamp — 露营 / 短租单元（20ft × 1）

```
A small modular cabin unit built from one 20-foot prefabricated module,
clad in dark matte panels with a warm timber-lined porch and a single large
picture window facing the view. Raised on discreet steel feet above rough
ground. Positioned at the edge of a pine forest overlooking open
countryside. Soft misty morning light, cool blue-grey atmosphere with warm
light spilling from the window. Two camp chairs outside. Architectural
visualisation, photoreal, 35mm lens, no people. --ar 5:2
```

**用途：** 露营/短租场景代表图

---

## 流程页配图（可选，非过程实拍的替代）

> 注意：按 Not-Ours 硬规则，**不得**使用图库里他人工厂的照片充当 urbanbricks 车间。以下为渲染图，同样需带 Visualisation 标注；若不生成，`/how-it-works` 页应以图解与版式承载，不留空洞配图位。

### 9. 工厂建造中（渲染）

```
Interior of a clean modern prefabrication facility, a 40-foot building
module under construction on a steel jig, wall panels partly installed,
insulation and services visible in the open frame. Bright even overhead
lighting, polished concrete floor, orderly tool stations. Calm and precise,
not gritty or industrial-grimy. Architectural visualisation, photoreal,
35mm lens, no people, no brand markings. --ar 5:2
```

### 10. 吊装就位（渲染）

```
A finished prefabricated building module being lowered by crane onto a
prepared concrete foundation on a green plot, slings taut, module level.
Ground crew absent, clean site, no clutter. Bright overcast daylight, soft
shadows. The module is a finished modern building, not a shipping
container. Architectural visualisation, photoreal, 50mm lens, no people.
--ar 5:2
```

---

## 生成后的检查清单

每张图上线前逐条确认：

- [ ] 没有波纹钢板、货运编号、模板字、锈迹、警示黄
- [ ] 没有北欧木屋 / 乡村手作气质
- [ ] 模块接缝可见（产品诚实性）
- [ ] 自然光，非棚拍白底
- [ ] 无任何 logo 与可识别的现实建筑
- [ ] 比例正确（主图 5:2）
- [ ] 已加 `Visualisation — not a photograph of a delivered building` 标注
- [ ] 已登记进 `ASSET-LICENSES.md`（来源=AI 生成、工具、日期、提示词版本）
- [ ] 该构型确实在 urbanbricks 制造能力范围内
