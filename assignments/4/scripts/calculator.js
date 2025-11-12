(() => {
  const displayEl = document.getElementById("display");

  const state = {
    first: "0",
    operator: null,
    second: "",
    overwrite: false,
  };

  const isOperator = (sym) => ["+", "−", "×", "÷"].includes(sym);

  const format = (value) => {
    const s = String(value);
    if (s.length <= 16) return s;
    const n = Number(value);
    return Number.isFinite(n) ? n.toExponential(8).replace(/\.?0+e/, "e") : "Error";
  };

  const current = () => (state.operator ? state.second || "0" : state.first);

  const setCurrent = (s) => {
    if (state.operator) state.second = s;
    else state.first = s;
    displayEl.textContent = format(s);
  };

  const clearAll = () => {
    state.first = "0";
    state.operator = null;
    state.second = "";
    state.overwrite = false;
    displayEl.textContent = "0";
  };

  const inputDigit = (d) => {
    let cur = current();

    if (state.overwrite) {
      state.overwrite = false;
      cur = "0";
    }

    if (cur === "0") cur = d === "0" ? "0" : d;
    else cur += d;

    setCurrent(cur);
  };

  const inputDecimal = () => {
    let cur = current();
    if (state.overwrite) {
      state.overwrite = false;
      cur = "0";
    }
    if (!cur.includes(".")) setCurrent(cur + ".");
  };

  const chooseOperator = (op) => {
    if (!isOperator(op)) return;

    if (state.operator && !state.second) {
      state.operator = op;
      return;
    }

    if (state.operator && state.second) {
      equals();
    }
    state.operator = op;
    state.overwrite = false;
  };

  const toggleSign = () => {
    const cur = current();
    if (cur === "0") return;
    setCurrent(cur.startsWith("-") ? cur.slice(1) : "-" + cur);
  };

  const toPercent = () => {
    const cur = Number(current());
    if (!Number.isFinite(cur)) return;
    setCurrent(String(cur / 100));
  };

  const safeCompute = (aStr, op, bStr) => {
    const a = Number(aStr);
    const b = Number(bStr);

    if (!Number.isFinite(a) || !Number.isFinite(b)) return "Error";
    if (op === "÷" && b === 0) return "Cannot divide by 0";

    const map = {
      "+": (x, y) => x + y,
      "−": (x, y) => x - y,
      "×": (x, y) => x * y,
      "÷": (x, y) => x / y,
    };

    const fn = map[op];
    if (!fn) return "Error";

    const raw = fn(a, b);
    const rounded = Math.round(raw * 1e12) / 1e12;
    return String(rounded);
  };

  const equals = () => {
    if (!state.operator || state.second === "") return;

    const result = safeCompute(state.first, state.operator, state.second);
    displayEl.textContent = format(result);

    state.first = (/^Cannot/.test(result) || result === "Error") ? "0" : result;
    state.operator = null;
    state.second = "";
    state.overwrite = true;
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button.btn");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "digit")      return inputDigit(btn.dataset.digit);
    if (action === "decimal")    return inputDecimal();
    if (action === "operator")   return chooseOperator(btn.dataset.operator);
    if (action === "equals")     return equals();
    if (action === "sign")       return toggleSign();
    if (action === "percent")    return toPercent();
    if (action === "clear")      return clearAll();
  });

  document.addEventListener("keydown", (e) => {
    const { key } = e;

    if (/\d/.test(key)) return inputDigit(key);
    if (key === ".")    return inputDecimal();

    if (key === "+" || key === "-" || key === "*" || key === "/") {
      const map = { "+": "+", "-": "−", "*": "×", "/": "÷" };
      return chooseOperator(map[key]);
    }

    if (key === "Enter" || key === "=") return equals();
    if (key === "Escape") return clearAll();
    if (key === "%") return toPercent();
    if (key.toLowerCase() === "p") return toggleSign();
  });

  displayEl.textContent = "0";
})();