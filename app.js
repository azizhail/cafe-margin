const config={url:'https://wdzgwaeypxvjizageueu.supabase.co',key:'sb_publishable_jE3dU62W7kl2ffOBf0qMqg_Pb3wvOew'};
const app=document.querySelector('#app');const toast=document.querySelector('#toast');const localProductsKey='cafemargin-products';const printerKey='cafemargin-printer';let session=null,shop=null,role='';let products=[];let cart=[];
const show=message=>{toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)};
async function api(path,options={}){const headers={apikey:config.key,'Content-Type':'application/json',...(options.headers||{})};if(session?.access_token)headers.Authorization=`Bearer ${session.access_token}`;const response=await fetch(`${config.url}/rest/v1/${path}`,{...options,headers});const text=await response.text();if(!response.ok)throw new Error(text||`Request failed: ${response.status}`);return text.trim()?JSON.parse(text):null}
async function login(email,password){const response=await fetch(`${config.url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});if(!response.ok)throw new Error('البريد أو كلمة المرور غير صحيحة');session=await response.json();localStorage.setItem('cafemargin-session',JSON.stringify(session));const members=await api(`shop_members?user_id=eq.${session.user.id}&select=shop_id,role&limit=1`);if(!members?.[0])throw new Error('لا يوجد محل مرتبط بهذا الحساب');role=members[0].role;const shops=await api(`shops?id=eq.${members[0].shop_id}&select=id,name&limit=1`);shop=shops?.[0];products=await api(`products?shop_id=eq.${shop.id}&select=*`)||[];localStorage.setItem(`${localProductsKey}-${shop.id}`,JSON.stringify(products))}
function loginView(){app.innerHTML='<main class="auth"><form class="auth-card" id="login-form"><div class="logo"><b>cm</b><strong>CafeMargin</strong></div><h1>تسجيل الدخول</h1><p class="muted">استخدم البريد الإلكتروني وكلمة المرور السحابية.</p><label>البريد الإلكتروني<input id="login-email" type="email" required></label><label>كلمة المرور<input id="login-password" type="password" required></label><p id="login-error" class="error"></p><button class="primary">دخول</button><div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;text-align:center"><button type="button" id="btn-forgot-password" style="background:none;border:none;color:var(--ink-muted);font-size:13px;cursor:pointer;text-decoration:underline">نسيت كلمة المرور؟ استعادة عبر الإيميل</button><button type="button" id="btn-to-signup" style="background:none;border:none;color:var(--teal);font-size:13px;cursor:pointer">ليس لديك حساب؟ إنشاء حساب مقهى جديد</button></div></form></main>';document.querySelector('#login-form').onsubmit=async event=>{event.preventDefault();try{await login(document.querySelector('#login-email').value.trim(),document.querySelector('#login-password').value);render()}catch(error){document.querySelector('#login-error').textContent=error.message}};document.querySelector('#btn-to-signup').onclick=signupView;document.querySelector('#btn-forgot-password').onclick=forgotPasswordView}
function forgotPasswordView(){app.innerHTML='<main class="auth"><form class="auth-card" id="forgot-form"><div class="logo"><b>cm</b><strong>CafeMargin</strong></div><h1>استعادة كلمة المرور</h1><p class="muted">أدخل بريدك الإلكتروني وسيتم إرسال رابط استعادة كلمة المرور إليه.</p><label>البريد الإلكتروني<input id="forgot-email" type="email" required></label><p id="forgot-error" class="error"></p><p id="forgot-success" style="color:var(--mint);font-size:13px;margin:8px 0;display:none;"></p><button class="primary" id="btn-submit-forgot">إرسال رابط الاستعادة</button><button type="button" id="btn-to-login" style="background:none;border:none;color:var(--teal);margin-top:12px;font-size:13px;cursor:pointer">العودة لتسجيل الدخول</button></form></main>';document.querySelector('#btn-to-login').onclick=loginView;document.querySelector('#forgot-form').onsubmit=async event=>{event.preventDefault();const errorEl=document.querySelector('#forgot-error');const successEl=document.querySelector('#forgot-success');const email=document.querySelector('#forgot-email').value.trim().toLowerCase();const btn=document.querySelector('#btn-submit-forgot');errorEl.textContent='';successEl.style.display='none';btn.disabled=true;btn.textContent='جاري الإرسال...';try{const response=await fetch(`${config.url}/auth/v1/recover`,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email,redirect_to:'https://azizhail.github.io/cafe-margin/'})});if(!response.ok){const errData=await response.json().catch(()=>({}));throw new Error(errData.msg||errData.error_description||'تعذر إرسال رابط الاستعادة، تأكد من صحة البريد')}successEl.textContent='تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح! تحقق من صندوق الوارد والبريد المهمل (Spam).';successEl.style.display='block'}catch(err){errorEl.textContent=err.message}finally{btn.disabled=false;btn.textContent='إرسال رابط الاستعادة'}}}
function signupView(){app.innerHTML='<main class="auth"><form class="auth-card" id="signup-form"><div class="logo"><b>cm</b><strong>CafeMargin</strong></div><h1>طلب تسجيل مقهى جديد</h1><p class="muted">أدخل بياناتك وسيتم إرسال طلبك للإدارة لتفعيله.</p><label>الاسم الكامل<input id="signup-name" required></label><label>اسم المقهى<input id="signup-shop" required></label><label>البريد الإلكتروني<input id="signup-email" type="email" required></label><label>كلمة المرور<input id="signup-password" type="password" minlength="6" required></label><p id="signup-error" class="error"></p><button class="primary">إرسال طلب التسجيل</button><button type="button" id="btn-to-login" class="primary" style="background:none;color:var(--teal);margin-top:12px;font-size:13px">لديك حساب بالفعل؟ تسجيل الدخول</button></form></main>';document.querySelector('#btn-to-login').onclick=loginView;document.querySelector('#signup-form').onsubmit=async event=>{event.preventDefault();const error=document.querySelector('#signup-error');const fullName=document.querySelector('#signup-name').value.trim();const shopName=document.querySelector('#signup-shop').value.trim();const email=document.querySelector('#signup-email').value.trim().toLowerCase();const password=document.querySelector('#signup-password').value;try{const response=await fetch(`${config.url}/auth/v1/signup`,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:{full_name:fullName,shop_name:shopName}})});const result=await response.json();if(!response.ok)throw new Error(result.msg||result.error_description||'تعذر إنشاء الحساب');await api('access_requests',{method:'POST',body:JSON.stringify({email,full_name:fullName,shop_name:shopName,requested_role:'owner',status:'pending',user_id:result.user?.id})});try{await fetch('https://formsubmit.co/ajax/erthcafe11@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({_subject:'طلب تسجيل مقهى جديد بانتظار التفعيل',_captcha:'false',الاسم:fullName,المحل:shopName,البريد:email})})}catch(e){}app.innerHTML=`<main class="auth"><div class="auth-card"><div class="logo"><b>cm</b><strong>CafeMargin</strong></div><h1>تم إرسال طلبك بنجاح</h1><p>وصل إشعار بطلب تسجيل مقهاك إلى إيميل الإدارة (erthcafe11@gmail.com).</p><p class="muted">حسابك الآن قيد المراجعة والتفعيل. ستتمكن من تسجيل الدخول فور الموافقة.</p><button class="primary" id="btn-go-login">العودة لتسجيل الدخول</button></div></main>`;document.querySelector('#btn-go-login').onclick=loginView}catch(err){error.textContent=err.message}}}
function shell(){localStorage.setItem('cafemargin-active-shop',shop.id);const manager=role!=='sales';app.innerHTML=`<div class="layout"><aside class="sidebar"><div class="logo"><b>cm</b><strong>CafeMargin</strong></div><div class="branch"><small>المحل النشط</small><strong>${shop.name}</strong></div><nav class="nav"><button data-view="pos">▣ المبيعات</button>${manager?'<button data-view="products">◈ المنتجات والتكلفة</button><button data-view="inventory">◌ المخزون</button><button data-view="reports">▤ التقارير</button><button data-view="assistant">✦ المستشار</button><button data-view="team">♙ الموظفون</button>':''}</nav><button class="printer-link" data-view="printer">▤ إعداد الطابعة</button><div class="profile"><strong>${session.user.name||session.user.email}</strong><small>${manager?'مدير المشروع':'كاشير'}</small></div><button class="logout" id="logout">تسجيل الخروج</button></aside><main class="content"><header class="topbar"><div><small class="muted">نظام إدارة المقهى</small><h1 id="title">المبيعات</h1></div><span class="muted">${new Date().toLocaleDateString('ar-SA')}</span></header><section id="pos" class="view active"></section><section id="products" class="view"></section><section id="inventory" class="view"></section><section id="reports" class="view"></section><section id="assistant" class="view"></section><section id="team" class="view"></section><section id="printer" class="view"></section></main></div>`;document.querySelector('#logout').onclick=()=>{localStorage.removeItem('cafemargin-session');session=null;loginView()};document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>activate(button.dataset.view));renderPos();renderPrinter();if(manager){renderProducts();renderInventory();renderReports();renderAssistant();renderTeam()}}
function activate(view){document.querySelectorAll('.view').forEach(section=>section.classList.toggle('active',section.id===view));document.querySelectorAll('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===view));document.querySelector('#title').textContent={pos:'المبيعات',products:'المنتجات والتكلفة',inventory:'المخزون',reports:'التقارير',assistant:'المستشار',team:'الموظفون',printer:'إعداد الطابعة'}[view]||'المبيعات'}
let heldOrdersKey = () => `cafemargin-held-${shop?.id || 'default'}`;
let orderType = 'dinein'; // dinein, takeaway, delivery
let discountType = 'fixed'; // fixed, percent
let discountVal = 0;
let orderNote = '';

function renderPos(){
  const view=document.querySelector('#pos');
  const heldCount = JSON.parse(localStorage.getItem(heldOrdersKey())||'[]').length;
  view.innerHTML=`
    <div class="pos-topbar">
      <div class="pos-title-block">
        <small class="muted">نقطة البيع الكاشير</small>
        <h2>إنشاء طلب جديد</h2>
      </div>
      <div class="pos-actions-bar">
        <button id="btn-held-orders" class="btn-outline" type="button">
          📋 الطلبات المعلقة <span class="badge" id="held-count">${heldCount}</span>
        </button>
        <button id="reprint" class="btn-outline" type="button">
          ⟳ إعادة طباعة آخر فاتورة
        </button>
      </div>
    </div>
    <div class="pos-layout">
      <div class="pos-catalog">
        <div class="toolbar pos-search-bar">
          <input id="search" placeholder="🔍 ابحث برقم أو اسم المنتج..." autocomplete="off">
        </div>
        <div id="categories" class="categories">
          <button class="active" data-category="all">⚡ الكل</button>
        </div>
        <div id="catalog" class="grid-products"></div>
      </div>
      <aside class="cart pos-cart-card">
        <div class="cart-type-selector">
          <button type="button" class="type-btn ${orderType==='dinein'?'active':''}" data-type="dinein">🍽 محلي</button>
          <button type="button" class="type-btn ${orderType==='takeaway'?'active':''}" data-type="takeaway">🥡 سفري</button>
          <button type="button" class="type-btn ${orderType==='delivery'?'active':''}" data-type="delivery">🚗 توصيل</button>
        </div>
        <div class="cart-head">
          <h3>الطلب الحالي</h3>
          <button id="clear" class="btn-text-danger" type="button">تفريغ السلة</button>
        </div>
        <div id="cart-items" class="cart-items"></div>
        <div class="cart-discount-section">
          <label>الخصم على الفاتورة
            <div class="discount-input-group">
              <input id="pos-discount-val" type="number" min="0" value="${discountVal}" placeholder="0">
              <select id="pos-discount-type">
                <option value="fixed" ${discountType==='fixed'?'selected':''}>ر.س</option>
                <option value="percent" ${discountType==='percent'?'selected':''}>%</option>
              </select>
            </div>
          </label>
        </div>
        <div class="cart-summary-block">
          <div class="summary-line"><span>المجموع (شامل الضريبة)</span><b id="subtotal">0.00 ر.س</b></div>
          <div class="summary-line"><span>قيمة الخصم</span><b id="discount-amount" class="text-danger">0.00 ر.س</b></div>
          <div class="summary-line"><span>ضريبة القيمة المضافة (15%)</span><b id="vat-amount">0.00 ر.س</b></div>
          <div class="summary-line total-line"><span>الإجمالي النهائي</span><b id="pos-grand-total">0.00 ر.س</b></div>
        </div>
        <div class="payment-section">
          <label>طريقة الدفع
            <select id="payment">
              <option value="نقدي">💵 نقدي (Cash)</option>
              <option value="بطاقة">مدى / بطاقة (Card)</option>
              <option value="تحويل">تحويل بنكي</option>
            </select>
          </label>
          <div id="cash-calculator" class="cash-calc-box">
            <small class="muted">مبالغ الكاش السريعة:</small>
            <div class="quick-cash-btns">
              <button type="button" class="quick-cash" data-cash="10">10</button>
              <button type="button" class="quick-cash" data-cash="20">20</button>
              <button type="button" class="quick-cash" data-cash="50">50</button>
              <button type="button" class="quick-cash" data-cash="100">100</button>
              <button type="button" class="quick-cash" data-cash="exact">المبلغ بالضبط</button>
            </div>
            <label>المبلغ المستلم من العميل
              <input id="tendered-cash" type="number" min="0" placeholder="0.00">
            </label>
            <div class="summary-line change-line">
              <span>المتبقي للعميل (الباقي)</span>
              <b id="cash-change" class="text-success">0.00 ر.س</b>
            </div>
          </div>
        </div>
        <div class="cart-bottom-actions">
          <button id="btn-hold-order" class="btn-secondary" type="button">⏸ تعليق الطلب</button>
          <button id="checkout" class="checkout-btn" type="button">💳 إتمام البيع والطباعة</button>
        </div>
      </aside>
    </div>
  `;

  const categories=[...new Set(products.map(item=>item.category).filter(Boolean))];
  const catContainer = document.querySelector('#categories');
  categories.forEach(category=>{
    const button=document.createElement('button');
    button.dataset.category=category;
    button.textContent=category;
    catContainer.appendChild(button);
  });

  // Order type buttons listener
  document.querySelectorAll('.type-btn').forEach(btn=>{
    btn.onclick = () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      orderType = btn.dataset.type;
    };
  });

  // Payment type toggle listener (show/hide cash calculator)
  const paymentSelect = document.querySelector('#payment');
  const cashCalcBox = document.querySelector('#cash-calculator');
  paymentSelect.onchange = () => {
    cashCalcBox.style.display = (paymentSelect.value === 'نقدي') ? 'block' : 'none';
  };

  // Quick cash helper
  document.querySelectorAll('.quick-cash').forEach(btn => {
    btn.onclick = () => {
      const grandTotal = calcTotals().grandTotal;
      const tenderedInput = document.querySelector('#tendered-cash');
      if (btn.dataset.cash === 'exact') {
        tenderedInput.value = grandTotal.toFixed(2);
      } else {
        tenderedInput.value = Number(btn.dataset.cash).toFixed(2);
      }
      updateChange();
    };
  });

  document.querySelector('#tendered-cash').oninput = updateChange;

  document.querySelector('#pos-discount-val').oninput = (e) => {
    discountVal = Number(e.target.value) || 0;
    renderCart();
  };

  document.querySelector('#pos-discount-type').onchange = (e) => {
    discountType = e.target.value;
    renderCart();
  };

  document.querySelector('#search').oninput=renderCatalog;
  catContainer.onclick=event=>{
    const button=event.target.closest('button');
    if(!button)return;
    catContainer.querySelectorAll('button').forEach(item=>item.classList.remove('active'));
    button.classList.add('active');
    renderCatalog();
  };

  document.querySelector('#clear').onclick=()=>{cart=[];renderCart();};
  document.querySelector('#checkout').onclick=checkout;
  document.querySelector('#reprint').onclick=reprintLastReceipt;
  document.querySelector('#btn-hold-order').onclick=holdCurrentOrder;
  document.querySelector('#btn-held-orders').onclick=showHeldOrdersModal;

  renderCatalog();
  renderCart();
}

function calcTotals(){
  const subtotal = cart.reduce((sum,item)=>sum+Number(item.sale_price||0)*item.quantity,0);
  let discountAmount = 0;
  if(discountType === 'percent'){
    discountAmount = (subtotal * discountVal) / 100;
  } else {
    discountAmount = discountVal;
  }
  if(discountAmount > subtotal) discountAmount = subtotal;

  const afterDiscount = subtotal - discountAmount;
  // 15% VAT component calculated from total or added on top
  const vatAmount = afterDiscount * 0.15;
  const grandTotal = afterDiscount + vatAmount;

  return { subtotal, discountAmount, afterDiscount, vatAmount, grandTotal };
}

function updateChange(){
  const grandTotal = calcTotals().grandTotal;
  const tendered = Number(document.querySelector('#tendered-cash').value) || 0;
  const change = tendered - grandTotal;
  const changeEl = document.querySelector('#cash-change');
  if(changeEl){
    changeEl.textContent = `${Math.max(0, change).toFixed(2)} ر.س`;
  }
}

function renderCatalog(){
  const searchInput = document.querySelector('#search');
  const activeCat = document.querySelector('#categories .active');
  if(!searchInput || !activeCat) return;
  const query=searchInput.value.toLowerCase();
  const category=activeCat.dataset.category;

  const filtered = products.filter(item=>(category==='all'||item.category===category)&&String(item.name).toLowerCase().includes(query));

  document.querySelector('#catalog').innerHTML=filtered.map(item=>`
    <button class="product-card" data-id="${item.id}" type="button">
      <div class="product-card-top">
        <span class="product-card-icon">☕</span>
        <span class="product-card-cat">${item.category||'عام'}</span>
      </div>
      <strong class="product-card-name">${item.name}</strong>
      <div class="product-card-bottom">
        <b class="product-card-price">${Number(item.sale_price||0).toFixed(2)} <small>ر.س</small></b>
      </div>
    </button>
  `).join('')||'<p class="empty">لا توجد منتجات مسجلة بعد.</p>';

  document.querySelectorAll('#catalog .product-card').forEach(button=>button.onclick=()=>{
    const product=products.find(item=>String(item.id)===button.dataset.id);
    const existing=cart.find(item=>item.id===product.id);
    if(existing){
      existing.quantity++;
    } else {
      cart.push({...product,quantity:1});
    }
    renderCart();
  });
}

function renderCart(){
  const cartContainer = document.querySelector('#cart-items');
  if(!cartContainer) return;

  const totals = calcTotals();

  cartContainer.innerHTML=cart.length?cart.map(item=>`
    <div class="cart-line-item">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <small class="muted">${Number(item.sale_price||0).toFixed(2)} ر.س / وحدة</small>
      </div>
      <div class="qty-control">
        <button data-minus="${item.id}" type="button">-</button>
        <span>${item.quantity}</span>
        <button data-plus="${item.id}" type="button">+</button>
      </div>
      <b class="cart-item-total">${(Number(item.sale_price||0) * item.quantity).toFixed(2)} ر.س</b>
    </div>
  `).join(''):'<p class="empty">لم تتم إضافة منتجات بعد في الطلب الحالي</p>';

  document.querySelector('#subtotal').textContent=`${totals.subtotal.toFixed(2)} ر.س`;
  document.querySelector('#discount-amount').textContent=`${totals.discountAmount.toFixed(2)} ر.س`;
  document.querySelector('#vat-amount').textContent=`${totals.vatAmount.toFixed(2)} ر.س`;
  document.querySelector('#pos-grand-total').textContent=`${totals.grandTotal.toFixed(2)} ر.س`;
  document.querySelector('#pos-total').textContent=`${totals.grandTotal.toFixed(2)} ر.س`;

  document.querySelectorAll('[data-minus]').forEach(button=>button.onclick=()=>changeQty(button.dataset.minus,-1));
  document.querySelectorAll('[data-plus]').forEach(button=>button.onclick=()=>changeQty(button.dataset.plus,1));

  updateChange();
}

function holdCurrentOrder(){
  if(!cart.length){
    show('لا يوجد منتجات في السلة لتعليقها');
    return;
  }
  const name = prompt('أدخل اسمًا أو ملحوظة للطلب المعلق (مثال: طاولة 3 أو سفري أحمد):', `طلب ${new Date().toLocaleTimeString('ar-SA')}`);
  if(name === null) return;

  const key = heldOrdersKey();
  const held = JSON.parse(localStorage.getItem(key)||'[]');
  held.push({
    id: Date.now(),
    name: name || 'طلب معلق',
    orderType,
    cart: [...cart],
    discountVal,
    discountType,
    time: new Date().toLocaleTimeString('ar-SA')
  });
  localStorage.setItem(key, JSON.stringify(held));
  cart = [];
  discountVal = 0;
  if(document.querySelector('#pos-discount-val')) document.querySelector('#pos-discount-val').value = 0;
  renderCart();
  renderPos();
  show('تم تعليق الطلب بنجاح');
}

function showHeldOrdersModal(){
  const key = heldOrdersKey();
  const held = JSON.parse(localStorage.getItem(key)||'[]');

  const dialog = document.createElement('div');
  dialog.className = 'modal';
  dialog.innerHTML = `
    <div class="modal-card wide">
      <h2>الطلبات المعلقة (${held.length})</h2>
      <div class="held-orders-list">
        ${held.length ? held.map(item => `
          <div class="held-order-item">
            <div>
              <strong>${item.name}</strong>
              <small class="muted">${item.time} | ${item.cart.length} أصناف</small>
            </div>
            <div class="actions-gap">
              <button class="primary" data-resume="${item.id}">استرجاع</button>
              <button class="btn-text-danger" data-delete-held="${item.id}">حذف</button>
            </div>
          </div>
        `).join('') : '<p class="empty">لا توجد طلبات معلقة حاليًا</p>'}
      </div>
      <button class="primary btn-block" id="close-held-modal" type="button">إغلاق</button>
    </div>
  `;
  document.body.appendChild(dialog);

  dialog.querySelector('#close-held-modal').onclick = () => dialog.remove();

  dialog.querySelectorAll('[data-resume]').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.resume);
      const target = held.find(h => h.id === id);
      if(target){
        cart = [...target.cart];
        orderType = target.orderType || 'dinein';
        discountVal = target.discountVal || 0;
        discountType = target.discountType || 'fixed';
        const remaining = held.filter(h => h.id !== id);
        localStorage.setItem(key, JSON.stringify(remaining));
        dialog.remove();
        renderPos();
        show('تم استرجاع الطلب المعلق');
      }
    };
  });

  dialog.querySelectorAll('[data-delete-held]').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.delete-held);
      const remaining = held.filter(h => h.id !== id);
      localStorage.setItem(key, JSON.stringify(remaining));
      dialog.remove();
      show('تم حذف الطلب المعلق');
      renderPos();
    };
  });
}

function printReceipt(items,total,payment, extraDetails={}){
  const receipt=document.createElement('iframe');
  receipt.style.position='fixed';
  receipt.style.width='1px';
  receipt.style.height='1px';
  receipt.style.opacity='0';
  document.body.appendChild(receipt);
  const documentRef=receipt.contentDocument;

  const vat = extraDetails.vatAmount || (total * 0.15);
  const subtotal = extraDetails.subtotal || total;
  const discount = extraDetails.discountAmount || 0;
  const orderTypeTitle = {dinein:'محلي 🍽', takeaway:'سفري 🥡', delivery:'توصيل 🚗'}[extraDetails.orderType || 'dinein'];

  documentRef.write(`
    <html dir="rtl">
    <head>
      <title>إيصال ضريبي مبسط</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace, Arial, sans-serif; width: 280px; margin: 10px auto; font-size: 12px; color: #000; }
        .center { text-align: center; }
        .logo-title { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
        .subtitle { font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 6px; }
        .line-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px; }
        .table-items { width: 100%; border-top: 1px solid #000; border-bottom: 1px solid #000; margin: 8px 0; padding: 6px 0; }
        .item-row { display: flex; justify-content: space-between; margin: 3px 0; }
        .totals-block { border-top: 1px dashed #000; padding-top: 6px; margin-top: 6px; }
        .grand-total { font-size: 15px; font-weight: bold; }
        .footer { font-size: 10px; margin-top: 12px; border-top: 1px dashed #000; padding-top: 6px; }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="logo-title">${shop.name}</div>
        <div class="subtitle">فاتورة ضريبية مبسطة<br>Simplified Tax Invoice</div>
      </div>
      <div class="line-row"><span>نوع الطلب:</span><span><b>${orderTypeTitle}</b></span></div>
      <div class="line-row"><span>التاريخ والوقت:</span><span>${new Date().toLocaleString('ar-SA')}</span></div>
      <div class="line-row"><span>اسم الكاشير:</span><span>${session.user.name || session.user.email}</span></div>
      
      <div class="table-items">
        <div class="line-row" style="font-weight:bold;">
          <span>الصنف x الكمية</span>
          <span>المبلغ</span>
        </div>
        ${items.map(item => `
          <div class="item-row">
            <span>${item.name} × ${item.quantity}</span>
            <span>${(Number(item.sale_price || item.unit_price || 0) * item.quantity).toFixed(2)} ر.س</span>
          </div>
        `).join('')}
      </div>

      <div class="totals-block">
        <div class="line-row"><span>المجموع الفرعي:</span><span>${subtotal.toFixed(2)} ر.س</span></div>
        ${discount > 0 ? `<div class="line-row"><span>الخصم:</span><span>-${discount.toFixed(2)} ر.س</span></div>` : ''}
        <div class="line-row"><span>ضريبة القيمة المضافة (15%):</span><span>${vat.toFixed(2)} ر.س</span></div>
        <div class="line-row grand-total"><span>الإجمالي الكلي:</span><span>${total.toFixed(2)} ر.س</span></div>
        <div class="line-row"><span>طريقة الدفع:</span><span>${payment}</span></div>
      </div>

      <div class="center footer">
        <p>شكرًا لزيارتكم! نرجو لكم يومًا سعيدًا ☕</p>
      </div>
    </body>
    </html>
  `);
  documentRef.close();
  receipt.onload=()=>{
    receipt.contentWindow.print();
    setTimeout(()=>receipt.remove(),1000);
  };
}

async function checkout(){
  if(!cart.length){
    show('أضف منتجًا إلى الطلب أولًا');
    return;
  }
  if(session.local){
    show('حساب الكاشير المحلي غير متصل بالسحابة. استخدم حساب موظف مرتبط بالبريد.');
    return;
  }

  const totals = calcTotals();
  const payment = document.querySelector('#payment').value;

  try{
    const saleRows = await api('sales',{
      method:'POST',
      headers:{Prefer:'return=representation'},
      body:JSON.stringify({
        shop_id:shop.id,
        cashier_id:session.user.id,
        payment_method:payment,
        subtotal: totals.subtotal,
        discount: totals.discountAmount,
        tax: totals.vatAmount,
        total: totals.grandTotal
      })
    });
    const sale = saleRows?.[0];

    await Promise.all(cart.map(item => api('sale_items', {
      method:'POST',
      body:JSON.stringify({
        sale_id: sale.id,
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: Number(item.sale_price||0)
      })
    })));

    const items = [...cart];
    const finalTotal = totals.grandTotal;

    cart = [];
    discountVal = 0;
    if(document.querySelector('#pos-discount-val')) document.querySelector('#pos-discount-val').value = 0;
    renderCart();

    if(JSON.parse(localStorage.getItem(printerKey)||'{"autoPrint":true}').autoPrint !== false){
      printReceipt(items, finalTotal, payment, {
        vatAmount: totals.vatAmount,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        orderType
      });
    }

    show('تم تسجيل وتوثيق عملية البيع بنجاح 🟢');
    renderPos();
  }catch(error){
    show('تعذر حفظ البيع: '+error.message);
  }
}

function renderProducts(){document.querySelector('#products').innerHTML=`<div class="panel"><div class="toolbar"><div><small class="muted">كتالوج المحل السحابي</small><h2>المنتجات والتكلفة</h2></div><button class="primary" id="add-product">إضافة منتج</button></div><div class="grid-products">${products.length?products.map(item=>{const cost=Number(item.unit_cost||0);const price=Number(item.sale_price||0);const margin=price?((price-cost)/price*100).toFixed(1):'0.0';return `<article class="product"><strong>${item.name}</strong><small class="muted">${item.category||'عام'}</small><span>البيع: ${price.toFixed(2)} ر.س</span><span>التكلفة: ${cost.toFixed(2)} ر.س</span><b>الهامش: ${margin}%</b></article>`}).join(''):'<p class="empty">لا توجد منتجات مسجلة بعد.</p>'}</div></div>`;document.querySelector('#add-product').onclick=async()=>{const name=prompt('اسم المنتج');if(!name)return;const price=Number(prompt('سعر البيع')||0);const cost=Number(prompt('تكلفة المنتج')||0);const category=prompt('التصنيف','عام')||'عام';await api('products',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({shop_id:shop.id,name,sale_price:price,unit_cost:cost,category})});products=await api(`products?shop_id=eq.${shop.id}&select=*`)||[];renderProducts();renderPos();show('تمت إضافة المنتج سحابيًا')}}
function renderInventory(){document.querySelector('#inventory').innerHTML=`<div class="panel"><div class="toolbar"><div><small class="muted">متابعة المخزون السحابي</small><h2>المواد وكميات الطلب</h2></div><button class="primary" id="add-stock">إضافة مادة</button></div><div id="stock-list"></div></div>`;const draw=async()=>{const rows=await api(`inventory_items?shop_id=eq.${shop.id}&select=*`)||[];document.querySelector('#stock-list').innerHTML=rows.length?`<div class="table"><table><thead><tr><th>المادة</th><th>الكمية الحالية</th><th>حد إعادة الطلب</th><th>المطلوب طلبه</th><th>التكلفة</th></tr></thead><tbody>${rows.map(item=>`<tr><td>${item.name}</td><td>${item.quantity} ${item.unit}</td><td>${item.reorder_level} ${item.unit}</td><td class="${item.quantity<=item.reorder_level?'low':''}">${item.quantity<=item.reorder_level?Math.max(item.reorder_level*2-item.quantity,0):0} ${item.unit}</td><td>${Number(item.unit_cost).toFixed(2)} ر.س</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty">لا توجد مواد مسجلة بعد.</p>'};document.querySelector('#add-stock').onclick=async()=>{const name=prompt('اسم المادة');if(!name)return;const unit=prompt('الوحدة مثل كجم أو لتر','كجم')||'وحدة';const quantity=Number(prompt('الكمية الحالية','0'))||0;const reorder=Number(prompt('حد إعادة الطلب','0'))||0;const cost=Number(prompt('تكلفة الوحدة','0'))||0;await api('inventory_items',{method:'POST',body:JSON.stringify({shop_id:shop.id,name,unit,quantity,reorder_level:reorder,unit_cost:cost})});draw()};draw()}
function renderReports(){const today=new Date();const max=today.toISOString().slice(0,10);const min=new Date(today.getFullYear()-1,today.getMonth(),today.getDate()).toISOString().slice(0,10);const monthMax=max.slice(0,7);const monthMin=min.slice(0,7);document.querySelector('#reports').innerHTML=`<div class="panel"><div class="toolbar"><div><small class="muted">تحليل المبيعات السحابي</small><h2>التقارير</h2></div><select id="report-period"><option value="day">تقرير يومي</option><option value="month">تقرير شهري</option></select><input id="report-date" type="date" min="${min}" max="${max}" value="${max}"><button id="report-search" class="primary" type="button" title="بحث">⌕ بحث</button></div><p class="muted">اختر نوع التقرير والتاريخ ثم اضغط بحث.</p><div id="report-result" class="cards"></div></div>`;const periodInput=document.querySelector('#report-period');const dateInput=document.querySelector('#report-date');const syncDateInput=()=>{const monthly=periodInput.value==='month';dateInput.type=monthly?'month':'date';dateInput.min=monthly?monthMin:min;dateInput.max=monthly?monthMax:max;dateInput.value=monthly?max.slice(0,7):max};const draw=async()=>{const period=periodInput.value;const selected=dateInput.value;if(!selected)return;const start=period==='day'?new Date(`${selected}T00:00:00`):new Date(`${selected}-01T00:00:00`);const end=new Date(start);if(period==='day')end.setDate(end.getDate()+1);else end.setMonth(end.getMonth()+1);const rows=await api(`sales?shop_id=eq.${shop.id}&created_at=gte.${encodeURIComponent(start.toISOString())}&created_at=lt.${encodeURIComponent(end.toISOString())}&select=id,total`);const orders=rows?.length||0;const total=(rows||[]).reduce((sum,item)=>sum+Number(item.total||0),0);document.querySelector('#report-result').innerHTML=`<article class="card"><small>${period==='day'?'تاريخ التقرير':'شهر التقرير'}</small><strong>${selected}</strong></article><article class="card"><small>عدد الطلبات</small><strong>${orders}</strong></article><article class="card"><small>إجمالي المبيعات</small><strong>${total.toFixed(2)} ر.س</strong></article>`};periodInput.onchange=()=>{syncDateInput();draw()};document.querySelector('#report-search').onclick=draw;syncDateInput();draw()}
function renderAssistant(){document.querySelector('#assistant').innerHTML='<div class="panel"><small class="muted">مساعد CafeMargin</small><h2>اسأل عن أداء محلك</h2><p class="muted">تحليل مبني على بيانات Supabase الخاصة بمحلّك.</p><form id="assistant-form" class="toolbar"><input id="assistant-question" placeholder="مثال: ما المواد التي أحتاج طلبها؟" required><button class="primary">تحليل</button></form><div id="assistant-answer" class="answer"></div></div>';document.querySelector('#assistant-form').onsubmit=async event=>{event.preventDefault();const question=document.querySelector('#assistant-question').value;const inventory=await api(`inventory_items?shop_id=eq.${shop.id}&select=name,unit,quantity,reorder_level`)||[];const low=inventory.filter(item=>Number(item.quantity)<=Number(item.reorder_level));const answer=question.includes('طلب')||question.includes('مخزون')?(low.length?`تحتاج طلب: ${low.map(item=>`${item.name} (${Math.max(Number(item.reorder_level)*2-Number(item.quantity),0)} ${item.unit})`).join('، ')}.`:'لا توجد مواد تحت حد إعادة الطلب.'):'أستطيع تحليل المخزون وكميات الطلب المسجلة في محلك.';document.querySelector('#assistant-answer').textContent=answer}}
function renderTeam(){document.querySelector('#team').innerHTML='<div class="panel"><h2>إضافة موظف مبيعات</h2><p class="muted">اكتب بريد الموظف وكلمة مرور مؤقتة، وسيصله بريد تفعيل من Supabase.</p><form id="employee-form"><label>اسم الموظف<input id="employee-name" required></label><label>البريد الإلكتروني<input id="employee-email" type="email" required></label><label>كلمة مرور مؤقتة<input id="employee-password" type="password" minlength="6" required></label><button class="primary">إنشاء الحساب وإرسال رسالة التفعيل</button><p id="employee-message" class="error"></p></form><div id="employee-list"></div></div><div class="panel" style="margin-top:20px"><h2>طلبات تسجيل المقاهي الجديدة المعلقة</h2><div id="requests-list"></div></div>';const draw=async()=>{const members=await api(`shop_members?shop_id=eq.${shop.id}&select=user_id,role`)||[];document.querySelector('#employee-list').innerHTML=members.filter(item=>item.role==='sales').map(item=>`<p>موظف مبيعات <small class="muted">${item.user_id}</small></p>`).join('')||'<p class="empty">لا يوجد موظفو مبيعات بعد.</p>';try{const pending=await api('access_requests?status=eq.pending&requested_role=eq.owner&select=*')||[];document.querySelector('#requests-list').innerHTML=pending.length?pending.map(req=>`<div class="cart-line"><div><strong>${req.shop_name||'مقهى جديد'} - ${req.full_name||'مالك'}</strong><br><small class="muted">${req.email}</small></div><button class="primary" data-approve="${req.id}" data-uid="${req.user_id||''}" data-shop="${req.shop_name||'مقهى جديد'}">تفعيل المقهى والحساب</button></div>`).join(''):'<p class="empty">لا توجد طلبات تسجيل مقاهي معلقة.</p>';document.querySelectorAll('[data-approve]').forEach(btn=>btn.onclick=async()=>{const reqId=btn.dataset.approve;const uid=btn.dataset.uid;const sName=btn.dataset.shop;if(!uid){show('تعذر تحديد معرّف المستخدم لهذا الطلب');return}try{const shopRows=await api('shops',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({owner_id:uid,name:sName,currency:'SAR'})});const newShop=shopRows?.[0];if(newShop){await api('shop_members',{method:'POST',body:JSON.stringify({shop_id:newShop.id,user_id:uid,role:'owner'})});await api(`access_requests?id=eq.${reqId}`,{method:'PATCH',body:JSON.stringify({status:'approved'})});show('تم تفعيل حساب المقهى بنجاح!');draw()}}catch(e){show('تعذر التفعيل: '+e.message)}})}catch(e){document.querySelector('#requests-list').innerHTML='<p class="empty">لا توجد طلبات معلقة.</p>'}};document.querySelector('#employee-form').onsubmit=async event=>{event.preventDefault();const message=document.querySelector('#employee-message');const email=document.querySelector('#employee-email').value.trim().toLowerCase();try{const response=await fetch(`${config.url}/auth/v1/signup`,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email,password:document.querySelector('#employee-password').value,data:{full_name:document.querySelector('#employee-name').value.trim()}})});const result=await response.json();if(!response.ok)throw new Error(result.msg||result.error_description||'تعذر إنشاء الحساب');if(!result.user?.id)throw new Error('تم إنشاء الحساب لكن لم يتم إرجاع معرّفه');await api('shop_members',{method:'POST',body:JSON.stringify({shop_id:shop.id,user_id:result.user.id,role:'sales'})});message.textContent='تم إنشاء الحساب وإرسال رسالة التفعيل. اطلب من الموظف فتح بريده وتأكيد الحساب.';event.target.reset();draw()}catch(error){message.textContent=error.message}};draw()}
async function start(){session=JSON.parse(localStorage.getItem('cafemargin-session')||'null');if(session)try{await loadAccount();render()}catch{localStorage.removeItem('cafemargin-session');loginView()}else loginView()}
async function loadAccount(){const members=await api(`shop_members?user_id=eq.${session.user.id}&select=shop_id,role&limit=1`);if(!members?.[0])throw new Error('حسابك قيد المراجعة ولم يتم تفعيله بعد من قِبل الإدارة.');role=members[0].role;const shops=await api(`shops?id=eq.${members[0].shop_id}&select=id,name&limit=1`);shop=shops?.[0];if(!shop)throw new Error('المحل غير موجود');products=await api(`products?shop_id=eq.${shop.id}&select=*`)||[];localStorage.setItem(`${localProductsKey}-${shop.id}`,JSON.stringify(products))}
function render(){shell()}
function resetPasswordView(accessToken){app.innerHTML='<main class="auth"><form class="auth-card" id="reset-form"><div class="logo"><b>cm</b><strong>CafeMargin</strong></div><h1>تعيين كلمة مرور جديدة</h1><p class="muted">أدخل كلمة المرور الجديدة لحسابك.</p><label>كلمة المرور الجديدة<input id="reset-password" type="password" minlength="6" required></label><label>تأكيد كلمة المرور<input id="reset-confirm" type="password" minlength="6" required></label><p id="reset-error" class="error"></p><button class="primary">حفظ كلمة المرور</button></form></main>';document.querySelector('#reset-form').onsubmit=async event=>{event.preventDefault();const password=document.querySelector('#reset-password').value;const confirm=document.querySelector('#reset-confirm').value;const error=document.querySelector('#reset-error');if(password!==confirm){error.textContent='كلمتا المرور غير متطابقتين';return}try{const response=await fetch(`${config.url}/auth/v1/user`,{method:'PUT',headers:{apikey:config.key,Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({password})});if(!response.ok)throw new Error('تعذر تحديث كلمة المرور أو انتهت صلاحية الرابط');history.replaceState({},document.title,location.pathname);show('تم تحديث كلمة المرور بنجاح');loginView()}catch(err){error.textContent=err.message}}}
function recoveryToken(){const params=new URLSearchParams(location.hash.slice(1));return params.get('type')==='recovery'?params.get('access_token'):null}
start();
