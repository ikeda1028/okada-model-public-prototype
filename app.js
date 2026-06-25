const ppmParameters = [
  ["marketing", "Marketing"],
  ["technology", "Technology"],
  ["stakeholders", "Stakeholders"],
  ["finance", "Investment & Finance"],
  ["regulation", "Regulation"],
  ["hr", "Human Resource"],
  ["process", "Process Management"],
  ["decision", "Decision Making"],
];

const ACCESS_CODE = "okada-test-2026";
const ACCESS_STORAGE_KEY = "okada-model-public-access";

const defaultWeights = {
  dao: [12, 10, 18, 8, 8, 14, 14, 16],
  it: [10, 22, 10, 12, 8, 10, 14, 14],
  infrastructure: [8, 8, 14, 18, 22, 8, 14, 8],
  ppp: [14, 8, 22, 14, 16, 8, 10, 8],
  education: [14, 12, 16, 8, 8, 18, 12, 12],
};

const roleValueModel = {
  marketing: {
    role: "市場・広報形成",
    action: "参加者募集、対外発信、価値提案、受容性調査を主導する",
    money: 12,
    human: 8,
    org: 9,
    evidence: "広報成果、問い合わせ、参加登録、メッセージ改善履歴",
  },
  technology: {
    role: "技術・仕組み化",
    action: "ツール、プロトタイプ、自動化、データ基盤を構築する",
    money: 13,
    human: 11,
    org: 12,
    evidence: "動作物、設計資料、Git履歴、運用手順、障害削減",
  },
  stakeholders: {
    role: "関係者調整・信頼形成",
    action: "行政、地域、顧客、協力者との合意形成と期待値調整を行う",
    money: 10,
    human: 10,
    org: 15,
    evidence: "合意ログ、RACI、面談記録、承認、関係者満足度",
  },
  finance: {
    role: "財務・資金設計",
    action: "予算、資金調達、費用対効果、収支シナリオを設計する",
    money: 16,
    human: 8,
    org: 10,
    evidence: "予算表、見積、資金計画、ROI試算、調達進捗",
  },
  regulation: {
    role: "法務・規制リスク管理",
    action: "契約、税務、許認可、コンプライアンス上の論点を潰す",
    money: 11,
    human: 9,
    org: 14,
    evidence: "契約レビュー、論点表、許認可確認、リスク対応履歴",
  },
  hr: {
    role: "人材育成・チームアップ",
    action: "メンバーの学習、役割設計、相互支援、オンボーディングを担う",
    money: 7,
    human: 16,
    org: 13,
    evidence: "スキルマップ、育成ログ、レビュー、支援記録、引き継ぎ資料",
  },
  process: {
    role: "プロセス改善・再現性構築",
    action: "SOP、進捗管理、振り返り、テンプレート化で再現性を作る",
    money: 12,
    human: 11,
    org: 16,
    evidence: "SOP、テンプレート、改善ログ、手戻り削減、品質指標",
  },
  decision: {
    role: "意思決定・合意形成設計",
    action: "選択肢、判断基準、議論整理、決定ログ、異議処理を設計する",
    money: 10,
    human: 12,
    org: 15,
    evidence: "決定ログ、判断基準表、議事録、異議対応、承認履歴",
  },
};

