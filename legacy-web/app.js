const preferencesStorageKey = "app-finanzas-preferences-v4";

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
  currencySelect: document.getElementById("currencySelect"),
  onboardingPanel: document.getElementById("onboardingPanel"),
  dashboardContent: document.getElementById("dashboardContent"),
  setupForm: document.getElementById("setupForm"),
  salaryInput: document.getElementById("salaryInput"),
  bankRows: document.getElementById("bankRows"),
  cardRows: document.getElementById("cardRows"),
  addBankRowButton: document.getElementById("addBankRowButton"),
  addCardRowButton: document.getElementById("addCardRowButton"),
  bankRowTemplate: document.getElementById("bankRowTemplate"),
  cardRowTemplate: document.getElementById("cardRowTemplate"),
  salaryValue: document.getElementById("salaryValue"),
  netWorthValue: document.getElementById("netWorthValue"),
  creditUsedValue: document.getElementById("creditUsedValue"),
  creditAvailableValue: document.getElementById("creditAvailableValue"),
  netBarChart: document.getElementById("netBarChart"),
  creditDonutGrid: document.getElementById("creditDonutGrid"),
  expenseForm: document.getElementById("expenseForm"),
  expenseAmount: document.getElementById("expenseAmount"),
  expenseCategory: document.getElementById("expenseCategory"),
  expenseDate: document.getElementById("expenseDate"),
  paymentType: document.getElementById("paymentType"),
  paymentSource: document.getElementById("paymentSource"),
  expenseDescription: document.getElementById("expenseDescription"),
  cardPaymentForm: document.getElementById("cardPaymentForm"),
  paymentCardId: document.getElementById("paymentCardId"),
  paymentAccountId: document.getElementById("paymentAccountId"),
  cardPaymentAmount: document.getElementById("cardPaymentAmount"),
  cardPaymentDate: document.getElementById("cardPaymentDate"),
  cardPaymentDescription: document.getElementById("cardPaymentDescription"),
  salaryForm: document.getElementById("salaryForm"),
  salaryUpdateInput: document.getElementById("salaryUpdateInput"),
  accountForm: document.getElementById("accountForm"),
  accountBank: document.getElementById("accountBank"),
  accountName: document.getElementById("accountName"),
  accountBalance: document.getElementById("accountBalance"),
  creditCardForm: document.getElementById("creditCardForm"),
  cardBank: document.getElementById("cardBank"),
  cardName: document.getElementById("cardName"),
  cardLimit: document.getElementById("cardLimit"),
  cardBillingDay: document.getElementById("cardBillingDay"),
  accountsList: document.getElementById("accountsList"),
  cardsList: document.getElementById("cardsList"),
  historyFilter: document.getElementById("historyFilter"),
  historySearch: document.getElementById("historySearch"),
  expensesList: document.getElementById("expensesList"),
  expensesEmptyState: document.getElementById("expensesEmptyState"),
  expenseItemTemplate: document.getElementById("expenseItemTemplate"),
};

const initialState = {
  currency: "PEN",
  user: null,
  profile: null,
  bankAccounts: [],
  creditCards: [],
  expenses: [],
  cardPayments: [],
};

let state = { ...initialState, currency: loadPreferences().currency };

const supabaseConfig = window.APP_FINANZAS_SUPABASE || {};
const hasValidSupabaseConfig = Boolean(supabaseConfig.url) && Boolean(supabaseConfig.anonKey) && !String(supabaseConfig.url).includes("TU_PROJECT_URL") && !String(supabaseConfig.anonKey).includes("TU_ANON_KEY");
const supabaseClient = hasValidSupabaseConfig && window.supabase?.createClient ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

function loadPreferences() {
  try {
    const raw = localStorage.getItem(preferencesStorageKey);
    if (!raw) return { currency: initialState.currency };
    const parsed = JSON.parse(raw);
    return { currency: parsed.currency || initialState.currency };
  } catch {
    return { currency: initialState.currency };
  }
}

