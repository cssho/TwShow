$(document).ready(function () {
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

    var isFullScreen = false;
    $('.fullscreeen-icon').on('click', function () {
        $('.fullscreeen-icon').toggle();
        var isFullScreen = toggleFullscreen(document.documentElement);

        $('.slider-for').css('width', isFullScreen ? '70%' : '');
        $('.right-container').css('width', isFullScreen ? '30%' : '');
        $('.slide-nav').css('display', isFullScreen ? 'none' : '');
    });

    $('.reload-icon').on('click', function () {
        loadFromWeb(arg);
    });
    var isPause = false;
    $('.pp-icon').on('click', function () {
        isPause = !isPause;
        $('.slider-for').slick(isPause ? 'slickPause' : 'slickPlay');
    });

    $('a[data-modal]').click(function (event) {
        var tbody = $('#setting-table tbody');
        tbody.empty();
        $.each(JSON.parse(localStorage.getItem(url)), function (i, x) {
            tbody.append(
                $("<tr>")
                    .append($("<td>").append($('<input type="checkbox" />').prop('checked', x.isVisible)))
                    .append($("<td>").append($('<img>').prop('src', x.image).addClass('setting-img'))));
        });
        $(this).modal();
        return false;
    });

    $('#save-setting').on('click', function () {
        var rows = $('#setting-table tbody tr');
        var saveData = JSON.parse(localStorage.getItem(url));
        saveData.forEach((x, i) => x.isVisible = $(rows[i]).find('input').prop('checked'));
        localStorage.setItem(url, JSON.stringify(saveData));
        setData(saveData);
        $.modal.close();
    });

    var data = localStorage.getItem(url);
    if (data) {
        setData(JSON.parse(data));
    } else {
        loadFromWeb(arg);
    }
    $('.slider-for').on('afterChange', function (slick, slideState) {
        var video = $('#for_' + slideState.currentSlide).children('video');
        if (video.length) {
            video.get(0).play();
            $('.slider-for').slick('slickPause');
        }
    });
    $('.slider-for').on('beforeChange', function (slick, slideState) {

        $('.slider-for').slick('slickPlay');
        var video = $('#for_' + slideState.currentSlide).children('video');
        if (video.length) {
            video.get(0).pause();;
        }
    });
    $('.slider-for').on('click', function () {
        var request = toggleFullscreen($('.slick-active > .main').get(0));

        $('.slider-for').slick(request ? 'slickPause' : 'slickPlay');
    });

});

function loadFromWeb(arg) {
    $('.reload-icon').css('animation', 'sp-anime 1.5s linear infinite');
    $.get('image_url', {
        screen_name: arg.user ? arg.user : "somasomaneko",
        tags: arg.tags,
        text: arg.text,
        ov: location.search.includes('ov') ? 't' : null,
        limit: arg.limit ? arg.limit : 100,
        from: arg.from
    }, function (data) {
        localStorage.setItem(url, JSON.stringify(data));
        setData(data);
        $('.reload-icon').css('animation', '');
    });
}

function setData(data) {
    data.filter(x => x.isVisible).map((x, i) => {
        $('.slider-for').slick('slickAdd', x.video != null ? '<div id="for_' +
            i + '" ><video class="main" src="' + x.video + '" muted/></div>' :
            '<div id="for_' + i + '" ><img class="main" src="' + x.image +
            '"/></div>');
        $('.slider-nav').slick('slickAdd', '<div><p><img id="nav_' + i +
            '" src="' + x.image + '"></p></div>');
        $('.slider-text').slick('slickAdd', '<div><p class="tweet">' + x.text + '</p></div>');
        if (x.video != null) {
            $('#for_' + i).children('video').on('pause', function () {
                $('.slider-for').slick('slickNext');
            });
        }
    });
}

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