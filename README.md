# Rideshare UI Kit - React 高保真复刻

**Figma 学习 004 - 参考 Rideshare UI Kit**

这是一个基于 Figma Rideshare UI Kit 进行高保真复刻的学习项目，使用 React + TypeScript + Vite 技术栈完成。

项目通过 Figma MCP 工具提取设计信息，并以极高的视觉还原度实现了移动端 UI 组件和完整交互流程。

- 在线演示：https://xiaoqianran.github.io/figma-004/
- 仓库地址：https://github.com/xiaoqianran/figma-004

---

## 项目简介

本项目是对 Figma 中 **Rideshare UI Kit** 的完整复刻，目标是练习「从设计稿到高质量前端代码」的转化能力。

主要包含两种使用模式：

- **Gallery 模式**：独立预览所有屏幕（适合组件级学习）
- **Full App Flow 模式**：完整的 App 交互流程（支持全局状态、底部导航、真实用户旅程）

项目内所有屏幕均基于 Figma 原始设计进行像素级还原，并添加了丰富的微交互和状态管理。

---

## 主要功能亮点

- 高度还原的 iPhone 14 Pro 设备壳（含 Dynamic Island + Home Indicator）
- 完整的用户流程：Splash → 登录/注册 → Home → 目的地选择 → 选车 → 支付 → 实时跟踪 → 评价
- 全局状态管理（BookingContext），支持真实的多步交互
- 丰富的动画与反馈：Framer Motion 转场、Toast 提示、加载遮罩、按钮按压效果
- 设计系统（Design System）：Button、Input、Card、StatusBar、TopBar、RideCard 等可复用组件
- 支付方式管理、通知开关、主题切换等功能页面
- 支持 Google / Facebook 一键直接登录（模拟）
- 新增：Ride History（带快速重订）、更丰富的 Home 地图交互（可点击热点 + 最近目的地 + 活跃乘车横幅）、实时 ETA 模拟、评分页动态小费预设
- 通知偏好、主题持久化在多个页面实时生效

---

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion（动画）
- Lucide React（图标）
- Vitest + React Testing Library（测试）
- ESLint + Prettier（代码规范）

---

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 即可查看。

### 常用命令

| 命令                    | 说明                          |
|-------------------------|-------------------------------|
| `npm run dev`           | 启动开发服务器                |
| `npm run build`         | 生产环境构建                  |
| `npm run preview`       | 本地预览生产构建              |
| `npm run lint`          | 代码检查                      |
| `npm run lint:fix`      | 自动修复 lint 问题            |
| `npm run format`        | 使用 Prettier 格式化代码      |
| `npm run test`          | 运行测试                      |
| `npm run typecheck`     | TypeScript 类型检查           |
| `npm run ci:verify`     | CI 本地全量验证（lint+type+test+build） |

---

## GitHub Pages 自动部署

本项目已配置 GitHub Actions，推送 `main` 分支后会自动部署到 GitHub Pages。

- 部署地址：https://xiaoqianran.github.io/figma-004/
- 部署流程文件：`.github/workflows/deploy.yml`
- **质量门禁**：部署前自动执行 `lint`、`typecheck`、`test` 和 `build`，失败即阻断，保护线上可用性。
- 采用 `peaceiris/actions-gh-pages` + `.nojekyll` + SPA `404.html` 回退，部署更稳定可靠。

本地一键验证（与 CI 一致）：
```bash
npm run ci:verify
```

---

## 已实现的主要屏幕

- Splash（深色/浅色）
- 登录 / 注册页（含表单校验、社交登录）
- Home（地图占位 + 快捷入口 + 车型选择）
- 目的地选择页
- 车辆结果列表（多种样式）
- 订单确认页
- 支付添加页（深色/浅色）+ 扫码支付页
- 实时行程跟踪页（支持手动控制状态）
- 评价与打赏页（含数字键盘）
- 消息页、个人资料页、设置页、礼品码页、Ride History（含重订）等
- 完整 Gallery 模式已覆盖全部核心屏幕（含 BookingConfirm、Tracking、Profile、History 等）

---

## 项目结构

```
src/
├── App.tsx                 # 入口，包含 Gallery 和 Full-Flow 两种模式
├── components/
│   ├── PhoneFrame.tsx      # 手机外壳 + Toast + Overlay
│   ├── RideshareApp.tsx    # 完整 App 流程编排
│   ├── ui/                 # 设计系统组件
│   └── ...
├── context/
│   └── BookingContext.tsx  # 全局状态管理
├── screens/                # 所有页面组件
└── ...
```

---

## 关于本项目

**Figma 学习 004 - 参考 Rideshare UI Kit**

本项目是我在学习 Figma 转代码过程中的第 004 个练习案例，目标是：

- 提升从设计稿中提取信息的能力
- 练习使用设计系统构建可维护的前端代码
- 实现接近真实 App 的完整交互体验

项目使用了 Figma MCP 工具辅助提取设计信息，力求在视觉和交互上达到高保真还原。

---

## License

MIT
