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
        autoplaySpeed: 3000
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
        variableWidth: true
    });
    $.get('image_url', {
        screen_name: arg.user ? arg.user : "somasomaneko",
        tags: (arg.tags || arg.tags == '') ? arg.tags : "白猫,ミルキー",
        static: location.search.includes('static') ? 't' : null
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

});