var clockFit;

(function ($) {
	'use strict';

	clockFit = {
		start_time: false,
		pause_time: false,
		running_time: false,

		clock_interval: false,
		timer_interval: false,
		countdown_interval: false,

		clock_timeout: false,

		timer_is_running: false,
		timer_is_paused: false,
		doing_countdown: false,

		mode: 'clock',

		$el: false,

		audio: {},
		timer_options : {
			countdown_beep: '',
			go_beep: '',
			direction: 'up',
			start_time: 0,
			interval: 1,
		},

		setup: function( opts, $el, mode ) {
			var _self = this;

			_self.timer_options = $.extend( _self.timer_options, opts );

			if ( 'undefined' !== typeof $el && $el.length ) {
				_self.$el = $el;
			}
			if ( 'undefined' !== typeof mode && mode ) {
				_self.mode = mode;
			}

			// Preload Audio.
			if ( _self.timer_options.countdown_beep ) {
				_self.audio.countdown = new Audio();
				_self.audio.countdown.src = _self.timer_options.countdown_beep;
				_self.audio.countdown.preload = 'auto';
			}

			if ( _self.timer_options.go_beep ) {
				_self.audio.go = new Audio();
				_self.audio.go.src = _self.timer_options.go_beep;
				_self.audio.go.preload = 'auto';
			}

			if ( _self.$el ) {
				_self.render();
			}

			return _self;
		},

		set_option: function( key, val ) {
			this.timer_options[ key ] = val;
		},

		render: function() {
			var _self = this;
			if ( 'clock' === _self.mode ) {
				_self.show_clock();
			} else if ( 'timer' === _self.mode ) {
				_self.show_timer();
			}
		},

		show_clock: function() {
			var _self = this;
			clearInterval( _self.timer_interval );
			clearInterval( _self.countdown_interval );
			_self.mode = 'clock';
			_self.run_clock(); // Set the current time immediately.
			_self.clock_interval = setInterval(function() {
				_self.run_clock(); // Set the time every 1 second.
			}, 1000 );
		},

		run_clock: function() {
			var _self = this,
				current_time = new Date,
				seconds = current_time.getSeconds(),
				minutes = current_time.getMinutes(),
				hours = current_time.getHours();

			if ( seconds < 10 ) {
				seconds = '0' + seconds;
			}
			if ( minutes < 10 ) {
				minutes = '0' + minutes;
			}
			if ( hours > 12 ) {
				hours -= 12;
			} else if ( 0 == hours ) {
				hours = 12;
			}
			if ( hours < 10 ) {
				hours = '0' + hours;
			}

			var clock_text = hours + ':' + minutes + ':' + seconds;
		    _self.set_clock( clock_text );
		},

		set_clock: function( clock_text ) {
			this.$el.html( clock_text );
		},

		set_mode: function( mode ) {
			this.mode = mode;
			this.render();
			return this;
		},

		do_countdown: function() {
			var _self = this,
				start = 10;

			_self.precache_audio();

			_self.doing_countdown = true;
			clearInterval( _self.timer_interval );
			_self.set_clock( start );
			_self.countdown_interval = setInterval(function() {
				start--;
				if ( start == 0 ) {
					clearInterval( _self.countdown_interval );
					_self.doing_countdown = false;
					_self.play_audio( 'go' );
					_self.start_time = new Date;
					_self.start();
				} else if ( start < 0 ) {
					clearInterval( _self.countdown_interval );
					_self.doing_countdown = false;
					_self.start();
				} else {
					if ( start <= 3 ) {
						_self.play_audio( 'countdown' );
					}
					_self.set_clock( start );
				}
			}, 1000 );
		},

		precache_audio: function() {
			var _self = this;

			if ( _self.audio.countdown ) {
				_self.audio.countdown.muted = true;
				_self.audio.countdown.volume = 0;
				_self.audio.countdown.play();
				setTimeout( function(){
					_self.audio.countdown.muted = false;
					_self.audio.countdown.volume = 1;
				}, 2000 );
			}

			if ( _self.audio.go ) {
				_self.audio.go.muted = true;
				_self.audio.go.volume = 0;
				_self.audio.go.play();
				setTimeout( function(){
					_self.audio.go.muted = false;
					_self.audio.go.volume = 1;
				}, 2000 );
			}
		},

		play_audio: function( audio ) {
			if ( this.audio[ audio ] ) {
				this.audio[ audio ].currentTime = 0;
				this.audio[ audio ].play();
			}
		},

		show_timer: function() {
			var _self = this;
			clearInterval( _self.clock_interval );
			if ( _self.timer_is_running ) {
				_self.start();
			} else if ( ! _self.pause_time ) {
				_self.reset();
			} else { // Set the current time of the timer.
				var display = _self.format( _self.running_time ),
					clock_text = display.hours + ':' + display.minutes + ':' + display.seconds + '.' + display.ms;
			    _self.set_clock( clock_text );
			    display = false; // clear var.
			}
		},

		reset: function() {
			var _self = this;
			clearInterval( _self.timer_interval );
			clearInterval( _self.countdown_interval );
			_self.timer_is_running = false;
			_self.start_time = false;
			_self.pause_time = false;
			_self.running_time = false;
			_self.timer_is_paused = false;
			_self.set_clock( '<span class="hours">00</span>:<span class="minutes">00<span class="seconds">:</span>00.00' );

			_self.$el.trigger( 'clockfit.reset' );

			/*
			_self.clock_timeout = setTimeout(function() {
				if ( ! _self.timer_is_running && ! _self.timer_is_paused && ! _self.doing_countdown ) {
					_self.$el.trigger( 'clockfit.clock_timeout' );
					_self.show_clock();
				}
			}, 30000 );
			*/

			return _self;
		},

		pause: function() {
			var _self = this;
			if ( _self.doing_countdown ) {
				return false;
			}

			clearInterval( _self.timer_interval );
			clearInterval( _self.countdown_interval );
			_self.pause_time = new Date;
			_self.timer_is_paused = true;
			_self.timer_is_running = false;
			_self.$el.trigger( 'clockfit.pause' );
			return _self;
		},

		start: function() {
			var _self = this;

			if ( 'timer' !== _self.mode ) {
				_self.set_mode( 'timer' );
			}

			if ( ! _self.start_time && ! _self.running_time && ! _self.pause_time ) {
				_self.do_countdown();
				return _self;
			}

			_self.$el.trigger( 'clockfit.start' );

			_self.timer_is_running = true;
			_self.timer_is_paused = false;

			_self.timer_interval = setInterval(function() {
				_self.running_time = new Date - _self.get_timer_time();
				var display = _self.format( _self.running_time ),
					clock_html = '<span class="hours">' + display.hours + '</span>:<span class="minutes">' + display.minutes + '<span class="seconds">:</span>' + display.seconds + '</span>.' + display.ms;
			    _self.set_clock( clock_html );
			    display = false; // clear var.
			}, 20 );

			return this;
		},

		get_timer_time: function() {
			var _self = this;
			if ( _self.pause_time && _self.start_time ) { // Timer was running, then paused.
				var diff = _self.pause_time - _self.start_time;
				_self.start_time = new Date - diff;
				_self.pause_time = false;
			} else if ( ! _self.start_time ) { // Timer was never started.
				_self.start_time = new Date;
			}

			return _self.start_time;
		},

		format: function( clock_time ) {
			var formatted = {},
				delta = Math.abs( clock_time / 1000 );

			formatted.ms = Math.floor( ( delta % 1 ) * 100 );
			formatted.seconds = Math.floor( delta % 60 );
			formatted.minutes = Math.floor( delta / 60 ) % 60;
			formatted.hours = Math.floor( delta / 3600 ) % 24;

			if ( formatted.ms < 10 ) {
				formatted.ms = '0' + formatted.ms;
			}
			if ( formatted.seconds < 10 ) {
				formatted.seconds = '0' + formatted.seconds;
			}
			if ( formatted.minutes < 10 ) {
				formatted.minutes = '0' + formatted.minutes;
			}
			if ( formatted.hours < 10 ) {
				formatted.hours = '0' + formatted.hours;
			}

			return formatted;
		}
	};

})( jQuery );
