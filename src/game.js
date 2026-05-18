"use strict";

const LEGACY_SAVE_KEY = "pollymon.save.v1";
const SAVE_INDEX_KEY = "pollymon.saveIndex.v2";
const SAVE_SLOT_PREFIX = "pollymon.saveSlot.v2.";
const SETTINGS_KEY = "pollymon.settings.v1";
const MANUAL_SAVE_SLOTS = ["slot-1", "slot-2", "slot-3"];
const AUTOSAVE_SLOT_ID = "autosave";
const DEFAULT_MANUAL_SLOT = "slot-1";
const TILE = 32;
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 576;
const MAP_W = 42;
const MAP_H = 30;

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const els = {
  placeName: document.getElementById("placeName"),
  playerNameTag: document.getElementById("playerNameTag"),
  coordTag: document.getElementById("coordTag"),
  coinCount: document.getElementById("coinCount"),
  capsuleCount: document.getElementById("capsuleCount"),
  pauseButton: document.getElementById("pauseButton"),
  toast: document.getElementById("toast"),
  dialogue: document.getElementById("dialogue"),
  dialogueSpeaker: document.getElementById("dialogueSpeaker"),
  dialogueText: document.getElementById("dialogueText"),
  dialogueNext: document.getElementById("dialogueNext"),
  battle: document.getElementById("battle"),
  enemySprite: document.getElementById("enemySprite"),
  enemyName: document.getElementById("enemyName"),
  enemyLevel: document.getElementById("enemyLevel"),
  enemyHpBar: document.getElementById("enemyHpBar"),
  enemyHpText: document.getElementById("enemyHpText"),
  allySprite: document.getElementById("allySprite"),
  allyName: document.getElementById("allyName"),
  allyLevel: document.getElementById("allyLevel"),
  allyHpBar: document.getElementById("allyHpBar"),
  allyHpText: document.getElementById("allyHpText"),
  battleLog: document.getElementById("battleLog"),
  moveGrid: document.getElementById("moveGrid"),
  captureButton: document.getElementById("captureButton"),
  tonicButton: document.getElementById("tonicButton"),
  switchButton: document.getElementById("switchButton"),
  runButton: document.getElementById("runButton"),
  partyPanel: document.getElementById("partyPanel"),
  guidePanel: document.getElementById("guidePanel"),
  bagPanel: document.getElementById("bagPanel"),
  saveButton: document.getElementById("saveButton"),
  resetButton: document.getElementById("resetButton"),
  starterModal: document.getElementById("starterModal"),
  starterChoices: document.getElementById("starterChoices"),
  switchModal: document.getElementById("switchModal"),
  switchList: document.getElementById("switchList"),
  closeSwitch: document.getElementById("closeSwitch"),
  actionButton: document.getElementById("actionButton"),
  sprintButton: document.getElementById("sprintButton"),
  titleScreen: document.getElementById("titleScreen"),
  titleStatus: document.getElementById("titleStatus"),
  newGameButton: document.getElementById("newGameButton"),
  continueButton: document.getElementById("continueButton"),
  loadGameButton: document.getElementById("loadGameButton"),
  titleSettingsButton: document.getElementById("titleSettingsButton"),
  creditsButton: document.getElementById("creditsButton"),
  quitButton: document.getElementById("quitButton"),
  pauseMenu: document.getElementById("pauseMenu"),
  resumeButton: document.getElementById("resumeButton"),
  pauseSaveButton: document.getElementById("pauseSaveButton"),
  pauseProfileButton: document.getElementById("pauseProfileButton"),
  pausePartyButton: document.getElementById("pausePartyButton"),
  pauseInventoryButton: document.getElementById("pauseInventoryButton"),
  pauseArchiveButton: document.getElementById("pauseArchiveButton"),
  pauseSettingsButton: document.getElementById("pauseSettingsButton"),
  returnTitleButton: document.getElementById("returnTitleButton"),
  profileModal: document.getElementById("profileModal"),
  profileSprite: document.getElementById("profileSprite"),
  playerNameInput: document.getElementById("playerNameInput"),
  playerSpriteSelect: document.getElementById("playerSpriteSelect"),
  profileStats: document.getElementById("profileStats"),
  achievementList: document.getElementById("achievementList"),
  saveProfileButton: document.getElementById("saveProfileButton"),
  closeProfileButton: document.getElementById("closeProfileButton"),
  loadModal: document.getElementById("loadModal"),
  loadSummary: document.getElementById("loadSummary"),
  loadSlotList: document.getElementById("loadSlotList"),
  loadConfirmButton: document.getElementById("loadConfirmButton"),
  closeLoadButton: document.getElementById("closeLoadButton"),
  saveModal: document.getElementById("saveModal"),
  saveSlotList: document.getElementById("saveSlotList"),
  closeSaveButton: document.getElementById("closeSaveButton"),
  settingsModal: document.getElementById("settingsModal"),
  autosaveSetting: document.getElementById("autosaveSetting"),
  motionSetting: document.getElementById("motionSetting"),
  confirmNewGameSetting: document.getElementById("confirmNewGameSetting"),
  controlBindings: document.getElementById("controlBindings"),
  settingsDoneButton: document.getElementById("settingsDoneButton"),
  creditsModal: document.getElementById("creditsModal"),
  closeCreditsButton: document.getElementById("closeCreditsButton")
};

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const CONTROL_ACTIONS = [
  ["up", "Move Up"],
  ["down", "Move Down"],
  ["left", "Move Left"],
  ["right", "Move Right"],
  ["interact", "Interact"],
  ["sprint", "Sprint"],
  ["pause", "Pause"]
];

const CONTROL_ALIASES = {
  up: ["w", "W"],
  down: ["s", "S"],
  left: ["a", "A"],
  right: ["d", "D"],
  interact: [" "],
  pause: ["p", "P"]
};

const PLAYER_SPRITES = {
  sprig: { hat: "#ffd166", shirt: "#5dd39e", pants: "#2b3440", skin: "#e5b48d" },
  ember: { hat: "#ffe19a", shirt: "#ff9a55", pants: "#43302e", skin: "#e5b48d" },
  tide: { hat: "#d7fbff", shirt: "#63c7ee", pants: "#253a56", skin: "#d7a57f" }
};

const ACHIEVEMENTS = [
  ["firstPartner", "First Partner", "Choose your first Pollymon."],
  ["firstSave", "Journal Keeper", "Save a field journal."],
  ["firstSteps", "Boot Prints", "Walk 10 steps."],
  ["sprinter", "Trail Runner", "Sprint 10 steps."],
  ["firstBattle", "Field Tested", "Win a battle."],
  ["firstCapture", "New Bond", "Capture a wild Pollymon."],
  ["archiveFive", "Archive Clerk", "Register 5 Pollymon."],
  ["explorer", "Map Reader", "Visit 30 coordinates."]
];

const TYPE_COLORS = {
  leaf: "#72d572",
  ember: "#ff9a55",
  tide: "#63c7ee",
  spark: "#ffe36e",
  stone: "#b9aa7a",
  gale: "#9fd7c7",
  glow: "#f7c6ff",
  shade: "#a78bdc",
  plain: "#d8d3c6"
};

const TYPE_CHART = {
  leaf: { tide: 1.45, stone: 1.35, ember: 0.72, gale: 0.78 },
  ember: { leaf: 1.45, shade: 1.25, tide: 0.72, stone: 0.78 },
  tide: { ember: 1.45, stone: 1.35, leaf: 0.72, spark: 0.78 },
  spark: { tide: 1.45, gale: 1.35, stone: 0.62, leaf: 0.85 },
  stone: { ember: 1.3, spark: 1.45, gale: 1.25, tide: 0.72, leaf: 0.72 },
  gale: { leaf: 1.35, shade: 1.15, spark: 0.72, stone: 0.78 },
  glow: { shade: 1.55, stone: 0.82 },
  shade: { glow: 1.45, ember: 0.75 },
  plain: {}
};

const MOVES = {
  nudge: { name: "Nudge", type: "plain", power: 28, accuracy: 0.98 },
  pebbleFlick: { name: "Pebble Flick", type: "stone", power: 38, accuracy: 0.94 },
  leafLash: { name: "Leaf Lash", type: "leaf", power: 42, accuracy: 0.94 },
  rootSnare: { name: "Root Snare", type: "leaf", power: 34, accuracy: 0.9, debuff: "speed" },
  coalPop: { name: "Coal Pop", type: "ember", power: 42, accuracy: 0.94 },
  warmRush: { name: "Warm Rush", type: "ember", power: 54, accuracy: 0.86 },
  bubbleDart: { name: "Bubble Dart", type: "tide", power: 42, accuracy: 0.94 },
  brineTap: { name: "Brine Tap", type: "tide", power: 34, accuracy: 0.92, debuff: "attack" },
  staticSnap: { name: "Static Snap", type: "spark", power: 44, accuracy: 0.92, debuff: "speed" },
  gritGuard: { name: "Grit Guard", type: "stone", power: 0, accuracy: 1, buff: "defense" },
  galeNudge: { name: "Gale Nudge", type: "gale", power: 39, accuracy: 0.96 },
  duskTap: { name: "Dusk Tap", type: "shade", power: 43, accuracy: 0.92 },
  glowMend: { name: "Glow Mend", type: "glow", power: 0, accuracy: 1, heal: 0.3 },
  prismJolt: { name: "Prism Jolt", type: "glow", power: 50, accuracy: 0.9 }
};

