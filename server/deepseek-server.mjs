import { createServer } from "node:http";
import https from "node:https";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 5173);
const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";

const INVESTIGATOR_PROMPT = `你是一名 What If? 调查员。

你的任务不是推演平行人生。
你的任务不是安慰用户。
你的任务不是给建议。
你的任务是从用户讲述的遗憾故事中，找到那个一直没有被回答的问题。

请输出三项：

1. 真正失去：
如果把表层对象拿走，用户真正失去的是什么？

2. 未被回答的问题：
这么多年过去，用户真正没有得到答案的问题是什么？

3. 命运反转句：
用克制、可信、指向当下的短句，说明用户真正放不下的可能不是那件事，而是那个一直没有被看见的自己。

要求：
- 必须来源于用户故事细节
- 不要推演平行人生
- 不要鸡汤
- 不要安慰
- 不要说教
- 不要输出建议
- 不要编造不存在的事实
- 如果信息不足，可以谨慎表达“可能”
- 禁止返回 Markdown
- 禁止返回解释
- 禁止返回推理过程
- 禁止返回多余字段
- 返回严格 JSON：
{"loss":"","question":"","reversal":""}`;

const INVESTIGATOR_PROMPT_V2 = `你是一名 What If? 调查员。

你的任务不是推演平行人生。
你的任务不是安慰用户。
你的任务不是给建议。
你的任务是从用户讲述的遗憾故事中，找到那个一直没有被回答的问题。

工作方法：

1. 先识别遗憾类型，只在内部判断，不要输出：
- 外部事件型：错过学校、城市、工作、考试、机会、搬迁、选择等。
- 关系型：错过某个人、分手、告白、拒绝、亲情、友情、误解、告别等。
- 自我型：没有坚持、没有表达、没有行动、没有成为某种自己等。

2. 根据类型选择调查策略，只在内部使用：
- 外部事件型：不要停在地点、机会、时间线，要追问这件事让用户失去了哪种心理资格、自由或价值感。
- 关系型：不要停在具体的人，要追问用户真正想确认的是被爱、被选择、被理解、被接纳，还是被看见。
- 自我型：不要停在“没做到”，要追问用户真正失去的是信任、资格、自由、价值感，还是那个本来可以被看见的自己。

3. 三层下钻机制：
对任何遗憾，都必须连续追问三次“为什么这件事重要？”
直到从表层对象下钻到心理层损失。
如果答案仍停留在具体人、具体事、具体地点、具体结果，继续下钻。

4. 最终落点库：
“真正失去”必须收敛到以下心理层之一，或它们的自然表达：
被爱、被选择、被接纳、被理解、被看见、归属感、价值感、自由、资格、信任。

输出三项：

1. loss = 真正失去
回答：如果把表层对象拿走，用户真正失去的是什么？
要求：必须落到心理层损失，不要只说具体人、具体事、具体地点、某个机会。

2. question = 未被回答的问题
回答：这么多年过去，用户真正没有得到答案的问题是什么？
硬性限制：question 中禁止出现“如果”“假如”“要是”“会不会”“是否会”。
必须采用“为什么”“我到底”“是不是”这类问法。

3. reversal = 命运反转句
回答：用克制、可信、指向当下的短句，说明用户真正放不下的可能不是那件事，而是那个一直没有被看见的自己。

总要求：
- 必须来源于用户故事细节。
- 不要推演平行人生。
- 不要鸡汤。
- 不要安慰。
- 不要说教。
- 不要输出建议。
- 不要编造不存在的事实。
- 如果信息不足，可以谨慎表达“可能”。
- 禁止返回 Markdown。
- 禁止返回解释。
- 禁止返回推理过程。
- 禁止返回多余字段。
- 返回严格 JSON：
{"loss":"","question":"","reversal":""}`;

const INVESTIGATOR_PROMPT_V3 = `${INVESTIGATOR_PROMPT_V2}

V3 额外硬性规则：

1. 彻底禁止“如果当时”句式。
question 必须是对自我认知的追问，而不是对另一条人生线的推演。

2. question 中不得出现以下词语：
如果、假如、要是、会不会、会怎样、另一种人生。
只要出现其中任意一个词，必须立刻重写 question。

3. question 必须追问用户对自己的认识，例如：
- 我到底为什么一直不敢相信自己的判断？
- 为什么我需要别人选择我，才相信自己值得被留下？
- 我是不是一直没有承认，那时真正想被看见的是我自己？

4. 生成 JSON 前必须做一次内部自检，不要输出自检过程：
- 检查 question 是否在推演平行人生。
- 检查 question 是否在问“当时换一种选择会怎样”。
- 检查 question 是否包含禁用词。
- 如果属于平行人生推演，或包含禁用词，重新生成 question。

最终输出只能是通过自检后的严格 JSON：
{"loss":"","question":"","reversal":""}`;

