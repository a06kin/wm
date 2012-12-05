function addMark(data){
        answ = $.post("new_marker", data);
        idp = $.post("id");
        var id = 0;
        idp.complete(function(){
            id = JSON.parse(idp.responseText).id;
            answ.complete(function(){
                var newm = JSON.parse(answ.responseText);
                var arr = [];
                arr[0] = newm;
                showMarks(arr, id);
            });
        });
        
}

function getMarks(){
        tmp = $.post("all_marker");
        idp = $.post("id");
        var id = 0;
        idp.complete(function(){
            id = JSON.parse(idp.responseText).id;
            tmp.complete(function(){
                var markers = JSON.parse(tmp.responseText);
                showMarks(markers, id);
            });
        });
        
}

function showMarks(markers, id){
    for (one in markers){
        console.log(markers[one]);
        if (markers[one].owner != 0){
            if (markers[one].owner == id){
                L.marker(
                    [parseFloat(markers[one].lat),
                    parseFloat(markers[one].lng)],
                    {
                        icon:icons[markers[one].className + "_my"],
                        opacity:markers[one].op,
                        draggable:true
                    }).addTo(map).bindPopup("<img src = 'https://graph.facebook.com/" + id + "/picture?type=square'>").on('dragend', function(e) {
                        console.log(e);
                    });
            }else{
                L.marker(
                    [parseFloat(markers[one].lat),
                    parseFloat(markers[one].lng)],
                    {
                        icon:icons[markers[one].className],
                        opacity:markers[one].op
                    }).addTo(map).bindPopup("<img src = 'https://graph.facebook.com/" + markers[one].owner + "/picture?type=square'>");
            }
        }else{
            L.marker(
                [parseFloat(markers[one].lat),
                parseFloat(markers[one].lng)],
                {
                    icon:icons[markers[one].className],
                    opacity:markers[one].op
                }).addTo(map);
        }
    }
}

function fix(){
    if (window.location.hash && window.location.hash === "#_=_") {
      if (window.history && history.pushState) {
        window.history.pushState("", document.title, window.location.pathname);
      } else {
        // Prevent scrolling by storing the page's current scroll offset
        var scroll = {
          top: document.body.scrollTop,
          left: document.body.scrollLeft
        };
        window.location.hash = "";
        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scroll.top;
        document.body.scrollLeft = scroll.left;
      }
    }
}

document.getElementById('map').style.height = window.innerHeight + "px";
document.getElementById('map').style.width = window.innerWidth + "px";

var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/5759ec43861c4cd19e8897b85d0b5ea4/997/256/{z}/{x}/{y}.png',

cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18}),

map = new L.Map('map', {layers: [cloudmade], center: new L.LatLng(56.948889, 24.106389), zoom: 12});

var icons = {};

//Draw

var MyCustomIcon = L.Icon.extend({
    options: {
        iconAnchor: new L.Point(16, 3),
        iconSize: new L.Point(32, 37)
    }
});

/*icons["../css/images/weather/cloudy.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/cloudy.png'});
icons["../css/images/weather/sunny.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/sunny.png'});
icons["../css/images/weather/cloudysunny.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/cloudysunny.png'});
icons["../css/images/weather/rainy.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/rainy.png'});
icons["../css/images/weather/snowy.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/snowy.png'});
icons["../css/images/weather/thunderstorm.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/thunderstorm.png'});
icons["../css/images/weather/tornado.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/tornado.png'});
icons["../css/images/weather/umbrella.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/umbrella.png'});
icons["../css/images/weather/wind.png"] = new MyCustomIcon({iconUrl: '../css/images/weather/wind.png'});*/

icons["cloudy"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'cloudy'});
icons["sunny"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'sunny'});
icons["cloudysunny"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'cloudysunny'});
icons["rainy"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'rainy'});
icons["snowy"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'snowy'});
icons["thunderstorm"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'thunderstorm'});
icons["tornado"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'tornado'});
icons["umbrella"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'umbrella'});
icons["wind"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'wind'});

icons["cloudy_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'cloudy my'});
icons["sunny_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'sunny my'});
icons["cloudysunny_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'cloudysunny my'});
icons["rainy_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'rainy my'});
icons["snowy_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'snowy my'});
icons["thunderstorm_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'thunderstorm my'});
icons["tornado_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'tornado my'});
icons["umbrella_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'umbrella my'});
icons["wind_my"] = new L.divIcon({iconAnchor: new L.Point(16, 3),iconSize: new L.Point(32, 37),className: 'wind my'});

var options = {
	position: 'bottomright',
    polyline: false,
    polygon: false,
    circle: false, 
    rectangle: false,
    cloudy: {icon: icons["cloudy"]},
    sunny: {icon: icons["sunny"]},
    cloudysunny: {icon: icons["cloudysunny"]},
    rainy: {icon: icons["rainy"]},
    snowy: {icon: icons["snowy"]},
    thunderstorm: {icon: icons["thunderstorm"]},
    tornado: {icon: icons["tornado"]},
    umbrella: {icon: icons["umbrella"]},
    wind: {icon: icons["wind"]}
}

var drawControl = new L.Control.Draw(options);

map.addControl(drawControl);

getMarks();

//var drawnItems = new L.LayerGroup();
map.on('draw:marker-created', function (e) {
	//drawnItems.addLayer(e.marker);
    addMark({'className':e.marker.options.icon.options.className, 'lat':e.marker._latlng.lat, 'lng':e.marker._latlng.lng});
});
//map.addLayer(drawnItems);


var FacebookC = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'facebook');

        container.innerHTML = "<a class='facebook-login' href='/auth/facebook'></a>"

        return container;
    }
});

function fc(){
    map.addControl(new FacebookC());
}

fix();



