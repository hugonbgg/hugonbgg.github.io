mapboxgl.accessToken =
  "pk.eyJ1IjoiaHVnb25iZyIsImEiOiJjanFza2JmaTQwZDllNDNyeGtub3VsODZ0In0.eYH5xYQqrhVWaKIndItTOw";
const map = new mapboxgl.Map({
  container: "map", // container ID
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/hugonbg/cle3eyejo00df01mty9rbk70o", // style URL
  center: [-55, -19], // starting position [lng, lat]
  zoom: 3.3, // starting zoom
  attributionControl: false,
});

map.addControl(
  new mapboxgl.AttributionControl({
    customAttribution:
      '<a href="https://www.linkedin.com/in/hugonbg/">Mapa: Hugo Nicolau Barbosa de Gusmão</a>',
  })
);

map.on("load", function () {
  // Add the "ZAS" GeoJSON as a source
  map.addSource("zas", {
    type: "geojson",
    data: "dados/ZAS_simplify.json", // Replace with the file path of your "ZAS" GeoJSON file
  });

  // Add the "ZSS" GeoJSON as a source
  map.addSource("zss", {
    type: "geojson",
    data: "dados/ZSS_simplify.json", // Replace with the file path of your "ZSS" GeoJSON file
  });

  // Add the "ZSS" GeoJSON as a source
  map.addSource("manchas", {
    type: "geojson",
    data: "dados/mancha_geral_final.geojson", // Replace with the file path of your "ZSS" GeoJSON file
  });

  // Add a layer for the "ZAS" polygons
  map.addLayer({
    id: "manchas-polygons",
    type: "fill",
    source: "manchas",
    paint: {
      "fill-color": "brown",
      "fill-opacity": 0.7, // Set the opacity to 0 if the layer is not visible
    },
  });

  // Add a layer for the "ZSS" polygons
  map.addLayer({
    id: "zss-polygons",
    type: "fill",
    source: "zss",
    paint: {
      "fill-color": "orange",
      "fill-opacity": 0.7, // Set the opacity to 0 if the layer is not visible
    },
  });
  // Add a layer for the "ZAS" polygons
  map.addLayer({
    id: "zas-polygons",
    type: "fill",
    source: "zas",
    paint: {
      "fill-color": "red",
      "fill-opacity": 0.7, // Set the opacity to 0 if the layer is not visible
    },
  });

  //Carrega os icones das barragens

  map.loadImage("dados/barragem.png", function (error, image) {
    if (error) throw error;
    map.addImage("barragem_icone", image);
  });

  map.loadImage("dados/barragem_com_dados.png", function (error, image) {
    if (error) throw error;
    map.addImage("barragem_com_dados_icone", image);
  });
  map.loadImage("dados/barragem_sem_dados.png", function (error, image) {
    if (error) throw error;
    map.addImage("barragem_sem_dados_icone", image);
  });

  //Adiciona a camada das barragens
  map.addSource("barragens", {
    type: "geojson",
    data: "dados/barragens.geojson",
    cluster: true, // Enable clustering
    clusterMaxZoom: 12, // Maximum zoom level at which to cluster
  });
  /*
  map.addLayer({
    id: "barragens",
    type: "symbol",
    source: "barragens",
    layout: {
      "icon-image": "barragem_icone",
      "icon-size": 0.2,
      "icon-allow-overlap": false,
    },
    paint: {},
  });
  */
  //Adiciona o cluster das barragens
  map.addLayer({
    id: "barragens_cluster",
    type: "circle",
    source: "barragens",
    filter: ["has", "point_count"], // Only show clusters at small zoom levels
    paint: {
      "circle-color": "#1978c8",
      "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 25, 30],
      "circle-opacity": 0.7,
    },
  });

  //Adiciona a contagem ao cluster
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "barragens",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 14,
    },
    paint: {
      "text-color": "#ffffff",
    },
  });

  map.addLayer({
    id: "barragens",
    type: "symbol",
    source: "barragens",
    filter: ["!", ["has", "point_count"]], // Only show individual dams at large zoom levels
    layout: {
      "icon-image": [
        "case",
        ["==", ["get", "ManchaMapeada"], "Sim"],
        "barragem_com_dados_icone",
        "barragem_sem_dados_icone",
      ],
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8.4,
        0.0,
        8.5,
        0.4,
        11.0,
        0.4,
        13.0,
        0.4,
        15,
        0.6,
      ],
      "icon-allow-overlap": true,
    },
    paint: {},
  });

  // inspect a cluster on click
  map.on("click", "barragens_cluster", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["barragens_cluster"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("barragens")
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });
  //Cria e define os popups
  map.on("click", "barragens", function (e) {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        "<b>Nome da barragem:</b> " +
          e.features[0].properties.NomeBarragem +
          " (" +
          e.features[0].properties.codigo +
          ")" +
          "<br>" +
          "<b>Responsável:</b> " +
          e.features[0].properties.NomeEmpreendedor +
          "<br>" +
          "<b>Município:</b> " +
          e.features[0].properties.Municipio +
          "<br>" +
          "<b>Estado:</b> " +
          e.features[0].properties.UF +
          "<br>" +
          "<b>Minério:</b> " +
          e.features[0].properties.Minerio +
          "<br>" +
          "<b>Categoria de risco:</b> " +
          e.features[0].properties.CategoriaRisco +
          "<br>" +
          "<b>Dano potencial:</b> " +
          e.features[0].properties.DanoPotencial +
          "<br>" +
          "<b>Fiscalização federal:</b> " +
          e.features[0].properties.InseridaPNSBFormatada
      )
      .addTo(map);
  });

  //ZAS

  // Selecione o botão de alternância (switch) por seu ID
  const zasSwitch = document.querySelector("#ZAS_switch");

  // Adicione o ouvinte de evento de alteração (change) ao botão de alternância
  zasSwitch.addEventListener("change", function () {
    // Verifique se o botão de alternância está marcado (checked)
    if (this.checked) {
      // Se estiver marcado, defina a propriedade de pintura do Mapbox GLJS para 0.7
      map.setPaintProperty("zas-polygons", "fill-opacity", 0.7);
    } else {
      // Caso contrário, defina a propriedade de pintura do Mapbox GLJS para 0
      map.setPaintProperty("zas-polygons", "fill-opacity", 0);
    }
  });

  //ZSS

  // Selecione o botão de alternância (switch) por seu ID
  const zssSwitch = document.querySelector("#ZSS_switch");

  // Adicione o ouvinte de evento de alteração (change) ao botão de alternância
  zssSwitch.addEventListener("change", function () {
    // Verifique se o botão de alternância está marcado (checked)
    if (this.checked) {
      // Se estiver marcado, defina a propriedade de pintura do Mapbox GLJS para 0.7
      map.setPaintProperty("zss-polygons", "fill-opacity", 0.7);
    } else {
      // Caso contrário, defina a propriedade de pintura do Mapbox GLJS para 0
      map.setPaintProperty("zss-polygons", "fill-opacity", 0);
    }
  });

  //Manchas

  // Selecione o botão de alternância (switch) por seu ID
  const manchasSwitch = document.querySelector("#manchas_switch");

  // Adicione o ouvinte de evento de alteração (change) ao botão de alternância
  manchasSwitch.addEventListener("change", function () {
    // Verifique se o botão de alternância está marcado (checked)
    if (this.checked) {
      // Se estiver marcado, defina a propriedade de pintura do Mapbox GLJS para 0.7
      map.setPaintProperty("manchas-polygons", "fill-opacity", 0.7);
    } else {
      // Caso contrário, defina a propriedade de pintura do Mapbox GLJS para 0
      map.setPaintProperty("manchas-polygons", "fill-opacity", 0);
    }
  });
});

//Mudar o cursor para a 'mãozinha' quando fica em cima da camada escolhida

map.on("mouseenter", "barragens_cluster", () => {
  map.getCanvas().style.cursor = "pointer";
});

//Mudar o cursor para o ponteiro quando sai de cima da camada escolhida
map.on("mouseleave", "barragens_cluster", () => {
  map.getCanvas().style.cursor = "";
});

//Mudar o cursor para a 'mãozinha' quando fica em cima da camada escolhida
map.on("mouseenter", "barragens", function () {
  map.getCanvas().style.cursor = "pointer";
});

//Mudar o cursor para o ponteiro quando sai de cima da camada escolhida
map.on("mouseleave", "barragens", function () {
  map.getCanvas().style.cursor = "";
});

// Adiciona o buscapador de localização ao mapa
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder: "Veja se a sua localidade é afetada...",
    countries: "br",
  })
);

//Adiciona os controles de navegação ao mapa
map.addControl(new mapboxgl.NavigationControl());

//Adiciona a localização do usuário ao mapa
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
  })
);

window.addEventListener("load", function () {
  setTimeout(function () {
    var meuModal = new bootstrap.Modal(document.getElementById("instrucoes"));
    meuModal.show();
  }, 2000);
});
