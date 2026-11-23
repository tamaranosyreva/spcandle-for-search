// Ждём загрузки DOM перед запуском (скрипт в HEAD выполняется до <body>)
function spcInit() {

  // ============================================================
  // ШАБЛОНЫ ТАБОВ ПО ТИПУ ТОВАРА
  // ============================================================
  var TAB_TEMPLATES = {
    "Свеча": {
      "Как пользоваться": [
        "Обрезайте фитиль до 5-6 мм перед каждым использованием.",
        "Рекомендуем использовать свечу приблизительно 1-3 часа за раз, но не более 4 часов.",
        "Во время горения свечи баночка нагревается и может повредить поверхность, на которой стоит. Учитывайте это при использовании.",
        "Перед тем как потушить свечу, дайте расплавленному восковому достичь края банки. Тем самым вы предотвратите образование лунки.",
        "Сразу после тушения баночка будет горячей. Дайте воску полностью остыть, прежде чем брать её в руки."
      ],
      "Меры предосторожности": "Никогда не оставляйте горящую свечу без присмотра или в пределах досягаемости домашних животных и маленьких детей.",
      "Состав": "100% натуральный соевый воск, ароматические масла, хлопковый фитиль. Не содержит фталатов."
    },
    "Диффузор": {
      "Как пользоваться": [
        "Вставьте 2-3 палочки во флакон. Если вы хотите более интенсивный аромат, добавьте оставшиеся палочки.",
        "Фибровые палочки (в комплекте) впитывают ароматическое масло, а затем постепенно испаряют его в воздух.",
        "50 мл и 100 мл ароматической жидкости поставляется в виде простой аптекарской бутылки. Вы можете перелить жидкость в свою ёмкость."
      ],
      "Меры предосторожности": [
        "Храните вдали от прямых солнечных лучей или других источников тепла. Держите подальше от детей и домашних животных. Если масло разливается, немедленно удалите его, так как масла и смолы могут повредить некоторые поверхности.",
        "Не употребляйте внутрь и не наносите жидкость на кожу."
      ],
      "Состав": "3-метокси-3-метил-1-бутанол, ароматические масла."
    },
    "Автопарфюм": {
      "Как пользоваться": [
        "Открутите деревянную крышку, снимите защиту под ней и плотно закрутите крышку обратно.",
        "Опустите деревянные фиксаторы (они защищают от пролива жидкости). Повесьте диффузор на зеркало.",
        "Переверните флакон на 1 секунду, чтобы пропитать крышку. Новый диффузор нужно перевернуть несколько раз. Далее переворачивайте флакон по необходимости."
      ],
      "Меры предосторожности": "Не употребляйте внутрь или на кожу. Держите подальше от детей и домашних животных. Если масло разлилось, немедленно удалите его, так как масла и смолы могут повредить некоторые поверхности.",
      "Состав": "3-метокси-3-метил-1-бутанол, ароматические масла."
    },
    "Рум-спрей": {
      "Как пользоваться": [
        "Распылите 2–4 нажатия в воздух, направляя спрей в центр помещения. Для более насыщенного аромата повторите распыление через несколько секунд. Интенсивность легко регулировать количеством нажатий.",
        "Не распыляйте средство непосредственно на мебель, ткани, кожу, растения и другие чувствительные поверхности. Перед использованием на текстиле рекомендуется проверить действие на незаметном участке и на расстоянии не ближе 40см."
      ],
      "Меры предосторожности": [
        "Храните рум-спрей вдали от прямых солнечных лучей и источников тепла. Берегите от детей и домашних животных.",
        "Не употребляйте внутрь. Избегайте попадания в глаза и на кожу. При попадании промойте большим количеством воды. Если жидкость случайно попала на поверхность, сразу удалите её мягкой тканью, так как ароматическая композиция может повредить некоторые материалы."
      ],
      "Состав": "Вода дистиллированная, ППГ-26-Бутет-26, гидрогенизированное касторовое масло, феноксиэтанол + этилгексилглицерин, цетримония хлорид, изопентилдиол, ароматические масла."
    },
    "Мыло": {
      "Как пользоваться": [
        "Нанести немного мыла на влажную кожу, вспенить и тщательно смыть водой.",
        "Для наружного применения."
      ],
      "Меры предосторожности": "В случае попадания в глаза немедленно промыть их большим количеством воды, при необходимости обратиться к врачу."
    },
    "Крем": {
      "Как пользоваться": "Нанести на заранее очищенную кожу рук и равномерно распределить.",
      "Меры предосторожности": "Хранить при температуре от 5°C до 25°C."
    }
  };

  // Определение типа товара по названию.
  // Автопарфюм проверяем ДО диффузора: название «Автодиффузор» иначе
  // попадёт в шаблон обычного диффузора.
  function detectProductType(title) {
    var t = (title || "").toLowerCase();
    if (t.indexOf("свеча") !== -1) return "Свеча";
    if (t.indexOf("рум-спрей") !== -1 || t.indexOf("рум спрей") !== -1) return "Рум-спрей";
    if (t.indexOf("автопарфюм") !== -1 || t.indexOf("автодиффузор") !== -1 || t.indexOf("автик") !== -1) return "Автопарфюм";
    if (t.indexOf("диффузор") !== -1) return "Диффузор";
    if (t.indexOf("мыло") !== -1) return "Мыло";
    if (t.indexOf("крем") !== -1) return "Крем";
    return null;
  }

  // Экранирование HTML
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  // ============================================================
  // Вставка табов-аккордеона в открытую карточку
  // ============================================================
  function injectTabsIntoPopup() {
    var productEl = document.querySelector('.js-catalog-product[data-product-uid]');
    if (!productEl) return;
    injectTabs(productEl);
  }

  function injectTabs(productEl) {
    var old = document.querySelector('.spc-tabs');
    if (old) old.remove();

    var titleEl = productEl.querySelector('.js-catalog-prod-name, .t-catalog__prod-popup__name, h1');
    if (!titleEl) return;

    var type = detectProductType(titleEl.innerText);
    if (!type || !TAB_TEMPLATES[type]) return;

    var data = TAB_TEMPLATES[type];

    var anchor = document.querySelector('.js-product-popup-text, .t-catalog__prod-popup__text')
              || document.querySelector('.spc-variants')
              || document.querySelector('.t-catalog__prod-popup__btn-wrapper');
    if (!anchor) return;

    var html = '<div class="spc-tabs">';
    Object.keys(data).forEach(function(tabTitle) {
      var content = data[tabTitle];
      var body = '';
      if (Array.isArray(content)) {
        body = '<ul class="spc-tabs__list">' + content.map(function(line) {
          return '<li>' + escapeHTML(line) + '</li>';
        }).join('') + '</ul>';
      } else {
        body = '<p class="spc-tabs__text">' + escapeHTML(content) + '</p>';
      }
      html += '<div class="spc-tabs__item">'
            + '<button class="spc-tabs__header" type="button">'
            +   '<span>' + escapeHTML(tabTitle) + '</span>'
            +   '<span class="spc-tabs__arrow">+</span>'
            + '</button>'
            + '<div class="spc-tabs__content">' + body + '</div>'
            + '</div>';
    });
    html += '</div>';

    anchor.insertAdjacentHTML('afterend', html);
  }

  // ============================================================
  // Раскрытие / сворачивание таба
  // Клики по .spc-variants__item здесь НЕ обрабатываем —
  // этим занимается скрипт «Вместе дешевле»
  // ============================================================
  document.addEventListener('click', function(e) {
    var tabHeader = e.target.closest('.spc-tabs__header');
    if (!tabHeader) return;
    e.preventDefault();
    tabHeader.closest('.spc-tabs__item').classList.toggle('spc-tabs__item_open');
  });

  // ============================================================
  // Следим за появлением попапа
  // ============================================================
  function tryInject() {
    if (document.querySelector('.t-catalog__prod-popup__btn-wrapper')
        && !document.querySelector('.spc-tabs')) {
      injectTabsIntoPopup();
    }
  }

  tryInject();

  if (document.body) {
    var observer = new MutationObserver(function() { tryInject(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  setInterval(tryInject, 1500);

  // ============================================================
  // ВОЗВРАТ НА ПРЕДЫДУЩУЮ СТРАНИЦУ КАТАЛОГА
  // ============================================================
  (function() {
    var URL_KEY = 'spc_prev_catalog_url';
    var SCROLL_KEY = 'spc_prev_catalog_scroll';
    var PENDING_KEY = 'spc_pending_restore';

    function isCatalogPage() {
      var path = window.location.pathname;
      return path.indexOf('/tproduct/') === -1 && path.indexOf('/catalog') !== -1;
    }

    function isProductPage() {
      return window.location.pathname.indexOf('/tproduct/') !== -1;
    }

    function getSavedUrl() {
      try { return sessionStorage.getItem(URL_KEY); } catch(e) { return null; }
    }

    // Сохраняем URL каталога при заходе
    if (isCatalogPage()) {
      try {
        sessionStorage.setItem(URL_KEY, window.location.pathname + window.location.search);
      } catch(e) {}

      window.addEventListener('scroll', function() {
        try {
          sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
        } catch(e) {}
      }, { passive: true });

      // Восстанавливаем скролл если вернулись с товара
      try {
        var needRestore = sessionStorage.getItem(PENDING_KEY);
        var savedScroll = sessionStorage.getItem(SCROLL_KEY);
        if (needRestore && savedScroll) {
          var tries = 0;
          var restoreScroll = setInterval(function() {
            window.scrollTo(0, parseInt(savedScroll, 10));
            tries++;
            if (tries > 15) clearInterval(restoreScroll);
          }, 150);
          setTimeout(function() {
            try {
              clearInterval(restoreScroll);
              sessionStorage.removeItem(PENDING_KEY);
            } catch(e) {}
          }, 3000);
        }
      } catch(e) {}
    }

    // Подменяем href у крестика на сохранённый URL каталога
    function rewriteCloseLinks() {
      if (!isProductPage()) return;
      var savedUrl = getSavedUrl();
      if (!savedUrl) return;

      var fullSavedUrl = window.location.origin + savedUrl;

      var closeLinks = document.querySelectorAll('a.t-popup__close, a[class*="prod-popup__close"], a.t-store__prod-popup__close');
      closeLinks.forEach(function(a) {
        if (a.getAttribute('data-spc-href') !== fullSavedUrl) {
          a.setAttribute('href', fullSavedUrl);
          a.setAttribute('data-spc-href', fullSavedUrl);
        }
      });

      var backLinks = document.querySelectorAll('a.t-store__prod-popup__link-back, a.js-store-prod-back-btn');
      backLinks.forEach(function(a) {
        if (a.getAttribute('data-spc-href') !== fullSavedUrl) {
          a.setAttribute('href', fullSavedUrl);
          a.setAttribute('data-spc-href', fullSavedUrl);
        }
      });

      var allLinks = document.querySelectorAll('a');
      allLinks.forEach(function(a) {
        var text = (a.innerText || '').toLowerCase();
        if (text.indexOf('more products') !== -1 || text.indexOf('назад к товарам') !== -1 || text.indexOf('все товары') !== -1) {
          if (a.getAttribute('data-spc-href') !== fullSavedUrl) {
            a.setAttribute('href', fullSavedUrl);
            a.setAttribute('data-spc-href', fullSavedUrl);
          }
        }
      });
    }

    document.addEventListener('click', function(e) {
      if (!isProductPage()) return;

      var targetLink = e.target.closest(
        'a.t-popup__close, a.t-store__prod-popup__close, a[class*="prod-popup__close"], ' +
        'a.t-store__prod-popup__link-back, a.js-store-prod-back-btn'
      );
      if (targetLink) {
        try { sessionStorage.setItem(PENDING_KEY, '1'); } catch(e2) {}
        return;
      }

      var link = e.target.closest('a');
      if (!link) return;
      var text = (link.innerText || '').toLowerCase();
      if (text.indexOf('more products') !== -1 || text.indexOf('назад к товарам') !== -1 || text.indexOf('все товары') !== -1) {
        try { sessionStorage.setItem(PENDING_KEY, '1'); } catch(e3) {}
      }
    });

    rewriteCloseLinks();

    if (document.body) {
      var closeObserver = new MutationObserver(function() { rewriteCloseLinks(); });
      closeObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    }

    setInterval(rewriteCloseLinks, 1000);

    window.addEventListener('popstate', function() {
      if (isCatalogPage()) {
        try { sessionStorage.setItem(PENDING_KEY, '1'); } catch(e) {}
      }
    });
  })();

}

// Запускаем когда DOM готов
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', spcInit);
} else {
  spcInit();
}
