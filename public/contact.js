// Contact form → Web3Forms (AJAX). Served from /public so it satisfies CSP script-src 'self'.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var result = document.getElementById('contact-result');
  var btn = document.getElementById('contact-submit');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var data = Object.fromEntries(new FormData(form));
    var original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = '送信中…';
    result.style.display = 'none';
    try {
      var res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      var json = await res.json();
      if (json.success) {
        form.reset();
        result.textContent = '送信しました。ありがとうございます。追ってご連絡いたします。';
        result.style.color = '#fff';
      } else {
        result.textContent = '送信に失敗しました。お手数ですが時間をおいて再度お試しください。';
        result.style.color = '#ffb3b3';
      }
    } catch (err) {
      result.textContent = '送信に失敗しました。通信環境をご確認のうえ、再度お試しください。';
      result.style.color = '#ffb3b3';
    }
    result.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = original;
  });
})();

// Mobile hamburger nav: close the dropdown after tapping a link.
(function () {
  var t = document.getElementById('nav-toggle');
  if (!t) return;
  var links = document.querySelectorAll('#nv-links a');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function () { t.checked = false; });
  }
})();
