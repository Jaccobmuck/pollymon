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
  "playerNameTag",
  "coordTag",
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
  "sprintButton",
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
  "pauseProfileButton",
  "pausePartyButton",
  "pauseInventoryButton",
  "pauseArchiveButton",
  "pauseSettingsButton",
  "returnTitleButton",
  "profileModal",
  "profileSprite",
  "playerNameInput",
  "playerSpriteSelect",
  "profileStats",
  "achievementList",
  "saveProfileButton",
  "closeProfileButton",
  "loadModal",
  "loadSummary",
  "loadSlotList",
  "loadConfirmButton",
  "closeLoadButton",
  "saveModal",
  "saveSlotList",
  "closeSaveButton",
  "settingsModal",
  "autosaveSetting",
  "motionSetting",
  "confirmNewGameSetting",
  "controlBindings",
  "settingsDoneButton",
  "creditsModal",
  "closeCreditsButton"
];

const elements = Object.fromEntries(ids.map((id) => [id, new MockElement(id)]));
elements.starterModal.classList.add("hidden");
elements.switchModal.classList.add("hidden");
elements.pauseMenu.classList.add("hidden");
elements.profileModal.classList.add("hidden");
elements.loadModal.classList.add("hidden");
elements.saveModal.classList.add("hidden");
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
  navigator: {
    getGamepads: () => []
  },
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
    playerName: state.player.name,
    playerMap: state.player.currentMap,
    coordinates: [state.player.x, state.player.y],
    partyLength: state.party.length,
    battleType: battle.type,
    enemySpecies: battle.enemy.speciesId,
    caughtStarter: state.caught.has("frondle"),
    titleHidden: els.titleScreen.classList.contains("hidden"),
    achievementCount: state.achievements.length
  })`,
  context
);

assert.equal(result.mode, "battle");
assert.equal(result.appScreen, "game");
assert.equal(result.playerName, "Ranger");
assert.equal(result.playerMap, "Sprig Village");
assert.equal(result.coordinates[0], 11);
assert.equal(result.coordinates[1], 21);
assert.equal(result.partyLength, 1);
assert.equal(result.battleType, "wild");
assert.ok(result.enemySpecies);
assert.equal(result.caughtStarter, true);
assert.equal(result.titleHidden, true);
assert.ok(result.achievementCount > 0);
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
    canLoad: !els.loadConfirmButton.disabled,
    slotOneStatus: readSlotRecord("slot-1").status,
    latestLocation: savedGameSummary().location,
    loadPreview: els.loadSlotList.innerHTML,
    playtime: savedGameSummary().playtime
  })`,
  context
);

assert.equal(shellResult.appScreen, "title");
assert.equal(shellResult.mode, "world");
assert.equal(shellResult.titleVisible, true);
assert.equal(shellResult.pauseHidden, true);
assert.equal(shellResult.canLoad, true);
assert.equal(shellResult.slotOneStatus, "ok");
assert.equal(shellResult.latestLocation, "Sprig Village");
assert.match(shellResult.loadPreview, /Slot 1/);
assert.match(shellResult.loadPreview, /Frondle/);
assert.ok(shellResult.playtime >= 0);

vm.runInContext(
  `
    hideTitleScreen();
    mode = "world";
    state.player.x = 11;
    state.player.y = 21;
    attemptMove("up", true);
    els.playerNameInput.value = "Jay";
    els.playerSpriteSelect.value = "tide";
    saveProfile();
    settings.controls.up = "i";
    saveSettings();
    applySettings();
    openProfileModal();
  `,
  context
);

const playerResult = vm.runInContext(
  `({
    name: state.player.name,
    sprite: state.player.sprite,
    y: state.player.y,
    sprintSteps: state.stats.sprintSteps,
    coordsHud: els.coordTag.textContent,
    controlKey: settings.controls.up,
    profileVisible: !els.profileModal.classList.contains("hidden"),
    profileHasStats: els.profileStats.innerHTML.includes("Sprint Steps")
  })`,
  context
);

assert.equal(playerResult.name, "Jay");
assert.equal(playerResult.sprite, "tide");
assert.equal(playerResult.y, 20);
assert.equal(playerResult.sprintSteps, 1);
assert.equal(playerResult.coordsHud, "11, 20");
assert.equal(playerResult.controlKey, "i");
assert.equal(playerResult.profileVisible, true);
assert.equal(playerResult.profileHasStats, true);

vm.runInContext(
  `
    localStorage.setItem(saveSlotStorageKey("slot-2"), "{bad save");
    renderLoadModal();
  `,
  context
);

const corruptResult = vm.runInContext(
  `({
    corruptStatus: readSlotRecord("slot-2").status,
    corruptPreview: els.loadSlotList.innerHTML.includes("Corrupt save data"),
    stillCanContinue: Boolean(savedGameSummary())
  })`,
  context
);

assert.equal(corruptResult.corruptStatus, "corrupt");
assert.equal(corruptResult.corruptPreview, true);
assert.equal(corruptResult.stillCanContinue, true);

console.log("Smoke test passed.");