const SPECIES = {
  frondle: {
    number: 1,
    name: "Frondle",
    type: "leaf",
    habitat: "Village gardens",
    blurb: "A bright sprout pal that reads the weather through its whiskers.",
    base: { hp: 46, attack: 38, defense: 42, speed: 35 },
    catchRate: 0.34,
    learnset: [
      [1, "nudge"],
      [1, "leafLash"],
      [5, "rootSnare"],
      [9, "glowMend"]
    ],
    art: { shape: "sprout", body: "#6fd174", accent: "#f2e77a", dark: "#28583a" }
  },
  cindlet: {
    number: 2,
    name: "Cindlet",
    type: "ember",
    habitat: "Warm stone paths",
    blurb: "It stores tiny hearth sparks in the curls along its back.",
    base: { hp: 42, attack: 46, defense: 34, speed: 42 },
    catchRate: 0.31,
    learnset: [
      [1, "nudge"],
      [1, "coalPop"],
      [5, "warmRush"],
      [9, "gritGuard"]
    ],
    art: { shape: "flare", body: "#f38b45", accent: "#ffe27a", dark: "#6b2f23" }
  },
  briskit: {
    number: 3,
    name: "Briskit",
    type: "tide",
    habitat: "Cold brooks",
    blurb: "A slick little swimmer with fins that hum when rain is near.",
    base: { hp: 48, attack: 36, defense: 38, speed: 42 },
    catchRate: 0.32,
    learnset: [
      [1, "nudge"],
      [1, "bubbleDart"],
      [5, "brineTap"],
      [9, "glowMend"]
    ],
    art: { shape: "fin", body: "#58bfe6", accent: "#d7fbff", dark: "#24506a" }
  },
  mossmop: {
    number: 4,
    name: "Mossmop",
    type: "leaf",
    habitat: "Tall meadow",
    blurb: "It sweeps seed dust into tidy trails and naps in the result.",
    base: { hp: 38, attack: 32, defense: 40, speed: 31 },
    catchRate: 0.45,
    learnset: [
      [1, "nudge"],
      [2, "leafLash"],
      [6, "rootSnare"]
    ],
    art: { shape: "moss", body: "#82c75a", accent: "#dce878", dark: "#314b2d" }
  },
  pluuma: {
    number: 5,
    name: "Pluuma",
    type: "gale",
    habitat: "Fence posts",
    blurb: "A round glider that gets offended by still air.",
    base: { hp: 36, attack: 34, defense: 30, speed: 52 },
    catchRate: 0.4,
    learnset: [
      [1, "nudge"],
      [2, "galeNudge"],
      [7, "staticSnap"]
    ],
    art: { shape: "wing", body: "#9bdac9", accent: "#fff4bd", dark: "#45645f" }
  },
  rumblet: {
    number: 6,
    name: "Rumblet",
    type: "stone",
    habitat: "Cave mouth",
    blurb: "A pebble-backed Pollymon that drums warnings through the ground.",
    base: { hp: 50, attack: 41, defense: 52, speed: 22 },
    catchRate: 0.28,
    learnset: [
      [1, "nudge"],
      [2, "pebbleFlick"],
      [6, "gritGuard"]
    ],
    art: { shape: "rock", body: "#b9aa7a", accent: "#f2d18a", dark: "#5a503a" }
  },
  zappip: {
    number: 7,
    name: "Zappip",
    type: "spark",
    habitat: "Storm reeds",
    blurb: "Its tail clicks against the air, making little blue sparks.",
    base: { hp: 34, attack: 42, defense: 30, speed: 56 },
    catchRate: 0.27,
    learnset: [
      [1, "nudge"],
      [3, "staticSnap"],
      [8, "prismJolt"]
    ],
    art: { shape: "spark", body: "#f4d65d", accent: "#72d8ff", dark: "#5d4a1c" }
  },
  dimmole: {
    number: 8,
    name: "Dimmole",
    type: "shade",
    habitat: "Mossy tunnels",
    blurb: "It folds shadows into soft bedding and carries them underground.",
    base: { hp: 44, attack: 45, defense: 36, speed: 34 },
    catchRate: 0.26,
    learnset: [
      [1, "nudge"],
      [3, "duskTap"],
      [8, "rootSnare"]
    ],
    art: { shape: "mole", body: "#8466b8", accent: "#cab7ff", dark: "#33264d" }
  },
  lumora: {
    number: 9,
    name: "Lumora",
    type: "glow",
    habitat: "Moonlit reeds",
    blurb: "It blinks in patterns that wandering travelers use like stars.",
    base: { hp: 40, attack: 38, defense: 34, speed: 46 },
    catchRate: 0.22,
    learnset: [
      [1, "nudge"],
      [3, "prismJolt"],
      [6, "glowMend"]
    ],
    art: { shape: "glow", body: "#f4b9f7", accent: "#fff6ae", dark: "#5f3f66" }
  },
  shellwick: {
    number: 10,
    name: "Shellwick",
    type: "tide",
    habitat: "River stones",
    blurb: "A shy shell-dweller that taps Morse-like notes against wet rocks.",
    base: { hp: 54, attack: 32, defense: 48, speed: 24 },
    catchRate: 0.3,
    learnset: [
      [1, "nudge"],
      [2, "bubbleDart"],
      [7, "gritGuard"]
    ],
    art: { shape: "shell", body: "#6cc8c7", accent: "#f7f0cf", dark: "#2c6970" }
  },
  emberyn: {
    number: 11,
    name: "Emberyn",
    type: "ember",
    habitat: "Old kiln",
    blurb: "It keeps one coal glowing under a crown of ash-white feathers.",
    base: { hp: 39, attack: 50, defense: 31, speed: 45 },
    catchRate: 0.24,
    learnset: [
      [1, "coalPop"],
      [3, "galeNudge"],
      [8, "warmRush"]
    ],
    art: { shape: "crest", body: "#e76547", accent: "#f7ecc2", dark: "#562420" }
  },
  cragoon: {
    number: 12,
    name: "Cragoon",
    type: "stone",
    habitat: "Old quarry",
    blurb: "Its rocky shoulders are covered with chalk marks from headbutts.",
    base: { hp: 58, attack: 48, defense: 57, speed: 18 },
    catchRate: 0.18,
    learnset: [
      [1, "pebbleFlick"],
      [4, "gritGuard"],
      [9, "warmRush"]
    ],
    art: { shape: "crag", body: "#9f8d62", accent: "#dcc273", dark: "#453a2b" }
  }
};

const STARTERS = ["frondle", "cindlet", "briskit"];

const TRAINERS = {
  ren: {
    name: "Scout Ren",
    reward: 38,
    party: [
      ["pluuma", 4],
      ["mossmop", 5]
    ],
    before: [
      "The east bridge is windy today.",
      "Let's see whether your partner can keep footing."
    ],
    after: ["Good steps. The bridge will remember that one."]
  },
  vala: {
    name: "Keeper Vala",
    reward: 55,
    party: [
      ["dimmole", 6],
      ["shellwick", 6],
      ["rumblet", 7]
    ],
    before: [
      "The quarry path has a temper.",
      "Show me a team that can listen to stone."
    ],
    after: ["That team has a steady pulse. Go on through."]
  }
};

const ENCOUNTERS = {
  wild: [
    ["mossmop", 34],
    ["pluuma", 24],
    ["shellwick", 16],
    ["zappip", 12],
    ["frondle", 8],
    ["lumora", 6]
  ],
  forest: [
    ["mossmop", 26],
    ["pluuma", 22],
    ["zappip", 20],
    ["dimmole", 18],
    ["lumora", 14]
  ],
  cave: [
    ["rumblet", 33],
    ["dimmole", 28],
    ["cragoon", 10],
    ["emberyn", 14],
    ["shellwick", 15]
  ],
  river: [
    ["briskit", 20],
    ["shellwick", 42],
    ["zappip", 18],
    ["lumora", 20]
  ]
};

let mode = "starter";
let state = freshState();
let world = buildWorld();
let battle = null;
let appScreen = "title";
let modeBeforePause = null;
let currentSlotId = null;
let moving = false;
let dialogueQueue = [];
let dialogueDone = null;
let toastTimer = 0;
let lastMoveAt = 0;
let settings = loadSettings();
let playSessionStartedAt = Date.now();
let awaitingControlAction = null;
let touchSprintActive = false;
let lastGamepadMoveAt = 0;
let gamepadActionHeld = false;

function freshState() {
  return {
    player: {
      name: "Ranger",
      sprite: "sprig",
      x: 11,
      y: 21,
      dir: "down",
      spawnPoint: { x: 11, y: 21, map: "Sprig Village" },
      currentMap: "Sprig Village",
      isMoving: false,
      isSprinting: false,
      animationStartedAt: Date.now()
    },
    party: [],
    reserve: [],
    inventory: { petals: 30, capsules: 5, tonics: 2 },
    seen: new Set(),
    caught: new Set(),
    flags: {},
    quests: { starterChosen: false, mapMarks: 0 },
    defeatedEnemies: [],
    collectedItems: [],
    stats: {
      stepsWalked: 0,
      sprintSteps: 0,
      interactions: 0,
      collisions: 0,
      battlesWon: 0,
      wildBattles: 0,
      trainerBattles: 0,
      captures: 0,
      saves: 0,
      loads: 0,
      controllerInputs: 0,
      visitedCoordinates: ["11,21"]
    },
    achievements: [],
    steps: 0,
    startedAt: Date.now(),
    playtime: 0
  };
}