const phaseTemplates = [
  {
    key: "image",
    title: "IMAGE PLANNING",
    subtitle: "MISSION & VISION",
    description: "ミッション、ビジョン、目的、スコープ、ステークホルダー期待値、SMART評価指標を定義します。",
    tasks: [
      ["ミッション・スコープ定義", "decision", 1, 2, 26],
      ["ステークホルダー期待値整理", "stakeholders", 2, 2, 24],
      ["SMART / BSC評価指標設定", "process", 3, 1, 18],
    ],
  },
  {
    key: "pilot",
    title: "PILOT PLANNING",
    subtitle: "SIMULATION SYSTEM",
    description: "リソース、時間、コスト、リスクをシミュレーションし、仮説検証とプロトタイプ計画を作ります。",
    tasks: [
      ["リソース・期間・コスト仮説", "finance", 3, 2, 30],
      ["リスクシナリオ設計", "regulation", 4, 2, 28],
      ["プロトタイプ評価基準", "technology", 5, 2, 32],
    ],
  },
  {
    key: "master",
    title: "MASTER PLANNING",
    subtitle: "WBS & TEAM DESIGN",
    description: "WBS、マイルストーン、役割分担、依存関係、合意形成の手順を具体化します。",
    tasks: [
      ["WBS詳細化と担当設計", "process", 6, 2, 34],
      ["チームスキルマトリクス", "hr", 7, 1, 20],
      ["合意形成・承認フロー", "decision", 7, 2, 26],
    ],
  },
  {
    key: "implementation",
    title: "IMPLEMENTATION PLANNING",
    subtitle: "SOP & FEEDBACK",
    description: "実行SOP、進捗監視、フィードバックループ、アジャイル改善サイクルを運用に落とします。",
    tasks: [
      ["SOPと作業割当", "process", 8, 2, 34],
      ["広報・参加者募集", "marketing", 9, 2, 30],
      ["レビューと改善サイクル", "stakeholders", 10, 2, 24],
    ],
  },
];

let state = {
  tasks: [],
  phases: phaseTemplates,
  weights: {},
  aiEnabled: false,
  members: [
    { id: 1, name: "佐藤", role: "合意形成 / PM", primary: "stakeholders", base: 24, meeting: 0 },
    { id: 2, name: "田中", role: "財務 / 法務", primary: "finance", base: 20, meeting: 0 },
    { id: 3, name: "山本", role: "広報 / コミュニティ", primary: "marketing", base: 18, meeting: 0 },
  ],
};

const yen = (value) => `${Math.round(value).toLocaleString("ja-JP")}円`;

function $(id) {
  return document.getElementById(id);
}

function unlockAccess() {
  sessionStorage.setItem(ACCESS_STORAGE_KEY, "ok");
  document.body.classList.remove("access-locked");
}

function setupAccessGate() {
  const saved = sessionStorage.getItem(ACCESS_STORAGE_KEY) === "ok";
  const hashCode = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  const queryCode = new URLSearchParams(window.location.search).get("access") || "";
  if (saved || hashCode === ACCESS_CODE || queryCode === ACCESS_CODE) {
    unlockAccess();
    return;
  }

  $("accessForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("accessCodeInput");
    const value = input.value.trim();
    if (value === ACCESS_CODE) {
      unlockAccess();
      input.value = "";
      return;
    }
    $("accessError").textContent = "合言葉が違います。共有された文字列を確認してください。";
    input.select();
  });
}

function setView(target) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === target));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.target === target));
}

function getProjectType() {
  return $("projectType").value;
}

function normalizeWeights(weights) {
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  return weights.map((value) => Math.round((value / total) * 100));
}

function loadWeights() {
  const selected = normalizeWeights(defaultWeights[getProjectType()]);
  state.weights = Object.fromEntries(ppmParameters.map(([key], index) => [key, selected[index]]));
}

async function checkAI() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json().catch(() => ({}));
    state.aiEnabled = Boolean(data.openai);
    $("aiNoteText").textContent = data.openai
      ? `OpenAI APIに接続済み。モデル: ${data.model}。PPM計画と会議分析は実AIで生成されます。`
      : "AI APIは利用可能ですが、DYNAMIC_PPM_OPENAI_API_KEYが未設定です。ローカルルールで動作します。";
  } catch {
    state.aiEnabled = false;
    $("aiNoteText").textContent = "AI APIに接続できません。ローカルルールで動作します。";
  }
}

