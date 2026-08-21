# CPQ-35 双人沟通模式问卷 WebUI

这是一个静态、local-first 的 CPQ-35 双人作答界面。核心计分采用 Crenshaw 等（2017）的 revised scoring；ECR-R、DCI-37、CSI-32、Sex Sub、RFS-12、情感观察和纵向分析均保持为独立模块。

## 当前实现

- CPQ-35 完整结构：问题出现时 4 题、讨论问题时 18 题、讨论结束后 13 题。
- 1（非常不可能）到 9（非常可能）的九点作答尺度。
- 自我／伴侣方向题面，A、B 使用同一套 35 题分别作答。
- 英文题面与中文对照同时显示。
- 本地顺序锁定：A 提交后才能进入 B；双方提交前不显示结果。
- CPQ 作答、提交和标准结果整合在 02 页面；双方锁定后原位展开三个标准分量表，技术性报告差异折叠显示，研究性派生指标单独分组，不再设置需要跳转的独立结果标签。
- 可选 Supabase 双设备会话：启动时验证远程数据库版本；CPQ 点击后约200毫秒合并并串行保存，前台每2秒拉取双方完成数和提交状态。某量表双方提交前只共享完成数，不向一方返回另一方的题目答案或分数。
- 结果导出为 JSON。
- 双方完成后显示 0–100 的“沟通压力研究指数”：它是透明的派生描述指标，不是 CPQ 正式分量表、诊断或离婚概率。
- 预留固定期限法律离婚概率接口；没有通过独立外部验证并人工批准的模型配置时，页面只显示“不可计算”，不会伪造百分比。
- 可选宏观情感观察按状态持续时间统计；另含 SPAFF-informed 9 维整体评级。二者均不参与 CPQ 分数。
- Web Crypto 自动生成 10 位数字 PIN，并支持会话内复制；明文 PIN 不写入本地持久存储。
- ECR-R 36题双人独立作答，按官方反向键分别报告 1–7 的依恋焦虑与依恋回避连续维度。
- DCI-37 双人独立作答：中文阅读辅助为主、官方英文原文紧随其后；固定校验分量表归属与8个反向题，报告第1–35题总分、9个分量表及2个评价题。
- CSI-32 双人独立作答，按原始 0–161 计分；不把原始英文样本的筛查分界直接迁移到中国用户。
- Sex Sub 把 GMSEX、NSSS-S、PROMIS SexFS 2.0 和 KOS-18 分开呈现：分别报告整体性满意度、深入性满意度、性功能／体验域和 kink 取向，不合成总分。
- PROMIS SexFS 2.0 让每位伴侣按身体相关域选择阴道／外阴或勃起 profile；无性活动进入描述分支，不记成低功能。本站仅报告逐域原始分，正式 T 分需使用 HealthMeasures 官方计分服务或手册。
- RFS-12 以12题总分和均值补充关系意义、成长、给予与目标分享。
- 下载带匿名情侣编号、日期和时间点的本地纵向 JSON；一次上传最多200个文件、累计最多1000个时间点，在浏览器本地生成变化表。

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

PIN 生成器的浏览器测试位于 `security-utils.test.html`；SPAFF-informed 评级状态、云端未配置门控和 390px 移动端溢出检查位于 `ui-smoke.test.html`。云端请求头与数据库版本检查位于 `cloud-session.test.html`；双设备创建、加入和自动同步流程位于 `cloud-session-ui.test.html`。启动本地服务器后访问页面，看到 `PASS` 即表示相应测试通过。

研究派生指标和概率模型门控测试位于 `relationship-research.test.html`。

ECR-R 官方示例计分、DCI 授权门控／范围校验、CSI/GMSEX/NSSS-S/KOS/RFS 计分边界、PROMIS 条件分支、纵向记录验证和变化计算位于 `supplemental-model.test.html`；实际下载、多文件上传和本地趋势 UI 测试位于 `longitudinal-ui.test.html`。

## ECR-R、DCI、关系结局、Sex Sub 与本地纵向档案

ECR-R 使用量表作者公开的36个英文题面和7点评分。焦虑为第1–18题均值，反向题为9、11；回避为第19–36题均值，反向题为20、22、26、27、28、29、30、31、33、34、35、36。中文只作为未验证的阅读辅助，不应被描述为已完成中文测量等值性验证。网站不使用任意阈值把连续分数转换成四类依恋风格。

DCI 已在 `dci-config.js` 接入 Bodenmann（2008）的官方英文 DCI-37，并逐题提供本项目制作的非官方中文阅读辅助。界面以中文为主文、英文为参照；中文未经过独立双译、回译、认知访谈、测量不变性或本土常模验证，因此不是 DCI 正式中文版。原作者公开题本说明：学术、临床和研究用途可免费使用，复用时应引用原始 DCI，题本末尾并载明无需另行向 Guy Bodenmann 申请使用或复制许可。网站保留该版权与引用说明；这不等于授权任意商业再许可，也不自动使中文阅读辅助获得正式版本地位。正式中文研究仍应取得相应版本并完成或引用测量等值性证据。

