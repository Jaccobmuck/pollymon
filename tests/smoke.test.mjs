import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

class MockElement {
  constructor(id = "") {
    this.id = id;
    this.children = [];
    this.classList = { add() {}, remove() {} };
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
  "actionButton"
];

const elements = Object.fromEntries(ids.map((id) => [id, new MockElement(id)]));
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
let animationFrames = 0;
const context = {
  console,
  crypto: { randomUUID: () => `id-${Math.random()}` },
  Date,
  document: {
    createElement: () => new MockElement(),
    getElementById: (id) => elements[id] || new MockElement(id),
    querySelectorAll: () => []
  },
  localStorage: {
    getItem: () => null,
    removeItem() {},
    setItem: (key, value) => saves.push([key, value])
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
vm.runInContext(
  `
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
    partyLength: state.party.length,
    battleType: battle.type,
    enemySpecies: battle.enemy.speciesId,
    caughtStarter: state.caught.has("frondle")
  })`,
  context
);

assert.equal(result.mode, "battle");
assert.equal(result.partyLength, 1);
assert.equal(result.battleType, "wild");
assert.ok(result.enemySpecies);
assert.equal(result.caughtStarter, true);
assert.ok(saves.length > 0);
assert.match(elements.partyPanel.innerHTML, /Frondle/);
assert.match(elements.battleLog.innerHTML, /wild/i);

console.log("Smoke test passed.");
