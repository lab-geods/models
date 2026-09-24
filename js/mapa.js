(function () {
  var lang = document.documentElement.lang === 'en' ? 'en' : 'pt';
  var T = {
    pt: { hint: 'Escolhe um ponto no mapa para ver o modelo.', sensor: 'Sensor', area: 'Área', explore: 'Explorar modelo ↗',
          approx: 'Posição aproximada, por confirmar.', street: 'Mapa', sat: 'Satélite', n: ' modelos',
          tech: { aereo: 'LiDAR Aéreo', terrestre: 'LiDAR Terrestre', multi: 'Multiespectral' } },
    en: { hint: 'Pick a point on the map to see the model.', sensor: 'Sensor', area: 'Area', explore: 'Explore model ↗',
          approx: 'Approximate position, to be confirmed.', street: 'Map', sat: 'Satellite', n: ' models',
          tech: { aereo: 'Airborne LiDAR', terrestre: 'Terrestrial LiDAR', multi: 'Multispectral' } }
  }[lang];

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }

  var map = L.map('map');
  var dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
  var sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, attribution: 'Tiles &copy; Esri' });
  var base = {}; base[T.street] = dark; base[T.sat] = sat;
  L.control.layers(base, null, { collapsed: true }).addTo(map);
  map.fitBounds(L.latLngBounds(MODELOS.map(function (m) { return [m.lat, m.lng]; })), { padding: [30, 30] });

  var cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 40 });
  map.addLayer(cluster);

  var detail = document.getElementById('detail');
  var count = document.getElementById('count');
  var filters = document.getElementById('filters');
  detail.innerHTML = '<p class="map-hint">' + T.hint + '</p>';

  function show(m) {
    var rows = '';
    if (m.sensor) rows += '<dt>' + T.sensor + '</dt><dd>' + esc(m.sensor) + '</dd>';
    if (m.area) rows += '<dt>' + T.area + '</dt><dd>' + esc(m.area) + '</dd>';
    detail.innerHTML =
      '<img class="map-thumb" src="../images/' + m.img + '" alt="' + esc(m.title[lang]) + '">' +
      '<span class="map-tag ' + m.t + '">' + T.tech[m.t] + '</span>' +
      '<h2>' + esc(m.title[lang]) + '</h2>' +
      (rows ? '<dl>' + rows + '</dl>' : '') +
      (m.approx ? '<p class="map-note">' + T.approx + '</p>' : '') +
      '<a class="model-link" href="https://realitymax.co/embed/' + m.url + '" target="_blank" rel="noopener">' + T.explore + '</a>';
  }

  var markers = MODELOS.map(function (m) {
    var mk = L.marker([m.lat, m.lng], {
      title: m.title[lang],
      icon: L.divIcon({ className: '', html: '<span class="pin ' + m.t + '"></span>', iconSize: [16, 16] })
    });
    mk.on('click', function () { show(m); map.panTo(mk.getLatLng()); });
    return { m: m, mk: mk };
  });

  var on = { aereo: true, terrestre: true, multi: true };
  function refresh() {
    var v = markers.filter(function (x) { return on[x.m.t]; });
    cluster.clearLayers();
    cluster.addLayers(v.map(function (x) { return x.mk; }));
    count.textContent = v.length + ' / ' + markers.length + T.n;
  }

  Object.keys(on).forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip on'; b.setAttribute('aria-pressed', 'true');
    b.innerHTML = '<span class="pin ' + t + '"></span>' + T.tech[t];
    b.onclick = function () {
      on[t] = !on[t];
      b.classList.toggle('on', on[t]);
      b.setAttribute('aria-pressed', on[t]);
      refresh();
    };
    filters.appendChild(b);
  });
  refresh();
})();
