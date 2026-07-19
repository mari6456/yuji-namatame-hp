// Schedule renderer: Googleスプレッドシート（ウェブに公開したCSV）を読み込んで #sched-list に描画します。
// 1行目のヘッダー名（日付/タイトル/会場/リンクURL/リンク文言/時間/出演/Guest/料金/その他）で列を認識するため、
// 列の順番は自由で、Googleフォームの回答シート（先頭に「タイムスタンプ」列が付く）もそのまま使えます。
// ・「日付」「タイトル」列は必須。ヘッダー名が見つからない場合は A〜J の並び順で読みます
// ・日付が過去のイベントは自動的に表示されません（行を消さなくてOK）
// ・時間/出演/Guest/料金/その他 のどれかが入っていると「詳しく見る」の開閉パネル付きになります
// ・先頭5件のみ表示し、6件目以降は「MORE」に畳まれます
(function () {
  var list = document.getElementById('sched-list');
  if (!list) return;
  var SRC = list.getAttribute('data-src');
  if (!SRC) return;

  var ARROW = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"></path><path d="M7 7h10v10"></path></svg>';
  var CHEV = '<svg class="yj-more-chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>';
  var WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // 素朴なCSVパーサ（引用符・カンマ・改行対応）
  function parseCSV(text) {
    var rows = [], row = [], cell = '', inQ = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQ) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; } else { inQ = false; }
        } else { cell += ch; }
      } else if (ch === '"') { inQ = true; }
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        rows.push(row); row = [];
      } else { cell += ch; }
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  function parseDate(s) {
    var m = String(s).trim().match(/^(\d{4})[\/\.\-年](\d{1,2})[\/\.\-月](\d{1,2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function fmtDate(d) {
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '.' + z(d.getMonth() + 1) + '.' + z(d.getDate());
  }

  function el(tag, style, cls) {
    var e = document.createElement(tag);
    if (style) e.setAttribute('style', style);
    if (cls) e.className = cls;
    return e;
  }
  function dateCell(d) {
    var c = el('div', 'font-family:var(--font-mono);font-size:15px;font-weight:500;color:var(--accent);white-space:nowrap;text-align:center');
    c.appendChild(document.createTextNode(fmtDate(d)));
    var w = el('span', 'display:block;font-size:11px;color:var(--gray-400)');
    w.textContent = WD[d.getDay()];
    c.appendChild(w);
    return c;
  }
  function infoCell(ev) {
    var c = document.createElement('div');
    var t = el('div', 'font-weight:700;font-size:17px;line-height:1.45;color:var(--ink)', 'zk');
    t.textContent = ev.title;
    c.appendChild(t);
    if (ev.venue) {
      var v = el('div', 'margin-top:3px;font-size:13px;color:var(--gray-500)');
      v.textContent = ev.venue;
      c.appendChild(v);
    }
    return c;
  }

  // シンプル行（詳細パネルなし）
  function simpleRow(ev) {
    var r = el('div', 'display:grid;grid-template-columns:auto 1fr auto;gap:24px;align-items:center;padding:14px 0;border-top:1px solid var(--border-subtle)');
    r.appendChild(dateCell(ev.date));
    r.appendChild(infoCell(ev));
    if (ev.url) {
      var a = el('a', 'display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:var(--radius-pill);font-size:13px;font-weight:600;color:var(--gray-700);box-shadow:inset 0 0 0 1px var(--border-default);white-space:nowrap', 'hv-chip');
      a.href = ev.url; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(document.createTextNode(ev.linkLabel || '詳細'));
      a.insertAdjacentHTML('beforeend', ARROW);
      r.appendChild(a);
    }
    return r;
  }

  // 「詳しく見る」開閉付き行
  function detailRow(ev) {
    var d = el('details', null, 'yj-ev');
    var s = document.createElement('summary');
    s.appendChild(dateCell(ev.date));
    s.appendChild(infoCell(ev));
    var tg = el('span', null, 'yj-ev-toggle');
    tg.innerHTML = '<span class="yj-ev-labelmore">詳しく見る</span><span class="yj-ev-labelclose">閉じる</span>' + CHEV;
    s.appendChild(tg);
    d.appendChild(s);

    var body = el('div', null, 'yj-ev-body');
    var panel = el('div', 'background:var(--gray-50);border-radius:var(--radius-md);padding:20px 22px');
    var dl = el('dl', 'margin:0;display:grid;grid-template-columns:auto 1fr;gap:9px 18px;font-size:13.5px;line-height:1.75');
    var fields = [['時間', ev.time], ['出演', ev.cast], ['Guest', ev.guest], ['会場', ev.venue], ['料金', ev.price], ['その他', ev.note]];
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i][1]) continue;
      var dt = el('dt', 'color:var(--gray-500);font-weight:600;white-space:nowrap');
      dt.textContent = fields[i][0];
      var dd = el('dd', 'margin:0;color:var(--gray-700)');
      dd.textContent = fields[i][1];
      dl.appendChild(dt); dl.appendChild(dd);
    }
    panel.appendChild(dl);
    if (ev.url) {
      var a = el('a', 'display:inline-flex;align-items:center;gap:6px;height:36px;margin-top:16px;padding:0 16px;border-radius:var(--radius-pill);font-size:13px;font-weight:600;color:var(--gray-700);background:#fff;box-shadow:inset 0 0 0 1px var(--border-default);text-decoration:none');
      a.href = ev.url; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(document.createTextNode(ev.linkLabel || '会場サイト'));
      a.insertAdjacentHTML('beforeend', ARROW);
      panel.appendChild(a);
    }
    body.appendChild(panel);
    d.appendChild(body);
    return d;
  }

  function render(events) {
    list.textContent = '';
    if (!events.length) {
      var p = el('p', 'margin:0;padding:20px 0;border-top:1px solid var(--border-subtle);font-size:14px;color:var(--gray-500)');
      p.textContent = '現在お知らせできる予定はありません。';
      list.appendChild(p);
      return;
    }
    var head = events.slice(0, 5), rest = events.slice(5);
    for (var i = 0; i < head.length; i++) list.appendChild(head[i].hasDetail ? detailRow(head[i]) : simpleRow(head[i]));
    if (rest.length) {
      var more = el('details', null, 'yj-sched-more');
      var sum = document.createElement('summary');
      sum.innerHTML = '<span class="yj-more-close">MORE</span><span class="yj-more-open">CLOSE</span>' + CHEV;
      more.appendChild(sum);
      for (var j = 0; j < rest.length; j++) more.appendChild(rest[j].hasDetail ? detailRow(rest[j]) : simpleRow(rest[j]));
      list.appendChild(more);
    }
  }

  function fail() {
    list.textContent = '';
    var p = el('p', 'margin:0;padding:20px 0;border-top:1px solid var(--border-subtle);font-size:14px;color:var(--gray-500)');
    p.textContent = 'スケジュールを読み込めませんでした。時間をおいて再読み込みしてください。';
    list.appendChild(p);
  }

  fetch(SRC, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (text) {
      var rows = parseCSV(text);
      // ヘッダー名で列位置を特定（フォーム回答シートの「タイムスタンプ」列や列順変更に対応）
      // ヘッダーを同義語の部分一致で認識（フォームの質問名「開催日」「イベントタイトル」「ゲスト」等にも対応）。
      // リンク文言→リンクURLの順で誤マッチを防ぐ
      var KEYS = [
        ['linkLabel', ['リンク文言', '文言']],
        ['url', ['リンクURL', 'URL', 'url']],
        ['date', ['日付', '開催日']],
        ['title', ['タイトル']],
        ['venue', ['会場']],
        ['time', ['時間']],
        ['cast', ['出演']],
        ['guest', ['Guest', 'guest', 'ゲスト']],
        ['price', ['料金']],
        ['note', ['その他', '備考']]
      ];
      var head = rows[0] || [];
      var idx = {};
      var used = {};
      for (var k = 0; k < KEYS.length; k++) {
        outer:
        for (var s = 0; s < KEYS[k][1].length; s++) {
          for (var h = 0; h < head.length; h++) {
            if (used[h]) continue;
            if ((head[h] || '').indexOf(KEYS[k][1][s]) !== -1) { idx[KEYS[k][0]] = h; used[h] = true; break outer; }
          }
        }
      }
      if (idx.date === undefined || idx.title === undefined) {
        // ヘッダーが認識できない場合：タイムスタンプ列があれば B〜K、なければ A〜J の並びで読む
        var off = ((head[0] || '').indexOf('タイムスタンプ') !== -1 || /timestamp/i.test(head[0] || '')) ? 1 : 0;
        idx = { date: off, title: off + 1, venue: off + 2, url: off + 3, linkLabel: off + 4, time: off + 5, cast: off + 6, guest: off + 7, price: off + 8, note: off + 9 };
      }
      function col(c, k) { return idx[k] === undefined ? '' : (c[idx[k]] || '').trim(); }
      var events = [];
      for (var i = 1; i < rows.length; i++) { // 1行目はヘッダー
        var c = rows[i];
        var date = parseDate(col(c, 'date'));
        var title = col(c, 'title');
        if (!date || !title) continue;
        var ev = {
          date: date, title: title,
          venue: col(c, 'venue'), url: col(c, 'url'), linkLabel: col(c, 'linkLabel'),
          time: col(c, 'time'), cast: col(c, 'cast'), guest: col(c, 'guest'),
          price: col(c, 'price'), note: col(c, 'note')
        };
        if (ev.url && !/^https?:\/\//.test(ev.url)) ev.url = '';
        ev.hasDetail = !!(ev.time || ev.cast || ev.guest || ev.price || ev.note);
        events.push(ev);
      }
      // 今日より前のイベントを自動的に隠す（当日は表示）
      var today = new Date(); today.setHours(0, 0, 0, 0);
      events = events.filter(function (e) { return e.date >= today; });
      events.sort(function (a, b) { return a.date - b.date; });
      render(events);
    })
    .catch(fail);
})();
