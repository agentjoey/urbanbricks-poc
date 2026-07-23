# 逐文件生图清单 — urbanbricks 户型图

> **给 Human Owner**:图库图走不通(免费图库里的集装箱基本都是货场旧箱子,撑不起产品页),回到规划 "1+2" 里的 AI 生图。这份清单把 15 个图位逐一对齐了**文件名、户型、比例、精确提示词、目标尺寸**。用你的生图工具(Midjourney / Nano Banana / 即梦 / Seedream 等)逐张跑,生成的图丢回 `public/images/models/`,我用 `pnpm verify:image-ratios` 校验比例、落盘、登记 `ASSET-LICENSES.md`。

## 全局约束(每张都要,已按 DESIGN.md 写死)

**必须有**:现代改造的**集装箱住宅/建筑**(看得出集装箱模块与轮廓)· 干净平整的板材或复合外墙 · 大面积玻璃 · 自然日光(晨昏侧光佳)· 真实场景(有地面/植被/环境)· 可见但精致的模块接缝

**必须避免**(踩红线直接废):波纹钢外露 · 货运编号/模板字 · 警示黄 · 锈迹/涂鸦 · 工地/堆场/港口 · 旧箱子 · 花哨拼色 · 北欧小木屋气质

**比例(硬性,错了破坏模块网格)**:hero `5:2` · card `3:2` · interior `4:3`。生图工具设 `--ar 5:2` 等;若工具不支持精确比例,出大图我来裁。

**风格锚点**:参考现代汽车配置页的干净、Muji Hut / 现代预制建筑的精致,深色板材或暖白外墙 + 木质点缀,冷调深灰或暖白基底。**不是**样板间浮夸,是"住进去很安心"的克制现代。

---

## 住宅线(4 户型 × hero+card = 8 张,+ 1 共用内景)

### 1. The Harbor 20 — 单模块 20ft 紧凑住宅
| 文件 | 比例 | 尺寸 |
|---|---|---|
| `harbor-20-hero.png` | 5:2 | 1600×640 |
| `harbor-20-card.png` | 3:2 | 1200×800 |

```
A single-module compact modern home converted from ONE 20-foot shipping
container, clad in smooth dark charcoal composite panels, the container's
form and corner castings still legible but refined. Full-height glazing
across the long side, slim black window frames, a warm timber-lined entrance
recess. Sitting on a low concrete plinth on a grassy plot with a few birch
trees. Early-morning side light, soft shadows, clear sky. Clean modern
detailing — NO corrugation, no rust, no cargo markings. Architectural
photography, photoreal, 35mm, eye level, no people.
```
*card 用同一栋建筑的近景/斜角。*

### 2. The Harbor 40 — 单模块 40ft 标准住宅
| `harbor-40-hero.png` | 5:2 | 1600×640 |
| `harbor-40-card.png` | 3:2 | 1200×800 |

```
A single-storey modern home converted from ONE 40-foot shipping container,
matte off-white composite cladding, the long container silhouette clean and
elegant. A recessed covered terrace at one end with slender steel columns,
sliding glass doors opening to a timber deck. On a gentle grassy slope with
low native planting. Late-afternoon sun, long soft shadows, warm daylight.
Fine visible module seams, no corrugation or rust. Architectural photoreal,
35mm, three-quarter view, no people.
```

### 3. The Meridian — 双模块并联住宅（40ft × 2）
| `meridian-hero.png` | 5:2 | 1600×640 |
| `meridian-card.png` | 3:2 | 1200×800 |

```
A modern house formed from TWO 40-foot shipping containers joined side by
side into a wide open-plan home, deep graphite composite cladding, one
full-height glazed gable end, flat roof with a slim overhang. The join
between the two container modules reads as a clean vertical line. Level plot,
gravel approach, young trees. Overcast-bright even daylight. No corrugation,
no cargo look. Architectural photoreal, 40mm, no people.
```

