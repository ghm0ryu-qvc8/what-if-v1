import { type ReactNode, useState } from "react";

const mockResult = {
  divergence:
    "高考结束后的傍晚，你站在校门口，身边的人开始讨论分数、志愿、城市和未来。那一刻还没有答案，只有几条看似相近的路。你可以选择离家更远的城市，也可以选择稳妥的专业，或者顺着别人眼中普通但安全的方向走下去。人生就是从这里开始分流的。",
  reality: [
    {
      stage: "志愿填报",
      text: "填志愿那晚，餐桌上摊着招生简章。父母把离家近的学校一所所圈出来，你也没有反对。那个选择让家里松了一口气，也让你的未来从一开始就靠近熟悉的地方。",
    },
    {
      stage: "大学初期",
      text: "大学报到那天，父母陪你来到离家不远的城市。宿舍楼不新，但一切都让人安心。你很快适应了生活，也很快学会按照既定节奏往前走。",
    },
    {
      stage: "第一份工作",
      text: "第一份工作在一栋普通写字楼里。工位靠窗，午饭常去楼下固定那家店。工资不高但准时到账，生活开始稳定下来，也少了一些突然转弯的可能。",
    },
    {
      stage: "后来",
      text: "后来，你熟悉了这座城市的路，也熟悉了自己的日程。周末回家吃饭很方便，很多事都被照顾得妥帖。只是偶尔路过车站，会想起那些没有出发的远方。",
    },
  ],
  alternativeLife: [
    {
      stage: "重新选择",
      text: "你把志愿填向了很远的城市。确认提交后，房间安静了一会儿。父母没有立刻说话，你也不知道这个决定会带来什么，只觉得准考证边角被自己捏得发皱。",
    },
    {
      stage: "大学初期",
      text: "火车开了很久。你第一次去那么远的城市。方言、天气、校园和宿舍里的陌生人都让你兴奋，也让你在夜里突然想家，盯着手机却不知道该说什么。",
    },
    {
      stage: "第一份工作",
      text: "第一份工作没有固定答案。你跟着项目熬夜，改过很多版方案，也在深夜的便利店吃过晚饭。机会确实更多，但每一次机会都带着压力和没人兜底的代价。",
    },
    {
      stage: "后来",
      text: "后来，你换过城市，也换过几次方向。你见过更大的世界，手机里存着很多陌生街道的照片。只是搬家时收拾行李，也会羡慕那些一直留在原地的人。",
    },
  ],
  causalVariables: [
    {
      name: "独立面对问题的能力",
      strength: "",
      tag: "最强影响变量",
      description:
        "真正改变你的，可能不是那座城市。",
      hiddenVariable: "自我处理能力",
      hiddenDescription:
        "你开始发现，生活里的问题不一定要等别人安排，也可以由自己拆解。",
      chain: [
        "高考离家",
        "【隐藏变量】自我处理能力",
        "人生主动性增强",
      ],
      discovery:
        "后来真正影响你的，可能是你在新选择面前，更早开始相信自己能处理不确定。",
    },
    {
      name: "你与家人的相处方式",
      strength: "",
      tag: "长期关系变量",
      description:
        "距离改变的，可能不是亲情，而是关系里的边界。",
      hiddenVariable: "关系边界",
      hiddenDescription:
        "你开始发现，父母的爱与自己的选择，并不是同一件事。",
      chain: [
        "离开熟悉家庭半径",
        "【隐藏变量】关系边界",
        "重大选择开始听见自己的声音",
      ],
      discovery:
        "改变你的不是离家。\n而是父母第一次无法替你完成判断。",
    },
    {
      name: "面对未知的勇气",
      strength: "",
      tag: "选择方式变量",
      description:
        "你第一次面对不确定，也许改变了之后每一次选择。",
      hiddenVariable: "风险校准能力",
      hiddenDescription:
        "你开始发现，不确定并不等于失控，有些风险可以被一步步处理。",
      chain: [
        "选择不确定城市和专业",
        "【隐藏变量】风险校准能力",
        "之后更敢接近非标准机会",
      ],
      discovery:
        "改变你的不是冒险成功。\n而是你发现风险并不会一次性吞没你。",
    },
    {
      name: "你接触到的人",
      strength: "",
      tag: "机会流动变量",
      description:
        "学校之外，更重要的是信息最先流向谁。",
      hiddenVariable: "信息入口",
      hiddenDescription:
        "你开始进入一个信息更早流动的地方，机会常常先以闲聊和转发出现。",
      chain: [
        "进入更远的校园",
        "【隐藏变量】信息入口",
        "第一份工作路径被重新塑形",
      ],
      discovery:
        "改变你的不是学校本身。\n而是谁更早把机会带到你面前。",
    },
    {
      name: "别人如何认识你",
      strength: "",
      tag: "延迟生效变量",
      description:
        "有些标签不是你主动选择的，却会影响别人如何理解你。",
      hiddenVariable: "外部识别方式",
      hiddenDescription:
        "别人会从你的城市、专业和第一段经历里推断你是谁，并据此分配机会。",
      chain: [
        "志愿选择形成早期履历线索",
        "【隐藏变量】外部识别方式",
        "职业身份被逐渐固定",
      ],
      discovery:
        "改变你的不是某个头衔。\n而是别人开始用某种方式识别你。",
    },
  ],
  hiddenCausalNodes: [
    {
      title: "自我效能感",
      event: "第一次在陌生城市生病。",
      variable: "主动求助能力。",
      chain: [
        "独自生病",
        "被迫向同学求助",
        "形成开放社交习惯",
        "更容易获得外部帮助",
        "职业机会增加",
      ],
      discovery:
        "真正影响后来的，不是资源突然变多，而是生病那天你第一次发现：求助也可以是一种能力。",
    },
    {
      title: "安全感来源",
      event: "报到第一周，你没有把想家告诉父母。",
      variable: "安全感从外部照顾转向自我安顿。",
      chain: [
        "夜里反复想家",
        "选择先自己处理情绪",
        "建立固定作息和小范围关系",
        "安全感不再完全依赖家庭",
        "后续面对变化时恢复更快",
      ],
      discovery:
        "让你变稳的不是选对了更安全的路，而是你学会了在陌生环境里制造一个可依靠的小秩序。",
    },
    {
      title: "信息密度",
      event: "一次普通的社团分享会上，学长提到一个你从没听过的行业。",
      variable: "高密度信息环境。",
      chain: [
        "偶然听到陌生行业",
        "开始关注课程之外的信息",
        "加入相关社群和实习群",
        "比同龄人更早看到岗位变化",
        "第一份工作选择范围扩大",
      ],
      discovery:
        "改变路径的不是某个突然出现的贵人，而是信息密度长期提高，让你提前看见了别人还没命名的机会。",
    },
    {
      title: "关系边界",
      event: "父母希望你毕业后回家，你第一次没有立刻答应。",
      variable: "亲密关系中的决策边界。",
      chain: [
        "家庭提出稳定期待",
        "你延迟回应而不是顺从",
        "开始解释自己的判断",
        "关系经历短暂紧张",
        "此后重大选择更少被默认替你决定",
      ],
      discovery:
        "真正改变你的不是有没有回家，而是你第一次让亲密关系接受：爱你的人也不能自动替你决定。",
    },
    {
      title: "职业身份认同",
      event: "第一份实习里，你被安排做一件没人想做的基础工作。",
      variable: "对自己职业角色的理解。",
      chain: [
        "重复整理资料和数据",
        "发现自己能看出问题模式",
        "被主管记住为可靠的人",
        "获得更复杂的项目机会",
        "别人开始把你从学生看作可托付的人",
      ],
      discovery:
        "真正打开职业入口的不是那份实习名称，而是一次基础任务让别人把你从“学生”重新归类为“可托付的人”。",
    },
  ],
  mechanismChain: [
    "城市迁移机制",
    "独立面对问题的能力变化",
    "面对未知的勇气变化",
    "你接触到的人变化",
    "第一份工作路径变化",
  ],
  fateMirror: [
    {
      level: "第一层：解释",
      text: "你以为你选择了一座城市。\n实际上你选择了第一次独自处理世界的时间。",
    },
    {
      level: "第二层：反转",
      text: "你以为远方改变了你。\n实际上是边界、信息和求助方式改变了你。",
    },
    {
      level: "第三层：真相",
      text: "真正改变命运的，往往不是那个选择。\n而是选择之后，被悄悄改写的隐藏变量。",
    },
  ],
};

