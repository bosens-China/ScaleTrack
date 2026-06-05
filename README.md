# ScaleTrack

本地体重与 BMI 追踪应用。记录每日体重，可视化趋势变化，设定目标并追踪达成。

## 功能

- **每日记录** — 自研顶部抽屉式日历组件，支持随时补填历史体重数据，精准还原历史时间轴
- **趋势图表** — 双 Y 轴折线图（体重 + BMI），支持 3天/7天/1月/3月 切换
- **BMI 分级** — 中国标准（偏瘦/正常/偏胖/肥胖），数据点按区间着色
- **目标追踪** — 采用**“高水位锚定+幽灵反弹条”**算法，进度只进不退，直观展示历史最佳与当前波动的心理缓冲空间
- **里程碑** — 动态阶段目标管理，补填历史数据达成时静默生成里程碑，最新数据达成时触发满屏撒花动画
- **数据管理** — JSON 格式导入/导出，本地存储，隐私安全
- **深色模式** — 支持 Dark / Light 主题切换

## 技术栈

| 类别     | 技术                        |
| -------- | --------------------------- |
| 框架     | React 19 + TypeScript       |
| 构建     | Vite 8                      |
| 测试     | Vitest                      |
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

# 单元测试
pnpm test
pnpm test:watch
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
