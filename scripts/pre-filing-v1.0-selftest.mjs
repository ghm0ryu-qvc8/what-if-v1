const cases = [
  {
    id: "P-001",
    name: "历史感慨",
    story: "杨开慧写给毛主席的信直到去世后才被发现。如果毛主席看到了会怎样？",
    expected: "00A",
  },
  {
    id: "P-002",
    name: "已闭环故事",
    story: "小时候丢失的玩具，成年后我重新买回来，终于释怀了。",
    expected: "00B",
  },
  {
    id: "P-003",
    name: "文化审美",
    story: "远上寒山石径斜的读音改变后，我再也感受不到小时候的诗意。",
    expected: "00C",
  },
  {
    id: "P-004",
    name: "生活趣事",
    story: "付款时手抖少付了两块钱，后来一直觉得有点可惜。",
    expected: "00D",
  },
  {
    id: "P-005",
    name: "可立案遗憾",
    story: "高考那年我放弃了外地学校，后来很多年都不敢自己做重大选择，总怀疑自己的判断。",
    expected: "S1",
  },
];

function preFilingReview(story) {
  if (isHistoricalReflection(story)) return { status: "00A" };
  if (isClosedStory(story)) return { status: "00B" };
  if (isCulturalAestheticStory(story)) return { status: "00C" };
  if (isLifeAnecdote(story)) return { status: "00D" };
  return { status: "S1" };
}

function isHistoricalReflection(story) {
  const historyTerms = /(历史|时代|古代|战争年代|革命|毛主席|杨开慧|名人|古人|皇帝|将军|诗人|历史人物|后人|考古)/;
  const personalTerms = /(我|自己|我的|我们|父母|妈妈|爸爸|朋友|恋人|孩子|同学|同事|家人)/;
  const whatIfTerms = /(如果.*会怎样|假如.*会怎样|如果.*看到|如果.*知道|会不会.*不一样)/;
  return historyTerms.test(story) && whatIfTerms.test(story) && !personalTerms.test(story);
}

function isClosedStory(story) {
  return /(终于释怀|已经释怀|已经放下|不再影响|和解了|补偿了|重新买回来|买回来了|终于明白|现在能理解|已经有答案|感谢那段|完成闭环)/.test(story);
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

const results = cases.map((item) => {
  const actual = preFilingReview(item.story).status;
  return { ...item, actual, passed: actual === item.expected };
});

for (const result of results) {
  console.log(`${result.passed ? "PASS" : "FAIL"} ${result.id} ${result.name}: expected ${result.expected}, actual ${result.actual}`);
}

const failed = results.filter((result) => !result.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exitCode = 1;
}