CSI-32 使用 Funk 与 Rogge（2007）的32题结构和原始计分方向。Wang、Lee 与 Ma（2024）在740名中国参与者中报告了中文版的高内部一致性并检验了性别 DIF；本网站仍把自身中文措辞标为阅读辅助，因为尚未对部署文本与其补充材料逐字做独立等值性审计。GMSEX 使用5个七点双极形容词，报告1–7均值及5–35总分；RFS-12 使用12个五点评分题，报告12–60总分及1–5均值。GMSEX 与 RFS 的中文均不冒充正式中文版，且三项都不生成诊断、关系等级或离婚概率。

NSSS-S 使用12个五点评分题，报告12–60总分及1–5均值。Wang等（2023）的中文验证样本为336名中国女性，不能直接当作所有中国性别群体或情侣差异的常模；其第7题还出现了年龄相关的非一致题项信号。PROMIS SexFS 2.0 保留正式 item ID、30天回顾窗与条件分支，每人可按相关身体域选择14项阴道／外阴表或10项勃起表；实际作答数随是否有性活动而变化。项目逐域报告原始分并保留方向，不把它们相加，也不把原始分冒充 IRT T 分。KOS-18 按Wignall等（2024）的5点最终版报告18–90总分，并给出五因子描述均值；高分只表示更多 kink 参与／认同，不是病理、危险、同意质量或伴侣兼容性。三者中文均为非官方阅读辅助。

计分器固定校验正式题号与分量表归属，拒绝发生漂移的配置。第7、10、11、15、22、25、26、27题反向计分；总分为第1–35题之和（35–175），第36、37题分别记录满意度和效果评价但不计入总分。双方提交后显示压力沟通、支持性、委托式、消极和共同应对分量表；不把 DCI 分数转换为诊断或关系结局概率。来源：[Bodenmann (2008), DCI-37 reproduced questionnaire](https://www.researchgate.net/profile/Guy-Bodenmann/publication/323285418_Dyadic_Coping_Inventory/links/5a901eeea6fdccecff00ce52/Dyadic-Coping-Inventory.pdf)。

纵向导出使用 `cpq-couple-longitudinal/1.0` 架构，保留测量版本、双方原始答案、分量表结果、观察数据、匿名情侣编号、ISO日期和时间点标签。上传分析不使用网络请求，也不写入浏览器永久存储；刷新页面会清空已载入档案，原始下载文件仍由用户自行保管。下载文件包含敏感原始答案且未加密，应保存在受控设备或加密磁盘中。变化值只是首末有效时间点的描述差，不代表统计显著性、临床改善或关系结局。

## 沟通压力研究指数与离婚模型

沟通压力指数只使用双方完成后的三个 CPQ 标准分量表。先把双方建设性沟通均值反向标准化为“低建设性沟通”，再把双方四个要求／回避方向分数的均值标准化，最后等权平均：

```text
低建设性沟通 = 100 × (81 − 双方 CC 均值) / 72
要求／回避强度 = 100 × (四个 SD/PW、PD/SW 分数均值 − 7) / 56
沟通压力研究指数 = (低建设性沟通 + 要求／回避强度) / 2
```

该指数的 0 和 100 只是理论量尺端点，没有常模、临床截点或已验证的结局含义。

真实离婚概率管线位于 [`research/`](research/README.md)。它要求每对伴侣一行、明确的固定随访期限、法律离婚二元结局、按情侣分组的数据划分、校准集和独立外部验证。训练脚本始终输出 `deploymentApproved: false`；研究负责人审核样本、性能、公平性和用途后才可手工批准。网站运行时还会检查结局、期限、外部验证状态、标准化参数、系数和校准参数，任何一项缺失都保持“不可计算”。示例配置文件仅展示结构，不含虚构系数。

## Supabase 双设备模式

GitHub Pages 只托管静态文件，不能单独承担跨设备数据保存。`supabase-config.js` 为空时，网站会明确禁用“创建／加入会话”，而不会把不能跨设备的本地模式伪装成云会话。

1. 创建一个 Supabase 项目。
2. 在 SQL Editor 中运行 `supabase-setup.sql`。
3. 在项目的 **Connect** 对话框或 **Settings → API Keys** 获取项目 URL 和 `sb_publishable_...` key，将其写入 `supabase-config.js`。旧版 anon JWT 仍兼容；绝不能放入 service-role 或 `sb_secret_...` key。
4. 部署站点。

从较早版本升级时需要重新运行完整的 `supabase-setup.sql`。schema v8 新增 NSSS-S、KOS-18、PROMIS SexFS profile／条件分支字段与 RPC，并保留 CSI-32、GMSEX、RFS-12 的服务器计分。数据库按固定规则重算完整答卷，不信任客户端上传的派生分数。各量表在双方提交前只同步完成题数、锁定状态和本人的草稿，不返回对方答案。

新版数据库脚本包括：

- RLS 和底层表权限撤销；浏览器只调用经过 token 校验的 RPC。
- 新版 publishable key 只通过 `apikey` 请求头发送；旧版 anon JWT 才兼容 Bearer 头。
- PIN 使用 bcrypt 哈希；旧版 SHA-256 会在成功加入时迁移。
- 6–12 位 PIN、连续失败锁定、B 角色防顶替。
- 草稿固定为 35 个题位并允许空值；正式提交必须恰好为 35 个 1–9 整数。
- CPQ 云保存使用本地优先的修订号和串行写入队列：单击立即反映在页面，旧请求不得覆盖较新的答案，静默轮询不得重建正在交互的题目节点。
- `get_couple_session` 在答案保持私密时仍返回 CPQ、ECR-R、DCI、CSI、GMSEX、NSSS-S、KOS、PROMIS、RFS 各自的完成数；锁定状态和完成度不会出现“已锁定但0题”的矛盾。
- ECR-R 草稿固定为36个题位、正式提交必须为36个 1–7 整数；DCI 支持获授权37题答案或至少一项合法正式分量表分数。
- CPQ-35、ECR-R、DCI、CSI-32、GMSEX、NSSS-S、KOS-18、PROMIS SexFS 与 RFS-12 分别门控：只有双方提交同一测量后，RPC 才向成员返回对方在该测量中的数据。
- 30 天会话到期和成员主动删除 RPC。
- 观察事件的类型、数量和字段校验。
- SPAFF-informed 评级的维度、对象与 1–10 取值校验。

这仍然是研究／教学原型，不应在未经独立安全、伦理和合规审查的情况下收集受监管的临床数据。关于关系满意度、承诺、依恋、关系不稳定、安全筛查与纵向预测的扩展建议见 [`LITERATURE_REVIEW.md`](LITERATURE_REVIEW.md)。

## GitHub Pages

工作流仅发布运行站点所需文件，不公开 SQL、测试或项目文档。推送到 `main` 后，在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

## 主要参考

Crenshaw, A. O., Christensen, A., Baucom, D. H., Epstein, N. B., & Baucom, B. R. W. (2017). Revised scoring and improved reliability for the Communication Patterns Questionnaire. *Psychological Assessment, 29*(7), 913–925. https://doi.org/10.1037/pas0000385

Joel, S., Eastwick, P. W., Allison, C. J., et al. (2020). Machine learning uncovers the most robust self-report predictors of relationship quality across 43 longitudinal couples studies. *PNAS, 117*, 19061–19071. https://doi.org/10.1073/pnas.1917036117

Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000). An item response theory analysis of self-report measures of adult attachment. *Journal of Personality and Social Psychology, 78*(2), 350–365. https://doi.org/10.1037/0022-3514.78.2.350

