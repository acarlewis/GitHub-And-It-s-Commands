/* ── Copy-to-clipboard buttons ── */
    function addCopyButtons() {
      $('#content-area pre').each(function () {
        const $pre = $(this);
        const $wrap = $('<div class="code-block"></div>');
        $pre.replaceWith($wrap);
        $wrap.append($pre);
        const $btn = $(`<button class="copy-btn" aria-label="Copy code">${ICON_COPY} Copy</button>`);
        $wrap.append($btn);
        $btn.on('click', async function () {
          const text = ($pre.find('code')[0] ?? $pre[0]).textContent ?? '';
          try {
            await navigator.clipboard.writeText(text);
            $btn.html(`${ICON_CHECK} Copied!`).addClass('copied');
            setTimeout(() => $btn.html(`${ICON_COPY} Copy`).removeClass('copied'), 2000);
          } catch {
            try {
              const r = document.createRange();
              r.selectNode($pre[0]);
              window.getSelection()?.removeAllRanges();
              window.getSelection()?.addRange(r);
            } catch {}
          }
        });
      });
    }

    /* ── Scroll spy ── */
    let spyObserver = null;
    function setupScrollSpy() {
      if (spyObserver) spyObserver.disconnect();
      spyObserver = new IntersectionObserver(entries => {
        const visible = entries.filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveSection(visible[0].target.id);
      }, { rootMargin: '-10% 0px -78% 0px', threshold: 0 });
      document.querySelectorAll('#content-area .section-block').forEach(el => spyObserver.observe(el));
    }

    /* ── Sidebar click: smooth scroll + close mobile drawer ── */
    $(document).on('click', '.sidebar-nav .nav-link', function (e) {
      e.preventDefault();
      const target = document.querySelector($(this).attr('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection($(this).attr('href').slice(1));
      const oc = document.getElementById('mobileSidebar');
      const inst = oc ? bootstrap.Offcanvas.getInstance(oc) : null;
      if (inst) inst.hide();
    });

    /* ── Back to top ── */
    $(window).on('scroll', function () { $('#back-to-top').toggleClass('visible', window.scrollY > 400); });
    $('#back-to-top').on('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* ── Boot ── */
    $(function () {
      $('#content-area pre code').each(function () { hljs.highlightElement(this); });
      addCopyButtons();
      setupScrollSpy();
      setActiveSection('installation-guis');
    });