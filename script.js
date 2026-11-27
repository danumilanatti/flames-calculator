"use strict";

/* =====================================================
   PART 1 – DATA STRUCTURE: Circular Singly Linked List
   =====================================================
   A NODE holds one letter and ONE pointer: `next`.
   In a CIRCULAR list the last node's `next` points back
   to the first node, so counting never "falls off" the end.

      F -> L -> A -> M -> E -> S --+
      ^                            |
      +----------------------------+
*/
class Node {
  constructor(data) {
    this.data = data;   // the FLAMES letter
    this.next = null;   // pointer to the next node
  }
}

class CircularSinglyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // Add a node at the end and keep the list circular.
  append(data) {
    const node = new Node(data);
    if (this.head === null) {
      this.head = node;
      this.tail = node;
      node.next = node;        // a single node points to itself
    } else {
      this.tail.next = node;   // old last node -> new node
      node.next = this.head;   // new node -> back to the head (circle!)
      this.tail = node;
    }
    this.size++;
  }

  // Remove the node that comes right AFTER `prev` and return it.
  // In a singly linked list you cannot look backwards, so to delete a
  // node you must hold the node BEFORE it and skip over the target.
  removeAfter(prev) {
    const target = prev.next;
    if (target === this.head) this.head = target.next; // keep head valid
    if (target === this.tail) this.tail = prev;        // keep tail valid
    prev.next = target.next;                           // skip the target
    target.next = null;
    this.size--;
    return target;
  }
}

/* =====================================================
   PART 2 – JOSEPHUS ELIMINATION (uses the list above)
   =====================================================
   Idea: stand in a circle, count `k` people, remove the k-th,
   continue counting from the next person, repeat until one is left.

   We keep two pointers:
     prev    = node just before `current`
     current = node we are counting on
   Because the list is circular, `current.next` never becomes null.

   Returns the surviving letter and a list of elimination steps
   (the steps are only a record so the UI can animate them).
*/
function josephus(list, k) {
  const steps = [];
  let prev = list.tail;      // node before the head
  let current = list.head;   // start counting from the first node

  while (list.size > 1) {
    // Count k nodes: we are on node #1 already, so move k-1 times.
    for (let i = 1; i < k; i++) {
      prev = current;
      current = current.next;
    }
    // `current` is the k-th node: eliminate it.
    const removed = list.removeAfter(prev);
    steps.push({ letter: removed.data, remaining: list.size });
    // Continue counting from the node after the removed one.
    current = prev.next;
  }
  return { winner: current.data, steps };
}

// Build a fresh list F -> L -> A -> M -> E -> S (circular).
function buildFlamesList() {
  const list = new CircularSinglyLinkedList();
  for (const letter of "FLAMES") list.append(letter);
  return list;
}

/* =====================================================
   PART 3 – NAME PROCESSING
   ===================================================== */

