


//Show which states have more farms than others with 1000 acres of land or greater.
google.load('visualization', '1', {'packages': ['geochart']});
google.setOnLoadCallback(drawOutbreaks);

function drawOutbreaks() {
  var data = google.visualization.arrayToDataTable([
['State', 'Arrests'],
    ['Alabama', 220],
    ['Alaska', 1159],
    ['Arizona', 29670],
    ['Arkansas', 11168],
    ['California', 229083],
    ['Colorado', 13381],
    ['Conneticut', 9927],
    ['Delaware', 6163],
    ['Florida', 122190],
    ['Geogria', 42619],
    ['Hawaii', 1122],
    ['Idaho', 7409],
    ['Illinois', 29478],
    ['Indiana', 16167],
    ['Iowa', 9115],
    ['Kansas', 7677],
    ['Kentucky', 21644],
    ['Louisiana', 17693],
    ['Maine', 5802],
    ['Maryland', 37780],
    ['Massachusetts', 10516],
    ['Michigan', 33567],
    ['Minnesota', 19148],
    ['Mississippi', 8958],
    ['Missouri', 33496],
    ['Montana', 2205],
    ['Nebraska', 11965 ],
    ['Nevada', 12508],
    ['New Hampshire', 6224],
    ['New Jersey', 52721],
    ['New Mexico', 5529],
    ['New York', 58782],
    ['North Carolina', 34695],
    ['North Dakota', 4004],
    ['Ohio', 36331],
    ['Oklahoma', 17721],
    ['Oregon', 11165],
    ['Pennsylvania', 57392],
    ['Rhode Island', 1913],
    ['South Carolina', 26720],
    ['South Dakota', 5406],
    ['Tennessee', 41493],
    ['Texas', 135683],
    ['Utah', 14630],
    ['Vermont', 661],
    ['Virginia', 36988],
    ['Washington', 648],
    ['West Virginia', 38],
    ['Wisconsin', 302],
    ['Wyoming', 52]
  ]);
  
  var opts = {
    region: 'US',
    displayMode: 'regions',
    resolution: 'provinces',
      width: '100%',
        height: '100%',
    backgroundColor: '#00362B',

 chartArea: {
            left: "1%",
            top: "1%",
            height: "94%",
            width: "94%"
        },
    colorAxis: {colors: ['#ffffff', 'green']}


  };
  var geochart = new google.visualization.GeoChart(
      document.getElementById('stateOutbreaks'));
  geochart.draw(data, opts);
};
