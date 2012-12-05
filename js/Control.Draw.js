L.Map.mergeOptions({
	drawControl: false
});

L.Control.Draw = L.Control.extend({

	options: {
		position: 'topleft',
		cloudy: {},
		sunny: {},
		cloudysunny: {},
		rainy: {},
		snowy: {},
		thunderstorm: {},
		tornado: {},
		umbrella: {},
		wind: {}
	},

	handlers: {},

	onAdd: function (map) {
		var className = 'leaflet-control-draw',
			container = L.DomUtil.create('div', className);

		if (this.options.cloudy) {
			this.handlers.cloudy = new L.Marker.Draw(map, this.options.cloudy);
			this._createButton(
				'Add a marker',
				className + '-cloudy',
				container,
				this.handlers.cloudy.enable,
				this.handlers.cloudy
			);
			this.handlers.cloudy.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.sunny) {
			this.handlers.sunny = new L.Marker.Draw(map, this.options.sunny);
			this._createButton(
				'Add a marker',
				className + '-sunny',
				container,
				this.handlers.sunny.enable,
				this.handlers.sunny
			);
			this.handlers.sunny.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.cloudysunny) {
			this.handlers.cloudysunny = new L.Marker.Draw(map, this.options.cloudysunny);
			this._createButton(
				'Add a marker',
				className + '-cloudysunny',
				container,
				this.handlers.cloudysunny.enable,
				this.handlers.cloudysunny
			);
			this.handlers.cloudysunny.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.rainy) {
			this.handlers.rainy = new L.Marker.Draw(map, this.options.rainy);
			this._createButton(
				'Add a marker',
				className + '-rainy',
				container,
				this.handlers.rainy.enable,
				this.handlers.rainy
			);
			this.handlers.rainy.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.snowy) {
			this.handlers.snowy = new L.Marker.Draw(map, this.options.snowy);
			this._createButton(
				'Add a marker',
				className + '-snowy',
				container,
				this.handlers.snowy.enable,
				this.handlers.snowy
			);
			this.handlers.snowy.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.thunderstorm) {
			this.handlers.thunderstorm = new L.Marker.Draw(map, this.options.thunderstorm);
			this._createButton(
				'Add a marker',
				className + '-thunderstorm',
				container,
				this.handlers.thunderstorm.enable,
				this.handlers.thunderstorm
			);
			this.handlers.thunderstorm.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.tornado) {
			this.handlers.tornado = new L.Marker.Draw(map, this.options.tornado);
			this._createButton(
				'Add a marker',
				className + '-tornado',
				container,
				this.handlers.tornado.enable,
				this.handlers.tornado
			);
			this.handlers.tornado.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.umbrella) {
			this.handlers.umbrella = new L.Marker.Draw(map, this.options.umbrella);
			this._createButton(
				'Add a marker',
				className + '-umbrella',
				container,
				this.handlers.umbrella.enable,
				this.handlers.umbrella
			);
			this.handlers.umbrella.on('activated', this._disableInactiveModes, this);
		}

		if (this.options.wind) {
			this.handlers.wind = new L.Marker.Draw(map, this.options.wind);
			this._createButton(
				'Add a marker',
				className + '-wind',
				container,
				this.handlers.wind.enable,
				this.handlers.wind
			);
			this.handlers.wind.on('activated', this._disableInactiveModes, this);
		}
		return container;
	},

	_createButton: function (title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = title;

		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', fn, context);

		return link;
	},

	// Need to disable the drawing modes if user clicks on another without disabling the current mode
	_disableInactiveModes: function () {
		for (var i in this.handlers) {
			// Check if is a property of this object and is enabled
			if (this.handlers.hasOwnProperty(i) && this.handlers[i].enabled) {
				this.handlers[i].disable();
			}
		}
	}
});

L.Map.addInitHook(function () {
	if (this.options.drawControl) {
		this.drawControl = new L.Control.Draw();
		this.addControl(this.drawControl);
	}
});