const cases = [
  {
    id: "D-001",
    name: "狗狗离世",
    story: "我的狗狗去年离世了。我偶尔会想起它在门口等我的样子，很想念它。",
    expected: "00A",
  },
  {
    id: "D-002",
    name: "爷爷去世",
    story: "爷爷去世很多年了，我有时会想起他带我散步的下午，只是很怀念。",
    expected: "00A",
  },
  {
    id: "D-003",
    name: "阿尔茨海默症母亲不再认得我",
    story: "母亲得了阿尔茨海默症，后来不再认得我。我很难过，也常常怀念她清醒时的样子。",
    expected: "00A",
  },
  {
    id: "D-004",
    name: "被拐儿童母亲已失智",
    story: "被拐的孩子终于找到时，母亲已经失智，不再认得他。这个故事让我很悲伤。",
    expected: "00A",
  },
  {
    id: "D-005",
    name: "儿子脑炎离世",
    story: "儿子脑炎离世。我一直在想，如果我早一点发现症状，是不是就能救下他。",
    expected: "S3",
  },
  {
    id: "D-006",
    name: "战友牺牲",
    story: "战友牺牲后，我总在想为什么活下来的是我，好像我必须替他活着。",
    expected: "S3",
  },
  {
    id: "D-007",
    name: "朋友自杀",
    story: "朋友自杀了。我反复想，我为什么没发现他的异常，为什么没救下他。",
    expected: "S3",
  },
  {
    id: "D-008",
    name: "未出生孩子",
    story: "那个未出生的孩子没能来到这个世界。我一直问自己，他是否真的存在过，是否有人会记得他。",
    expected: "S3",
  },
  {
    id: "D-009",
    name: "妻子难产去世",
    story: "妻子难产去世后，我一直想，当时是否该转院，是否是我做错了决定。",
    expected: "S3",
  },
  {
    id: "D-010",
    name: "亲姐姐车祸去世",
    story: "亲姐姐车祸去世，我没见到最后一面，也没来得及说再见。",
    expected: "S3",
  },
];

function deathQuestionCheck(story) {
  const checks = [
    { type: "自责型", patterns: [/我是不是.*害/, /是不是我.*害/, /我为什么没.*救/, /为什么没.*救下/, /我为什么没.*发现/, /如果我早一点/, /我要是早一点/, /早一点.*是不是/] },
    { type: "告别缺失型", patterns: [/没见.*最后一面/, /没有见.*最后一面/, /没来得及.*再见/, /没来得及.*道歉/, /没来得及.*告别/, /没有.*告别/, /最后一面/] },
    { type: "幸存者责任型", patterns: [/为什么活下来的是我/, /为什么.*我.*活下来/, /如果死的是我/, /要是死的是我/, /我替.*活着/, /替他活/, /替她活/] },
    { type: "医疗选择型", patterns: [/是否该.*转院/, /该不该.*转院/, /是否该.*继续治疗/, /该不该.*继续治疗/, /是否.*做错.*决定/, /是不是.*做错.*决定/, /治疗.*决定/, /手术.*决定/, /没.*送.*医院/] },
    { type: "后续承担型", patterns: [/必须撑起.*家/, /撑起这个家/, /该照顾.*父母/, /我该如何继续/, /怎么继续/, /这个家怎么办/, /以后.*怎么办/] },
    { type: "存在确认型", patterns: [/是否真的存在过/, /真的存在过/, /孩子会记得我吗/, /会不会记得我/, /我是否被记住/, /是否有人记得/, /有人记得.*吗/] },
  ];

  const deathPatterns = [/去世/, /离世/, /死亡/, /死了/, /没了/, /牺牲/, /自杀/, /车祸/, /脑炎/, /难产/, /流产/, /未出生/, /胎停/, /病逝/, /火化/, /葬礼/, /最后一面/, /阿尔茨海默/, /失智/];
  const isDeathCase = deathPatterns.some((pattern) => pattern.test(story));
  const matchedTypes = checks.filter((check) => check.patterns.some((pattern) => pattern.test(story))).map((check) => check.type);

  if (!isDeathCase) return { storyState: null, matchedTypes };
  if (matchedTypes.length > 0) return { storyState: "S3", matchedTypes };
  return { storyState: "00A", matchedTypes };
}

const results = cases.map((item) => {
  const actual = deathQuestionCheck(item.story);
  return {
    id: item.id,
    name: item.name,
    expected: item.expected,
    actual: actual.storyState,
    matchedTypes: actual.matchedTypes,
    passed: actual.storyState === item.expected,
  };
});

for (const result of results) {
  console.log(
    `${result.passed ? "PASS" : "FAIL"} ${result.id} ${result.name}: expected ${result.expected}, actual ${result.actual}, matched=${result.matchedTypes.join("+") || "-"}`,
  );
}

const failed = results.filter((result) => !result.passed);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length > 0) {
  process.exitCode = 1;
}