Gmelch, S., Bodenmann, G., Meuwly, N., Ledermann, T., Steffen-Sozinova, O., & Striegl, K. (2008). Dyadisches Coping Inventar (DCI). *Journal of Family Research, 20*(2), 185–202. https://doi.org/10.20377/jfr-264

Funk, J. L., & Rogge, R. D. (2007). Testing the ruler with item response theory: Increasing precision of measurement for relationship satisfaction with the Couples Satisfaction Index. *Journal of Family Psychology, 21*(4), 572–583. https://doi.org/10.1037/0893-3200.21.4.572

Wang, S., Lee, W.-C., & Ma, H. (2024). The Chinese version of the Couples Satisfaction Index: Psychometric assessment and differential item functioning analysis with item response theory. *SAGE Open, 14*(3). https://doi.org/10.1177/21582440241271087

Lawrance, K., & Byers, E. S. (1995). Sexual satisfaction in long-term heterosexual relationships: The Interpersonal Exchange Model of Sexual Satisfaction. *Personal Relationships, 2*(4), 267–285. https://doi.org/10.1111/j.1475-6811.1995.tb00092.x

Fowers, B. J., Laurenceau, J.-P., Penfield, R. D., Cohen, L. M., Lang, S. F., Owenz, M. B., & Pasipanodya, E. (2016). Enhancing relationship quality measurement: The development of the Relationship Flourishing Scale. *Journal of Family Psychology, 30*(8), 997–1007. https://doi.org/10.1037/fam0000263

Wang, C., Chen, E. P. H., Chan, P. H., & Štulhofer, A. (2023). Adaptation and validation of the Chinese version of the New Sexual Satisfaction Scale–Short Form in a sample of Chinese women. *Sexual Medicine, 11*(6), qfad065. https://doi.org/10.1093/sexmed/qfad065

Weinfurt, K. P., Lin, L., Bruner, D. W., et al. (2015). Development and initial validation of the PROMIS Sexual Function and Satisfaction Measures Version 2.0. *The Journal of Sexual Medicine, 12*(9), 1961–1974. https://doi.org/10.1111/jsm.12966

Wignall, L., McCormack, M., Carpino, T., Owens, R., & Barton, T. (2024). The Kink Orientation Scale: Developing and validating a measure of kink desire, practice, and identity. *The Journal of Sex Research*. https://doi.org/10.1080/00224499.2024.2387769