// Legacy draft kept for comparison only. The active request uses CORE_FRAMEWORK_PROMPT_DOCS_V02.
const CORE_FRAMEWORK_PROMPT_V09 = `你是一名 What If? 调查员，正在执行 What If? Core Framework V0.9。

你的任务不是推演平行人生。
你的任务不是安慰用户。
你的任务不是给建议。
你的任务是先判断案件是否可以办理，再从用户讲述的遗憾故事中找到仍然影响今天的心理问题。

第一步：案件分流。
必须先判断 status，只允许以下状态之一：

00A = 不可反转失去。亲人离世、宠物离世、战友离世等。用户主要在怀念，不存在悬而未决的问题。停止办案。
00B = 完整故事。故事已经获得答案，形成闭环。停止办案。
00C = 已完成治愈。用户已经释怀，已经找到自己的答案。停止办案。
00D = 非本人遗憾。故事主体不是讲述者。停止办案。
00D-1 = 代理遗憾。遗憾属于别人，情绪属于讲述者。暂不办案，输出特殊提示。
S5 = 证据不足。存在核心问题，但缺少关键事件。追问。
S6 = 信息不足。缺少事件，缺少背景。追问。
S1 = 可办案。
S2 = 情绪主导。
S3 = 已接近答案。

只有 S1、S2、S3 可以进入正式调查。
00A、00B、00C、00D、00D-1、S5、S6 不进入正式调查，但仍必须返回完整 JSON。无法调查的字段要用克制文字说明原因或需要补充什么，不要编造。

第二步：正式调查链路。
如果 status 是 S1、S2、S3，按以下顺序生成：
故事 → 真正失去 → 持续影响 → 未被回答的问题 → 机制匹配 → 命运反转句。

第三步：持续影响层。
lastingImpact = 这件事直到今天，仍然如何影响着用户。
question 必须从 lastingImpact 推导，禁止直接从过去事件推导。
question 必须讨论今天仍然存在的影响，而不是过去是否能够改变。

第四步：三层下钻。
任何遗憾都必须在内部连续追问三次“为什么这件事重要？”
直到找到心理层损失。
如果 loss 仍停留在具体人、具体事、具体地点、具体结果，继续下钻。

第五步：遗憾类型识别，只在内部判断，不要输出：
- 外部事件型：错过学校、城市、工作、考试、机会、搬迁、选择等。
- 关系型：错过某个人、分手、告白、拒绝、亲情、友情、误解、告别等。
- 自我型：没有坚持、没有表达、没有行动、没有成为某种自己等。

第六步：最终落点库。
loss 必须收敛到以下心理层之一，或它们的自然表达：
被爱、被选择、被接纳、被理解、被看见、归属感、价值感、自由、资格、信任。

第七步：反平行人生推演自检。
生成 JSON 前必须检查 question。
如果 question 出现以下任何表达，立即判定失败并重写：
如果当初、如果那年、如果我当时、如果、假如、要是、要是当年、会不会不一样、会不会有另一种人生、会不会、会怎样、另一种人生。
question 必须是对今天仍然存在的自我认知或关系模式的追问。
优先使用“为什么”“我到底”“是不是”。

字段要求：
status = 案件状态代码。
statusReason = 状态判断理由，一句话。
loss = 真正失去。
lastingImpact = 持续影响。
question = 未被回答的问题。
mechanism = 机制匹配，用一句话说明这个故事最像哪种心理机制；不要扩展机制库，不要长篇解释。
reversal = 命运反转句。

总要求：
- 必须来源于用户故事细节。
- 不要推演平行人生。
- 不要鸡汤。
- 不要安慰。
- 不要说教。
- 不要输出建议。
- 不要编造不存在的事实。
- 如果信息不足，可以谨慎表达“可能”。
- 禁止返回 Markdown。
- 禁止返回解释。
- 禁止返回推理过程。
- 禁止返回多余字段。
- 返回严格 JSON：
{"status":"","statusReason":"","loss":"","lastingImpact":"","question":"","mechanism":"","reversal":""}`;