function defaultSettings() {
  return {
    autosave: true,
    confirmNewGame: true,
    reducedMotion: false,
    controls: {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      interact: "Enter",
      sprint: "Shift",
      pause: "Escape"
    }
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const defaults = defaultSettings();
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...defaults, ...parsed, controls: { ...defaults.controls, ...(parsed.controls || {}) } };
  } catch (error) {
    console.warn("Could not load settings", error);
    return defaultSettings();
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function saveSlotStorageKey(slotId) {
  return `${SAVE_SLOT_PREFIX}${slotId}`;
}

function allSaveSlotIds() {
  return [...MANUAL_SAVE_SLOTS, AUTOSAVE_SLOT_ID];
}

function hasSavedGame() {
  return validSaveRecords().length > 0;
}

function hasCorruptSaves() {
  return allSaveSlotIds().some((slotId) => readSlotRecord(slotId).status === "corrupt");
}

function readSaveIndex() {
  try {
    const raw = localStorage.getItem(SAVE_INDEX_KEY);
    return raw ? JSON.parse(raw) : { version: 2, latestSlotId: null };
  } catch (error) {
    console.warn("Could not read save index", error);
    return { version: 2, latestSlotId: null, corrupt: true };
  }
}

function writeSaveIndex(latestSlotId = null) {
  const latestRecord = latestSlotId ? readSlotRecord(latestSlotId).record : latestSaveRecord();
  localStorage.setItem(
    SAVE_INDEX_KEY,
    JSON.stringify({
      version: 2,
      latestSlotId: latestRecord?.slotId || null,
      updatedAt: latestRecord?.savedAt || null
    })
  );
}

function serializeState() {
  updateQuestProgress();
  state.playtime = currentPlaytime();
  return {
    ...state,
    seen: [...state.seen],
    caught: [...state.caught]
  };
}

function reviveSavedState(saved) {
  const parsed = saved || {};
  parsed.seen = new Set(parsed.seen || []);
  parsed.caught = new Set(parsed.caught || []);
  parsed.inventory = {
    petals: 0,
    capsules: 0,
    tonics: 0,
    ...(parsed.inventory || {})
  };
  parsed.flags = parsed.flags || {};
  parsed.quests = {
    starterChosen: Boolean(parsed.flags.choseStarter),
    mapMarks: Number(parsed.flags.renDefeated || false) + Number(parsed.flags.valaDefeated || false),
    ...(parsed.quests || {})
  };
  parsed.defeatedEnemies = parsed.defeatedEnemies || [];
  parsed.collectedItems = parsed.collectedItems || [];
  parsed.reserve = parsed.reserve || [];
  parsed.party = (parsed.party || []).map(reviveMon);
  parsed.reserve = parsed.reserve.map(reviveMon);
  parsed.player = parsed.player || { x: 11, y: 21, dir: "down" };
  parsed.player = {
    ...freshState().player,
    ...parsed.player,
    spawnPoint: { ...freshState().player.spawnPoint, ...(parsed.player.spawnPoint || {}) }
  };
  parsed.steps = parsed.steps || 0;
  parsed.startedAt = parsed.startedAt || Date.now();
  parsed.playtime = parsed.playtime || 0;
  parsed.stats = {
    ...freshState().stats,
    ...(parsed.stats || {}),
    visitedCoordinates: parsed.stats?.visitedCoordinates || [`${parsed.player.x},${parsed.player.y}`]
  };
  parsed.achievements = parsed.achievements || [];
  parsed.player.currentMap = summaryPlace(parsed.player.x, parsed.player.y);
  return parsed;
}

function savePreviewFromState(payload, slotId, savedAt) {
  const party = payload.party || [];
  const location = payload.player ? summaryPlace(payload.player.x, payload.player.y) : "Sprig Village";
  return {
    slotId,
    savedAt,
    playerName: payload.player?.name || "Ranger",
    location,
    coordinates: payload.player ? { x: payload.player.x, y: payload.player.y } : { x: 11, y: 21 },
    party: party.map((mon) => ({
      name: SPECIES[mon.speciesId]?.name || "Unknown",
      level: mon.level || 1
    })),
    partyCount: party.length,
    inventory: payload.inventory || {},
    petals: payload.inventory?.petals || 0,
    caught: payload.caught?.length || 0,
    storyFlags: payload.flags || {},
    questProgress: payload.quests || {},
    defeatedEnemies: payload.defeatedEnemies || [],
    collectedItems: payload.collectedItems || [],
    playtime: payload.playtime || 0
  };
}

function createSaveRecord(slotId, kind) {
  const savedAt = new Date().toISOString();
  const payload = serializeState();
  return {
    version: 2,
    slotId,
    kind,
    label: slotLabel(slotId),
    savedAt,
    preview: savePreviewFromState(payload, slotId, savedAt),
    payload: {
      state: payload,
      settings: { ...settings }
    }
  };
}

function readSlotRecord(slotId) {
  try {
    const raw = localStorage.getItem(saveSlotStorageKey(slotId));
    if (!raw) return { status: "empty", slotId };
    const record = JSON.parse(raw);
    if (!record?.payload?.state || !record?.preview || record.slotId !== slotId) {
      return { status: "corrupt", slotId };
    }
    return { status: "ok", slotId, record };
  } catch (error) {
    console.warn(`Could not read save slot ${slotId}`, error);
    return { status: "corrupt", slotId };
  }
}

function validSaveRecords() {
  return allSaveSlotIds()
    .map((slotId) => readSlotRecord(slotId))
    .filter((entry) => entry.status === "ok")
    .map((entry) => entry.record)
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

function latestSaveRecord() {
  const index = readSaveIndex();
  if (index.latestSlotId) {
    const indexed = readSlotRecord(index.latestSlotId);
    if (indexed.status === "ok") return indexed.record;
  }
  return validSaveRecords()[0] || null;
}

function savedGameSummary(slotId = null) {
  if (slotId) {
    const entry = readSlotRecord(slotId);
    return entry.status === "ok" ? entry.record.preview : null;
  }
  return latestSaveRecord()?.preview || null;
}

function loadGame(slotId = null) {
  const record = slotId ? readSlotRecord(slotId).record : latestSaveRecord();
  if (!record) return null;
  try {
    settings = { ...defaultSettings(), ...(record.payload.settings || {}) };
    saveSettings();
    applySettings();
    currentSlotId = record.slotId;
    playSessionStartedAt = Date.now();
    const loaded = reviveSavedState(record.payload.state);
    loaded.stats.loads = (loaded.stats.loads || 0) + 1;
    return loaded;
  } catch (error) {
    console.warn("Could not load save", error);
    return null;
  }
}

function saveGame(show = true, slotId = DEFAULT_MANUAL_SLOT, options = {}) {
  if (!state.party.length) {
    if (show) showToast("Start a journal before saving.");
    return false;
  }

  const kind = slotId === AUTOSAVE_SLOT_ID ? "autosave" : "manual";
  const confirmOverwrite = options.confirmOverwrite !== false && kind === "manual";
  const existing = readSlotRecord(slotId);
  if (confirmOverwrite && existing.status === "ok") {
    const ok = window.confirm(`Overwrite ${slotLabel(slotId)}?`);
    if (!ok) return false;
  }

  if (kind === "manual") trackStatistic("saves");
  const record = createSaveRecord(slotId, kind);
  localStorage.setItem(saveSlotStorageKey(slotId), JSON.stringify(record));
  writeSaveIndex(slotId);
  currentSlotId = slotId;
  playSessionStartedAt = Date.now();
  renderTitleScreen();
  renderSaveModal();
  renderLoadModal();
  if (show) showToast("Field journal saved.");
  return true;
}

function deleteSaveSlot(slotId) {
  const entry = readSlotRecord(slotId);
  if (entry.status === "empty") return;
  const ok = window.confirm(`Delete ${slotLabel(slotId)}?`);
  if (!ok) return;
  localStorage.removeItem(saveSlotStorageKey(slotId));
  if (currentSlotId === slotId) currentSlotId = null;
  writeSaveIndex();
  renderTitleScreen("Save slot deleted.");
  renderSaveModal();
  renderLoadModal();
}

function slotLabel(slotId) {
  if (slotId === AUTOSAVE_SLOT_ID) return "Autosave";
  const index = MANUAL_SAVE_SLOTS.indexOf(slotId);
  return index >= 0 ? `Slot ${index + 1}` : "Save Slot";
}

function currentPlaytime() {
  return Math.max(0, (state.playtime || 0) + (Date.now() - playSessionStartedAt));
}

function formatPlaytime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function updateQuestProgress() {
  state.quests = {
    ...(state.quests || {}),
    starterChosen: Boolean(state.flags.choseStarter),
    mapMarks: Number(state.flags.renDefeated || false) + Number(state.flags.valaDefeated || false)
  };
  updateAchievements();
}

function markCollectedItem(itemId) {
  if (!state.collectedItems.includes(itemId)) state.collectedItems.push(itemId);
}

function recordEnemyDefeat(entry) {
  state.defeatedEnemies.push({
    ...entry,
    at: new Date().toISOString()
  });
  state.defeatedEnemies = state.defeatedEnemies.slice(-100);
}

function trackStatistic(name, amount = 1) {
  state.stats[name] = (state.stats[name] || 0) + amount;
  updateAchievements();
}

function updatePlayerLocation() {
  state.player.currentMap = summaryPlace(state.player.x, state.player.y);
  const coordinate = `${state.player.x},${state.player.y}`;
  if (!state.stats.visitedCoordinates.includes(coordinate)) {
    state.stats.visitedCoordinates.push(coordinate);
  }
}

function updateAchievements() {
  const unlocked = new Set(state.achievements || []);
  const checks = {
    firstPartner: state.party.length > 0,
    firstSave: (state.stats.saves || 0) > 0,
    firstSteps: (state.stats.stepsWalked || 0) >= 10,
    sprinter: (state.stats.sprintSteps || 0) >= 10,
    firstBattle: (state.stats.battlesWon || 0) > 0,
    firstCapture: (state.stats.captures || 0) > 0,
    archiveFive: state.caught.size >= 5,
    explorer: (state.stats.visitedCoordinates || []).length >= 30
  };

  for (const [id] of ACHIEVEMENTS) {
    if (checks[id]) unlocked.add(id);
  }
  state.achievements = [...unlocked];
}

function openProfileModal() {
  renderProfile();
  els.profileModal.classList.remove("hidden");
}

function closeProfileModal() {
  els.profileModal.classList.add("hidden");
}

function saveProfile() {
  state.player.name = cleanPlayerName(els.playerNameInput.value);
  state.player.sprite = PLAYER_SPRITES[els.playerSpriteSelect.value]
    ? els.playerSpriteSelect.value
    : "sprig";
  updateHud();
  renderProfile();
  showToast("Ranger card updated.");
}

function cleanPlayerName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ").slice(0, 18);
  return name || "Ranger";
}

function renderProfile() {
  updatePlayerLocation();
  updateAchievements();
  els.playerNameInput.value = state.player.name;
  els.playerSpriteSelect.value = state.player.sprite;
  els.profileSprite.innerHTML = playerSvg(state.player.sprite, "down", false, false, 1.8);
  els.profileStats.innerHTML = `
    <div class="profile-stat-grid">
      ${profileStat("Location", state.player.currentMap)}
      ${profileStat("Coordinates", `${state.player.x}, ${state.player.y}`)}
      ${profileStat("Currency", `${state.inventory.petals} petals`)}
      ${profileStat("Playtime", formatPlaytime(currentPlaytime()))}
      ${profileStat("Steps", state.stats.stepsWalked)}
      ${profileStat("Sprint Steps", state.stats.sprintSteps)}
      ${profileStat("Battles Won", state.stats.battlesWon)}
      ${profileStat("Captures", state.stats.captures)}
      ${profileStat("Visited Tiles", state.stats.visitedCoordinates.length)}
      ${profileStat("Controller Inputs", state.stats.controllerInputs)}
    </div>
  `;
  els.achievementList.innerHTML = ACHIEVEMENTS.map(([id, title, text]) => {
    const unlocked = state.achievements.includes(id);
    return `
      <article class="achievement-card ${unlocked ? "" : "locked"}">
        <strong>${unlocked ? title : "Locked"}</strong>
        <span>${text}</span>
      </article>
    `;
  }).join("");
}

function profileStat(label, value) {
  return `<div class="stat-pill"><strong>${escapeHtml(value)}</strong><span>${label}</span></div>`;
}

function renderControlBindings() {
  els.controlBindings.innerHTML = CONTROL_ACTIONS.map(
    ([action, label]) => `
      <button class="control-bind" data-control-action="${action}">
        ${label}
        <span>${escapeHtml(keyLabel(settings.controls[action]))}</span>
      </button>
    `
  ).join("");
  els.controlBindings.querySelectorAll("[data-control-action]").forEach((button) => {
    button.addEventListener("click", () => {
      awaitingControlAction = button.dataset.controlAction;
      button.querySelector("span").textContent = "Press key";
    });
  });
}

function keyLabel(key) {
  const labels = {
    " ": "Space",
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right"
  };
  return labels[key] || key;
}

function normalizeKey(event) {
  if (event.key === "ShiftLeft" || event.key === "ShiftRight") return "Shift";
  if (event.key === " ") return " ";
  if (event.key === "Esc") return "Escape";
  return event.key;
}

function keyMatches(event, action) {
  const key = normalizeKey(event);
  return key === settings.controls[action] || (CONTROL_ALIASES[action] || []).includes(key);
}

function isSprintActive(event = null) {
  return (
    touchSprintActive ||
    Boolean(event?.shiftKey) ||
    (event ? keyMatches(event, "sprint") : false)
  );
}

function migrateLegacySave() {
  if (hasSavedGame()) return;
  try {
    const raw = localStorage.getItem(LEGACY_SAVE_KEY);
    if (!raw) return;
    const legacy = reviveSavedState(JSON.parse(raw));
    const previousState = state;
    state = legacy;
    const record = createSaveRecord(DEFAULT_MANUAL_SLOT, "manual");
    localStorage.setItem(saveSlotStorageKey(DEFAULT_MANUAL_SLOT), JSON.stringify(record));
    writeSaveIndex(DEFAULT_MANUAL_SLOT);
    state = previousState;
  } catch (error) {
    console.warn("Could not migrate legacy save", error);
  }
}

function applySettings() {
  document.body.classList.toggle("reduce-motion", settings.reducedMotion);
  els.autosaveSetting.checked = settings.autosave;
  els.motionSetting.checked = settings.reducedMotion;
  els.confirmNewGameSetting.checked = settings.confirmNewGame;
  renderControlBindings();
}

function renderTitleScreen(message = "") {
  const summary = savedGameSummary();
  els.continueButton.disabled = !summary;
  els.loadGameButton.disabled = !summary;

  if (message) {
    els.titleStatus.textContent = message;
    return;
  }

  if (!summary) {
    els.titleStatus.textContent = hasCorruptSaves()
      ? "No usable save. A corrupt slot can be deleted from Load Game."
      : "No saved journal yet.";
    return;
  }

  els.titleStatus.textContent = `${summary.playerName || "Ranger"} / ${summary.location} / ${summary.partyCount} partner${summary.partyCount === 1 ? "" : "s"} / ${summary.caught} archived / ${formatPlaytime(summary.playtime)}`;
}

function showTitleScreen(message = "") {
  appScreen = "title";
  modeBeforePause = null;
  els.titleScreen.classList.remove("hidden");
  els.pauseMenu.classList.add("hidden");
  els.loadModal.classList.add("hidden");
  els.settingsModal.classList.add("hidden");
  els.creditsModal.classList.add("hidden");
  els.switchModal.classList.add("hidden");
  els.dialogue.classList.add("hidden");
  els.starterModal.classList.add("hidden");
  renderTitleScreen(message);
  updateShellControls();
}

function hideTitleScreen() {
  appScreen = "game";
  els.titleScreen.classList.add("hidden");
  updateShellControls();
}

function startNewGame() {
  if (settings.confirmNewGame && hasSavedGame()) {
    const ok = window.confirm("Start a new Pollymon journal? Existing save slots will stay until overwritten or deleted.");
    if (!ok) return;
  }

  state = freshState();
  currentSlotId = null;
  playSessionStartedAt = Date.now();
  battle = null;
  mode = "starter";
  dialogueQueue = [];
  dialogueDone = null;
  els.battle.classList.add("hidden");
  closeUtilityModals();
  hideTitleScreen();
  renderAll();
  openProfileModal();
}

function continueSavedGame() {
  const saved = loadGame();
  if (!saved) {
    renderTitleScreen("No saved journal found.");
    return;
  }

  state = saved;
  battle = null;
  mode = state.party.length ? "world" : "starter";
  dialogueQueue = [];
  dialogueDone = null;
  els.battle.classList.add("hidden");
  closeUtilityModals();
  hideTitleScreen();
  renderAll();
  showToast("Journal loaded.");
}

function loadSaveSlot(slotId) {
  const saved = loadGame(slotId);
  if (!saved) {
    renderLoadModal("That save slot is missing or corrupt.");
    return;
  }

  state = saved;
  battle = null;
  mode = state.party.length ? "world" : "starter";
  dialogueQueue = [];
  dialogueDone = null;
  els.battle.classList.add("hidden");
  closeUtilityModals();
  hideTitleScreen();
  renderAll();
  showToast(`${slotLabel(slotId)} loaded.`);
}

function openLoadModal() {
  renderLoadModal();
  els.loadModal.classList.remove("hidden");
}

function openSaveModal() {
  renderSaveModal();
  els.saveModal.classList.remove("hidden");
}

function renderLoadModal(message = "") {
  const summary = savedGameSummary();
  els.loadConfirmButton.disabled = !summary;
  els.loadSummary.innerHTML = summary
    ? `
      <strong>Latest: ${summary.location}</strong>
      <span>${summary.partyCount} partner${summary.partyCount === 1 ? "" : "s"} / ${summary.caught} archived / ${formatPlaytime(summary.playtime)}</span>
      <span>${formatSaveDate(summary.savedAt)} at ${formatSaveTime(summary.savedAt)}</span>
    `
    : `<strong>${message || (hasCorruptSaves() ? "No usable save" : "No saved journal")}</strong><span>${hasCorruptSaves() ? "Delete corrupt slots below or start a fresh journal." : "Start a new game to create one."}</span>`;
  els.loadSlotList.innerHTML = allSaveSlotIds()
    .map((slotId) => slotCardMarkup(slotId, "load"))
    .join("");
  bindSlotButtons(els.loadSlotList, "load");
}

function renderSaveModal() {
  if (!els.saveSlotList) return;
  els.saveSlotList.innerHTML = MANUAL_SAVE_SLOTS.map((slotId) =>
    slotCardMarkup(slotId, "save")
  ).join("");
  bindSlotButtons(els.saveSlotList, "save");
}

function slotCardMarkup(slotId, action) {
  const entry = readSlotRecord(slotId);
  const isManualAction = action === "save";
  const className = `slot-card ${entry.status}`;
  const primaryLabel = isManualAction ? "Save" : "Load";
  const primaryDisabled =
    (isManualAction && !state.party.length) ||
    (!isManualAction && entry.status !== "ok") ||
    (isManualAction && slotId === AUTOSAVE_SLOT_ID);
  const deleteDisabled = entry.status === "empty";

  return `
    <article class="${className}">
      <div class="slot-copy">
        <strong>${slotLabel(slotId)}</strong>
        ${slotPreviewMarkup(entry)}
      </div>
      <div class="slot-actions">
        <button class="command-button" data-slot-action="${action}" data-slot-id="${slotId}" ${primaryDisabled ? "disabled" : ""}>${primaryLabel}</button>
        <button class="danger-button" data-slot-action="delete" data-slot-id="${slotId}" ${deleteDisabled ? "disabled" : ""}>Delete</button>
      </div>
    </article>
  `;
}

function slotPreviewMarkup(entry) {
  if (entry.status === "empty") {
    return `<span>Empty slot</span><span>No timestamp yet.</span>`;
  }

  if (entry.status === "corrupt") {
    return `<span>Corrupt save data</span><span>This slot cannot be loaded.</span>`;
  }

  const preview = entry.record.preview;
  const party = preview.party?.length
    ? preview.party.map((mon) => `${mon.name} Lv ${mon.level}`).join(", ")
    : "No party";
  return `
    <span>${preview.location} / ${formatPlaytime(preview.playtime)}</span>
    <span>${formatSaveDate(preview.savedAt)} at ${formatSaveTime(preview.savedAt)}</span>
    <span>${party}</span>
    <span>${preview.petals} petals / ${preview.caught} archived / ${Object.keys(preview.storyFlags || {}).length} story flags</span>
  `;
}

function bindSlotButtons(root, modeName) {
  root.querySelectorAll("[data-slot-action]").forEach((button) => {
    const slotId = button.dataset.slotId;
    const action = button.dataset.slotAction;
    if (action === "save") {
      button.addEventListener("click", () => {
        saveGame(true, slotId);
        renderSaveModal();
      });
    } else if (action === "load") {
      button.addEventListener("click", () => loadSaveSlot(slotId));
    } else if (action === "delete") {
      button.addEventListener("click", () => {
        deleteSaveSlot(slotId);
        if (modeName === "save") renderSaveModal();
        else renderLoadModal();
      });
    }
  });
}

function closeUtilityModals() {
  els.loadModal.classList.add("hidden");
  els.saveModal.classList.add("hidden");
  els.profileModal.classList.add("hidden");
  els.settingsModal.classList.add("hidden");
  els.creditsModal.classList.add("hidden");
}

function openSettingsModal() {
  applySettings();
  els.settingsModal.classList.remove("hidden");
}

function closeSettingsModal() {
  els.settingsModal.classList.add("hidden");
}

function openCreditsModal() {
  els.creditsModal.classList.remove("hidden");
}

function closeCreditsModal() {
  els.creditsModal.classList.add("hidden");
}

function quitGame() {
  if (state.party.length) saveGame(false, currentSlotId || AUTOSAVE_SLOT_ID, { confirmOverwrite: false });
  renderTitleScreen("Journal safe. Close the browser tab to exit.");
}

function openPauseMenu() {
  if (appScreen !== "game") return;
  if (mode === "battle") {
    showToast("Finish this battle before opening the field menu.");
    return;
  }
  if (mode === "paused") return;

  modeBeforePause = mode;
  mode = "paused";
  els.pauseMenu.classList.remove("hidden");
}

function resumeGame() {
  if (mode === "paused") {
    mode = modeBeforePause || (state.party.length ? "world" : "starter");
  }
  modeBeforePause = null;
  els.pauseMenu.classList.add("hidden");
}

function pauseSave() {
  if (!state.party.length) return;
  openSaveModal();
}

function returnToTitle() {
  if (state.party.length) saveGame(false, currentSlotId || AUTOSAVE_SLOT_ID, { confirmOverwrite: false });
  battle = null;
  mode = state.party.length ? "world" : "starter";
  els.battle.classList.add("hidden");
  showTitleScreen("Returned to title.");
}

function openPanelFromPause(panel) {
  setPanel(panel);
  resumeGame();
}

function setPanel(panel) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panel);
  });
  document.querySelectorAll(".panel-body").forEach((panelBody) => {
    panelBody.classList.remove("active");
  });
  document.getElementById(`${panel}Panel`).classList.add("active");
}

