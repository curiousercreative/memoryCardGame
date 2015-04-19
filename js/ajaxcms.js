/* - - - - - - - - - - - - - - - - - -
Website produced by Curiouser Creative Studio:
    Design by Liza Gipsova
    jQuery & java scripting by Winston Hoy
    For Glen Echo Group, glenechogroup.com

jquery.js contains core + ui effects core & exists function

Thanks:
    http://jQuery.com                                               : John Resig & jquery
    http://flesler.blogspot.com/2007/10/jqueryscrollto.html         : Ariel Flesler
    http://www.asual.com/jquery/address/                            : Rostislav Hristov
    http://gsgd.co.uk/sandbox/jquery/easing/                        : Robert Penner
    https://github.com/yonran/detect-zoom                           : Yonathan Randolph
    http://onwebdev.blogspot.com/2011/05/jquery-randomize-and-shuffle-array.html    : Randomize, Gabriele Romanato
    https://github.com/brandonaaron/jquery-mousewheel/              : Brandon Aaron

contact me if you want to use something or with questions
winston@curiousercreative.com
 - - - - - - - - - - - - - - - - - - -*/

/* - - - - - - - - - - - - - - - - - -
Event hooks for ajaxcms 
example: $(document).bind('hook_name', function () { //put function here });
- pre_initialize
- post_initialize
- pre_process_url
- pre_nav_transition
- pre_change_address
- pre_anchor_bind
- pre_anchor_bind_extend
- pre_init_url

Hard coded page Hooks
example this.hook_name = function ( {// put function here }));
- pre_requested
- pre_enter
- pre_show_page
- post_show_page
- post_requested

- pre_exit
- pre_hide_page
- post_hide_page

- pre_resize
- post_resize
 - - - - - - - - - - - - - - - - - - -*/

/* - - - - - - - - - - - - - - - - - -
Required properties of window object for initialization
debug = boolean; // Do we want to print console.log?
default_page = string; // The page id to be used as a default
url_requested = string; // Url that was requested
animation_duration = integer; // Milliseconds for animation durations to be based off
allowAjax = boolean; // Whether to search the server if the page_id wasn't found
defaultPageTransition = string; // Which transition method to use? scroll or fade
 - - - - - - - - - - - - - - - - - - -*/

