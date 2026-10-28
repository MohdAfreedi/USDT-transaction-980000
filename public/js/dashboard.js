/* =========================================================
   AFREEDI CLOUD — DASHBOARD.JS
   Dashboard controls, drawers, countdown and transaction
   verification using your application's backend API.
   ========================================================= */

(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  const RECEIVERS = {
    wallet1: "TAbD4yCXMxJqAQ29pCLodk6vu7vYC6YWjy",
    wallet2: "TTTHnNEBykkco6fPA7e9w4kP3FjJuRE9Hn"
  };

  const TX = {
    id: "TX-4C91B72E",
    database: "AFREEDI-PROD-DB",
    network: "TRON (TRC20)"
  };

  let txClock = null;
  let dbClock = null;
  let toastTimer = null;
  let countdownInterval = null;

  const show = (element, display = "flex") => {
    if (element) element.style.display = display;
  };

  const hide = element => {
    if (element) element.style.display = "none";
  };

  /* =========================================================
     DASHBOARD COUNTS
     ========================================================= */

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function loadCounts() {
    const instances = readArray("instances");
    const dbServers = readArray("dbServers");
    const autonomous = readArray("autonomousDatabases");

    if ($("computeCount")) {
      $("computeCount").textContent = instances.length;
    }

    if ($("databaseCount")) {
      $("databaseCount").textContent =
        dbServers.length + autonomous.length;
    }
  }

  /* =========================================================
     GLOBAL SEARCH
     ========================================================= */

  function initSearch() {
    const input = $("globalSearch");
    const results = $("searchResults");

    if (!input) return;

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();

      document.querySelectorAll(".summary-card").forEach(card => {
        card.style.display =
          !query || card.innerText.toLowerCase().includes(query)
            ? "flex"
            : "none";
      });
    });

    input.addEventListener("focus", () => {
      if (results) results.style.display = "block";
    });

    input.addEventListener("blur", () => {
      setTimeout(() => {
        if (results) results.style.display = "none";
      }, 200);
    });
  }

  /* =========================================================
     NOTIFICATIONS AND RELATIVE TIMES
     ========================================================= */

  function initNotifications() {
    const button = $("notificationBtn");
    const menu = $("notificationMenu");

    if (!button || !menu) return;

    button.addEventListener("click", event => {
      event.stopPropagation();
      menu.style.display =
        menu.style.display === "block" ? "none" : "block";
    });
  }

  function updateRelativeTimes(selector) {
    document.querySelectorAll(selector).forEach(element => {
      const date = new Date(element.dataset.time);

      if (Number.isNaN(date.getTime())) return;

      const seconds = Math.max(
        0,
        Math.floor((Date.now() - date.getTime()) / 1000)
      );

      let label = "Just now";

      if (seconds >= 86400) {
        label = Math.floor(seconds / 86400) + " days ago";
      } else if (seconds >= 3600) {
        label = Math.floor(seconds / 3600) + " hours ago";
      } else if (seconds >= 60) {
        label = Math.floor(seconds / 60) + " minutes ago";
      }

      element.textContent = label;
    });
  }

  /* =========================================================
     WIZARD AND MENUS
     ========================================================= */

  window.openWizard = function () {
    const wizard = $("wizard");
    if (!wizard) return;

    wizard.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  window.closeWizard = function () {
    const wizard = $("wizard");
    if (!wizard) return;

    wizard.style.display = "none";
    document.body.style.overflow = "";
  };

  window.toggleMenu = function (id) {
    const menu = $(id);
    if (!menu) return;

    menu.style.display =
      menu.style.display === "block" ? "none" : "block";
  };

  /* =========================================================
     RESOURCE CHART
     Requires Chart.js to be loaded by dashboard.html.
     ========================================================= */

  function initChart() {
    const canvas = $("resourceChart");

    if (!canvas || typeof Chart === "undefined") return;

    if (canvas.dataset.initialized === "true") return;
    canvas.dataset.initialized = "true";

    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["CPU", "Memory", "Storage", "Network"],
        datasets: [{
          data: [68, 52, 71, 35],
          backgroundColor: [
            "#ea4335",
            "#2563eb",
            "#16a34a",
            "#f59e0b"
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }

  /* =========================================================
     TOAST MESSAGE
     ========================================================= */

  function showTxToast(message) {
    const toast = $("txToast");

    if (!toast) {
      console.log(message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  window.showTxToast = showTxToast;

  window.showExplorerMessage = function () {
    showTxToast("Enter a real transaction hash to verify it.");
  };

  /* =========================================================
     WALLET DETAILS MODAL
     ========================================================= */

  window.showUSDTWalletDetails = function () {
    const modal = $("usdtDetailsModal");
    const content = $("usdtDetailsContent");

    if (!modal || !content) return;

    content.innerHTML = `
      <div class="transaction-detail-icon">
        <i class="fa-solid fa-wallet"></i>
      </div>
      <h2>USDT Wallet</h2>
      <p class="transaction-subtitle">
        Wallet and application information
      </p>
      <div class="transaction-info">
        <div>
          <span>Application reference</span>
          <strong>${TX.id}</strong>
        </div>
        <div>
          <span>Database</span>
          <strong>${TX.database}</strong>
        </div>
        <div>
          <span>Network</span>
          <strong>${TX.network}</strong>
        </div>
      </div>
      <p>
        This panel displays application information. It does not
        independently establish a wallet balance or payment status.
      </p>
    `;

    show(modal);
    modal.setAttribute("aria-hidden", "false");
  };

  window.closeUSDTDetails = function () {
    const modal = $("usdtDetailsModal");
    if (!modal) return;

    hide(modal);
    modal.setAttribute("aria-hidden", "true");
  };

  /* =========================================================
     TRANSFER AND TRANSACTION MODALS
     ========================================================= */

  window.closeTransferComplete = function () {
    const modal = $("transferCompleteModal");
    if (!modal) return;

    hide(modal);
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  function startTxLiveClock() {
    const update = () => {
      const time = new Date().toLocaleTimeString();

      if ($("txLiveTime")) {
        $("txLiveTime").textContent = "Updated " + time;
      }

      if ($("txLastUpdated")) {
        $("txLastUpdated").textContent = time;
      }
    };

    clearInterval(txClock);
    update();
    txClock = setInterval(update, 1000);
  }

  function startDbHealthClock() {
    const update = () => {
      if ($("dbHealthTime")) {
        $("dbHealthTime").textContent =
          "checked " + new Date().toLocaleTimeString();
      }
    };

    clearInterval(dbClock);
    update();
    dbClock = setInterval(update, 5000);
  }

  window.closeTransactionDetails = function () {
    const modal = $("transactionModal");

    if (modal) {
      hide(modal);
      modal.classList.remove("open");
      modal.style.pointerEvents = "none";
      modal.setAttribute("aria-hidden", "true");
    }

    clearInterval(txClock);
    clearInterval(dbClock);
    txClock = null;
    dbClock = null;

    document.body.style.overflow = "";
  };

  window.openTransactionDetails = function () {
    const modal = $("transactionModal");
    if (!modal) return;

    show(modal);
    modal.classList.add("open");
    modal.style.pointerEvents = "auto";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    startTxLiveClock();
    startDbHealthClock();
  };

  window.openWithdrawalReview = function () {
    const modal = $("withdrawalReviewModal");
    if (!modal) return;

    show(modal);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  window.closeWithdrawalReview = function () {
    const modal = $("withdrawalReviewModal");
    if (!modal) return;

    hide(modal);
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  window.showWalletAlignment = function (address, label) {
    const modal = $("walletAlignmentModal");
    if (!modal) return;

    if ($("wamWalletAddress")) {
      $("wamWalletAddress").textContent = address || "";
    }

    if ($("wamWalletLabel")) {
      $("wamWalletLabel").textContent =
        label || "Selected receiver wallet";
    }

    show(modal);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  window.closeWalletAlignment = function () {
    const modal = $("walletAlignmentModal");
    if (!modal) return;

    hide(modal);
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  /* =========================================================
     COPY A DISPLAYED VALUE
     ========================================================= */

  window.copyTxValue = async function (id) {
    const element = $(id);
    if (!element) return;

    const value = element.textContent.trim();

    try {
      await navigator.clipboard.writeText(value);
      showTxToast("Copied to clipboard.");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.select();

      const copied = document.execCommand("copy");
      textarea.remove();

      showTxToast(copied ? "Copied to clipboard." : "Copy failed.");
    }
  };

  /* =========================================================
     VERIFY A REAL TRON TRANSACTION
     Backend must implement:
     GET /api/tron/transaction/:hash
     ========================================================= */

  window.verifyRealTransaction = async function () {
    const input = $("realTxHash");
    const button = document.querySelector(".tx-verify-btn");
    const hash = (input?.value || "").trim();

    if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
      showTxToast("Enter a valid 64-character transaction hash.");
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Verifying…";
    }

    try {
      const response = await fetch(
        "/api/tron/transaction/" + encodeURIComponent(hash),
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Transaction was not found by the configured data source."
            : "Verification request failed: HTTP " + response.status
        );
      }

      const tx = await response.json();

      if (
        !tx ||
        typeof tx.hash !== "string" ||
        tx.hash.toLowerCase() !== hash.toLowerCase()
      ) {
        throw new Error("The returned transaction hash did not match.");
      }

      applyVerifiedTransaction(tx);
      showTxToast("Transaction data retrieved successfully.");
    } catch (error) {
      console.error("Transaction verification error:", error);
      showTxToast(error.message || "Unable to verify transaction.");
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML =
          '<i class="fa-solid fa-shield-check"></i> Verify';
      }
    }
  };

  function applyVerifiedTransaction(tx) {
    const transfer = Array.isArray(tx.trc20TransferInfo)
      ? tx.trc20TransferInfo[0]
      : null;

    const hash = tx.hash || "";
    const sender = transfer?.from_address || tx.ownerAddress || "Not provided";
    const receiver = transfer?.to_address || tx.toAddress || "Not provided";

    const decimalValue = Number(transfer?.decimals);
    const decimals =
      Number.isInteger(decimalValue) &&
      decimalValue >= 0 &&
      decimalValue <= 30
        ? decimalValue
        : 6;

    let amount = "Not provided";

    if (transfer?.amount_str != null) {
      const rawAmount = Number(transfer.amount_str);

      if (Number.isFinite(rawAmount)) {
        amount =
          (rawAmount / Math.pow(10, decimals)).toLocaleString() +
          " " +
          (transfer.symbol || "TRC20 token");
      }
    }

    const reverted =
      Boolean(tx.revert) ||
      String(tx.contractRet || "").toUpperCase() === "REVERT";

    const confirmed = Boolean(tx.confirmed) && !reverted;

    const status = reverted
      ? "Reverted according to data source"
      : confirmed
        ? "Confirmed according to data source"
        : "Pending or unconfirmed according to data source";

    const values = {
      txUiTitle: amount + " transfer",
      txUiSubtitle: "Transaction " + hash,
      txSenderAddress: sender,
      txReceiverAddress: receiver,
      txUiSender: sender,
      txUiReceiver: receiver,
      txUiHash: hash,
      txUiAmount: amount,
      txUiDetailAmount: amount,
      txUiDetailStatus: status,
      txUiConfirmations: String(tx.confirmations ?? "Not provided")
    };

    Object.entries(values).forEach(([id, value]) => {
      if ($(id)) $(id).textContent = value;
    });

    if ($("txUiStatus")) {
      $("txUiStatus").textContent = status;
    }

    if ($("txUiProgress")) {
      $("txUiProgress").style.width = confirmed ? "100%" : "10%";
    }

    if ($("txLiveTime") && tx.timestamp) {
      const timestamp = Number(tx.timestamp);
      const date = new Date(
        timestamp < 1e12 ? timestamp * 1000 : timestamp
      );

      $("txLiveTime").textContent = "Transaction time: " + date.toLocaleString();
    }
  }

  /* =========================================================
     DOWNLOAD AN ON-CHAIN VERIFICATION REPORT
     This report is not an official TRONSCAN receipt.
     ========================================================= */

  window.downloadAcknowledgementReceipt = async function () {
    const enteredHash = window.prompt(
      "Enter the real 64-character TRON transaction hash:"
    );

    if (enteredHash === null) return;

    const hash = enteredHash.trim();

    if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
      showTxToast("Enter a valid 64-character transaction hash.");
      return;
    }

    try {
      showTxToast("Retrieving transaction data…");

      const response = await fetch(
        "/api/tron/transaction/" + encodeURIComponent(hash),
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error("Verification request failed: HTTP " + response.status);
      }

      const tx = await response.json();

      if (
        !tx ||
        typeof tx.hash !== "string" ||
        tx.hash.toLowerCase() !== hash.toLowerCase()
      ) {
        throw new Error("The returned transaction hash did not match.");
      }

      const transfer = Array.isArray(tx.trc20TransferInfo)
        ? tx.trc20TransferInfo[0]
        : null;

      const escapeHtml = value =>
        String(value ?? "Not provided").replace(/[&<>"']/g, char => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[char]);

      const decimalValue = Number(transfer?.decimals);
      const decimals =
        Number.isInteger(decimalValue) &&
        decimalValue >= 0 &&
        decimalValue <= 30
          ? decimalValue
          : 6;

      let amount = "Not provided";

      if (transfer?.amount_str != null) {
        const raw = Number(transfer.amount_str);

        if (Number.isFinite(raw)) {
          amount =
            (raw / Math.pow(10, decimals)).toLocaleString() +
            " " +
            (transfer.symbol || "TRC20 token");
        }
      }

      const reverted =
        Boolean(tx.revert) ||
        String(tx.contractRet || "").toUpperCase() === "REVERT";

      const status = reverted
        ? "Reverted according to data source"
        : tx.confirmed
          ? "Confirmed according to data source"
          : "Pending or unconfirmed according to data source";

      const timestampValue = Number(tx.timestamp);
      const transactionTime =
        Number.isFinite(timestampValue) && timestampValue > 0
          ? new Date(
              timestampValue < 1e12
                ? timestampValue * 1000
                : timestampValue
            ).toLocaleString()
          : "Not provided";

      const rows = [
        ["Transaction hash", tx.hash],
        ["Status", status],
        ["Token / amount", amount],
        ["Sender address", transfer?.from_address || tx.ownerAddress || "Not provided"],
        ["Receiver address", transfer?.to_address || tx.toAddress || "Not provided"],
        ["Confirmations", tx.confirmations ?? "Not provided"],
        ["Block number", tx.block ?? tx.blockNumber ?? "Not provided"],
        ["Transaction time", transactionTime],
        ["Application reference", TX.id],
        ["Application database", TX.database],
        ["Report generated", new Date().toLocaleString()]
      ];

      const rowsHtml = rows.map(([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
      ).join("");

      const explorerUrl =
        "https://tronscan.org/#/transaction/" + encodeURIComponent(tx.hash);

      const report = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Afreedi Cloud — Transaction Verification Report</title>
<style>
*{box-sizing:border-box}
body{margin:0;padding:24px;background:#f3f5f8;color:#17202b;font:15px/1.5 Arial,sans-serif}
main{max-width:850px;margin:20px auto;background:#fff;border:1px solid #dce2e9;border-radius:16px;overflow:hidden}
header{padding:26px 30px;background:#111827;color:#fff}
header h1{margin:0 0 6px;font-size:24px}
header p{margin:0;color:#cbd5e1}
section{padding:26px 30px}
.notice{padding:14px 16px;border:1px solid #f0d79c;background:#fff9e9;border-radius:10px;margin-bottom:20px}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:12px;border-bottom:1px solid #e8edf2;vertical-align:top;overflow-wrap:anywhere}
th{width:32%;color:#64748b;font-weight:600}
a{color:#155eef;overflow-wrap:anywhere}
footer{padding:18px 30px;background:#f8fafc;color:#64748b;font-size:12px}
@media(max-width:600px){body{padding:8px}section,header,footer{padding:18px}th{width:40%}}
</style>
</head>
<body>
<main>
<header>
<h1>Afreedi Cloud</h1>
<p>Transaction verification report · TRON network</p>
</header>
<section>
<div class="notice">
<strong>Important:</strong> This report displays data returned by the application's
configured data source. It is not issued by TRONSCAN or a wallet provider and does
not independently prove that funds reached the intended recipient. Check the
transaction, token contract, and destination address on the explorer.
</div>
<table><tbody>${rowsHtml}</tbody></table>
<p><strong>Open transaction explorer:</strong>
<a href="${escapeHtml(explorerUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(explorerUrl)}</a>
</p>
</section>
<footer>
Generated by Afreedi Cloud for informational purposes. Verify transaction details
independently before making payment or wallet decisions.
</footer>
</main>
</body>
</html>`;

      const blob = new Blob([report], {
        type: "text/html;charset=utf-8"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        "Afreedi_Cloud_Verification_" + hash.slice(0, 12) + ".html";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showTxToast("Verification report downloaded.");
    } catch (error) {
      console.error(error);
      showTxToast(error.message || "Unable to create the report.");
    }
  };

  /* =========================================================
     NOTIFICATION DETAILS
     ========================================================= */

  window.showNotificationDetails = function (type) {
    const modal = $("usdtDetailsModal");
    const content = $("usdtDetailsContent");

    if (!modal || !content) return;

    const details = {
      resource: {
        title: "High Resource Usage",
        status: "Attention Required",
        body: "Review current database resource utilization."
      },
      database: {
        title: "Database Server",
        status: "Review Required",
        body: "Check database status and recent server events."
      },
      backup: {
        title: "Backup Record",
        status: "Review Backup Logs",
        body: "Confirm the backup result in your actual backup logs."
      }
    };

    const item = details[type];
    if (!item) return;

    content.innerHTML = `
      <h2>${item.title}</h2>
      <div class="transaction-status">${item.status}</div>
      <p>${item.body}</p>
    `;

    show(modal);
    modal.setAttribute("aria-hidden", "false");
  };

  /* =========================================================
     USDT DEMO DRAWER COUNTDOWN
     This is a UI timer, not a blockchain settlement timer.
     ========================================================= */

  const USDT_TIMER_KEY = "afreedi_usdt_demo_deadline_v1";
  const USDT_DURATION = 24 * 60 * 60 * 1000;

  function getUSDTDeadline() {
    let deadline = Number(localStorage.getItem(USDT_TIMER_KEY));

    if (!Number.isFinite(deadline) || deadline <= 0) {
      deadline = Date.now() + USDT_DURATION;
      localStorage.setItem(USDT_TIMER_KEY, String(deadline));
    }

    return deadline;
  }

  function updateUSDTCountdown() {
    const display = $("usdtCountdown");
    if (!display) return;

    const remaining = Math.max(0, getUSDTDeadline() - Date.now());
    const seconds = Math.floor(remaining / 1000);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    display.textContent = [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ].join(":");

    if (remaining <= 0 && countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  window.openUSDTTransaction = function () {
    const overlay = $("usdtTransactionOverlay");
    if (!overlay) return;

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    getUSDTDeadline();
    updateUSDTCountdown();

    clearInterval(countdownInterval);
    countdownInterval = setInterval(updateUSDTCountdown, 1000);
  };

  window.closeUSDTTransaction = function () {
    const overlay = $("usdtTransactionOverlay");
    if (overlay) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }

    clearInterval(countdownInterval);
    countdownInterval = null;
  };

  window.copyUSDTReceiver = async function () {
    const receiver = $("usdtReceiver");
    if (!receiver) return;

    try {
      await navigator.clipboard.writeText(receiver.textContent.trim());
      showTxToast("Receiver address copied.");
    } catch {
      showTxToast("Copy unavailable. Select and copy the address manually.");
    }
  };

  /* =========================================================
     TRANSACTION DEMO DRAWER
     ========================================================= */

  function initTransactionDrawer() {
    const drawer = $("txDemoDrawer");
    const overlay = $("txDemoOverlay");
    const closeButton = $("txDemoClose");
    const backButton = $("txDemoBack");
    const copyButton = $("txDemoCopy");
    const receiverElement = $("txDemoReceiver");
    const countdownElement = $("txDemoCountdown");

    if (!drawer || !overlay) return;

    const STORAGE_KEY = "afreediCloudDemoCountdownEnd";
    const DURATION = 12 * 60 * 60 * 1000;
    const receiverAddress = RECEIVERS.wallet2;

    let endTime = Number(localStorage.getItem(STORAGE_KEY));

    if (!Number.isFinite(endTime) || endTime <= 0) {
      endTime = Date.now() + DURATION;
      localStorage.setItem(STORAGE_KEY, String(endTime));
    }

    let drawerTimer = null;

    function updateCountdown() {
      if (!countdownElement) return;

      const remaining = Math.max(0, endTime - Date.now());
      const totalSeconds = Math.ceil(remaining / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      countdownElement.textContent = [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0")
      ].join(":");

      if (remaining <= 0) {
        clearInterval(drawerTimer);
        drawerTimer = null;
      }
    }

    window.openTxDemoDrawer = function () {
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
      document.body.classList.add("tx-demo-drawer-open");

      drawer.setAttribute("aria-hidden", "false");
      overlay.setAttribute("aria-hidden", "false");

      if (receiverElement) {
        receiverElement.textContent = receiverAddress;
      }

      updateCountdown();

      if (!drawerTimer && endTime > Date.now()) {
        drawerTimer = setInterval(updateCountdown, 1000);
      }

      if (closeButton) closeButton.focus();
    };

    window.closeTxDemoDrawer = function () {
      drawer.classList.remove("is-open");
      overlay.classList.remove("is-open");
      document.body.classList.remove("tx-demo-drawer-open");

      drawer.setAttribute("aria-hidden", "true");
      overlay.setAttribute("aria-hidden", "true");
    };

    closeButton?.addEventListener("click", window.closeTxDemoDrawer);
    backButton?.addEventListener("click", window.closeTxDemoDrawer);
    overlay.addEventListener("click", window.closeTxDemoDrawer);

    copyButton?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(receiverAddress);
        copyButton.textContent = "Copied!";
      } catch {
        showTxToast("Copy unavailable. Please copy the address manually.");
      }

      setTimeout(() => {
        copyButton.textContent = "Copy address";
      }, 1800);
    });

    updateCountdown();
    if (!drawerTimer && endTime > Date.now()) {
      drawerTimer = setInterval(updateCountdown, 1000);
    }
  }

  /* =========================================================
     CLOSE MODALS ON BACKDROP OR ESCAPE
     ========================================================= */

  document.addEventListener("click", event => {
    const notification = $("notificationMenu");

    if (notification && !event.target.closest(".notification")) {
      hide(notification);
    }

    const backdropModals = [
      ["wizard", window.closeWizard],
      ["transactionModal", window.closeTransactionDetails],
      ["walletAlignmentModal", window.closeWalletAlignment],
      ["withdrawalReviewModal", window.closeWithdrawalReview],
      ["transferCompleteModal", window.closeTransferComplete],
      ["usdtDetailsModal", window.closeUSDTDetails],
      ["usdtTransactionOverlay", window.closeUSDTTransaction]
    ];

    backdropModals.forEach(([id, closeFunction]) => {
      const element = $(id);

      if (element && event.target === element && closeFunction) {
        closeFunction();
      }
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    window.closeWizard();
    window.closeTransactionDetails();
    window.closeUSDTDetails();
    window.closeWalletAlignment();
    window.closeWithdrawalReview();
    window.closeTransferComplete();
    window.closeUSDTTransaction();
    window.closeTxDemoDrawer?.();
  });

  /* =========================================================
     STARTUP
     ========================================================= */

  function init() {
    loadCounts();
    initSearch();
    initNotifications();
    initChart();
    initTransactionDrawer();

    updateRelativeTimes(".time");
    updateRelativeTimes(".tx-time");

    setInterval(() => updateRelativeTimes(".time"), 60000);
    setInterval(() => updateRelativeTimes(".tx-time"), 60000);

    if (localStorage.getItem(USDT_TIMER_KEY)) {
      updateUSDTCountdown();
    }

    console.log("Afreedi Cloud dashboard initialized.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();