function generateLocalPlan() {
  const duration = Number($("duration").value);
  const scale = duration / 12;
  state.phases = phaseTemplates;
  state.tasks = phaseTemplates.flatMap((phase, phaseIndex) =>
    phase.tasks.map(([title, parameter, start, length, hours], taskIndex) => ({
      id: `${phase.key}-${taskIndex + 1}`,
      phaseKey: phase.key,
      phaseTitle: phase.title,
      title,
      parameter,
      start: Math.max(1, Math.round(start * scale)),
      length: Math.max(1, Math.round(length * scale)),
      hours: Math.round(hours * scale),
      impact: 3 + ((phaseIndex + taskIndex) % 3),
      owner: state.members[(phaseIndex + taskIndex) % state.members.length].name,
      status: taskIndex === 0 ? "accepted" : "planned",
    }))
  );
  renderPhaseList();
  renderGantt();
  updateBudget();
  updateScores();
  $("statusLabel").textContent = "PPM計画生成済み";
  $("planBadge").textContent = "Generated";
}

async function generatePlan() {
  try {
    const response = await fetch("/api/ppm-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        projectName: $("projectName").value,
        projectType: getProjectType(),
        overview: $("overview").value,
        durationWeeks: Number($("duration").value),
        riskLevel: $("riskLevel").value,
        weights: state.weights,
        members: state.members.map(({ name, role, primary }) => ({ name, role, primary })),
      }),
    });
    if (!response.ok) throw new Error((await response.json()).error || "AI request failed");
    const plan = await response.json();
    applyAIPlan(plan);
    $("aiNoteText").textContent = "OpenAI APIでPPM計画を生成しました。";
    $("statusLabel").textContent = "AI計画生成済み";
  } catch (error) {
    generateLocalPlan();
    $("aiNoteText").textContent = `AI生成は未使用: ${error.message}。ローカルルールで生成しました。`;
  }
}

function applyAIPlan(plan) {
  const duration = Number($("duration").value);
  const phaseStep = Math.max(1, Math.floor(duration / Math.max(plan.phases.length, 1)));
  state.phases = plan.phases.map((phase) => ({
    key: phase.key,
    title: phase.title,
    subtitle: phase.key.toUpperCase(),
    description: phase.description,
    tasks: phase.tasks.map((task) => [task.title, task.parameter, 1, 1, task.estimatedHours]),
  }));
  state.tasks = plan.phases.flatMap((phase, phaseIndex) =>
    phase.tasks.map((task, taskIndex) => ({
      id: `${phase.key}-${taskIndex + 1}`,
      phaseKey: phase.key,
      phaseTitle: phase.title,
      title: task.title,
      parameter: task.parameter,
      start: Math.min(12, Math.max(1, phaseIndex * phaseStep + taskIndex + 1)),
      length: Math.max(1, Math.min(3, Math.round(task.estimatedHours / 20))),
      hours: Math.round(task.estimatedHours),
      impact: task.impact,
      rationale: task.rationale,
      owner: state.members[(phaseIndex + taskIndex) % state.members.length].name,
      status: taskIndex === 0 ? "accepted" : "planned",
    }))
  );
  renderPhaseList();
  renderGantt();
  updateBudget();
  updateScores();
  $("taskCount").textContent = state.tasks.length;
  $("planBadge").textContent = "AI Generated";
}

function taskCost(task) {
  const roleRate = {
    marketing: 8500,
    technology: 12000,
    stakeholders: 9000,
    finance: 11000,
    regulation: 13000,
    hr: 8000,
    process: 10000,
    decision: 9500,
  };
  return task.hours * roleRate[task.parameter];
}

function budgetEstimate() {
  const labor = state.tasks.reduce((sum, task) => sum + taskCost(task), 0);
  const direct = labor * 0.22;
  const tools = 180000;
  const riskRate = { low: 0.1, medium: 0.2, high: 0.3 }[$("riskLevel").value];
  const contingency = (labor + direct + tools) * riskRate;
  return { labor, direct, tools, contingency, total: labor + direct + tools + contingency };
}

function updateBudget() {
  if (!state.tasks.length) return;
  const budget = budgetEstimate();
  $("taskCount").textContent = state.tasks.length;
  $("budgetTotal").textContent = yen(budget.total);
}

