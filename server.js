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
app.get('/image_url', async function (req, res) {
    console.log(req);
    if (!req.query.tags) req.query.tags = '';
    if (!req.query.text) req.query.text = '';
    if (!req.query.from) req.query.from = 1;
    var result = [];
    for (const sn of req.query.screen_names) {
        const data = await getMediaUrls(req, res,  sn);
        result = result.concat(data);
    }

    res.send(result);
});
app.listen(process.env.PORT || 5000);

async function getMediaUrls(req, res,  sn, maxId) {
    let params = {
        screen_name: sn,
        count: 200,
        include_rts: false,
        exclude_replies: false,
        trim_user: true,
        max_id: maxId,
        tweet_mode: 'extended'
    };
    const tweet = await client.get('statuses/user_timeline', params);
    if (tweet.length >= 1) {
        var parsed = parseTweet(tweet, req.query.tags.split(','), req.query.from, req.query.text.split(','));
        if (parsed.maxId == maxId) {
            return [];
        }
        return parsed.data.concat(await getMediaUrls(req, res, sn, parsed.maxId));
    }

}

function parseTweet(tweet, tags, from, text) {
    var matrix = tweet.filter(x => tags && tags[0] == '' ? true :
        tags.some(z => x.entities.hashtags.map(y => y.text).indexOf(decodeURIComponent(z)) >= 0))
        .filter(x => text && text[0] == '' ? true :
            text.some(z => x.full_text.indexOf(decodeURIComponent(z)) >= 0))
        .filter(x => x.extended_entities && !moment(x.created_at).isBefore(moment().subtract(from, 'months'))).map(x =>
            x.extended_entities.media.map(y => {
                var videoInfo = y.type == 'video' ? y.video_info.variants.filter(z => z.bitrate) : null;
                return {
                    image: y.media_url_https,
                    video: y.type == 'video' ? videoInfo.filter(z =>
                        z.bitrate == Math.max.apply(null, videoInfo.map(q => q.bitrate)))[0].url : null,
                    text: x.full_text.replace(/(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g, '')
                        .replace(/#\S+\s*/g, ''),
                    created_at: moment(x.created_at),
                    isVisible: true
                };
            }));
    return {
        data: Array.prototype.concat.apply([], matrix),
        maxId: tweet[tweet.length - 1].id_str
    };
}
