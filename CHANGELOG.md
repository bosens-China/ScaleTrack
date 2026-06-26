# Changelog

## [1.2.0](https://github.com/bosens-China/ScaleTrack/compare/scaletrack-v1.1.0...scaletrack-v1.2.0) (2026-06-26)


### ✨ 新功能

* 优化打卡备注、趋势均线与目标推荐体验 ([2d1a395](https://github.com/bosens-China/ScaleTrack/commit/2d1a395bd9474751a7a32ce0762b1bf8152ef008))


### ♻️ 重构

* 拆分超长文件，控制单文件行数 ([a4742e9](https://github.com/bosens-China/ScaleTrack/commit/a4742e9db7efc0de924d6b5d4cd2367aa577588a))

## [1.1.0](https://github.com/bosens-China/ScaleTrack/compare/scaletrack-v1.0.0...scaletrack-v1.1.0) (2026-06-20)


### ✨ 新功能

* 将单位/目标/热量/打卡/记录编辑接入页面与状态层 ([c87d046](https://github.com/bosens-China/ScaleTrack/commit/c87d0467f395d3ff5e2c72890f7075ba0565885a))
* 支持体重单位 kg/斤 切换 ([0d81cf4](https://github.com/bosens-China/ScaleTrack/commit/0d81cf45dbe8f19a1c5f1285528687de50b44b32))
* 支持目标放弃与过期处理 ([a270d75](https://github.com/bosens-China/ScaleTrack/commit/a270d75db27d6ec9a90fd289500aed7f4bb6adf2))
* 新增动态热量建议与健康速度护栏 ([3dc7f13](https://github.com/bosens-China/ScaleTrack/commit/3dc7f13846e16813f860671ba7db1bdc7c6260b7))
* 新增连续打卡统计 ([fd8b5ec](https://github.com/bosens-China/ScaleTrack/commit/fd8b5ecfa3d03eda97c1e2ea98667d38e6edc117))
* 本地数据迁移至 IndexedDB，支持导入合并与备份提醒 ([de90c04](https://github.com/bosens-China/ScaleTrack/commit/de90c04040d188884f9b1a4b7cb0faec81d8494a))

## 1.0.0 (2026-06-19)


### ✨ 新功能

* **metabolism:** 实现静态 BMR 计算与动态 TDEE 趋势估算算法 ([2ff1fd8](https://github.com/bosens-China/ScaleTrack/commit/2ff1fd83dd329314e273d7fad4b36402f93907a4))
* **profile:** 新增用户年龄的初始配置与二次修改功能 ([bc97f1d](https://github.com/bosens-China/ScaleTrack/commit/bc97f1dceae7ed377c912d856b70558a76428c31))
* **record:** 支持历史记录补录与智能标签推荐 ([9a1f18a](https://github.com/bosens-China/ScaleTrack/commit/9a1f18afc0f30c3cc4540852428a517b92e05b5a))
* **ui:** 提升核心流程的用户体验与数据图表展示 ([62bb2f9](https://github.com/bosens-China/ScaleTrack/commit/62bb2f91009bc20de7f87be5c99c027f30114515))
* **ui:** 新增里程碑详情页及个人中心重构 ([1a3a011](https://github.com/bosens-China/ScaleTrack/commit/1a3a01134e5f415c8d36a6ac44c7f095923802e0))
* ui界面改版 ([076ceda](https://github.com/bosens-China/ScaleTrack/commit/076ceda58e5a78aabd9aaa8dcb47ac33fe5ff714))
* ux优化 ([7ae8b33](https://github.com/bosens-China/ScaleTrack/commit/7ae8b33412f6ade28d3304f2411db509ad319d4f))
* ux优化，添加个人信息编辑 ([6af6d63](https://github.com/bosens-China/ScaleTrack/commit/6af6d636c82cbee88abeba0e1493ebe8a197653c))
* 删除无用引入 ([a977b87](https://github.com/bosens-China/ScaleTrack/commit/a977b8736901c336975a549452d8a5e35cee8b46))
* 完成初版 ([6b45ef7](https://github.com/bosens-China/ScaleTrack/commit/6b45ef7e8a2a99d55366a10c4b002d6c25f799eb))
* 拆分文件行数超出400文件 ([2aa60cc](https://github.com/bosens-China/ScaleTrack/commit/2aa60cc87fed951d630bcdd270e2e1e0febd3d52))
* 支持 BMI 趋势分析 ([ae8ce1b](https://github.com/bosens-China/ScaleTrack/commit/ae8ce1bd2e1e43503e6bb2078ec653bbc3a6e916))
* 支持目标达成日期 ([edc4907](https://github.com/bosens-China/ScaleTrack/commit/edc49077beb7cebd7cf34a108f811935db4aa430))
* 更新年月日组件使用形式 ([33e9f0f](https://github.com/bosens-China/ScaleTrack/commit/33e9f0f83bfb42eb09513ca4ff92c8d56e7722bf))
* 更新年龄为出生年月日 ([9c40d8b](https://github.com/bosens-China/ScaleTrack/commit/9c40d8bbf46bb689dc94e35865eebe23b278860a))
* 添加 PWA 支持与更新提示 ([e2edb6b](https://github.com/bosens-China/ScaleTrack/commit/e2edb6b57a0fd0ae6983aae38c8850542ae2c8c7))
* 添加dark模式，改进目标计算公式 ([eab8822](https://github.com/bosens-China/ScaleTrack/commit/eab88220456563225bcfa28ea16b4361bcf5cf2e))
* 添加主题手动切换功能 ([932bbd8](https://github.com/bosens-China/ScaleTrack/commit/932bbd89c38b45e5f99de8e39471072d6fe9f2b0))
* 添加分享海报能力 ([2f5a533](https://github.com/bosens-China/ScaleTrack/commit/2f5a5338f80e8112625aac332bbb150d7dafe531))
* 添加意见反馈 ([9e6de58](https://github.com/bosens-China/ScaleTrack/commit/9e6de589141ce7003c845ab11cc32fd06f072ef1))
* 趋势页叠加体重目标参考线 ([2629c3b](https://github.com/bosens-China/ScaleTrack/commit/2629c3b8c835c19c3c8ca2e4af215779ad178390))
* 进度显示计算逻辑改进 ([431b64e](https://github.com/bosens-China/ScaleTrack/commit/431b64e8a2d757baf3906a1569de31cf590be4d2))
* 重构仪表盘分享海报，以累计变化为主角 ([6df499f](https://github.com/bosens-China/ScaleTrack/commit/6df499f7588ceb1b9419c63257bfb720cfa236b6))
* 重算目标达成状态 ([e0a2d7c](https://github.com/bosens-China/ScaleTrack/commit/e0a2d7c550cdee03689ab2ba10959b12165336d6))
* 限制体重记录补录范围 ([2714d88](https://github.com/bosens-China/ScaleTrack/commit/2714d880fbc527cb0f00c788d2bb00bb7cc30468))


### 🐛 修复

* **ui:** fix typescript error in ProfileGoalSection props ([a7290cf](https://github.com/bosens-China/ScaleTrack/commit/a7290cf807c5128d1d22004c34e7326408f6982f))
* 修复tsc报错 ([4968dc7](https://github.com/bosens-China/ScaleTrack/commit/4968dc7d59b17173d510528dcc649647604c6eb9))
* 修复分享海报在深色模式下的配色 ([65a6335](https://github.com/bosens-China/ScaleTrack/commit/65a63359f6c75e8f560ede33cd08bffaad7cccfa))
* 修复图表精度、日历层级及 CI 并发逻辑 ([31d5d40](https://github.com/bosens-China/ScaleTrack/commit/31d5d4095e8e02384ea69c5d51e021fabbb50e99))
* 修复引导模块重复问题 ([050ff83](https://github.com/bosens-China/ScaleTrack/commit/050ff83affea79b2771f3fba0e0c70b1596209c8))
* 修正体重刻度尺范围至 20–300 ([9f8b406](https://github.com/bosens-China/ScaleTrack/commit/9f8b40693048b464c11641652359d3a9efddaaa8))
* 加强导入数据校验 ([60e0e01](https://github.com/bosens-China/ScaleTrack/commit/60e0e0147d796c47cd8bf8fdd104459c1fb103b0))


### ♻️ 重构

* **core:** 升级目标进度算法与全局状态管理 ([e8f84e6](https://github.com/bosens-China/ScaleTrack/commit/e8f84e6d20ab4e2fa703e342d0d2c86bc4822c9d))
* **ui:** 重构 Tab 信息架构并整合动态代谢数据 ([80ab381](https://github.com/bosens-China/ScaleTrack/commit/80ab38115a559a27b8b4451cd8476988cbe3366b))
* ux/dx audit fixes - compiler-aware rewrites, type splits, theme tokens ([13d956d](https://github.com/bosens-China/ScaleTrack/commit/13d956d880dcaa55248bc0823a2699eff995c4dd))


### 📝 文档

* update PRD and README for dynamic metabolism and new UI structure ([4543e42](https://github.com/bosens-China/ScaleTrack/commit/4543e42bbf4d773a89cffd5cf9732cc713e45aa0))
* 同步 PRD 的 BMI 配色、趋势目标线与目标日期 ([c5a264b](https://github.com/bosens-China/ScaleTrack/commit/c5a264b7a79eb02cf14337b51fc73b2cabe0200f))
* 更新AGENTS文件 ([2845099](https://github.com/bosens-China/ScaleTrack/commit/2845099b22b9eac6c43b25ef6c31bd855df94250))
* 更新产品需求文档与 README ([f3fb6c1](https://github.com/bosens-China/ScaleTrack/commit/f3fb6c1a1088605e3bb5145d2b67ff2d05c62cc1))
* 简化 README 并补充 PWA 说明 ([1d6d18f](https://github.com/bosens-China/ScaleTrack/commit/1d6d18f80088c7f8cdcf0241731fb5ebe005b055))
