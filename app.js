const legacyStorageKey = "app-finanzas-data-v1";
const preferencesStorageKey = "app-finanzas-preferences-v2";

const categoriesByType = {
  income: ["Sueldo", "Freelance", "Venta", "Interes", "Otro ingreso"],
  expense: ["Comida", "Transporte", "Servicios", "Hogar", "Salud", "Ocio", "Otro gasto"],
};

const elements = {
  authForm: document.getElementById("authForm"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  signUpButton: document.getElementById("signUpButton"),
  signOutButton: document.getElementById("signOutButton"),
  syncStatus: document.getElementById("syncStatus"),
  setupBanner: document.getElementById("setupBanner"),
  sessionCard: document.getElementById("sessionCard"),
  sessionEmail: document.getElementById("sessionEmail"),
  authRequiredCard: document.getElementById("authRequiredCard"),
  form: document.getElementById("transactionForm"),
  type: document.getElementById("type"),
  amount: document.getElementById("amount"),
  category: document.getElementById("category"),
  date: document.getElementById("date"),
  description: document.getElementById("description"),
  transactionList: document.getElementById("transactionList"),
  transactionTemplate: document.getElementById("transactionTemplate"),
  emptyState: document.getElementById("emptyState"),
  incomeValue: document.getElementById("incomeValue"),
  expenseValue: document.getElementById("expenseValue"),
  balanceValue: document.getElementById("balanceValue"),
  countValue: document.getElementById("countValue"),
  avgExpenseValue: document.getElementById("avgExpenseValue"),
  topExpenseValue: document.getElementById("topExpenseValue"),
  savingsRateValue: document.getElementById("savingsRateValue"),
  categoryBreakdown: document.getElementById("categoryBreakdown"),
  filterType: document.getElementById("filterType"),
  searchInput: document.getElementById("searchInput"),
  currencySelect: document.getElementById("currencySelect"),
  exportButton: document.getElementById("exportButton"),
  importInput: document.getElementById("importInput"),
  clearButton: document.getElementById("clearButton"),
};

const initialState = {
  currency: "PEN",
  transactions: [],
  user: null,
};

let state = {
  ...initialState,
  currency: loadPreferences().currency,
};

const supabaseConfig = window.APP_FINANZAS_SUPABASE || {};
const hasValidSupabaseConfig =
  Boolean(supabaseConfig.url) &&
  Boolean(supabaseConfig.anonKey) &&
  !String(supabaseConfig.url).includes("TU_PROJECT_URL") &&
  !String(supabaseConfig.anonKey).includes("TU_ANON_KEY");

const supabaseClient =
  hasValidSupabaseConfig && window.supabase?.createClient
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

function loadPreferences() {
  try {
    const raw = localStorage.getItem(preferencesStorageKey);
    if (!raw) return { currency: initialState.currency };

    const parsed = JSON.parse(raw);
    return {
      currency: parsed.currency || initialState.currency,
    };
  } catch (error) {
    console.warn("No se pudieron leer las preferencias locales.", error);
    return { currency: initialState.currency };
  }
}

function savePreferences() {
  localStorage.setItem(
    preferencesStorageKey,
    JSON.stringify({
      currency: state.currency,
    }),
  );
}

function getCurrencyFormatter() {
  const locales = {
    PEN: "es-PE",
    USD: "en-US",
    EUR: "es-ES",
  };

  return new Intl.NumberFormat(locales[state.currency] || "es-PE", {
    style: "currency",
    currency: state.currency,
    minimumFractionDigits: 2,
  });
}

function formatAmount(amount) {
  return getCurrencyFormatter().format(Number(amount) || 0);
}

function formatDate(dateValue) {
  if (!dateValue) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function populateCategories() {
  const options = categoriesByType[elements.type.value] || [];

  elements.category.innerHTML = options
    .map((option) => `<option value="${option}">${option}</option>`)
    .join("");
}

function setTodayDate() {
  if (!elements.date.value) {
    elements.date.value = new Date().toISOString().split("T")[0];
  }
}

function calculateSummary(transactions) {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenseItems = transactions.filter((item) => item.type === "expense");
  const expenses = expenseItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = income - expenses;
  const avgExpense = expenseItems.length ? expenses / expenseItems.length : 0;
  const topExpense = expenseItems.length
    ? Math.max(...expenseItems.map((item) => Number(item.amount)))
    : 0;
  const savingsRate = income > 0 ? Math.max(0, (balance / income) * 100) : 0;

  return {
    income,
    expenses,
    balance,
    count: transactions.length,
    avgExpense,
    topExpense,
    savingsRate,
  };
}

function buildCategoryBreakdown(transactions) {
  const expenses = transactions.filter((item) => item.type === "expense");

  if (!expenses.length) {
    elements.categoryBreakdown.innerHTML = `
      <div class="empty-state">
        <h3>Sin egresos aun</h3>
        <p>Cuando registres gastos, aqui veras cuanto pesa cada categoria.</p>
      </div>
    `;
    return;
  }

  const totalsByCategory = expenses.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + Number(item.amount);
    return accumulator;
  }, {});

  const maxValue = Math.max(...Object.values(totalsByCategory));

  elements.categoryBreakdown.innerHTML = Object.entries(totalsByCategory)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .map(([category, amount]) => {
      const width = maxValue > 0 ? (amount / maxValue) * 100 : 0;
      return `
        <article class="breakdown-item">
          <div class="breakdown-item__row">
            <strong>${category}</strong>
            <span>${formatAmount(amount)}</span>
          </div>
          <div class="progress" aria-hidden="true">
            <div class="progress__bar" style="width: ${width}%"></div>
          </div>
        </article>
      `;
    })
    .join("");
}