function updateShellControls() {
  els.pauseButton.disabled = appScreen !== "game";
}

function formatSaveDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatSaveTime(value) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });
}

function reviveMon(mon) {
  const species = SPECIES[mon.speciesId];
  const revived = {
    uid: mon.uid || makeId(),
    speciesId: mon.speciesId,
    nickname: mon.nickname || "",
    level: mon.level || 1,
    xp: mon.xp || 0,
    hp: mon.hp || 1,
    moves: mon.moves && mon.moves.length ? mon.moves : movesFor(mon.speciesId, mon.level || 1),
    buffs: {}
  };
  if (!species) return revived;
  revived.hp = clamp(revived.hp, 0, maxHp(revived));
  return revived;
}

function buildWorld() {
  const tiles = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => "meadow")
  );
  const objects = [];

  function set(x, y, tile) {
    if (inBounds(x, y)) tiles[y][x] = tile;
  }

  function fill(x, y, w, h, tile) {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) set(xx, yy, tile);
    }
  }

  for (let x = 0; x < MAP_W; x += 1) {
    set(x, 0, "tree");
    set(x, MAP_H - 1, "tree");
  }
  for (let y = 0; y < MAP_H; y += 1) {
    set(0, y, "tree");
    set(MAP_W - 1, y, "tree");
  }

  fill(2, 2, 9, 7, "wild");
  fill(17, 3, 10, 8, "forest");
  fill(29, 2, 3, 21, "water");
  fill(33, 4, 6, 6, "cave");
  fill(32, 12, 6, 6, "wild");
  fill(4, 24, 12, 3, "flower");

  for (let x = 3; x <= 36; x += 1) set(x, 20, "path");
  for (let y = 9; y <= 25; y += 1) set(12, y, "path");
  for (let y = 7; y <= 23; y += 1) set(27, y, "path");
  for (let x = 12; x <= 27; x += 1) set(x, 12, "path");
  for (let x = 29; x <= 31; x += 1) set(x, 20, "bridge");
  for (let y = 17; y <= 22; y += 1) set(31, y, "water");
  set(29, 20, "bridge");
  set(30, 20, "bridge");
  set(31, 20, "bridge");

  addBuilding(6, 15, 5, 4, "clinic", 8, 19);
  addBuilding(14, 15, 5, 4, "market", 16, 19);
  addBuilding(6, 22, 6, 4, "lab", 9, 21);

  set(25, 19, "sign");
  set(36, 10, "sign");
  set(10, 20, "fountain");

  objects.push({
    x: 13,
    y: 20,
    kind: "npc",
    name: "Ranger Mira",
    blocks: true,
    action: () => {
      if (!state.flags.miraGift) {
        state.flags.miraGift = true;
        state.inventory.capsules += 3;
        markCollectedItem("mira-capsule-gift");
        showDialogue("Ranger Mira", [
          "Your map mark is fresh. Take three spare charm capsules.",
          "Tall grass rustles when a wild Pollymon is close."
        ]);
      } else {
        showDialogue("Ranger Mira", [
          "Bond before bravado.",
          "A rested party notices openings that a tired one misses."
        ]);
      }
    }
  });

  objects.push({
    x: 25,
    y: 20,
    kind: "trainer",
    id: "ren",
    name: "Scout Ren",
    blocks: true,
    action: () => talkTrainer("ren")
  });

  objects.push({
    x: 35,
    y: 12,
    kind: "trainer",
    id: "vala",
    name: "Keeper Vala",
    blocks: true,
    action: () => talkTrainer("vala")
  });

  objects.push({
    x: 8,
    y: 19,
    kind: "door",
    name: "Sprig Clinic",
    action: () => {
      healParty();
      showDialogue("Sprig Clinic", ["Your Pollymon stretch, sparkle, and look ready again."]);
    }
  });
  objects.push({
    x: 16,
    y: 19,
    kind: "door",
    name: "Capsule Stall",
    action: () => visitMarket()
  });
  objects.push({
    x: 9,
    y: 21,
    kind: "door",
    name: "Lantern Lab",
    action: () =>
      showDialogue("Lantern Lab", [
        "Mira's shelves are full of field notes, rain jars, and half-drawn maps.",
        "A card on the desk reads: Pollymon trust steady footsteps."
      ])
  });
  objects.push({
    x: 25,
    y: 19,
    kind: "sign",
    name: "Bridge Sign",
    action: () =>
      showDialogue("Bridge Sign", [
        "East: Old Quarry. North: Hushwood. South: Sprig Village."
      ])
  });
  objects.push({
    x: 36,
    y: 10,
    kind: "sign",
    name: "Quarry Marker",
    action: () =>
      showDialogue("Quarry Marker", [
        "The cave fields hold sturdier Pollymon. Bring tonics and patience."
      ])
  });
  objects.push({
    x: 10,
    y: 20,
    kind: "fountain",
    name: "Rainwell",
    action: () => {
      healParty();
      showToast("The Rainwell hums through the party.");
    }
  });

  function addBuilding(x, y, w, h, tile, doorX, doorY) {
    fill(x, y, w, h, tile);
    fill(x, y, w, 1, `${tile}Roof`);
    set(doorX, doorY, "path");
  }

  return { tiles, objects };
}

function inBounds(x, y) {
  return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
}

function tileAt(x, y) {
  if (!inBounds(x, y)) return "tree";
  return world.tiles[y][x];
}

function objectAt(x, y) {
  return world.objects.find((object) => object.x === x && object.y === y);
}

function isBlocked(x, y) {
  const tile = tileAt(x, y);
  if (
    [
      "tree",
      "water",
      "clinic",
      "clinicRoof",
      "market",
      "marketRoof",
      "lab",
      "labRoof"
    ].includes(tile)
  ) {
    return true;
  }
  const object = objectAt(x, y);
  return Boolean(object && object.blocks);
}

function makeId() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createMon(speciesId, level) {
  const mon = {
    uid: makeId(),
    speciesId,
    nickname: "",
    level,
    xp: 0,
    hp: 1,
    moves: movesFor(speciesId, level),
    buffs: {}
  };
  mon.hp = maxHp(mon);
  return mon;
}

function movesFor(speciesId, level) {
  return SPECIES[speciesId].learnset
    .filter(([learnLevel]) => learnLevel <= level)
    .map(([, move]) => move)
    .slice(-4);
}

function displayName(mon) {
  return mon.nickname || SPECIES[mon.speciesId].name;
}

function maxHp(mon) {
  const species = SPECIES[mon.speciesId];
  return Math.floor(species.base.hp + 12 + mon.level * 6.2);
}

function stat(mon, statName) {
  const species = SPECIES[mon.speciesId];
  const buff = mon.buffs?.[statName] || 0;
  const base = species.base[statName] + mon.level * (statName === "speed" ? 2.2 : 2.7);
  return Math.max(5, Math.floor(base * (1 + buff * 0.22)));
}

function xpToNext(level) {
  return Math.floor(26 + level * level * 5.4);
}

function levelProgress(mon) {
  return clamp((mon.xp / xpToNext(mon.level)) * 100, 0, 100);
}

