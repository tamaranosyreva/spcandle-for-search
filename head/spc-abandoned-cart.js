(function () {
if (window.__spcAbandonedCartMake) return;
window.__spcAbandonedCartMake = true;
var WEBHOOK = 'https://hook.us2.make.com/09f7y5techiscsh21sj12ymydxlmdar2'; // сценарий «Корзины: приём»
var CART_KEY = 'spc_abandoned_cart_id_v3';
var UTM_KEY = 'spc_utm_v2';
var SIG_KEY = 'spc_abandoned_cart_sig_v3';
var CONTACTS_KEY = 'spc_abandoned_cart_contacts_v1';
var PHONE_SELECTORS = ['input.js-phonemask-result', 'input[name="phone"][type="hidden"]', 'input[type="tel"]', 'input[name="Phone"]', 'input[name="phone"]'];
var EMAIL_SELECTORS = ['input[type="email"]', 'input[name="Email"]', 'input[name="email"]'];
var NAME_SELECTORS = ['input[name="Name"]', 'input[name="name"]', 'input[data-tilda-rule="name"]'];
var timer = null;
var pendingSignature = null;
var sawNonEmptyCart = false;
var fallbackCartId = null;
function text(value, max) {
return String(value == null ? '' : value).trim().slice(0, max || 1000);
}
function number(value) {
var result = parseFloat(String(value == null ? '' : value).replace(/\s/g, '').replace(',', '.').replace(/[^0-9.\-]/g, ''));
return isFinite(result) ? result : 0;
}
function rememberUtm() {
try {
var params = new URLSearchParams(window.location.search);
var data = {};
['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
var value = params.get(key);
if (value) data[key] = text(value, 250);
});
if (Object.keys(data).length) {
data.saved_at = Date.now();
localStorage.setItem(UTM_KEY, JSON.stringify(data));
}
} catch (e) {}
}
function getUtm() {
try {
var data = JSON.parse(localStorage.getItem(UTM_KEY) || '{}');
if (data.saved_at && Date.now() - data.saved_at > 90 * 24 * 60 * 60 * 1000) return {};
return data;
} catch (e) {
return {};
}
}
function getCartId() {
try {
var current = localStorage.getItem(CART_KEY);
if (current) return current;
var created = window.crypto && crypto.randomUUID
? crypto.randomUUID()
: 'spc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
localStorage.setItem(CART_KEY, created);
return created;
} catch (e) {
if (!fallbackCartId) fallbackCartId = 'spc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
return fallbackCartId;
}
}
function recallContacts(cartId) {
try {
var saved = JSON.parse(localStorage.getItem(CONTACTS_KEY) || '{}');
return saved.cart_id === cartId ? saved : {};
} catch (e) {
return {};
}
}
function contacts(root, cartId) {
var saved = recallContacts(cartId);
var typedPhone = field(root, PHONE_SELECTORS).replace(/\D/g, '');
var out = {
email: field(root, EMAIL_SELECTORS) || saved.email || '',
phone: typedPhone.length >= 10 ? typedPhone : (saved.phone || ''),
name: field(root, NAME_SELECTORS) || saved.name || ''
};
try {
localStorage.setItem(CONTACTS_KEY, JSON.stringify({
cart_id: cartId, email: out.email, phone: out.phone, name: out.name
}));
} catch (e) {}
return out;
}
function cartRoot() {
return document.querySelector('.t706__cartwin, .t706__cartpage') || document.querySelector('[data-tooltip-hook="#tcart"]') || document;
}
function field(root, selectors) {
for (var i = 0; i < selectors.length; i++) {
var el = root.querySelector(selectors[i]);
if (el && el.value) return text(el.value, 254);
}
return '';
}
function hasConsent(root) {
var boxes = Array.prototype.slice.call(root.querySelectorAll('input[type="checkbox"]'));
return boxes.some(function (box) {
if (!box.checked) return false;
var meta = [
box.name, box.id, box.className,
box.getAttribute('data-tilda-req'),
box.getAttribute('data-rule')
].join(' ').toLowerCase();
var group = box.closest('.t-input-group_cb, .t-checkbox, label');
var label = group ? text(group.textContent, 500).toLowerCase() : '';
return box.required || box.getAttribute('data-tilda-req') === '1' ||
/consent|agreement|privacy|personal|соглас|персональ|политик/.test(meta + ' ' + label);
});
}
function products() {
var source = window.tcart && Array.isArray(window.tcart.products) ? window.tcart.products : [];
return source.slice(0, 50).map(function (item) {
return {
name: text(item.name || item.title, 300),
quantity: Math.max(1, number(item.quantity || item.qty) || 1),
price: Math.max(0, number(item.price)),
uid: text(item.uid || item.id || item.productid, 120),
sku: text(item.sku || item.article || item.articul, 120)
};
});
}
function total(items) {
var known = window.tcart && (window.tcart.amount || window.tcart.total || window.tcart.sum);
var parsed = number(known);
if (parsed > 0) return parsed;
return items.reduce(function (sum, item) {
return sum + item.price * item.quantity;
}, 0);
}
function send(payload) {
var params = new URLSearchParams();
Object.keys(payload).forEach(function (key) {
var value = payload[key];
if (value == null) return;
params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
});
params.append('sent_at', new Date().toISOString());
try {
return fetch(WEBHOOK, {
method: 'POST',
mode: 'no-cors',
keepalive: true,
headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
body: params.toString()
});
} catch (e) {
return Promise.reject(e);
}
}
function resetCart() {
try { localStorage.removeItem(CART_KEY); localStorage.removeItem(CONTACTS_KEY); sessionStorage.removeItem(SIG_KEY); } catch (e) {}
fallbackCartId = null;
pendingSignature = null;
sawNonEmptyCart = false;
}
function capture() {
var items = products();
if (items.length) sawNonEmptyCart = true;
if (!items.length) {
if (window.tcart_success === 'yes' || window.clearTCart) {
resetCart();
return;
}
if (sawNonEmptyCart) {
var clearedId = fallbackCartId;
try { clearedId = localStorage.getItem(CART_KEY) || clearedId; } catch (e) {}
if (clearedId) send({ event: 'cart_cleared', cart_id: clearedId }).catch(function () {});
resetCart();
}
return;
}
var root = cartRoot();
var typedEmail = field(root, EMAIL_SELECTORS);
var typedPhone = field(root, PHONE_SELECTORS).replace(/\D/g, '');
if (!typedEmail && typedPhone.length < 10) return;
if (!hasConsent(root)) return;
var cartId = getCartId();
var who = contacts(root, cartId);
var utm = getUtm();
var payload = {
event: 'capture',
cart_id: cartId,
email: who.email,
phone: who.phone,
name: who.name,
products: items,
cart_text: items.map(function (item) {
return item.name + ' × ' + item.quantity + ' — ' + item.price + ' RUB';
}).join('; '),
total: total(items),
currency: 'RUB',
source: 'Tilda cart',
page_url: window.location.href,
utm_source: utm.utm_source || '',
utm_medium: utm.utm_medium || '',
utm_campaign: utm.utm_campaign || '',
utm_content: utm.utm_content || '',
utm_term: utm.utm_term || '',
consent: true
};
var signature = JSON.stringify([
payload.cart_id, payload.email, payload.phone, payload.name,
payload.total, payload.cart_text, payload.page_url
]);
try {
if (sessionStorage.getItem(SIG_KEY) === signature) return;
} catch (e) {}
if (pendingSignature === signature) return;
pendingSignature = signature;
send(payload).then(function () {
try { sessionStorage.setItem(SIG_KEY, signature); } catch (e) {}
pendingSignature = null;
}).catch(function () { pendingSignature = null; });
}
function queueCapture() {
clearTimeout(timer);
timer = setTimeout(capture, 1200);
}
function flushCapture() { clearTimeout(timer); capture(); }
document.addEventListener('submit', function (event) {
if (event.target && event.target.closest && event.target.closest('.t706__cartwin, .t706__cartpage')) flushCapture();
}, true);
document.addEventListener('click', function (event) {
var target = event.target;
if (target && target.closest && target.closest('.t706__cartwin, .t706__cartpage') && target.closest('button[type="submit"], input[type="submit"], .t-submit')) flushCapture();
}, true);
window.addEventListener('pagehide', flushCapture);
rememberUtm();
document.addEventListener('tildacart_open', queueCapture);
document.addEventListener('tildacart_updated', queueCapture);
document.addEventListener('input', function (event) {
if (event.target && event.target.closest && event.target.closest('.t706__cartwin, .t706__cartpage')) queueCapture();
}, true);
document.addEventListener('change', function (event) {
if (event.target && event.target.closest && event.target.closest('.t706__cartwin, .t706__cartpage')) queueCapture();
}, true);
document.addEventListener('tildaform:aftersuccess', function (event) {
var form = event.target;
if (!form || !form.closest) return;
var isCart = form.getAttribute('data-formcart') === 'y' || form.closest('.t706');
if (!isCart) return;
var cartId = null;
try { cartId = localStorage.getItem(CART_KEY); } catch (e) {}
cartId = cartId || fallbackCartId;
if (!cartId) return;
var root = cartRoot();
var items = products();
var who = contacts(root, cartId);
send({
event: 'completed',
cart_id: cartId,
order_number: text(form.tildaOrderId || (window.tcart && window.tcart.orderid), 120),
tran_id: text(form.tildaTranId, 120),
email: who.email,
phone: who.phone,
name: who.name,
products: items,
cart_text: items.map(function (item) {
return item.name + ' × ' + item.quantity + ' — ' + item.price + ' RUB';
}).join('; '),
total: total(items),
currency: 'RUB'
}).catch(function () {});
resetCart();
}, true);
setInterval(queueCapture, 10000);
})();
