        /*  
            Projeto: Requalifica Centro
            Desenvolvimento: SPUrbanismo
            Desenvolvedor: Hugo Nicolau Barbosa de Gusmão
            Data Publicação: Março de 2022

          */

        //Cria o container do mapa
        const map = new maplibregl.Map({

            container: 'map',
            style: carto.basemaps.positron,
            center: [-46.631, -23.544],
            zoom: 14.5,
            minZoom: 13,
            pitch: 60,
            attributionControl: false,

        }).addControl(new maplibregl.AttributionControl({
            customAttribution: 'SPUrbanismo'
        }));;


        //Função para esperar carregar o mapa antes de carregar os elementos
        map.on('load', () => {

            //Carrega o geojson dos lotes
            map.addSource('lotes', {
                type: 'geojson',
                data: 'dados/lotes_mapa_site_2022.geojson',
            })

            //Carrega o geojson dos edificios
            map.addSource('edificios', {
                type: 'geojson',
                data: 'dados/edificios.geojson'
            });


            //Define o estilo dos lotes e adiciona a camada 2D ao mapa
            map.addLayer({
                'id': 'lotes-2d',
                'z-index': 0,
                'type': 'fill',
                'source': 'lotes',
                'layout': { 'visibility': 'visible' },
                'paint': {
                    'fill-color': 'transparent',
                    //'fill-outline-color': '#717D7E',
                    'fill-opacity': 1.0,
                    'fill-outline-color': 'transparent',

                }
            });

            map.setPaintProperty('lotes-2d', 'fill-outline-color', [
                'interpolate',
                // Set the exponential rate of change to 0.5
                ['exponential', 1.2],
                ['zoom'],
                // When zoom is 15, buildings will be beige.
                14,
                'transparent',
                // When zoom is 18 or higher, buildings will be yellow.
                20,
                '#4a5355'
            ]);

            map.on('click', 'lotes-2d', function (e) {
                var feature = e.features[0];
                console.log()
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setMaxWidth('none')
                    .setHTML(
                        '<b>SQL:</b> ' + feature.properties.SQL + '<br>' +
                        '<b>Quantidade de Donos:</b> ' + feature.properties.IPTU22_QtdProprietarios + '<br>' +
                        '<b>Imóvel Público:</b> ' + feature.properties.Publico + '<br>' +
                        '<b>Ano da Construção Corrigido:</b> ' + feature.properties.IPTU22_AnoConstrucaoCorrigido + '<br>' +
                        '<b>Testada do terreno(m):</b> ' + feature.properties.IPTU22_Testada.toLocaleString('pt-BR') + '<br>' +
                        '<b>Área do Terreno(m²):</b> ' + feature.properties.IPTU22_AreaTerreno.toLocaleString('pt-BR') + '<br>' +
                        '<b>Área Ocupada(m²):</b> ' + feature.properties.IPTU22_AreaOcupada.toLocaleString('pt-BR') + '<br>' +
                        '<b>Área Construída(m²):</b> ' + feature.properties.IPTU22_AreaConstruida.toLocaleString('pt-BR') + '<br>' +
                        '<b>Quantidade de Pavimentos:</b> ' + feature.properties.IPTU22_QtdPavimentos + '<br>' +
                        '<b>Coeficiente de Aproveitamento:</b> ' + feature.properties.IPTU22_CA + '<br>' +
                        '<b>Tipologia:</b> ' + feature.properties.Tipologia.substring(0, 45) + '<br>' +
                        '<b>PEUC:</b> ' + feature.properties.PEUC + '<br>' +
                        '<b>IPTU Progressivo:</b> ' + feature.properties.IPTU_Progressivo + '<br>' +
                        '<b>Tombado:</b> ' + feature.properties.Tombado + '<br>' +
                        '<b>Ocupado por Mov.de Moradias:</b> ' + feature.properties.Ocupado + '<br>')
                    .addTo(map);

            });

            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', 'lotes-2d', function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'lotes-2d', function () {
                map.getCanvas().style.cursor = '';
            });

            //Define o estilo dos lotes e adiciona a camada do CA ao mapa
            map.addLayer({
                'id': 'CA',
                'type': 'fill',
                'source': 'lotes',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'fill-color': [
                        'step',
                        ['get', 'IPTU22_CA'],

                        '#c7e9b4', 2.0,
                        '#7fcdbb', 4.0,
                        '#41b6c4', 6.0,
                        '#2c7fb8', 12.0,
                        '#253494',
                    ]


                }
            });

            map.setPaintProperty('CA', 'fill-outline-color', [
                'interpolate',
                // Set the exponential rate of change to 0.5
                ['exponential', 1.5],
                ['zoom'],
                // When zoom is 15, buildings will be beige.
                14,
                'transparent',
                // When zoom is 18 or higher, buildings will be yellow.
                20,
                '#4a5355'
            ]);


            //Define o estilo dos lotes e adiciona a camada dos pavimentos ao mapa
            map.addLayer({
                'id': 'pavimentos',
                'type': 'fill',
                'source': 'lotes',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'fill-color': [
                        'step',
                        ['get', 'IPTU22_QtdPavimentos'],

                        '#f2f0f7', 1.0,
                        '#9e9ac8', 6.0,
                        '#756bb1', 19.0,
                        '#54278f'


                    ]

                }
            });

            map.setPaintProperty('pavimentos', 'fill-outline-color', [
                'interpolate',
                // Set the exponential rate of change to 0.5
                ['exponential', 1.2],
                ['zoom'],
                // When zoom is 15, buildings will be beige.
                14,
                'transparent',
                // When zoom is 18 or higher, buildings will be yellow.
                20,
                'white'
            ]);

            //Define o estilo dos lotes e adiciona a camada dos Imóveis Públicos ao mapa
            map.addLayer({
                'id': 'publicos',
                'type': 'fill',
                'source': 'lotes',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'fill-color': [
                        'case',
                        ['==', ['get', 'Publico'], 'Não'], '#beaed4',
                        ['==', ['get', 'Publico'], 'Sim'], '#fdc086',
                        'grey'
                    ],
                }
            });

            map.setPaintProperty('publicos', 'fill-outline-color', [
                'interpolate',
                // Set the exponential rate of change to 0.5
                ['exponential', 1.5],
                ['zoom'],
                // When zoom is 15, buildings will be beige.
                14,
                'transparent',
                // When zoom is 18 or higher, buildings will be yellow.
                20,
                '#4a5355'
            ]);

            //Define o estilo dos lotes e adiciona a camada da tipologia ao mapa
            map.addLayer({
                'id': 'tipologia',
                'type': 'fill',
                'source': 'lotes',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'fill-color': [
                        'case',
                        ['==', ['get', 'Tipologia'], 'Residencial'], '#ef8a62',
                        //['==', ['get', 'IPTU_TIPOLOGIA'], 'Residencial'], '#67a9cf',
                        ['==', ['get', 'Tipologia'], 'Uso Misto'], '#7fbf7b',
                        ['==', ['get', 'Tipologia'], 'Terreno'], '#756bb1',
                        '#67a9cf' //Tudo que não se encaixa nas categorias acima, os não residenciais
                    ],
                }
            });


            map.setPaintProperty('tipologia', 'fill-outline-color', [
                'interpolate',
                // Set the exponential rate of change to 0.5
                ['exponential', 1.5],
                ['zoom'],
                // When zoom is 15, buildings will be beige.
                14,
                'transparent',
                // When zoom is 18 or higher, buildings will be yellow.
                20,
                '#4a5355'
            ]);

            //Define o estilo dos lotes e adiciona a camada dos tombados ao mapa
            map.addLayer({
                'id': 'tombados',
                'type': 'fill',
                'source': 'lotes',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'fill-color': [
                        'case',
                        ['==', ['get', 'Tombado'], 'Sim'], '#ea8c55',
                        '#7c9eaf'

                    ],
                }
            });

            map.setPaintProperty('tombados', 'fill-outline-color', [
                'interpolate',
                // Set the exponential rate of change to 0.5
                ['exponential', 1.5],
                ['zoom'],
                // When zoom is 15, buildings will be beige.
                14,
                'transparent',
                // When zoom is 18 or higher, buildings will be yellow.
                20,
                '#4a5355'
            ]);

            //Define o estilo dos lotes e adiciona a camada do unico dono ao mapa

            map.addLayer({
                'id': 'donos',
                'type': 'fill-extrusion',
                'source': 'edificios',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'fill-extrusion-color': [
                        'step',
                        ['get', 'cores'],

                        '#cacac3', 50.0,
                        '#b1afa9', 132.0,
                        '#7491a0', 1050.0,
                        '#5b7887', 1100.0,
                        '#425f6f', 1150.0,
                        '#2a4858',


                    ],


                    'fill-extrusion-height': {
                        'type': 'identity',
                        'property': 'height',
                    },
                    'fill-extrusion-opacity': 0.8,
                    'fill-extrusion-base': 0,
                    'fill-extrusion-vertical-gradient': true
                }
            });

            //3D - Define o estilo dos edificios e adiciona a camada ao mapa

            map.addLayer({
                'id': 'edificios-3d',
                'type': 'fill-extrusion',
                'source': 'edificios',
                'layout': { 'visibility': 'visible' },
                'paint': {
                    'fill-extrusion-color': [
                        'step',
                        ['get', 'height'],

                        '#c5e1ee', 1.0,
                        '#a9c6d3', 10.0,
                        '#8eabb9', 20.0,
                        '#7491a0', 40.0,
                        '#5b7887', 60.0,
                        '#425f6f', 80.0,
                        '#2a4858'
                    ],

                    'fill-extrusion-height': {
                        'type': 'identity',
                        'property': 'height',
                    },
                    'fill-extrusion-opacity': 0.90,
                    'fill-extrusion-base': 0,
                    'fill-extrusion-vertical-gradient': true
                }
            });

            // Configura a ação nos botões das camadas

            //Botão que alterna o 2D / 3D
            var checkbox = document.querySelector("input[name=checkbox]");

            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    console.log("Checkbox is checked..");
                    map.flyTo({
                        pitch: 60,
                        //bearing: -10
                    });
                    //map.setLayoutProperty('lotes-2d', 'visibility', 'none');
                    map.setLayoutProperty('edificios-3d', 'visibility', 'visible');
                    map.setLayoutProperty('CA', 'visibility', 'none');
                    map.setLayoutProperty('pavimentos', 'visibility', 'none');
                    map.setLayoutProperty('publicos', 'visibility', 'none');
                    map.setLayoutProperty('tipologia', 'visibility', 'none');
                    map.setLayoutProperty('tombados', 'visibility', 'none');
                    map.setLayoutProperty('donos', 'visibility', 'none');
                    document.getElementById("2d_legenda").style.display = "none"
                    document.getElementById("3d_legenda").style.display = "block"
                    document.getElementById("CA_legenda").style.display = "none"
                    document.getElementById("pavimentos_legenda").style.display = "none"
                    document.getElementById("publicos_legenda").style.display = "none"
                    document.getElementById("tipologia_legenda").style.display = "none"
                    document.getElementById("tombados_legenda").style.display = "none"
                    document.getElementById("donos_legenda").style.display = "none"
                    map.setPaintProperty('lotes-2d', 'fill-color', 'transparent'); //Deixa o 2d invisivel para o popup
                    map.setPaintProperty('lotes-2d', 'fill-opacity', 1.0); //Deixa o 2d invisivel para o popup
                    map.setPaintProperty('lotes-2d', 'fill-outline-color', 'transparent'); //Deixa o 2d invisivel para o popup

                } else {
                    console.log("Checkbox is not checked..");
                    map.flyTo({
                        pitch: 0,
                        //bearing: 0
                    });
                    map.setLayoutProperty('lotes-2d', 'visibility', 'visible');
                    map.setLayoutProperty('edificios-3d', 'visibility', 'none');
                    map.setLayoutProperty('CA', 'visibility', 'none');
                    map.setLayoutProperty('pavimentos', 'visibility', 'none');
                    map.setLayoutProperty('publicos', 'visibility', 'none');
                    map.setLayoutProperty('tipologia', 'visibility', 'none');
                    map.setLayoutProperty('tombados', 'visibility', 'none');
                    map.setLayoutProperty('donos', 'visibility', 'none');
                    document.getElementById("2d_legenda").style.display = "block"
                    document.getElementById("3d_legenda").style.display = "none"
                    document.getElementById("CA_legenda").style.display = "none"
                    document.getElementById("pavimentos_legenda").style.display = "none"
                    document.getElementById("publicos_legenda").style.display = "none"
                    document.getElementById("tipologia_legenda").style.display = "none"
                    document.getElementById("tombados_legenda").style.display = "none"
                    document.getElementById("donos_legenda").style.display = "none"
                    map.setPaintProperty('lotes-2d', 'fill-color', '#F4C029'); //Deixa o 2d invisivel para o popup
                    map.setPaintProperty('lotes-2d', 'fill-opacity', 0.7); //Deixa o 2d invisivel para o popup
                    //map.setPaintProperty('lotes-2d', 'fill-outline-color', '#717D7E'); //Deixa o 2d invisivel para o popup
                    map.setPaintProperty('lotes-2d', 'fill-outline-color', [
                        'interpolate',
                        // Set the exponential rate of change to 0.5
                        ['exponential', 1.2],
                        ['zoom'],
                        // When zoom is 15, buildings will be beige.
                        14,
                        'transparent',
                        // When zoom is 18 or higher, buildings will be yellow.
                        20,
                        '#4a5355'
                    ]);
                }
            });



            //CA
            document.getElementById('CA').addEventListener('click', function () {
                map.flyTo({
                    pitch: 0,
                    //bearing: 0
                });
                //map.setLayoutProperty('lotes-2d', 'visibility', 'none');
                map.setLayoutProperty('edificios-3d', 'visibility', 'none');
                map.setLayoutProperty('CA', 'visibility', 'visible');
                map.setLayoutProperty('pavimentos', 'visibility', 'none');
                map.setLayoutProperty('publicos', 'visibility', 'none');
                map.setLayoutProperty('tipologia', 'visibility', 'none');
                map.setLayoutProperty('tombados', 'visibility', 'none');
                map.setLayoutProperty('donos', 'visibility', 'none');
                document.getElementById("2d_legenda").style.display = "none"
                document.getElementById("3d_legenda").style.display = "none"
                document.getElementById("CA_legenda").style.display = "block"
                document.getElementById("pavimentos_legenda").style.display = "none"
                document.getElementById("publicos_legenda").style.display = "none"
                document.getElementById("tipologia_legenda").style.display = "none"
                document.getElementById("tombados_legenda").style.display = "none"
                document.getElementById("donos_legenda").style.display = "none"
                document.getElementById("alterna3d-btn").checked = false; //Desabilita o checkbox para o 3d aparecer desabilitado
                map.setPaintProperty('lotes-2d', 'fill-color', 'transparent'); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-opacity', 1.0); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-outline-color', 'transparent'); //Deixa o 2d invisivel para o popup

            });

            //Pavimentos
            document.getElementById('pavimentos').addEventListener('click', function () {
                map.flyTo({
                    pitch: 0,
                    //bearing: 0
                });
                //map.setLayoutProperty('lotes-2d', 'visibility', 'none');
                map.setLayoutProperty('edificios-3d', 'visibility', 'none');
                map.setLayoutProperty('CA', 'visibility', 'none');
                map.setLayoutProperty('pavimentos', 'visibility', 'visible');
                map.setLayoutProperty('publicos', 'visibility', 'none');
                map.setLayoutProperty('tipologia', 'visibility', 'none');
                map.setLayoutProperty('tombados', 'visibility', 'none');
                map.setLayoutProperty('donos', 'visibility', 'none');
                document.getElementById("2d_legenda").style.display = "none"
                document.getElementById("3d_legenda").style.display = "none"
                document.getElementById("CA_legenda").style.display = "none"
                document.getElementById("pavimentos_legenda").style.display = "block"
                document.getElementById("publicos_legenda").style.display = "none"
                document.getElementById("tipologia_legenda").style.display = "none"
                document.getElementById("tombados_legenda").style.display = "none"
                document.getElementById("donos_legenda").style.display = "none"
                document.getElementById("alterna3d-btn").checked = false; //Desabilita o checkbox para o 3d aparecer desabilitado
                map.setPaintProperty('lotes-2d', 'fill-color', 'transparent'); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-opacity', 1.0); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-outline-color', 'transparent'); //Deixa o 2d invisivel para o popup




            });
            //Publicos
            document.getElementById('publicos').addEventListener('click', function () {
                map.flyTo({
                    pitch: 0,
                    //bearing: 0
                });
                //map.setLayoutProperty('lotes-2d', 'visibility', 'none');
                map.setLayoutProperty('edificios-3d', 'visibility', 'none');
                map.setLayoutProperty('CA', 'visibility', 'none');
                map.setLayoutProperty('pavimentos', 'visibility', 'none');
                map.setLayoutProperty('publicos', 'visibility', 'visible');
                map.setLayoutProperty('tipologia', 'visibility', 'none');
                map.setLayoutProperty('tombados', 'visibility', 'none');
                map.setLayoutProperty('donos', 'visibility', 'none');
                document.getElementById("2d_legenda").style.display = "none"
                document.getElementById("3d_legenda").style.display = "none"
                document.getElementById("CA_legenda").style.display = "none"
                document.getElementById("pavimentos_legenda").style.display = "none"
                document.getElementById("publicos_legenda").style.display = "block"
                document.getElementById("tipologia_legenda").style.display = "none"
                document.getElementById("tombados_legenda").style.display = "none"
                document.getElementById("donos_legenda").style.display = "none"
                document.getElementById("alterna3d-btn").checked = false; //Desabilita o checkbox para o 3d aparecer desabilitado
                map.setPaintProperty('lotes-2d', 'fill-color', 'transparent'); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-opacity', 1.0); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-outline-color', 'transparent'); //Deixa o 2d invisivel para o popup


            });

            //Tipologias
            document.getElementById('tipologia').addEventListener('click', function () {
                map.flyTo({
                    pitch: 0,
                    //bearing: 0
                });
                //map.setLayoutProperty('lotes-2d', 'visibility', 'none');
                map.setLayoutProperty('edificios-3d', 'visibility', 'none');
                map.setLayoutProperty('CA', 'visibility', 'none');
                map.setLayoutProperty('pavimentos', 'visibility', 'none');
                map.setLayoutProperty('publicos', 'visibility', 'none');
                map.setLayoutProperty('tipologia', 'visibility', 'visible');
                map.setLayoutProperty('tombados', 'visibility', 'none');
                map.setLayoutProperty('donos', 'visibility', 'none');
                document.getElementById("2d_legenda").style.display = "none"
                document.getElementById("3d_legenda").style.display = "none"
                document.getElementById("CA_legenda").style.display = "none"
                document.getElementById("pavimentos_legenda").style.display = "none"
                document.getElementById("publicos_legenda").style.display = "none"
                document.getElementById("tipologia_legenda").style.display = "block"
                document.getElementById("tombados_legenda").style.display = "none"
                document.getElementById("donos_legenda").style.display = "none"
                document.getElementById("alterna3d-btn").checked = false; //Desabilita o checkbox para o 3d aparecer desabilitado
                map.setPaintProperty('lotes-2d', 'fill-color', 'transparent'); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-opacity', 1.0); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-outline-color', 'transparent'); //Deixa o 2d invisivel para o popup


            });

            //Tombados
            document.getElementById('tombados').addEventListener('click', function () {
                map.flyTo({
                    pitch: 0,
                    //bearing: 0
                });
                //map.setLayoutProperty('lotes-2d', 'visibility', 'none');
                map.setLayoutProperty('edificios-3d', 'visibility', 'none');
                map.setLayoutProperty('CA', 'visibility', 'none');
                map.setLayoutProperty('pavimentos', 'visibility', 'none');
                map.setLayoutProperty('publicos', 'visibility', 'none');
                map.setLayoutProperty('tipologia', 'visibility', 'none');
                map.setLayoutProperty('tombados', 'visibility', 'visible');
                map.setLayoutProperty('donos', 'visibility', 'none');
                document.getElementById("2d_legenda").style.display = "none"
                document.getElementById("3d_legenda").style.display = "none"
                document.getElementById("CA_legenda").style.display = "none"
                document.getElementById("pavimentos_legenda").style.display = "none"
                document.getElementById("publicos_legenda").style.display = "none"
                document.getElementById("tipologia_legenda").style.display = "none"
                document.getElementById("tombados_legenda").style.display = "block"
                document.getElementById("donos_legenda").style.display = "none"
                document.getElementById("alterna3d-btn").checked = false; //Desabilita o checkbox para o 3d aparecer desabilitado
                map.setPaintProperty('lotes-2d', 'fill-color', 'transparent'); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-opacity', 1.0); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-outline-color', 'transparent'); //Deixa o 2d invisivel para o popup


            });

            //Donos
            document.getElementById('donos').addEventListener('click', function () {
                map.flyTo({
                    pitch: 60,
                    //bearing: 0
                });
                //map.setLayoutProperty('lotes-2d', 'visibility', 'none');
                map.setLayoutProperty('edificios-3d', 'visibility', 'none');
                map.setLayoutProperty('CA', 'visibility', 'none');
                map.setLayoutProperty('pavimentos', 'visibility', 'none');
                map.setLayoutProperty('publicos', 'visibility', 'none');
                map.setLayoutProperty('tipologia', 'visibility', 'none');
                map.setLayoutProperty('tombados', 'visibility', 'none');
                map.setLayoutProperty('donos', 'visibility', 'visible');
                document.getElementById("2d_legenda").style.display = "none"
                document.getElementById("3d_legenda").style.display = "none"
                document.getElementById("CA_legenda").style.display = "none"
                document.getElementById("pavimentos_legenda").style.display = "none"
                document.getElementById("publicos_legenda").style.display = "none"
                document.getElementById("tipologia_legenda").style.display = "none"
                document.getElementById("tombados_legenda").style.display = "none"
                document.getElementById("donos_legenda").style.display = "block"
                document.getElementById("alterna3d-btn").checked = false; //Desabilita o checkbox para o 3d aparecer desabilitado
                map.setPaintProperty('lotes-2d', 'fill-color', 'transparent'); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-opacity', 1.0); //Deixa o 2d invisivel para o popup
                map.setPaintProperty('lotes-2d', 'fill-outline-color', 'transparent'); //Deixa o 2d invisivel para o popup


            });

            // Add zoom and rotation controls to the map.
            //map.addControl(new maplibregl.NavigationControl({showZoom = false}),'bottom-right');

            const nav = new maplibregl.NavigationControl({
                visualizePitch: true,
                showZoom: false,
                showCompass: true,
            });
            map.addControl(nav, 'bottom-right');


        })