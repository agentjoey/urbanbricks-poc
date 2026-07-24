# 生图清单 2 — 剩余图位（工艺/流程/关于页 + 一张重生）

> 15 张户型图已完成上线。这份是**剩下所有还在用占位框或需要更好构图的图位**，共 7 张。全部用你之前生 15 张的同一套工具和审美标准。

## 全局约束（同清单 1）

现代改造的集装箱建筑 · 干净板材 + 大玻璃 · 自然光 · 可见但精致的模块接缝 · **无锈、无货运编号、无警示黄、无工地脏乱、无堆场感**。工厂场景要**干净、有序、现代车间**，不是脏乱工地。

生图工具设 `--ar 5:2` / `--ar 4:3`；出大图我也能裁。**目标尺寸严格**（错了破坏模块网格）。

---

## A. 工艺 / 流程实拍类（5 张）

> 这些位置对应你确认"会拍给客户"的工厂过程照片。现在没有真实实拍，先用渲染图占位（带"Visualisation"标注，诚实）。将来有真实工厂照片可替换。**Not-Ours 规则**：绝不能用别家工厂的照片充当 urbanbricks 的——渲染图或你自己的实拍。

### 1. 关于页首图 — `about-hero`
| 比例 | 尺寸 | 文件名 |
|---|---|---|
| 5:2 | 1600×640 | `context/about-hero.png` |
```
A clean modern shipping-container building in bright daylight on a landscaped
plot, three-quarter view, dark or warm-grey composite cladding with large
glazing, the container form legible but refined. Calm, confident, aspirational
— the brand's establishing shot. Soft natural light, clear sky. No corrugation
rust, no cargo markings, no construction mess. Architectural photoreal, 35mm,
no people.
```

### 2. 工厂在建 — `craft-build` (4:3)
| 4:3 | 1200×900 | `context/craft-build.png` |
```
Interior of a clean modern prefabrication facility, a shipping-container
building module under construction on a steel jig, wall panels and insulation
partly installed, services visible in the open frame. Bright even overhead
lighting, polished concrete floor, orderly tool stations, everything tidy.
Calm and precise — NOT a gritty or messy building site. Architectural
photoreal, 35mm, no people, no brand markings.
```

### 3. 内部装配 — `craft-fitout` (4:3)
| 4:3 | 1200×900 | `context/craft-fitout.png` |
```
Interior fit-out inside a shipping-container module on the factory floor:
a kitchen or bathroom being installed, cabinetry going in, clean finished
walls, the container's width and structural ribs subtly visible. Bright
workshop lighting, tidy, modern, precise. No mess, no rust. Interior
architectural photoreal, 24mm, no people.
```

### 4. 流程页工厂装配 — `process-fitout` (5:2)
| 5:2 | 1600×640 | `context/process-fitout.png` |
```
Wide view of a shipping-container module being fitted out inside a clean
modern factory — the module on a jig, cladding and glazing installed, an
orderly workshop around it. Bright even lighting, polished floor, tidy tool
stations. Modern, precise, clean — not an industrial-grimy plant. Architectural
photoreal, 35mm, no people.
```

### 5. 交付吊装 — `delivery-crane` (5:2)
| 5:2 | 1600×640 | `context/delivery-crane.png` |
```
A finished modern shipping-container building module being lowered by crane
onto a prepared concrete foundation on a green landscaped plot, slings taut,
the module level and clearly a finished building (clad, glazed) — NOT a bare
cargo container. Clean site, no clutter. Bright overcast daylight, soft
shadows. Architectural photoreal, 50mm, no people.
```

---

## B. 重生一张（构图更好）

### 6. Meridian Stack hero — `models/meridian-stack-hero` (5:2)
| 5:2 | 1600×640 | `models/meridian-stack-hero.png`（覆盖现有） |

> 现有那张裁得太近，只有堆叠接缝特写，看不出是完整两层建筑。重生一张能看出**整栋两层**的外观。
```
A two-storey modern home built from TWO stacked 40-foot shipping containers,
shown as a WHOLE BUILDING in three-quarter view (not a close detail): the
upper container cantilevering slightly over the entrance, warm grey composite
cladding with vertical dark timber battens on the upper volume, a large corner
window and a glass-balustrade balcony. In a clearing with tall grass and a
distant treeline. Golden-hour raking light, warm sky. The horizontal seam
between the two stacked modules clearly legible. No corrugation rust, no cargo
look. Architectural photoreal, 35mm, slight low angle, no people.
```

---

## 落地方式

- 工艺/流程/关于图放进 `public/images/context/`（新目录），我把 5 处占位框接上 `src` 并加 `ContextPhoto` 或 `RenderImage`（渲染图用 RenderImage，标注正确）。
- meridian-stack-hero 直接覆盖 `public/images/models/meridian-stack-hero.png`。
- 全部经 `pnpm verify:image-ratios` 校验比例、登记 `ASSET-LICENSES.md`。

> **一致性**：这 7 张的审美要和已上线的 15 张一致（同样的现代集装箱、自然光、去锈去货运感）。工厂场景尤其注意"干净现代车间"而非"脏乱工地"——那是撑起"精密制造、交付可控"品牌承诺的关键。
