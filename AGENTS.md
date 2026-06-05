# Agents 参考指南

产品文档可以查考 @docs/prd.md 文件查看，项目的结构和信息可以查考 @README.md 文件查看

## 要求

- 注释为中文，重要模块添加注释
- 可以使用别名，具体查看 @atsconfig.app.json
- 样式以unocss为主
- 尽量复用 @package.json 依赖，如果需要大量手写代码，考虑查找是否有相关的npm包，避免重复造轮子
- h5为主，需要考虑dark和light模式
- 修改后运行eslint和ts的校验
- React Compiler（babel-plugin-react-compiler）已经启用，注意写法
- 重要模块请添加测试用例，测试框架使用vitest
- 功能和界面，确保是符合中文用户的使用习惯