const seedExamples = [
  "毕业那年，我没有去另一个城市的面试。那天雨很大，我站在公交站，把确认短信删掉了。后来每次看到那个城市的招聘信息，都会想如果当时去了会怎样。",
  "父亲生病那段时间，我放弃了一个外派机会。家里人都说我做得对，但几年后同事陆续升职，我开始分不清自己是在遗憾机会，还是遗憾当时没有别的选择。",
  "有一次朋友邀请我一起创业，我说再等等。后来他们真的做起来了，我们的关系也慢慢变远。我并不确定自己适合那条路，但那个晚上我一直记得。",
];

type Page = "mode" | "loading" | "result" | "error";
type StoppedStoryState = "00A" | "00B" | "00C" | "00D";
type ActiveStoryState = "S1" | "S2" | "S3";
type StoryState = StoppedStoryState | ActiveStoryState;
type InvestigationResult = {
  status: StoryState;
  statusReason: string;
  caseType?: string;
  loss?: string;
  lastingImpact?: string;
  question?: string;
  mechanism?: string;
  reversal?: string;
};
const investigableStatuses: ActiveStoryState[] = ["S1", "S2", "S3"];
const stoppedStatuses: StoppedStoryState[] = ["00A", "00B", "00C", "00D"];
const storyStateLabels: Record<StoryState, string> = {
  "00A": "历史感慨类（停止办案）",
  "00B": "已闭环故事（停止办案）",
  "00C": "文化审美类（停止办案）",
  "00D": "生活趣事类（停止办案）",
  S1: "可立案",
  S2: "情绪主导",
  S3: "已接近答案",
};
type TimelineItem = {
  stage: string;
  text: string;
};
type CausalVariable = {
  name: string;
  strength: string;
  tag: string;
  description: string;
  hiddenVariable: string;
  hiddenDescription: string;
  chain: string[];
  discovery: string;
};
type HiddenCausalNode = {
  title: string;
  event: string;
  variable: string;
  chain: string[];
  discovery: string;
};
type MainFeeling =
  | "被理解"
  | "被发现"
  | "被安慰"
  | "被提醒"
  | "没感觉"
  | "看不懂"
  | "其他";
