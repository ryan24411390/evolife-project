
/*!
 * Webflow: Front-end site library
 * @license MIT
 * Inline scripts may access the api using an async handler:
 *   var Webflow = Webflow || [];
 *   Webflow.push(readyFunction);
 */

(() => { // webpackBootstrap
var __webpack_modules__ = ({
4345: (function (module, __unused_webpack_exports, __webpack_require__) {
"use strict";
/* global window, document */ /**
 * Webflow: Slider component
 */ 
var Webflow = __webpack_require__(3949);
var IXEvents = __webpack_require__(5134);
const KEY_CODES = {
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
    SPACE: 32,
    ENTER: 13,
    HOME: 36,
    END: 35
};
const FOCUSABLE_SELECTOR = 'a[href], area[href], [role="button"], input, select, textarea, button, iframe, object, embed, *[tabindex], *[contenteditable]';
Webflow.define('slider', module.exports = function($, _) {
    var api = {};
    var tram = $.tram;
    var $doc = $(document);
    var $sliders;
    var designer;
    var inApp = Webflow.env();
    var namespace = '.w-slider';
    var dot = '<div class="w-slider-dot" data-wf-ignore />';
    var ariaLiveLabelHtml = '<div aria-live="off" aria-atomic="true" class="w-slider-aria-label" data-wf-ignore />';
    var forceShow = 'w-slider-force-show';
    var ix = IXEvents.triggers;
    var fallback;
    var inRedraw = false;
    // -----------------------------------
    // Module methods
    api.ready = function() {
        designer = Webflow.env('design');
        init();
    };
    api.design = function() {
        designer = true;
        // Helps slider init on Designer load.
        setTimeout(init, 1000);
    };
    api.preview = function() {
        designer = false;
        init();
    };
    api.redraw = function() {
        inRedraw = true;
        init();
        inRedraw = false;
    };
    api.destroy = removeListeners;
    // -----------------------------------
    // Private methods
    function init() {
        // Find all sliders on the page
        $sliders = $doc.find(namespace);
        if (!$sliders.length) {
            return;
        }
        $sliders.each(build);
        if (fallback) {
            return;
        }
        removeListeners();
        addListeners();
    }
    function removeListeners() {
        Webflow.resize.off(renderAll);
        Webflow.redraw.off(api.redraw);
    }
    function addListeners() {
        Webflow.resize.on(renderAll);
        Webflow.redraw.on(api.redraw);
    }
    function renderAll() {
        $sliders.filter(':visible').each(render);
    }
    function build(i, el) {
        var $el = $(el);
        // Store slider state in data
        var data = $.data(el, namespace);
        if (!data) {
            data = $.data(el, namespace, {
                index: 0,
                depth: 1,
                hasFocus: {
                    keyboard: false,
                    mouse: false
                },
                el: $el,
                config: {}
            });
        }
        data.mask = $el.children('.w-slider-mask');
        data.left = $el.children('.w-slider-arrow-left');
        data.right = $el.children('.w-slider-arrow-right');
        data.nav = $el.children('.w-slider-nav');
        data.slides = data.mask.children('.w-slide');
        data.slides.each(ix.reset);
        if (inRedraw) {
            data.maskWidth = 0;
        }
        if ($el.attr('role') === undefined) {
            $el.attr('role', 'region');
        }
        if ($el.attr('aria-label') === undefined) {
            $el.attr('aria-label', 'carousel');
        }
        // Store the ID of the slider slide view mask
        var slideViewId = data.mask.attr('id');
        // If user did not provide an ID, set it
        if (!slideViewId) {
            slideViewId = 'w-slider-mask-' + i;
            data.mask.attr('id', slideViewId);
        }
        // Create aria live label
        if (!designer && !data.ariaLiveLabel) {
            data.ariaLiveLabel = $(ariaLiveLabelHtml).appendTo(data.mask);
        }
        // Add attributes to left/right buttons
        data.left.attr('role', 'button');
        data.left.attr('tabindex', '0');
        data.left.attr('aria-controls', slideViewId);
        if (data.left.attr('aria-label') === undefined) {
            data.left.attr('aria-label', 'previous slide');
        }
        data.right.attr('role', 'button');
        data.right.attr('tabindex', '0');
        data.right.attr('aria-controls', slideViewId);
        if (data.right.attr('aria-label') === undefined) {
            data.right.attr('aria-label', 'next slide');
        }
        // Disable in old browsers
        if (!tram.support.transform) {
            data.left.hide();
            data.right.hide();
            data.nav.hide();
            fallback = true;
            return;
        }
        // Remove old events
        data.el.off(namespace);
        data.left.off(namespace);
        data.right.off(namespace);
        data.nav.off(namespace);
        // Set config from data attributes
        configure(data);
        // Add events based on mode
        if (designer) {
            data.el.on('setting' + namespace, handler(data));
            stopTimer(data);
            data.hasTimer = false;
        } else {
            data.el.on('swipe' + namespace, handler(data));
            data.left.on('click' + namespace, previousFunction(data));
            data.right.on('click' + namespace, next(data));
            data.left.on('keydown' + namespace, keyboardSlideButtonsFunction(data, previousFunction));
            data.right.on('keydown' + namespace, keyboardSlideButtonsFunction(data, next));
            // Listen to nav keyboard events
            data.nav.on('keydown' + namespace, '> div', handler(data));
            // Start timer if autoplay is true, only once
            if (data.config.autoplay && !data.hasTimer) {
                data.hasTimer = true;
                data.timerCount = 1;
                startTimer(data);
            }
            data.el.on('mouseenter' + namespace, hasFocus(data, true, 'mouse'));
            data.el.on('focusin' + namespace, hasFocus(data, true, 'keyboard'));
            data.el.on('mouseleave' + namespace, hasFocus(data, false, 'mouse'));
            data.el.on('focusout' + namespace, hasFocus(data, false, 'keyboard'));
        }
        // Listen to nav click events
        data.nav.on('click' + namespace, '> div', handler(data));
        // Remove gaps from formatted html (for inline-blocks)
        if (!inApp) {
            data.mask.contents().filter(function() {
                return this.nodeType === 3;
            }).remove();
        }
        // If slider or any parent is hidden, temporarily show for measurements (https://github.com/webflow/webflow/issues/24921)
        var $elHidden = $el.filter(':hidden');
        $elHidden.addClass(forceShow);
        var $elHiddenParents = $el.parents(':hidden');
        $elHiddenParents.addClass(forceShow);
        // Run first render
        if (!inRedraw) {
            render(i, el);
        }
        // If slider or any parent is hidden, reset after temporarily showing for measurements
        $elHidden.removeClass(forceShow);
        $elHiddenParents.removeClass(forceShow);
    }
    function configure(data) {
        var config = {};
        config.crossOver = 0;
        // Set config options from data attributes
        config.animation = data.el.attr('data-animation') || 'slide';
        if (config.animation === 'outin') {
            config.animation = 'cross';
            config.crossOver = 0.5;
        }
        config.easing = data.el.attr('data-easing') || 'ease';
        var duration = data.el.attr('data-duration');
        config.duration = duration != null ? parseInt(duration, 10) : 500;
        if (isAttrTrue(data.el.attr('data-infinite'))) {
            config.infinite = true;
        }
        if (isAttrTrue(data.el.attr('data-disable-swipe'))) {
            config.disableSwipe = true;
        }
        if (isAttrTrue(data.el.attr('data-hide-arrows'))) {
            config.hideArrows = true;
        } else if (data.config.hideArrows) {
            data.left.show();
            data.right.show();
        }
        if (isAttrTrue(data.el.attr('data-autoplay'))) {
            config.autoplay = true;
            config.delay = parseInt(data.el.attr('data-delay'), 10) || 2000;
            config.timerMax = parseInt(data.el.attr('data-autoplay-limit'), 10);
            // Disable timer on first touch or mouse down
            var touchEvents = 'mousedown' + namespace + ' touchstart' + namespace;
            if (!designer) {
                data.el.off(touchEvents).one(touchEvents, function() {
                    stopTimer(data);
                });
            }
        }
        // Use edge buffer to help calculate page count
        var arrowWidth = data.right.width();
        config.edge = arrowWidth ? arrowWidth + 40 : 100;
        // Store config in data
        data.config = config;
    }
    function isAttrTrue(value) {
        return value === '1' || value === 'true';
    }
    function hasFocus(data, focusIn, eventType) {
        return function(evt) {
            if (!focusIn) {
                // Prevent Focus Out if moving to another element in the slider
                if ($.contains(data.el.get(0), evt.relatedTarget)) {
                    return;
                }
                data.hasFocus[eventType] = focusIn;
                // Prevent Aria live change if focused by other input
                if (data.hasFocus.mouse && eventType === 'keyboard' || data.hasFocus.keyboard && eventType === 'mouse') {
                    return;
                }
            } else {
                data.hasFocus[eventType] = focusIn;
            }
            if (focusIn) {
                data.ariaLiveLabel.attr('aria-live', 'polite');
                if (data.hasTimer) {
                    stopTimer(data);
                }
            } else {
                data.ariaLiveLabel.attr('aria-live', 'off');
                if (data.hasTimer) {
                    startTimer(data);
                }
            }
            return;
        };
    }
    function keyboardSlideButtonsFunction(data, directionFunction) {
        return function(evt) {
            switch(evt.keyCode){
                case KEY_CODES.SPACE:
                case KEY_CODES.ENTER:
                    {
                        // DirectionFunction returns a function
                        directionFunction(data)();
                        evt.preventDefault();
                        return evt.stopPropagation();
                    }
            }
        };
    }
    function previousFunction(data) {
        return function() {
            change(data, {
                index: data.index - 1,
                vector: -1
            });
        };
    }
    function next(data) {
        return function() {
            change(data, {
                index: data.index + 1,
                vector: 1
            });
        };
    }
    function select(data, value) {
        // Select page based on slide element index
        var found = null;
        if (value === data.slides.length) {
            init();
            layout(data); // Rebuild and find new slides
        }
        _.each(data.anchors, function(anchor, index) {
            $(anchor.els).each(function(i, el) {
                if ($(el).index() === value) {
                    found = index;
                }
            });
        });
        if (found != null) {
            change(data, {
                index: found,
                immediate: true
            });
        }
    }
    function startTimer(data) {
        stopTimer(data);
        var config = data.config;
        var timerMax = config.timerMax;
        if (timerMax && data.timerCount++ > timerMax) {
            return;
        }
        data.timerId = window.setTimeout(function() {
            if (data.timerId == null || designer) {
                return;
            }
            next(data)();
            startTimer(data);
        }, config.delay);
    }
    function stopTimer(data) {
        window.clearTimeout(data.timerId);
        data.timerId = null;
    }
    function handler(data) {
        return function(evt, options) {
            options = options || {};
            var config = data.config;
            // Designer settings
            if (designer && evt.type === 'setting') {
                if (options.select === 'prev') {
                    return previousFunction(data)();
                }
                if (options.select === 'next') {
                    return next(data)();
                }
                configure(data);
                layout(data);
                if (options.select == null) {
                    return;
                }
                select(data, options.select);
                return;
            }
            // Swipe event
            if (evt.type === 'swipe') {
                if (config.disableSwipe) {
                    return;
                }
                if (Webflow.env('editor')) {
                    return;
                }
                if (options.direction === 'left') {
                    return next(data)();
                }
                if (options.direction === 'right') {
                    return previousFunction(data)();
                }
                return;
            }
            // Page buttons
            if (data.nav.has(evt.target).length) {
                var index = $(evt.target).index();
                if (evt.type === 'click') {
                    change(data, {
                        index
                    });
                }
                if (evt.type === 'keydown') {
                    switch(evt.keyCode){
                        case KEY_CODES.ENTER:
                        case KEY_CODES.SPACE:
                            {
                                change(data, {
                                    index
                                });
                                evt.preventDefault();
                                break;
                            }
                        case KEY_CODES.ARROW_LEFT:
                        case KEY_CODES.ARROW_UP:
                            {
                                focusDot(data.nav, Math.max(index - 1, 0));
                                evt.preventDefault();
                                break;
                            }
                        case KEY_CODES.ARROW_RIGHT:
                        case KEY_CODES.ARROW_DOWN:
                            {
                                focusDot(data.nav, Math.min(index + 1, data.pages));
                                evt.preventDefault();
                                break;
                            }
                        case KEY_CODES.HOME:
                            {
                                focusDot(data.nav, 0);
                                evt.preventDefault();
                                break;
                            }
                        case KEY_CODES.END:
                            {
                                focusDot(data.nav, data.pages);
                                evt.preventDefault();
                                break;
                            }
                        default:
                            {
                                return;
                            }
                    }
                }
            }
        };
    }
    function focusDot($nav, index) {
        // Focus nav dot; don't change class to active
        var $active = $nav.children().eq(index).focus();
        $nav.children().not($active);
    }
    function change(data, options) {
        options = options || {};
        var config = data.config;
        var anchors = data.anchors;
        // Set new index
        data.previous = data.index;
        var index = options.index;
        var shift = {};
        if (index < 0) {
            index = anchors.length - 1;
            if (config.infinite) {
                // Shift first slide to the end
                shift.x = -data.endX;
                shift.from = 0;
                shift.to = anchors[0].width;
            }
        } else if (index >= anchors.length) {
            index = 0;
            if (config.infinite) {
                // Shift last slide to the start
                shift.x = anchors[anchors.length - 1].width;
                shift.from = -anchors[anchors.length - 1].x;
                shift.to = shift.from - shift.x;
            }
        }
        data.index = index;
        // Select nav dot; set class active
        var $active = data.nav.children().eq(index).addClass('w-active').attr('aria-pressed', 'true').attr('tabindex', '0');
        data.nav.children().not($active).removeClass('w-active').attr('aria-pressed', 'false').attr('tabindex', '-1');
        // Hide arrows
        if (config.hideArrows) {
            data.index === anchors.length - 1 ? data.right.hide() : data.right.show();
            data.index === 0 ? data.left.hide() : data.left.show();
        }
        // Get page offset from anchors
        var lastOffsetX = data.offsetX || 0;
        var offsetX = data.offsetX = -anchors[data.index].x;
        var resetConfig = {
            x: offsetX,
            opacity: 1,
            visibility: ''
        };
        // Transition slides
        var targets = $(anchors[data.index].els);
        var prevTargs = $(anchors[data.previous] && anchors[data.previous].els);
        var others = data.slides.not(targets);
        var animation = config.animation;
        var easing = config.easing;
        var duration = Math.round(config.duration);
        var vector = options.vector || (data.index > data.previous ? 1 : -1);
        var fadeRule = 'opacity ' + duration + 'ms ' + easing;
        var slideRule = 'transform ' + duration + 'ms ' + easing;
        // Make active slides' content focusable
        targets.find(FOCUSABLE_SELECTOR).removeAttr('tabindex');
        targets.removeAttr('aria-hidden');
        // Voiceover bug: Sometimes descendants are still visible, so hide everything...
        targets.find('*').removeAttr('aria-hidden');
        // Prevent focus on inactive slides' content
        others.find(FOCUSABLE_SELECTOR).attr('tabindex', '-1');
        others.attr('aria-hidden', 'true');
        // Voiceover bug: Sometimes descendants are still visible, so hide everything...
        others.find('*').attr('aria-hidden', 'true');
        // Trigger IX events
        if (!designer) {
            targets.each(ix.intro);
            others.each(ix.outro);
        }
        // Set immediately after layout changes (but not during redraw)
        if (options.immediate && !inRedraw) {
            tram(targets).set(resetConfig);
            resetOthers();
            return;
        }
        // Exit early if index is unchanged
        if (data.index === data.previous) {
            return;
        }
        // Announce slide change to screen reader
        if (!designer) {
            data.ariaLiveLabel.text(`Slide ${index + 1} of ${anchors.length}.`);
        }
        // Cross Fade / Out-In
        if (animation === 'cross') {
            var reduced = Math.round(duration - duration * config.crossOver);
            var wait = Math.round(duration - reduced);
            fadeRule = 'opacity ' + reduced + 'ms ' + easing;
            tram(prevTargs).set({
                visibility: ''
            }).add(fadeRule).start({
                opacity: 0
            });
            tram(targets).set({
                visibility: '',
                x: offsetX,
                opacity: 0,
                zIndex: data.depth++
            }).add(fadeRule).wait(wait).then({
                opacity: 1
            }).then(resetOthers);
            return;
        }
        // Fade Over
        if (animation === 'fade') {
            tram(prevTargs).set({
                visibility: ''
            }).stop();
            tram(targets).set({
                visibility: '',
                x: offsetX,
                opacity: 0,
                zIndex: data.depth++
            }).add(fadeRule).start({
                opacity: 1
            }).then(resetOthers);
            return;
        }
        // Slide Over
        if (animation === 'over') {
            resetConfig = {
                x: data.endX
            };
            tram(prevTargs).set({
                visibility: ''
            }).stop();
            tram(targets).set({
                visibility: '',
                zIndex: data.depth++,
                x: offsetX + anchors[data.index].width * vector
            }).add(slideRule).start({
                x: offsetX
            }).then(resetOthers);
            return;
        }
        // Slide - infinite scroll
        if (config.infinite && shift.x) {
            tram(data.slides.not(prevTargs)).set({
                visibility: '',
                x: shift.x
            }).add(slideRule).start({
                x: offsetX
            });
            tram(prevTargs).set({
                visibility: '',
                x: shift.from
            }).add(slideRule).start({
                x: shift.to
            });
            data.shifted = prevTargs;
        } else {
            if (config.infinite && data.shifted) {
                tram(data.shifted).set({
                    visibility: '',
                    x: lastOffsetX
                });
                data.shifted = null;
            }
            // Slide - basic scroll
            tram(data.slides).set({
                visibility: ''
            }).add(slideRule).start({
                x: offsetX
            });
        }
        // Helper to move others out of view
        function resetOthers() {
            targets = $(anchors[data.index].els);
            others = data.slides.not(targets);
            if (animation !== 'slide') {
                resetConfig.visibility = 'hidden';
            }
            tram(others).set(resetConfig);
        }
    }
    function render(i, el) {
        var data = $.data(el, namespace);
        if (!data) {
            return;
        }
        if (maskChanged(data)) {
            return layout(data);
        }
        if (designer && slidesChanged(data)) {
            layout(data);
        }
    }
    function layout(data) {
        // Determine page count from width of slides
        var pages = 1;
        var offset = 0;
        var anchor = 0;
        var width = 0;
        var maskWidth = data.maskWidth;
        var threshold = maskWidth - data.config.edge;
        if (threshold < 0) {
            threshold = 0;
        }
        data.anchors = [
            {
                els: [],
                x: 0,
                width: 0
            }
        ];
        data.slides.each(function(i, el) {
            if (anchor - offset > threshold) {
                pages++;
                offset += maskWidth;
                // Store page anchor for transition
                data.anchors[pages - 1] = {
                    els: [],
                    x: anchor,
                    width: 0
                };
            }
            // Set next anchor using current width + margin
            width = $(el).outerWidth(true);
            anchor += width;
            data.anchors[pages - 1].width += width;
            data.anchors[pages - 1].els.push(el);
            var ariaLabel = i + 1 + ' of ' + data.slides.length;
            $(el).attr('aria-label', ariaLabel);
            $(el).attr('role', 'group');
        });
        data.endX = anchor;
        // Build dots if nav exists and needs updating
        if (designer) {
            data.pages = null;
        }
        if (data.nav.length && data.pages !== pages) {
            data.pages = pages;
            buildNav(data);
        }
        // Make sure index is still within range and call change handler
        var index = data.index;
        if (index >= pages) {
            index = pages - 1;
        }
        change(data, {
            immediate: true,
            index
        });
    }
    function buildNav(data) {
        var dots = [];
        var $dot;
        var spacing = data.el.attr('data-nav-spacing');
        if (spacing) {
            spacing = parseFloat(spacing) + 'px';
        }
        for(var i = 0, len = data.pages; i < len; i++){
            $dot = $(dot);
            $dot.attr('aria-label', 'Show slide ' + (i + 1) + ' of ' + len).attr('aria-pressed', 'false').attr('role', 'button').attr('tabindex', '-1');
            if (data.nav.hasClass('w-num')) {
                $dot.text(i + 1);
            }
            if (spacing != null) {
                $dot.css({
                    'margin-left': spacing,
                    'margin-right': spacing
                });
            }
            dots.push($dot);
        }
        data.nav.empty().append(dots);
    }
    function maskChanged(data) {
        var maskWidth = data.mask.width();
        if (data.maskWidth !== maskWidth) {
            data.maskWidth = maskWidth;
            return true;
        }
        return false;
    }
    function slidesChanged(data) {
        var slidesWidth = 0;
        data.slides.each(function(i, el) {
            slidesWidth += $(el).outerWidth(true);
        });
        if (data.slidesWidth !== slidesWidth) {
            data.slidesWidth = slidesWidth;
            return true;
        }
        return false;
    }
    // Export module
    return api;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYmZsb3ctc2xpZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50ICovXG5cbi8qKlxuICogV2ViZmxvdzogU2xpZGVyIGNvbXBvbmVudFxuICovXG5cbnZhciBXZWJmbG93ID0gcmVxdWlyZSgnLi4vQmFzZVNpdGVNb2R1bGVzL3dlYmZsb3ctbGliJyk7XG52YXIgSVhFdmVudHMgPSByZXF1aXJlKCcuLi9CYXNlU2l0ZU1vZHVsZXMvd2ViZmxvdy1peDItZXZlbnRzJyk7XG5cbmNvbnN0IEtFWV9DT0RFUyA9IHtcbiAgQVJST1dfTEVGVDogMzcsXG4gIEFSUk9XX1VQOiAzOCxcbiAgQVJST1dfUklHSFQ6IDM5LFxuICBBUlJPV19ET1dOOiA0MCxcbiAgU1BBQ0U6IDMyLFxuICBFTlRFUjogMTMsXG4gIEhPTUU6IDM2LFxuICBFTkQ6IDM1LFxufTtcblxuY29uc3QgRk9DVVNBQkxFX1NFTEVDVE9SID1cbiAgJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIFtyb2xlPVwiYnV0dG9uXCJdLCBpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgYnV0dG9uLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV0nO1xuXG5XZWJmbG93LmRlZmluZShcbiAgJ3NsaWRlcicsXG4gIChtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkLCBfKSB7XG4gICAgdmFyIGFwaSA9IHt9O1xuICAgIHZhciB0cmFtID0gJC50cmFtO1xuICAgIHZhciAkZG9jID0gJChkb2N1bWVudCk7XG4gICAgdmFyICRzbGlkZXJzO1xuICAgIHZhciBkZXNpZ25lcjtcbiAgICB2YXIgaW5BcHAgPSBXZWJmbG93LmVudigpO1xuICAgIHZhciBuYW1lc3BhY2UgPSAnLnctc2xpZGVyJztcbiAgICB2YXIgZG90ID0gJzxkaXYgY2xhc3M9XCJ3LXNsaWRlci1kb3RcIiBkYXRhLXdmLWlnbm9yZSAvPic7XG4gICAgdmFyIGFyaWFMaXZlTGFiZWxIdG1sID1cbiAgICAgICc8ZGl2IGFyaWEtbGl2ZT1cIm9mZlwiIGFyaWEtYXRvbWljPVwidHJ1ZVwiIGNsYXNzPVwidy1zbGlkZXItYXJpYS1sYWJlbFwiIGRhdGEtd2YtaWdub3JlIC8+JztcbiAgICB2YXIgZm9yY2VTaG93ID0gJ3ctc2xpZGVyLWZvcmNlLXNob3cnO1xuICAgIHZhciBpeCA9IElYRXZlbnRzLnRyaWdnZXJzO1xuICAgIHZhciBmYWxsYmFjaztcbiAgICB2YXIgaW5SZWRyYXcgPSBmYWxzZTtcblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTW9kdWxlIG1ldGhvZHNcblxuICAgIGFwaS5yZWFkeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGRlc2lnbmVyID0gV2ViZmxvdy5lbnYoJ2Rlc2lnbicpO1xuICAgICAgaW5pdCgpO1xuICAgIH07XG5cbiAgICBhcGkuZGVzaWduID0gZnVuY3Rpb24gKCkge1xuICAgICAgZGVzaWduZXIgPSB0cnVlO1xuICAgICAgLy8gSGVscHMgc2xpZGVyIGluaXQgb24gRGVzaWduZXIgbG9hZC5cbiAgICAgIHNldFRpbWVvdXQoaW5pdCwgMTAwMCk7XG4gICAgfTtcblxuICAgIGFwaS5wcmV2aWV3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgZGVzaWduZXIgPSBmYWxzZTtcbiAgICAgIGluaXQoKTtcbiAgICB9O1xuXG4gICAgYXBpLnJlZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGluUmVkcmF3ID0gdHJ1ZTtcbiAgICAgIGluaXQoKTtcbiAgICAgIGluUmVkcmF3ID0gZmFsc2U7XG4gICAgfTtcblxuICAgIGFwaS5kZXN0cm95ID0gcmVtb3ZlTGlzdGVuZXJzO1xuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBQcml2YXRlIG1ldGhvZHNcblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAvLyBGaW5kIGFsbCBzbGlkZXJzIG9uIHRoZSBwYWdlXG4gICAgICAkc2xpZGVycyA9ICRkb2MuZmluZChuYW1lc3BhY2UpO1xuICAgICAgaWYgKCEkc2xpZGVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgJHNsaWRlcnMuZWFjaChidWlsZCk7XG4gICAgICBpZiAoZmFsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICAgIGFkZExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycygpIHtcbiAgICAgIFdlYmZsb3cucmVzaXplLm9mZihyZW5kZXJBbGwpO1xuICAgICAgV2ViZmxvdy5yZWRyYXcub2ZmKGFwaS5yZWRyYXcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZExpc3RlbmVycygpIHtcbiAgICAgIFdlYmZsb3cucmVzaXplLm9uKHJlbmRlckFsbCk7XG4gICAgICBXZWJmbG93LnJlZHJhdy5vbihhcGkucmVkcmF3KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJBbGwoKSB7XG4gICAgICAkc2xpZGVycy5maWx0ZXIoJzp2aXNpYmxlJykuZWFjaChyZW5kZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1aWxkKGksIGVsKSB7XG4gICAgICB2YXIgJGVsID0gJChlbCk7XG5cbiAgICAgIC8vIFN0b3JlIHNsaWRlciBzdGF0ZSBpbiBkYXRhXG4gICAgICB2YXIgZGF0YSA9ICQuZGF0YShlbCwgbmFtZXNwYWNlKTtcbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICBkYXRhID0gJC5kYXRhKGVsLCBuYW1lc3BhY2UsIHtcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICBoYXNGb2N1czoge1xuICAgICAgICAgICAga2V5Ym9hcmQ6IGZhbHNlLFxuICAgICAgICAgICAgbW91c2U6IGZhbHNlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZWw6ICRlbCxcbiAgICAgICAgICBjb25maWc6IHt9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGRhdGEubWFzayA9ICRlbC5jaGlsZHJlbignLnctc2xpZGVyLW1hc2snKTtcbiAgICAgIGRhdGEubGVmdCA9ICRlbC5jaGlsZHJlbignLnctc2xpZGVyLWFycm93LWxlZnQnKTtcbiAgICAgIGRhdGEucmlnaHQgPSAkZWwuY2hpbGRyZW4oJy53LXNsaWRlci1hcnJvdy1yaWdodCcpO1xuICAgICAgZGF0YS5uYXYgPSAkZWwuY2hpbGRyZW4oJy53LXNsaWRlci1uYXYnKTtcbiAgICAgIGRhdGEuc2xpZGVzID0gZGF0YS5tYXNrLmNoaWxkcmVuKCcudy1zbGlkZScpO1xuICAgICAgZGF0YS5zbGlkZXMuZWFjaChpeC5yZXNldCk7XG4gICAgICBpZiAoaW5SZWRyYXcpIHtcbiAgICAgICAgZGF0YS5tYXNrV2lkdGggPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGVsLmF0dHIoJ3JvbGUnKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICRlbC5hdHRyKCdyb2xlJywgJ3JlZ2lvbicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGVsLmF0dHIoJ2FyaWEtbGFiZWwnKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICRlbC5hdHRyKCdhcmlhLWxhYmVsJywgJ2Nhcm91c2VsJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBJRCBvZiB0aGUgc2xpZGVyIHNsaWRlIHZpZXcgbWFza1xuICAgICAgdmFyIHNsaWRlVmlld0lkID0gZGF0YS5tYXNrLmF0dHIoJ2lkJyk7XG5cbiAgICAgIC8vIElmIHVzZXIgZGlkIG5vdCBwcm92aWRlIGFuIElELCBzZXQgaXRcbiAgICAgIGlmICghc2xpZGVWaWV3SWQpIHtcbiAgICAgICAgc2xpZGVWaWV3SWQgPSAndy1zbGlkZXItbWFzay0nICsgaTtcbiAgICAgICAgZGF0YS5tYXNrLmF0dHIoJ2lkJywgc2xpZGVWaWV3SWQpO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYXJpYSBsaXZlIGxhYmVsXG4gICAgICBpZiAoIWRlc2lnbmVyICYmICFkYXRhLmFyaWFMaXZlTGFiZWwpIHtcbiAgICAgICAgZGF0YS5hcmlhTGl2ZUxhYmVsID0gJChhcmlhTGl2ZUxhYmVsSHRtbCkuYXBwZW5kVG8oZGF0YS5tYXNrKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGF0dHJpYnV0ZXMgdG8gbGVmdC9yaWdodCBidXR0b25zXG4gICAgICBkYXRhLmxlZnQuYXR0cigncm9sZScsICdidXR0b24nKTtcbiAgICAgIGRhdGEubGVmdC5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICBkYXRhLmxlZnQuYXR0cignYXJpYS1jb250cm9scycsIHNsaWRlVmlld0lkKTtcbiAgICAgIGlmIChkYXRhLmxlZnQuYXR0cignYXJpYS1sYWJlbCcpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGF0YS5sZWZ0LmF0dHIoJ2FyaWEtbGFiZWwnLCAncHJldmlvdXMgc2xpZGUnKTtcbiAgICAgIH1cblxuICAgICAgZGF0YS5yaWdodC5hdHRyKCdyb2xlJywgJ2J1dHRvbicpO1xuICAgICAgZGF0YS5yaWdodC5hdHRyKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICBkYXRhLnJpZ2h0LmF0dHIoJ2FyaWEtY29udHJvbHMnLCBzbGlkZVZpZXdJZCk7XG4gICAgICBpZiAoZGF0YS5yaWdodC5hdHRyKCdhcmlhLWxhYmVsJykgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhLnJpZ2h0LmF0dHIoJ2FyaWEtbGFiZWwnLCAnbmV4dCBzbGlkZScpO1xuICAgICAgfVxuXG4gICAgICAvLyBEaXNhYmxlIGluIG9sZCBicm93c2Vyc1xuICAgICAgaWYgKCF0cmFtLnN1cHBvcnQudHJhbnNmb3JtKSB7XG4gICAgICAgIGRhdGEubGVmdC5oaWRlKCk7XG4gICAgICAgIGRhdGEucmlnaHQuaGlkZSgpO1xuICAgICAgICBkYXRhLm5hdi5oaWRlKCk7XG4gICAgICAgIGZhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgb2xkIGV2ZW50c1xuICAgICAgZGF0YS5lbC5vZmYobmFtZXNwYWNlKTtcbiAgICAgIGRhdGEubGVmdC5vZmYobmFtZXNwYWNlKTtcbiAgICAgIGRhdGEucmlnaHQub2ZmKG5hbWVzcGFjZSk7XG4gICAgICBkYXRhLm5hdi5vZmYobmFtZXNwYWNlKTtcblxuICAgICAgLy8gU2V0IGNvbmZpZyBmcm9tIGRhdGEgYXR0cmlidXRlc1xuICAgICAgY29uZmlndXJlKGRhdGEpO1xuXG4gICAgICAvLyBBZGQgZXZlbnRzIGJhc2VkIG9uIG1vZGVcbiAgICAgIGlmIChkZXNpZ25lcikge1xuICAgICAgICBkYXRhLmVsLm9uKCdzZXR0aW5nJyArIG5hbWVzcGFjZSwgaGFuZGxlcihkYXRhKSk7XG4gICAgICAgIHN0b3BUaW1lcihkYXRhKTtcbiAgICAgICAgZGF0YS5oYXNUaW1lciA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YS5lbC5vbignc3dpcGUnICsgbmFtZXNwYWNlLCBoYW5kbGVyKGRhdGEpKTtcbiAgICAgICAgZGF0YS5sZWZ0Lm9uKCdjbGljaycgKyBuYW1lc3BhY2UsIHByZXZpb3VzRnVuY3Rpb24oZGF0YSkpO1xuICAgICAgICBkYXRhLnJpZ2h0Lm9uKCdjbGljaycgKyBuYW1lc3BhY2UsIG5leHQoZGF0YSkpO1xuXG4gICAgICAgIGRhdGEubGVmdC5vbihcbiAgICAgICAgICAna2V5ZG93bicgKyBuYW1lc3BhY2UsXG4gICAgICAgICAga2V5Ym9hcmRTbGlkZUJ1dHRvbnNGdW5jdGlvbihkYXRhLCBwcmV2aW91c0Z1bmN0aW9uKVxuICAgICAgICApO1xuICAgICAgICBkYXRhLnJpZ2h0Lm9uKFxuICAgICAgICAgICdrZXlkb3duJyArIG5hbWVzcGFjZSxcbiAgICAgICAgICBrZXlib2FyZFNsaWRlQnV0dG9uc0Z1bmN0aW9uKGRhdGEsIG5leHQpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gTGlzdGVuIHRvIG5hdiBrZXlib2FyZCBldmVudHNcbiAgICAgICAgZGF0YS5uYXYub24oJ2tleWRvd24nICsgbmFtZXNwYWNlLCAnPiBkaXYnLCBoYW5kbGVyKGRhdGEpKTtcblxuICAgICAgICAvLyBTdGFydCB0aW1lciBpZiBhdXRvcGxheSBpcyB0cnVlLCBvbmx5IG9uY2VcbiAgICAgICAgaWYgKGRhdGEuY29uZmlnLmF1dG9wbGF5ICYmICFkYXRhLmhhc1RpbWVyKSB7XG4gICAgICAgICAgZGF0YS5oYXNUaW1lciA9IHRydWU7XG4gICAgICAgICAgZGF0YS50aW1lckNvdW50ID0gMTtcbiAgICAgICAgICBzdGFydFRpbWVyKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5lbC5vbignbW91c2VlbnRlcicgKyBuYW1lc3BhY2UsIGhhc0ZvY3VzKGRhdGEsIHRydWUsICdtb3VzZScpKTtcbiAgICAgICAgZGF0YS5lbC5vbignZm9jdXNpbicgKyBuYW1lc3BhY2UsIGhhc0ZvY3VzKGRhdGEsIHRydWUsICdrZXlib2FyZCcpKTtcbiAgICAgICAgZGF0YS5lbC5vbignbW91c2VsZWF2ZScgKyBuYW1lc3BhY2UsIGhhc0ZvY3VzKGRhdGEsIGZhbHNlLCAnbW91c2UnKSk7XG4gICAgICAgIGRhdGEuZWwub24oJ2ZvY3Vzb3V0JyArIG5hbWVzcGFjZSwgaGFzRm9jdXMoZGF0YSwgZmFsc2UsICdrZXlib2FyZCcpKTtcbiAgICAgIH1cblxuICAgICAgLy8gTGlzdGVuIHRvIG5hdiBjbGljayBldmVudHNcbiAgICAgIGRhdGEubmF2Lm9uKCdjbGljaycgKyBuYW1lc3BhY2UsICc+IGRpdicsIGhhbmRsZXIoZGF0YSkpO1xuXG4gICAgICAvLyBSZW1vdmUgZ2FwcyBmcm9tIGZvcm1hdHRlZCBodG1sIChmb3IgaW5saW5lLWJsb2NrcylcbiAgICAgIGlmICghaW5BcHApIHtcbiAgICAgICAgZGF0YS5tYXNrXG4gICAgICAgICAgLmNvbnRlbnRzKClcbiAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5vZGVUeXBlID09PSAzO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBzbGlkZXIgb3IgYW55IHBhcmVudCBpcyBoaWRkZW4sIHRlbXBvcmFyaWx5IHNob3cgZm9yIG1lYXN1cmVtZW50cyAoaHR0cHM6Ly9naXRodWIuY29tL3dlYmZsb3cvd2ViZmxvdy9pc3N1ZXMvMjQ5MjEpXG4gICAgICB2YXIgJGVsSGlkZGVuID0gJGVsLmZpbHRlcignOmhpZGRlbicpO1xuICAgICAgJGVsSGlkZGVuLmFkZENsYXNzKGZvcmNlU2hvdyk7XG4gICAgICB2YXIgJGVsSGlkZGVuUGFyZW50cyA9ICRlbC5wYXJlbnRzKCc6aGlkZGVuJyk7XG4gICAgICAkZWxIaWRkZW5QYXJlbnRzLmFkZENsYXNzKGZvcmNlU2hvdyk7XG5cbiAgICAgIC8vIFJ1biBmaXJzdCByZW5kZXJcbiAgICAgIGlmICghaW5SZWRyYXcpIHtcbiAgICAgICAgcmVuZGVyKGksIGVsKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgc2xpZGVyIG9yIGFueSBwYXJlbnQgaXMgaGlkZGVuLCByZXNldCBhZnRlciB0ZW1wb3JhcmlseSBzaG93aW5nIGZvciBtZWFzdXJlbWVudHNcbiAgICAgICRlbEhpZGRlbi5yZW1vdmVDbGFzcyhmb3JjZVNob3cpO1xuICAgICAgJGVsSGlkZGVuUGFyZW50cy5yZW1vdmVDbGFzcyhmb3JjZVNob3cpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbmZpZ3VyZShkYXRhKSB7XG4gICAgICB2YXIgY29uZmlnID0ge307XG5cbiAgICAgIGNvbmZpZy5jcm9zc092ZXIgPSAwO1xuXG4gICAgICAvLyBTZXQgY29uZmlnIG9wdGlvbnMgZnJvbSBkYXRhIGF0dHJpYnV0ZXNcbiAgICAgIGNvbmZpZy5hbmltYXRpb24gPSBkYXRhLmVsLmF0dHIoJ2RhdGEtYW5pbWF0aW9uJykgfHwgJ3NsaWRlJztcbiAgICAgIGlmIChjb25maWcuYW5pbWF0aW9uID09PSAnb3V0aW4nKSB7XG4gICAgICAgIGNvbmZpZy5hbmltYXRpb24gPSAnY3Jvc3MnO1xuICAgICAgICBjb25maWcuY3Jvc3NPdmVyID0gMC41O1xuICAgICAgfVxuICAgICAgY29uZmlnLmVhc2luZyA9IGRhdGEuZWwuYXR0cignZGF0YS1lYXNpbmcnKSB8fCAnZWFzZSc7XG5cbiAgICAgIHZhciBkdXJhdGlvbiA9IGRhdGEuZWwuYXR0cignZGF0YS1kdXJhdGlvbicpO1xuICAgICAgY29uZmlnLmR1cmF0aW9uID0gZHVyYXRpb24gIT0gbnVsbCA/IHBhcnNlSW50KGR1cmF0aW9uLCAxMCkgOiA1MDA7XG5cbiAgICAgIGlmIChpc0F0dHJUcnVlKGRhdGEuZWwuYXR0cignZGF0YS1pbmZpbml0ZScpKSkge1xuICAgICAgICBjb25maWcuaW5maW5pdGUgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNBdHRyVHJ1ZShkYXRhLmVsLmF0dHIoJ2RhdGEtZGlzYWJsZS1zd2lwZScpKSkge1xuICAgICAgICBjb25maWcuZGlzYWJsZVN3aXBlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXR0clRydWUoZGF0YS5lbC5hdHRyKCdkYXRhLWhpZGUtYXJyb3dzJykpKSB7XG4gICAgICAgIGNvbmZpZy5oaWRlQXJyb3dzID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jb25maWcuaGlkZUFycm93cykge1xuICAgICAgICBkYXRhLmxlZnQuc2hvdygpO1xuICAgICAgICBkYXRhLnJpZ2h0LnNob3coKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXR0clRydWUoZGF0YS5lbC5hdHRyKCdkYXRhLWF1dG9wbGF5JykpKSB7XG4gICAgICAgIGNvbmZpZy5hdXRvcGxheSA9IHRydWU7XG4gICAgICAgIGNvbmZpZy5kZWxheSA9IHBhcnNlSW50KGRhdGEuZWwuYXR0cignZGF0YS1kZWxheScpLCAxMCkgfHwgMjAwMDtcbiAgICAgICAgY29uZmlnLnRpbWVyTWF4ID0gcGFyc2VJbnQoZGF0YS5lbC5hdHRyKCdkYXRhLWF1dG9wbGF5LWxpbWl0JyksIDEwKTtcbiAgICAgICAgLy8gRGlzYWJsZSB0aW1lciBvbiBmaXJzdCB0b3VjaCBvciBtb3VzZSBkb3duXG4gICAgICAgIHZhciB0b3VjaEV2ZW50cyA9ICdtb3VzZWRvd24nICsgbmFtZXNwYWNlICsgJyB0b3VjaHN0YXJ0JyArIG5hbWVzcGFjZTtcbiAgICAgICAgaWYgKCFkZXNpZ25lcikge1xuICAgICAgICAgIGRhdGEuZWwub2ZmKHRvdWNoRXZlbnRzKS5vbmUodG91Y2hFdmVudHMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHN0b3BUaW1lcihkYXRhKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBVc2UgZWRnZSBidWZmZXIgdG8gaGVscCBjYWxjdWxhdGUgcGFnZSBjb3VudFxuICAgICAgdmFyIGFycm93V2lkdGggPSBkYXRhLnJpZ2h0LndpZHRoKCk7XG4gICAgICBjb25maWcuZWRnZSA9IGFycm93V2lkdGggPyBhcnJvd1dpZHRoICsgNDAgOiAxMDA7XG5cbiAgICAgIC8vIFN0b3JlIGNvbmZpZyBpbiBkYXRhXG4gICAgICBkYXRhLmNvbmZpZyA9IGNvbmZpZztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0F0dHJUcnVlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09ICcxJyB8fCB2YWx1ZSA9PT0gJ3RydWUnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc0ZvY3VzKGRhdGEsIGZvY3VzSW4sIGV2ZW50VHlwZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgaWYgKCFmb2N1c0luKSB7XG4gICAgICAgICAgLy8gUHJldmVudCBGb2N1cyBPdXQgaWYgbW92aW5nIHRvIGFub3RoZXIgZWxlbWVudCBpbiB0aGUgc2xpZGVyXG4gICAgICAgICAgaWYgKCQuY29udGFpbnMoZGF0YS5lbC5nZXQoMCksIGV2dC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRhdGEuaGFzRm9jdXNbZXZlbnRUeXBlXSA9IGZvY3VzSW47XG5cbiAgICAgICAgICAvLyBQcmV2ZW50IEFyaWEgbGl2ZSBjaGFuZ2UgaWYgZm9jdXNlZCBieSBvdGhlciBpbnB1dFxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIChkYXRhLmhhc0ZvY3VzLm1vdXNlICYmIGV2ZW50VHlwZSA9PT0gJ2tleWJvYXJkJykgfHxcbiAgICAgICAgICAgIChkYXRhLmhhc0ZvY3VzLmtleWJvYXJkICYmIGV2ZW50VHlwZSA9PT0gJ21vdXNlJylcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0YS5oYXNGb2N1c1tldmVudFR5cGVdID0gZm9jdXNJbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmb2N1c0luKSB7XG4gICAgICAgICAgZGF0YS5hcmlhTGl2ZUxhYmVsLmF0dHIoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcbiAgICAgICAgICBpZiAoZGF0YS5oYXNUaW1lcikge1xuICAgICAgICAgICAgc3RvcFRpbWVyKGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXRhLmFyaWFMaXZlTGFiZWwuYXR0cignYXJpYS1saXZlJywgJ29mZicpO1xuICAgICAgICAgIGlmIChkYXRhLmhhc1RpbWVyKSB7XG4gICAgICAgICAgICBzdGFydFRpbWVyKGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5Ym9hcmRTbGlkZUJ1dHRvbnNGdW5jdGlvbihkYXRhLCBkaXJlY3Rpb25GdW5jdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgc3dpdGNoIChldnQua2V5Q29kZSkge1xuICAgICAgICAgIGNhc2UgS0VZX0NPREVTLlNQQUNFOlxuICAgICAgICAgIGNhc2UgS0VZX0NPREVTLkVOVEVSOiB7XG4gICAgICAgICAgICAvLyBEaXJlY3Rpb25GdW5jdGlvbiByZXR1cm5zIGEgZnVuY3Rpb25cbiAgICAgICAgICAgIGRpcmVjdGlvbkZ1bmN0aW9uKGRhdGEpKCk7XG5cbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJldmlvdXNGdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFuZ2UoZGF0YSwge2luZGV4OiBkYXRhLmluZGV4IC0gMSwgdmVjdG9yOiAtMX0pO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBuZXh0KGRhdGEpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoYW5nZShkYXRhLCB7aW5kZXg6IGRhdGEuaW5kZXggKyAxLCB2ZWN0b3I6IDF9KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VsZWN0KGRhdGEsIHZhbHVlKSB7XG4gICAgICAvLyBTZWxlY3QgcGFnZSBiYXNlZCBvbiBzbGlkZSBlbGVtZW50IGluZGV4XG4gICAgICB2YXIgZm91bmQgPSBudWxsO1xuICAgICAgaWYgKHZhbHVlID09PSBkYXRhLnNsaWRlcy5sZW5ndGgpIHtcbiAgICAgICAgaW5pdCgpO1xuICAgICAgICBsYXlvdXQoZGF0YSk7IC8vIFJlYnVpbGQgYW5kIGZpbmQgbmV3IHNsaWRlc1xuICAgICAgfVxuICAgICAgXy5lYWNoKGRhdGEuYW5jaG9ycywgZnVuY3Rpb24gKGFuY2hvciwgaW5kZXgpIHtcbiAgICAgICAgJChhbmNob3IuZWxzKS5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgIGlmICgkKGVsKS5pbmRleCgpID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgZm91bmQgPSBpbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBpZiAoZm91bmQgIT0gbnVsbCkge1xuICAgICAgICBjaGFuZ2UoZGF0YSwge2luZGV4OiBmb3VuZCwgaW1tZWRpYXRlOiB0cnVlfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnRUaW1lcihkYXRhKSB7XG4gICAgICBzdG9wVGltZXIoZGF0YSk7XG4gICAgICB2YXIgY29uZmlnID0gZGF0YS5jb25maWc7XG4gICAgICB2YXIgdGltZXJNYXggPSBjb25maWcudGltZXJNYXg7XG4gICAgICBpZiAodGltZXJNYXggJiYgZGF0YS50aW1lckNvdW50KysgPiB0aW1lck1heCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkYXRhLnRpbWVySWQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChkYXRhLnRpbWVySWQgPT0gbnVsbCB8fCBkZXNpZ25lcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBuZXh0KGRhdGEpKCk7XG4gICAgICAgIHN0YXJ0VGltZXIoZGF0YSk7XG4gICAgICB9LCBjb25maWcuZGVsYXkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3BUaW1lcihkYXRhKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGRhdGEudGltZXJJZCk7XG4gICAgICBkYXRhLnRpbWVySWQgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZXIoZGF0YSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHZhciBjb25maWcgPSBkYXRhLmNvbmZpZztcblxuICAgICAgICAvLyBEZXNpZ25lciBzZXR0aW5nc1xuICAgICAgICBpZiAoZGVzaWduZXIgJiYgZXZ0LnR5cGUgPT09ICdzZXR0aW5nJykge1xuICAgICAgICAgIGlmIChvcHRpb25zLnNlbGVjdCA9PT0gJ3ByZXYnKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXNGdW5jdGlvbihkYXRhKSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3B0aW9ucy5zZWxlY3QgPT09ICduZXh0Jykge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoZGF0YSkoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uZmlndXJlKGRhdGEpO1xuICAgICAgICAgIGxheW91dChkYXRhKTtcbiAgICAgICAgICBpZiAob3B0aW9ucy5zZWxlY3QgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxlY3QoZGF0YSwgb3B0aW9ucy5zZWxlY3QpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN3aXBlIGV2ZW50XG4gICAgICAgIGlmIChldnQudHlwZSA9PT0gJ3N3aXBlJykge1xuICAgICAgICAgIGlmIChjb25maWcuZGlzYWJsZVN3aXBlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChXZWJmbG93LmVudignZWRpdG9yJykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wdGlvbnMuZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0KGRhdGEpKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzRnVuY3Rpb24oZGF0YSkoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGFnZSBidXR0b25zXG4gICAgICAgIGlmIChkYXRhLm5hdi5oYXMoZXZ0LnRhcmdldCkubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gJChldnQudGFyZ2V0KS5pbmRleCgpO1xuICAgICAgICAgIGlmIChldnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgY2hhbmdlKGRhdGEsIHtpbmRleH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChldnQudHlwZSA9PT0gJ2tleWRvd24nKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2dC5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgIGNhc2UgS0VZX0NPREVTLkVOVEVSOlxuICAgICAgICAgICAgICBjYXNlIEtFWV9DT0RFUy5TUEFDRToge1xuICAgICAgICAgICAgICAgIGNoYW5nZShkYXRhLCB7aW5kZXh9KTtcbiAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNhc2UgS0VZX0NPREVTLkFSUk9XX0xFRlQ6XG4gICAgICAgICAgICAgIGNhc2UgS0VZX0NPREVTLkFSUk9XX1VQOiB7XG4gICAgICAgICAgICAgICAgZm9jdXNEb3QoZGF0YS5uYXYsIE1hdGgubWF4KGluZGV4IC0gMSwgMCkpO1xuICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2FzZSBLRVlfQ09ERVMuQVJST1dfUklHSFQ6XG4gICAgICAgICAgICAgIGNhc2UgS0VZX0NPREVTLkFSUk9XX0RPV046IHtcbiAgICAgICAgICAgICAgICBmb2N1c0RvdChkYXRhLm5hdiwgTWF0aC5taW4oaW5kZXggKyAxLCBkYXRhLnBhZ2VzKSk7XG4gICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjYXNlIEtFWV9DT0RFUy5IT01FOiB7XG4gICAgICAgICAgICAgICAgZm9jdXNEb3QoZGF0YS5uYXYsIDApO1xuICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2FzZSBLRVlfQ09ERVMuRU5EOiB7XG4gICAgICAgICAgICAgICAgZm9jdXNEb3QoZGF0YS5uYXYsIGRhdGEucGFnZXMpO1xuICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb2N1c0RvdCgkbmF2LCBpbmRleCkge1xuICAgICAgLy8gRm9jdXMgbmF2IGRvdDsgZG9uJ3QgY2hhbmdlIGNsYXNzIHRvIGFjdGl2ZVxuICAgICAgdmFyICRhY3RpdmUgPSAkbmF2LmNoaWxkcmVuKCkuZXEoaW5kZXgpLmZvY3VzKCk7XG5cbiAgICAgICRuYXYuY2hpbGRyZW4oKS5ub3QoJGFjdGl2ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hhbmdlKGRhdGEsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIGNvbmZpZyA9IGRhdGEuY29uZmlnO1xuICAgICAgdmFyIGFuY2hvcnMgPSBkYXRhLmFuY2hvcnM7XG5cbiAgICAgIC8vIFNldCBuZXcgaW5kZXhcbiAgICAgIGRhdGEucHJldmlvdXMgPSBkYXRhLmluZGV4O1xuICAgICAgdmFyIGluZGV4ID0gb3B0aW9ucy5pbmRleDtcbiAgICAgIHZhciBzaGlmdCA9IHt9O1xuICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBpbmRleCA9IGFuY2hvcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKGNvbmZpZy5pbmZpbml0ZSkge1xuICAgICAgICAgIC8vIFNoaWZ0IGZpcnN0IHNsaWRlIHRvIHRoZSBlbmRcbiAgICAgICAgICBzaGlmdC54ID0gLWRhdGEuZW5kWDtcbiAgICAgICAgICBzaGlmdC5mcm9tID0gMDtcbiAgICAgICAgICBzaGlmdC50byA9IGFuY2hvcnNbMF0ud2lkdGg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaW5kZXggPj0gYW5jaG9ycy5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBpZiAoY29uZmlnLmluZmluaXRlKSB7XG4gICAgICAgICAgLy8gU2hpZnQgbGFzdCBzbGlkZSB0byB0aGUgc3RhcnRcbiAgICAgICAgICBzaGlmdC54ID0gYW5jaG9yc1thbmNob3JzLmxlbmd0aCAtIDFdLndpZHRoO1xuICAgICAgICAgIHNoaWZ0LmZyb20gPSAtYW5jaG9yc1thbmNob3JzLmxlbmd0aCAtIDFdLng7XG4gICAgICAgICAgc2hpZnQudG8gPSBzaGlmdC5mcm9tIC0gc2hpZnQueDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGF0YS5pbmRleCA9IGluZGV4O1xuXG4gICAgICAvLyBTZWxlY3QgbmF2IGRvdDsgc2V0IGNsYXNzIGFjdGl2ZVxuICAgICAgdmFyICRhY3RpdmUgPSBkYXRhLm5hdlxuICAgICAgICAuY2hpbGRyZW4oKVxuICAgICAgICAuZXEoaW5kZXgpXG4gICAgICAgIC5hZGRDbGFzcygndy1hY3RpdmUnKVxuICAgICAgICAuYXR0cignYXJpYS1wcmVzc2VkJywgJ3RydWUnKVxuICAgICAgICAuYXR0cigndGFiaW5kZXgnLCAnMCcpO1xuXG4gICAgICBkYXRhLm5hdlxuICAgICAgICAuY2hpbGRyZW4oKVxuICAgICAgICAubm90KCRhY3RpdmUpXG4gICAgICAgIC5yZW1vdmVDbGFzcygndy1hY3RpdmUnKVxuICAgICAgICAuYXR0cignYXJpYS1wcmVzc2VkJywgJ2ZhbHNlJylcbiAgICAgICAgLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG5cbiAgICAgIC8vIEhpZGUgYXJyb3dzXG4gICAgICBpZiAoY29uZmlnLmhpZGVBcnJvd3MpIHtcbiAgICAgICAgZGF0YS5pbmRleCA9PT0gYW5jaG9ycy5sZW5ndGggLSAxXG4gICAgICAgICAgPyBkYXRhLnJpZ2h0LmhpZGUoKVxuICAgICAgICAgIDogZGF0YS5yaWdodC5zaG93KCk7XG4gICAgICAgIGRhdGEuaW5kZXggPT09IDAgPyBkYXRhLmxlZnQuaGlkZSgpIDogZGF0YS5sZWZ0LnNob3coKTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IHBhZ2Ugb2Zmc2V0IGZyb20gYW5jaG9yc1xuICAgICAgdmFyIGxhc3RPZmZzZXRYID0gZGF0YS5vZmZzZXRYIHx8IDA7XG4gICAgICB2YXIgb2Zmc2V0WCA9IChkYXRhLm9mZnNldFggPSAtYW5jaG9yc1tkYXRhLmluZGV4XS54KTtcbiAgICAgIHZhciByZXNldENvbmZpZyA9IHt4OiBvZmZzZXRYLCBvcGFjaXR5OiAxLCB2aXNpYmlsaXR5OiAnJ307XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gc2xpZGVzXG4gICAgICB2YXIgdGFyZ2V0cyA9ICQoYW5jaG9yc1tkYXRhLmluZGV4XS5lbHMpO1xuICAgICAgdmFyIHByZXZUYXJncyA9ICQoYW5jaG9yc1tkYXRhLnByZXZpb3VzXSAmJiBhbmNob3JzW2RhdGEucHJldmlvdXNdLmVscyk7XG4gICAgICB2YXIgb3RoZXJzID0gZGF0YS5zbGlkZXMubm90KHRhcmdldHMpO1xuICAgICAgdmFyIGFuaW1hdGlvbiA9IGNvbmZpZy5hbmltYXRpb247XG4gICAgICB2YXIgZWFzaW5nID0gY29uZmlnLmVhc2luZztcbiAgICAgIHZhciBkdXJhdGlvbiA9IE1hdGgucm91bmQoY29uZmlnLmR1cmF0aW9uKTtcbiAgICAgIHZhciB2ZWN0b3IgPSBvcHRpb25zLnZlY3RvciB8fCAoZGF0YS5pbmRleCA+IGRhdGEucHJldmlvdXMgPyAxIDogLTEpO1xuICAgICAgdmFyIGZhZGVSdWxlID0gJ29wYWNpdHkgJyArIGR1cmF0aW9uICsgJ21zICcgKyBlYXNpbmc7XG4gICAgICB2YXIgc2xpZGVSdWxlID0gJ3RyYW5zZm9ybSAnICsgZHVyYXRpb24gKyAnbXMgJyArIGVhc2luZztcblxuICAgICAgLy8gTWFrZSBhY3RpdmUgc2xpZGVzJyBjb250ZW50IGZvY3VzYWJsZVxuICAgICAgdGFyZ2V0cy5maW5kKEZPQ1VTQUJMRV9TRUxFQ1RPUikucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgIHRhcmdldHMucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4nKTtcbiAgICAgIC8vIFZvaWNlb3ZlciBidWc6IFNvbWV0aW1lcyBkZXNjZW5kYW50cyBhcmUgc3RpbGwgdmlzaWJsZSwgc28gaGlkZSBldmVyeXRoaW5nLi4uXG4gICAgICB0YXJnZXRzLmZpbmQoJyonKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbicpO1xuICAgICAgLy8gUHJldmVudCBmb2N1cyBvbiBpbmFjdGl2ZSBzbGlkZXMnIGNvbnRlbnRcbiAgICAgIG90aGVycy5maW5kKEZPQ1VTQUJMRV9TRUxFQ1RPUikuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIG90aGVycy5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAvLyBWb2ljZW92ZXIgYnVnOiBTb21ldGltZXMgZGVzY2VuZGFudHMgYXJlIHN0aWxsIHZpc2libGUsIHNvIGhpZGUgZXZlcnl0aGluZy4uLlxuICAgICAgb3RoZXJzLmZpbmQoJyonKS5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgIC8vIFRyaWdnZXIgSVggZXZlbnRzXG4gICAgICBpZiAoIWRlc2lnbmVyKSB7XG4gICAgICAgIHRhcmdldHMuZWFjaChpeC5pbnRybyk7XG4gICAgICAgIG90aGVycy5lYWNoKGl4Lm91dHJvKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IGltbWVkaWF0ZWx5IGFmdGVyIGxheW91dCBjaGFuZ2VzIChidXQgbm90IGR1cmluZyByZWRyYXcpXG4gICAgICBpZiAob3B0aW9ucy5pbW1lZGlhdGUgJiYgIWluUmVkcmF3KSB7XG4gICAgICAgIHRyYW0odGFyZ2V0cykuc2V0KHJlc2V0Q29uZmlnKTtcbiAgICAgICAgcmVzZXRPdGhlcnMoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBFeGl0IGVhcmx5IGlmIGluZGV4IGlzIHVuY2hhbmdlZFxuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IGRhdGEucHJldmlvdXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBBbm5vdW5jZSBzbGlkZSBjaGFuZ2UgdG8gc2NyZWVuIHJlYWRlclxuICAgICAgaWYgKCFkZXNpZ25lcikge1xuICAgICAgICBkYXRhLmFyaWFMaXZlTGFiZWwudGV4dChgU2xpZGUgJHtpbmRleCArIDF9IG9mICR7YW5jaG9ycy5sZW5ndGh9LmApO1xuICAgICAgfVxuICAgICAgLy8gQ3Jvc3MgRmFkZSAvIE91dC1JblxuICAgICAgaWYgKGFuaW1hdGlvbiA9PT0gJ2Nyb3NzJykge1xuICAgICAgICB2YXIgcmVkdWNlZCA9IE1hdGgucm91bmQoZHVyYXRpb24gLSBkdXJhdGlvbiAqIGNvbmZpZy5jcm9zc092ZXIpO1xuICAgICAgICB2YXIgd2FpdCA9IE1hdGgucm91bmQoZHVyYXRpb24gLSByZWR1Y2VkKTtcbiAgICAgICAgZmFkZVJ1bGUgPSAnb3BhY2l0eSAnICsgcmVkdWNlZCArICdtcyAnICsgZWFzaW5nO1xuICAgICAgICB0cmFtKHByZXZUYXJncykuc2V0KHt2aXNpYmlsaXR5OiAnJ30pLmFkZChmYWRlUnVsZSkuc3RhcnQoe29wYWNpdHk6IDB9KTtcbiAgICAgICAgdHJhbSh0YXJnZXRzKVxuICAgICAgICAgIC5zZXQoe3Zpc2liaWxpdHk6ICcnLCB4OiBvZmZzZXRYLCBvcGFjaXR5OiAwLCB6SW5kZXg6IGRhdGEuZGVwdGgrK30pXG4gICAgICAgICAgLmFkZChmYWRlUnVsZSlcbiAgICAgICAgICAud2FpdCh3YWl0KVxuICAgICAgICAgIC50aGVuKHtvcGFjaXR5OiAxfSlcbiAgICAgICAgICAudGhlbihyZXNldE90aGVycyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gRmFkZSBPdmVyXG4gICAgICBpZiAoYW5pbWF0aW9uID09PSAnZmFkZScpIHtcbiAgICAgICAgdHJhbShwcmV2VGFyZ3MpLnNldCh7dmlzaWJpbGl0eTogJyd9KS5zdG9wKCk7XG4gICAgICAgIHRyYW0odGFyZ2V0cylcbiAgICAgICAgICAuc2V0KHt2aXNpYmlsaXR5OiAnJywgeDogb2Zmc2V0WCwgb3BhY2l0eTogMCwgekluZGV4OiBkYXRhLmRlcHRoKyt9KVxuICAgICAgICAgIC5hZGQoZmFkZVJ1bGUpXG4gICAgICAgICAgLnN0YXJ0KHtvcGFjaXR5OiAxfSlcbiAgICAgICAgICAudGhlbihyZXNldE90aGVycyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2xpZGUgT3ZlclxuICAgICAgaWYgKGFuaW1hdGlvbiA9PT0gJ292ZXInKSB7XG4gICAgICAgIHJlc2V0Q29uZmlnID0ge3g6IGRhdGEuZW5kWH07XG4gICAgICAgIHRyYW0ocHJldlRhcmdzKS5zZXQoe3Zpc2liaWxpdHk6ICcnfSkuc3RvcCgpO1xuICAgICAgICB0cmFtKHRhcmdldHMpXG4gICAgICAgICAgLnNldCh7XG4gICAgICAgICAgICB2aXNpYmlsaXR5OiAnJyxcbiAgICAgICAgICAgIHpJbmRleDogZGF0YS5kZXB0aCsrLFxuICAgICAgICAgICAgeDogb2Zmc2V0WCArIGFuY2hvcnNbZGF0YS5pbmRleF0ud2lkdGggKiB2ZWN0b3IsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYWRkKHNsaWRlUnVsZSlcbiAgICAgICAgICAuc3RhcnQoe3g6IG9mZnNldFh9KVxuICAgICAgICAgIC50aGVuKHJlc2V0T3RoZXJzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBTbGlkZSAtIGluZmluaXRlIHNjcm9sbFxuICAgICAgaWYgKGNvbmZpZy5pbmZpbml0ZSAmJiBzaGlmdC54KSB7XG4gICAgICAgIHRyYW0oZGF0YS5zbGlkZXMubm90KHByZXZUYXJncykpXG4gICAgICAgICAgLnNldCh7dmlzaWJpbGl0eTogJycsIHg6IHNoaWZ0Lnh9KVxuICAgICAgICAgIC5hZGQoc2xpZGVSdWxlKVxuICAgICAgICAgIC5zdGFydCh7eDogb2Zmc2V0WH0pO1xuICAgICAgICB0cmFtKHByZXZUYXJncylcbiAgICAgICAgICAuc2V0KHt2aXNpYmlsaXR5OiAnJywgeDogc2hpZnQuZnJvbX0pXG4gICAgICAgICAgLmFkZChzbGlkZVJ1bGUpXG4gICAgICAgICAgLnN0YXJ0KHt4OiBzaGlmdC50b30pO1xuICAgICAgICBkYXRhLnNoaWZ0ZWQgPSBwcmV2VGFyZ3M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY29uZmlnLmluZmluaXRlICYmIGRhdGEuc2hpZnRlZCkge1xuICAgICAgICAgIHRyYW0oZGF0YS5zaGlmdGVkKS5zZXQoe3Zpc2liaWxpdHk6ICcnLCB4OiBsYXN0T2Zmc2V0WH0pO1xuICAgICAgICAgIGRhdGEuc2hpZnRlZCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTbGlkZSAtIGJhc2ljIHNjcm9sbFxuICAgICAgICB0cmFtKGRhdGEuc2xpZGVzKVxuICAgICAgICAgIC5zZXQoe3Zpc2liaWxpdHk6ICcnfSlcbiAgICAgICAgICAuYWRkKHNsaWRlUnVsZSlcbiAgICAgICAgICAuc3RhcnQoe3g6IG9mZnNldFh9KTtcbiAgICAgIH1cblxuICAgICAgLy8gSGVscGVyIHRvIG1vdmUgb3RoZXJzIG91dCBvZiB2aWV3XG4gICAgICBmdW5jdGlvbiByZXNldE90aGVycygpIHtcbiAgICAgICAgdGFyZ2V0cyA9ICQoYW5jaG9yc1tkYXRhLmluZGV4XS5lbHMpO1xuICAgICAgICBvdGhlcnMgPSBkYXRhLnNsaWRlcy5ub3QodGFyZ2V0cyk7XG4gICAgICAgIGlmIChhbmltYXRpb24gIT09ICdzbGlkZScpIHtcbiAgICAgICAgICByZXNldENvbmZpZy52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbShvdGhlcnMpLnNldChyZXNldENvbmZpZyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyKGksIGVsKSB7XG4gICAgICB2YXIgZGF0YSA9ICQuZGF0YShlbCwgbmFtZXNwYWNlKTtcbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAobWFza0NoYW5nZWQoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIGxheW91dChkYXRhKTtcbiAgICAgIH1cbiAgICAgIGlmIChkZXNpZ25lciAmJiBzbGlkZXNDaGFuZ2VkKGRhdGEpKSB7XG4gICAgICAgIGxheW91dChkYXRhKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsYXlvdXQoZGF0YSkge1xuICAgICAgLy8gRGV0ZXJtaW5lIHBhZ2UgY291bnQgZnJvbSB3aWR0aCBvZiBzbGlkZXNcbiAgICAgIHZhciBwYWdlcyA9IDE7XG4gICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgIHZhciBhbmNob3IgPSAwO1xuICAgICAgdmFyIHdpZHRoID0gMDtcbiAgICAgIHZhciBtYXNrV2lkdGggPSBkYXRhLm1hc2tXaWR0aDtcbiAgICAgIHZhciB0aHJlc2hvbGQgPSBtYXNrV2lkdGggLSBkYXRhLmNvbmZpZy5lZGdlO1xuICAgICAgaWYgKHRocmVzaG9sZCA8IDApIHtcbiAgICAgICAgdGhyZXNob2xkID0gMDtcbiAgICAgIH1cbiAgICAgIGRhdGEuYW5jaG9ycyA9IFt7ZWxzOiBbXSwgeDogMCwgd2lkdGg6IDB9XTtcbiAgICAgIGRhdGEuc2xpZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgIGlmIChhbmNob3IgLSBvZmZzZXQgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICBwYWdlcysrO1xuICAgICAgICAgIG9mZnNldCArPSBtYXNrV2lkdGg7XG4gICAgICAgICAgLy8gU3RvcmUgcGFnZSBhbmNob3IgZm9yIHRyYW5zaXRpb25cbiAgICAgICAgICBkYXRhLmFuY2hvcnNbcGFnZXMgLSAxXSA9IHtlbHM6IFtdLCB4OiBhbmNob3IsIHdpZHRoOiAwfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTZXQgbmV4dCBhbmNob3IgdXNpbmcgY3VycmVudCB3aWR0aCArIG1hcmdpblxuICAgICAgICB3aWR0aCA9ICQoZWwpLm91dGVyV2lkdGgodHJ1ZSk7XG4gICAgICAgIGFuY2hvciArPSB3aWR0aDtcbiAgICAgICAgZGF0YS5hbmNob3JzW3BhZ2VzIC0gMV0ud2lkdGggKz0gd2lkdGg7XG4gICAgICAgIGRhdGEuYW5jaG9yc1twYWdlcyAtIDFdLmVscy5wdXNoKGVsKTtcblxuICAgICAgICB2YXIgYXJpYUxhYmVsID0gaSArIDEgKyAnIG9mICcgKyBkYXRhLnNsaWRlcy5sZW5ndGg7XG4gICAgICAgICQoZWwpLmF0dHIoJ2FyaWEtbGFiZWwnLCBhcmlhTGFiZWwpO1xuICAgICAgICAkKGVsKS5hdHRyKCdyb2xlJywgJ2dyb3VwJyk7XG4gICAgICB9KTtcbiAgICAgIGRhdGEuZW5kWCA9IGFuY2hvcjtcblxuICAgICAgLy8gQnVpbGQgZG90cyBpZiBuYXYgZXhpc3RzIGFuZCBuZWVkcyB1cGRhdGluZ1xuICAgICAgaWYgKGRlc2lnbmVyKSB7XG4gICAgICAgIGRhdGEucGFnZXMgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKGRhdGEubmF2Lmxlbmd0aCAmJiBkYXRhLnBhZ2VzICE9PSBwYWdlcykge1xuICAgICAgICBkYXRhLnBhZ2VzID0gcGFnZXM7XG4gICAgICAgIGJ1aWxkTmF2KGRhdGEpO1xuICAgICAgfVxuXG4gICAgICAvLyBNYWtlIHN1cmUgaW5kZXggaXMgc3RpbGwgd2l0aGluIHJhbmdlIGFuZCBjYWxsIGNoYW5nZSBoYW5kbGVyXG4gICAgICB2YXIgaW5kZXggPSBkYXRhLmluZGV4O1xuICAgICAgaWYgKGluZGV4ID49IHBhZ2VzKSB7XG4gICAgICAgIGluZGV4ID0gcGFnZXMgLSAxO1xuICAgICAgfVxuICAgICAgY2hhbmdlKGRhdGEsIHtpbW1lZGlhdGU6IHRydWUsIGluZGV4fSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYnVpbGROYXYoZGF0YSkge1xuICAgICAgdmFyIGRvdHMgPSBbXTtcbiAgICAgIHZhciAkZG90O1xuICAgICAgdmFyIHNwYWNpbmcgPSBkYXRhLmVsLmF0dHIoJ2RhdGEtbmF2LXNwYWNpbmcnKTtcbiAgICAgIGlmIChzcGFjaW5nKSB7XG4gICAgICAgIHNwYWNpbmcgPSBwYXJzZUZsb2F0KHNwYWNpbmcpICsgJ3B4JztcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLnBhZ2VzOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgJGRvdCA9ICQoZG90KTtcbiAgICAgICAgJGRvdFxuICAgICAgICAgIC5hdHRyKCdhcmlhLWxhYmVsJywgJ1Nob3cgc2xpZGUgJyArIChpICsgMSkgKyAnIG9mICcgKyBsZW4pXG4gICAgICAgICAgLmF0dHIoJ2FyaWEtcHJlc3NlZCcsICdmYWxzZScpXG4gICAgICAgICAgLmF0dHIoJ3JvbGUnLCAnYnV0dG9uJylcbiAgICAgICAgICAuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgaWYgKGRhdGEubmF2Lmhhc0NsYXNzKCd3LW51bScpKSB7XG4gICAgICAgICAgJGRvdC50ZXh0KGkgKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3BhY2luZyAhPSBudWxsKSB7XG4gICAgICAgICAgJGRvdC5jc3Moe1xuICAgICAgICAgICAgJ21hcmdpbi1sZWZ0Jzogc3BhY2luZyxcbiAgICAgICAgICAgICdtYXJnaW4tcmlnaHQnOiBzcGFjaW5nLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGRvdHMucHVzaCgkZG90KTtcbiAgICAgIH1cbiAgICAgIGRhdGEubmF2LmVtcHR5KCkuYXBwZW5kKGRvdHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hc2tDaGFuZ2VkKGRhdGEpIHtcbiAgICAgIHZhciBtYXNrV2lkdGggPSBkYXRhLm1hc2sud2lkdGgoKTtcbiAgICAgIGlmIChkYXRhLm1hc2tXaWR0aCAhPT0gbWFza1dpZHRoKSB7XG4gICAgICAgIGRhdGEubWFza1dpZHRoID0gbWFza1dpZHRoO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzbGlkZXNDaGFuZ2VkKGRhdGEpIHtcbiAgICAgIHZhciBzbGlkZXNXaWR0aCA9IDA7XG4gICAgICBkYXRhLnNsaWRlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICBzbGlkZXNXaWR0aCArPSAkKGVsKS5vdXRlcldpZHRoKHRydWUpO1xuICAgICAgfSk7XG4gICAgICBpZiAoZGF0YS5zbGlkZXNXaWR0aCAhPT0gc2xpZGVzV2lkdGgpIHtcbiAgICAgICAgZGF0YS5zbGlkZXNXaWR0aCA9IHNsaWRlc1dpZHRoO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBFeHBvcnQgbW9kdWxlXG4gICAgcmV0dXJuIGFwaTtcbiAgfSlcbik7XG4iXSwibmFtZXMiOlsiV2ViZmxvdyIsInJlcXVpcmUiLCJJWEV2ZW50cyIsIktFWV9DT0RFUyIsIkFSUk9XX0xFRlQiLCJBUlJPV19VUCIsIkFSUk9XX1JJR0hUIiwiQVJST1dfRE9XTiIsIlNQQUNFIiwiRU5URVIiLCJIT01FIiwiRU5EIiwiRk9DVVNBQkxFX1NFTEVDVE9SIiwiZGVmaW5lIiwibW9kdWxlIiwiZXhwb3J0cyIsIiQiLCJfIiwiYXBpIiwidHJhbSIsIiRkb2MiLCJkb2N1bWVudCIsIiRzbGlkZXJzIiwiZGVzaWduZXIiLCJpbkFwcCIsImVudiIsIm5hbWVzcGFjZSIsImRvdCIsImFyaWFMaXZlTGFiZWxIdG1sIiwiZm9yY2VTaG93IiwiaXgiLCJ0cmlnZ2VycyIsImZhbGxiYWNrIiwiaW5SZWRyYXciLCJyZWFkeSIsImluaXQiLCJkZXNpZ24iLCJzZXRUaW1lb3V0IiwicHJldmlldyIsInJlZHJhdyIsImRlc3Ryb3kiLCJyZW1vdmVMaXN0ZW5lcnMiLCJmaW5kIiwibGVuZ3RoIiwiZWFjaCIsImJ1aWxkIiwiYWRkTGlzdGVuZXJzIiwicmVzaXplIiwib2ZmIiwicmVuZGVyQWxsIiwib24iLCJmaWx0ZXIiLCJyZW5kZXIiLCJpIiwiZWwiLCIkZWwiLCJkYXRhIiwiaW5kZXgiLCJkZXB0aCIsImhhc0ZvY3VzIiwia2V5Ym9hcmQiLCJtb3VzZSIsImNvbmZpZyIsIm1hc2siLCJjaGlsZHJlbiIsImxlZnQiLCJyaWdodCIsIm5hdiIsInNsaWRlcyIsInJlc2V0IiwibWFza1dpZHRoIiwiYXR0ciIsInVuZGVmaW5lZCIsInNsaWRlVmlld0lkIiwiYXJpYUxpdmVMYWJlbCIsImFwcGVuZFRvIiwic3VwcG9ydCIsInRyYW5zZm9ybSIsImhpZGUiLCJjb25maWd1cmUiLCJoYW5kbGVyIiwic3RvcFRpbWVyIiwiaGFzVGltZXIiLCJwcmV2aW91c0Z1bmN0aW9uIiwibmV4dCIsImtleWJvYXJkU2xpZGVCdXR0b25zRnVuY3Rpb24iLCJhdXRvcGxheSIsInRpbWVyQ291bnQiLCJzdGFydFRpbWVyIiwiY29udGVudHMiLCJub2RlVHlwZSIsInJlbW92ZSIsIiRlbEhpZGRlbiIsImFkZENsYXNzIiwiJGVsSGlkZGVuUGFyZW50cyIsInBhcmVudHMiLCJyZW1vdmVDbGFzcyIsImNyb3NzT3ZlciIsImFuaW1hdGlvbiIsImVhc2luZyIsImR1cmF0aW9uIiwicGFyc2VJbnQiLCJpc0F0dHJUcnVlIiwiaW5maW5pdGUiLCJkaXNhYmxlU3dpcGUiLCJoaWRlQXJyb3dzIiwic2hvdyIsImRlbGF5IiwidGltZXJNYXgiLCJ0b3VjaEV2ZW50cyIsIm9uZSIsImFycm93V2lkdGgiLCJ3aWR0aCIsImVkZ2UiLCJ2YWx1ZSIsImZvY3VzSW4iLCJldmVudFR5cGUiLCJldnQiLCJjb250YWlucyIsImdldCIsInJlbGF0ZWRUYXJnZXQiLCJkaXJlY3Rpb25GdW5jdGlvbiIsImtleUNvZGUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImNoYW5nZSIsInZlY3RvciIsInNlbGVjdCIsImZvdW5kIiwibGF5b3V0IiwiYW5jaG9ycyIsImFuY2hvciIsImVscyIsImltbWVkaWF0ZSIsInRpbWVySWQiLCJ3aW5kb3ciLCJjbGVhclRpbWVvdXQiLCJvcHRpb25zIiwidHlwZSIsImRpcmVjdGlvbiIsImhhcyIsInRhcmdldCIsImZvY3VzRG90IiwiTWF0aCIsIm1heCIsIm1pbiIsInBhZ2VzIiwiJG5hdiIsIiRhY3RpdmUiLCJlcSIsImZvY3VzIiwibm90IiwicHJldmlvdXMiLCJzaGlmdCIsIngiLCJlbmRYIiwiZnJvbSIsInRvIiwibGFzdE9mZnNldFgiLCJvZmZzZXRYIiwicmVzZXRDb25maWciLCJvcGFjaXR5IiwidmlzaWJpbGl0eSIsInRhcmdldHMiLCJwcmV2VGFyZ3MiLCJvdGhlcnMiLCJyb3VuZCIsImZhZGVSdWxlIiwic2xpZGVSdWxlIiwicmVtb3ZlQXR0ciIsImludHJvIiwib3V0cm8iLCJzZXQiLCJyZXNldE90aGVycyIsInRleHQiLCJyZWR1Y2VkIiwid2FpdCIsImFkZCIsInN0YXJ0IiwiekluZGV4IiwidGhlbiIsInN0b3AiLCJzaGlmdGVkIiwibWFza0NoYW5nZWQiLCJzbGlkZXNDaGFuZ2VkIiwib2Zmc2V0IiwidGhyZXNob2xkIiwib3V0ZXJXaWR0aCIsInB1c2giLCJhcmlhTGFiZWwiLCJidWlsZE5hdiIsImRvdHMiLCIkZG90Iiwic3BhY2luZyIsInBhcnNlRmxvYXQiLCJsZW4iLCJoYXNDbGFzcyIsImNzcyIsImVtcHR5IiwiYXBwZW5kIiwic2xpZGVzV2lkdGgiXSwibWFwcGluZ3MiOiJBQUFBLDJCQUEyQixHQUUzQjs7Q0FFQztBQUVELElBQUlBLFVBQVVDLFFBQVE7QUFDdEIsSUFBSUMsV0FBV0QsUUFBUTtBQUV2QixNQUFNRSxZQUFZO0lBQ2hCQyxZQUFZO0lBQ1pDLFVBQVU7SUFDVkMsYUFBYTtJQUNiQyxZQUFZO0lBQ1pDLE9BQU87SUFDUEMsT0FBTztJQUNQQyxNQUFNO0lBQ05DLEtBQUs7QUFDUDtBQUVBLE1BQU1DLHFCQUNKO0FBRUZaLFFBQVFhLE1BQU0sQ0FDWixVQUNDQyxPQUFPQyxPQUFPLEdBQUcsU0FBVUMsQ0FBQyxFQUFFQyxDQUFDO0lBQzlCLElBQUlDLE1BQU0sQ0FBQztJQUNYLElBQUlDLE9BQU9ILEVBQUVHLElBQUk7SUFDakIsSUFBSUMsT0FBT0osRUFBRUs7SUFDYixJQUFJQztJQUNKLElBQUlDO0lBQ0osSUFBSUMsUUFBUXhCLFFBQVF5QixHQUFHO0lBQ3ZCLElBQUlDLFlBQVk7SUFDaEIsSUFBSUMsTUFBTTtJQUNWLElBQUlDLG9CQUNGO0lBQ0YsSUFBSUMsWUFBWTtJQUNoQixJQUFJQyxLQUFLNUIsU0FBUzZCLFFBQVE7SUFDMUIsSUFBSUM7SUFDSixJQUFJQyxXQUFXO0lBRWYsc0NBQXNDO0lBQ3RDLGlCQUFpQjtJQUVqQmYsSUFBSWdCLEtBQUssR0FBRztRQUNWWCxXQUFXdkIsUUFBUXlCLEdBQUcsQ0FBQztRQUN2QlU7SUFDRjtJQUVBakIsSUFBSWtCLE1BQU0sR0FBRztRQUNYYixXQUFXO1FBQ1gsc0NBQXNDO1FBQ3RDYyxXQUFXRixNQUFNO0lBQ25CO0lBRUFqQixJQUFJb0IsT0FBTyxHQUFHO1FBQ1pmLFdBQVc7UUFDWFk7SUFDRjtJQUVBakIsSUFBSXFCLE1BQU0sR0FBRztRQUNYTixXQUFXO1FBQ1hFO1FBQ0FGLFdBQVc7SUFDYjtJQUVBZixJQUFJc0IsT0FBTyxHQUFHQztJQUVk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

}),
6663: (function (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {
__webpack_require__(9461);__webpack_require__(7624);__webpack_require__(286);__webpack_require__(8334);__webpack_require__(2338);__webpack_require__(3695);__webpack_require__(322);__webpack_require__(941);__webpack_require__(5134);__webpack_require__(1655);__webpack_require__(2444);__webpack_require__(9078);__webpack_require__(4345);__webpack_require__(5712);

}),

});
/************************************************************************/
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
id: moduleId,
loaded: false,
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);

// Flag the module as loaded
module.loaded = true;
// Return the exports of the module
return module.exports;

}

// expose the modules object (__webpack_modules__)
__webpack_require__.m = __webpack_modules__;

/************************************************************************/
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/esm_module_decorator
(() => {
__webpack_require__.hmd = (module) => {
  module = Object.create(module);
  if (!module.children) module.children = [];
  Object.defineProperty(module, 'exports', {
      enumerable: true,
      set: () => {
          throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
      }
  });
  return module;
};
})();
// webpack/runtime/global
(() => {
__webpack_require__.g = (() => {
	if (typeof globalThis === 'object') return globalThis;
	try {
		return this || new Function('return this')();
	} catch (e) {
		if (typeof window === 'object') return window;
	}
})();
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
// webpack/runtime/node_module_decorator
(() => {
__webpack_require__.nmd = (module) => {
  module.paths = [];
  if (!module.children) module.children = [];
  return module;
};
})();
// webpack/runtime/on_chunk_loaded
(() => {
var deferred = [];
__webpack_require__.O = (result, chunkIds, fn, priority) => {
	if (chunkIds) {
		priority = priority || 0;
		for (var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--)
			deferred[i] = deferred[i - 1];
		deferred[i] = [chunkIds, fn, priority];
		return;
	}
	var notFulfilled = Infinity;
	for (var i = 0; i < deferred.length; i++) {
		var [chunkIds, fn, priority] = deferred[i];
		var fulfilled = true;
		for (var j = 0; j < chunkIds.length; j++) {
			if (
				(priority & (1 === 0) || notFulfilled >= priority) &&
				Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))
			) {
				chunkIds.splice(j--, 1);
			} else {
				fulfilled = false;
				if (priority < notFulfilled) notFulfilled = priority;
			}
		}
		if (fulfilled) {
			deferred.splice(i--, 1);
			var r = fn();
			if (r !== undefined) result = r;
		}
	}
	return result;
};

})();
// webpack/runtime/rspack_version
(() => {
__webpack_require__.rv = () => ("1.3.9")
})();
// webpack/runtime/jsonp_chunk_loading
(() => {

      // object to store loaded and loading chunks
      // undefined = chunk not loaded, null = chunk preloaded/prefetched
      // [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
      var installedChunks = {"789": 0,};
      __webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
// install a JSONP callback for chunk loading
var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
	var [chunkIds, moreModules, runtime] = data;
	// add "moreModules" to the modules object,
	// then flag all "chunkIds" as loaded and fire callback
	var moduleId, chunkId, i = 0;
	if (chunkIds.some((id) => (installedChunks[id] !== 0))) {
		for (moduleId in moreModules) {
			if (__webpack_require__.o(moreModules, moduleId)) {
				__webpack_require__.m[moduleId] = moreModules[moduleId];
			}
		}
		if (runtime) var result = runtime(__webpack_require__);
	}
	if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
	for (; i < chunkIds.length; i++) {
		chunkId = chunkIds[i];
		if (
			__webpack_require__.o(installedChunks, chunkId) &&
			installedChunks[chunkId]
		) {
			installedChunks[chunkId][0]();
		}
		installedChunks[chunkId] = 0;
	}
	return __webpack_require__.O(result);
};

var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));

})();
// webpack/runtime/rspack_unique_id
(() => {
__webpack_require__.ruid = "bundler=rspack@1.3.9";

})();
/************************************************************************/
// startup
// Load entry module and return exports
// This entry module depends on other loaded chunks and execution need to be delayed
var __webpack_exports__ = __webpack_require__.O(undefined, ["910", "489"], function() { return __webpack_require__(6663) });
__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
})()
;