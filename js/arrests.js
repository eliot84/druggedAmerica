        var map = L.map('map').setView([37.8, -96], 4);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWxpb3Q4NCIsImEiOiJjaW1tMzNtdHUwMzl5b2JtMGNyNXNramxtIn0.y1RSXSQDVyDkNzxaOPGxJQ', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.light'
        }).addTo(map);
        // control that shows state info on hover
        var info = L.control();
        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };
        info.update = function (props) {
            this._div.innerHTML = '<h4>Drug Abuse Related Arrests 2014</h4>' +  (props ?
                '<b>' + props.name + '</b><br />' + props.density + ' Arrests</sup>'
                : 'Hover over a state');
        };
        info.addTo(map);
        // get color depending on population density value
        function getColor(d) {
            return d > 300000 ? '#000033' :
                   d > 200000  ? '#000080' :
                   d > 100000  ? '#0000cc' :
                   d > 50000  ? ' #1a1aff' :
                   d > 10000   ? '#4d4dff' :
                   d > 5000   ? '#8080ff' :
                   d > 500   ? '#b3b3ff' :
                              '#e6e6ff';
        }
        function style(feature) {
            return {
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7,
                fillColor: getColor(feature.properties.density)
            };
        }
        function highlightFeature(e) {
            var layer = e.target;
            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
            info.update(layer.feature.properties);
        }
        var geojson;
        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.update();
        }
        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }
        geojson = L.geoJson(statesData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
        map.attributionControl.addAttribution('Population data &copy; <a href="https://www.fbi.gov/about-us/cjis/ucr/crime-in-the-u.s/2014/crime-in-the-u.s.-2014/tables/table-69">FBI.Gov</a>');
        var legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [500, 5000, 10000, 50000, 100000, 200000, 300000],
                labels = [],
                from, to;
            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];
                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }
            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(map);