### 4. The Meridian Stack — 双层堆叠住宅（40ft × 2 上下）
| `meridian-stack-hero.png` | 5:2 | 1600×640 |
| `meridian-stack-card.png` | 3:2 | 1200×800 |

```
A two-storey modern home built from TWO stacked 40-foot shipping containers,
the upper container cantilevering slightly over the entrance. Warm grey
composite cladding with vertical dark timber battens on the upper volume, a
large corner window and a glass-balustrade balcony. In a clearing with tall
grass and a distant treeline. Golden-hour raking light, warm sky. The
horizontal seam between the stacked modules clearly legible. No corrugation,
no rust. Architectural photoreal, 35mm, slight low angle, no people.
```

### 5. 共用住宅内景
| `residential-interior.png` | 4:3 | 1200×900 |

```
Interior of a modern shipping-container home, open-plan living and kitchen,
the container's width and one clean structural seam where two modules meet
subtly visible. White walls, pale oak floor, simple flat-front kitchen units
in muted sage. Full-height window along one wall flooding the room with soft
daylight, greenery outside. Low linen sofa, one woven rug, a plant. Calm,
uncluttered, lived-in but tidy. Interior architectural photoreal, 24mm,
natural light only, no people.
```

---

## 商业线（3 户型 × hero+card = 6 张）

### 6. The Counter — 集装箱酒吧/咖啡（20ft × 1）
| `counter-hero.png` | 5:2 | 1600×640 |
| `counter-card.png` | 3:2 | 1200×800 |

```
A compact modern bar/café built from ONE 20-foot shipping container with a
large fold-up serving hatch open along the long side forming a canopy over a
timber counter. Matte deep-green composite cladding, warm concealed lighting
under the canopy, simple stools on a gravel forecourt. Small urban courtyard,
string lights, planters. Blue hour, warm interior glow against cool ambient
light. Clean modern detailing, NO corrugation, no cargo markings.
Architectural photoreal, 35mm, no people.
```

### 7. The Workroom — 模块化办公（多模块）
| `workroom-hero.png` | 5:2 | 1600×640 |
| `workroom-card.png` | 3:2 | 1200×800 |

```
A modern modular office formed from TWO joined 40-foot shipping containers,
clad in light warm grey composite panels with a fully glazed entrance bay and
a slim steel canopy. Landscaped edge with low hedging and a paved approach.
Interior visible through glass: desks, task lighting, greenery. Bright midday
daylight, crisp soft shadows. Contemporary commercial architecture, clean
module seams, NO industrial styling, no corrugation. Photoreal, 35mm, no people.
```

### 8. The Basecamp — 露营/短租单元（20ft × 1）
| `basecamp-hero.png` | 5:2 | 1600×640 |
| `basecamp-card.png` | 3:2 | 1200×800 |

```
A small modular cabin built from ONE 20-foot shipping container, clad in dark
matte panels with a warm timber-lined porch and a single large picture window
facing the view, raised on discreet steel feet. At the edge of a pine forest
overlooking open countryside. Soft misty morning light, cool blue-grey
atmosphere with warm light spilling from the window, two camp chairs outside.
Container form legible but refined — no corrugation, no rust. Architectural
photoreal, 35mm, no people.
```

---

## 生成后

每张丢进 `public/images/models/`（用上面的确切文件名），然后:
```
pnpm verify:image-ratios   # 比例不对会报警（破坏模块网格）
```
比例对了我登记进 `ASSET-LICENSES.md`（来源=AI 生成、工具、日期），并把模型页从占位框接到真图。

**一致性提示**:同一户型的 hero 和 card 尽量用**同一次生成的同一栋建筑**的不同裁剪/角度，否则同一个户型页上下两张图会像两栋不同的房子。多数工具能对一张图做变体或重裁 —— 出一张大图，hero 裁 5:2、card 裁 3:2 是最省事的一致性做法。
