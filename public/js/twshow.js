$(document).ready(function() {
    var arg = new Object;
    url = location.search.substring(1).split('&');

    for (i = 0; url[i]; i++) {
        var k = url[i].split('=');
        arg[k[0]] = k[1];
    }
    $('.slider-for').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: '.slider',
        autoplay: true,
        autoplaySpeed: 3500,
        pauseOnFocus: false,
        pauseOnHover: false,
    });
    $('.slider-text').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: '.slider'
    });
    $('.slider-nav').slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        asNavFor: '.slider',
        dots: false,
        centerMode: true,
        focusOnSelect: true,
        variableWidth: true,
        swipeToSlide: true
    });

    $('.fullscreeen-icon').on('click', function() {

        $('.fullscreeen-icon').toggle();
        toggleFullscreen(document.documentElement);
    });
    $.get('image_url', {
        screen_name: arg.user ? arg.user : "somasomaneko",
        tags: arg.tags,
        text: arg.text,
        static: location.search.includes('static') ? 't' : null,
        ov: location.search.includes('ov') ? 't' : null,
        limit: arg.limit ? arg.limit : 100,
        from: arg.from
    }, function(data) {
        data.map((x, i) => {
            $('.slider-for').slick('slickAdd', x.video != null ? '<div id="for_' +
                i + '" ><video class="main" src="' + x.video + '" muted/></div>' :
                '<div id="for_' + i + '" ><img class="main" src="' + x.image +
                '"/></div>');
            $('.slider-nav').slick('slickAdd', '<div><p><img id="nav_' + i +
                '" src="' + x.image + '"></p></div>');
            $('.slider-text').slick('slickAdd', '<div><p class="tweet">' + x.text + '</p></div>');
            if (x.video != null) {
                $('#for_' + i).children('video').on('pause', function() {
                    $('.slider-for').slick('slickNext');
                });
            }
        });
    });
    $('.slider-for').on('afterChange', function(slick, slideState) {
        var video = $('#for_' + slideState.currentSlide).children('video');
        if (video.length) {
            video.get(0).play();
            $('.slider-for').slick('slickPause');
        }
    });
    $('.slider-for').on('beforeChange', function(slick, slideState) {

        $('.slider-for').slick('slickPlay');
        var video = $('#for_' + slideState.currentSlide).children('video');
        if (video.length) {
            video.get(0).pause();;
        }
    });
    $('.slider-for').on('click', function() {
        var request = toggleFullscreen($('.slick-active > .main').get(0));

        $('.slider-for').slick(request ? 'slickPause' : 'slickPlay');
    });

});

function toggleFullscreen(elem) {
    if (elem == document.documentElement) {
        if (isNotFullScreen()) {
            requestFullScreen(elem);
            return true;
        } else {
            exitFullScreen();
            return false;
        }
    } else {
        if (isNotFullScreen()) {
            requestFullScreen(elem);
            return true;
        } else if (getFullScreenElement() == document.documentElement) {
            requestFullScreen(elem);
            return true;
        } else {
            exitFullScreen();
            return false;
        }
    }
}

function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

function requestFullScreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}

function isNotFullScreen() {
    return !document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement;
}

function getFullScreenElement() {
    if (document.fullscreenElement) {
        return document.fullscreenElement;
    }
    if (document.mozFullScreenElement) {
        return document.mozFullScreenElement;
    }
    if (document.webkitFullscreenElement) {
        return document.webkitFullscreenElement;
    }
    if (document.msFullscreenElement) {
        return document.msFullscreenElement;
    }
    return null;
}