// Execute when document structure is ready
    jQuery(document).ready(function ($) {
    // Navigation class
        Default_nav = function () {
        // properties
            this.lastScroll = 0;
            this.initialized = false;
            this.last_page = null;
            this.last_pages = new Array();
            this.active_pages = new Array();
            this.history_supported = false;//!!(window.history && history.pushState);
            this.pages = new Object();
            this.siteShown = false;
            this.pageContainer = $('body');
            this.pageIdPrefix = 'page_';
            this.scrollAxis = 'y';
            this.animationDuration = animation_duration;
            this.shouldPreventDefault = true;
            this.last_url = '/';
            this.ready = { // an object to let us check if things are ready to display
                window: false
            }
            this.getPage = function (page_id) {
                var default_page = false;
            
            // Does this page have the page we're looking for in it?
                for (var prop in this.pages) {
                // The page requested matches this id
                    if (page_id == prop) {
                        return this.pages[prop];
                    }
                // If not, check the aliases array for a match
                    else if (this.pages[prop].aliases.length > 0) {
                        for (i = 0; this.pages[prop].aliases.length > i; i++) {
                        // One of the aliases matches the requested
                            if (this.pages[prop].aliases[i] == page_id) {
                                return this.pages[prop];    
                            }
                        // This page is the default page
                            else if (this.pages[prop].aliases[i] == '*') {
                                default_page = this.pages[prop];
                            }
                        }
                    }
                }
                
                if (default_page) default_page.requested_id = page_id;
                return default_page;
            }
            this.Page = function (id, props) {
                if (!props) props = new Object();
                this.active = false;
                this.detached = props.detached ? props.detached : false;
                this.aliases = props.aliases ? props.aliases : new Array();
                this.id = id;
                this.title = props.title;
                this.type = props.type;
                this.default_page = props.default_page;
                this.requested_id = id;
                this.defaultTransition = props.defaultTransition ? props.defaultTransition : defaultTransition;
                this.pages = new Object();
                this.animationDuration = props.animationDuration ? props.animationDuration : nav.animationDuration;
                this.jObj = $('#'+nav.pageIdPrefix+this.id);
                
                this.initialize = function () {
                    if (this.pre_initialize && this.pre_initialize() == false) return false;
                    
                    if (debug) console.log(this.id+' initializing');
                    
                    for (var page in this.pages) {
                        this.pages[page].initialize();
                    }
                    
                    if (this.post_initialize && this.post_initialize() == false) return false;
                    return true;
                }
                
                this.transition = function () {
                    if (debug) console.log(this.id+' transitioning');
                    
                    return true;
                }
                
                this.show_page = function (method) {
                    if (this.pre_show_page && this.pre_show_page() == false) return false;
                    
                    if (debug) console.log(this.requested_id+' showing');
                    
                    method = !method ? this.defaultTransition : method;
                    
                    this['show_page_'+method]();
                    
                    this.jObj.addClass('active');
                    if (this.post_show_page && this.post_show_page() == false) return false;
                    return true;
                }
                
                this.hide_page = function (method) {
                    if (this.pre_hide_page && this.pre_hide_page() == false) return false;
                    
                    if (debug) console.log(this.requested_id+' hiding');
                    
                    method = !method ? this.defaultTransition : method;
                    
                    this['hide_page_'+method]();
                    
                    if (this.post_hide_page && this.post_hide_page() == false) return false;
                    
                    return true;
                }
                
                this.requested = function () {
                    if (debug) console.log('page requested: '+this.requested_id);
                    
                    this.jObj = this.id == 'all' ? $('#page_'+this.requested_id) : this.jObj;
                    
                    if (this.pre_requested && this.pre_requested() == false) return false;
                    if (!this.pageMarkupExists()) {
                        if (!this.retrievePage || this.retrievePage() == false) return false;
                    }
                    
                    this.setAnimationDuration();
                    
                    if (!this.active) {
                        if (this.enter() == false) return false;
                    }
                    else {
                        this.show_page();
                    }
                    
                    if (this.post_requested && this.post_requested() == false) return false;
                    
                    return true;
                }
                
                this.enter = function () {
                    if (this.pre_enter && this.pre_enter() == false) return false;
                    if (debug) console.log(this.requested_id+' entering');
                    this.resize();
                    this.show_page();
                    if (this.updateNav) this.updateNav();
                    this.active = true;
                    if (this.post_enter && this.post_enter() == false) return false;
                    return true;
                }
                
                this.exit = function () {
                    if (this.pre_exit && this.pre_exit() == false) return false;
                    if (debug) console.log(this.requested_id+' exiting');
                    this.hide_page();
                    this.active = false;
                    this.jObj.removeClass('active');
                    //$(window).unbind('resize', nav.getPage(this.id).resize);
                    if (this.post_exit && this.post_exit() == false) return false;
                    return true;
                }
                
                this.resize = function () {
                    if (debug) console.log(this.requested_id+' resizing');
                    if (this.pre_resize && this.pre_resize() == false) return false;
                    if (this.post_resize && this.post_resize() == false) return false;
                    return true;
                }
                
                this.create_nested_page_objects = function (container, type) {
                    var nested_pages = $.makeArray(container.find('.'+type));
                    for (var prop in nested_pages) {
                        this.pages[$(nested_pages[prop]).attr('id')] = new nav.Page($(nested_pages[prop]).attr('id'));
                    }
                }
                
                this.queued = function () {
                
                }
                this.pageMarkupExists = function () {
                    if (!$('#'+nav.pageIdPrefix+this.requested_id).exists() && !$('#'+nav.pageIdPrefix+this.id).exists()) return false;
                    else return true;
                }
               
            /* This is too site specific, need a framework of extending this 
                this.retrievePage = function () {
                    if (debug) console.log('retrieving page');
                    if (this.retrieveStaticPage)
                    $('#hidden_container #hidden_pages').load(nav.url+" #page_container>.page", function () {
                    // Put it in the right spot
                        var page_id = $('.page', this).attr('id');
                        $('.page', this).appendTo('#page_container');
                        if (debug) console.log(page_id);
                        
                        var pageObj = nav.getPage($('.page', this).attr('id'));
                        if (pageObj) pageObj.onPageLoad();
                        nav.getPage(page_id).enter();
                    });
                }
            */
                
                this.insertPage = function () {
                    
                }
                
                
                this.setAnimationDuration = function () {
                    if (debug) console.log('setting animation duration for page with id:'+this.requested_id);
                    
                    this.animationDuration = nav.animationDuration;
                    
                    return true;
                }
                
                this.shouldEnterParent = function (parentId) {
                    return true;
                }
                
                this.shouldExitParent = function (parentId) {
                    return false;
                }
            }
            
            this.getZoom = function () {
                if (this.zoom) this.lastZoom = this.zoom;
                
            // Detect retina display and divide
                if (
                    // media query for resolution
                    matchMedia("(webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)").matches
                    // firefox only
                    && (
                        $.browser && $.browser.mozilla
                    )
                ) return this.zoom = DetectZoom.zoom()/2;
                else return this.zoom = DetectZoom.zoom();
            }
            
            this.Page.prototype.getPage = this.getPage;
        
        // methods
            this.initialize_site = function () {
                if (debug) console.log('initializing site');
            // Only allow initalize once
                if (this.initialized == false) {                    
                // Trigger the hook for pre initialization
                    if (debug) console.log('pre_initializing site');
                    $(document).trigger('pre_initialize');
    
                // Init url
                    this.init_url();
                
                // Navigation bind, anytime our path changes             
                    this.bind_change_address();
                    
                // Anytime a link is clicked, change the path
                    $(document).on('click', 'a', function (e) {
                        //console.log(e);
                        var href = $(this).attr('href');
                    
                    // Check if there is an override binding function
                        href = typeof nav.anchor_bind_extend == 'function' ? nav.anchor_bind_extend(this) : href;
                        if (href !== false) {
                        // Bind it and preventDefault if default
                            if (nav.anchor_bind(href) && nav.shouldPreventDefault) e.preventDefault();
                        }
                    });
                    
                // Trigger the post initialization
                    if (debug) console.log('post_initializing site');
                    $(document).trigger('post_initialize');
                
                // set initialized flag
                    this.initialized = true;
                }
            }
            
            this.change_address = function (url) {
                $(document).trigger('pre_change_address');
                if (debug) console.log('changing address, url sent:'+url);
                
            // Remove trailing slash
                if (url !== '/') url = url.substr(url.length-1) == '/' ? url.substr(0, url.length - 1) : url;
                
                if (url && nav.siteShown) {
                    nav.last_url = nav.url;
                    
                    if (nav.history_supported == true) {
                    // Creat the history entry
                        history.pushState(null, null, url);
                    
                    // Fire
                        $(window).trigger('popstate');
                    }
                    else {
                        $.address.value(url);
                    }
                }
            }
            
            this.bind_change_address = function () {
                if (debug) console.log('binding address change');
                
            // HTML5
                if (this.history_supported) {
                    window.onpopstate = function () {
                        nav.url = history.state;
                        nav.postAddressChange();
                    };
                }
            // No HTML5
                else {
                    $.address.change(function (e) {
                        if (debug) console.log('address changed to:'+e.path);
                        nav.postAddressChange($.address.value());
                    });
                }
            }
            
            this.postAddressChange = function (url) {
                if (debug) console.log('siteShown:'+ this.siteShown+', url:'+url)
            
            // Not on initial load
                if (this.siteShown) {
                    if (this.url) this.last_url = this.url;
                    this.url = url;
                // Set nav props
                    this.process_url(this.url);
                // Transition
                    this.nav_transition();
                }
            }
            
            this.anchor_bind = function (href) {                    
                $(document).trigger('pre_anchor_bind');
                if (debug) console.log('anchor bind:'+href);
                
            // hrefs that we don't want to touch, let the browser handle it
                if (
                // No mailto links
                    href.search("mailto") === 0
                // No admin links
                    || href.search("wp-") !== -1
                ) {
                    return false;
                }
                
            // path relative to domain
                if (href.search("/") === 0) {
                    nav.change_address(href);
                    return true;
                }
            // path relative current path
                else if (href.search("/") === -1) {
                // Get the current url, remove the last one and compare it to the link clicked
                    var path_names = $.address.pathNames();
                    var path_pop = path_names.pop();
                
                // If not the link clicked, replace it with the link clicked
                    if (href !== path_pop) {
                        var path = path_names.join('/')+'/'+href;
                        nav.change_address(path);   
                    }
                    return true;
                }
            // Full URL & matches this siteUrl
                else if (href.search(siteUrl) == 0) {
                    var n = href.split(siteUrl);
                    nav.change_address(n[1]);
                    return true;
                }
                
                return false;
            }
            
            this.nav_transition = function () {              
                $(document).trigger('pre_nav_transition');
                if (debug) console.log('transitioning nav');
            
            // Update the title & nav
                if (nav.active_pages[nav.active_pages.length-1].title) this.updateTitle(nav.active_pages[nav.active_pages.length-1].title);
                if (nav.updateNav) nav.updateNav();
                
            // Check what pages we are exiting
                for (var i = 0; i < this.last_pages.length; i++) {
                    if (debug) console.log('checking last page ' + this.last_pages[i].id);
                
                // For each parent/child page pair, ask the child whether to exit the parent if it's not the active_page
                    if (
                    // The previously active page wasn't requested    
                        !this.active_pages[i] || this.active_pages[i] !== this.last_pages[i]
                    // The child wants to exit it's parent
                        || (this.active_pages[i+1] && this.active_pages[i+1].shouldExitParent(this.active_pages[i]))
                    ) {
                        this.last_pages[i].exit();
                    }
                }
                
             // Check what pages we are entering
                for (var i = 0; i < this.active_pages.length; i++) {
                    if (debug) console.log('checking active page ' + this.active_pages[i].requested_id);
                
                // For each parent/child page pair, ask the child whether to enter the parent each time it's requested
                    if (!this.active_pages[i+1] || this.active_pages[i+1].shouldEnterParent(this.active_pages[i])) this.active_pages[i].requested(i);
                }
                
                $(document).trigger('post_nav_transition');
            }
            
            this.updateTitle = function (title) {
                $.address.title(title + ' | '+this.title);
            }
            
        // helper methods
            this.init_url = function () {                    
                $(document).trigger('pre_init_url');
                
                var callback = function () {
                if (debug) console.log('init url: '+nav.url);
                
                if (nav.url) {                
                // Set nav props
                    if (nav.process_url(nav.url) == true) {
                    // Transition
                        nav.nav_transition();
                    }
                }
                else if (window.url_requested) {
                    nav.url = url_requested;
                    if (nav.process_url(nav.url) == true) {
                    // Transition
                        nav.nav_transition();
                    }
                }
                else {
                    nav.url = '/';
                    if (nav.process_url() == true) {
                    // transition
                        nav.nav_transition();
                    }
                }
            }
                
            // HTML5
                if (this.history_supported) {
                    nav.url = history.state;
                    callback();
                }
            // No HTML5
                else {
                    var url = $.address.value();
                    if (url !== '' && url !== '/') nav.url = url;
                    callback();              
                }
                
                nav.url_initialized = true;   
            }
            
            this.process_url = function (url) {
                $(document).trigger('pre_process_url');
                
                if (debug) {console.log('processing url: url:'+url);}
            // last page
                this.last_pages = this.active_pages;
                this.last_page = this.active_page;
                
            // If there is a url
                if (url && url != '/') {                    
                // Remove leading / and all #
                    url = url.search('/') == 0 ? url.substring(1) : url;
                    url = url.replace('#', '');
                    
                // Prepare an array of url values
                    var pathNames = url.search('/') == -1 ? new Array(url) : url.split('/');
                    if (debug) console.log('processing url: url was passed, path names found: '+pathNames);
                    
                // Set defaults
                    this.active_pages = new Array();
                    
                // Figure out what pages are being requested as children of nav object
                    var page = this;
                    
                // Loop through each path
                    for (var i = 0; i < pathNames.length; i++) {
                    // Does the first page exist?
                    // Check if the id or aliases match
                        page = page.getPage(pathNames[i]);
                        
                        if (page !== false) {
                        // Save the previously requested id and set the current
                            if (page.requested_id) page.last_requested_id = page.requested_id; // save it for dynamic page objects that may need to show and hide a page simulatneously
                            page.requested_id = pathNames[i];
                            if (debug) console.log('processing url: page id of requested path name: ' + page.id);    
                            
                        // Update active pages array
                            this.active_pages[i] = page;
                            if (!pathNames[i+1]) this.active_page = page.id;
                            if (debug) console.log('processing url: found requested page with id: ' + page.id);
                        }
                        else {
                            if (debug) console.log('processing url: COULD NOT find requested page: ' + pathNames[i]);
                            break;
                        }
                    }
                }
            // no url, defaults
                else {
                    if (debug) console.log('processing url: no url was passed using defaults');
                    this.active_page = default_page;
                    
                // Set defaults
                    this.active_pages = new Array(nav.pages[default_page]);
                }

                return true;
            }
        }
    });