/* FrogWeb · All Kinds of Frogs — interactions */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    };
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  /* ---------- Active nav link for the current page ---------- */
  var page = document.body.getAttribute('data-page');
  if (page) {
    var activeLink = document.querySelector('.site-nav a[data-nav="' + page + '"]');
    if (activeLink) activeLink.classList.add('active');
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealEls, function (el) {
      el.classList.add('visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -48px 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealEls, function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('.stat-num');

  var animateCounter = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1400;
    var start = performance.now();
    var step = function (now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(counters, function (c) {
      counterObserver.observe(c);
    });
  } else {
    Array.prototype.forEach.call(counters, animateCounter);
  }

  /* ---------- Lightbox ---------- */
  var sources = Array.prototype.slice.call(document.querySelectorAll('.lightbox-source'));

  var items = sources.map(function (btn) {
    var img = btn.querySelector('img');
    return {
      src: btn.getAttribute('data-src') || (img && img.src) || '',
      title: btn.getAttribute('data-title') || '',
      credit: btn.getAttribute('data-credit') || '',
      creditUrl: btn.getAttribute('data-credit-url') || '',
      alt: (img && img.getAttribute('alt')) || btn.getAttribute('aria-label') || ''
    };
  });

  var overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Photograph viewer');
  overlay.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    '</button>' +
    '<button class="lb-prev" type="button" aria-label="Previous photograph">' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>' +
    '</button>' +
    '<figure class="lb-figure">' +
    '<img class="lb-img" alt="">' +
    '<figcaption class="lb-caption">' +
    '<p class="lb-title"></p>' +
    '<p class="lb-credit"></p>' +
    '<p class="lb-counter"></p>' +
    '</figcaption>' +
    '</figure>' +
    '<button class="lb-next" type="button" aria-label="Next photograph">' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>' +
    '</button>';
  document.body.appendChild(overlay);

  var lbImg = overlay.querySelector('.lb-img');
  var lbTitle = overlay.querySelector('.lb-title');
  var lbCredit = overlay.querySelector('.lb-credit');
  var lbCounter = overlay.querySelector('.lb-counter');
  var lbClose = overlay.querySelector('.lb-close');
  var lbPrev = overlay.querySelector('.lb-prev');
  var lbNext = overlay.querySelector('.lb-next');

  var index = -1;
  var lastFocused = null;

  function render(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    var item = items[index];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbTitle.textContent = item.title;
    if (item.credit) {
      if (item.creditUrl) {
        lbCredit.innerHTML = '';
        var link = document.createElement('a');
        link.href = item.creditUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = item.credit;
        lbCredit.appendChild(link);
      } else {
        lbCredit.textContent = item.credit;
      }
    } else {
      lbCredit.textContent = '';
    }
    lbCounter.textContent = (index + 1) + ' / ' + items.length;
    lbPrev.style.display = items.length > 1 ? '' : 'none';
    lbNext.style.display = items.length > 1 ? '' : 'none';
  }

  function open(i) {
    lastFocused = document.activeElement;
    overlay.classList.add('open');
    document.body.classList.add('lb-lock');
    render(i);
    lbClose.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.classList.remove('lb-lock');
    lbImg.src = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  sources.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      open(i);
    });
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', function () { render(index - 1); });
  lbNext.addEventListener('click', function () { render(index + 1); });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') render(index - 1);
    if (e.key === 'ArrowRight') render(index + 1);
  });
})();

