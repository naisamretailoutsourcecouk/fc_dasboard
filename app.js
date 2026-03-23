const state = {
  fcMaster: [],
  inventory: [],
  orders6m: [],
  orders30d: [],
  orders7d: [],
};

const sampleData = {
  fcMaster: [
    { fc_code: 'BLR1', fc_name: 'Bengaluru North FC', state: 'Karnataka', city: 'Bengaluru' },
    { fc_code: 'HYD1', fc_name: 'Hyderabad Central FC', state: 'Telangana', city: 'Hyderabad' },
    { fc_code: 'MUM1', fc_name: 'Mumbai West FC', state: 'Maharashtra', city: 'Mumbai' },
  ],
  inventory: [
    { fc_code: 'BLR1', sku: 'SKU-100', product_name: 'Mixer Grinder', units: 85 },
    { fc_code: 'HYD1', sku: 'SKU-100', product_name: 'Mixer Grinder', units: 22 },
    { fc_code: 'MUM1', sku: 'SKU-200', product_name: 'Air Fryer', units: 170 },
    { fc_code: 'BLR1', sku: 'SKU-200', product_name: 'Air Fryer', units: 35 },
  ],
  orders6m: [
    { order_date: '2026-01-03', fc_code: 'BLR1', sku: 'SKU-100', product_name: 'Mixer Grinder', state: 'Karnataka', city: 'Bengaluru', units: 140 },
    { order_date: '2026-01-12', fc_code: 'HYD1', sku: 'SKU-100', product_name: 'Mixer Grinder', state: 'Telangana', city: 'Hyderabad', units: 120 },
    { order_date: '2026-02-18', fc_code: 'BLR1', sku: 'SKU-100', product_name: 'Mixer Grinder', state: 'Tamil Nadu', city: 'Chennai', units: 60 },
    { order_date: '2026-01-08', fc_code: 'MUM1', sku: 'SKU-200', product_name: 'Air Fryer', state: 'Maharashtra', city: 'Mumbai', units: 150 },
    { order_date: '2026-02-15', fc_code: 'BLR1', sku: 'SKU-200', product_name: 'Air Fryer', state: 'Karnataka', city: 'Bengaluru', units: 70 },
    { order_date: '2026-03-01', fc_code: 'MUM1', sku: 'SKU-200', product_name: 'Air Fryer', state: 'Gujarat', city: 'Ahmedabad', units: 30 },
  ],
  orders30d: [
    { order_date: '2026-03-01', fc_code: 'BLR1', sku: 'SKU-100', product_name: 'Mixer Grinder', units: 120 },
    { order_date: '2026-03-01', fc_code: 'HYD1', sku: 'SKU-100', product_name: 'Mixer Grinder', units: 75 },
    { order_date: '2026-03-01', fc_code: 'BLR1', sku: 'SKU-200', product_name: 'Air Fryer', units: 84 },
    { order_date: '2026-03-01', fc_code: 'MUM1', sku: 'SKU-200', product_name: 'Air Fryer', units: 150 },
  ],
  orders7d: [
    { order_date: '2026-03-15', fc_code: 'BLR1', sku: 'SKU-100', product_name: 'Mixer Grinder', units: 49 },
    { order_date: '2026-03-15', fc_code: 'HYD1', sku: 'SKU-100', product_name: 'Mixer Grinder', units: 28 },
    { order_date: '2026-03-15', fc_code: 'BLR1', sku: 'SKU-200', product_name: 'Air Fryer', units: 28 },
    { order_date: '2026-03-15', fc_code: 'MUM1', sku: 'SKU-200', product_name: 'Air Fryer', units: 35 },
  ],
};

const fileBindings = [
  ['fcFile', 'fcMaster'],
  ['inventoryFile', 'inventory'],
  ['orders6mFile', 'orders6m'],
  ['orders30File', 'orders30d'],
  ['orders7File', 'orders7d'],
];

const metricEls = {
  activeFcCount: document.getElementById('activeFcCount'),
  skuFcCount: document.getElementById('skuFcCount'),
  alertCount: document.getElementById('alertCount'),
};

const fcStatusBody = document.getElementById('fcStatusBody');
const stateShareBody = document.getElementById('stateShareBody');
const alertsList = document.getElementById('alertsList');
const messagePreview = document.getElementById('messagePreview');

function normalizeKey(key) {
  return key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map(normalizeKey);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? '';
      return row;
    }, {});
  });
}

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function coerceNumber(value) {
  const numeric = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(numeric) ? numeric : 0;
}

function toDisplay(value, fallback = '—') {
  return value === undefined || value === null || value === '' ? fallback : value;
}

function prepareRows(rows) {
  return rows.map((row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), typeof value === 'string' ? value.trim() : value])
  ));
}