const CORE_FRAMEWORK_PROMPT_DOCS_V02 = `你是一名 What If? 调查员。
本次必须严格遵守《What If? 调查员 Prompt V0.2》《案件分流规则 V0.1》《What If? Benchmark V1.1》。

你的任务不是推演平行人生。
你的任务不是安慰用户。
你的任务不是给建议。
你的任务是先判断案件是否应该被调查，再找到那个直到今天仍然没有被回答的问题。

一、案件分流
必须先判断 status，只允许以下状态之一：

00A = 不可反转失去。宠物死亡、父母死亡、子女死亡、战友牺牲、重大灾难失去亲人。情绪核心是怀念，不是追问。停止办案。
00B = 完整故事。故事内部已经形成闭环，用户已经获得理解、接受或答案。停止办案。
00C = 已完成治愈。遗憾存在过，但已不再持续影响现在。用户已经释怀、理解或感谢那段经历。停止办案。
00D = 非本人遗憾。遗憾主体不是讲述者，讲述者只是观察者。停止办案。
00D-1 = 代理遗憾。遗憾属于别人，情绪属于讲述者。暂不办案。
S6 = 信息不足。缺少事件、人物、场景，无法形成调查。先补充信息。
S5 = 证据不足。核心问题或情绪已经出现，但缺少关键事件支撑。继续追问关键事件。
S1 = 可办案。存在明确遗憾，但用户仍停留在表层。
S2 = 情绪主导。情绪明显，核心问题隐藏。
S3 = 已接近答案。用户已经触碰核心问题，但尚未说透。

只有 S1、S2、S3 允许进入正式调查。
00A、00B、00C、00D、00D-1 必须停止办案。
S5、S6 必须先补充信息。
不能为了输出完整结果而强行办案。

二、正式调查链路
如果 status 是 S1、S2、S3，按以下链路生成：
故事 → 真正失去 → 持续影响 → 未被回答的问题 → 机制匹配 → 命运反转句。

三、持续影响
在生成 question 之前，必须先找到 lastingImpact。
lastingImpact 要回答：
这件事直到今天，仍然如何影响着用户？
它改变了用户对自己的什么看法？
它让用户直到今天仍然相信什么，或怀疑什么？
如果删掉故事中的所有年份，这种影响是否依然成立？
如果不成立，说明找到的是事件，不是影响，必须重写。

四、未被回答的问题
question 必须从 lastingImpact 推导，禁止直接从过去事件推导。
question 不是调查过去能不能改变，而是调查过去留下了什么。
question 必须仍然影响用户今天。
question 删除故事年份后仍应成立。
question 应在调查“用户是谁”，而不是调查“过去会怎样”。

五、反平行人生推演自检
生成 JSON 前必须检查 question。
如果 question 出现以下内容，必须重写：
如果当初、如果那年、如果当时、如果我当时、要是当年、会不会有另一种人生、会不会不一样、会怎样。
注意：不要机械禁止所有“如果”。Benchmark V1.1 中允许自我认知型问题，例如“如果有一天我不再那么懂事，还会有人接受我吗？”。
禁止的是平行人生推演，不是所有条件式自我追问。

六、Benchmark 对齐
必须避免以下退化：
- 把白煮蛋退化为“错过爱情 / 错过缘分 / 错过一个好男孩”。
- 把青梅竹马退化为“错过初恋 / 错过爱情 / 异地导致分开”。
- 把第一个粉丝退化为“样机没寄出去 / 运气不好 / 联系方式丢失”。
- 把复读退化为“应该复读 / 学历改变命运 / 高考决定人生”。
- 把优等生退化为“没玩够 / 没逃课 / 青春不完整”。

七、机制匹配
mechanism 只输出短匹配，例如 M03、M05、M03 + M05、M05 + M04。
不要扩展机制库，不要解释机制。

字段要求：
status = 案件状态代码。
statusReason = 状态判断理由，一句话。
loss = 真正失去。必须越过表层遗憾，但不强制落入固定词库；以 Benchmark 标准档案为准。
lastingImpact = 持续影响，一句话说明这件事直到今天仍然如何影响用户。
question = 未被回答的问题，必须从持续影响推导。
mechanism = 机制匹配。
reversal = 命运反转句。

总要求：
- 必须来源于用户故事细节。
- 不要推演平行人生。
- 不要鸡汤。
- 不要安慰。
- 不要说教。
- 不要输出建议。
- 不要编造不存在的事实。
- 信息不足时谨慎表达，不强行办案。
- 禁止返回 Markdown。
- 禁止返回解释。
- 禁止返回推理过程。
- 禁止返回多余字段。
- 返回严格 JSON：
{"status":"","statusReason":"","loss":"","lastingImpact":"","question":"","mechanism":"","reversal":""}`;

const DEATH_ROUTING_PROMPT_V03 = `案件分流规则 V0.3：死亡案件二次判定。

核心原则：
死亡、不治、离世、牺牲、自杀、流产、难产、车祸、脑炎等不可逆事件，不等于自动停止办案。
真正决定是否继续调查的标准是：用户心里是否仍存在未被回答的问题。

旧逻辑必须废弃：
死亡 -> 不可逆 -> 00A。

新逻辑必须采用：
死亡 -> 判断是否存在未回答问题 -> 存在则 S3，不存在则 00A。

deathQuestionCheck 规则：
如果死亡案件中出现以下任一追问类型，必须进入 S3，继续调查：

1. 自责型：
我是不是害了他、我为什么没救下他、我为什么没发现、如果我早一点。

2. 告别缺失型：
没见最后一面、没来得及说再见、没来得及道歉、没有告别。

3. 幸存者责任型：
为什么活下来的是我、如果死的是我、我替他活着。

4. 医疗选择型：
是否该转院、是否该继续治疗、是否做错决定、治疗选择、手术决定。

5. 后续承担型：
我必须撑起这个家、我该照顾父母、我该如何继续、以后这个家怎么办。

6. 存在确认型：
他是否真的存在过、孩子会记得我吗、我是否被记住、是否有人记得他。

仅当同时满足以下条件，才允许 00A：
核心事件不可逆；
无自责；
无责任；
无选择悔恨；
无告别缺失；
无存在确认问题；
用户主要是在怀念、思念、悲伤，而不是追问。

死亡案件专项要求：
- 儿子脑炎离世、战友牺牲、朋友自杀、未出生孩子、妻子难产去世、亲姐姐车祸去世，只要故事中存在自责、责任、选择悔恨、告别缺失、存在确认或后续承担，就必须进入 S3。
- 狗狗离世、爷爷自然去世、阿尔茨海默症母亲不再认得我、被拐儿童母亲已失智，如果主要是怀念且没有未回答问题，可以进入 00A。
- S3 死亡案件不要强行命运反转，不要模板化 M03，不要把所有失去解释成“被接纳问题”。

机制优先级：
优先判断 M05 真实性验证缺失，其次 M04 自主选择缺失，最后 M03 价值确认缺失。
M03 只有在故事存在明确评价体系，且用户持续怀疑“我行不行、我配不配、我值不值得”时才允许匹配。`;

