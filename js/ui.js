let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  updateUITexts();
}

function updateUITexts() {
  const texts = i18n[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (texts[key]) {
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.placeholder = texts[key];
      } else {
        el.textContent = texts[key];
      }
    }
  });
}

function renderWorkshops(category, dataList) {
  const texts = i18n[currentLang];
  const container = document.getElementById('workshops-container');
  container.innerHTML = '';
  
  const introText = document.createElement('p');
  introText.className = 'category-intro';
  introText.textContent = texts['intro_' + category.replace('cat_', '')] || '';
  container.appendChild(introText);
  
  if (!dataList || dataList.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-msg';
    emptyMsg.textContent = texts.no_data;
    container.appendChild(emptyMsg);
    return;
  }
  
  // Render Desktop Table
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'table-wrapper desktop-only';
  
  let tableHTML = `
    <table class="workshop-table">
      <thead>
        <tr>
          <th>${texts.th_no}</th>
          <th>${texts.th_title}</th>
          <th>${texts.th_summary}</th>
          <th>${texts.th_date}</th>
          <th style="min-width: 120px;">${texts.th_video}</th>
          <th style="min-width: 120px;">${texts.th_materials}</th>
          <th>${texts.th_notes}</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  dataList.forEach(item => {
    tableHTML += `
      <tr>
        <td>${item['STT'] || ''}</td>
        <td><strong>${item['Tên workshop'] || ''}</strong></td>
        <td>${item['Nội dung/Tóm tắt'] || item['Nội dung'] || ''}</td>
        <td>${item['Ngày đăng'] || item['Ngày học'] || ''}</td>
        <td>
          ${item['Link video (Drive)'] ? `<a href="${item['Link video (Drive)']}" target="_blank" class="btn btn-sm btn-primary">${texts.btn_watch}</a>` : ''}
        </td>
        <td>
          ${item['Link tài liệu'] ? `<a href="${item['Link tài liệu']}" target="_blank" class="btn btn-sm btn-outline">${texts.btn_material}</a>` : ''}
        </td>
        <td>${item['Ghi chú'] || ''}</td>
      </tr>
    `;
  });
  
  tableHTML += `</tbody></table>`;
  tableWrapper.innerHTML = tableHTML;
  container.appendChild(tableWrapper);
  
  // Render Mobile Cards
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'cards-wrapper mobile-only';
  
  dataList.forEach(item => {
    const cardHTML = `
      <div class="workshop-card">
        <div class="card-header">
          <span class="badge">#${item['STT'] || ''}</span>
          <h3>${item['Tên workshop'] || ''}</h3>
        </div>
        <div class="card-body">
          <p><strong>${texts.th_summary}:</strong> ${item['Nội dung/Tóm tắt'] || item['Nội dung'] || ''}</p>
          <p><strong>${texts.th_date}:</strong> ${item['Ngày đăng'] || item['Ngày học'] || ''}</p>
          ${item['Ghi chú'] ? `<p class="notes"><strong>${texts.th_notes}:</strong> ${item['Ghi chú']}</p>` : ''}
        </div>
        <div class="card-footer">
          ${item['Link video (Drive)'] ? `<a href="${item['Link video (Drive)']}" target="_blank" class="btn btn-block btn-primary">${texts.btn_watch}</a>` : ''}
          ${item['Link tài liệu'] ? `<a href="${item['Link tài liệu']}" target="_blank" class="btn btn-block btn-outline mt-2">${texts.btn_material}</a>` : ''}
        </div>
      </div>
    `;
    cardsWrapper.innerHTML += cardHTML;
  });
  
  container.appendChild(cardsWrapper);
}