async function handleFileSelect(event, targetKey) {
  const [file] = event.target.files;
  if (!file) return;

  const text = await file.text();
  let rows;

  if (file.name.toLowerCase().endsWith('.json')) {
    rows = JSON.parse(text);
  } else {
    rows = parseCsv(text);
  }

  state[targetKey] = prepareRows(rows);
}

function attachFileHandlers() {
  fileBindings.forEach(([inputId, key]) => {
    const input = document.getElementById(inputId);
    input.addEventListener('change', (event) => {
      handleFileSelect(event, key).catch((error) => {
        console.error(error);
        alert(`Could not parse ${inputId}. Please upload valid CSV or JSON.`);
      });
    });
  });
}

function loadSampleData() {
  Object.keys(sampleData).forEach((key) => {
    state[key] = prepareRows(sampleData[key]);
  });

  document.getElementById('whatsappTargets').value = '+1 555-0101, +1 555-0110';
  document.getElementById('emailTargets').value = 'ops@amazon-fc.local, planning@amazon-fc.local';
  document.getElementById('gchatTargets').value = 'Space: FC Alerts War Room';

  analyzeData();
}

function groupBy(items, keyFn) {
  return items.reduce((map, item) => {
    const key = keyFn(item);
    const bucket = map.get(key) || [];
    bucket.push(item);
    map.set(key, bucket);
    return map;
  }, new Map());
}

function computeStateShare() {
  const bySku = groupBy(state.orders6m, (row) => row.sku);
  const output = [];

  bySku.forEach((rows, sku) => {
    const totalUnits = rows.reduce((sum, row) => sum + coerceNumber(row.units), 0);
    const byState = groupBy(rows, (row) => row.state || 'Unknown');

    byState.forEach((stateRows, stateName) => {
      const units = stateRows.reduce((sum, row) => sum + coerceNumber(row.units), 0);
      const productName = stateRows[0]?.product_name || '';
      output.push({
        sku,
        product_name: productName,
        state: stateName,
        units,
        share: totalUnits ? (units / totalUnits) * 100 : 0,
      });
    });
  });

  return output.sort((a, b) => b.share - a.share || a.sku.localeCompare(b.sku));
}

function buildRateMap(rows, periodDays) {
  const map = new Map();
  rows.forEach((row) => {
    const key = `${row.fc_code}__${row.sku}`;
    const current = map.get(key) || {
      fc_code: row.fc_code,
      sku: row.sku,
      product_name: row.product_name,
      units: 0,
    };
    current.units += coerceNumber(row.units);
    map.set(key, current);
  });

  map.forEach((entry, key) => {
    map.set(key, {
      ...entry,
      drr: entry.units / periodDays,
    });
  });

  return map;
}

function computeFcStatus() {
  const fcMeta = new Map(state.fcMaster.map((row) => [row.fc_code, row]));
  const drr30Map = buildRateMap(state.orders30d, 30);
  const drr7Map = buildRateMap(state.orders7d, 7);

  return state.inventory.map((item) => {
    const key = `${item.fc_code}__${item.sku}`;
    const drr30 = drr30Map.get(key)?.drr || 0;
    const drr7 = drr7Map.get(key)?.drr || 0;
    const drr = drr7 > 0 ? drr7 : drr30;
    const currentStock = coerceNumber(item.units);
    const daysCover = drr > 0 ? currentStock / drr : Infinity;
    const fcInfo = fcMeta.get(item.fc_code) || {};

    let status = 'healthy';
    if (drr <= 0) {
      status = 'healthy';
    } else if (daysCover < 7) {
      status = 'danger';
    } else if (daysCover < 14) {
      status = 'warning';
    }

    return {
      fc_code: item.fc_code,
      fc_name: fcInfo.fc_name || item.fc_code,
      state: fcInfo.state || '',
      city: fcInfo.city || '',
      sku: item.sku,
      product_name: item.product_name,
      current_stock: currentStock,
      drr_30: drr30,
      drr_7: drr7,
      final_drr: drr,
      days_cover: daysCover,
      status,
    };
  }).sort((a, b) => a.days_cover - b.days_cover);
}

function computeAlerts(fcStatuses) {
  return fcStatuses.filter((row) => row.final_drr > 0 && row.days_cover < 14).map((row) => ({
    ...row,
    urgency: row.days_cover < 7 ? 'critical' : 'watch',
    recommended_action: row.days_cover < 7
      ? 'Expedite replenishment or rebalance from another FC immediately.'
      : 'Plan replenishment within the next 48 hours.',
  }));
}