function savePreferences() {
  localStorage.setItem(preferencesStorageKey, JSON.stringify({ currency: state.currency }));
}

function getCurrencyFormatter() {
  const locales = { PEN: "es-PE", USD: "en-US", EUR: "es-ES" };
  return new Intl.NumberFormat(locales[state.currency] || "es-PE", { style: "currency", currency: state.currency, minimumFractionDigits: 2 });
}

function formatAmount(amount) { return getCurrencyFormatter().format(Number(amount) || 0); }
function formatDate(dateValue) {
  if (!dateValue) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${dateValue}T00:00:00`));
}

function setTodayDate() {
  const today = new Date().toISOString().split("T")[0];
  if (!elements.expenseDate.value) elements.expenseDate.value = today;
  if (!elements.cardPaymentDate.value) elements.cardPaymentDate.value = today;
}

function updateSyncStatus(message) { elements.syncStatus.textContent = message; }

function addDynamicRow(container, template) {
  const fragment = template.content.cloneNode(true);
  const row = fragment.querySelector(".dynamic-row");
  fragment.querySelector("[data-action='remove-row']").addEventListener("click", () => row.remove());
  container.appendChild(fragment);
}

function getRowsData(container) {
  return [...container.querySelectorAll(".dynamic-row")].map((row) => [...row.querySelectorAll("[data-field]")].reduce((acc, input) => {
    acc[input.dataset.field] = input.value.trim();
    return acc;
  }, {})).filter((item) => Object.values(item).some(Boolean));
}

function ensureStarterRows() {
  if (!elements.bankRows.children.length) addDynamicRow(elements.bankRows, elements.bankRowTemplate);
  if (!elements.cardRows.children.length) addDynamicRow(elements.cardRows, elements.cardRowTemplate);
}

function ratioColor(value, warning = 0.45, danger = 0.2) {
  if (value <= danger) return { start: "#b84f43", end: "#e28a67" };
  if (value <= warning) return { start: "#b78b32", end: "#e0b35d" };
  return { start: "#3d7a47", end: "#8ac76b" };
}

function creditColor(value, warning = 0.6, danger = 0.85) {
  if (value >= danger) return "#b84f43";
  if (value >= warning) return "#d49a43";
  return "#4e8a53";
}

function populatePaymentSources() {
  const useCards = elements.paymentType.value === "credit_card";
  const sources = useCards ? state.creditCards : state.bankAccounts;
  elements.paymentSource.innerHTML = sources.map((item) => `<option value="${item.id}">${useCards ? `${item.bank_name} - ${item.card_name}` : `${item.bank_name} - ${item.account_name}`}</option>`).join("");
  elements.paymentSource.disabled = sources.length === 0;
}

function populatePaymentSelectors() {
  elements.paymentCardId.innerHTML = state.creditCards.map((card) => `<option value="${card.id}">${card.bank_name} - ${card.card_name}</option>`).join("");
  elements.paymentAccountId.innerHTML = state.bankAccounts.map((account) => `<option value="${account.id}">${account.bank_name} - ${account.account_name}</option>`).join("");
  elements.paymentCardId.disabled = state.creditCards.length === 0;
  elements.paymentAccountId.disabled = state.bankAccounts.length === 0;
}

function getNetWorth() { return state.bankAccounts.reduce((sum, account) => sum + Number(account.balance), 0); }
function getCreditUsed() { return state.creditCards.reduce((sum, card) => sum + Number(card.current_used), 0); }
function getCreditAvailable() { return state.creditCards.reduce((sum, card) => sum + Math.max(0, Number(card.credit_limit) - Number(card.current_used)), 0); }

function renderStats() {
  const salary = Number(state.profile?.salary_amount || 0);
  const netWorth = getNetWorth();
  const netRatio = salary > 0 ? Math.min(1, netWorth / salary) : 1;
  const netColors = ratioColor(netRatio);
  const totalLimit = state.creditCards.reduce((sum, card) => sum + Number(card.credit_limit), 0);
  const creditUsageRatio = totalLimit > 0 ? getCreditUsed() / totalLimit : 0;

  elements.salaryValue.textContent = formatAmount(salary);
  elements.netWorthValue.textContent = formatAmount(netWorth);
  elements.creditUsedValue.textContent = formatAmount(getCreditUsed());
  elements.creditAvailableValue.textContent = formatAmount(getCreditAvailable());
  elements.salaryUpdateInput.value = salary ? salary.toFixed(2) : "";
  elements.netWorthValue.style.color = netColors.start;
  elements.salaryValue.style.color = ratioColor(1).start;
  elements.creditUsedValue.style.color = creditColor(creditUsageRatio);
  elements.creditAvailableValue.style.color = ratioColor(1 - creditUsageRatio, 0.4, 0.15).start;
}

function renderNetBarChart() {
  if (!state.bankAccounts.length) {
    elements.netBarChart.innerHTML = '<div class="empty-state"><h3>No hay cuentas registradas</h3><p>Agrega una cuenta bancaria para ver tu dinero neto por banco.</p></div>';
    return;
  }

  const salary = Number(state.profile?.salary_amount || 0);
  const maxBalance = Math.max(...state.bankAccounts.map((item) => Number(item.balance)), 1);
  elements.netBarChart.innerHTML = state.bankAccounts.map((account) => {
    const width = (Number(account.balance) / maxBalance) * 100;
    const ratio = salary > 0 ? Math.min(1, Number(account.balance) / salary) : 1;
    const colors = ratioColor(ratio);
    return `
      <article class="bar-track">
        <div class="bar-track__header">
          <strong>${account.bank_name} - ${account.account_name}</strong>
          <span>${formatAmount(account.balance)}</span>
        </div>
        <div class="bar-shell" aria-hidden="true">
          <div class="bar-fill" style="width:${width}%; --bar-start:${colors.start}; --bar-end:${colors.end};"></div>
        </div>
      </article>
    `;
  }).join("");
}

function renderCreditDonuts() {
  if (!state.creditCards.length) {
    elements.creditDonutGrid.innerHTML = '<div class="empty-state"><h3>No hay tarjetas registradas</h3><p>Agrega una tarjeta y veras un grafico circular de su consumo.</p></div>';
    return;
  }

  elements.creditDonutGrid.innerHTML = state.creditCards.map((card) => {
    const used = Number(card.current_used);
    const limit = Number(card.credit_limit) || 1;
    const progress = Math.min(100, (used / limit) * 100);
    const ringColor = creditColor(progress / 100);
    return `
      <article class="donut-card">
        <div class="donut-visual" style="--progress:${progress}%; --ring-color:${ringColor}"></div>
        <div class="donut-copy">
          <strong>${progress.toFixed(0)}%</strong>
          <span>usado</span>
        </div>
        <div>
          <h3>${card.bank_name} - ${card.card_name}</h3>
          <p class="section-description">Facturacion dia ${card.billing_day}. Usado ${formatAmount(used)} de ${formatAmount(limit)}.</p>
        </div>
      </article>
    `;
  }).join("");
}

function renderResources() {
  elements.accountsList.innerHTML = state.bankAccounts.length ? state.bankAccounts.map((account) => `
    <article class="resource-item">
      <div class="resource-item__header">
        <div><h3>${account.bank_name}</h3><p class="section-description">${account.account_name}</p></div>
        <span class="resource-pill">${formatAmount(account.balance)}</span>
      </div>
    </article>`).join("") : '<div class="empty-state"><p>No hay cuentas bancarias registradas.</p></div>';

  elements.cardsList.innerHTML = state.creditCards.length ? state.creditCards.map((card) => `
    <article class="resource-item">
      <div class="resource-item__header">
        <div><h3>${card.bank_name}</h3><p class="section-description">${card.card_name}</p></div>
        <span class="resource-pill">${formatAmount(card.current_used)} / ${formatAmount(card.credit_limit)}</span>
      </div>
      <div class="resource-item__body"><span>Facturacion: dia ${card.billing_day}</span></div>
    </article>`).join("") : '<div class="empty-state"><p>No hay tarjetas registradas.</p></div>';
}
function buildTimeline() {
  const expenses = state.expenses.map((expense) => ({
    id: expense.id,
    recordType: "expense",
    badge: expense.category,
    title: expense.description || "Gasto sin descripcion",
    date: expense.expense_date,
    source: expense.payment_method === "credit_card" ? `Tarjeta: ${expense.source_label}` : `Cuenta: ${expense.source_label}`,
    amountLabel: `-${formatAmount(expense.amount)}`,
    amountClass: "expense",
  }));

  const payments = state.cardPayments.map((payment) => ({
    id: payment.id,
    recordType: "payment",
    badge: "Pago tarjeta",
    title: payment.description || `Pago a ${payment.card_label}`,
    date: payment.payment_date,
    source: `${payment.account_label} -> ${payment.card_label}`,
    amountLabel: `-${formatAmount(payment.amount)}`,
    amountClass: "payment",
  }));

  return [...expenses, ...payments].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function getFilteredHistory() {
  const filter = elements.historyFilter.value;
  const query = elements.historySearch.value.trim().toLowerCase();
  return buildTimeline().filter((item) => (filter === "all" ? true : item.recordType === filter)).filter((item) => {
    if (!query) return true;
    return `${item.badge} ${item.title} ${item.source}`.toLowerCase().includes(query);
  });
}

function renderHistory() {
  const items = getFilteredHistory();
  elements.expensesList.innerHTML = "";
  elements.expensesEmptyState.hidden = items.length > 0;
  items.forEach((item) => {
    const fragment = elements.expenseItemTemplate.content.cloneNode(true);
    fragment.querySelector(".expense-badge").textContent = item.badge;
    fragment.querySelector(".expense-title").textContent = item.title;
    fragment.querySelector(".expense-date").textContent = formatDate(item.date);
    fragment.querySelector(".expense-source").textContent = item.source;
    const amountEl = fragment.querySelector(".expense-amount");
    amountEl.textContent = item.amountLabel;
    amountEl.classList.add(item.amountClass === "payment" ? "expense-amount--payment" : "expense-amount--expense");
    fragment.querySelector(".icon-button").addEventListener("click", () => deleteRecord(item));
    elements.expensesList.appendChild(fragment);
  });
}

function renderDashboard() {
  renderStats();
  renderNetBarChart();
  renderCreditDonuts();
  renderResources();
  renderHistory();
  populatePaymentSources();
  populatePaymentSelectors();
}

function updateAuthView() {
  const isLoggedIn = Boolean(state.user);
  const isConfigured = Boolean(supabaseClient);
  const hasProfile = Boolean(state.profile);
  const hasAccounts = state.bankAccounts.length > 0;
  const needsOnboarding = isLoggedIn && (!hasProfile || !hasAccounts);
  elements.setupBanner.hidden = isConfigured;
  elements.authForm.hidden = !isConfigured || isLoggedIn;
  elements.sessionCard.hidden = !isLoggedIn;
  elements.authRequiredCard.hidden = isLoggedIn;
  elements.onboardingPanel.hidden = !needsOnboarding;
  elements.dashboardContent.hidden = !isLoggedIn || needsOnboarding;
  elements.currencySelect.disabled = !isConfigured;
  if (isLoggedIn) {
    elements.sessionEmail.textContent = state.user.email || "Usuario autenticado";
    updateSyncStatus(needsOnboarding ? "Completa sueldo, cuentas y tarjetas para activar tu tablero." : "Tus datos se sincronizan con Supabase.");
  } else if (isConfigured) {
    updateSyncStatus("Inicia sesion o crea una cuenta para empezar.");
  } else {
    updateSyncStatus("Conecta tu proyecto de Supabase para empezar.");
  }
}

async function fetchDashboardData() {
  if (!supabaseClient || !state.user) {
    state = { ...state, profile: null, bankAccounts: [], creditCards: [], expenses: [], cardPayments: [] };
    updateAuthView();
    renderDashboard();
    return;
  }

  updateSyncStatus("Cargando tu panel financiero...");

  const [profileResult, accountsResult, cardsResult, expensesResult, paymentsResult] = await Promise.all([
    supabaseClient.from("profiles").select("*").eq("user_id", state.user.id).maybeSingle(),
    supabaseClient.from("bank_accounts").select("*").eq("user_id", state.user.id).order("created_at", { ascending: true }),
    supabaseClient.from("credit_cards").select("*").eq("user_id", state.user.id).order("created_at", { ascending: true }),
    supabaseClient.from("expenses").select("*").eq("user_id", state.user.id).order("expense_date", { ascending: false }).order("created_at", { ascending: false }),
    supabaseClient.from("card_payments").select("*").eq("user_id", state.user.id).order("payment_date", { ascending: false }).order("created_at", { ascending: false }),
  ]);

  const error = profileResult.error || accountsResult.error || cardsResult.error || expensesResult.error || paymentsResult.error;
  if (error) {
    console.error(error);
    updateSyncStatus(`No se pudieron cargar tus datos: ${error.message}`);
    return;
  }

  state.profile = profileResult.data || null;
  state.bankAccounts = accountsResult.data || [];
  state.creditCards = cardsResult.data || [];
  state.expenses = expensesResult.data || [];
  state.cardPayments = (paymentsResult.data || []).map((payment) => {
    const account = state.bankAccounts.find((item) => item.id === payment.bank_account_id);
    const card = state.creditCards.find((item) => item.id === payment.credit_card_id);
    return {
      ...payment,
      account_label: account ? `${account.bank_name} - ${account.account_name}` : "Cuenta eliminada",
      card_label: card ? `${card.bank_name} - ${card.card_name}` : "Tarjeta eliminada",
    };
  });

  updateAuthView();
  renderDashboard();
  updateSyncStatus(state.profile && state.bankAccounts.length ? "Tus cuentas, tarjetas, gastos y pagos ya estan sincronizados." : "Completa tu configuracion inicial para seguir.");
}

async function createInitialSetup(formData) {
  const salary = Number(formData.get("salary"));
  const bankRows = getRowsData(elements.bankRows).filter((item) => item.bank_name && item.account_name && item.balance !== "").map((item) => ({ user_id: state.user.id, bank_name: item.bank_name, account_name: item.account_name, balance: Number(item.balance) }));
  const cardRows = getRowsData(elements.cardRows).filter((item) => item.bank_name && item.card_name && item.credit_limit !== "").map((item) => ({ user_id: state.user.id, bank_name: item.bank_name, card_name: item.card_name, credit_limit: Number(item.credit_limit), current_used: 0, billing_day: Number(item.billing_day || 1) }));
  if (!bankRows.length) throw new Error("Necesitas al menos una cuenta bancaria.");
  const { error: profileError } = await supabaseClient.from("profiles").upsert({ user_id: state.user.id, salary_amount: salary });
  if (profileError) throw profileError;
  const { error: bankError } = await supabaseClient.from("bank_accounts").insert(bankRows);
  if (bankError) throw bankError;
  if (cardRows.length) {
    const { error: cardError } = await supabaseClient.from("credit_cards").insert(cardRows);
    if (cardError) throw cardError;
  }
}

async function updateSalary(amount) {
  const { error } = await supabaseClient.from("profiles").upsert({ user_id: state.user.id, salary_amount: Number(amount) });
  if (error) throw error;
}

async function addBankAccount(payload) {
  const { error } = await supabaseClient.from("bank_accounts").insert({ user_id: state.user.id, bank_name: payload.bank_name, account_name: payload.account_name, balance: Number(payload.balance) });
  if (error) throw error;
}

async function addCreditCard(payload) {
  const { error } = await supabaseClient.from("credit_cards").insert({ user_id: state.user.id, bank_name: payload.bank_name, card_name: payload.card_name, credit_limit: Number(payload.credit_limit), current_used: 0, billing_day: Number(payload.billing_day) });
  if (error) throw error;
}
async function saveExpense(payload) {
  if (payload.payment_method === "bank_account") {
    const account = state.bankAccounts.find((item) => item.id === payload.bank_account_id);
    if (!account) throw new Error("La cuenta seleccionada no existe.");
    if (Number(account.balance) < payload.amount) throw new Error("No tienes saldo suficiente en esa cuenta.");
    const newBalance = Number(account.balance) - payload.amount;
    const { error: accountError } = await supabaseClient.from("bank_accounts").update({ balance: newBalance }).eq("id", account.id).eq("user_id", state.user.id);
    if (accountError) throw accountError;
    const { error: expenseError } = await supabaseClient.from("expenses").insert({ user_id: state.user.id, amount: payload.amount, category: payload.category, description: payload.description, expense_date: payload.expense_date, payment_method: "bank_account", bank_account_id: account.id, source_label: `${account.bank_name} - ${account.account_name}` });
    if (expenseError) {
      await supabaseClient.from("bank_accounts").update({ balance: account.balance }).eq("id", account.id).eq("user_id", state.user.id);
      throw expenseError;
    }
    return;
  }

  const card = state.creditCards.find((item) => item.id === payload.credit_card_id);
  if (!card) throw new Error("La tarjeta seleccionada no existe.");
  const nextUsed = Number(card.current_used) + payload.amount;
  if (nextUsed > Number(card.credit_limit)) throw new Error("El gasto supera la linea disponible de esa tarjeta.");
  const { error: cardError } = await supabaseClient.from("credit_cards").update({ current_used: nextUsed }).eq("id", card.id).eq("user_id", state.user.id);
  if (cardError) throw cardError;
  const { error: expenseError } = await supabaseClient.from("expenses").insert({ user_id: state.user.id, amount: payload.amount, category: payload.category, description: payload.description, expense_date: payload.expense_date, payment_method: "credit_card", credit_card_id: card.id, source_label: `${card.bank_name} - ${card.card_name}` });
  if (expenseError) {
    await supabaseClient.from("credit_cards").update({ current_used: card.current_used }).eq("id", card.id).eq("user_id", state.user.id);
    throw expenseError;
  }
}

async function saveCardPayment(payload) {
  const account = state.bankAccounts.find((item) => item.id === payload.bank_account_id);
  const card = state.creditCards.find((item) => item.id === payload.credit_card_id);
  if (!account) throw new Error("La cuenta seleccionada no existe.");
  if (!card) throw new Error("La tarjeta seleccionada no existe.");
  if (Number(account.balance) < payload.amount) throw new Error("No tienes saldo suficiente en esa cuenta para pagar.");
  if (Number(card.current_used) <= 0) throw new Error("Esa tarjeta no tiene deuda pendiente.");
  if (payload.amount > Number(card.current_used)) throw new Error("No puedes pagar mas de lo que debes en esa tarjeta.");

  const nextBalance = Number(account.balance) - payload.amount;
  const nextUsed = Number(card.current_used) - payload.amount;
  const { error: accountError } = await supabaseClient.from("bank_accounts").update({ balance: nextBalance }).eq("id", account.id).eq("user_id", state.user.id);
  if (accountError) throw accountError;
  const { error: cardError } = await supabaseClient.from("credit_cards").update({ current_used: nextUsed }).eq("id", card.id).eq("user_id", state.user.id);
  if (cardError) {
    await supabaseClient.from("bank_accounts").update({ balance: account.balance }).eq("id", account.id).eq("user_id", state.user.id);
    throw cardError;
  }
  const { error: paymentError } = await supabaseClient.from("card_payments").insert({ user_id: state.user.id, bank_account_id: account.id, credit_card_id: card.id, amount: payload.amount, payment_date: payload.payment_date, description: payload.description });
  if (paymentError) {
    await supabaseClient.from("bank_accounts").update({ balance: account.balance }).eq("id", account.id).eq("user_id", state.user.id);
    await supabaseClient.from("credit_cards").update({ current_used: card.current_used }).eq("id", card.id).eq("user_id", state.user.id);
    throw paymentError;
  }
}

async function deleteExpense(expenseId) {
  const expense = state.expenses.find((item) => item.id === expenseId);
  if (!expense) return;
  if (expense.payment_method === "bank_account" && expense.bank_account_id) {
    const account = state.bankAccounts.find((item) => item.id === expense.bank_account_id);
    if (account) {
      const { error } = await supabaseClient.from("bank_accounts").update({ balance: Number(account.balance) + Number(expense.amount) }).eq("id", account.id).eq("user_id", state.user.id);
      if (error) throw error;
    }
  }
  if (expense.payment_method === "credit_card" && expense.credit_card_id) {
    const card = state.creditCards.find((item) => item.id === expense.credit_card_id);
    if (card) {
      const { error } = await supabaseClient.from("credit_cards").update({ current_used: Math.max(0, Number(card.current_used) - Number(expense.amount)) }).eq("id", card.id).eq("user_id", state.user.id);
      if (error) throw error;
    }
  }
  const { error } = await supabaseClient.from("expenses").delete().eq("id", expenseId).eq("user_id", state.user.id);
  if (error) throw error;
  await fetchDashboardData();
}

async function deleteCardPayment(paymentId) {
  const payment = state.cardPayments.find((item) => item.id === paymentId);
  if (!payment) return;
  const account = state.bankAccounts.find((item) => item.id === payment.bank_account_id);
  const card = state.creditCards.find((item) => item.id === payment.credit_card_id);
  if (account) {
    const { error } = await supabaseClient.from("bank_accounts").update({ balance: Number(account.balance) + Number(payment.amount) }).eq("id", account.id).eq("user_id", state.user.id);
    if (error) throw error;
  }
  if (card) {
    const { error } = await supabaseClient.from("credit_cards").update({ current_used: Number(card.current_used) + Number(payment.amount) }).eq("id", card.id).eq("user_id", state.user.id);
    if (error) throw error;
  }
  const { error } = await supabaseClient.from("card_payments").delete().eq("id", paymentId).eq("user_id", state.user.id);
  if (error) throw error;
  await fetchDashboardData();
}

async function deleteRecord(item) {
  if (item.recordType === "expense") return deleteExpense(item.id);
  return deleteCardPayment(item.id);
}

async function handleSignIn(event) {
  event.preventDefault();
  if (!supabaseClient) return alert("Primero actualiza tu configuracion de Supabase.");
  updateSyncStatus("Iniciando sesion...");
  const { error } = await supabaseClient.auth.signInWithPassword({ email: elements.authEmail.value.trim(), password: elements.authPassword.value });
  if (error) updateSyncStatus(`No se pudo iniciar sesion: ${error.message}`);
  else elements.authForm.reset();
}

async function handleSignUp() {
  if (!supabaseClient) return alert("Primero actualiza tu configuracion de Supabase.");
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;
  if (!email || password.length < 6) return alert("Ingresa un correo valido y una contrasena de al menos 6 caracteres.");
  updateSyncStatus("Creando cuenta...");
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) updateSyncStatus(`No se pudo crear la cuenta: ${error.message}`);
  else updateSyncStatus("Cuenta creada. Si activaste confirmacion por correo, revisa tu email antes de iniciar sesion.");
}

async function handleSignOut() {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) updateSyncStatus(`No se pudo cerrar sesion: ${error.message}`);
}
function registerEvents() {
  elements.authForm.addEventListener("submit", handleSignIn);
  elements.signUpButton.addEventListener("click", handleSignUp);
  elements.signOutButton.addEventListener("click", handleSignOut);
  elements.currencySelect.addEventListener("change", () => { state.currency = elements.currencySelect.value; savePreferences(); renderDashboard(); });
  elements.addBankRowButton.addEventListener("click", () => addDynamicRow(elements.bankRows, elements.bankRowTemplate));
  elements.addCardRowButton.addEventListener("click", () => addDynamicRow(elements.cardRows, elements.cardRowTemplate));

  elements.setupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await createInitialSetup(new FormData(elements.setupForm));
      elements.setupForm.reset();
      elements.bankRows.innerHTML = "";
      elements.cardRows.innerHTML = "";
      ensureStarterRows();
      await fetchDashboardData();
    } catch (error) { alert(`No se pudo guardar la configuracion inicial: ${error.message}`); }
  });

  elements.paymentType.addEventListener("change", populatePaymentSources);

  elements.expenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const paymentMethod = elements.paymentType.value;
      await saveExpense({ amount: Number(elements.expenseAmount.value), category: elements.expenseCategory.value, description: elements.expenseDescription.value.trim() || null, expense_date: elements.expenseDate.value, payment_method: paymentMethod, bank_account_id: paymentMethod === "bank_account" ? elements.paymentSource.value : null, credit_card_id: paymentMethod === "credit_card" ? elements.paymentSource.value : null });
      elements.expenseForm.reset();
      elements.paymentType.value = "bank_account";
      setTodayDate();
      populatePaymentSources();
      await fetchDashboardData();
    } catch (error) { alert(`No se pudo guardar el gasto: ${error.message}`); }
  });

  elements.cardPaymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveCardPayment({ bank_account_id: elements.paymentAccountId.value, credit_card_id: elements.paymentCardId.value, amount: Number(elements.cardPaymentAmount.value), payment_date: elements.cardPaymentDate.value, description: elements.cardPaymentDescription.value.trim() || null });
      elements.cardPaymentForm.reset();
      setTodayDate();
      populatePaymentSelectors();
      await fetchDashboardData();
    } catch (error) { alert(`No se pudo registrar el pago: ${error.message}`); }
  });

  elements.salaryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try { await updateSalary(elements.salaryUpdateInput.value); await fetchDashboardData(); } catch (error) { alert(`No se pudo actualizar el sueldo: ${error.message}`); }
  });

  elements.accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try { await addBankAccount({ bank_name: elements.accountBank.value.trim(), account_name: elements.accountName.value.trim(), balance: elements.accountBalance.value }); elements.accountForm.reset(); await fetchDashboardData(); } catch (error) { alert(`No se pudo agregar la cuenta: ${error.message}`); }
  });

  elements.creditCardForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try { await addCreditCard({ bank_name: elements.cardBank.value.trim(), card_name: elements.cardName.value.trim(), credit_limit: elements.cardLimit.value, billing_day: elements.cardBillingDay.value }); elements.creditCardForm.reset(); await fetchDashboardData(); } catch (error) { alert(`No se pudo agregar la tarjeta: ${error.message}`); }
  });

  elements.historyFilter.addEventListener("change", renderHistory);
  elements.historySearch.addEventListener("input", renderHistory);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => console.warn("No se pudo registrar el service worker.", error));
    });
  }
}

async function initializeAuth() {
  updateAuthView();
  renderDashboard();
  if (!supabaseClient) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  state.user = session?.user || null;
  updateAuthView();
  if (state.user) await fetchDashboardData();

  supabaseClient.auth.onAuthStateChange(async (_event, sessionData) => {
    state.user = sessionData?.user || null;
    if (state.user) {
      await fetchDashboardData();
      return;
    }
    state = { ...state, user: null, profile: null, bankAccounts: [], creditCards: [], expenses: [], cardPayments: [] };
    updateAuthView();
    renderDashboard();
  });
}

function init() {
  elements.currencySelect.value = state.currency;
  ensureStarterRows();
  setTodayDate();
  registerEvents();
  registerServiceWorker();
  initializeAuth();
}

init();
