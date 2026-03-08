/**
 * 心伴 · AI 陪伴与品质生活 - 前端逻辑
 * 商品数据、年龄门、AI 对话模拟、购物车
 */

(function () {
  'use strict';

  const PRODUCTS = {
    figures: [
      { id: 'f1', name: '治愈系 Q 版手办', desc: '桌面陪伴，表情治愈', price: 129, emoji: '🧸' },
      { id: 'f2', name: '二次元角色景品', desc: '正版授权，细节精致', price: 199, emoji: '🎭' },
      { id: 'f3', name: '盲盒手办单只', desc: '惊喜款，收藏向', price: 69, emoji: '📦' },
      { id: 'f4', name: '动漫周边立牌', desc: '亚克力立牌，多款可选', price: 45, emoji: '🖼️' },
      { id: 'f5', name: '粘土人偶', desc: '可动 Q 版，表情丰富', price: 289, emoji: '🎎' },
      { id: 'f6', name: '机甲模型入门款', desc: '拼装模型，入门友好', price: 158, emoji: '🤖' },
    ],
    niche: [
      { id: 'n1', name: '香薰蜡烛礼盒', desc: '天然大豆蜡，多味可选', price: 89, emoji: '🕯️' },
      { id: 'n2', name: '手账本套装', desc: '治愈系插画，内页丰富', price: 68, emoji: '📔' },
      { id: 'n3', name: '小众设计师首饰', desc: '银饰/树脂，独款设计', price: 168, emoji: '📿' },
      { id: 'n4', name: '解压玩具礼包', desc: '捏捏乐、指尖陀螺等', price: 39, emoji: '🎈' },
      { id: 'n5', name: '晚安助眠喷雾', desc: '植物精油，助眠舒缓', price: 59, emoji: '🌙' },
      { id: 'n6', name: '文创胶带套装', desc: '和纸胶带，手账必备', price: 45, emoji: '🎀' },
    ],
    adult: [
      { id: 'a1', name: '情趣用品 · 入门款', desc: '私密配送，品质安全', price: 128, emoji: '📦' },
      { id: 'a2', name: '情侣升温小物', desc: '增加亲密感，多款可选', price: 88, emoji: '💕' },
      { id: 'a3', name: '身体护理精油', desc: '按摩放松，温和配方', price: 98, emoji: '🧴' },
      { id: 'a4', name: '成人用品礼盒', desc: '隐私包装，安心购买', price: 199, emoji: '🎁' },
    ],
  };

  const AI_REPLIES = [
    { keywords: ['手办', '周边', '模型', '收藏'], reply: '手办周边区有很多治愈系和二次元款，你可以去「手办周边」看看，有 Q 版、景品、盲盒和立牌，价格从几十到几百都有～' },
    { keywords: ['小众', '香薰', '手账', '文创', '治愈'], reply: '小众好物区有香薰、手账、文创胶带、解压玩具和助眠喷雾，都很适合日常治愈，可以去「小众好物」逛逛～' },
    { keywords: ['成人', '情趣', '私密', '情侣'], reply: '成人专区需要先确认年满 18 岁才能进入哦。里面有品质情趣用品、情侣小物和身体护理，都是私密配送的。确认年龄后就能看到啦～' },
    { keywords: ['买', '推荐', '种草', '想买'], reply: '我们有三类好物：手办周边、小众好物、成人用品。你可以说说更想买哪种，我帮你推荐～' },
    { keywords: ['心情', '聊', '陪'], reply: '我一直在呀～想聊什么都可以。如果想顺便看看好物，也可以说「想买手办」「想买小众好物」或「成人用品」，我帮你指路～' },
    { default: true, reply: '你可以跟我说「想买手办」「想买小众好物」或「成人用品」，我帮你推荐；或者随便聊聊也行～' },
  ];

  const FREE_DAILY_MESSAGES = 5;
  const INTIMACY_LEVELS = [0, 10, 30, 60, 100, 200, 400, 700, 1000, 9999];
  const STORAGE_KEYS = {
    userName: 'xb_userName',
    totalMessages: 'xb_totalMessages',
    messagesUsedToday: 'xb_messagesUsedToday',
    dateForMessages: 'xb_dateForMessages',
    lastChatDate: 'xb_lastChatDate',
    chatStreak: 'xb_chatStreak',
    lastCheckInDate: 'xb_lastCheckInDate',
    checkInStreak: 'xb_checkInStreak',
  };

  let cart = [];
  let adultUnlocked = false;

  function getStorage(key, def) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? def : JSON.parse(v);
    } catch (_) {
      return def;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function todayStr() {
    return new Date().toDateString();
  }

  function getMessagesLeft() {
    const dateStr = todayStr();
    const savedDate = getStorage(STORAGE_KEYS.dateForMessages, '');
    let used = getStorage(STORAGE_KEYS.messagesUsedToday, 0);
    if (savedDate !== dateStr) {
      used = 0;
      setStorage(STORAGE_KEYS.dateForMessages, dateStr);
      setStorage(STORAGE_KEYS.messagesUsedToday, 0);
    }
    return Math.max(0, FREE_DAILY_MESSAGES - used);
  }

  function useOneMessage() {
    const dateStr = todayStr();
    const savedDate = getStorage(STORAGE_KEYS.dateForMessages, '');
    let used = getStorage(STORAGE_KEYS.messagesUsedToday, 0);
    if (savedDate !== dateStr) {
      used = 0;
      setStorage(STORAGE_KEYS.dateForMessages, dateStr);
    }
    used += 1;
    setStorage(STORAGE_KEYS.messagesUsedToday, used);
  }

  function getIntimacyLevel() {
    const total = getStorage(STORAGE_KEYS.totalMessages, 0);
    for (let i = 0; i < INTIMACY_LEVELS.length; i++) {
      if (total < INTIMACY_LEVELS[i]) return i + 1;
    }
    return INTIMACY_LEVELS.length;
  }

  function getMessagesToNextLevel() {
    const total = getStorage(STORAGE_KEYS.totalMessages, 0);
    for (let i = 0; i < INTIMACY_LEVELS.length; i++) {
      if (total < INTIMACY_LEVELS[i]) return INTIMACY_LEVELS[i] - total;
    }
    return 0;
  }

  function updateChatStreak() {
    const today = todayStr();
    const last = getStorage(STORAGE_KEYS.lastChatDate, '');
    let streak = getStorage(STORAGE_KEYS.chatStreak, 0);
    if (last === today) return streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (last === yesterday.toDateString()) streak += 1;
    else streak = 1;
    setStorage(STORAGE_KEYS.lastChatDate, today);
    setStorage(STORAGE_KEYS.chatStreak, streak);
    return streak;
  }

  function doDailyCheckin() {
    const today = todayStr();
    const last = getStorage(STORAGE_KEYS.lastCheckInDate, '');
    if (last === today) return { signed: true, streak: getStorage(STORAGE_KEYS.checkInStreak, 0) };
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let streak = getStorage(STORAGE_KEYS.checkInStreak, 0);
    if (last === yesterday.toDateString()) streak += 1;
    else streak = 1;
    setStorage(STORAGE_KEYS.lastCheckInDate, today);
    setStorage(STORAGE_KEYS.checkInStreak, streak);
    return { signed: false, streak };
  }

  function isCheckinDoneToday() {
    return getStorage(STORAGE_KEYS.lastCheckInDate, '') === todayStr();
  }

  function updateCompanionUI() {
    const left = getMessagesLeft();
    const level = getIntimacyLevel();
    const toNext = getMessagesToNextLevel();
    const streak = getStorage(STORAGE_KEYS.chatStreak, 0);

    const intimacyEl = $('#intimacyBadge');
    if (intimacyEl) {
      intimacyEl.textContent = toNext > 0 ? '亲密度 Lv.' + level + ' · 再聊 ' + toNext + ' 句升级' : '亲密度 Lv.' + level + ' ✨';
    }
    const streakEl = $('#streakBadge');
    if (streakEl) streakEl.textContent = '连续 ' + streak + ' 天';

    const leftEl = $('#messagesLeft');
    if (leftEl) leftEl.textContent = left;
    const limitEl = $('#dailyLimit');
    if (limitEl) {
      if (left <= 0) {
        limitEl.innerHTML = '今日免费次数已用完，<strong>明天 0:00 恢复</strong> 或开通会员无限聊';
        limitEl.classList.add('upgrade');
      } else {
        limitEl.innerHTML = '今日还可聊 <strong id="messagesLeft">' + left + '</strong> 句';
        limitEl.classList.remove('upgrade');
      }
    }

    const checkinBtn = $('#dailyCheckin');
    const checkinText = $('#checkinText');
    if (checkinBtn && checkinText) {
      if (isCheckinDoneToday()) {
        checkinBtn.classList.add('signed');
        checkinBtn.disabled = true;
        var s = getStorage(STORAGE_KEYS.checkInStreak, 0);
        checkinText.textContent = s > 1 ? '已签到 · 连续 ' + s + ' 天' : '已签到';
      } else {
        checkinBtn.classList.remove('signed');
        checkinBtn.disabled = false;
        checkinText.textContent = '今日签到';
      }
    }

    const hintEl = $('#chatFooterHint');
    if (hintEl) {
      if (left <= 0) {
        hintEl.textContent = '开通会员可无限畅聊，解锁更多专属称呼与剧情～';
        hintEl.classList.add('upgrade');
      } else {
        hintEl.textContent = '每日免费 5 句，签到可领心意值兑换更多次数';
        hintEl.classList.remove('upgrade');
      }
    }

    const chatInput = $('#chatInput');
    const sendBtn = $('#sendChat');
    if (chatInput && sendBtn) {
      if (left <= 0) {
        chatInput.disabled = true;
        chatInput.placeholder = '今日次数已用完，明天再来或开通会员';
        sendBtn.disabled = true;
      } else {
        chatInput.disabled = false;
        chatInput.placeholder = '输入想说的或想买的...';
        sendBtn.disabled = false;
      }
    }
  }

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function renderProductCard(product, category) {
    return `
      <article class="product-card" data-id="${product.id}" data-category="${category}">
        <div class="product-image">${product.emoji}</div>
        <div class="product-info">
          <h3 class="product-name">${escapeHtml(product.name)}</h3>
          <p class="product-desc">${escapeHtml(product.desc)}</p>
          <div class="product-footer">
            <span class="product-price">¥${product.price}</span>
            <button type="button" class="btn-add-cart" data-id="${product.id}" data-name="${escapeHtml(product.name)}" data-price="${product.price}" data-emoji="${product.emoji}">加入购物车</button>
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderProductGrid(containerId, list) {
    const el = $(containerId);
    if (!el) return;
    const category = containerId.replace('Grid', '').replace(/([A-Z])/g, '_$1').toLowerCase().replace('_', '');
    const key = containerId === 'figuresGrid' ? 'figures' : containerId === 'nicheGrid' ? 'niche' : 'adult';
    el.innerHTML = list.map((p) => renderProductCard(p, key)).join('');

    el.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-add-cart');
      if (!btn) return;
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      const emoji = btn.dataset.emoji || '📦';
      addToCart({ id, name, price, emoji });
    });
  }

  function addToCart(item) {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
  }

  function removeFromCart(id) {
    cart = cart.filter((c) => c.id !== id);
    updateCartUI();
  }

  function updateCartUI() {
    const count = cart.reduce((s, c) => s + c.qty, 0);
    const countEl = $('#cartCount');
    if (countEl) {
      countEl.textContent = count;
      countEl.dataset.count = count;
    }

    const container = $('#cartItems');
    const emptyEl = $('#cartEmpty');
    const totalEl = $('#cartTotal');

    if (!container) return;

    if (cart.length === 0) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      container.querySelectorAll('.cart-item').forEach((n) => n.remove());
      if (totalEl) totalEl.textContent = '¥0';
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    const existingItems = container.querySelectorAll('.cart-item');
    existingItems.forEach((n) => n.remove());

    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    if (totalEl) totalEl.textContent = '¥' + total;

    cart.forEach((c) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-image">${c.emoji}</div>
        <div class="cart-item-info">
          <p class="cart-item-name">${escapeHtml(c.name)} × ${c.qty}</p>
          <p class="cart-item-price">¥${c.price * c.qty}</p>
          <button type="button" class="cart-item-remove" data-id="${c.id}">删除</button>
        </div>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll('.cart-item-remove').forEach((btn) => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
  }

  function openCart() {
    $('#cartDrawer').classList.add('open');
    $('#cartOverlay').classList.remove('hidden');
    $('#cartOverlay').classList.add('open');
  }

  function closeCart() {
    $('#cartDrawer').classList.remove('open');
    $('#cartOverlay').classList.remove('open');
    $('#cartOverlay').classList.add('hidden');
  }

  function openChat() {
    $('#chatPanel').classList.remove('hidden');
    const name = getStorage(STORAGE_KEYS.userName, '');
    const welcome = $('#welcomeMessage');
    if (welcome) {
      welcome.innerHTML = name
        ? (name + '，又来啦～想聊什么或想买什么都可以跟我说～')
        : '你好呀～我是心伴。想聊聊天、解解压，或者让我帮你挑好物都可以～<br><small>怎么称呼你？在下面输入昵称我会记住哦。</small>';
    }
    updateCompanionUI();
    $('#chatInput').focus();
  }

  function closeChat() {
    $('#chatPanel').classList.add('hidden');
  }

  function getAIReply(userText, userName) {
    const lower = (userText || '').toLowerCase().trim();
    const prefix = userName ? userName + '～' : '';
    for (const rule of AI_REPLIES) {
      if (rule.default) continue;
      const found = rule.keywords.some((k) => lower.includes(k));
      if (found) return prefix + rule.reply;
    }
    const def = (AI_REPLIES.find((r) => r.default) || {}).reply || '可以说「想买手办」「小众好物」或「成人用品」让我帮你推荐～';
    return prefix + def;
  }

  function appendChatMessage(role, text) {
    const wrap = $('#chatMessages');
    if (!wrap) return;
    const isAI = role === 'ai';
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + role;
    msg.innerHTML = isAI
      ? `<span class="avatar">✨</span><p>${escapeHtml(text)}</p>`
      : `<p>${escapeHtml(text)}</p><span class="avatar">你</span>`;
    wrap.appendChild(msg);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function sendChatMessage() {
    const input = $('#chatInput');
    const text = (input && input.value || '').trim();
    if (!text) return;

    const userName = getStorage(STORAGE_KEYS.userName, '');
    const left = getMessagesLeft();

    if (left <= 0) {
      updateCompanionUI();
      return;
    }

    if (!userName && text.length <= 6 && !/想买|推荐|手办|小众|成人|情趣|香薰|心情|聊|陪|买|种草/.test(text)) {
      setStorage(STORAGE_KEYS.userName, text);
      input.value = '';
      appendChatMessage('user', text);
      setTimeout(() => {
        appendChatMessage('ai', '好的，以后我就叫你 ' + text + '～想聊什么或想买什么都可以跟我说～');
        updateCompanionUI();
      }, 400);
      return;
    }

    input.value = '';
    useOneMessage();
    const total = getStorage(STORAGE_KEYS.totalMessages, 0);
    setStorage(STORAGE_KEYS.totalMessages, total + 1);
    updateChatStreak();

    appendChatMessage('user', text);
    const reply = getAIReply(text, getStorage(STORAGE_KEYS.userName, ''));
    setTimeout(() => {
      appendChatMessage('ai', reply);
      updateCompanionUI();
    }, 400);
  }

  function initAgeGate() {
    const checkbox = $('#ageConfirm');
    const enterBtn = $('#enterAdult');
    const gate = $('#adultGate');
    const content = $('#adultContent');

    if (!checkbox || !enterBtn || !gate || !content) return;

    function toggleEnter() {
      enterBtn.disabled = !checkbox.checked;
    }
    checkbox.addEventListener('change', toggleEnter);

    enterBtn.addEventListener('click', () => {
      if (!checkbox.checked) return;
      adultUnlocked = true;
      gate.classList.add('hidden');
      content.classList.remove('hidden');
      renderProductGrid('adultGrid', PRODUCTS.adult);
    });
  }

  function initChat() {
    $('#openChat')?.addEventListener('click', openChat);
    $('#closeChat')?.addEventListener('click', closeChat);
    $('#sendChat')?.addEventListener('click', sendChatMessage);
    $('#chatInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
    $('#dailyCheckin')?.addEventListener('click', () => {
      if (isCheckinDoneToday()) return;
      const result = doDailyCheckin();
      updateCompanionUI();
      alert('签到成功！' + (result.streak > 1 ? '连续签到 ' + result.streak + ' 天～' : '') + ' 心意值 +10（演示）');
    });
  }

  function initCart() {
    $('#openCart')?.addEventListener('click', openCart);
    $('#closeCart')?.addEventListener('click', closeCart);
    $('#cartOverlay')?.addEventListener('click', closeCart);
    $('#checkout')?.addEventListener('click', () => {
      if (cart.length === 0) return;
      alert('当前为演示站，结算功能需对接支付与订单系统。购物车合计：¥' + cart.reduce((s, c) => s + c.price * c.qty, 0));
    });
  }

  function initCompanionCta() {
    $('#startCompanion')?.addEventListener('click', () => {
      openChat();
      const section = $('#companion');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function init() {
    renderProductGrid('figuresGrid', PRODUCTS.figures);
    renderProductGrid('nicheGrid', PRODUCTS.niche);
    initAgeGate();
    initChat();
    initCart();
    initCompanionCta();
    updateCartUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
