var joncsi = (function ($) {
	'use strict';

	var clockfit_instance;

	/**
	 * Empty placeholder function.
	 *
	 * @since 0.1.0
	 */
	var init_textfill = function () {
		$( '.tab-content > div article' ).each(function(){
			var height = $(this).outerHeight( true ),
				width = $(this).outerWidth( true ),
				start_font_size = parseInt( $(this).css( 'font-size' ).replace( 'px', '' ) ),
				line_height = $(this).css( 'line-height' ),
				$clone = $(this).clone();

			$clone.css({
				'visibility': 'hidden',
				'position': 'absolute',
				'z-index': '-1',
				'width': width,
				'height': height,
				'line-height': line_height,
				'top': 0,
				'left': 0,
				'overflow': 'auto'
			});

			$('body').append( $clone );

			var no_overflow = true,
				end_font_size = start_font_size,
				i = 0;

			while ( no_overflow ) {
				if ( $clone.prop( 'offsetHeight' ) < $clone.prop( 'scrollHeight' ) || $clone.prop( 'offsetWidth' ) < $clone.prop( 'scrollWidth' ) ) {
					no_overflow = false;
				} else {
					end_font_size += 0.5;
					$clone.css( 'font-size', end_font_size + 'px' );
				}
				i++;
				if ( i == 50 ) {
					no_overflow = false;
				}
			}

			$clone.remove();

			if ( end_font_size != start_font_size ) {
				$(this).css( 'font-size', end_font_size + 'px' );
			}
		});
	},

	init_clock = function() {
		var $clock = $('.clock');

		clockfit_instance = clockFit.setup( {
			countdown_beep: joncsi_vars.countdown_beep,
			go_beep: joncsi_vars.go_beep
		}, $clock );

		$clock.on( 'clockfit.clock_timeout', function(){
			$( '.clock-clock' ).hide();
			$( '.clock-timer' ).show();
			hide_clock_controls();
		} )

		$( '.clock-timer' ).on( 'click', function() {
			clockfit_instance.set_mode( 'timer' );
			show_clock_controls();
			$( '.clock-clock' ).show();
			$( '.clock-timer' ).hide();
		});

		$( '.clock-clock' ).on( 'click', function() {
			clockfit_instance.set_mode( 'clock' );
			hide_clock_controls();
			$( '.clock-clock' ).hide();
			$( '.clock-timer' ).show();
		});

		$( '.clock-toggle' ).on( 'click', function() {
			if ( $(this).hasClass( 'is-running' ) ) {
				if ( clockfit_instance.pause() ) {
					$(this).text( 'Start' ).removeClass( 'is-running' );
				}
			} else {
				$( '.clock-mode' ).attr( 'disabled', 'disabled' );
				$(this).text( 'Pause' ).addClass( 'is-running' );
				$( '.clock-timer' ).click();
				clockfit_instance.start();
				$(this).blur();
			}
		});

		$( '.clock-mode' ).on( 'click', function(){
			var mode = $(this).attr( 'data-mode' );
			if ( 'up' === mode ) {
				$(this).addClass( 'down' ).text( 'Down' );
				$(this).attr( 'data-mode', 'down' ).removeClass( 'tabata' );
				clockfit_instance.set_option( 'direction', 'down' );
			} else if( 'down' === mode ) {
				$(this).addClass( 'tabata' ).text( 'Tabata' );
				$(this).attr( 'data-mode', 'tabata' );
				clockfit_instance.set_option( 'mode', 'tabata' );
			} else {
				$(this).removeClass( 'up' ).text( 'Up' );
				$(this).attr( 'data-mode', 'up' ).removeClass( 'tabata' );
				clockfit_instance.set_option( 'direction', 'up' );
			}
		});

		$( '.clock-reset' ).on( 'click', function() {
			clockfit_instance.reset();
			$( '.clock-mode' ).removeAttr( 'disabled' );
			$( '.clock-toggle' ).text( 'Start' ).removeClass( 'is-running' );
		});
	},

	show_clock_controls = function() {
		$( '.clock-mode' ).show();
		$( '.clock-toggle' ).show();
		$( '.clock-reset' ).show();
	},

	hide_clock_controls = function() {
		$( '.clock-mode' ).hide();
		if ( ! clockfit_instance.timer_is_running && ! clockfit_instance.timer_is_paused ) {
			$( '.clock-reset' ).hide();
		}
	},

	init_column_focus = function() {
		$( '.workout-content header' ).off( 'click' ).on( 'click', function(){
			var $parent = $(this).parents( 'div:first' ),
				$wrap = $(this).parents( '.workout-content' );

			if ( $wrap.hasClass( 'focused' ) && $parent.hasClass( 'focused' ) ) {
				$wrap.removeClass( 'focused' );
			} else if ( $wrap.hasClass( 'focused' ) && ! $parent.hasClass( 'focused' ) ) {
				$('.focused', $wrap ).removeClass( 'focused' );
			} else {
				$wrap.addClass( 'focused' );
			}

			$parent.toggleClass( 'focused' );
		});

		$( '.tools header' ).off( 'click' ).on( 'click', function(){
			$('.tools').toggleClass( 'large' );
			$('.workout-container').toggleClass( 'tools-mode' );
		});
	},

	init_workout_controls = function() {
		$( '.next-workout, .prev-workout, .today-workout' ).on( 'click', function(e) {
			var workout_date = $('.app-wrap').attr( 'data-workout-date' ),
				rel = $(this).attr( 'rel' );

			$('.app-wrap').addClass('collapsed');

			$.ajax({
				url: joncsi_vars.ajax_url,
				data: { action: 'joncsi_get_' + rel + '_workout', date: workout_date },
				method: 'get',
				success: function( response ) {
					if ( ! response.success ) {
						// TODO.
						$('.app-wrap').removeClass( 'collapsed' );
						return;
					}
					setTimeout( function(){
						$('.app-wrap').attr( 'data-workout-date', response.workout_date );
						$('.workout-container').html( response.workouts );
						$('.workout-title, .mobile-workout-title').html( response.workout_title );
						if ( response.workout_id ) {
							$('.app-wrap').attr( 'data-workout-id', response.workout_id );
						}
						init_column_focus();
						init_tabs();
						init_like();
						$('.app-wrap').removeClass( 'collapsed' );
					}, 300 );
				}
			});
		});
	},

	refresh_at = function( hours, minutes, seconds ) {
	    var now = new Date();
	    var then = new Date();

	    if(now.getHours() > hours ||
	       (now.getHours() == hours && now.getMinutes() > minutes) ||
	        now.getHours() == hours && now.getMinutes() == minutes && now.getSeconds() >= seconds) {
	        then.setDate(now.getDate() + 1);
	    }
	    then.setHours(hours);
	    then.setMinutes(minutes);
	    then.setSeconds(seconds);

	    var timeout = (then.getTime() - now.getTime());
	    setTimeout(function() { window.location.reload(true); }, timeout);
	},

	init_tabs = function() {
		$( 'a[href^="#"]' ).on( 'click', function(e) {
			e.preventDefault();
			var tab_id = $(this).attr( 'href' );
			if ( ! $( tab_id ).length ) {
				return false;
			}

			if ( $( this ).parents( '.bottom-tabs' ).length ) {
				// Activate button.
				$( '.bottom-tabs' ).find( '.active' ).removeClass( 'active' );
				$(this).addClass( 'active' );

				// Activate Tab.
				$( '.tab-container .tab-contents.active' ).removeClass( 'active' );
				$( tab_id ).addClass( 'active' );
			} else if ( $( this ).parents( '.workout-switch' ).length ) {
				// Activate button.
				$( '.workout-switch' ).find( '.active' ).removeClass( 'active' );
				$(this).addClass( 'active' );

				// Activate Tab.
				$( '.workout-container .workout-content.active' ).removeClass( 'active' );
				$( tab_id ).addClass( 'active' );
			}
		});
	},

	init_swipe = function() {
		$( '#workouts' ).swipe({
			swipeLeft: function() {
				$( '.next-workout' ).trigger( 'click' );
			},
			swipeRight: function() {
				$( '.prev-workout' ).trigger( 'click' );
			}
		});
	},

	init_like = function() {
		// how many milliseconds is a long press?
		var longpress = 1000;
		// holds the start time.
		var start;
		// Interval for displaying reveal.
		var reveal_interval;
		// How long to show like action.
		var display_like = 500;

		if ( ! $('.app-wrap').attr( 'data-workout-id' ) ) {
			return;
		}

		function reveal_like_spinner() {
			if ( $( '.like-spinner' ).length ) {
				$( '.like-spinner' ).remove();
			}
			var $like_spinner = $('<div />').addClass( 'like-spinner' );
			$like_spinner.html( '<div class="sk-folding-cube"><div class="sk-cube1 sk-cube"></div><div class="sk-cube2 sk-cube"></div><div class="sk-cube4 sk-cube"></div><div class="sk-cube3 sk-cube"></div></div>' );

			$( '#workouts' ).prepend( $like_spinner );
			do_like();
		}

		function do_like () {
			var workout_id = $('.app-wrap').attr( 'data-workout-id' );
			if ( ! workout_id ) {
				return false;
			}
			$.ajax({
				url: joncsi_vars.ajax_url,
				data: { action: 'joncsi_like_workout', workout_id: workout_id },
				type: 'post',
				success: function( response ) {
					var $like_spinner = $( '.like-spinner' );
					if ( response.liked ) {
						$('.heart-icon').addClass( 'filled' );
						$like_spinner.addClass( 'liked' );
					} else {
						$('.heart-icon').removeClass( 'filled' );
						$like_spinner.addClass( 'disliked' );
					}

					setTimeout( function(){
						$like_spinner.addClass( 'hide' );
					}, display_like );

					setTimeout( function(){
						$like_spinner.remove();
					}, display_like + 600 );
				}
			});
		}

		$('.heart-icon').off( 'click' ).on( 'click', function(e){
			e.preventDefault();
			reveal_like_spinner();
		});

		/*
		$( '#workouts' ).off( 'mousedown' ).on( 'mousedown', function( e ) {
			start = new Date().getTime();
			reveal_interval = setInterval(function(){
				if ( new Date().getTime() >= ( start + longpress ) ) {
					reveal_like_spinner();
				}
			}, 100 );
		}).off( 'mouseleave' ).on( 'mouseleave', function( e ) {
			$( '.like-spinner' ).remove();
			start = 0;
			clearInterval( reveal_interval );
		}).off( 'mouseup' ).on( 'mouseup', function( e ) {
			if ( new Date().getTime() < ( start + longpress ) ) {
				$( '.like-spinner' ).remove();
			}
			start = 0;
			clearInterval( reveal_interval );
		} );
		*/
	},

	/**
	 * Fire events on document ready, and bind other events.
	 *
	 * @since 0.1.0
	 */
	ready = function () {
		//init_textfill();
		init_clock();
		init_column_focus();
		init_workout_controls();
		refresh_at( 2,5,0 ); // Refresh the page at 2:05am
		refresh_at( 2,10,0 ); // Refresh the page at 2:10am

		init_tabs();
		init_swipe();
		init_like();
	};

	// Only expose the ready function to the world
	return {
		ready: ready
	};

})(jQuery);

jQuery( joncsi.ready );