function gainXp(mon, amount) {
  let gained = `${displayName(mon)} gained ${amount} glimmer.`;
  mon.xp += amount;
  while (mon.xp >= xpToNext(mon.level)) {
    mon.xp -= xpToNext(mon.level);
    mon.level += 1;
    const beforeMoves = mon.moves.join(",");
    mon.moves = movesFor(mon.speciesId, mon.level);
    mon.hp = maxHp(mon);
    gained += ` ${displayName(mon)} reached level ${mon.level}.`;
    if (beforeMoves !== mon.moves.join(",")) gained += " A new move clicked into place.";
  }
  return gained;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function weightedPick(pool) {
  const total = pool.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [value, weight] of pool) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return pool[0][0];
}

function partyAverageLevel() {
  if (!state.party.length) return 3;
  return (
    state.party.reduce((sum, mon) => sum + mon.level, 0) / Math.max(1, state.party.length)
  );
}

function activeMon() {
  if (!battle) return firstHealthy();
  return state.party[battle.activeIndex];
}

function firstHealthy() {
  return state.party.find((mon) => mon.hp > 0) || null;
}

function firstHealthyIndex() {
  return state.party.findIndex((mon) => mon.hp > 0);
}

function healParty() {
  for (const mon of state.party) {
    mon.hp = maxHp(mon);
    mon.buffs = {};
  }
  renderPanels();
}

function chooseStarter(speciesId) {
  const starter = createMon(speciesId, 5);
  state.party = [starter];
  state.seen.add(speciesId);
  state.caught.add(speciesId);
  state.flags.choseStarter = true;
  state.quests.starterChosen = true;
  updateAchievements();
  appScreen = "game";
  mode = "world";
  els.titleScreen.classList.add("hidden");
  els.starterModal.classList.add("hidden");
  showDialogue("Ranger Mira", [
    `${SPECIES[speciesId].name} bumps the latch open before you can ask.`,
    "The first map mark is yours. The fields beyond Sprig Village are awake."
  ]);
  saveGame(false);
  renderAll();
}

function talkTrainer(id) {
  const trainer = TRAINERS[id];
  if (state.flags[`${id}Defeated`]) {
    showDialogue(trainer.name, trainer.after);
    return;
  }
  showDialogue(trainer.name, trainer.before, () => startTrainerBattle(id));
}

function visitMarket() {
  if (state.inventory.petals >= 20) {
    state.inventory.petals -= 20;
    state.inventory.capsules += 3;
    markCollectedItem("capsule-stall-bundle");
    showDialogue("Capsule Stall", [
      "Three charm capsules slide into your bag.",
      "The stall keeper marks your journal with fresh amber ink."
    ]);
  } else {
    showDialogue("Capsule Stall", [
      "Three charm capsules cost 20 petals.",
      "Wild Pollymon sometimes leave petals after a fair battle."
    ]);
  }
  renderPanels();
  updateHud();
}

function interact() {
  if (mode === "dialogue") {
    nextDialogue();
    return;
  }
  if (mode !== "world") return;
  trackStatistic("interactions");
  const here = objectAt(state.player.x, state.player.y);
  if (here && !here.blocks) {
    here.action();
    return;
  }
  const dir = DIRS[state.player.dir];
  const target = { x: state.player.x + dir.x, y: state.player.y + dir.y };
  const object = objectAt(target.x, target.y);
  if (object) object.action();
}

function showDialogue(speaker, lines, onDone = null) {
  dialogueQueue = [...lines];
  dialogueDone = onDone;
  mode = "dialogue";
  els.dialogueSpeaker.textContent = speaker;
  els.dialogue.classList.remove("hidden");
  nextDialogue();
}

function nextDialogue() {
  if (!dialogueQueue.length) {
    els.dialogue.classList.add("hidden");
    mode = battle ? "battle" : "world";
    const done = dialogueDone;
    dialogueDone = null;
    if (done) done();
    return;
  }
  els.dialogueText.textContent = dialogueQueue.shift();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => els.toast.classList.add("hidden"), 2200);
}

function attemptMove(direction, sprinting = false) {
  if (mode !== "world" || moving) return;
  const now = performance.now();
  const stepDelay = sprinting ? 52 : 90;
  if (now - lastMoveAt < stepDelay) return;
  lastMoveAt = now;
  const delta = DIRS[direction];
  state.player.dir = direction;
  state.player.isSprinting = Boolean(sprinting);
  const nextX = state.player.x + delta.x;
  const nextY = state.player.y + delta.y;
  if (isBlocked(nextX, nextY)) {
    trackStatistic("collisions");
    state.player.isMoving = false;
    drawWorld();
    return;
  }
  state.player.x = nextX;
  state.player.y = nextY;
  state.player.animationStartedAt = now;
  state.player.isMoving = true;
  state.steps += 1;
  trackStatistic("stepsWalked");
  if (sprinting) trackStatistic("sprintSteps");
  updateHud();
  drawWorld();
  maybeEncounter();
}

function maybeEncounter() {
  const tile = tileAt(state.player.x, state.player.y);
  const encounterTiles = {
    wild: 0.12,
    forest: 0.14,
    cave: 0.16,
    flower: 0.06
  };
  const chance = encounterTiles[tile] || 0;
  if (!chance || state.steps < 4) return;
  if (Math.random() < chance) startWildBattle(tile === "flower" ? "wild" : tile);
}

function startWildBattle(zone) {
  const activeIndex = firstHealthyIndex();
  if (activeIndex < 0) {
    showToast("The party needs care.");
    return;
  }
  const pool = ENCOUNTERS[zone] || ENCOUNTERS.wild;
  const speciesId = weightedPick(pool);
  const average = partyAverageLevel();
  const bonus = zone === "cave" ? 2 : zone === "forest" ? 1 : 0;
  const level = clamp(Math.round(average + bonus + (Math.random() * 3 - 1)), 2, 12);
  const enemy = createMon(speciesId, level);
  trackStatistic("wildBattles");
  state.seen.add(speciesId);
  battle = {
    type: "wild",
    zone,
    enemy,
    activeIndex,
    turnLocked: false,
    log: [`A wild ${SPECIES[speciesId].name} rustled out!`]
  };
  mode = "battle";
  els.battle.classList.remove("hidden");
  renderBattle();
  renderPanels();
}

function startTrainerBattle(id) {
  const activeIndex = firstHealthyIndex();
  if (activeIndex < 0) {
    showToast("The party needs care.");
    return;
  }
  const trainer = TRAINERS[id];
  trackStatistic("trainerBattles");
  const enemyParty = trainer.party.map(([speciesId, level]) => createMon(speciesId, level));
  state.seen.add(enemyParty[0].speciesId);
  battle = {
    type: "trainer",
    trainerId: id,
    enemyParty,
    enemyIndex: 0,
    enemy: enemyParty[0],
    activeIndex,
    turnLocked: false,
    log: [`${trainer.name} sent out ${displayName(enemyParty[0])}!`]
  };
  mode = "battle";
  els.battle.classList.remove("hidden");
  renderBattle();
  renderPanels();
}

async function playerMove(moveId) {
  if (!battle || battle.turnLocked) return;
  const player = activeMon();
  const enemy = battle.enemy;
  if (!player || player.hp <= 0) return;
  battle.turnLocked = true;

  const playerFirst = stat(player, "speed") >= stat(enemy, "speed") || Math.random() < 0.08;
  if (playerFirst) {
    await useMove(player, enemy, moveId, true);
    if (await checkEnemyFainted()) return;
    await sleep(450);
    await enemyTurn();
    await checkPlayerFainted();
  } else {
    await enemyTurn();
    if (!(await checkPlayerFainted())) {
      await sleep(450);
      await useMove(player, enemy, moveId, true);
      await checkEnemyFainted();
    }
  }

  if (battle) battle.turnLocked = false;
  renderBattle();
  renderPanels();
}

async function enemyTurn() {
  if (!battle) return;
  const enemy = battle.enemy;
  const player = activeMon();
  if (!enemy || enemy.hp <= 0 || !player || player.hp <= 0) return;
  const moveId = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
  await useMove(enemy, player, moveId, false);
}

async function useMove(attacker, defender, moveId, fromPlayer) {
  const move = MOVES[moveId];
  const attackerName = displayName(attacker);
  if (Math.random() > move.accuracy) {
    pushBattleLog(`${attackerName}'s ${move.name} slipped wide.`);
    renderBattle();
    await sleep(460);
    return;
  }

  if (move.heal) {
    const amount = Math.max(8, Math.floor(maxHp(attacker) * move.heal));
    attacker.hp = clamp(attacker.hp + amount, 0, maxHp(attacker));
    pushBattleLog(`${attackerName} used ${move.name} and recovered ${amount} HP.`);
    renderBattle();
    await sleep(520);
    return;
  }

  if (move.buff) {
    attacker.buffs[move.buff] = clamp((attacker.buffs[move.buff] || 0) + 1, -2, 3);
    pushBattleLog(`${attackerName} used ${move.name}. Its ${move.buff} rose.`);
    renderBattle();
    await sleep(520);
    return;
  }

  const effect = typeEffect(move.type, SPECIES[defender.speciesId].type);
  const stab = SPECIES[attacker.speciesId].type === move.type ? 1.16 : 1;
  const crit = Math.random() < 0.08 ? 1.5 : 1;
  const variation = 0.88 + Math.random() * 0.22;
  const attack = stat(attacker, "attack");
  const defense = Math.max(8, stat(defender, "defense"));
  const raw = ((attacker.level * 2 + 10) * move.power * (attack / defense)) / 18 + 3;
  const damage = Math.max(1, Math.floor(raw * effect * stab * crit * variation));
  defender.hp = clamp(defender.hp - damage, 0, maxHp(defender));

  let message = `${attackerName} used ${move.name}.`;
  if (crit > 1) message += " Clean hit.";
  if (effect > 1.1) message += " It landed strong.";
  if (effect < 0.9) message += " It barely bit.";
  message += ` ${displayName(defender)} lost ${damage} HP.`;
  pushBattleLog(message);

  if (move.debuff && defender.hp > 0 && Math.random() < 0.36) {
    defender.buffs[move.debuff] = clamp((defender.buffs[move.debuff] || 0) - 1, -2, 3);
    pushBattleLog(`${displayName(defender)}'s ${move.debuff} dipped.`);
  }

  renderBattle();
  await sleep(fromPlayer ? 560 : 620);
}

function typeEffect(moveType, targetType) {
  return TYPE_CHART[moveType]?.[targetType] || 1;
}

async function checkEnemyFainted() {
  if (!battle || battle.enemy.hp > 0) return false;
  pushBattleLog(`${displayName(battle.enemy)} settled down.`);
  recordEnemyDefeat({
    type: battle.type,
    trainerId: battle.trainerId || null,
    speciesId: battle.enemy.speciesId,
    level: battle.enemy.level
  });
  renderBattle();
  await sleep(650);

  if (battle.type === "trainer") {
    battle.enemyIndex += 1;
    if (battle.enemyIndex < battle.enemyParty.length) {
      battle.enemy = battle.enemyParty[battle.enemyIndex];
      state.seen.add(battle.enemy.speciesId);
      pushBattleLog(`${TRAINERS[battle.trainerId].name} sent out ${displayName(battle.enemy)}!`);
      battle.turnLocked = false;
      renderBattle();
      return true;
    }
    finishBattle(true);
    return true;
  }

  finishBattle(true);
  return true;
}

async function checkPlayerFainted() {
  if (!battle) return true;
  const player = activeMon();
  if (!player || player.hp > 0) return false;
  pushBattleLog(`${displayName(player)} needs a rest.`);
  renderBattle();
  await sleep(650);

  const next = firstHealthyIndex();
  if (next < 0) {
    blackout();
    return true;
  }
  openSwitch(true);
  return true;
}