/* ---------- Find the frog station ---------- */
(function () {
  'use strict';

  var stage = document.getElementById('find-stage');
  if (!stage) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var img = document.getElementById('find-img');
  var marker = document.getElementById('find-marker');
  var ring = document.getElementById('find-ring');
  var label = document.getElementById('find-round-label');
  var scoreEl = document.getElementById('find-score');
  var giveUpBtn = document.getElementById('find-giveup');
  var feedback = document.getElementById('find-feedback');
  var verdictEl = document.getElementById('find-verdict');
  var revealEl = document.getElementById('find-reveal');
  var nextBtn = document.getElementById('find-next');
  var results = document.getElementById('find-results');

  /* The whole game in one table. x / y are the frog's position as
     fractions of the photograph — every one was verified by marking
     the image before it went on the site. */
  var ROUNDS = [
    {
      img: 'images/find-spring-peeper-grass.jpg',
      species: 'Spring peeper',
      note: 'crouched at the base of a grass stem, its dark X-marking reading as dappled shade.',
      x: 0.57, y: 0.56
    },
    {
      img: 'images/find-european-treefrog-grass.jpg',
      species: 'European tree frog',
      note: 'sitting level between grass blades — smooth, green and leaf-like, peeking out of the gap.',
      x: 0.50, y: 0.51
    },
    {
      img: 'images/find-wood-frog-log.jpg',
      species: 'Wood frog',
      note: 'pressed flat against a fallen log, its bark-brown back matching the wood and moss around it.',
      x: 0.47, y: 0.53
    },
    {
      img: 'images/find-common-toad-needles.jpg',
      species: 'Common toad',
      note: 'parked on a pine-needle carpet, its warty skin reading as one more patch of rough bark.',
      x: 0.44, y: 0.55
    },
    {
      img: 'images/find-mossy-frog-rock.jpg',
      species: 'Vietnamese mossy frog',
      note: 'draped over a moss-covered rock by a forest stream — the species is named for exactly this trick.',
      x: 0.48, y: 0.58
    },
    {
      img: 'images/find-horned-frog-leaves.jpg',
      species: 'Amazon horned frog',
      art: 'an',
      note: 'a leaf-litter ambusher; only the eye and the two little horns above it give the game away.',
      x: 0.35, y: 0.57
    }
  ];

  /* Distance tiers — measured as a fraction of the photograph's width. */
  var TIERS = [
    { max: 0.06, points: 100, label: 'Bullseye!' },
    { max: 0.12, points: 80, label: 'Excellent eyes.' },
    { max: 0.18, points: 60, label: 'Close — practically on it.' },
    { max: 0.26, points: 40, label: 'Warm. Right neighbourhood.' },
    { max: 0.36, points: 15, label: 'Cold — but the right corner of the photo.' },
    { max: Infinity, points: 0, label: 'Not this time.' }
  ];

  var round = 0;
  var score = 0;
  var answered = false;
  var tally = [];

  function imgSrc(ref) {
    /* In the all-in-one edition every photograph is embedded in AIO_IMG;
       on the multi-page site the relative file is used instead. */
    var map = window.AIO_IMG;
    var name = ref.slice(7);
    if (map && map[name]) return map[name];
    return ref;
  }

  function tierFor(dist) {
    for (var i = 0; i < TIERS.length; i++) {
      if (dist <= TIERS[i].max) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  function place(el, x, y) {
    el.style.left = (x * 100) + '%';
    el.style.top = (y * 100) + '%';
  }

  function showRound(i) {
    round = i;
    answered = false;
    var r = ROUNDS[i];
    img.src = imgSrc(r.img);
    img.alt = 'A wild frog is hiding somewhere in this photograph — click on the frog';
    marker.hidden = true;
    ring.hidden = true;
    ring.classList.remove('pop');
    feedback.hidden = true;
    label.textContent = 'Round ' + (i + 1) + ' of ' + ROUNDS.length;
    giveUpBtn.hidden = false;
  }

  function answer(clickX, clickY, gaveUp) {
    if (answered) return;
    answered = true;
    var r = ROUNDS[round];

    var dx = (clickX - r.x) * img.naturalWidth;
    var dy = (clickY - r.y) * img.naturalHeight;
    var dist = Math.sqrt(dx * dx + dy * dy) / img.naturalWidth;

    var tier = gaveUp ? { points: 0, label: 'Revealed.' } : tierFor(dist);
    score += tier.points;
    scoreEl.textContent = String(score);
    tally.push({ species: r.species, points: tier.points });

    if (!gaveUp) {
      marker.hidden = false;
      place(marker, clickX, clickY);
    }
    ring.hidden = false;
    ring.classList.remove('pop');
    void ring.offsetWidth; /* restart the pop animation */
    ring.classList.add('pop');
    place(ring, r.x, r.y);

    verdictEl.textContent = gaveUp
      ? 'No score — here it is.'
      : '+' + tier.points + ' points · ' + tier.label;
    revealEl.innerHTML = 'It was ' + (r.art || 'a') + ' <strong>' + r.species + '</strong> — ' + r.note;
    feedback.hidden = false;
    giveUpBtn.hidden = true;
    nextBtn.textContent = (round === ROUNDS.length - 1) ? 'See my results' : 'Next frog';
    nextBtn.focus();

    /* quietly warm up the next photograph */
    if (round < ROUNDS.length - 1) {
      var pre = new Image();
      pre.src = imgSrc(ROUNDS[round + 1].img);
    }
  }

  img.addEventListener('click', function (e) {
    if (answered) return;
    var rect = img.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width;
    var y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    answer(x, y, false);
  });

  giveUpBtn.addEventListener('click', function () {
    answer(0, 0, true);
  });

  nextBtn.addEventListener('click', function () {
    if (round < ROUNDS.length - 1) {
      showRound(round + 1);
      stage.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    } else {
      showResults();
    }
  });

  function showResults() {
    var max = ROUNDS.length * 100;
    var grade;
    if (score >= 500) grade = 'Eagle eyes — even the herons are jealous.';
    else if (score >= 400) grade = 'Very sharp — a naturalist in the making.';
    else if (score >= 250) grade = 'Good eyes. The frogs fooled you once or twice.';
    else if (score >= 100) grade = 'The frogs win this round.';
    else grade = 'The frogs were invisible to you — rematch?';

    var best = 0;
    try { best = parseInt(window.localStorage.getItem('frogweb-best'), 10) || 0; } catch (err) { best = 0; }
    var newBest = score > best;
    if (newBest) {
      try { window.localStorage.setItem('frogweb-best', String(score)); } catch (err2) {}
    }

    var html = '<p class="find-final">You scored <strong>' + score + '</strong> out of ' + max + '.</p>' +
      '<p class="find-grade">' + grade + (newBest ? ' <em>New best score!</em>' : ' (Best so far: ' + best + '.)') + '</p>' +
      '<ul class="find-tally">';
    for (var i = 0; i < tally.length; i++) {
      html += '<li><img src="' + imgSrc(ROUNDS[i].img) + '" alt="">' +
        '<span>' + tally[i].species + '</span><b>' + tally[i].points + '</b></li>';
    }
    html += '</ul>' +
      '<button class="btn btn-primary" id="find-again" type="button">Play again</button>';

    results.innerHTML = html;
    results.hidden = false;
    stage.classList.add('done');
    var again = document.getElementById('find-again');
    if (again) again.addEventListener('click', start);
    stage.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  }

  function start() {
    score = 0;
    tally = [];
    scoreEl.textContent = '0';
    results.hidden = true;
    results.innerHTML = '';
    stage.classList.remove('done');
    showRound(0);
  }

  start();
})();
