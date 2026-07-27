# ScaleTrack

本地优先的体重、BMI 与运动节律追踪应用。数据保存在浏览器本地，支持每日记录、趋势查看、运动回顾、目标追踪、里程碑和数据导入导出。

## Features

- 体重、BMI、目标进度和历史趋势记录
- 运动打卡、自定义运动类型、周频率和月历回顾
- 中国 BMI 标准分级与可视化反馈
- 动态代谢与阶段目标辅助分析
- 本地 JSON 数据导入/导出
- 深色模式与移动端优先体验
- PWA 安装、离线访问与新版本提示

## PWA

生产构建会生成 `manifest.webmanifest` 和 Service Worker。部署后，在支持 PWA 的浏览器中打开应用，可通过浏览器菜单将 ScaleTrack 安装到桌面或手机主屏。

应用更新时，新的资源会在后台缓存。检测到新版本后，页面会提示更新；也可以在「个人中心 / 关于 ScaleTrack」中查看当前版本并手动检查更新。更新不会修改本地体重数据。

当前部署路径配置为 `/ScaleTrack/`，如果部署到站点根路径或其他子路径，需要同步调整 `vite.config.ts` 中的 `base`、manifest `start_url`、`scope` 和 Workbox fallback。

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Tech Stack

- React 19 + TypeScript
- Vite 8
- UnoCSS
- Vitest
- vite-plugin-pwa + Workbox

## License

MIT