function getFilteredTransactions() {
  const filterType = elements.filterType.value;
  const searchTerm = elements.searchInput.value.trim().toLowerCase();

  return [...state.transactions]
    .filter((item) => (filterType === "all" ? true : item.type === filterType))
    .filter((item) => {
      if (!searchTerm) return true;

      const haystack = `${item.category} ${item.description || ""}`.toLowerCase();
      return haystack.includes(searchTerm);
    })
    .sort((itemA, itemB) => {
      if (itemA.transaction_date === itemB.transaction_date) {
        return new Date(itemB.created_at).getTime() - new Date(itemA.created_at).getTime();
      }

      return String(itemB.transaction_date).localeCompare(String(itemA.transaction_date));
    });
}

function renderTransactions() {
  const filteredTransactions = getFilteredTransactions();
  const summary = calculateSummary(state.transactions);

  elements.incomeValue.textContent = formatAmount(summary.income);
  elements.expenseValue.textContent = formatAmount(summary.expenses);
  elements.balanceValue.textContent = formatAmount(summary.balance);
  elements.countValue.textContent = String(summary.count);
  elements.avgExpenseValue.textContent = formatAmount(summary.avgExpense);
  elements.topExpenseValue.textContent = formatAmount(summary.topExpense);
  elements.savingsRateValue.textContent = `${summary.savingsRate.toFixed(0)}%`;

  buildCategoryBreakdown(state.transactions);

  elements.transactionList.innerHTML = "";
  elements.emptyState.hidden = filteredTransactions.length > 0;

  filteredTransactions.forEach((transaction) => {
    const fragment = elements.transactionTemplate.content.cloneNode(true);
    const badge = fragment.querySelector(".badge");
    const title = fragment.querySelector(".transaction-title");
    const date = fragment.querySelector(".transaction-date");
    const amount = fragment.querySelector(".transaction-item__amount");
    const deleteButton = fragment.querySelector(".icon-button");

    badge.textContent = transaction.category;
    title.textContent = transaction.description || "Movimiento sin descripcion";
    date.textContent = formatDate(transaction.transaction_date);
    amount.textContent = `${transaction.type === "expense" ? "-" : "+"}${formatAmount(transaction.amount)}`;
    amount.classList.add(
      transaction.type === "expense"
        ? "transaction-item__amount--expense"
        : "transaction-item__amount--income",
    );

    deleteButton.addEventListener("click", () => deleteTransaction(transaction.id));
    elements.transactionList.appendChild(fragment);
  });
}

function updateSyncStatus(message) {
  elements.syncStatus.textContent = message;
}