function renderMetrics(fcStatuses, alerts) {
  metricEls.activeFcCount.textContent = String(new Set(state.fcMaster.map((row) => row.fc_code)).size);
  metricEls.skuFcCount.textContent = String(fcStatuses.length);
  metricEls.alertCount.textContent = String(alerts.length);
}

function renderFcStatus(fcStatuses) {
  if (!fcStatuses.length) {
    fcStatusBody.innerHTML = '<tr class="empty-row"><td colspan="6">No inventory rows found.</td></tr>';
    return;
  }

  fcStatusBody.innerHTML = fcStatuses.map((row) => `
    <tr>
      <td>
        <strong>${row.fc_code}</strong><br />
        <span>${toDisplay(row.fc_name)}</span>
      </td>
      <td>
        <strong>${toDisplay(row.sku)}</strong><br />
        <span>${toDisplay(row.product_name)}</span>
      </td>
      <td>${row.current_stock.toFixed(0)}</td>
      <td>${row.final_drr ? row.final_drr.toFixed(2) : '0.00'}</td>
      <td>${Number.isFinite(row.days_cover) ? row.days_cover.toFixed(1) : '∞'}</td>
      <td><span class="status-chip ${row.status}">${row.status.toUpperCase()}</span></td>
    </tr>
  `).join('');
}

function renderStateShare(rows) {
  if (!rows.length) {
    stateShareBody.innerHTML = '<tr class="empty-row"><td colspan="5">No 6-month order data found.</td></tr>';
    return;
  }

  stateShareBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${toDisplay(row.sku)}</td>
      <td>${toDisplay(row.product_name)}</td>
      <td>${toDisplay(row.state)}</td>
      <td>${row.units.toFixed(0)}</td>
      <td>${row.share.toFixed(1)}%</td>
    </tr>
  `).join('');
}

function readTargets() {
  return {
    whatsapp: document.getElementById('whatsappTargets').value.trim(),
    email: document.getElementById('emailTargets').value.trim(),
    gchat: document.getElementById('gchatTargets').value.trim(),
  };
}

function renderAlerts(alerts) {
  if (!alerts.length) {
    alertsList.className = 'alert-list empty-state';
    alertsList.textContent = 'No low-stock alerts. All FC / SKU pairs have 14+ days of stock cover.';
    return;
  }

  alertsList.className = 'alert-list';
  alertsList.innerHTML = alerts.map((alert) => `
    <article class="alert-card">
      <header>
        <div>
          <strong>${alert.fc_code} • ${alert.sku}</strong><br />
          <span>${toDisplay(alert.product_name)}</span>
        </div>
        <span class="status-chip ${alert.urgency === 'critical' ? 'danger' : 'warning'}">${alert.urgency.toUpperCase()}</span>
      </header>
      <div class="alert-meta">
        <span>Stock: ${alert.current_stock.toFixed(0)} units</span>
        <span>DRR: ${alert.final_drr.toFixed(2)}</span>
        <span>Cover: ${alert.days_cover.toFixed(1)} days</span>
      </div>
      <p>${alert.recommended_action}</p>
    </article>
  `).join('');
}

function renderMessagePreview(alerts) {
  if (!alerts.length) {
    messagePreview.textContent = 'No alert message prepared yet.';
    return;
  }

  const targets = readTargets();
  const lines = [
    'Amazon FC low stock summary',
    `WhatsApp: ${targets.whatsapp || 'Not configured'}`,
    `Email: ${targets.email || 'Not configured'}`,
    `GChat: ${targets.gchat || 'Not configured'}`,
    '',
    'Items below 14 days cover:',
    ...alerts.map((alert, index) => (
      `${index + 1}. ${alert.fc_code} / ${alert.sku} / ${toDisplay(alert.product_name)} — ` +
      `stock ${alert.current_stock.toFixed(0)}, DRR ${alert.final_drr.toFixed(2)}, ` +
      `cover ${alert.days_cover.toFixed(1)} days. ${alert.recommended_action}`
    )),
  ];

  messagePreview.textContent = lines.join('\n');
}

function hasMinimumData() {
  return state.fcMaster.length && state.inventory.length;
}

function analyzeData() {
  if (!hasMinimumData()) {
    alert('Please upload at least the registered FC code file and inventory ledger.');
    return;
  }

  const fcStatuses = computeFcStatus();
  const alerts = computeAlerts(fcStatuses);
  const stateShare = computeStateShare();

  renderMetrics(fcStatuses, alerts);
  renderFcStatus(fcStatuses);
  renderStateShare(stateShare);
  renderAlerts(alerts);
  renderMessagePreview(alerts);
}

attachFileHandlers();
document.getElementById('loadSampleBtn').addEventListener('click', loadSampleData);
document.getElementById('analyzeBtn').addEventListener('click', analyzeData);
