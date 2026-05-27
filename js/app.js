let appData = {};

document.addEventListener('DOMContentLoaded', () => {
  // Right click prevention
  document.addEventListener('contextmenu', event => event.preventDefault());
  
  // Language toggle
  const langToggle = document.getElementById('lang-checkbox');
  langToggle.addEventListener('change', (e) => {
    const newLang = e.target.checked ? 'vi' : 'en';
    setLanguage(newLang);
    const activeTab = document.querySelector('.sidebar-nav li.active');
    if (activeTab && activeTab.dataset.tab !== 'home') {
      renderWorkshops(activeTab.dataset.tab, appData[activeTab.dataset.sheet]);
    }
  });
  
  // Initial i18n
  setLanguage('en');
  
  // Check auth
  const session = localStorage.getItem('saola_session');
  if (session) {
    showDashboard();
    loadData();
  } else {
    showLogin();
  }
  
  // Login Form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const btn = document.getElementById('login-btn');
    
    btn.disabled = true;
    btn.textContent = i18n[currentLang].loading;
    
    const res = await loginAPI(u, p);
    if (res.status === 'success') {
      localStorage.setItem('saola_session', JSON.stringify(res.data));
      showDashboard();
      loadData();
    } else {
      alert(res.message);
    }
    
    btn.disabled = false;
    btn.textContent = i18n[currentLang].loginBtn;
  });
  
  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('saola_session');
    showLogin();
  });
  
  // Tabs
  document.querySelectorAll('.sidebar-nav li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      
      const tab = li.dataset.tab;
      const sheet = li.dataset.sheet;
      
      if (tab === 'home') {
        document.getElementById('home-view').style.display = 'block';
        document.getElementById('workshops-container').style.display = 'none';
      } else {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('workshops-container').style.display = 'block';
        renderWorkshops(tab, appData[sheet]);
      }
      
      // Close sidebar on mobile
      document.querySelector('.sidebar').classList.remove('open');
    });
  });

  // Mobile menu toggle
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });
});

function showLogin() {
  document.getElementById('login-view').style.display = 'flex';
  document.getElementById('dashboard-view').style.display = 'none';
  document.getElementById('password').value = '';
}

function showDashboard() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('dashboard-view').style.display = 'flex';
  
  const user = JSON.parse(localStorage.getItem('saola_session'));
  document.getElementById('user-info').textContent = user.email || user.studentId;
}

async function loadData() {
  document.getElementById('loading-overlay').style.display = 'flex';
  const res = await fetchWorkshopsAPI();
  document.getElementById('loading-overlay').style.display = 'none';
  
  if (res.status === 'success') {
    appData = res.data;
    // trigger active tab render
    const activeTab = document.querySelector('.sidebar-nav li.active');
    if (activeTab && activeTab.dataset.tab !== 'home') {
      renderWorkshops(activeTab.dataset.tab, appData[activeTab.dataset.sheet]);
    }
  } else {
    alert("Error loading data: " + res.message);
  }
}
