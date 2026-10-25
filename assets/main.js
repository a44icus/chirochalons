/* Cabinet Chiropratique Condette — scripts communs */
(function(){
  var html = document.documentElement;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Liens vers d’autres sites : ouverture dans un nouvel onglet, sécurisée,
  // avec une mention invisible pour les lecteurs d’écran
  document.querySelectorAll('a[href^="http"]').forEach(function(a){
    if (a.hostname === location.hostname) return;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    if (!a.querySelector('.mention-onglet')) {
      var m = document.createElement('span');
      m.className = 'sr-only mention-onglet';
      m.textContent = ' (nouvel onglet)';
      a.appendChild(m);
    }
  });

  // Bascule entre les palettes : Nuit (par défaut), Forêt, Terre cuite et Mixte
  // La palette Forêt étant devenue optionnelle, on la réapplique si elle avait été choisie
  try { if (localStorage.getItem('chiro-theme') === 'foret') html.setAttribute('data-theme', 'foret'); } catch(e) {}
  var themeBtn = document.querySelector('.theme-btn');
  var palettes = ['nuit', 'foret', 'terre', 'mixte'];
  var noms = { nuit: 'Nuit', foret: 'Forêt', terre: 'Terre cuite', mixte: 'Mixte' };
  function paletteActive(){ return html.getAttribute('data-theme') || 'nuit'; }
  function majTheme(){
    if (!themeBtn) return;
    var nom = noms[paletteActive()] || noms.nuit;
    themeBtn.setAttribute('aria-label', 'Palette de couleurs : ' + nom + '. Cliquer pour changer');
    themeBtn.querySelector('.theme-nom').textContent = nom;
  }
  if (themeBtn) {
    themeBtn.removeAttribute('aria-pressed');
    themeBtn.addEventListener('click', function(){
      if (!reduit) html.classList.add('theme-transition');
      var suivante = palettes[(palettes.indexOf(paletteActive()) + 1) % palettes.length];
      if (suivante === 'nuit') html.removeAttribute('data-theme');
      else html.setAttribute('data-theme', suivante);
      try { localStorage.setItem('chiro-theme', suivante); } catch(e) {}
      majTheme();
      setTimeout(function(){ html.classList.remove('theme-transition'); }, 500);
    });
    majTheme();
  }

  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  function fermerMenu(){
    if (!nav) return;
    nav.classList.remove('ouvert');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Ouvrir le menu');
  }
  if (btn && nav) {
    btn.addEventListener('click', function(){
      var ouvert = nav.classList.toggle('ouvert');
      btn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      btn.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    });
  }

  // Bouton d’appel mobile : masqué quand le hero ou le bloc rendez-vous est à l’écran
  var appelMobile = document.querySelector('.appel-mobile');
  if (appelMobile && 'IntersectionObserver' in window) {
    var zones = document.querySelectorAll('.hero, #contact');
    var visibles = new Set();
    appelMobile.classList.add('cache');
    var obs = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){ if (e.isIntersecting) visibles.add(e.target); else visibles.delete(e.target); });
      appelMobile.classList.toggle('cache', visibles.size > 0);
    });
    zones.forEach(function(z){ obs.observe(z); });
  }

  // Lueur des boutons : l’angle suit la position de la souris autour du centre du bouton
  document.querySelectorAll('.btn').forEach(function(b){
    var halo = document.createElement('span');
    halo.className = 'btn-halo';
    halo.setAttribute('aria-hidden', 'true');
    halo.appendChild(document.createElement('span'));
    b.appendChild(halo);
    // la lueur rattrape la souris avec un amorti, par le chemin le plus court autour du bouton
    var cible = null, courant = null, raf = null;
    function animer(){
      courant += (cible - courant) * 0.14;
      if (Math.abs(cible - courant) < 0.05) courant = cible;
      b.style.setProperty('--lueur-angle', courant.toFixed(2) + 'deg');
      raf = courant !== cible ? requestAnimationFrame(animer) : null;
    }
    function orienter(e){
      var r = b.getBoundingClientRect();
      var angle = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
      if (cible === null) { cible = courant = angle; }
      else { cible += ((angle - cible) % 360 + 540) % 360 - 180; }
      if (reduit) { courant = cible; b.style.setProperty('--lueur-angle', courant.toFixed(2) + 'deg'); return; }
      if (!raf) raf = requestAnimationFrame(animer);
    }
    b.addEventListener('pointerenter', orienter);
    b.addEventListener('pointermove', orienter);
  });

  // Pause du bandeau défilant
  var pause = document.querySelector('.defilant-pause');
  if (pause) {
    pause.addEventListener('click', function(){
      var bandeau = pause.closest('.defilant');
      var enPause = bandeau.classList.toggle('en-pause');
      pause.querySelector('.pause-texte').textContent = enPause ? 'Lecture' : 'Pause';
    });
  }

  // Défilement doux (Lenis) + ancres de la page
  var lenis = null;
  if (!reduit && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var cible = document.querySelector(id);
      if (!cible) return;
      e.preventDefault();
      fermerMenu();
      var decalage = -(document.querySelector('.entete').offsetHeight);
      if (lenis) lenis.scrollTo(cible, { offset: id === '#haut' ? 0 : decalage });
      else window.scrollTo({ top: cible.getBoundingClientRect().top + window.scrollY + (id === '#haut' ? 0 : decalage), behavior: reduit ? 'auto' : 'smooth' });
    });
  });

  // Titre géant : découpe en lettres, puis ajustement à toute la largeur
  var mot = document.querySelector('.mot');
  if (mot && !mot.children.length) {
    var texte = mot.textContent.trim();
    mot.textContent = '';
    texte.split('').forEach(function(c){
      var s = document.createElement('span');
      s.textContent = c === ' ' ? '\u00A0' : c;
      mot.appendChild(s);
    });
  }
  function ajusterMot(){
    if (!mot) return;
    var parent = mot.parentElement, style = getComputedStyle(parent);
    var dispo = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    // data-largeur : part de la largeur occupée par « CONDETTE. » sur l’accueil. Sur toutes les pages, le titre prend
    // la même taille de lettres que ce titre de référence, réduite seulement si le mot est trop long pour tenir sur la ligne.
    var part = parseFloat(mot.dataset.largeur || '1');
    mot.style.fontSize = '100px';
    var largeur = mot.getBoundingClientRect().width;
    if (!largeur) return;
    var plein = 100 * dispo / largeur * 0.995;
    if (window.innerWidth > 760 && part > 0 && part < 1) {
      var temoin = document.createElement('span');
      temoin.className = 'mot';
      temoin.style.cssText = 'position:absolute;visibility:hidden;font-size:100px';
      temoin.textContent = 'CONDETTE.';
      parent.appendChild(temoin);
      var largeurRef = temoin.getBoundingClientRect().width;
      parent.removeChild(temoin);
      var reference = largeurRef ? 100 * dispo * part / largeurRef : plein;
      mot.style.fontSize = Math.min(plein, reference) + 'px';
    } else {
      mot.style.fontSize = plein + 'px';
    }
  }
  ajusterMot();
  window.addEventListener('resize', ajusterMot);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){
    ajusterMot();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  // Ruban ondulé des pages intérieures : généré sous le hero à partir de son attribut data-vague
  document.querySelectorAll('.hero[data-vague]').forEach(function(hero){
    var suivant = hero.nextElementSibling;
    if (suivant && suivant.classList.contains('vague')) return;
    var v = document.createElement('div');
    v.className = 'vague';
    v.innerHTML =
      '<svg viewBox="0 0 1440 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
        '<path class="vague-fond" d="M0 100 L1440 100 L1440 202 L0 202 Z"/>' +
        '<path id="vague-trace" class="vague-bande" d="M0 100 L1440 100"/>' +
        '<text class="vague-texte" dominant-baseline="central"><textPath href="#vague-trace" startOffset="0"></textPath></text>' +
        '<text class="vague-texte vague-mesure" x="0" y="-100"></text>' +
      '</svg>';
    v.querySelector('textPath').textContent = hero.dataset.vague;
    hero.after(v);
  });

  // Bandeau sinueux : la courbe est calculée pour la largeur réelle de l’écran,
  // pour que la bande et le texte gardent la même taille partout
  var vague = document.querySelector('.vague');
  if (vague) {
    var svgVague = vague.querySelector(':scope > svg');
    var tracePath = vague.querySelector('#vague-trace');
    var chemin = vague.querySelector('.vague-texte textPath');
    var mesure = vague.querySelector('.vague-mesure');
    var motif = (chemin.textContent.trim() + ' ').toUpperCase().replace(/\s+/g, ' ') + ' ';
    var longueurMotif = 0, decalage = 0, enPauseVague = false, survol = false, dernier = null;

    function dessinerVague(){
      var W = vague.clientWidth, H = vague.clientHeight;
      var bande = parseFloat(getComputedStyle(tracePath).strokeWidth) || 58;
      var A = Math.min(H / 2 - bande / 2 - 6, H * 0.22);           // amplitude
      var h = W < 760 ? 240 : Math.max(420, Math.min(720, W / 2.6)); // demi-période
      var c = H / 2;
      // sommet de la vague au bord droit : le coin bas droit reste libre pour le bouton pause
      var pts = [[W + h, c + A]], k = 0;
      while (W - k * h > -h) { pts.unshift([W - k * h, k % 2 ? c + A : c - A]); k++; }
      var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      for (var i = 1; i < pts.length; i++) {
        var p0 = pts[i - 1], p1 = pts[i], dx = (p1[0] - p0[0]) * 0.364;
        d += ' C' + (p0[0] + dx).toFixed(1) + ' ' + p0[1].toFixed(1) + ' ' + (p1[0] - dx).toFixed(1) + ' ' + p1[1].toFixed(1) + ' ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1);
      }
      svgVague.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      tracePath.setAttribute('d', d);
      // aplat couleur page sous la courbe : le bas du hero épouse la vague
      var fond = vague.querySelector('.vague-fond');
      if (fond) fond.setAttribute('d', d + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (H + 2) + ' L' + pts[0][0].toFixed(1) + ' ' + (H + 2) + ' Z');
      // répéter le motif jusqu’à couvrir toute la vague, puis le doubler pour une boucle sans couture
      var longueurTrace = tracePath.getTotalLength(), groupe = motif, essais = 0;
      mesure.textContent = groupe;
      while (mesure.getComputedTextLength() < longueurTrace && essais++ < 20) { groupe += motif; mesure.textContent = groupe; }
      longueurMotif = mesure.getComputedTextLength();
      chemin.textContent = groupe + groupe;
      if (longueurMotif) decalage = decalage % longueurMotif;
    }
    function boucle(t){
      if (dernier !== null && !enPauseVague && !survol && !document.hidden && longueurMotif) {
        decalage -= (t - dernier) * 0.05; // vitesse : 50 px par seconde
        if (decalage <= -longueurMotif) decalage += longueurMotif;
        chemin.setAttribute('startOffset', decalage.toFixed(1));
      }
      dernier = t;
      requestAnimationFrame(boucle);
    }
    var lancer = function(){ dessinerVague(); if (!reduit) requestAnimationFrame(boucle); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lancer); else lancer();
    var minuteurVague;
    window.addEventListener('resize', function(){ clearTimeout(minuteurVague); minuteurVague = setTimeout(dessinerVague, 150); });

    vague.addEventListener('mouseenter', function(){ survol = true; });
    vague.addEventListener('mouseleave', function(){ survol = false; });
    var pauseVague = vague.querySelector('.vague-pause');
    if (pauseVague) pauseVague.addEventListener('click', function(){
      enPauseVague = vague.classList.toggle('en-pause');
      pauseVague.querySelector('.pause-texte').textContent = enPauseVague ? 'Lecture' : 'Pause';
    });
  }

  // Diaporama du hero : fondu enchaîné entre les photos
  var diaporama = document.querySelector('.hero-photo.diaporama');
  if (diaporama) {
    var diapos = diaporama.querySelectorAll('img');
    // Les photos suivantes ne se chargent qu’après la page, pour ne pas ralentir l’affichage
    function chargerDiapos(){
      diapos.forEach(function(img){ if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); } });
    }
    if (document.readyState === 'complete') chargerDiapos();
    else window.addEventListener('load', chargerDiapos);
    if (diapos.length > 1 && !reduit) {
      var actuelle = 0;
      setInterval(function(){
        if (document.hidden) return;
        var suivante = (actuelle + 1) % diapos.length;
        var img = diapos[suivante];
        if (img.dataset.src || !img.complete || img.naturalWidth < 2) return; // attendre qu’elle soit chargée
        diapos[suivante].classList.add('active');
        diapos[actuelle].classList.remove('active');
        if (window.gsap) gsap.fromTo(diapos[suivante], { scale: 1.08 }, { scale: 1, duration: 7, ease: 'power1.out', overwrite: 'auto' });
        actuelle = suivante;
      }, 6000);
    }
  }

  if (!window.gsap) { html.classList.remove('is-loading'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduit) { html.classList.remove('is-loading'); return; }

  // Ouverture : la photo se pose, les lettres se lèvent une à une
  if (mot) {
    var lettres = gsap.utils.toArray('.mot > span');
    html.classList.remove('is-loading');
    gsap.set(lettres, { y: 0, yPercent: 110 });
    var aEnfants = function(sel){ return gsap.utils.toArray(sel); };
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.hero-photo img', { scale: 1.18 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .to(lettres, { yPercent: 0, duration: 1.1, stagger: Math.min(0.06, 0.6 / lettres.length) }, 0.15);
    var autres = aEnfants('.hero-sur, .hero-haut, .hero-bas > *');
    if (autres.length) tl.from(autres, { opacity: 0, y: 20, duration: 0.8, stagger: 0.08 }, 0.7);

    // Au défilement : la photo descend, le mot glisse vers la gauche
    gsap.to('.hero-photo img', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to(mot, {
      xPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  } else {
    html.classList.remove('is-loading');
  }

  // Parallaxe discrète sur les photos
  gsap.utils.toArray('.parallaxe img, .appel-photo img').forEach(function(img){
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
})();