// Lowercase and keep only a–z.
function cleanName(name) {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

// Cancel matching letters ONE occurrence at a time.
// e.g. "anna" vs "ann": a,n,n cancel once each -> "a" is left.
function cancelCommon(a, b) {
  const first = a.split("");
  const second = b.split("");
  for (let i = 0; i < first.length; i++) {
    const j = second.indexOf(first[i]);
    if (j !== -1) {
      first.splice(i, 1);   // remove one match from name 1
      second.splice(j, 1);  // remove ONE matching letter from name 2
      i--;                  // re-check this position after removal
    }
  }
  return { first, second };
}

/* =====================================================
   PART 4 – UI
   ===================================================== */
const MEANINGS = {
  F: { word: "Friends",   text: "Easy laughs and zero pressure. A friendship worth keeping." },
  L: { word: "Love",      text: "Sparks are flying. This one has real romantic energy." },
  A: { word: "Affection", text: "Warm, caring and fond of each other, softly and sincerely." },
  M: { word: "Marriage",  text: "Wedding bells! The stars say this could go the distance." },
  E: { word: "Enemy",     text: "Strong personalities collide. Fireworks, but not the nice kind." },
  S: { word: "Sister",    text: "A sibling-like bond. Loyal, honest and always there." },
};

const $ = (id) => document.getElementById(id);
const form = $("flamesForm");
const ring = $("ring");
const ringCenter = $("ringCenter");
const logEl = $("log");
const messageEl = $("message");
const summary = $("summary");
const result = $("result");
const calcBtn = $("calcBtn");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let runId = 0; // lets Reset cancel a running animation

// Place the six letters on a circle.
function drawRing() {
  ring.querySelectorAll(".tile").forEach((t) => t.remove());
  "FLAMES".split("").forEach((letter, i) => {
    const angle = (i / 6) * 2 * Math.PI;
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.id = "tile-" + letter;
    tile.style.left = 50 + 42 * Math.sin(angle) + "%";
    tile.style.top = 50 - 42 * Math.cos(angle) + "%";
    tile.innerHTML = letter + "<small>" + MEANINGS[letter].word + "</small>";
    ring.appendChild(tile);
  });
}

function showMessage(text) { messageEl.textContent = text; }

function resetView() {
  runId++;                          // stop any running animation
  summary.hidden = true;
  result.hidden = true;
  ringCenter.className = "ring-center";
  ringCenter.textContent = "F L A M E S";
  logEl.textContent = "Enter two names to start.";
  showMessage("");
  calcBtn.disabled = false;
  drawRing();
}

async function calculate(event) {
  event.preventDefault();
  const rawA = $("name1").value.trim();
  const rawB = $("name2").value.trim();
  const a = cleanName(rawA);
  const b = cleanName(rawB);

  resetView();

  // ---- Validation ----
  if (!a || !b) {
    showMessage("Enter both names. Use at least one letter (A–Z) in each.");
    return;
  }
  const { first, second } = cancelCommon(a, b);
  const count = first.length + second.length;

  summary.hidden = false;
  $("leftover").innerHTML = [...first, ...second]
    .map((c) => '<span class="chip">' + c + "</span>").join("");
  $("countNum").textContent = count;

  if (count === 0) {
    const same = a === b;
    showMessage(same
      ? "These names are identical, so every letter cancels out. Try two different names."
      : "Every letter cancelled out, so there is no elimination number. Try different names.");
    return;
  }

  // ---- Run the real algorithm on the circular linked list ----
  const { winner, steps } = josephus(buildFlamesList(), count);

  // ---- Animate the recorded steps ----
  const myRun = ++runId;
  calcBtn.disabled = true;
  ringCenter.className = "ring-center num";
  ringCenter.textContent = count;
  logEl.textContent = "Counting " + count + " each round…";
  await sleep(900);

  for (let i = 0; i < steps.length; i++) {
    if (myRun !== runId) return;               // Reset was pressed
    const tile = $("tile-" + steps[i].letter);
    tile.classList.add("pointing");
    logEl.textContent = "Round " + (i + 1) + ": counting " + count +
      " lands on " + steps[i].letter + " (" + MEANINGS[steps[i].letter].word + ") – eliminated.";
    await sleep(900);
    if (myRun !== runId) return;
    tile.classList.remove("pointing");
    tile.classList.add("out");
    await sleep(500);
  }

  if (myRun !== runId) return;
  $("tile-" + winner).classList.add("winner");
  ringCenter.className = "ring-center";
  ringCenter.textContent = winner;
  logEl.textContent = winner + " survives!";
  $("resultLetter").textContent = winner;
  $("resultWord").textContent = MEANINGS[winner].word;
  $("resultText").textContent = MEANINGS[winner].text;
  result.hidden = false;
  burstHearts();
  calcBtn.disabled = false;
}

/* ---------- Animated hearts ---------- */
function makeHeart(parent, delay) {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = ["♥", "❤", "💗", "💕"][Math.floor(Math.random() * 4)];
  h.style.left = Math.random() * 100 + "%";
  h.style.fontSize = 14 + Math.random() * 22 + "px";
  h.style.color = Math.random() > 0.5 ? "#e5446d" : "#ff8fab";
  h.style.animationDuration = 8 + Math.random() * 8 + "s";
  h.style.animationDelay = delay + "s";
  parent.appendChild(h);
  return h;
}
function startBackgroundHearts() {
  const box = $("hearts");
  for (let i = 0; i < 16; i++) makeHeart(box, Math.random() * 10);
}
function burstHearts() {
  const box = $("hearts");
  for (let i = 0; i < 14; i++) {
    const h = makeHeart(box, Math.random() * 0.8);
    h.style.animationDuration = 3 + Math.random() * 3 + "s";
    h.style.animationIterationCount = "1";
    setTimeout(() => h.remove(), 7000);
  }
}

/* ---------- Wire everything up ---------- */
form.addEventListener("submit", calculate);
$("resetBtn").addEventListener("click", () => { form.reset(); resetView(); });
drawRing();
startBackgroundHearts();