function renderPhaseList() {
  $("phaseList").innerHTML = state.phases
    .map((phase) => {
      const tasks = state.tasks.filter((task) => task.phaseKey === phase.key);
      return `
        <article class="phase-card">
          <header>
            <div>
              <h3>${phase.title}</h3>
              <p>${phase.subtitle}</p>
            </div>
            <span class="pill">${tasks.length} tasks</span>
          </header>
          <p>${phase.description}</p>
          <div class="task-list">
            ${tasks
              .map(
                (task) => `
                  <div class="task-row">
                    <span>${task.title}</span>
                    <span class="pill">${labelForParameter(task.parameter)}</span>
                    <span>${task.owner}</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderGantt() {
  const weeks = Array.from({ length: 12 }, (_, index) => index + 1);
  const header = `
    <div class="gantt-row">
      <div class="gantt-label">Task</div>
      ${weeks.map((week) => `<div class="gantt-cell">W${week}</div>`).join("")}
    </div>
  `;
  const rows = state.tasks
    .map((task, index) => {
      const cells = weeks
        .map((week) => {
          const active = week >= task.start && week < task.start + task.length;
          const klass = index % 3 === 1 ? "alt" : index % 3 === 2 ? "blue" : "";
          return `<div class="gantt-cell">${active ? `<div class="bar ${klass}"></div>` : ""}</div>`;
        })
        .join("");
      return `<div class="gantt-row"><div class="gantt-label">${task.title}</div>${cells}</div>`;
    })
    .join("");
  $("gantt").innerHTML = header + rows;
}

function labelForParameter(key) {
  return ppmParameters.find(([paramKey]) => paramKey === key)?.[1] || key;
}

function renderWeights() {
  $("weights").innerHTML = ppmParameters
    .map(
      ([key, label]) => `
        <div class="weight-row">
          <strong>${label}</strong>
          <input type="range" min="0" max="30" value="${state.weights[key]}" data-weight="${key}" />
          <span>${state.weights[key]}</span>
        </div>
      `
    )
    .join("");
  const total = Object.values(state.weights).reduce((sum, value) => sum + Number(value), 0);
  $("weightTotal").textContent = total;
}

function renderMembers() {
  $("members").innerHTML = state.members
    .map((member) => {
      const score = memberScore(member);
      return `
        <article class="member-card">
          <div class="member-top">
            <div>
              <strong>${member.name}</strong>
              <p>${member.role}</p>
            </div>
            <span class="pill">${labelForParameter(member.primary)}</span>
          </div>
          <div class="score-line">
            <div class="meter"><span style="width:${Math.min(score, 100)}%"></span></div>
            <strong>${score}</strong>
          </div>
        </article>
      `;
    })
    .join("");
}

function memberScore(member) {
  const ownedTasks = state.tasks.filter((task) => task.owner === member.name);
  const taskScore = ownedTasks.reduce((sum, task) => {
    const statusBonus = task.status === "accepted" ? 1.25 : 0.75;
    return sum + task.hours * task.impact * statusBonus * ((state.weights[task.parameter] || 10) / 10);
  }, 0);
  const parameterFit = state.weights[member.primary] || 10;
  return Math.round(member.base + member.meeting + taskScore / 24 + parameterFit / 2);
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function memberValueProfile(member) {
  const ownedTasks = state.tasks.filter((task) => task.owner === member.name);
  const completedTasks = ownedTasks.filter((task) => task.status === "accepted");
  const taskImpact = ownedTasks.reduce((sum, task) => sum + task.impact * (task.status === "accepted" ? 1.2 : 0.7), 0);
  const weightedTaskValue = ownedTasks.reduce((sum, task) => {
    const weight = state.weights[task.parameter] || 10;
    return sum + task.impact * weight * (task.status === "accepted" ? 1.15 : 0.65);
  }, 0);
  const primaryWeight = state.weights[member.primary] || 10;
  const roleModel = roleValueModel[member.primary];
  const meeting = member.meeting || 0;

  const money = clampScore(member.base + weightedTaskValue / 5 + meeting * 0.35 + roleModel.money + completedTasks.length * 4);
  const human = clampScore(member.base + primaryWeight * 0.9 + meeting * 0.25 + roleModel.human + ownedTasks.length * 3);
  const organization = clampScore(member.base + taskImpact * 3 + meeting * 0.3 + roleModel.org + primaryWeight * 0.8);
  const total = clampScore(money * 0.4 + human * 0.3 + organization * 0.3);

  return { money, human, organization, total, roleModel, ownedTasks, completedTasks };
}

function roleGainForMember(member, parameterKey) {
  const current = memberValueProfile(member);
  const model = roleValueModel[parameterKey];
  const weight = state.weights[parameterKey] || 10;
  const ownedSameRole = state.tasks.filter((task) => task.owner === member.name && task.parameter === parameterKey).length;
  const learningBonus = parameterKey === member.primary ? 0.7 : 1;
  const scarcityBonus = ownedSameRole ? 0.75 : 1.15;
  const moneyGain = Math.max(1, Math.round((model.money + weight * 0.35) * learningBonus * scarcityBonus));
  const humanGain = Math.max(1, Math.round((model.human + (parameterKey === member.primary ? 4 : 8)) * scarcityBonus));
  const orgGain = Math.max(1, Math.round((model.org + weight * 0.3) * learningBonus * scarcityBonus));
  const totalGain = Math.round(moneyGain * 0.4 + humanGain * 0.3 + orgGain * 0.3);

  return {
    parameterKey,
    model,
    moneyGain,
    humanGain,
    orgGain,
    totalGain,
    projectedTotal: clampScore(current.total + totalGain),
  };
}

function roleRecommendations(member) {
  return ppmParameters
    .map(([key]) => roleGainForMember(member, key))
    .sort((a, b) => b.totalGain - a.totalGain)
    .slice(0, 3);
}

function updateScores() {
  renderMembers();
  renderRewardReport();
}

function analyzeMeetingLocal() {
  const transcript = $("transcript").value;
  const contributionPatterns = [
    { type: "リスク特定", words: ["リスク", "遅れ", "影響", "確認"], parameter: "process", points: 8 },
    { type: "合意形成", words: ["合意", "説明会", "住民", "行政", "RACI"], parameter: "stakeholders", points: 10 },
    { type: "財務貢献", words: ["見積", "費用", "予算", "資金"], parameter: "finance", points: 9 },
    { type: "法務・規制", words: ["契約", "税務", "法務", "規制"], parameter: "regulation", points: 8 },
    { type: "広報・市場", words: ["SNS", "募集", "メッセージ", "広報"], parameter: "marketing", points: 9 },
    { type: "意思決定", words: ["賛成", "次回", "決定", "担当"], parameter: "decision", points: 7 },
  ];

  const results = [];
  state.members = state.members.map((member) => ({ ...member, meeting: 0 }));

  state.members.forEach((member) => {
    const lines = transcript
      .split("\n")
      .filter((line) => line.trim().startsWith(`${member.name}:`) || line.trim().startsWith(`${member.name}：`));
    const matched = [];
    lines.forEach((line) => {
      contributionPatterns.forEach((pattern) => {
        if (pattern.words.some((word) => line.includes(word))) {
          matched.push(pattern);
        }
      });
    });
    const unique = [...new Map(matched.map((item) => [item.type, item])).values()];
    const meetingScore = unique.reduce((sum, item) => sum + item.points * ((state.weights[item.parameter] || 10) / 10), 0);
    member.meeting = Math.round(meetingScore);
    results.push({ member, patterns: unique, lines });
  });

  $("meetingResults").innerHTML = results
    .map(
      ({ member, patterns, lines }) => `
        <article class="analysis-card">
          <strong>${member.name}: +${member.meeting} pt</strong>
          <p>${patterns.length ? patterns.map((pattern) => `${pattern.type} / ${labelForParameter(pattern.parameter)}`).join("、") : "明確な評価シグナルは少なめです。"}</p>
          <p>発言数: ${lines.length}。長さではなく、意思決定・リスク・実行への接続で評価。</p>
        </article>
      `
    )
    .join("");
  $("meetingBadge").textContent = "分析済み";
  $("statusLabel").textContent = "会議分析済み";
  updateScores();
}

async function analyzeMeeting() {
  const transcript = $("transcript").value;
  try {
    const response = await fetch("/api/meeting-analysis", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        transcript,
        members: state.members.map(({ name, role, primary }) => ({ name, role, primary })),
        weights: state.weights,
        project: {
          name: $("projectName").value,
          type: getProjectType(),
          overview: $("overview").value,
        },
        tasks: state.tasks.map(({ title, parameter, owner, status }) => ({ title, parameter, owner, status })),
      }),
    });
    if (!response.ok) throw new Error((await response.json()).error || "AI request failed");
    const analysis = await response.json();
    state.members = state.members.map((member) => {
      const memberContributions = analysis.contributions.filter((item) => item.memberName === member.name);
      const meeting = memberContributions.reduce((sum, item) => sum + item.score * ((state.weights[item.parameter] || 10) / 20), 0);
      return { ...member, meeting: Math.round(meeting) };
    });
    $("meetingResults").innerHTML = state.members
      .map((member) => {
        const items = analysis.contributions.filter((item) => item.memberName === member.name);
        return `
          <article class="analysis-card">
            <strong>${member.name}: +${member.meeting} pt</strong>
            <p>${items.length ? items.map((item) => `${item.contributionType} / ${labelForParameter(item.parameter)} / 信頼度 ${(item.confidence * 100).toFixed(0)}%`).join("、") : "明確な評価シグナルは少なめです。"}</p>
            <p>${items.map((item) => item.evidence).join(" / ") || "AIが証跡不足として扱いました。"}</p>
          </article>
        `;
      })
      .join("");
    $("meetingBadge").textContent = "AI分析済み";
    $("statusLabel").textContent = "AI会議分析済み";
    $("aiNoteText").textContent = `OpenAI APIで会議分析しました。要約: ${analysis.summary}`;
    updateScores();
  } catch (error) {
    analyzeMeetingLocal();
    $("aiNoteText").textContent = `AI会議分析は未使用: ${error.message}。ローカルルールで分析しました。`;
  }
}

function renderRewardReport() {
  const pool = Number($("rewardPool").value || 0);
  $("rewardPoolLabel").textContent = yen(pool);
  const profiles = state.members.map((member) => ({ member, profile: memberValueProfile(member) }));
  const total = profiles.reduce((sum, item) => sum + item.profile.total, 0) || 1;
  const rows = profiles
    .map((item) => {
      const percentage = (item.profile.total / total) * 100;
      const reward = pool * (percentage / 100);
      return `
        <tr>
          <td>${item.member.name}</td>
          <td>${item.member.role}</td>
          <td>${item.profile.money}</td>
          <td>${item.profile.human}</td>
          <td>${item.profile.organization}</td>
          <td>${percentage.toFixed(1)}%</td>
          <td>${yen(reward)}</td>
        </tr>
      `;
    })
    .join("");

  const roleRows = profiles
    .map(({ member }) =>
      roleRecommendations(member)
        .map(
          (rec, index) => `
            <tr>
              <td>${member.name}</td>
              <td>${index + 1}</td>
              <td>${rec.model.role}</td>
              <td>${rec.model.action}</td>
              <td>+${rec.moneyGain}</td>
              <td>+${rec.humanGain}</td>
              <td>+${rec.orgGain}</td>
              <td>${rec.projectedTotal}</td>
            </tr>
          `
        )
        .join("")
    )
    .join("");

  const memberCards = profiles
    .map(({ member, profile }) => {
      const top = roleRecommendations(member)[0];
      return `
        <article class="value-card">
          <header>
            <strong>${member.name}</strong>
            <span class="pill">${profile.total}</span>
          </header>
          <div class="value-bars">
            ${scoreBar("金銭的貢献", profile.money)}
            ${scoreBar("人的資本価値", profile.human)}
            ${scoreBar("組織影響", profile.organization)}
          </div>
          <p>次に伸ばす役割: <b>${top.model.role}</b>。${top.model.action}</p>
          <p>想定上昇: 金銭 +${top.moneyGain} / 人的資本 +${top.humanGain} / 組織影響 +${top.orgGain}。証跡: ${top.model.evidence}</p>
        </article>
      `;
    })
    .join("");

  const budget = state.tasks.length ? budgetEstimate() : null;
  $("rewardReport").innerHTML = `
    <div class="value-summary">
      <div class="metric">
        <small>評価軸</small>
        <strong>3</strong>
      </div>
      <div class="metric">
        <small>総合価値平均</small>
        <strong>${Math.round(profiles.reduce((sum, item) => sum + item.profile.total, 0) / profiles.length)}</strong>
      </div>
      <div class="metric">
        <small>最大伸びしろ</small>
        <strong>+${Math.max(...state.members.map((member) => roleRecommendations(member)[0].totalGain))}</strong>
      </div>
    </div>
    <table class="reward-table">
      <thead>
        <tr><th>メンバー</th><th>主な役割</th><th>金銭</th><th>人的資本</th><th>組織影響</th><th>配分率</th><th>報酬案</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="value-card-grid">${memberCards}</div>
    <h3 class="report-subhead">役割別の上昇シミュレーション</h3>
    <table class="reward-table">
      <thead>
        <tr><th>メンバー</th><th>順位</th><th>伸ばす役割</th><th>行動条件</th><th>金銭</th><th>人的資本</th><th>組織影響</th><th>予測総合</th></tr>
      </thead>
      <tbody>${roleRows}</tbody>
    </table>
    <div class="report-block">
      <strong>評価根拠</strong>
      <p>金銭的貢献は成果物・リスク削減・予算影響、人的資本価値はスキル獲得・自律性・信頼資産、組織影響は再現性・合意形成・文化形成を中心に評価します。自己申告だけでは高評価にならず、証跡とレビュー承認を重視する設計です。</p>
    </div>
    <div class="report-block">
      <strong>概算予算</strong>
      <p>${budget ? `労務・直接費・ツール費・リスク予備費を含む一般概算は ${yen(budget.total)} です。` : "PPM計画を生成すると概算予算が表示されます。"}</p>
    </div>
  `;
}

function scoreBar(label, score) {
  return `
    <div class="value-bar-row">
      <span>${label}</span>
      <div class="meter"><span style="width:${score}%"></span></div>
      <b>${score}</b>
    </div>
  `;
}

function buildReportMarkdown() {
  const pool = Number($("rewardPool").value || 0);
  const profiles = state.members.map((member) => ({ member, profile: memberValueProfile(member) }));
  const total = profiles.reduce((sum, item) => sum + item.profile.total, 0) || 1;
  const lines = [
    `# 岡田モデル 総合価値レポート`,
    ``,
    `## プロジェクト`,
    ``,
    `- 名称: ${$("projectName").value}`,
    `- 種別: ${$("projectType").selectedOptions[0]?.textContent || getProjectType()}`,
    `- 報酬プール: ${yen(pool)}`,
    ``,
    `## 総合評価`,
    ``,
    `| メンバー | 主な役割 | 金銭的貢献 | 人的資本価値 | 組織影響 | 配分率 | 報酬案 |`,
    `|---|---|---:|---:|---:|---:|---:|`,
    ...profiles.map(({ member, profile }) => {
      const percentage = (profile.total / total) * 100;
      return `| ${member.name} | ${member.role} | ${profile.money} | ${profile.human} | ${profile.organization} | ${percentage.toFixed(1)}% | ${yen(pool * (percentage / 100))} |`;
    }),
    ``,
    `## 役割別 上昇シミュレーション`,
    ``,
    `| メンバー | 推奨役割 | 行動条件 | 金銭上昇 | 人的資本上昇 | 組織影響上昇 | 予測総合 | 証跡 |`,
    `|---|---|---|---:|---:|---:|---:|---|`,
    ...profiles.flatMap(({ member }) =>
      roleRecommendations(member).map((rec) => `| ${member.name} | ${rec.model.role} | ${rec.model.action} | +${rec.moneyGain} | +${rec.humanGain} | +${rec.orgGain} | ${rec.projectedTotal} | ${rec.model.evidence} |`)
    ),
    ``,
    `## 評価基準`,
    ``,
    `- 金銭的貢献: 成果物、売上・費用削減、資金調達、納期短縮、リスク削減`,
    `- 人的資本価値: スキル獲得、実践転用、自律性、リーダーシップ、信頼資産、ナレッジ化`,
    `- 組織影響: プロセス改善、意思決定品質、組織学習、文化形成、ステークホルダー信頼、再現性`,
  ];
  return lines.join("\n");
}

async function copyReport() {
  const report = buildReportMarkdown();
  await navigator.clipboard.writeText(report);
  $("statusLabel").textContent = "レポートコピー済み";
}

function downloadReport() {
  const blob = new Blob([buildReportMarkdown()], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `okada-model-report-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  $("statusLabel").textContent = "レポート出力済み";
}

function addMember() {
  const names = ["高橋", "伊藤", "中村", "小林", "加藤"];
  const next = state.members.length + 1;
  const primary = ppmParameters[next % ppmParameters.length][0];
  state.members.push({
    id: next,
    name: names[(next - 4) % names.length] || `Member ${next}`,
    role: `${labelForParameter(primary)} 担当`,
    primary,
    base: 16,
    meeting: 0,
  });
  generateLocalPlan();
}

function loadSample() {
  $("projectName").value = "地域DAOによる空き施設再生プロジェクト";
  $("projectType").value = "ppp";
  $("duration").value = "16";
  $("riskLevel").value = "medium";
  $("overview").value =
    "地域の空き施設をDAO型チームで再生し、学習、交流、創業支援の拠点として運営する。行政、地域住民、事業者、学生が参加し、初期計画、資金調達、改修、運営設計、広報、イベント実施までを共同で進める。";
  loadWeights();
  renderWeights();
  generateLocalPlan();
}

function boot() {
  setupAccessGate();
  loadWeights();
  renderWeights();
  renderMembers();
  renderRewardReport();
  generateLocalPlan();
  checkAI();

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => setView(item.dataset.target));
  });
  $("aiStatusBtn").addEventListener("click", checkAI);
  $("generateBtn").addEventListener("click", async () => {
    loadWeights();
    renderWeights();
    $("statusLabel").textContent = "AI生成中";
    await generatePlan();
    setView("plan");
  });
  $("sampleBtn").addEventListener("click", loadSample);
  $("projectType").addEventListener("change", () => {
    loadWeights();
    renderWeights();
    generateLocalPlan();
  });
  $("duration").addEventListener("change", generateLocalPlan);
  $("riskLevel").addEventListener("change", () => {
    updateBudget();
    renderRewardReport();
  });
  $("weights").addEventListener("input", (event) => {
    const key = event.target.dataset.weight;
    if (!key) return;
    state.weights[key] = Number(event.target.value);
    renderWeights();
    updateScores();
  });
  $("addMemberBtn").addEventListener("click", addMember);
  $("analyzeMeetingBtn").addEventListener("click", async () => {
    $("meetingBadge").textContent = "分析中";
    await analyzeMeeting();
  });
  $("rewardPool").addEventListener("input", renderRewardReport);
  $("copyReportBtn").addEventListener("click", copyReport);
  $("downloadReportBtn").addEventListener("click", downloadReport);
}

boot();