type FeedbackFormState = {
  accuracyScore: string;
  stoppedSentence: string;
  touchedSentence: string;
  mainFeeling: MainFeeling | "";
  otherFeelingText: string;
  recommendScore: string;
  continueInvestigating: "" | "yes" | "no" | "maybe";
  freeText: string;
};

export function App() {
  const [page, setPage] = useState<Page>("mode");
  const [story, setStory] = useState("");
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function startInvestigation() {
    const trimmedStory = story.trim();

    if (!trimmedStory) {
      setErrorMessage("请先写下那个时刻。");
      setPage("error");
      return;
    }

    setErrorMessage("");
    setResult(null);
    setPage("loading");

    try {
      const response = await fetch("/.netlify/functions/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ story: trimmedStory }),
      });

      if (!response.ok) {
        throw new Error("Investigation failed");
      }

      const data = (await response.json()) as InvestigationResult;

      if (!isValidInvestigationResult(data)) {
        throw new Error("Invalid investigation result");
      }

      setResult(normalizeInvestigationResult(data));
      setPage("result");
    } catch {
      setErrorMessage("调查失败，请稍后再试。");
      setPage("error");
    }
  }

  if (page === "result") {
    return result ? <ResultPage result={result} /> : null;
  }

  if (page === "loading") {
    return (
      <main className="page">
        <section className="home-panel chat-home" aria-label="调查进行中">
          <header className="chat-hero">
            <h1>What If?</h1>
            <p className="lead-question">调查员正在整理证词……</p>
          </header>
        </section>
      </main>
    );
  }

  if (page === "error") {
    return (
      <main className="page">
        <section className="home-panel chat-home" aria-label="调查失败">
          <header className="chat-hero">
            <h1>What If?</h1>
            <p className="lead-question">{errorMessage}</p>
          </header>
          <button type="button" onClick={() => setPage("mode")}>
            重新填写
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="home-panel chat-home" aria-label="故事输入入口">
        <header className="chat-hero">
          <h1>What If?</h1>
          <p className="lead-question">你有一个一直放不下的选择吗？</p>
          <p className="chat-subtitle">
            写下那个时刻。
            <br />
            每个遗憾背后，
            <br />
            都藏着一个一直没有被回答的问题。
            <br />
            我不会推演另一种人生。
            <br />
            我会重新调查，
            <br />
            那件事究竟改变了什么。
          </p>
        </header>

        <section className="story-entry" aria-label="输入你的故事">
          <textarea
            aria-label="写下你的故事"
            value={story}
            onChange={(event: any) => setStory(event.target.value)}
            placeholder={
              "例如：\n高考那年，我本来可以去外地读书，但最后留在了本地。\n这些年我一直在想，如果当初离开，会不会完全不一样。"
            }
          />
          <button type="button" onClick={startInvestigation}>
            开始看看
          </button>
          <div className="prompt-hints" aria-label="示例提示">
            <p>可以写一个选择、一段遗憾，或一个你总会想起的转折点。</p>
            <p>不需要写得完整，只要从那个时刻开始。</p>
          </div>
        </section>

        <p className="test-note">
          当前为 AI Beta 测试版，结果由 What If? 调查员生成，仅用于体验验证。
        </p>
      </section>
    </main>
  );
}

