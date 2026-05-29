# ScaleTrack

本地体重与 BMI 追踪应用。记录每日体重，可视化趋势变化，设定目标并追踪达成。

## 功能

- **每日记录** — 输入体重，自动计算 BMI，支持补填历史日期
- **趋势图表** — 双 Y 轴折线图（体重 + BMI），支持 3天/7天/1月/3月 切换
- **BMI 分级** — 中国标准（偏瘦/正常/偏胖/肥胖），数据点按区间着色
- **目标追踪** — 设定目标体重，进度可视化，达成时弹窗庆祝并可保存图片分享
- **里程碑** — 已达成目标永久保存，记录你的每一次突破
- **数据管理** — JSON 格式导入/导出，本地存储，隐私安全
- **深色模式** — 支持 Dark / Light 主题切换

## 技术栈

| 类别     | 技术                        |
| -------- | --------------------------- |
| 框架     | React 19 + TypeScript       |
| 构建     | Vite 8                      |
| 样式     | UnoCSS (preset-mini)        |
| 图标     | Lucide (UnoCSS Icons)       |
| 字体     | Plus Jakarta Sans + DM Sans |
| 图表     | Chart.js + react-chartjs-2  |
| 日期     | dayjs                       |
| 动画     | canvas-confetti             |
| 图片导出 | html-to-image               |
| 存储     | localStorage                |

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 代码检查
pnpm lint

# 类型检查
pnpm exec tsc --noEmit
```

## 项目结构

```
src/
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数（BMI 计算、存储、主题）
├── components/     # UI 组件
│   ├── ThemeToggle.tsx
│   ├── RecordForm.tsx
│   ├── WeightChart.tsx
│   ├── BMILegend.tsx
│   ├── GoalTracker.tsx
│   ├── GoalAchievementModal.tsx
│   ├── MilestoneList.tsx
│   ├── RecordList.tsx
│   └── DataImportExport.tsx
├── pages/          # 页面
│   ├── SetupPage.tsx
│   └── Dashboard.tsx
├── App.tsx         # 根组件
└── main.tsx        # 入口
```

## BMI 分级标准（中国）

| 分级 | 范围      |
| ---- | --------- |
| 偏瘦 | < 18.5    |
| 正常 | 18.5 ~ 24 |
| 偏胖 | 24 ~ 28   |
| 肥胖 | ≥ 28      |

BMI = 体重(kg) ÷ 身高(m)²

## License

MIT
