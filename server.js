var express = require('express');
var app = express();
var twitter = require('twitter');
var fs = require('fs');
var moment = require('moment');
app.use(express.static('public'));
var client = new twitter({
    consumer_key: process.env.tw_api_key,
    consumer_secret: process.env.tw_api_secret,
    access_token_key: process.env.tw_access_token,
    access_token_secret: process.env.tw_access_token_secret
});
app.get('/image_url', function(req, res) {
    console.log(req);
    if (!req.query.tags) req.query.tags = '';
    if (!req.query.limit) req.query.limit = 20;
    if (!req.query.from) req.query.from = 1;
    //if (req.query.static) res.send(JSON.parse(fs.readFileSync('./sample.json', 'utf8')));
    getMediaUrls(req, res, []);
});
app.get('/image_url_test', function(req, res) {
    //console.log(fs.readFileSync('./sample.json', 'utf8'));
    res.send(JSON.parse(fs.readFileSync('./sample.json', 'utf8')));
});
app.listen(process.env.PORT || 5000);

function getMediaUrls(req, res, result, maxId) {
    let params = {
        screen_name: req.query.screen_name,
        count: 200,
        include_rts: false,
        exclude_replies: true,
        trim_user: true,
        max_id: maxId,
        tweet_mode: 'extended'
    };
    client.get('statuses/user_timeline', params, function(error, tweet, response) {
        if (error) {
            console.log(error);
            return;
        }
        if (tweet.length >= 1) {
            var parsed = parseTweet(tweet, req.query.tags.split(','), req.query.from);
            if (parsed.maxId == maxId) {
                res.send(result);
                return;
            }

            result = result.concat(req.query.ov ?
                parsed.data.filter(x => x.video) :
                parsed.data);
            if (result && result.length > req.query.limit) {
                res.send(result);
                return;
            }
            getMediaUrls(req, res, result, parsed.maxId);
        }
    });
}

function parseTweet(tweet, tags, from) {
    var matrix = tweet.filter(x => tags && tags[0] == '' ? true :
            tags.some(z => x.entities.hashtags.map(y => y.text).indexOf(decodeURIComponent(z)) >= 0))
        .filter(x => x.extended_entities && !moment(x.created_at).isBefore(moment().subtract(from, 'months'))).map(x =>
            x.extended_entities.media.map(y => {
                var videoInfo = y.type == 'video' ? y.video_info.variants.filter(z => z.bitrate) : null;
                return {
                    image: y.media_url_https,
                    video: y.type == 'video' ? videoInfo.filter(z =>
                        z.bitrate == Math.max.apply(null, videoInfo.map(q => q.bitrate)))[0].url : null,
                    text: x.full_text.replace(/(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g, ''),
                    created_at: moment(x.created_at)
                };
            }));
    return {
        data: Array.prototype.concat.apply([], matrix),
        maxId: tweet[tweet.length - 1].id_str
    };
}