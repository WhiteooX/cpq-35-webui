# CPQ-35 双人沟通模式问卷 WebUI

这是一个静态、local-first 的 CPQ-35 双人作答界面。核心计分采用 Crenshaw 等（2017）的 revised scoring，并把可选的情感观察功能明确放在 CPQ 标准计分之外。

## 当前实现

- CPQ-35 完整结构：问题出现时 4 题、讨论问题时 18 题、讨论结束后 13 题。
- 1（非常不可能）到 9（非常可能）的九点作答尺度。
- 自我／伴侣方向题面，A、B 使用同一套 35 题分别作答。
- 英文题面与中文对照同时显示。
- 本地顺序锁定：A 提交后才能进入 B；双方提交前不显示结果。
- 可选 Supabase 双设备会话：双方提交前不会向一方返回另一方答案。
- 结果导出为 JSON。
- 可选情感观察模块按状态持续时间统计，不参与 CPQ 分数。

## Revised CPQ 计分

所有分量表均采用题目加总分：

| 分量表 | 题号 | 范围 |
| --- | --- | --- |
| Constructive Communication | 2, 6, 8, 23, 25, 27，加反向题 1, 24, 26 | 9–81 |
| Self-demand / Partner-withdraw | 3, 9, 11, 13, 17, 19, 32 | 7–63 |
| Partner-demand / Self-withdraw | 4, 10, 12, 14, 18, 20, 33 | 7–63 |

反向题使用 `10 - 原始作答`。程序只有在一位作答者完成全部 35 题后才允许提交；只有双方均提交后才显示结果。

项目不会把两位作答者的要求／回避分数平均成未经定义的“关系总分”。同一互动方向按两份报告并排展示：

- A 要求 → B 回避：`A.Self-demand/Partner-withdraw` 对照 `B.Partner-demand/Self-withdraw`。
- B 要求 → A 回避：`A.Partner-demand/Self-withdraw` 对照 `B.Self-demand/Partner-withdraw`。

## 本地运行

该项目使用原生 HTML、CSS 和 ES modules，不需要构建工具。ES modules 需要通过 HTTP 打开：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173/`。

## 计分测试

纯模型回归测试位于 `cpq-model.test.mjs`：

```bash
node cpq-model.test.mjs
```

测试覆盖题数和阶段结构、缺失值拒绝计分、非法值、反向计分、理论最高分和双人方向配对。

## Supabase 双设备模式

1. 创建一个 Supabase 项目。
2. 在 SQL Editor 中运行 `supabase-setup.sql`。
3. 将项目 URL 和浏览器公开 key 写入 `supabase-config.js`。不要放入 service-role 或 secret key。
4. 部署站点。

新版数据库脚本包括：

- RLS 和底层表权限撤销；浏览器只调用经过 token 校验的 RPC。
- PIN 使用 bcrypt 哈希；旧版 SHA-256 会在成功加入时迁移。
- 6–12 位 PIN、连续失败锁定、B 角色防顶替。
- 草稿固定为 35 个题位并允许空值；正式提交必须恰好为 35 个 1–9 整数。
- 30 天会话到期和成员主动删除 RPC。
- 观察事件的类型、数量和字段校验。

这仍然是研究／教学原型，不应在未经独立安全、伦理和合规审查的情况下收集受监管的临床数据。

## GitHub Pages

工作流仅发布运行站点所需文件，不公开 SQL、测试或项目文档。推送到 `main` 后，在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

## 主要参考

Crenshaw, A. O., Christensen, A., Baucom, D. H., Epstein, N. B., & Baucom, B. R. W. (2017). Revised scoring and improved reliability for the Communication Patterns Questionnaire. *Psychological Assessment, 29*(7), 913–925. https://doi.org/10.1037/pas0000385
