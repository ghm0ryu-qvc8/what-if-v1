const benchmarkCases = [
  {
    id: "WIF-002",
    name: "白煮蛋",
    expectedStatus: "S3",
    expectedLoss: "被认真喜欢过的证据",
    expectedQuestion: "为什么会有人这样认真地喜欢我？",
    expectedMechanism: "M05 + M03",
    forbidden: ["错过爱情", "错过缘分", "错过一个好男孩"],
  },
  {
    id: "WIF-003",
    name: "青梅竹马",
    expectedStatus: "S3",
    expectedLoss: "被坚定选择的确认",
    expectedQuestion: "为什么当一个人真的选择我的时候，我反而不敢相信？",
    expectedMechanism: "M03 + M05",
    forbidden: ["错过初恋", "错过爱情", "异地导致分开"],
  },
  {
    id: "WIF-004",
    name: "第一个粉丝",
    expectedStatus: "S1",
    expectedLoss: "澄清误会的机会",
    expectedQuestion: "那个曾经无条件相信我的人，最后是不是以为我辜负了他？",
    expectedMechanism: "M05",
    forbidden: ["样机没寄出去", "运气不好", "联系方式丢失"],
  },
  {
    id: "WIF-005",
    name: "复读",
    expectedStatus: "S1",
    expectedLoss: "被主流规则接纳的资格感",
    expectedQuestion: "为什么我拼命追赶了这么多年，仍然觉得自己站在门外？",
    expectedMechanism: "M03",
    forbidden: ["应该复读", "学历改变命运", "高考决定人生"],
  },
  {
    id: "WIF-007",
    name: "优等生",
    expectedStatus: "S1",
    expectedLoss: "允许自己失控的权利",
    expectedQuestion: "如果有一天我不再那么懂事，还会有人接受我吗？",
    expectedMechanism: "M05 + M04",
    forbidden: ["没玩够", "没逃课", "青春不完整"],
  },
];

const parallelLifeForbidden = [
  "如果当初",
  "如果那年",
  "如果当时",
  "如果我当时",
  "要是当年",
  "会不会有另一种人生",
  "会不会不一样",
  "会怎样",
  "另一种人生",
];

const statuses = ["00A", "00B", "00C", "00D", "00D-1", "S5", "S6", "S1", "S2", "S3"];
const resultFields = [
  "status",
  "statusReason",
  "loss",
  "lastingImpact",
  "question",
  "mechanism",
  "reversal",
];

const results = benchmarkCases.map((benchmarkCase) => {
  const checks = [
    ["expected status is valid", statuses.includes(benchmarkCase.expectedStatus)],
    ["expected loss exists", Boolean(benchmarkCase.expectedLoss)],
    ["expected question exists", Boolean(benchmarkCase.expectedQuestion)],
    ["expected mechanism exists", Boolean(benchmarkCase.expectedMechanism)],
    [
      "question avoids forbidden parallel-life phrasing",
      !parallelLifeForbidden.some((phrase) => benchmarkCase.expectedQuestion.includes(phrase)),
    ],
    [
      "forbidden regression answers are tracked",
      Array.isArray(benchmarkCase.forbidden) && benchmarkCase.forbidden.length > 0,
    ],
  ];

  const passed = checks.every(([, ok]) => ok);

  return {
    id: benchmarkCase.id,
    name: benchmarkCase.name,
    expectedStatus: benchmarkCase.expectedStatus,
    passed,
    checks: Object.fromEntries(checks),
  };
});

const summary = {
  promptVersion: "What If? Core Framework V0.9 + Docs V0.2/V0.1",
  benchmarkVersion: "V1.1",
  outputFields: resultFields,
  total: results.length,
  passed: results.filter((result) => result.passed).length,
  failed: results.filter((result) => !result.passed).length,
  results,
};

console.log(JSON.stringify(summary, null, 2));

if (summary.failed > 0) {
  process.exitCode = 1;
}