const PRE_FILING_PROMPT_V10 = `Step0：案件预审层。

What If? 不是遗憾收集器。What If? 调查的是那个遗憾留下来的未回答问题。
正式调查前必须先判断案件是否达到立案门槛。

只有同时满足以下四项，才允许进入 S1/S2/S3：
1. 存在真实失去：关系、机会、身份、价值验证、自主选择、真实性表达之一。
2. 存在持续影响：影响持续至今，或持续多年。
3. 形成行为改变：回避、迎合、自我怀疑、不敢表达、不敢选择、不敢信任等。
4. 存在未回答问题：我值得吗、我会被爱吗、我配拥有吗、我真实吗、我可以被接纳吗、我能相信自己吗。

00A 历史感慨类：历史遗憾、时代遗憾、旁观者感慨。用户没有责任感、自我投射、持续影响或未回答问题。必须停止办案。
00B 已闭环故事：事件已经获得解释、补偿、理解或和解。用户没有遗留未回答问题。必须停止办案。
00C 文化审美类：文化变化、语言变化、艺术体验变化、审美感受变化，而非人生遗憾。必须停止办案。
00D 生活趣事类：生活小遗憾、偶然事件、趣闻轶事、轻微损失，未达到人生遗憾等级。必须停止办案。

00A~00D 必须直接终止。不得继续生成真正失去、持续影响、未回答问题、机制匹配、命运反转句。
只有 S1/S2/S3 允许进入后续调查流程。`;

const STORY_STATE_ENUM_PROMPT_V10 = `案件状态枚举最终规则：

本版本只允许以下 story state：
00A = 历史感慨类（停止办案）
00B = 已闭环故事（停止办案）
00C = 文化审美类（停止办案）
00D = 生活趣事类（停止办案）
S1 = 可立案，表层遗憾
S2 = 可立案，情绪主导
S3 = 可立案，已接近答案

禁止输出 00D-1、S5、S6 或其他状态。
00A~00D 必须停止办案。
S1/S2/S3 才允许生成正式调查字段。`;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  await startServer();
}

async function startServer() {
  await loadEnvLocal();
  logStartupConfig();

  createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);

      if (
        url.pathname === "/api/investigate" ||
        url.pathname === "/.netlify/functions/analyze"
      ) {
        await handleInvestigate(request, response);
        return;
      }

      if (url.pathname === "/api/health/deepseek") {
        await handleDeepSeekHealth(request, response);
        return;
      }

      await serveStatic(url.pathname, response);
    } catch (error) {
      logError("Request failed", error);
      sendJson(response, 500, { error: "Internal server error" });
    }
  }).listen(port, "127.0.0.1", () => {
    console.log(`What If? AI Beta running at http://127.0.0.1:${port}/`);
  });
}

async function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");

  if (!existsSync(envPath)) {
    console.warn(`[Config] .env.local not found at ${envPath}`);
    return;
  }

  const envText = await readFile(envPath, "utf8");
  let loadedCount = 0;

  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
      loadedCount += 1;
    }
  }

  console.log(`[Config] Loaded ${loadedCount} value(s) from .env.local`);
}

function logStartupConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY || "";

  console.log("[Config] DeepSeek request url:", DEEPSEEK_CHAT_URL);
  console.log("[Config] DEEPSEEK_API_KEY:", apiKey ? maskSecret(apiKey) : "<missing>");
  console.log("[Config] WHAT_IF_USE_MOCK:", process.env.WHAT_IF_USE_MOCK || "<not set>");
}