function updateAuthView() {
  const isLoggedIn = Boolean(state.user);
  const isConfigured = Boolean(supabaseClient);

  elements.setupBanner.hidden = isConfigured;
  elements.authForm.hidden = !isConfigured || isLoggedIn;
  elements.sessionCard.hidden = !isLoggedIn;
  elements.authRequiredCard.hidden = isLoggedIn;
  elements.form.hidden = !isLoggedIn;
  elements.exportButton.disabled = !isLoggedIn;
  elements.importInput.disabled = !isLoggedIn;
  elements.clearButton.disabled = !isLoggedIn;
  elements.currencySelect.disabled = !isConfigured;

  if (isLoggedIn) {
    elements.sessionEmail.textContent = state.user.email || "Usuario autenticado";
    updateSyncStatus("Tus movimientos se sincronizan con Supabase.");
  } else if (isConfigured) {
    updateSyncStatus("Inicia sesion o crea una cuenta para sincronizar tus movimientos.");
  } else {
    updateSyncStatus("Conecta tu proyecto de Supabase para empezar.");
  }
}

async function fetchTransactions() {
  if (!supabaseClient || !state.user) {
    state.transactions = [];
    renderTransactions();
    return;
  }

  updateSyncStatus("Cargando movimientos desde Supabase...");

  const { data, error } = await supabaseClient
    .from("movimientos")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    updateSyncStatus(`No se pudieron cargar tus movimientos: ${error.message}`);
    return;
  }

  state.transactions = data || [];
  renderTransactions();
  updateSyncStatus("Tus movimientos se sincronizan con Supabase.");
}

function createTransactionPayload(formData) {
  return {
    user_id: state.user.id,
    type: String(formData.get("type")),
    amount: Number(formData.get("amount")),
    category: String(formData.get("category")),
    transaction_date: String(formData.get("date")),
    description: String(formData.get("description") || "").trim() || null,
  };
}

async function saveTransaction(payload) {
  const { error } = await supabaseClient.from("movimientos").insert(payload);
  if (error) throw error;
}

async function deleteTransaction(id) {
  if (!supabaseClient || !state.user) return;

  const { error } = await supabaseClient.from("movimientos").delete().eq("id", id);
  if (error) {
    alert(`No se pudo eliminar el movimiento: ${error.message}`);
    return;
  }

  state.transactions = state.transactions.filter((item) => item.id !== id);
  renderTransactions();
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function exportData() {
  downloadFile(
    JSON.stringify(
      {
        currency: state.currency,
        transactions: state.transactions,
      },
      null,
      2,
    ),
    "appfinanzas-backup.json",
    "application/json",
  );
}

async function importData(file) {
  if (!supabaseClient || !state.user) return;

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const importedTransactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];

      if (!importedTransactions.length) {
        alert("El archivo no contiene movimientos para importar.");
        return;
      }

      const payload = importedTransactions.map((item) => ({
        user_id: state.user.id,
        type: item.type,
        amount: Number(item.amount),
        category: item.category,
        description: item.description || null,
        transaction_date: item.transaction_date || item.date,
      }));

      const { error } = await supabaseClient.from("movimientos").insert(payload);
      if (error) throw error;

      if (parsed.currency) {
        state.currency = parsed.currency;
        elements.currencySelect.value = state.currency;
        savePreferences();
      }

      await fetchTransactions();
      alert("Datos importados correctamente.");
    } catch (error) {
      console.error(error);
      alert(`No se pudo importar el archivo: ${error.message || "formato invalido"}`);
    } finally {
      elements.importInput.value = "";
    }
  };

  reader.readAsText(file);
}

async function clearAllData() {
  if (!supabaseClient || !state.user) return;

  const confirmed = window.confirm(
    "Se eliminaran todos tus movimientos guardados en Supabase para esta cuenta. Deseas continuar?",
  );
  if (!confirmed) return;

  const { error } = await supabaseClient.from("movimientos").delete().eq("user_id", state.user.id);

  if (error) {
    alert(`No se pudieron eliminar tus movimientos: ${error.message}`);
    return;
  }

  state.transactions = [];
  renderTransactions();
}

