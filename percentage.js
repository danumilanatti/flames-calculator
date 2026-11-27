"use strict";

/* =====================================================
   LOVE PERCENTAGE - digit counting and reduction method
   (no random numbers, no hashes: same names = same result)
   ===================================================== */

// Lowercase and keep only a-z (same rule as the FLAMES page).
function cleanName(name) {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

// STEP 1: write both names together and count every letter,
// listing the counts in the order each letter FIRST appears.
// romeo + juliet -> r1 o2 m1 e2 j1 u1 l1 i1 t1 -> 1 2 1 2 1 1 1 1 1
function countSequence(a, b) {
  const counts = {};
  const order = [];
  for (const ch of a + b) {
    if (counts[ch] === undefined) {
      counts[ch] = 0;
      order.push(ch);
    }
    counts[ch]++;
  }
  // A count like 10 is split into digits 1 and 0.
  return order.flatMap((ch) => String(counts[ch]).split("").map(Number));
}

// STEP 2: one reduction. Add the first and last digits, then the
// second and second-last, and so on. A middle digit stays as it is.
// A sum of 10 or more is split into its digits (12 -> 1 2).
// 1 2 1 2 1 1 1 1 1 -> 2 3 2 3 1
function reduceOnce(seq) {
  const out = [];
  let left = 0;
  let right = seq.length - 1;
  while (left < right) {
    const sum = seq[left] + seq[right];
    out.push(...String(sum).split("").map(Number));
    left++;
    right--;
  }
  if (left === right) out.push(seq[left]); // the middle digit
  return out;
}

// STEP 3: keep reducing until only two digits are left.
// Those two digits side by side are the percentage (5 6 -> 56%).
function lovePercentage(a, b) {
  let seq = countSequence(a, b);
  const steps = [seq.slice()];
  let guard = 0; // safety only, so the page can never hang
  while (seq.length > 2 && guard < 100) {
    seq = reduceOnce(seq);
    steps.push(seq.slice());
    guard++;
  }
  return { percent: Number(seq.slice(0, 2).join("")), steps };
}

/* ---------- Page wiring ---------- */
const $ = (id) => document.getElementById(id);

$("loveForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const a = cleanName($("pname1").value);
  const b = cleanName($("pname2").value);
  $("pResult").hidden = true;

  if (!a || !b) {
    $("pMessage").textContent = "Enter both names. Use at least one letter (A-Z) in each.";
    return;
  }
  $("pMessage").textContent = "";

  const { percent, steps } = lovePercentage(a, b);
  $("pPercent").textContent = percent + "%";
  $("pResult").hidden = false;
});

$("pReset").addEventListener("click", () => {
  $("loveForm").reset();
  $("pMessage").textContent = "";
  $("pResult").hidden = true;
});