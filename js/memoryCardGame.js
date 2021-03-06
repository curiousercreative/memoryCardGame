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
        nav.animationDuration = 500;
    
    //
        nav.Page.prototype.show_page_slide = function (duration) {
            if (debug) console.log('showing page using scroll method:'+this.id);
            duration = typeof(duration) !== 'number' ? animation_duration : duration;
            var page_container = this.jObj.parent().is('#page_play') ? $('#page_play') : $('#page_container');
            
        // Stop the current scroll
            page_container.stop(true);
        
        // Workaround for IE8
            var target = !nav.ie8 ? '#page_'+this.id : page_container.scrollLeft() + $('#page_'+this.id).position().left;
            page_container.scrollTo(target, {
                axis: 'x',
                duration: duration
            });
        }
        
        nav.Page.prototype.hide_page_slide = function () {}
    
    // ------- Create our page objects and override any Page methods
    // Play page
        nav.pages.play = new nav.Page('play', {aliases: ['landing', 'home', '', 'game', '*'], title: 'Play', defaultTransition: 'slide'});
        nav.pages.play.pre_initialize = function () {
            if (debug) console.log('pre_initializing page with id:'+this.id);
            
        // get hi score from cookie
            if ($.cookie('hiScore')) this.score.setHiScore($.cookie('hiScore'));
        }
        
        nav.pages.play.pre_enter = function () {
            if (debug) console.log('pre_entering page with id:'+this.id);
        }
        
        nav.pages.play.pre_exit = function () {
            if (debug) console.log('pre_exiting page with id:'+this.id);
        }
        
        nav.pages.play.pre_resize = function () {
            this.jObj.scrollTo('#page_'+nav.active_page, {axis: 'x'});
        }
        
        nav.pages.play.matchMissActive = false;
        nav.pages.play.matchMissTimeout;
        nav.pages.play.timer = {
            lastTime: 0,
            interval: 0,
            startTime: 0,
            jObj: $('#timer'),
            start: function () {
                this.startTime = this.getTime();
                this.interval = setInterval(function () {nav.pages.play.timer.increment();}, 1000);
            },
            
            stop: function () {
                clearInterval(this.interval);
            },
            
            getTime: function () {
                var now = new Date().getTime() / 1000;
                var start = this.startTime;
                var time = now - start;
                return time;
            },
            
            setTime: function (formattedTime) {
                this.jObj.html(formattedTime);
            },
            
            formatTime: function (secondsRaw) {
                var minutes = parseInt(secondsRaw / 60, 10);
                var seconds = minutes > 0 ? secondsRaw - minutes*60 : secondsRaw;
                minutes = minutes > 9 ? minutes : '0'+minutes;
                seconds = seconds > 9 ? Math.round(seconds) : '0'+Math.round(seconds);
                return minutes+':'+seconds;
            },
            
            reset:function () {
                this.lastTime = this.getTime();
                this.setTime('00:00');
                this.startTime = 0;
            },
            
            restart: function () {
                this.stop();
                this.reset();
                this.start();
            },
            
            increment: function () {
                var secondsRaw = this.getTime();
                var formattedTime = this.formatTime(secondsRaw);
                this.setTime(formattedTime);
            }
        }
        
        nav.pages.play.score = {
            currentPenalty: 0,
            currentParTime: 0,
            penalty: {
                easy: 3,
                medium: 2,
                hard: 1
            },
            parTime: {
                easy: 30,
                medium: 210,
                hard: 450
            },
            matchMade: function () {
                var score = this.getScore();
                
            // Calculate the factor by which this match was made before the par time
                var bonus = this.currentParTime / nav.pages.play.timer.getTime();
                
            // Award a bonus for making matches under par time in the form of a multiplier
                var bonus = bonus > 1 ? bonus : 1;
                
                score += 20*bonus;
                this.setScore(score);
            },
            matchMiss: function () {
                var score = this.getScore();
                score -= this.currentPenalty;
                this.setScore(score);
            },
            setScore: function (score) {
                $('#scoreCurrent').html(Math.round(score));
            },
            getScore: function () {
                return parseInt($('#scoreCurrent').html(), 10);
            },
            getHiScore: function () {
                return parseInt($('#scoreHigh').html(), 10);  
            },
            setHiScore: function (score) {
                $('#scoreHigh').html(Math.round(score));
                $.cookie('hiScore', Math.round(score));
            },
            checkHiScore: function () {
                var hiScore = this.getHiScore();
                var score = this.getScore();
                
                if (score > hiScore) {
                    this.setHiScore(score);
                }
            },
            reset: function () {
                this.checkHiScore();
                this.setScore(0);
            },
            gameWon: function () {
                var score = this.getScore();
                
            // Calculate the factor by which this match was made before the par time
                var bonus = this.currentParTime / nav.pages.play.timer.getTime();
                
            // Award a bonus for making matches under par time in the form of a multiplier
                var bonus = bonus > 1 ? bonus : 1;
                
                score += 1000*bonus;
                this.setScore(score);
                
            // Check hi score
                this.checkHiScore();
            }
        }
        
        nav.pages.play.generateGame = function (difficulty) {
            // copy our colors array
            var cardsPossible = [];
            var cardsShuffled = [];
            var colors = $.extend([], nav.pages.play.pages[difficulty].colors);
            switch (difficulty) {
            // hard and medium share method
                case "hard":
                case "medium":
                    var patterns = $.extend([], nav.pages.play.pages[difficulty].patterns);
                    
                // We'll add all of the colors in as many times as there are variation in pattern
                // once for each pattern to combine with
                // 1. Add all of our none colored cards
                    cardsPossible = $.extend([], nav.shuffleArray(colors));
                    
                // 2(3,4) For each color, add it in each available pattern
                    for (var i = 0; i < colors.length; i++) {
                        for (var ii = 0; ii < patterns.length; ii++) {
                            cardsPossible.push(colors[i]+" "+patterns[ii]);
                        }
                    }
                    
                // Shuffle it once altogether and we have every card in the deck once
                    //cardsShuffled = cardsPossible.concat(nav.shuffleArray(cardsPossible));
                    
                    break;
            
            // easy is a simpler method
                case "easy":
                    cardsPossible = $.extend([], colors);
                
                // Shuffle the cards once into our deck
                    cardsShuffled = cardsPossible.concat(nav.shuffleArray(cardsPossible));
            }
                    
        // Now we have all of the cards in our deck but just once
        // Let's shuffle the cards and add them to our deck again to have 2 of each
            cardsShuffled = cardsPossible.concat(nav.shuffleArray(cardsPossible));
            
        // Let's shuffle it once more so they aren't divided and predictable to find
            nav.shuffleArray(cardsShuffled);
            
        // Now let's add them to the DOM            
            $.each(cardsShuffled, function (key, val) {
                // Add each card
                $('#page_'+difficulty).append('<div data-id="'+val+'" class="card '+val+'"></div>');
            });
        }
        nav.pages.play.startGame = function (difficulty) {
        // clear game
            this.clearGame(difficulty);
            
        // generate game
            this.generateGame(difficulty);
        
        // event handlers
            this.onCardClick(difficulty);
            
        // start timer
            this.timer.reset();
            this.timer.start();
            
        // score init
            this.score.currentPenalty = this.score.penalty[difficulty];
            this.score.currentParTime = this.score.parTime[difficulty];
        }
        
        nav.pages.play.stopGame = function (difficulty, gameWon) {
        
        // event handler unbind
            $('#page_'+difficulty+' .card').not('.matched').off('click');
        
        // Enter score into high score    
        
        // stop timer
            this.timer.stop();
        }
        
        nav.pages.play.clearGame = function (difficulty) {
        // Remove the markup
            $('#page_'+difficulty).html('');
            
        // reset score
            this.score.reset();
        }
        
        nav.pages.play.checkMatch = function () {
            // match
            if ($('#page_'+nav.active_page+' .card.flipped:not(.matched)').first().attr('data-id') == $('#page_'+nav.active_page+' .card.flipped:not(.matched)').last().attr('data-id')) {
                this.matchMade();
            }
            // not match
            else {
                this.matchMiss();
            }
            
            // is game over?
            if (!$('#page_'+nav.active_page+' .card:not(.matched)').exists()) {
                this.stopGame();
                this.gameWon();
            }
        }
        
        nav.pages.play.matchMiss = function () {
        // set a flag in case user is trigger happy
            this.matchMissActive = true;
        
        // remove flipped class in time
            this.matchMissTimeout = setTimeout(function () {
                nav.pages.play.matchMissReset();
            }, 1000);
            
        // deduct points
            this.score.matchMiss();
        }
        
        nav.pages.play.matchMade = function () {
        // remove event listener, add class
            $('#page_'+nav.active_page+' .card.flipped:not(.matched)').addClass('matched').off('click');
            
        // add points
            this.score.matchMade();
        }
        
        nav.pages.play.matchMissReset = function () {
            $('#page_'+nav.active_page+' .card.flipped:not(.matched)').removeClass('flipped');
            this.matchMissActive = false;
            clearTimeout(this.matchMissTimeout);
        }
        
        nav.pages.play.onCardClick = function (difficulty) {
            $('#page_'+difficulty+' .card').not('.matched').off('click').on('click', function () {
            // Check for a match miss that's waiting to reset
                if (nav.pages.play.matchMissActive) nav.pages.play.matchMissReset();
            
            // Make sure this isn't flipped
                if (!$(this).hasClass('flipped')) {
                // Flip it over
                    $(this).addClass('flipped');
                    
                // Does it have a flipped pair buddy already?
                    var pair = $(this).siblings('.flipped').not('.matched');
                    if (pair.exists()) {
                        nav.pages.play.checkMatch();
                    }
                }
            });
        }
        
        nav.pages.play.gameWon = function () {
        // check hi score
            this.score.gameWon();
        }
        
        // Subpages
            //Easy
            nav.pages.play.pages.easy = new nav.Page('easy', {title: 'Easy', defaultTransition: 'slide'});
            nav.pages.play.pages.easy.pre_enter = function () {
                if (debug) console.log('pre_entering page with id:'+this.id);
                nav.pages.play.startGame(this.id);
            }
            
            nav.pages.play.pages.easy.pre_exit = function () {
                if (debug) console.log('pre_entering page with id:'+this.id);
                nav.pages.play.stopGame(this.id);
            }
        
            nav.pages.play.pages.easy.colors = [
                "red",
                "green",
                "blue",
                "yellow",
                "purple",
                "pink",
                "brown",
                "orange"
            ];
            
            //Medium
            nav.pages.play.pages.medium = new nav.Page('medium', {title: 'Medium', defaultTransition: 'slide'});
            nav.pages.play.pages.medium.pre_enter = function () {
                if (debug) console.log('pre_entering page with id:'+this.id);
                nav.pages.play.startGame(this.id);
            }
            
            nav.pages.play.pages.medium.pre_exit = function () {
                if (debug) console.log('pre_entering page with id:'+this.id);
                nav.pages.play.stopGame(this.id);
            }
            nav.pages.play.pages.medium.colors = [
                "red",
                "green",
                "blue",
                "yellow",
                "purple",
                "pink",
                "brown",
                "orange",
                "cyan"
            ];
            nav.pages.play.pages.medium.patterns = [
                //"none",
                "checkered"
            ];
            
            //Hard
            nav.pages.play.pages.hard = new nav.Page('hard', {title: 'Hard', defaultTransition: 'slide'});
            nav.pages.play.pages.hard.pre_enter = function () {
                if (debug) console.log('pre_entering page with id:'+this.id);
                nav.pages.play.startGame(this.id);
            }
            
            nav.pages.play.pages.hard.pre_exit = function () {
                if (debug) console.log('pre_entering page with id:'+this.id);
                nav.pages.play.stopGame(this.id);
            }
            
            nav.pages.play.pages.hard.colors = [
                "red",
                "green",
                "blue",
                "yellow",
                "purple",
                "pink",
                "brown",
                "orange"
            ];
            
            nav.pages.play.pages.hard.patterns = [
                //"none",
                "checkered",
                "striped",
                "diagonal"
            ];
        
    // Instructions page
        nav.pages.instructions = new nav.Page('instructions', {title: 'Instructions', defaultTransition: 'slide'});
        nav.pages.instructions.pre_enter = function () {
            if (debug) console.log('pre_entering page with id:'+this.id);
            
            $.cookie('instructions_shown', 'true');
        }
    // Hi-Score page
        nav.pages.hiscore = new nav.Page('hi-score', {title: 'Hi-Score', defaultTransition: 'slide'});
    
    // App specific methods
        /**
        * Thanks to Laurens Holst: http://stackoverflow.com/a/12646864
        * Randomize array element order in-place.
        * Using Fisher-Yates shuffle algorithm.
        */
        nav.shuffleArray = function (array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }
    
    // General methods
        nav.set_font_size = function () {
            nav.font_size = $(window).width()*0.011111111111111111;
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
            
            if (nav.checkZoom(nav.getZoom())) {            
                nav.set_font_size();
            }
            
            
        // resize active pages
            if (nav.active_pages && nav.active_pages.length > 0) {
                for (var i = 0; i < nav.active_pages.length; i++) {
                    nav.active_pages[i].resize();
                }
            }
            
        // Scroll to the right place
            if (nav.active_pages[0]) $('#page_container').scrollTo('#page_'+nav.active_pages[0].id, {axis: 'x'});
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
        
        nav.updateNav = function () {
            if (debug) console.log('updating nav');
        
        // Out with the old
            $('a.active').removeClass('active');
            
            var search = nav.active_pages.length > 1 ? '/play/'+this.active_page : '/'+this.active_page;
            var nav_active = $('');
            console.log(search);
            $('a').each(function () {
                if ($(this).attr('href').search(search) == 0) {
                    $(this).addClass('active');
                }
            });
            
        
            
        
        }
        
    // initialize site
        nav.initialize_site();
    });