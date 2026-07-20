// デモページ専用: SERVICES を職種プリセットで切り替えて「自由に設定できる」ことを見せる
(function () {
  var btns = document.querySelectorAll('.demo-svc-btn');
  if (!btns.length) return;
  var P = {
    guitar: [
      { icon: '/uploads/demo_guitar.webp', t: 'ギターレッスン', d: '初心者からプロ志向まで、目的に合わせた完全個別レッスン。コード理論・フィンガーピッキング・弾き語りまで。対面（東京都内）／オンライン（Zoom）に対応します。' },
      { icon: '/uploads/demo_mic.webp', t: 'レコーディング', d: '自宅スタジオでのギター録音。アコースティック・エレキともに対応し、楽曲の雰囲気に合わせたアレンジ提案から納品まで一貫して行います。リモート納品可。' },
      { icon: '/uploads/demo_amp.webp', t: 'ライブ・制作サポート', d: 'ライブサポート、ツアー帯同、楽曲アレンジ、劇伴制作まで。編成や規模を問わず、まずはお気軽にご相談ください。' }
    ],
    drums: [
      { icon: '/uploads/lp_material_07.webp', t: 'ドラムレッスン', d: '基礎のスティックコントロールからグルーヴ強化、脱力奏法まで。初心者〜プロ志向、レベル不問の完全個別レッスン。対面／オンラインに対応します。' },
      { icon: '/uploads/lp_material_03.webp', t: 'レコーディング', d: '自宅スタジオでの高音質ドラム録音。ジャンルを問わず対応し、リモートでのデータ納品も可能です。' },
      { icon: '/uploads/cymbal_china.webp', t: 'ライブサポート', d: 'アコースティック編成からアリーナ規模まで柔軟に対応。リハーサルから当日サポート、ツアー帯同までご相談ください。' }
    ],
    vocal: [
      { icon: '/uploads/demo_mic.webp', t: 'ボーカルレッスン', d: '発声の基礎から表現力まで、目的に合わせた完全個別レッスン。ボイストレーニング・弾き語り相談もOK。対面／オンラインに対応します。' },
      { icon: '/uploads/demo_piano.webp', t: '仮歌・コーラス録音', d: '楽曲デモの仮歌、コーラスアレンジ＆録音を承ります。自宅スタジオからのリモート納品で全国対応。' },
      { icon: '/uploads/demo_amp.webp', t: 'ライブ・イベント出演', d: 'ライブ、ウェディングや企業イベントでの歌唱出演など。編成・規模を問わずお気軽にご相談ください。' }
    ]
  };
  function apply(key) {
    var set = P[key];
    if (!set) return;
    for (var i = 0; i < 3; i++) {
      var icon = document.getElementById('svc-icon-' + (i + 1));
      var t = document.getElementById('svc-title-' + (i + 1));
      var d = document.getElementById('svc-desc-' + (i + 1));
      if (icon) { icon.src = set[i].icon; icon.alt = set[i].t; }
      if (t) t.textContent = set[i].t;
      if (d) d.textContent = set[i].d;
    }
    for (var j = 0; j < btns.length; j++) {
      var on = btns[j].getAttribute('data-preset') === key;
      btns[j].style.background = on ? 'var(--accent)' : '#fff';
      btns[j].style.color = on ? '#fff' : 'var(--gray-700)';
      btns[j].style.boxShadow = on ? 'none' : 'inset 0 0 0 1px var(--border-default)';
    }
  }
  for (var k = 0; k < btns.length; k++) {
    btns[k].addEventListener('click', function () { apply(this.getAttribute('data-preset')); });
  }
})();