function finishBattle(won) {
  if (!battle) return;
  if (won) {
    trackStatistic("battlesWon");
    const trainer = battle.type === "trainer" ? TRAINERS[battle.trainerId] : null;
    const baseReward = trainer ? trainer.reward : 12 + battle.enemy.level * 4;
    const xp = trainer ? 46 + battle.enemy.level * 12 : 28 + battle.enemy.level * 9;
    const healthy = state.party.filter((mon) => mon.hp > 0);
    if (healthy.length) {
      const main = activeMon() || healthy[0];
      pushBattleLog(gainXp(main, xp));
      for (const mon of healthy) {
        if (mon.uid !== main.uid) mon.xp += Math.floor(xp * 0.18);
      }
    }
    state.inventory.petals += baseReward;
    if (trainer) {
      state.flags[`${battle.trainerId}Defeated`] = true;
      updateQuestProgress();
      pushBattleLog(`${trainer.name} shared ${baseReward} petals.`);
    } else {
      pushBattleLog(`You gathered ${baseReward} petals from the grass.`);
    }
  }

  const endLog = [...battle.log];
  battle = null;
  window.setTimeout(() => {
    els.battle.classList.add("hidden");
    mode = "world";
    showToast(endLog[endLog.length - 1] || "The field quiets.");
    renderAll();
    saveGame(false);
  }, 900);
}

function blackout() {
  const lost = Math.min(state.inventory.petals, 12);
  state.inventory.petals -= lost;
  healParty();
  state.player.x = 8;
  state.player.y = 20;
  state.player.dir = "down";
  battle = null;
  els.battle.classList.add("hidden");
  mode = "world";
  showDialogue("Sprig Clinic", [
    "Ranger Mira found your party resting by the path.",
    lost ? `${lost} petals scattered, but everyone is safe.` : "No petals were lost."
  ]);
  renderAll();
  saveGame(false);
}

async function tryCapture() {
  if (!battle || battle.turnLocked || battle.type !== "wild") return;
  if (state.inventory.capsules <= 0) {
    pushBattleLog("No charm capsules left.");
    renderBattle();
    return;
  }

  battle.turnLocked = true;
  state.inventory.capsules -= 1;
  const enemy = battle.enemy;
  const species = SPECIES[enemy.speciesId];
  const hpMissing = 1 - enemy.hp / maxHp(enemy);
  const levelGap = (partyAverageLevel() - enemy.level) * 0.025;
  const chance = clamp(species.catchRate + hpMissing * 0.55 + levelGap, 0.08, 0.86);
  pushBattleLog(`The charm capsule rings around ${species.name}.`);
  renderBattle();
  await sleep(750);

  if (Math.random() < chance) {
    state.seen.add(enemy.speciesId);
    state.caught.add(enemy.speciesId);
    enemy.buffs = {};
    if (state.party.length < 6) {
      state.party.push(enemy);
      pushBattleLog(`${species.name} joined the party.`);
    } else {
      state.reserve.push(enemy);
      pushBattleLog(`${species.name} went to the meadow reserve.`);
    }
    trackStatistic("captures");
    finishBattle(false);
    return;
  }

  pushBattleLog(`${species.name} shook free.`);
  renderBattle();
  await sleep(650);
  await enemyTurn();
  await checkPlayerFainted();
  if (battle) battle.turnLocked = false;
  renderBattle();
  renderPanels();
}

async function useTonic() {
  if (!battle || battle.turnLocked) return;
  if (state.inventory.tonics <= 0) {
    pushBattleLog("No dew tonics left.");
    renderBattle();
    return;
  }
  const mon = activeMon();
  if (!mon || mon.hp <= 0) return;
  battle.turnLocked = true;
  state.inventory.tonics -= 1;
  const amount = Math.floor(maxHp(mon) * 0.42);
  mon.hp = clamp(mon.hp + amount, 0, maxHp(mon));
  pushBattleLog(`${displayName(mon)} drank a dew tonic and recovered ${amount} HP.`);
  renderBattle();
  renderPanels();
  await sleep(650);
  await enemyTurn();
  await checkPlayerFainted();
  if (battle) battle.turnLocked = false;
  renderBattle();
}

async function tryRun() {
  if (!battle || battle.turnLocked || battle.type !== "wild") return;
  battle.turnLocked = true;
  const player = activeMon();
  const chance = clamp(0.5 + (stat(player, "speed") - stat(battle.enemy, "speed")) / 140, 0.25, 0.92);
  if (Math.random() < chance) {
    pushBattleLog("You slipped back to the path.");
    const log = [...battle.log];
    battle = null;
    window.setTimeout(() => {
      els.battle.classList.add("hidden");
      mode = "world";
      showToast(log[log.length - 1]);
      renderAll();
    }, 450);
    return;
  }
  pushBattleLog("The grass closed around your feet.");
  renderBattle();
  await sleep(650);
  await enemyTurn();
  await checkPlayerFainted();
  if (battle) battle.turnLocked = false;
  renderBattle();
}

