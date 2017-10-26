var frameRate = 5;
var wmsLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        projection: 'CRS:84',
        url: 'http://oos.soest.hawaii.edu/erddap/wms/NOAA_DHW_5km/request',
        params: {
            'LAYERS': 'NOAA_DHW_5km:CRW_DHW',
            'TIME': '2017-10-24T12:00:00Z',
            'EXCEPTIONS': 'INIMAGE',
            'TILED': true
        }
    })),
    visible:false
});
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' + 'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            })
        }),
        wmsLayer
    ],
    view: new ol.View({
        center: [-10802627.683927462, 4786251.5431982465],
        zoom: 3,
        //projection:'CRS:84'
    })
});
var parser = new ol.format.WMSCapabilities();
var updateMap = _.throttle(function(timestamp) {
    wmsLayer.getSource().updateParams({
        'TIME': timestamp
    });
    $('#timestamp').text(new Date(timestamp));
    wmsLayer.setVisible(true);
}, 500,{
  leading: false
});
fetch('http://oos.soest.hawaii.edu/erddap/wms/NOAA_DHW_5km/request?service=WMS&request=GetCapabilities&version=1.3.0').then(function(response) {
    return response.text();
}).then(function(text) {
    var result = parser.read(text);
    var timestamps = result.Capability.Layer.Layer[1].Dimension[0].values.split(',');
    var interval = parseInt(timestamps.length / 5);
    var rangeSlider = document.getElementById('animate');
    noUiSlider.create(rangeSlider, {
        start: [0],
        step: 10,
        range: {
            'min': [0],
            'max': [timestamps.length]
        }
    });
    rangeSlider.noUiSlider.on('update', function(values, handle) {
        var timestamp = timestamps[parseInt(values[handle])];
        updateMap(timestamp);
    });
});
//http://oos.soest.hawaii.edu/erddap/wms/NOAA_DHW_5km/request?EXCEPTIONS=INIMAGE&VERSION=1.3.0&SRS=EPSG:4326&LAYERS=NOAA_DHW_5km:CRW_DHW&TIME=2017-10-24T12:00:00Z&TRANSPARENT=true&BGCOLOR=0x808080&FORMAT=image/png&SERVICE=WMS&REQUEST=GetMap&STYLES=&BBOX=-180,-90,-26.4,63.6&WIDTH=256&HEIGHT=256
//http://oos.soest.hawaii.edu/erddap/wms/NOAA_DHW_5km/request?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=NOAA_DHW_5km:CRW_DHW&TIME=2017-10-24T12:00:00Z&EXCEPTIONS=INIMAGE&WIDTH=256&HEIGHT=256&CRS=EPSG:4326&STYLES=&BBOX=-90,-90,0,0
//http://oos.soest.hawaii.edu/erddap/wms/NOAA_DHW_5km/request?service=WMS&request=GetCapabilities&version=1.3.0