async function importLegacyLocalDataIfNeeded() {
  if (!state.user || state.transactions.length > 0) return;

  try {
    const raw = localStorage.getItem(legacyStorageKey);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const legacyTransactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
    if (!legacyTransactions.length) return;

    const confirmed = window.confirm(
      "Se encontraron movimientos locales de la version anterior. Deseas subirlos a Supabase ahora?",
    );
    if (!confirmed) return;

    const payload = legacyTransactions.map((item) => ({
      user_id: state.user.id,
      type: item.type,
      amount: Number(item.amount),
      category: item.category,
      description: item.description || null,
      transaction_date: item.transaction_date || item.date,
    }));

    const { error } = await supabaseClient.from("movimientos").insert(payload);
    if (error) throw error;

    if (parsed.currency) {
      state.currency = parsed.currency;
      elements.currencySelect.value = state.currency;
      savePreferences();
    }

    localStorage.removeItem(legacyStorageKey);
    await fetchTransactions();
  } catch (error) {
    console.error("No se pudieron migrar los datos locales.", error);
  }
}

async function handleSignIn(event) {
  event.preventDefault();

  if (!supabaseClient) {
    alert("Primero completa tu configuracion de Supabase.");
    return;
  }

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  updateSyncStatus("Iniciando sesion...");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    updateSyncStatus(`No se pudo iniciar sesion: ${error.message}`);
    return;
  }

  elements.authForm.reset();
}

async function handleSignUp() {
  if (!supabaseClient) {
    alert("Primero completa tu configuracion de Supabase.");
    return;
  }

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  if (!email || password.length < 6) {
    alert("Ingresa un correo valido y una contrasena de al menos 6 caracteres.");
    return;
  }

  updateSyncStatus("Creando cuenta...");

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
  });

  if (error) {
    updateSyncStatus(`No se pudo crear la cuenta: ${error.message}`);
    return;
  }

  updateSyncStatus(
    "Cuenta creada. Si activaste confirmacion por correo en Supabase, revisa tu email antes de iniciar sesion.",
  );
}

async function handleSignOut() {
  if (!supabaseClient) return;

  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    updateSyncStatus(`No se pudo cerrar sesion: ${error.message}`);
  }
}

function registerEvents() {
  elements.type.addEventListener("change", populateCategories);

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabaseClient || !state.user) return;

    try {
      const payload = createTransactionPayload(new FormData(elements.form));
      await saveTransaction(payload);

      elements.form.reset();
      elements.type.value = "income";
      populateCategories();
      setTodayDate();
      await fetchTransactions();
    } catch (error) {
      console.error(error);
      alert(`No se pudo guardar el movimiento: ${error.message}`);
    }
  });

  elements.authForm.addEventListener("submit", handleSignIn);
  elements.signUpButton.addEventListener("click", handleSignUp);
  elements.signOutButton.addEventListener("click", handleSignOut);
  elements.filterType.addEventListener("change", renderTransactions);
  elements.searchInput.addEventListener("input", renderTransactions);

  elements.currencySelect.addEventListener("change", () => {
    state.currency = elements.currencySelect.value;
    savePreferences();
    renderTransactions();
  });

  elements.exportButton.addEventListener("click", exportData);

  elements.importInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
  });

  elements.clearButton.addEventListener("click", clearAllData);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.warn("No se pudo registrar el service worker.", error);
      });
    });
  }
}

async function initializeAuth() {
  if (!supabaseClient) {
    updateAuthView();
    renderTransactions();
    return;
  }

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  state.user = session?.user || null;
  updateAuthView();

  if (state.user) {
    await fetchTransactions();
    await importLegacyLocalDataIfNeeded();
  } else {
    renderTransactions();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, sessionData) => {
    state.user = sessionData?.user || null;
    updateAuthView();

    if (state.user) {
      await fetchTransactions();
      await importLegacyLocalDataIfNeeded();
      return;
    }

    state.transactions = [];
    renderTransactions();
  });
}

function init() {
  elements.currencySelect.value = state.currency;
  populateCategories();
  setTodayDate();
  registerEvents();
  updateAuthView();
  renderTransactions();
  registerServiceWorker();
  initializeAuth();
}

init();