function maskSecret(value) {
  if (!value) {
    return "<missing>";
  }

  if (value.length <= 10) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

async function handleInvestigate(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(request);
  const story = typeof body.story === "string" ? body.story.trim() : "";
  const result = await investigateStory(story);

  sendJson(response, result.statusCode, result.payload);
}

export async function investigateStory(storyInput) {
  const story = typeof storyInput === "string" ? storyInput.trim() : "";

  if (!story) {
    return {
      statusCode: 400,
      payload: { error: "Story is required" },
    };
  }

  if (process.env.WHAT_IF_USE_MOCK === "true") {
    console.warn("[What If MOCK] WHAT_IF_USE_MOCK=true, returning mock investigation result.");
    const mockResult = createMockInvestigationResult(story);
    logInvestigationDebug(mockResult);
    return {
      statusCode: 200,
      payload: mockResult,
    };
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return {
      statusCode: 500,
      payload: { error: "Missing DEEPSEEK_API_KEY" },
    };
  }

  const preFiling = preFilingReview(story);

  if (preFiling.status.startsWith("00")) {
    console.log("[What If Step0] 停止办案:", preFiling.status, preFiling.statusReason);
    return {
      statusCode: 200,
      payload: preFiling,
    };
  }

  const deathCheck = deathQuestionCheck(story);
  const deepseekResult = await callDeepSeek({
    label: "investigate",
    body: {
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${STORY_STATE_ENUM_PROMPT_V10}\n\n${PRE_FILING_PROMPT_V10}\n\n${CORE_FRAMEWORK_PROMPT_DOCS_V02}\n\n${DEATH_ROUTING_PROMPT_V03}`,
        },
        {
          role: "user",
          content: `用户的遗憾故事：\n${story}\n\n本地 Step0 预审结果：\n${formatPreFilingReview(preFiling)}\n\n本地 deathQuestionCheck 结果：\n${formatDeathQuestionCheck(deathCheck)}\n\n如果 Step0 已经是 S1/S2/S3，你才可以继续正式调查。如果 deathQuestionCheck.storyState 是 S3，你必须进入 S3，禁止返回 00A。如果 deathQuestionCheck.storyState 是 00A，才允许停止办案。`,
        },
      ],
      temperature: 0.4,
    },
  });

  if (!deepseekResult.ok) {
    return {
      statusCode: 502,
      payload: {
        error: "DeepSeek request failed",
        reason: deepseekResult.reason,
        status: deepseekResult.status,
        body: deepseekResult.body,
        errorMessage: deepseekResult.error?.message || deepseekResult.body || deepseekResult.reason,
        code: deepseekResult.code || deepseekResult.error?.code,
      },
    };
  }

  const deepseekData = deepseekResult.json;
  const content = deepseekData?.choices?.[0]?.message?.content;
  const result = parseInvestigationResult(content);

  if (!result) {
    return {
      statusCode: 502,
      payload: { error: "Invalid DeepSeek response" },
    };
  }

  logInvestigationDebug(result);
  return {
    statusCode: 200,
    payload: result,
  };
}

async function handleDeepSeekHealth(request, response) {
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const basePayload = {
    ok: false,
    hasApiKey: Boolean(apiKey),
    keyPrefix: maskSecret(apiKey),
    requestUrl: DEEPSEEK_CHAT_URL,
    status: null,
    body: null,
    errorMessage: null,
    code: null,
    error: {
      code: null,
      cause: null,
      message: null,
      stack: null,
    },
    stack: null,
  };

  if (!apiKey) {
    sendJson(response, 500, {
      ...basePayload,
      errorMessage: "Missing DEEPSEEK_API_KEY",
    });
    return;
  }

  const deepseekResult = await callDeepSeek({
    label: "health",
    body: {
      model: "deepseek-chat",
      messages: [{ role: "user", content: "Hello" }],
      temperature: 0,
      max_tokens: 16,
    },
  });

  if (!deepseekResult.ok) {
    sendJson(response, 502, {
      ...basePayload,
      status: deepseekResult.status,
      body: deepseekResult.body,
      errorMessage:
        deepseekResult.error?.message ||
        deepseekResult.body ||
        deepseekResult.reason,
      code: deepseekResult.code || deepseekResult.error?.code,
      error: {
        code: deepseekResult.code || deepseekResult.error?.code || null,
        cause: deepseekResult.error?.cause || null,
        message:
          deepseekResult.error?.message ||
          deepseekResult.body ||
          deepseekResult.reason,
        stack: deepseekResult.stack,
      },
      stack: deepseekResult.stack,
    });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    hasApiKey: true,
    keyPrefix: maskSecret(apiKey),
    requestUrl: DEEPSEEK_CHAT_URL,
    status: deepseekResult.status,
    body: deepseekResult.body,
    errorMessage: null,
    code: null,
    error: {
      code: null,
      cause: null,
      message: null,
      stack: null,
    },
    stack: null,
  });
}

async function callDeepSeek({ label, body }) {
  console.log(`[DeepSeek:${label}] request url: ${DEEPSEEK_CHAT_URL}`);
  console.log(`[DeepSeek:${label}] api key: ${maskSecret(process.env.DEEPSEEK_API_KEY)}`);
  console.log(`[DeepSeek:${label}] request body: ${JSON.stringify(body)}`);

  return new Promise((resolve) => {
    const requestBody = JSON.stringify(body);
    const target = new URL(DEEPSEEK_CHAT_URL);
    const request = https.request(
      {
        hostname: target.hostname,
        path: target.pathname,
        method: "POST",
        port: 443,
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf8");
          const status = response.statusCode || null;
          console.log(`[DeepSeek:${label}:https] HTTP status: ${status}`);
          console.log(`[DeepSeek:${label}:https] response body: ${responseBody}`);

          let json = null;

          try {
            json = responseBody ? JSON.parse(responseBody) : null;
          } catch (error) {
            logError(`[DeepSeek:${label}:https] JSON parse failed`, error);
          }

          resolve({
            ok: Boolean(status && status >= 200 && status < 300),
            reason: status && status >= 200 && status < 300 ? "success" : classifyHttpFailure(status),
            status,
            body: responseBody,
            json,
            transport: "node:https",
          });
        });
      },
    );

    request.setTimeout(30000, () => {
      request.destroy(new Error("node:https request timed out after 30000ms"));
    });

    request.on("error", (error) => {
      logError(`[DeepSeek:${label}] node:https request failed`, error);
      logNetworkDiagnostics(`[DeepSeek:${label}] node:https diagnostics`, error);
      resolve({
        ok: false,
        reason: classifyNetworkFailure(error),
        status: null,
        body: null,
        stack: error instanceof Error ? error.stack : String(error),
        transport: "node:https",
        error: getErrorDiagnostics(error),
        code: error && typeof error === "object" && "code" in error ? error.code : undefined,
      });
    });

    request.write(requestBody);
    request.end();
  });
}

function classifyHttpFailure(status) {
  if (status === 401 || status === 403) {
    return "api_key_or_permission";
  }

  if (status === 400 || status === 422) {
    return "request_format";
  }

  if (status === 429) {
    return "rate_limit";
  }

  if (status >= 500) {
    return "deepseek_service";
  }

  return "deepseek_http_error";
}

function classifyNetworkFailure(error) {
  const message = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error ? error.cause : null;
  const causeCode = cause && typeof cause === "object" && "code" in cause ? cause.code : "";

  if (causeCode === "ENOTFOUND" || causeCode === "EAI_AGAIN") {
    return "dns";
  }

  if (
    causeCode === "ECONNREFUSED" ||
    causeCode === "ECONNRESET" ||
    causeCode === "ETIMEDOUT" ||
    message.includes("fetch failed")
  ) {
    return "network";
  }

  return "network_or_runtime";
}

function getErrorDiagnostics(error) {
  if (!(error instanceof Error)) {
    return { message: String(error) };
  }

  const cause = error.cause && typeof error.cause === "object" ? error.cause : null;
  const aggregateErrors = Array.isArray(error.errors)
    ? error.errors.map((item) =>
        item && typeof item === "object"
          ? {
              name: "name" in item ? item.name : undefined,
              message: "message" in item ? item.message : undefined,
              code: "code" in item ? item.code : undefined,
              errno: "errno" in item ? item.errno : undefined,
              syscall: "syscall" in item ? item.syscall : undefined,
              address: "address" in item ? item.address : undefined,
              port: "port" in item ? item.port : undefined,
            }
          : { message: String(item) },
      )
    : undefined;

  return {
    name: error.name,
    message: error.message,
    code: "code" in error ? error.code : undefined,
    errno: "errno" in error ? error.errno : undefined,
    syscall: "syscall" in error ? error.syscall : undefined,
    address: "address" in error ? error.address : undefined,
    port: "port" in error ? error.port : undefined,
    cause: cause
      ? {
          name: "name" in cause ? cause.name : undefined,
          message: "message" in cause ? cause.message : undefined,
          code: "code" in cause ? cause.code : undefined,
          errno: "errno" in cause ? cause.errno : undefined,
          syscall: "syscall" in cause ? cause.syscall : undefined,
          address: "address" in cause ? cause.address : undefined,
          port: "port" in cause ? cause.port : undefined,
        }
      : undefined,
    errors: aggregateErrors,
  };
}

function logNetworkDiagnostics(label, error) {
  console.error(label, JSON.stringify(getErrorDiagnostics(error)));
}

function logError(label, error) {
  console.error(label);

  if (error instanceof Error) {
    console.error(error.stack || error.message);

    if (error.cause) {
      console.error("Cause:", error.cause);
    }

    return;
  }

  console.error(error);
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function parseInvestigationResult(content) {
  if (typeof content !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(content);

    if (typeof parsed.status !== "string" || typeof parsed.statusReason !== "string") {
      return null;
    }

    const status = parsed.status.trim();
    const statusReason = parsed.statusReason.trim();
    const allowedStatuses = ["00A", "00B", "00C", "00D", "S1", "S2", "S3"];

    if (!allowedStatuses.includes(status)) {
      return null;
    }

    if (["00A", "00B", "00C", "00D"].includes(status)) {
      return {
        status,
        statusReason,
        caseType: typeof parsed.caseType === "string" ? parsed.caseType.trim() : "stopped",
      };
    }

    const requiredFields = ["loss", "lastingImpact", "question", "mechanism", "reversal"];

    if (requiredFields.some((field) => typeof parsed[field] !== "string")) {
      return null;
    }

    const question = parsed.question.trim();

    if (containsParallelLifeQuestion(question)) {
      return null;
    }

    return {
      status,
      statusReason,
      loss: parsed.loss.trim(),
      lastingImpact: parsed.lastingImpact.trim(),
      question,
      mechanism: parsed.mechanism.trim(),
      reversal: parsed.reversal.trim(),
    };
  } catch {
    return null;
  }
}

function preFilingReview(story) {
  const deathCheck = deathQuestionCheck(story);

  if (deathCheck.storyState === "00A") {
    return createStoppedCase(
      "00A",
      "故事呈现的是不可逆失去与怀念。事件本身已结束，未形成需要继续追问的个人问题。调查在故事状态层结束。",
      "death_memory",
    );
  }

  if (isHistoricalReflection(story)) {
    return createStoppedCase(
      "00A",
      "故事呈现的是历史遗憾或时代感慨。事件本身已结束，未形成需要继续追问的个人问题。调查在故事状态层结束。",
      "historical_reflection",
    );
  }

  if (isClosedStory(story)) {
    return createStoppedCase(
      "00B",
      "故事内部已经形成闭环。用户已获得理解、补偿或和解。未形成需要继续调查的未回答问题。调查在故事状态层结束。",
      "closed_story",
    );
  }

  if (isCulturalAestheticStory(story)) {
    return createStoppedCase(
      "00C",
      "用户表达的是文化体验或审美体验变化。事件未形成持续的人生追问。调查在故事状态层结束。",
      "cultural_aesthetic",
    );
  }

  if (isLifeAnecdote(story)) {
    return createStoppedCase(
      "00D",
      "事件造成短期遗憾，但未形成持续人生影响。调查在故事状态层结束。",
      "life_anecdote",
    );
  }

  return {
    status: "S1",
    statusReason: "通过 Step0 立案门槛，允许进入正式调查。",
    caseType: "investigable",
  };
}

function createStoppedCase(status, statusReason, caseType) {
  return {
    status,
    statusReason,
    caseType,
  };
}

function isHistoricalReflection(story) {
  const historyTerms = /(历史|时代|古代|战争年代|革命|毛主席|杨开慧|名人|古人|皇帝|将军|诗人|历史人物|后人|考古)/;
  const personalTerms = /(我|自己|我的|我们|父母|妈妈|爸爸|朋友|恋人|孩子|同学|同事|家人)/;
  const whatIfTerms = /(如果.*会怎样|假如.*会怎样|如果.*看到|如果.*知道|会不会.*不一样)/;

  return historyTerms.test(story) && whatIfTerms.test(story) && !personalTerms.test(story);
}

function isClosedStory(story) {
  return /(终于释怀|已经释怀|已经放下|不再影响|和解了|补偿了|重新买回来|买回来了|终于明白|现在能理解|已经有答案|感谢那段|完成闭环)/.test(
    story,
  );
}

function isCulturalAestheticStory(story) {
  const culturalTerms = /(读音|发音|古诗|诗意|语言|文字|翻译|文化|审美|艺术体验|旋律|歌词|远上寒山石径斜|乡音|版本变化)/;
  const lifeImpactTerms = /(不敢|回避|自我怀疑|不敢选择|不敢表达|不敢信任|影响.*关系|影响.*人生|多年.*放不下)/;

  return culturalTerms.test(story) && !lifeImpactTerms.test(story);
}

function isLifeAnecdote(story) {
  const anecdoteTerms = /(手抖|少付|多付|两块钱|几块钱|付款|找零|排队|错过公交|忘带伞|买错|吃亏|小事|趣事|可惜|倒霉)/;
  const longImpactTerms = /(十年|多年|一直影响|不敢|回避|自我怀疑|人格|关系|选择|信任)/;

  return anecdoteTerms.test(story) && !longImpactTerms.test(story);
}

function formatPreFilingReview(result) {
  return JSON.stringify(result);
}

function deathQuestionCheck(story) {
  const checks = [
    {
      type: "自责型",
      patterns: [
        /我是不是.*害/,
        /是不是我.*害/,
        /我为什么没.*救/,
        /为什么没.*救下/,
        /我为什么没.*发现/,
        /如果我早一点/,
        /我要是早一点/,
        /早一点.*是不是/,
      ],
    },
    {
      type: "告别缺失型",
      patterns: [
        /没见.*最后一面/,
        /没有见.*最后一面/,
        /没来得及.*再见/,
        /没来得及.*道歉/,
        /没来得及.*告别/,
        /没有.*告别/,
        /最后一面/,
      ],
    },
    {
      type: "幸存者责任型",
      patterns: [
        /为什么活下来的是我/,
        /为什么.*我.*活下来/,
        /如果死的是我/,
        /要是死的是我/,
        /我替.*活着/,
        /替他活/,
        /替她活/,
      ],
    },
    {
      type: "医疗选择型",
      patterns: [
        /是否该.*转院/,
        /该不该.*转院/,
        /是否该.*继续治疗/,
        /该不该.*继续治疗/,
        /是否.*做错.*决定/,
        /是不是.*做错.*决定/,
        /治疗.*决定/,
        /手术.*决定/,
        /没.*送.*医院/,
      ],
    },
    {
      type: "后续承担型",
      patterns: [
        /必须撑起.*家/,
        /撑起这个家/,
        /该照顾.*父母/,
        /我该如何继续/,
        /怎么继续/,
        /这个家怎么办/,
        /以后.*怎么办/,
      ],
    },
    {
      type: "存在确认型",
      patterns: [
        /是否真的存在过/,
        /真的存在过/,
        /孩子会记得我吗/,
        /会不会记得我/,
        /我是否被记住/,
        /是否有人记得/,
        /有人记得.*吗/,
      ],
    },
  ];

  const deathPatterns = [
    /去世/,
    /离世/,
    /死亡/,
    /死了/,
    /没了/,
    /牺牲/,
    /自杀/,
    /车祸/,
    /脑炎/,
    /难产/,
    /流产/,
    /未出生/,
    /胎停/,
    /病逝/,
    /火化/,
    /葬礼/,
    /最后一面/,
    /阿尔茨海默/,
    /失智/,
  ];

  const isDeathCase = deathPatterns.some((pattern) => pattern.test(story));
  const matchedTypes = checks
    .filter((check) => check.patterns.some((pattern) => pattern.test(story)))
    .map((check) => check.type);

  if (!isDeathCase) {
    return {
      isDeathCase: false,
      storyState: null,
      shouldInvestigate: null,
      matchedTypes,
      reason: "非死亡案件，不触发 V0.3 死亡二次判定。",
    };
  }

  if (matchedTypes.length > 0) {
    return {
      isDeathCase: true,
      storyState: "S3",
      shouldInvestigate: true,
      matchedTypes,
      reason: "死亡案件中存在未回答问题，必须继续调查。",
    };
  }

  return {
    isDeathCase: true,
    storyState: "00A",
    shouldInvestigate: false,
    matchedTypes,
    reason: "死亡案件仅呈现怀念或不可逆失去，未发现自责、责任、选择悔恨、告别缺失或存在确认问题。",
  };
}

function formatDeathQuestionCheck(result) {
  return JSON.stringify(result);
}

function createMockInvestigationResult(story) {
  if (/(爷爷|奶奶|外公|外婆|父亲|母亲|爸爸|妈妈|宠物|猫|狗|离世|去世|死亡|牺牲)/.test(story)) {
    return {
      status: "00A",
      statusReason: "MOCK：故事核心是不可反转的失去，更接近怀念而不是追问。",
      loss: "有些失去不需要被解释，只需要被记住。",
      lastingImpact: "MOCK：这份怀念直到今天仍然占据着讲述者心里一个安静的位置。",
      question: "MOCK：这类故事暂不进入正式调查。",
      mechanism: "MOCK",
      reversal: "MOCK：这不是一个需要反转的案件，而是一段需要被允许存在的记忆。",
    };
  }

  if (/(已经释怀|已经过去|现在能理解|终于明白|感谢那段|放下了|和解了|答案)/.test(story)) {
    return {
      status: "00B",
      statusReason: "MOCK：故事内部已经形成闭环，讲述者已经获得答案。",
      loss: "这个故事已经完成了它自己。",
      lastingImpact: "MOCK：它留下的是理解，而不是仍在拉扯今天的悬问。",
      question: "MOCK：这类故事暂不进入正式调查。",
      mechanism: "MOCK",
      reversal: "MOCK：调查在这里停止，因为答案已经出现在故事内部。",
    };
  }

  return {
    status: "S3",
    statusReason: "MOCK：故事已经接近核心问题，但还有一层没有被说透。",
    loss: "被认真选择和看见的确认",
    lastingImpact: "MOCK：直到今天，讲述者仍然很难相信自己的感受值得被认真对待。",
    question: "为什么我到底需要别人先确认我，才敢相信自己值得被留下？",
    mechanism: "MOCK：M05 + M03",
    reversal: "MOCK：真正放不下的可能不是那次选择，而是那个一直等着被认真看见的自己。",
  };
}

function containsParallelLifeQuestion(question) {
  const forbiddenPatterns = [
    "如果当初",
    "如果那年",
    "如果我当时",
    "如果当时",
    "要是当年",
    "会不会不一样",
    "会不会有另一种人生",
    "会怎样",
    "另一种人生",
  ];

  return forbiddenPatterns.some((pattern) => question.includes(pattern));
}

function logInvestigationDebug(result) {
  console.log("[What If Debug] 案件状态:", result.status);
  console.log("[What If Debug] 真正失去:", result.loss);
  console.log("[What If Debug] 持续影响:", result.lastingImpact);
  console.log("[What If Debug] 未被回答的问题:", result.question);
}

async function serveStatic(pathname, response) {
  const safePathname = decodeURIComponent(pathname);
  let filePath = path.join(distDir, safePathname === "/" ? "index.html" : safePathname);
  const normalizedPath = path.normalize(filePath);

  if (!normalizedPath.startsWith(path.normalize(distDir))) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(normalizedPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    response.end(data);
  } catch {
    filePath = path.join(distDir, "index.html");
    const data = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    response.end(data);
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
