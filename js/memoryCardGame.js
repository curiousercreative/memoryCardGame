/* - - - - - - - - - - - - - - - - - -
    jQuery & Javascript code by Winston Hoy
    as coding demonstration

Thanks:
    http://jQuery.com                                               : John Resig & jquery
    http://flesler.blogspot.com/2007/10/jqueryscrollto.html         : Ariel Flesler
    http://www.asual.com/jquery/address/                            : Rostislav Hristov
    https://github.com/yonran/detect-zoom                           : Yonathan Randolph
    
contact me if you want to use something or with questions
winston@curiousercreative.com
 - - - - - - - - - - - - - - - - - - -*/

// ---- Immediately    

// ---- When the document is ready
    jQuery(document).ready(function ($) {
    // Hide the body until ready
        $('body').css('visibility', 'hidden');
    
    // In case it never shows, show it
        timeout = setTimeout(function () {
            if (debug) console.log('time is up!');
            nav.imReady('timeIsUp');
        }, 2000);
 
    // ---- When all downloads have completed, the window is loaded
        $(window).one('load', function() {            
            nav.imReady('window');
            nav.imReady('pages');
        });
        
    // Ajaxcms bind to pre init
        $(document).bind('pre_initialize', function () {            
        // Check browser
            nav.checkBrowser();

        // Scroll to where you belong
            window.scrollTo(0, 0);

        // Set font_size
            nav.set_font_size();
            
        // Fire resize
            nav.resize();
        
        // Initialize pages
            $.each(nav.pages, function () {
            // Initialize the page
                this.initialize();
            });
        });
        
    // Ajaxcms bind to post init
        $(document).bind('post_initialize', function () {
        // Bind resizes
            $(window).bind('resize', function () {
            // Set a timeout to reset the positions
                clearTimeout(nav.resizeTimeout);
                nav.resizeTimeout = setTimeout(nav.resize, 60);
            });
        });
    
    // ----- CMS
    // Create our nav object
        window.nav = new Default_nav();
        nav.title = 'Memory Game by Winston Hoy';
        nav.animationDuration = 0;
    
    // ------- Create our page objects and override any Page methods
    // Home page
        nav.pages.home = new nav.Page('home', {aliases: ['landing', 'contact', '', '*', 'map'], title: 'Home', defaultTransition: 'slide'});
        nav.pages.home.pre_initialize = function () {
            if (debug) console.log('pre_initializing page with id:'+this.id);
        }
        
        nav.pages.home.pre_enter = function () {
            if (debug) console.log('pre_entering page with id:'+this.id);
        }
        
        nav.pages.home.pre_exit = function () {
            if (debug) console.log('pre_exiting page with id:'+this.id);
        }
        
    // General methods
        nav.set_font_size = function () {
            nav.font_size = nav.wrap_w*0.011111111111111111;
            nav.font_size = nav.font_size < 11 ? 11 : nav.font_size;
            
            $('html').css('font-size', nav.font_size+'px');
        } 
        
        nav.checkZoom = function (zoom) {
            if (debug) console.log('checking zoom');
        
            if (zoom !== 1) {
                return false;
            }
            else {
                return true;
            }
        }
        
        nav.resize = function () {
            if (debug) console.log('running resize functions');
                
        // Check the window width
            nav.setIsDesktopWidth();
            
            nav.hasScroll = !isMobile && matchMedia("(min-aspect-ratio: 2200/968), (max-height: 660px)").matches;
            
            if (nav.checkZoom(nav.getZoom())) {
                nav.set_page_size();
            
                nav.set_font_size();
            }
            
        // load facts on large mobile devices
            if (isMobile && !$('#facts_script').exists() && (nav.w_width > 960 || nav.w_height > 960)) {
                $('body').append('<script id="facts_script" type="text/javascript" src="'+siteUrl+'/wp-content/themes/fora_curiouser_theme/js/svg/facts_left.js"></script>');
                $('body').append('<script type="text/javascript" src="'+siteUrl+'/wp-content/themes/fora_curiouser_theme/js/svg/facts_right.js"></script>');
            }
            
        // move social media buttons to the bottom of about
            if (nav.w_width < 961) {
                $('#sm').insertBefore('#page_about .page_bottom');
            }
            else $('#sm').appendTo('#header');
            
        // resize active pages
            if (nav.active_pages && nav.active_pages.length > 0) {
                for (var i = 0; i < nav.active_pages.length; i++) {
                    nav.active_pages[i].resize();
                }
            }
            
        // Scroll to the right place
            //if (nav.active_pages[0]) $('#page_container').scrollTo('#'+nav.active_pages[0].id, {axis: 'x'});
        }
        
        nav.getActivePage = function () {
            if (this.active_pages.length > 0) {
                return this.active_pages[this.active_pages.length - 1];
            }
            else {
                return nav.pages[default_page];
            }
        }
        
        nav.checkBrowser = function () {
        // Browser checks
            if ($.browser) {
                // webkit (safari and chrome)
                if ($.browser.webkit) {
                    $('body').addClass('webkit');
                    if ($.browser.safari) {
                        $('body').addClass('safari');
                        if (navigator.userAgent.match(/Version\/7/)) $('body').addClass('safari7');
                    }
                    else {
                        $('body').addClass('chrome');
                        nav.fixChromeFacts();
                    }
                }
                // chrome
                else if ($.browser.chrome) {
                    $('body').addClass('chrome');
                    nav.fixChromeFacts();
                }
                // ie
                else if ($.browser.msie) {
                    $('body').addClass('ie');
                    if (parseInt($.browser.version) == 9) $('body').addClass('ie9');
                    if (parseInt($.browser.version) == 10) $('body').addClass('ie10');
                }
                // firefox
                else if ($.browser.mozilla) $('body').addClass('firefox');
            }
            
        // iOS version check
            if (navigator.userAgent.match(/(iPad|iPhone);.*CPU.*OS 7_\d/i)) $('body').addClass('ios7');
            if (navigator.userAgent.match(/(iPad|iPhone);.*CPU.*OS [0-7]_\d/i)) $('body').addClass('ios');
            
        // Mobile check
            if (isMobile) $('body').addClass('mobile');
            
        // Retina check
            nav.retina = matchMedia("(webkit-min-device-pixel-ratio: 2), (min-resolution: 170dpi)").matches || window.devicePixelRatio > 1.4;
        }
        
        nav.imReady = function (prop) {
            if (debug) console.log(prop+' is ready');
            nav.ready[prop] = true;
            if (prop == 'pages') {
                $(this).trigger('pagesReady');
                delete nav.pagePreloader;
            }
            this.showSite();
        }
        
        nav.showSite = function () {
            if (
                (this.ready.pages && this.ready.window) || this.ready.timeIsUp
            ) {
                if (debug) console.log('Everything is ready or time is up, showing site');
            // check connection speed
                nav.speedTest.init();              
            
            // resize
                nav.resize();
            
            // set the animation duration
                nav.animationDuration = animation_duration;
            
            // Clear timeout
                clearTimeout(timeout);
            
            // Last minute hacks
                $.each(nav.pages, function () {
                });
                
            // Show the site
                $('body').css('visibility', 'visible');
                
            // Site shown
                nav.siteShown = true;
                
                if (debug) console.log('Site Shown');
            }
        }
        
        nav.setIsDesktopWidth = function () {            
        // Check both width and aspect ratio to determine whether to switch to two column
            if ('matchMedia' in window) {
            // Narrower than 1024 or taller than this aspect ratio
                return nav.isDesktop = !window.matchMedia('(max-width: 1023px), (max-aspect-ratio: 1238/1083)').matches
            }
        // Legacy doesn't support media queries, always desktop
            else return nav.isDesktop = true;
        }
        
    // initialize site
        nav.initialize_site();
    });