function isValidInvestigationResult(data: InvestigationResult) {
  if (!data.status || !data.statusReason) {
    return false;
  }

  if (!isStoryState(data.status)) {
    return false;
  }

  if (isActiveStoryState(data.status)) {
    return Boolean(
      data.loss &&
        data.lastingImpact &&
        data.question &&
        data.mechanism &&
        data.reversal,
    );
  }

  return isStoppedStoryState(data.status);
}

function isStoryState(status: string): status is StoryState {
  return status in storyStateLabels;
}

function isActiveStoryState(status: StoryState): status is ActiveStoryState {
  return investigableStatuses.some((item) => item === status);
}

function isStoppedStoryState(status: StoryState): status is StoppedStoryState {
  return stoppedStatuses.some((item) => item === status);
}

function normalizeInvestigationResult(data: InvestigationResult) {
  if (isActiveStoryState(data.status)) {
    return data;
  }

  return data;
}

function ResultPage({ result }: { result: InvestigationResult }) {
  return (
    <main className="page">
      <section className="result-panel" aria-label="隐藏因果发现结果">
        <FateMirror result={result} />
        <FeedbackForm result={result} />
      </section>
    </main>
  );
}

function CausalVariables({ items }: { items: CausalVariable[] }) {
  const [opened, setOpened] = useState<string[]>([]);

  function toggleVariable(name: string) {
    setOpened((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  return (
    <section className="result-section causal-variables-section" id="reasons">
      <h2>真正改变你的，可能是</h2>
      <p className="result-caption">藏在选择背后的具体能力</p>
      <p className="section-subtitle">点击卡片，看看它怎样影响后来的生活。</p>
      <div className="variable-grid">
        {items.map((item) => {
          const isOpen = opened.includes(item.name);

          return (
            <button
              className={`variable-card${isOpen ? " is-open" : ""}`}
              key={item.name}
              type="button"
              aria-expanded={isOpen}
              style={
                isOpen
                  ? {
                      backgroundColor: "#f4eadc",
                      borderColor: "#8b6f57",
                    }
                  : undefined
              }
              onClick={() => toggleVariable(item.name)}
            >
              <span className="variable-card-header">
                <span>{item.name}</span>
                {item.strength && (
                  <span className="variable-strength">{item.strength}</span>
                )}
              </span>
              <span className="variable-tag">{item.tag}</span>
              <span className="variable-description">{item.description}</span>
              {isOpen && (
                <span className="variable-expanded">
                  <span className="hidden-variable-block">
                    <span className="hidden-variable-rule" aria-hidden="true" />
                    <span className="hidden-variable-label">隐藏变量</span>
                    <span className="hidden-variable-name">
                      {item.hiddenVariable}
                    </span>
                    <span className="hidden-variable-description">
                      {item.hiddenDescription}
                    </span>
                    <span className="hidden-variable-rule" aria-hidden="true" />
                  </span>
                  <span className="variable-chain">
                    <span className="variable-chain-label">因果链</span>
                    {item.chain.map((step, index) =>
                      step.startsWith("【隐藏变量】") ? (
                        <span className="chain-step chain-step-variable" key={step}>
                          {item.hiddenVariable}
                          {index < item.chain.length - 1 && (
                            <span className="chain-arrow">↓</span>
                          )}
                        </span>
                      ) : (
                        <span className="chain-step" key={step}>
                          {step}
                          {index < item.chain.length - 1 && (
                            <span className="chain-arrow">↓</span>
                          )}
                        </span>
                      ),
                    )}
                  </span>
                  <span className="variable-discovery">
                    <span>反直觉发现</span>
                    <strong>{item.discovery}</strong>
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MinimalWhyPath() {
  const steps = [
    "证据1：填志愿那晚，家人把离家近的学校一所所圈出来",
    "为什么重要：第一次把重大选择交给熟悉答案",
    "证据2：第一次生病，你等到了家人的照顾，没有向陌生人开口",
    "为什么重要：第一次没有向陌生人求助",
  ];

  return (
    <section className="result-section minimal-path-section" id="why-path">
      <h2>调查记录</h2>
      <p className="result-caption">调查员找到的关键证据</p>
      <div className="minimal-path" aria-label="极简因果路径">
        {steps.map((step, index) => (
          <div className="minimal-path-step" key={step}>
            <span>{step}</span>
            {index < steps.length - 1 && <span className="chain-arrow">↓</span>}
          </div>
        ))}
      </div>
      <details className="reason-details specific-events">
        <summary>展开具体事件</summary>
        <div className="brief-reason-list">
          <div className="brief-reason">
            <p>第一次生病</p>
            <p>你很快等到了家人的照顾，也少了一次向陌生人开口的机会。</p>
          </div>
          <div className="brief-reason">
            <p>第一次想家</p>
            <p>你离家不远，想家的情绪很快被一次周末回家冲淡。</p>
          </div>
          <div className="brief-reason">
            <p>第一次接触陌生行业</p>
            <p>那次分享会你没有去，后来才发现有些机会最早只出现在闲聊里。</p>
          </div>
        </div>
      </details>
    </section>
  );
}

function TimelineSection({
  title,
  caption,
  items,
}: {
  title: string;
  caption: string;
  items: TimelineItem[];
}) {
  return (
    <section className="result-section">
      <h2>{title}</h2>
      <p className="result-caption">{caption}</p>
      <ol className="timeline">
        {items.map((item) => (
          <li className="timeline-item" key={`${title}-${item.stage}`}>
            <span className="timeline-year">{item.stage}</span>
            <p>{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ResultSection({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <section className="result-section">
      <h2>{title}</h2>
      <p className="result-caption">{caption}</p>
      <p>{children}</p>
    </section>
  );
}

function HiddenCausalNodes({
  items: _items,
}: {
  items: HiddenCausalNode[];
}) {
  const reasons = [
    {
      event: "第一次在陌生城市生病",
      variable: "主动求助能力",
      result: "更容易获得外部帮助",
    },
    {
      event: "报到第一周没有把想家告诉父母",
      variable: "自己安顿情绪",
      result: "后来面对变化时恢复更快",
    },
    {
      event: "第一次听见陌生行业的名字",
      variable: "更早接触新信息",
      result: "第一份工作的选择变多",
    },
  ];

  return (
    <section className="result-section hidden-causal-section">
      <details className="reason-details more-reasons">
        <summary>展开具体事件</summary>
        <div className="brief-reason-list">
          {reasons.map((reason) => (
            <div className="brief-reason" key={reason.event}>
              <p>{reason.event}</p>
              <p>{reason.variable}</p>
              <p>{reason.result}</p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

function NodeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="node-block">
      <span className="node-label">{label}</span>
      <p>{value}</p>
    </div>
  );
}

function MechanismChain({ items }: { items: string[] }) {
  return (
    <section className="result-section mechanism-section">
      <h2>连锁反应</h2>
      <p className="result-caption">一个选择如何一步步影响后来的人生</p>
      <details className="reason-details">
        <summary>展开连锁反应</summary>
        <div className="mechanism-chain" aria-label="连锁反应">
          {items.map((item, index) => (
            <div className="mechanism-step" key={item}>
              <span>{item}</span>
              {index < items.length - 1 && <span className="chain-arrow">↓</span>}
            </div>
          ))}
        </div>
        <p className="mechanism-note">
          这些机制不是并列发生的。一个变量被改变后，会继续触发、放大或削弱另一个变量，最后改变你进入世界的方式。
        </p>
      </details>
    </section>
  );
}

function FateMirror({ result }: { result: InvestigationResult }) {
  if (isStoppedStoryState(result.status)) {
    return (
      <section className="result-section stopped-result-section">
        <div className="stopped-result-card">
          <span className="stopped-result-label">这次不继续调查</span>
          <h2>这个故事已经不需要被拆解。</h2>
          <p>{result.statusReason}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="result-story">
      <section className="result-section truth-hero-section">
        <div className="truth-card">
          <span className="truth-label">被忽略的真相</span>
          <p className="truth-statement">{result.reversal}</p>
        </div>
      </section>

      <article className="evidence-item evidence-loss">
        <span>真正失去</span>
        <p>{result.loss}</p>
      </article>

      <article className="evidence-item evidence-impact">
        <span>持续影响</span>
        <p>{result.lastingImpact}</p>
      </article>

      <article className="evidence-item evidence-question">
        <span>那个一直没有被回答的问题</span>
        <p>{result.question}</p>
      </article>
    </div>
  );
}

function FeedbackForm({ result }: { result: InvestigationResult }) {
  const [form, setForm] = useState<FeedbackFormState>({
    accuracyScore: "",
    stoppedSentence: "",
    touchedSentence: "",
    mainFeeling: "",
    otherFeelingText: "",
    recommendScore: "5",
    continueInvestigating: "",
    freeText: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof FeedbackFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "mainFeeling" && value !== "其他"
        ? { otherFeelingText: "" }
        : {}),
    }));
  }

  function submitFeedback(event: any) {
    event.preventDefault();

    if (submitted || !form.accuracyScore || !form.stoppedSentence || !form.mainFeeling) {
      return;
    }

    const feedback = {
      caseId: `case-${Date.now()}`,
      storyState: result.status,
      matchedMechanism: isActiveStoryState(result.status) ? result.mechanism || "" : "",
      accuracyScore: Number(form.accuracyScore),
      stoppedSentence: form.stoppedSentence,
      touchedSentence: form.touchedSentence.trim(),
      mainFeeling: form.mainFeeling,
      otherFeelingText: form.mainFeeling === "其他" ? form.otherFeelingText.trim() : "",
      recommendScore: Number(form.recommendScore),
      continueInvestigating: form.continueInvestigating,
      freeText: form.freeText.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log("[What If Feedback V1.1]", feedback);
    setSubmitted(true);
  }

  return (
    <details className="feedback-panel">
      <summary>这份调查对你有帮助吗？</summary>
      {submitted ? (
        <p className="feedback-thanks">感谢参与 What If? 调查。</p>
      ) : (
        <form className="feedback-form" onSubmit={submitFeedback}>
          <fieldset>
            <legend>准确度评分</legend>
            <div className="feedback-options feedback-scale">
              {[
                ["1", "完全不准"],
                ["2", "有一点像"],
                ["3", "一半准确"],
                ["4", "大部分准确"],
                ["5", "非常准确"],
              ].map(([value, label]) => (
                <label key={value}>
                  <input
                    checked={form.accuracyScore === value}
                    name="accuracyScore"
                    onChange={() => updateField("accuracyScore", value)}
                    type="radio"
                    value={value}
                  />
                  <span>{value} {label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>有没有一句话让你停下来想了一会儿？</legend>
            <div className="feedback-options">
              {["有", "没有"].map((value) => (
                <label key={value}>
                  <input
                    checked={form.stoppedSentence === value}
                    name="stoppedSentence"
                    onChange={() => updateField("stoppedSentence", value)}
                    type="radio"
                    value={value}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="feedback-field">
            <span>哪一句最让你记住？</span>
            <textarea
              onChange={(event: any) => updateField("touchedSentence", event.target.value)}
              placeholder="可选"
              value={form.touchedSentence}
            />
          </label>

          <fieldset>
            <legend>看完后最大的感受</legend>
            <div className="feedback-options feedback-grid">
              {["被理解", "被发现", "被安慰", "被提醒", "没感觉", "看不懂", "其他"].map(
                (value) => (
                  <label key={value}>
                    <input
                      checked={form.mainFeeling === value}
                      name="mainFeeling"
                      onChange={() => updateField("mainFeeling", value)}
                      type="radio"
                      value={value}
                    />
                    <span>{value}</span>
                  </label>
                ),
              )}
            </div>
          </fieldset>

          {form.mainFeeling === "其他" && (
            <label className="feedback-field">
              <span>其他感受</span>
              <input
                onChange={(event: any) => updateField("otherFeelingText", event.target.value)}
                type="text"
                value={form.otherFeelingText}
              />
            </label>
          )}

          <label className="feedback-field">
            <span>你愿意把 What If? 推荐给朋友吗？</span>
            <span className="feedback-helper">
              0 = 完全不会推荐
              <br />
              10 = 一定会推荐
              <br />
              当前评分：{form.recommendScore}
            </span>
            <input
              max="10"
              min="0"
              onChange={(event: any) => updateField("recommendScore", event.target.value)}
              type="range"
              value={form.recommendScore}
            />
          </label>

          <fieldset>
            <legend>你还愿意继续调查另一个故事吗？</legend>
            <div className="feedback-options">
              {[
                ["yes", "愿意"],
                ["no", "不愿意"],
                ["maybe", "还不确定"],
              ].map(([value, label]) => (
                <label key={value}>
                  <input
                    checked={form.continueInvestigating === value}
                    name="continueInvestigating"
                    onChange={() => updateField("continueInvestigating", value)}
                    type="radio"
                    value={value}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="feedback-field">
            <span>自由留言</span>
            <textarea
              onChange={(event: any) => updateField("freeText", event.target.value)}
              placeholder="可选"
              value={form.freeText}
            />
          </label>

          <button
            disabled={!form.accuracyScore || !form.stoppedSentence || !form.mainFeeling}
            type="submit"
          >
            完成反馈
          </button>
        </form>
      )}
    </details>
  );
}
