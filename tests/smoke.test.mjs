import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

class MockElement {
  constructor(id = "") {
    this.id = id;
    this.children = [];
    this._classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => this._classes.add(name)),
      contains: (name) => this._classes.has(name),
      remove: (...names) => names.forEach((name) => this._classes.delete(name)),
      toggle: (name, force) => {
        if (force === true) this._classes.add(name);
        else if (force === false) this._classes.delete(name);
        else if (this._classes.has(name)) this._classes.delete(name);
        else this._classes.add(name);
        return this._classes.has(name);
      }
    };
    this.checked = false;
    this.dataset = {};
    this.disabled = false;
    this.style = {};
  }

  appendChild(child) {
    this.children.push(child);
  }

  addEventListener() {}

  querySelectorAll() {
    return [];
  }

  set innerHTML(value) {
    this._innerHTML = value;
  }

  get innerHTML() {
    return this._innerHTML || "";
  }

  set textContent(value) {
    this._textContent = value;
  }

  get textContent() {
    return this._textContent || "";
  }

  set scrollTop(_value) {}

  get scrollHeight() {
    return 0;
  }
}

const ids = [
  "world",
  "placeName",
  "coinCount",
  "capsuleCount",
  "pauseButton",
  "toast",
  "dialogue",
  "dialogueSpeaker",
  "dialogueText",
  "dialogueNext",
  "battle",
  "enemySprite",
  "enemyName",
  "enemyLevel",
  "enemyHpBar",
  "enemyHpText",
  "allySprite",
  "allyName",
  "allyLevel",
  "allyHpBar",
  "allyHpText",
  "battleLog",
  "moveGrid",
  "captureButton",
  "tonicButton",
  "switchButton",
  "runButton",
  "partyPanel",
  "guidePanel",
  "bagPanel",
  "saveButton",
  "resetButton",
  "starterModal",
  "starterChoices",
  "switchModal",
  "switchList",
  "closeSwitch",
  "actionButton",
  "titleScreen",
  "titleStatus",
  "newGameButton",
  "continueButton",
  "loadGameButton",
  "titleSettingsButton",
  "creditsButton",
  "quitButton",
  "pauseMenu",
  "resumeButton",
  "pauseSaveButton",
  "pausePartyButton",
  "pauseInventoryButton",
  "pauseArchiveButton",
  "pauseSettingsButton",
  "returnTitleButton",
  "loadModal",
  "loadSummary",
  "loadConfirmButton",
  "closeLoadButton",
  "settingsModal",
  "autosaveSetting",
  "motionSetting",
  "confirmNewGameSetting",
  "settingsDoneButton",
  "creditsModal",
  "closeCreditsButton"
];

const elements = Object.fromEntries(ids.map((id) => [id, new MockElement(id)]));
elements.starterModal.classList.add("hidden");
elements.switchModal.classList.add("hidden");
elements.pauseMenu.classList.add("hidden");
elements.loadModal.classList.add("hidden");
elements.settingsModal.classList.add("hidden");
elements.creditsModal.classList.add("hidden");
elements.world.getContext = () => ({
  beginPath() {},
  arc() {},
  clearRect() {},
  ellipse() {},
  fill() {},
  fillRect() {},
  lineTo() {},
  moveTo() {},
  quadraticCurveTo() {},
  restore() {},
  save() {},
  stroke() {},
  strokeRect() {},
  translate() {},
  set fillStyle(_value) {},
  set lineWidth(_value) {},
  set strokeStyle(_value) {}
});

const saves = [];
const storage = new Map();
let animationFrames = 0;
const context = {
  console,
  crypto: { randomUUID: () => `id-${Math.random()}` },
  Date,
  document: {
    body: new MockElement("body"),
    createElement: () => new MockElement(),
    getElementById: (id) => elements[id] || new MockElement(id),
    querySelectorAll: () => []
  },
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    removeItem: (key) => storage.delete(key),
    setItem: (key, value) => {
      storage.set(key, value);
      saves.push([key, value]);
    }
  },
  Math,
  performance: { now: () => 1000 },
  requestAnimationFrame(callback) {
    if (++animationFrames < 2) setTimeout(callback, 0);
  },
  setTimeout,
  window: {
    addEventListener() {},
    clearTimeout() {},
    confirm: () => true,
    setInterval() {},
    setTimeout: (callback) => setTimeout(callback, 0)
  }
};

vm.createContext(context);
vm.runInContext(await readFile("src/game.js", "utf8"), context, { filename: "src/game.js" });
const bootState = vm.runInContext(
  `({
    appScreen,
    titleVisible: !els.titleScreen.classList.contains("hidden"),
    continueDisabled: els.continueButton.disabled
  })`,
  context
);

assert.equal(bootState.appScreen, "title");
assert.equal(bootState.titleVisible, true);
assert.equal(bootState.continueDisabled, true);

vm.runInContext(
  `
    startNewGame();
    chooseStarter("frondle");
    while (dialogueQueue.length) nextDialogue();
    nextDialogue();
    startWildBattle("wild");
    renderBattle();
    saveGame(false);
  `,
  context
);

const result = vm.runInContext(
  `({
    mode,
    appScreen,
    partyLength: state.party.length,
    battleType: battle.type,
    enemySpecies: battle.enemy.speciesId,
    caughtStarter: state.caught.has("frondle"),
    titleHidden: els.titleScreen.classList.contains("hidden")
  })`,
  context
);

assert.equal(result.mode, "battle");
assert.equal(result.appScreen, "game");
assert.equal(result.partyLength, 1);
assert.equal(result.battleType, "wild");
assert.ok(result.enemySpecies);
assert.equal(result.caughtStarter, true);
assert.equal(result.titleHidden, true);
assert.ok(saves.length > 0);
assert.match(elements.partyPanel.innerHTML, /Frondle/);
assert.match(elements.battleLog.innerHTML, /wild/i);

vm.runInContext(
  `
    battle = null;
    mode = "world";
    openPauseMenu();
    pauseSave();
    returnToTitle();
    renderLoadModal();
  `,
  context
);

const shellResult = vm.runInContext(
  `({
    appScreen,
    mode,
    titleVisible: !els.titleScreen.classList.contains("hidden"),
    pauseHidden: els.pauseMenu.classList.contains("hidden"),
    canLoad: !els.loadConfirmButton.disabled
  })`,
  context
);

assert.equal(shellResult.appScreen, "title");
assert.equal(shellResult.mode, "world");
assert.equal(shellResult.titleVisible, true);
assert.equal(shellResult.pauseHidden, true);
assert.equal(shellResult.canLoad, true);

console.log("Smoke test passed.");