function pushBattleLog(message) {
  if (!battle) return;
  battle.log.push(message);
  battle.log = battle.log.slice(-5);
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function openSwitch(forced = false) {
  if (!battle) return;
  renderSwitchList(forced);
  els.switchModal.classList.remove("hidden");
}

async function switchTo(index, forced = false) {
  if (!battle || battle.turnLocked) return;
  const mon = state.party[index];
  if (!mon || mon.hp <= 0 || index === battle.activeIndex) return;
  battle.activeIndex = index;
  els.switchModal.classList.add("hidden");
  pushBattleLog(`${displayName(mon)} stepped in.`);
  renderBattle();
  renderPanels();
  if (!forced) {
    battle.turnLocked = true;
    await sleep(420);
    await enemyTurn();
    await checkPlayerFainted();
    if (battle) battle.turnLocked = false;
  }
  renderBattle();
}

function renderSwitchList(forced) {
  els.switchList.innerHTML = "";
  state.party.forEach((mon, index) => {
    const button = document.createElement("button");
    button.className = "switch-card";
    button.disabled = mon.hp <= 0 || index === battle?.activeIndex;
    button.innerHTML = `
      <div class="mon-sprite">${monSvg(mon.speciesId)}</div>
      <div>
        <div class="party-name-line">
          <strong>${displayName(mon)}</strong>
          <span>Lv ${mon.level}</span>
        </div>
        <div class="hp-track"><span class="${hpPercent(mon) < 28 ? "low" : ""}" style="width:${hpPercent(mon)}%"></span></div>
        <div class="mini-text">${mon.hp}/${maxHp(mon)} HP</div>
      </div>
    `;
    button.addEventListener("click", () => switchTo(index, forced));
    els.switchList.appendChild(button);
  });
}

function hpPercent(mon) {
  return clamp((mon.hp / maxHp(mon)) * 100, 0, 100);
}

function renderBattle() {
  if (!battle) return;
  const ally = activeMon();
  const enemy = battle.enemy;
  els.enemySprite.innerHTML = monSvg(enemy.speciesId);
  els.enemyName.textContent = displayName(enemy);
  els.enemyLevel.textContent = `Lv ${enemy.level}`;
  els.enemyHpBar.style.width = `${hpPercent(enemy)}%`;
  els.enemyHpBar.className = hpPercent(enemy) < 28 ? "low" : "";
  els.enemyHpText.textContent = `${enemy.hp}/${maxHp(enemy)} HP`;

  els.allySprite.innerHTML = monSvg(ally.speciesId);
  els.allyName.textContent = displayName(ally);
  els.allyLevel.textContent = `Lv ${ally.level}`;
  els.allyHpBar.style.width = `${hpPercent(ally)}%`;
  els.allyHpBar.className = hpPercent(ally) < 28 ? "low" : "";
  els.allyHpText.textContent = `${ally.hp}/${maxHp(ally)} HP`;

  els.battleLog.innerHTML = battle.log.map((line) => `<div>${escapeHtml(line)}</div>`).join("");
  els.battleLog.scrollTop = els.battleLog.scrollHeight;

  els.moveGrid.innerHTML = "";
  for (const moveId of ally.moves) {
    const move = MOVES[moveId];
    const button = document.createElement("button");
    button.className = "move-button";
    button.disabled = battle.turnLocked;
    button.innerHTML = `<strong>${move.name}</strong><span>${move.type} / ${move.power || "care"}</span>`;
    button.addEventListener("click", () => playerMove(moveId));
    els.moveGrid.appendChild(button);
  }

  els.captureButton.disabled = battle.turnLocked || battle.type !== "wild";
  els.captureButton.textContent =
    battle.type === "wild" ? `Capsule (${state.inventory.capsules})` : "No Capsule";
  els.tonicButton.disabled = battle.turnLocked;
  els.tonicButton.textContent = `Tonic (${state.inventory.tonics})`;
  els.switchButton.disabled = battle.turnLocked;
  els.runButton.disabled = battle.turnLocked || battle.type !== "wild";
  els.runButton.textContent = battle.type === "wild" ? "Run" : "Stay";
  updateHud();
}

function renderAll() {
  renderStarters();
  renderPanels();
  updateHud();
  drawWorld();
  renderTitleScreen();
  updateShellControls();
  if (appScreen === "title") {
    els.starterModal.classList.add("hidden");
    return;
  }
  if (state.party.length) {
    mode = mode === "starter" ? "world" : mode;
    els.starterModal.classList.add("hidden");
  } else {
    mode = "starter";
    els.starterModal.classList.remove("hidden");
  }
}

function renderStarters() {
  els.starterChoices.innerHTML = "";
  for (const speciesId of STARTERS) {
    const species = SPECIES[speciesId];
    const button = document.createElement("button");
    button.className = "starter-card";
    button.innerHTML = `
      <div class="mon-sprite">${monSvg(speciesId)}</div>
      <h3>${species.name}</h3>
      ${typeChip(species.type)}
      <p>${species.blurb}</p>
    `;
    button.addEventListener("click", () => chooseStarter(speciesId));
    els.starterChoices.appendChild(button);
  }
}

function renderPanels() {
  renderParty();
  renderGuide();
  renderBag();
  updateHud();
}

function renderParty() {
  if (!state.party.length) {
    els.partyPanel.innerHTML = `<div class="bag-card"><strong>No partner yet</strong><div class="bag-text">The first lantern is waiting.</div></div>`;
    return;
  }
  els.partyPanel.innerHTML = state.party
    .map((mon) => {
      const species = SPECIES[mon.speciesId];
      return `
        <article class="party-card ${mon.hp <= 0 ? "fainted" : ""}">
          <div class="mon-sprite">${monSvg(mon.speciesId)}</div>
          <div>
            <div class="party-name-line">
              <strong>${displayName(mon)}</strong>
              <span>Lv ${mon.level}</span>
            </div>
            ${typeChip(species.type)}
            <div class="hp-track"><span class="${hpPercent(mon) < 28 ? "low" : ""}" style="width:${hpPercent(mon)}%"></span></div>
            <div class="party-meta">${mon.hp}/${maxHp(mon)} HP</div>
            <div class="xp-track"><span style="width:${levelProgress(mon)}%"></span></div>
            <div class="party-meta">${Math.floor(levelProgress(mon))}% to next level</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderGuide() {
  const speciesList = Object.entries(SPECIES).sort(([, a], [, b]) => a.number - b.number);
  els.guidePanel.innerHTML = speciesList
    .map(([speciesId, species]) => {
      const seen = state.seen.has(speciesId);
      const caught = state.caught.has(speciesId);
      return `
        <article class="guide-card ${seen ? "" : "dim"}">
          <div class="guide-name-line">
            <strong>${String(species.number).padStart(2, "0")} ${seen ? species.name : "Unknown"}</strong>
            ${seen ? typeChip(species.type) : ""}
          </div>
          <div class="guide-text">${seen ? species.blurb : "No field notes yet."}</div>
          <div class="guide-dots">
            <span class="dot" style="background:${seen ? TYPE_COLORS[species.type] : "transparent"}"></span>
            <span class="mini-text">${caught ? "Bonded" : seen ? "Seen" : "Unseen"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBag() {
  const caughtCount = state.caught.size;
  const seenCount = state.seen.size;
  const ren = state.flags.renDefeated;
  const vala = state.flags.valaDefeated;
  els.bagPanel.innerHTML = `
    <article class="bag-card">
      <div class="bag-line"><strong>Petals</strong><span>${state.inventory.petals}</span></div>
      <div class="bag-text">Village trade tokens gathered from fair battles.</div>
    </article>
    <article class="bag-card">
      <div class="bag-line"><strong>Charm Capsules</strong><span>${state.inventory.capsules}</span></div>
      <div class="bag-text">Best thrown after a wild Pollymon is worn down.</div>
    </article>
    <article class="bag-card">
      <div class="bag-line"><strong>Dew Tonics</strong><span>${state.inventory.tonics}</span></div>
      <div class="bag-text">Restores a partner during battle.</div>
    </article>
    <article class="bag-card">
      <div class="bag-line"><strong>Field Notes</strong><span>${caughtCount}/${Object.keys(SPECIES).length}</span></div>
      <div class="bag-text">${seenCount} species seen. ${state.reserve.length} in meadow reserve.</div>
    </article>
    <article class="bag-card">
      <div class="bag-line"><strong>Ranger</strong><span>${escapeHtml(state.player.name)}</span></div>
      <div class="bag-text">${state.player.currentMap} at ${state.player.x}, ${state.player.y}. ${formatPlaytime(currentPlaytime())} logged.</div>
    </article>
    <article class="bag-card">
      <div class="bag-line"><strong>Map Marks</strong><span>${Number(ren) + Number(vala)}/2</span></div>
      <div class="bag-text">${ren ? "East bridge marked." : "Scout Ren waits by the east bridge."}</div>
      <div class="bag-text">${vala ? "Quarry marked." : "Keeper Vala watches the quarry path."}</div>
    </article>
  `;
}

function updateHud() {
  updatePlayerLocation();
  els.playerNameTag.textContent = state.player.name;
  els.placeName.textContent = placeName();
  els.coordTag.textContent = `${state.player.x}, ${state.player.y}`;
  els.coinCount.textContent = `${state.inventory.petals} petals`;
  els.capsuleCount.textContent = `${state.inventory.capsules} capsules`;
}

function placeName() {
  const { x, y } = state.player;
  return summaryPlace(x, y);
}

function summaryPlace(x, y) {
  const tile = tileAt(x, y);
  if (x < 18 && y > 13) return "Sprig Village";
  if (tile === "forest") return "Hushwood";
  if (tile === "cave" || x > 32) return "Old Quarry";
  if (tile === "wild" || tile === "flower") return "Amberfield";
  if (tile === "bridge") return "East Bridge";
  return "Pollinia Path";
}

function typeChip(type) {
  return `<span class="type-chip" style="background:${TYPE_COLORS[type]}">${type}</span>`;
}

function monSvg(speciesId) {
  const species = SPECIES[speciesId];
  const art = species.art;
  const eye = "#141c1c";
  const shine = "rgba(255,255,255,.72)";
  const common = `
    <ellipse cx="64" cy="102" rx="42" ry="10" fill="rgba(0,0,0,.18)" />
    <ellipse cx="64" cy="67" rx="34" ry="31" fill="${art.body}" />
    <ellipse cx="51" cy="62" rx="5" ry="7" fill="${eye}" />
    <ellipse cx="77" cy="62" rx="5" ry="7" fill="${eye}" />
    <circle cx="53" cy="59" r="2" fill="${shine}" />
    <circle cx="79" cy="59" r="2" fill="${shine}" />
  `;

  const shapes = {
    sprout: `
      <path d="M45 38 C37 21 44 12 62 31 C70 11 86 17 77 39" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" stroke-linejoin="round" />
      ${common}
      <path d="M38 78 C26 76 20 65 29 58 C38 54 43 62 45 72" fill="${art.body}" stroke="${art.dark}" stroke-width="4" />
      <path d="M85 78 C99 76 105 65 96 58 C88 54 83 62 81 72" fill="${art.body}" stroke="${art.dark}" stroke-width="4" />
      <path d="M48 86 C57 94 71 94 80 86" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
    `,
    flare: `
      <path d="M46 35 C47 16 66 23 62 6 C81 22 91 38 78 51" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" stroke-linejoin="round" />
      ${common}
      <path d="M37 84 C24 89 22 104 38 104 C48 104 51 94 47 86" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      <path d="M83 87 C94 93 96 105 81 104 C74 103 72 94 76 87" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      <path d="M49 84 Q64 95 79 84" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
    `,
    fin: `
      <path d="M36 52 C25 38 35 24 54 41" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      <path d="M92 52 C103 38 93 24 74 41" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      ${common}
      <path d="M64 35 C58 18 70 18 64 35" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      <path d="M50 83 C58 89 70 89 78 83" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
    `,
    moss: `
      <path d="M35 50 C27 30 48 34 49 21 C57 35 68 31 70 18 C80 34 96 31 91 53" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" stroke-linejoin="round" />
      ${common}
      <path d="M31 78 C18 85 25 99 39 94" fill="${art.body}" stroke="${art.dark}" stroke-width="4" />
      <path d="M92 78 C109 86 101 101 88 94" fill="${art.body}" stroke="${art.dark}" stroke-width="4" />
    `,
    wing: `
      <path d="M39 61 C13 43 19 85 45 82" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      <path d="M89 61 C115 43 109 85 83 82" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      ${common}
      <path d="M51 82 Q64 90 77 82" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
    `,
    rock: `
      <path d="M35 51 L47 29 L68 23 L88 37 L95 65 L80 95 L49 97 L31 77 Z" fill="${art.body}" stroke="${art.dark}" stroke-width="5" stroke-linejoin="round" />
      <path d="M48 32 L58 46 L76 31" fill="none" stroke="${art.accent}" stroke-width="5" stroke-linecap="round" />
      <ellipse cx="54" cy="61" rx="5" ry="7" fill="${eye}" />
      <ellipse cx="76" cy="61" rx="5" ry="7" fill="${eye}" />
      <path d="M52 79 C60 85 70 85 78 79" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="64" cy="102" rx="42" ry="10" fill="rgba(0,0,0,.18)" />
    `,
    spark: `
      <path d="M58 12 L79 45 L65 45 L81 79 L43 38 L59 39 Z" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" stroke-linejoin="round" />
      ${common}
      <path d="M40 86 L28 98 L44 98" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" stroke-linejoin="round" />
      <path d="M85 86 L100 97 L82 99" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" stroke-linejoin="round" />
    `,
    mole: `
      <path d="M34 60 C22 45 34 31 50 43" fill="${art.dark}" stroke="${art.dark}" stroke-width="4" />
      <path d="M94 60 C106 45 94 31 78 43" fill="${art.dark}" stroke="${art.dark}" stroke-width="4" />
      ${common}
      <path d="M44 87 C55 96 74 96 84 87" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
      <path d="M38 78 L22 84 M90 78 L106 84" stroke="${art.accent}" stroke-width="5" stroke-linecap="round" />
    `,
    glow: `
      <circle cx="64" cy="64" r="48" fill="${art.accent}" opacity=".28" />
      <path d="M45 33 C50 14 78 14 83 33" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      ${common}
      <circle cx="64" cy="48" r="7" fill="${art.accent}" />
      <path d="M50 83 Q64 93 78 83" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
    `,
    shell: `
      <path d="M26 70 C31 38 55 29 80 39 C102 48 104 81 86 94 C65 111 33 98 26 70" fill="${art.accent}" stroke="${art.dark}" stroke-width="5" />
      <path d="M36 76 C42 54 58 47 79 51 M48 92 C57 72 69 65 91 67" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="64" cy="70" rx="28" ry="23" fill="${art.body}" />
      <ellipse cx="55" cy="67" rx="5" ry="7" fill="${eye}" />
      <ellipse cx="73" cy="67" rx="5" ry="7" fill="${eye}" />
      <ellipse cx="64" cy="102" rx="42" ry="10" fill="rgba(0,0,0,.18)" />
    `,
    crest: `
      <path d="M40 44 C44 18 58 36 61 12 C69 37 83 16 87 44" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" stroke-linejoin="round" />
      ${common}
      <path d="M37 82 C23 85 24 101 41 99" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
      <path d="M88 82 C104 86 101 102 86 98" fill="${art.accent}" stroke="${art.dark}" stroke-width="4" />
    `,
    crag: `
      <path d="M26 78 L38 42 L55 49 L64 21 L78 50 L96 42 L105 80 L83 99 L48 101 Z" fill="${art.body}" stroke="${art.dark}" stroke-width="5" stroke-linejoin="round" />
      <ellipse cx="55" cy="67" rx="5" ry="7" fill="${eye}" />
      <ellipse cx="77" cy="67" rx="5" ry="7" fill="${eye}" />
      <path d="M53 84 Q65 92 79 84" fill="none" stroke="${art.dark}" stroke-width="4" stroke-linecap="round" />
      <path d="M44 50 L53 59 M82 50 L74 59" stroke="${art.accent}" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="64" cy="104" rx="44" ry="10" fill="rgba(0,0,0,.18)" />
    `
  };

  return `
    <svg viewBox="0 0 128 128" role="img" aria-label="${species.name}" xmlns="http://www.w3.org/2000/svg">
      ${shapes[art.shape] || common}
    </svg>
  `;
}

function drawWorld() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const px = state.player.x * TILE + TILE / 2;
  const py = state.player.y * TILE + TILE / 2;
  const cameraX = clamp(px - CANVAS_WIDTH / 2, 0, MAP_W * TILE - CANVAS_WIDTH);
  const cameraY = clamp(py - CANVAS_HEIGHT / 2, 0, MAP_H * TILE - CANVAS_HEIGHT);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (let y = 0; y < MAP_H; y += 1) {
    for (let x = 0; x < MAP_W; x += 1) drawTile(x, y, tileAt(x, y));
  }

  for (const object of world.objects) drawObject(object);
  drawPlayer(state.player.x, state.player.y, state.player.dir);

  ctx.restore();
}

function drawTile(x, y, tile) {
  const sx = x * TILE;
  const sy = y * TILE;
  const hash = tileHash(x, y);
  const colors = {
    meadow: "#3f8b54",
    wild: "#317c4d",
    forest: "#266b45",
    flower: "#4d8b52",
    path: "#b89358",
    bridge: "#a06f45",
    water: "#3e9fc5",
    cave: "#6c675d",
    tree: "#1f5c3c",
    clinic: "#d8f2ef",
    clinicRoof: "#dd5e5e",
    market: "#f0e2bc",
    marketRoof: "#d6a13d",
    lab: "#d7d1ee",
    labRoof: "#6e83bd",
    sign: "#b89358",
    fountain: "#b89358"
  };
  ctx.fillStyle = colors[tile] || colors.meadow;
  ctx.fillRect(sx, sy, TILE, TILE);

  if (tile === "meadow" || tile === "wild" || tile === "forest" || tile === "flower") {
    ctx.fillStyle = tile === "forest" ? "rgba(13,44,30,.45)" : "rgba(255,255,255,.12)";
    for (let i = 0; i < 3; i += 1) {
      const ox = (hash * (i + 3) * 17) % TILE;
      const oy = (hash * (i + 5) * 11) % TILE;
      ctx.fillRect(sx + ox, sy + oy, 2, tile === "wild" || tile === "forest" ? 9 : 5);
    }
    if (tile === "flower") {
      ctx.fillStyle = hash % 2 ? "#ffd166" : "#f4b9f7";
      ctx.beginPath();
      ctx.arc(sx + 8 + (hash % 17), sy + 8 + (hash % 13), 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (tile === "path") {
    ctx.fillStyle = "rgba(82,54,30,.18)";
    ctx.fillRect(sx, sy + 14, TILE, 4);
  }

  if (tile === "bridge") {
    ctx.fillStyle = "#704b32";
    ctx.fillRect(sx, sy + 4, TILE, 4);
    ctx.fillRect(sx, sy + 24, TILE, 4);
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.strokeRect(sx + 1, sy + 1, TILE - 2, TILE - 2);
  }

  if (tile === "water") {
    ctx.strokeStyle = "rgba(255,255,255,.32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + 3, sy + 11 + (hash % 4));
    ctx.quadraticCurveTo(sx + 12, sy + 6, sx + 21, sy + 11);
    ctx.quadraticCurveTo(sx + 27, sy + 15, sx + 31, sy + 12);
    ctx.stroke();
  }

  if (tile === "tree") {
    ctx.fillStyle = "#17462f";
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = "#2f7c4a";
    ctx.beginPath();
    ctx.arc(sx + 16, sy + 16, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#255f3d";
    ctx.beginPath();
    ctx.arc(sx + 9, sy + 18, 10, 0, Math.PI * 2);
    ctx.arc(sx + 22, sy + 12, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  if (tile.endsWith("Roof")) {
    ctx.fillStyle = "rgba(0,0,0,.16)";
    ctx.fillRect(sx, sy + TILE - 5, TILE, 5);
  }

  if (["clinic", "market", "lab"].includes(tile)) {
    ctx.fillStyle = "rgba(58,40,32,.26)";
    ctx.fillRect(sx + 4, sy + 10, TILE - 8, TILE - 10);
  }

  if (tile === "cave") {
    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.fillRect(sx + 3, sy + 3, TILE - 6, TILE - 6);
    ctx.fillStyle = hash % 3 === 0 ? "#8d806d" : "#5d594f";
    ctx.fillRect(sx + (hash % 20), sy + (hash % 18), 5, 4);
  }
}

function drawObject(object) {
  const sx = object.x * TILE;
  const sy = object.y * TILE;
  if (object.kind === "npc" || object.kind === "trainer") {
    const isTrainer = object.kind === "trainer";
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse(sx + 16, sy + 27, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isTrainer ? "#ffd166" : "#5dd39e";
    ctx.fillRect(sx + 9, sy + 12, 14, 14);
    ctx.fillStyle = isTrainer ? "#8f5a35" : "#3f5f6c";
    ctx.fillRect(sx + 10, sy + 5, 12, 9);
    ctx.fillStyle = "#f2c8a0";
    ctx.fillRect(sx + 11, sy + 9, 10, 8);
    ctx.fillStyle = "#20302e";
    ctx.fillRect(sx + 9, sy + 25, 5, 6);
    ctx.fillRect(sx + 18, sy + 25, 5, 6);
    return;
  }

  if (object.kind === "door") {
    ctx.fillStyle = "#473128";
    ctx.fillRect(sx + 9, sy + 8, 14, 24);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(sx + 20, sy + 19, 3, 3);
    return;
  }

  if (object.kind === "sign") {
    ctx.fillStyle = "#6e4a2e";
    ctx.fillRect(sx + 14, sy + 14, 4, 16);
    ctx.fillStyle = "#d4a85f";
    ctx.fillRect(sx + 5, sy + 5, 22, 13);
    ctx.strokeStyle = "#5b3a22";
    ctx.strokeRect(sx + 5.5, sy + 5.5, 21, 12);
    return;
  }

  if (object.kind === "fountain") {
    ctx.fillStyle = "#4a8091";
    ctx.beginPath();
    ctx.ellipse(sx + 16, sy + 19, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8fe2ff";
    ctx.beginPath();
    ctx.arc(sx + 16, sy + 15, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(x, y, dir) {
  const sx = x * TILE;
  const sy = y * TILE;
  const now = performance.now();
  const movingNow = state.player.isMoving && now - state.player.animationStartedAt < 180;
  if (!movingNow) state.player.isMoving = false;
  const sprinting = state.player.isSprinting && movingNow;
  const palette = PLAYER_SPRITES[state.player.sprite] || PLAYER_SPRITES.sprig;
  const phase = movingNow
    ? Math.sin((now - state.player.animationStartedAt) / (sprinting ? 34 : 48))
    : Math.sin(now / 520) * 0.35;
  const bob = movingNow ? Math.abs(phase) * (sprinting ? 3 : 2) : phase;
  const arm = movingNow ? phase * 3 : 0;
  const leg = movingNow ? phase * 2 : 0;

  ctx.fillStyle = "rgba(0,0,0,.24)";
  ctx.beginPath();
  ctx.ellipse(sx + 16, sy + 28, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.pants;
  ctx.fillRect(sx + 9, sy + 23 + Math.max(0, leg), 5, 7);
  ctx.fillRect(sx + 18, sy + 23 + Math.max(0, -leg), 5, 7);
  ctx.fillStyle = palette.shirt;
  ctx.fillRect(sx + 9, sy + 14 + bob, 14, 12);
  ctx.fillRect(sx + 6, sy + 15 + bob + Math.max(0, arm), 4, 8);
  ctx.fillRect(sx + 22, sy + 15 + bob + Math.max(0, -arm), 4, 8);
  ctx.fillStyle = palette.skin;
  ctx.fillRect(sx + 11, sy + 8 + bob, 10, 9);
  ctx.fillStyle = palette.hat;
  ctx.fillRect(sx + 8, sy + 4 + bob, 16, 6);
  ctx.fillRect(sx + 10, sy + 3 + bob, 12, 3);
  ctx.fillStyle = "#151d1f";
  if (dir === "left") ctx.fillRect(sx + 11, sy + 11 + bob, 2, 2);
  else if (dir === "right") ctx.fillRect(sx + 19, sy + 11 + bob, 2, 2);
  else {
    ctx.fillRect(sx + 12, sy + 11 + bob, 2, 2);
    ctx.fillRect(sx + 18, sy + 11 + bob, 2, 2);
  }
}

function playerSvg(spriteId, dir = "down", moving = false, sprinting = false, scale = 1) {
  const palette = PLAYER_SPRITES[spriteId] || PLAYER_SPRITES.sprig;
  const bob = moving ? (sprinting ? 2 : 1) : 0;
  const eyeLeft = dir === "left" ? 13 : 14;
  const eyeRight = dir === "right" ? 20 : 18;
  return `
    <svg viewBox="0 0 32 32" width="${Math.round(48 * scale)}" height="${Math.round(48 * scale)}" role="img" aria-label="Player sprite" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="28" rx="10" ry="3" fill="rgba(0,0,0,.24)" />
      <rect x="9" y="${23 + bob}" width="5" height="7" fill="${palette.pants}" />
      <rect x="18" y="${23 - bob}" width="5" height="7" fill="${palette.pants}" />
      <rect x="9" y="${14 + bob}" width="14" height="12" fill="${palette.shirt}" />
      <rect x="6" y="${16 + bob}" width="4" height="8" fill="${palette.shirt}" />
      <rect x="22" y="${16 - bob}" width="4" height="8" fill="${palette.shirt}" />
      <rect x="11" y="${8 + bob}" width="10" height="9" fill="${palette.skin}" />
      <rect x="8" y="${4 + bob}" width="16" height="6" fill="${palette.hat}" />
      <rect x="10" y="${3 + bob}" width="12" height="3" fill="${palette.hat}" />
      <rect x="${eyeLeft}" y="${11 + bob}" width="2" height="2" fill="#151d1f" />
      <rect x="${eyeRight}" y="${11 + bob}" width="2" height="2" fill="#151d1f" />
    </svg>
  `;
}

function pollGamepad() {
  if (appScreen !== "game" || mode !== "world" || typeof navigator === "undefined") return;
  if (!navigator.getGamepads) return;
  const pad = [...navigator.getGamepads()].find(Boolean);
  if (!pad) return;

  const now = performance.now();
  const sprinting = Boolean(pad.buttons[1]?.pressed || pad.buttons[5]?.pressed);
  const horizontal = pad.axes[0] || 0;
  const vertical = pad.axes[1] || 0;
  let direction = null;

  if (Math.abs(horizontal) > Math.abs(vertical) && Math.abs(horizontal) > 0.45) {
    direction = horizontal < 0 ? "left" : "right";
  } else if (Math.abs(vertical) > 0.45) {
    direction = vertical < 0 ? "up" : "down";
  }

  if (direction && now - lastGamepadMoveAt > (sprinting ? 65 : 120)) {
    lastGamepadMoveAt = now;
    trackStatistic("controllerInputs");
    attemptMove(direction, sprinting);
  }

  const actionPressed = Boolean(pad.buttons[0]?.pressed);
  if (actionPressed && !gamepadActionHeld) {
    gamepadActionHeld = true;
    trackStatistic("controllerInputs");
    interact();
  } else if (!actionPressed) {
    gamepadActionHeld = false;
  }
}

function tileHash(x, y) {
  return Math.abs(((x * 73856093) ^ (y * 19349663)) % 997);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupEvents() {
  window.addEventListener("keydown", (event) => {
    if (awaitingControlAction) {
      event.preventDefault();
      settings.controls[awaitingControlAction] = normalizeKey(event);
      awaitingControlAction = null;
      saveSettings();
      renderControlBindings();
      return;
    }

    if (keyMatches(event, "pause")) {
      event.preventDefault();
      if (!els.settingsModal.classList.contains("hidden")) closeSettingsModal();
      else if (!els.profileModal.classList.contains("hidden")) closeProfileModal();
      else if (!els.saveModal.classList.contains("hidden")) els.saveModal.classList.add("hidden");
      else if (!els.loadModal.classList.contains("hidden")) els.loadModal.classList.add("hidden");
      else if (!els.creditsModal.classList.contains("hidden")) closeCreditsModal();
      else if (mode === "paused") resumeGame();
      else openPauseMenu();
      return;
    }

    if (appScreen !== "game" || mode === "paused") return;

    const moveAction = ["up", "down", "left", "right"].find((action) => keyMatches(event, action));
    if (moveAction) {
      event.preventDefault();
      attemptMove(moveAction, isSprintActive(event));
      return;
    }
    if (keyMatches(event, "interact")) {
      event.preventDefault();
      interact();
    }
  });

  document.querySelectorAll(".touch-controls [data-dir]").forEach((button) => {
    button.addEventListener("click", () => attemptMove(button.dataset.dir, touchSprintActive));
  });
  els.actionButton.addEventListener("click", interact);
  els.sprintButton.addEventListener("click", () => {
    touchSprintActive = !touchSprintActive;
    els.sprintButton.classList.toggle("active", touchSprintActive);
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setPanel(tab.dataset.panel));
  });

  els.pauseButton.addEventListener("click", openPauseMenu);
  els.newGameButton.addEventListener("click", startNewGame);
  els.continueButton.addEventListener("click", continueSavedGame);
  els.loadGameButton.addEventListener("click", openLoadModal);
  els.titleSettingsButton.addEventListener("click", openSettingsModal);
  els.creditsButton.addEventListener("click", openCreditsModal);
  els.quitButton.addEventListener("click", quitGame);
  els.resumeButton.addEventListener("click", resumeGame);
  els.pauseSaveButton.addEventListener("click", pauseSave);
  els.pauseProfileButton.addEventListener("click", openProfileModal);
  els.pausePartyButton.addEventListener("click", () => openPanelFromPause("party"));
  els.pauseInventoryButton.addEventListener("click", () => openPanelFromPause("bag"));
  els.pauseArchiveButton.addEventListener("click", () => openPanelFromPause("guide"));
  els.pauseSettingsButton.addEventListener("click", openSettingsModal);
  els.returnTitleButton.addEventListener("click", returnToTitle);
  els.loadConfirmButton.addEventListener("click", continueSavedGame);
  els.closeLoadButton.addEventListener("click", () => els.loadModal.classList.add("hidden"));
  els.closeSaveButton.addEventListener("click", () => els.saveModal.classList.add("hidden"));
  els.saveProfileButton.addEventListener("click", saveProfile);
  els.closeProfileButton.addEventListener("click", closeProfileModal);
  els.playerSpriteSelect.addEventListener("change", renderProfile);
  els.settingsDoneButton.addEventListener("click", closeSettingsModal);
  els.closeCreditsButton.addEventListener("click", closeCreditsModal);
  els.autosaveSetting.addEventListener("change", () => {
    settings.autosave = els.autosaveSetting.checked;
    saveSettings();
  });
  els.motionSetting.addEventListener("change", () => {
    settings.reducedMotion = els.motionSetting.checked;
    saveSettings();
    applySettings();
  });
  els.confirmNewGameSetting.addEventListener("change", () => {
    settings.confirmNewGame = els.confirmNewGameSetting.checked;
    saveSettings();
  });

  els.dialogueNext.addEventListener("click", nextDialogue);
  els.captureButton.addEventListener("click", tryCapture);
  els.tonicButton.addEventListener("click", useTonic);
  els.switchButton.addEventListener("click", () => openSwitch(false));
  els.runButton.addEventListener("click", tryRun);
  els.closeSwitch.addEventListener("click", () => {
    if (battle && activeMon()?.hp <= 0) return;
    els.switchModal.classList.add("hidden");
  });
  els.saveButton.addEventListener("click", openSaveModal);
  els.resetButton.addEventListener("click", startNewGame);
}

function boot() {
  setupEvents();
  applySettings();
  migrateLegacySave();
  renderAll();
  showTitleScreen();
  window.setInterval(() => {
    if (settings.autosave && mode === "world" && state.party.length) {
      saveGame(false, AUTOSAVE_SLOT_ID, { confirmOverwrite: false });
    }
  }, 45000);
  requestAnimationFrame(loop);
}

function loop() {
  pollGamepad();
  drawWorld();
  requestAnimationFrame(loop);
}

boot();
