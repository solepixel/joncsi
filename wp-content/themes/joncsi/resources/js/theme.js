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

/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

;(function( $ ){

    'use strict';

    $.fn.fitVids = function( options ) {
        var settings = {
            customSelector: null,
            ignore: null
        };

        if(!document.getElementById('fit-vids-style')) {
            // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
            var head = document.head || document.getElementsByTagName('head')[0];
            var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
            var div = document.createElement("div");
            div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
            head.appendChild(div.childNodes[1]);
        }

        if ( options ) {
            $.extend( settings, options );
        }

        return this.each(function(){
            var selectors = [
                'iframe[src*="player.vimeo.com"]',
                'iframe[src*="youtube.com"]',
                'iframe[src*="youtube-nocookie.com"]',
                'iframe[src*="kickstarter.com"][src*="video.html"]',
                'object',
                'embed'
            ];

            if (settings.customSelector) {
                selectors.push(settings.customSelector);
            }

            var ignoreList = '.fitvidsignore';

            if(settings.ignore) {
                ignoreList = ignoreList + ', ' + settings.ignore;
            }

            var $allVideos = $(this).find(selectors.join(','));
            $allVideos = $allVideos.not('object object'); // SwfObj conflict patch
            $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

            $allVideos.each(function(){
                var $this = $(this);
                if($this.parents(ignoreList).length > 0) {
                    return; // Disable FitVids on this video.
                }
                if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
                if ((!$this.css('height') && !$this.css('width')) && (isNaN($this.attr('height')) || isNaN($this.attr('width'))))
                {
                    $this.attr('height', 9);
                    $this.attr('width', 16);
                }
                var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
                    width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
                    aspectRatio = height / width;
                if(!$this.attr('name')){
                    var videoName = 'fitvid' + $.fn.fitVids._count;
                    $this.attr('name', videoName);
                    $.fn.fitVids._count++;
                }
                $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+'%');
                $this.removeAttr('height').removeAttr('width');
            });
        });
    };

    // Internal counter for unique video names.
    $.fn.fitVids._count = 0;

// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );
/*!
 * @fileOverview TouchSwipe - jQuery Plugin
 * @version 1.6.18
 *
 * @author Matt Bryson http://www.github.com/mattbryson
 * @see https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
 * @see http://labs.rampinteractive.co.uk/touchSwipe/
 * @see http://plugins.jquery.com/project/touchSwipe
 * @license
 * Copyright (c) 2010-2015 Matt Bryson
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */

!function(factory){"function"==typeof define&&define.amd&&define.amd.jQuery?define(["jquery"],factory):factory("undefined"!=typeof module&&module.exports?require("jquery"):jQuery)}(function($){"use strict";function init(options){return!options||void 0!==options.allowPageScroll||void 0===options.swipe&&void 0===options.swipeStatus||(options.allowPageScroll=NONE),void 0!==options.click&&void 0===options.tap&&(options.tap=options.click),options||(options={}),options=$.extend({},$.fn.swipe.defaults,options),this.each(function(){var $this=$(this),plugin=$this.data(PLUGIN_NS);plugin||(plugin=new TouchSwipe(this,options),$this.data(PLUGIN_NS,plugin))})}function TouchSwipe(element,options){function touchStart(jqEvent){if(!(getTouchInProgress()||$(jqEvent.target).closest(options.excludedElements,$element).length>0)){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(!event.pointerType||"mouse"!=event.pointerType||0!=options.fallbackToMouseEvents){var ret,touches=event.touches,evt=touches?touches[0]:event;return phase=PHASE_START,touches?fingerCount=touches.length:options.preventDefaultEvents!==!1&&jqEvent.preventDefault(),distance=0,direction=null,currentDirection=null,pinchDirection=null,duration=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,pinchDistance=0,maximumsMap=createMaximumsData(),cancelMultiFingerRelease(),createFingerData(0,evt),!touches||fingerCount===options.fingers||options.fingers===ALL_FINGERS||hasPinches()?(startTime=getTimeStamp(),2==fingerCount&&(createFingerData(1,touches[1]),startTouchesDistance=endTouchesDistance=calculateTouchesDistance(fingerData[0].start,fingerData[1].start)),(options.swipeStatus||options.pinchStatus)&&(ret=triggerHandler(event,phase))):ret=!1,ret===!1?(phase=PHASE_CANCEL,triggerHandler(event,phase),ret):(options.hold&&(holdTimeout=setTimeout($.proxy(function(){$element.trigger("hold",[event.target]),options.hold&&(ret=options.hold.call($element,event,event.target))},this),options.longTapThreshold)),setTouchInProgress(!0),null)}}}function touchMove(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(phase!==PHASE_END&&phase!==PHASE_CANCEL&&!inMultiFingerRelease()){var ret,touches=event.touches,evt=touches?touches[0]:event,currentFinger=updateFingerData(evt);if(endTime=getTimeStamp(),touches&&(fingerCount=touches.length),options.hold&&clearTimeout(holdTimeout),phase=PHASE_MOVE,2==fingerCount&&(0==startTouchesDistance?(createFingerData(1,touches[1]),startTouchesDistance=endTouchesDistance=calculateTouchesDistance(fingerData[0].start,fingerData[1].start)):(updateFingerData(touches[1]),endTouchesDistance=calculateTouchesDistance(fingerData[0].end,fingerData[1].end),pinchDirection=calculatePinchDirection(fingerData[0].end,fingerData[1].end)),pinchZoom=calculatePinchZoom(startTouchesDistance,endTouchesDistance),pinchDistance=Math.abs(startTouchesDistance-endTouchesDistance)),fingerCount===options.fingers||options.fingers===ALL_FINGERS||!touches||hasPinches()){if(direction=calculateDirection(currentFinger.start,currentFinger.end),currentDirection=calculateDirection(currentFinger.last,currentFinger.end),validateDefaultEvent(jqEvent,currentDirection),distance=calculateDistance(currentFinger.start,currentFinger.end),duration=calculateDuration(),setMaxDistance(direction,distance),ret=triggerHandler(event,phase),!options.triggerOnTouchEnd||options.triggerOnTouchLeave){var inBounds=!0;if(options.triggerOnTouchLeave){var bounds=getbounds(this);inBounds=isInBounds(currentFinger.end,bounds)}!options.triggerOnTouchEnd&&inBounds?phase=getNextPhase(PHASE_MOVE):options.triggerOnTouchLeave&&!inBounds&&(phase=getNextPhase(PHASE_END)),phase!=PHASE_CANCEL&&phase!=PHASE_END||triggerHandler(event,phase)}}else phase=PHASE_CANCEL,triggerHandler(event,phase);ret===!1&&(phase=PHASE_CANCEL,triggerHandler(event,phase))}}function touchEnd(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent,touches=event.touches;if(touches){if(touches.length&&!inMultiFingerRelease())return startMultiFingerRelease(event),!0;if(touches.length&&inMultiFingerRelease())return!0}return inMultiFingerRelease()&&(fingerCount=fingerCountAtRelease),endTime=getTimeStamp(),duration=calculateDuration(),didSwipeBackToCancel()||!validateSwipeDistance()?(phase=PHASE_CANCEL,triggerHandler(event,phase)):options.triggerOnTouchEnd||options.triggerOnTouchEnd===!1&&phase===PHASE_MOVE?(options.preventDefaultEvents!==!1&&jqEvent.preventDefault(),phase=PHASE_END,triggerHandler(event,phase)):!options.triggerOnTouchEnd&&hasTap()?(phase=PHASE_END,triggerHandlerForGesture(event,phase,TAP)):phase===PHASE_MOVE&&(phase=PHASE_CANCEL,triggerHandler(event,phase)),setTouchInProgress(!1),null}function touchCancel(){fingerCount=0,endTime=0,startTime=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,cancelMultiFingerRelease(),setTouchInProgress(!1)}function touchLeave(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;options.triggerOnTouchLeave&&(phase=getNextPhase(PHASE_END),triggerHandler(event,phase))}function removeListeners(){$element.unbind(START_EV,touchStart),$element.unbind(CANCEL_EV,touchCancel),$element.unbind(MOVE_EV,touchMove),$element.unbind(END_EV,touchEnd),LEAVE_EV&&$element.unbind(LEAVE_EV,touchLeave),setTouchInProgress(!1)}function getNextPhase(currentPhase){var nextPhase=currentPhase,validTime=validateSwipeTime(),validDistance=validateSwipeDistance(),didCancel=didSwipeBackToCancel();return!validTime||didCancel?nextPhase=PHASE_CANCEL:!validDistance||currentPhase!=PHASE_MOVE||options.triggerOnTouchEnd&&!options.triggerOnTouchLeave?!validDistance&&currentPhase==PHASE_END&&options.triggerOnTouchLeave&&(nextPhase=PHASE_CANCEL):nextPhase=PHASE_END,nextPhase}function triggerHandler(event,phase){var ret,touches=event.touches;return(didSwipe()||hasSwipes())&&(ret=triggerHandlerForGesture(event,phase,SWIPE)),(didPinch()||hasPinches())&&ret!==!1&&(ret=triggerHandlerForGesture(event,phase,PINCH)),didDoubleTap()&&ret!==!1?ret=triggerHandlerForGesture(event,phase,DOUBLE_TAP):didLongTap()&&ret!==!1?ret=triggerHandlerForGesture(event,phase,LONG_TAP):didTap()&&ret!==!1&&(ret=triggerHandlerForGesture(event,phase,TAP)),phase===PHASE_CANCEL&&touchCancel(event),phase===PHASE_END&&(touches?touches.length||touchCancel(event):touchCancel(event)),ret}function triggerHandlerForGesture(event,phase,gesture){var ret;if(gesture==SWIPE){if($element.trigger("swipeStatus",[phase,direction||null,distance||0,duration||0,fingerCount,fingerData,currentDirection]),options.swipeStatus&&(ret=options.swipeStatus.call($element,event,phase,direction||null,distance||0,duration||0,fingerCount,fingerData,currentDirection),ret===!1))return!1;if(phase==PHASE_END&&validateSwipe()){if(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),$element.trigger("swipe",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipe&&(ret=options.swipe.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection),ret===!1))return!1;switch(direction){case LEFT:$element.trigger("swipeLeft",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeLeft&&(ret=options.swipeLeft.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case RIGHT:$element.trigger("swipeRight",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeRight&&(ret=options.swipeRight.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case UP:$element.trigger("swipeUp",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeUp&&(ret=options.swipeUp.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case DOWN:$element.trigger("swipeDown",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeDown&&(ret=options.swipeDown.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection))}}}if(gesture==PINCH){if($element.trigger("pinchStatus",[phase,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchStatus&&(ret=options.pinchStatus.call($element,event,phase,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData),ret===!1))return!1;if(phase==PHASE_END&&validatePinch())switch(pinchDirection){case IN:$element.trigger("pinchIn",[pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchIn&&(ret=options.pinchIn.call($element,event,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData));break;case OUT:$element.trigger("pinchOut",[pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchOut&&(ret=options.pinchOut.call($element,event,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData))}}return gesture==TAP?phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),hasDoubleTap()&&!inDoubleTap()?(doubleTapStartTime=getTimeStamp(),singleTapTimeout=setTimeout($.proxy(function(){doubleTapStartTime=null,$element.trigger("tap",[event.target]),options.tap&&(ret=options.tap.call($element,event,event.target))},this),options.doubleTapThreshold)):(doubleTapStartTime=null,$element.trigger("tap",[event.target]),options.tap&&(ret=options.tap.call($element,event,event.target)))):gesture==DOUBLE_TAP?phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),doubleTapStartTime=null,$element.trigger("doubletap",[event.target]),options.doubleTap&&(ret=options.doubleTap.call($element,event,event.target))):gesture==LONG_TAP&&(phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),doubleTapStartTime=null,$element.trigger("longtap",[event.target]),options.longTap&&(ret=options.longTap.call($element,event,event.target)))),ret}function validateSwipeDistance(){var valid=!0;return null!==options.threshold&&(valid=distance>=options.threshold),valid}function didSwipeBackToCancel(){var cancelled=!1;return null!==options.cancelThreshold&&null!==direction&&(cancelled=getMaxDistance(direction)-distance>=options.cancelThreshold),cancelled}function validatePinchDistance(){return null===options.pinchThreshold||pinchDistance>=options.pinchThreshold}function validateSwipeTime(){var result;return result=!options.maxTimeThreshold||!(duration>=options.maxTimeThreshold)}function validateDefaultEvent(jqEvent,direction){if(options.preventDefaultEvents!==!1)if(options.allowPageScroll===NONE)jqEvent.preventDefault();else{var auto=options.allowPageScroll===AUTO;switch(direction){case LEFT:(options.swipeLeft&&auto||!auto&&options.allowPageScroll!=HORIZONTAL)&&jqEvent.preventDefault();break;case RIGHT:(options.swipeRight&&auto||!auto&&options.allowPageScroll!=HORIZONTAL)&&jqEvent.preventDefault();break;case UP:(options.swipeUp&&auto||!auto&&options.allowPageScroll!=VERTICAL)&&jqEvent.preventDefault();break;case DOWN:(options.swipeDown&&auto||!auto&&options.allowPageScroll!=VERTICAL)&&jqEvent.preventDefault();break;case NONE:}}}function validatePinch(){var hasCorrectFingerCount=validateFingers(),hasEndPoint=validateEndPoint(),hasCorrectDistance=validatePinchDistance();return hasCorrectFingerCount&&hasEndPoint&&hasCorrectDistance}function hasPinches(){return!!(options.pinchStatus||options.pinchIn||options.pinchOut)}function didPinch(){return!(!validatePinch()||!hasPinches())}function validateSwipe(){var hasValidTime=validateSwipeTime(),hasValidDistance=validateSwipeDistance(),hasCorrectFingerCount=validateFingers(),hasEndPoint=validateEndPoint(),didCancel=didSwipeBackToCancel(),valid=!didCancel&&hasEndPoint&&hasCorrectFingerCount&&hasValidDistance&&hasValidTime;return valid}function hasSwipes(){return!!(options.swipe||options.swipeStatus||options.swipeLeft||options.swipeRight||options.swipeUp||options.swipeDown)}function didSwipe(){return!(!validateSwipe()||!hasSwipes())}function validateFingers(){return fingerCount===options.fingers||options.fingers===ALL_FINGERS||!SUPPORTS_TOUCH}function validateEndPoint(){return 0!==fingerData[0].end.x}function hasTap(){return!!options.tap}function hasDoubleTap(){return!!options.doubleTap}function hasLongTap(){return!!options.longTap}function validateDoubleTap(){if(null==doubleTapStartTime)return!1;var now=getTimeStamp();return hasDoubleTap()&&now-doubleTapStartTime<=options.doubleTapThreshold}function inDoubleTap(){return validateDoubleTap()}function validateTap(){return(1===fingerCount||!SUPPORTS_TOUCH)&&(isNaN(distance)||distance<options.threshold)}function validateLongTap(){return duration>options.longTapThreshold&&distance<DOUBLE_TAP_THRESHOLD}function didTap(){return!(!validateTap()||!hasTap())}function didDoubleTap(){return!(!validateDoubleTap()||!hasDoubleTap())}function didLongTap(){return!(!validateLongTap()||!hasLongTap())}function startMultiFingerRelease(event){previousTouchEndTime=getTimeStamp(),fingerCountAtRelease=event.touches.length+1}function cancelMultiFingerRelease(){previousTouchEndTime=0,fingerCountAtRelease=0}function inMultiFingerRelease(){var withinThreshold=!1;if(previousTouchEndTime){var diff=getTimeStamp()-previousTouchEndTime;diff<=options.fingerReleaseThreshold&&(withinThreshold=!0)}return withinThreshold}function getTouchInProgress(){return!($element.data(PLUGIN_NS+"_intouch")!==!0)}function setTouchInProgress(val){$element&&(val===!0?($element.bind(MOVE_EV,touchMove),$element.bind(END_EV,touchEnd),LEAVE_EV&&$element.bind(LEAVE_EV,touchLeave)):($element.unbind(MOVE_EV,touchMove,!1),$element.unbind(END_EV,touchEnd,!1),LEAVE_EV&&$element.unbind(LEAVE_EV,touchLeave,!1)),$element.data(PLUGIN_NS+"_intouch",val===!0))}function createFingerData(id,evt){var f={start:{x:0,y:0},last:{x:0,y:0},end:{x:0,y:0}};return f.start.x=f.last.x=f.end.x=evt.pageX||evt.clientX,f.start.y=f.last.y=f.end.y=evt.pageY||evt.clientY,fingerData[id]=f,f}function updateFingerData(evt){var id=void 0!==evt.identifier?evt.identifier:0,f=getFingerData(id);return null===f&&(f=createFingerData(id,evt)),f.last.x=f.end.x,f.last.y=f.end.y,f.end.x=evt.pageX||evt.clientX,f.end.y=evt.pageY||evt.clientY,f}function getFingerData(id){return fingerData[id]||null}function setMaxDistance(direction,distance){direction!=NONE&&(distance=Math.max(distance,getMaxDistance(direction)),maximumsMap[direction].distance=distance)}function getMaxDistance(direction){if(maximumsMap[direction])return maximumsMap[direction].distance}function createMaximumsData(){var maxData={};return maxData[LEFT]=createMaximumVO(LEFT),maxData[RIGHT]=createMaximumVO(RIGHT),maxData[UP]=createMaximumVO(UP),maxData[DOWN]=createMaximumVO(DOWN),maxData}function createMaximumVO(dir){return{direction:dir,distance:0}}function calculateDuration(){return endTime-startTime}function calculateTouchesDistance(startPoint,endPoint){var diffX=Math.abs(startPoint.x-endPoint.x),diffY=Math.abs(startPoint.y-endPoint.y);return Math.round(Math.sqrt(diffX*diffX+diffY*diffY))}function calculatePinchZoom(startDistance,endDistance){var percent=endDistance/startDistance*1;return percent.toFixed(2)}function calculatePinchDirection(){return pinchZoom<1?OUT:IN}function calculateDistance(startPoint,endPoint){return Math.round(Math.sqrt(Math.pow(endPoint.x-startPoint.x,2)+Math.pow(endPoint.y-startPoint.y,2)))}function calculateAngle(startPoint,endPoint){var x=startPoint.x-endPoint.x,y=endPoint.y-startPoint.y,r=Math.atan2(y,x),angle=Math.round(180*r/Math.PI);return angle<0&&(angle=360-Math.abs(angle)),angle}function calculateDirection(startPoint,endPoint){if(comparePoints(startPoint,endPoint))return NONE;var angle=calculateAngle(startPoint,endPoint);return angle<=45&&angle>=0?LEFT:angle<=360&&angle>=315?LEFT:angle>=135&&angle<=225?RIGHT:angle>45&&angle<135?DOWN:UP}function getTimeStamp(){var now=new Date;return now.getTime()}function getbounds(el){el=$(el);var offset=el.offset(),bounds={left:offset.left,right:offset.left+el.outerWidth(),top:offset.top,bottom:offset.top+el.outerHeight()};return bounds}function isInBounds(point,bounds){return point.x>bounds.left&&point.x<bounds.right&&point.y>bounds.top&&point.y<bounds.bottom}function comparePoints(pointA,pointB){return pointA.x==pointB.x&&pointA.y==pointB.y}var options=$.extend({},options),useTouchEvents=SUPPORTS_TOUCH||SUPPORTS_POINTER||!options.fallbackToMouseEvents,START_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerDown":"pointerdown":"touchstart":"mousedown",MOVE_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerMove":"pointermove":"touchmove":"mousemove",END_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerUp":"pointerup":"touchend":"mouseup",LEAVE_EV=useTouchEvents?SUPPORTS_POINTER?"mouseleave":null:"mouseleave",CANCEL_EV=SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerCancel":"pointercancel":"touchcancel",distance=0,direction=null,currentDirection=null,duration=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,pinchDistance=0,pinchDirection=0,maximumsMap=null,$element=$(element),phase="start",fingerCount=0,fingerData={},startTime=0,endTime=0,previousTouchEndTime=0,fingerCountAtRelease=0,doubleTapStartTime=0,singleTapTimeout=null,holdTimeout=null;try{$element.bind(START_EV,touchStart),$element.bind(CANCEL_EV,touchCancel)}catch(e){$.error("events not supported "+START_EV+","+CANCEL_EV+" on jQuery.swipe")}this.enable=function(){return this.disable(),$element.bind(START_EV,touchStart),$element.bind(CANCEL_EV,touchCancel),$element},this.disable=function(){return removeListeners(),$element},this.destroy=function(){removeListeners(),$element.data(PLUGIN_NS,null),$element=null},this.option=function(property,value){if("object"==typeof property)options=$.extend(options,property);else if(void 0!==options[property]){if(void 0===value)return options[property];options[property]=value}else{if(!property)return options;$.error("Option "+property+" does not exist on jQuery.swipe.options")}return null}}var VERSION="1.6.18",LEFT="left",RIGHT="right",UP="up",DOWN="down",IN="in",OUT="out",NONE="none",AUTO="auto",SWIPE="swipe",PINCH="pinch",TAP="tap",DOUBLE_TAP="doubletap",LONG_TAP="longtap",HORIZONTAL="horizontal",VERTICAL="vertical",ALL_FINGERS="all",DOUBLE_TAP_THRESHOLD=10,PHASE_START="start",PHASE_MOVE="move",PHASE_END="end",PHASE_CANCEL="cancel",SUPPORTS_TOUCH="ontouchstart"in window,SUPPORTS_POINTER_IE10=window.navigator.msPointerEnabled&&!window.PointerEvent&&!SUPPORTS_TOUCH,SUPPORTS_POINTER=(window.PointerEvent||window.navigator.msPointerEnabled)&&!SUPPORTS_TOUCH,PLUGIN_NS="TouchSwipe",defaults={fingers:1,threshold:75,cancelThreshold:null,pinchThreshold:20,maxTimeThreshold:null,fingerReleaseThreshold:250,longTapThreshold:500,doubleTapThreshold:200,swipe:null,swipeLeft:null,swipeRight:null,swipeUp:null,swipeDown:null,swipeStatus:null,pinchIn:null,pinchOut:null,pinchStatus:null,click:null,tap:null,doubleTap:null,longTap:null,hold:null,triggerOnTouchEnd:!0,triggerOnTouchLeave:!1,allowPageScroll:"auto",fallbackToMouseEvents:!0,excludedElements:".noSwipe",preventDefaultEvents:!0};$.fn.swipe=function(method){var $this=$(this),plugin=$this.data(PLUGIN_NS);if(plugin&&"string"==typeof method){if(plugin[method])return plugin[method].apply(plugin,Array.prototype.slice.call(arguments,1));$.error("Method "+method+" does not exist on jQuery.swipe")}else if(plugin&&"object"==typeof method)plugin.option.apply(plugin,arguments);else if(!(plugin||"object"!=typeof method&&method))return init.apply(this,arguments);return $this},$.fn.swipe.version=VERSION,$.fn.swipe.defaults=defaults,$.fn.swipe.phases={PHASE_START:PHASE_START,PHASE_MOVE:PHASE_MOVE,PHASE_END:PHASE_END,PHASE_CANCEL:PHASE_CANCEL},$.fn.swipe.directions={LEFT:LEFT,RIGHT:RIGHT,UP:UP,DOWN:DOWN,IN:IN,OUT:OUT},$.fn.swipe.pageScroll={NONE:NONE,HORIZONTAL:HORIZONTAL,VERTICAL:VERTICAL,AUTO:AUTO},$.fn.swipe.fingers={ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5,ALL:ALL_FINGERS}});

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
