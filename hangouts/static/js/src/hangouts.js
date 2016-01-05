/* Javascript for HangoutsXBlock. */
function HangoutsXBlock(runtime, element, params) {

    var HANGOUTS_WIDGET_APP_ID = '184219133185',

        YOUTUBE_AVAILABILITY_TIMER = 10, // sec

        HANGOUTS_ROOT_SELECTOR =   '.hangouts-block',
        HANGOUTS_BUTTON_SELECTOR = '.hangouts-button',
        HANGOUTS_TIMER_SELECTOR =  '.hangouts-timer',
        HANGOUTS_DATE_SELECTOR =   '.hangouts-date',
        HANGOUTS_TITLE_SELECTOR =  '.hangouts-title';

    function integerDivision(x, y) {
        return x / y >> 0
    }

    function stamp2string(stamp) {
        var msg = "",
            minuteStamp = 60 * 1000,
            hourStamp = 60 * minuteStamp,
            dayStamp = 24 * hourStamp;

        var days = integerDivision(stamp, dayStamp);
        stamp -= days * dayStamp;
        var hours = integerDivision(stamp, hourStamp);
        stamp -= hours * hourStamp;
        var minutes = integerDivision(stamp, minuteStamp);

        if (days > 0) {
            msg += days + " day" + (days>1?"s ":" ");
        }

        if (hours > 0) {
            msg += hours + " hour" + (hours>1?"s ":" ");
        }

        if (minutes > 0) {
            msg += minutes + " minute" + (minutes>1?"s ":" ");
        }

        return msg;
    }

    function isValidDate(d) {
        if ( Object.prototype.toString.call(d) !== "[object Date]" )
            return false;
        return !isNaN(d.getTime());
    }

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function updateHangoutsTimer() {
        var hangoutsDate = new Date(params.start_date),
            currentDate = new Date(),
            msg = 'and will start in ',
            deltaStamp = Math.abs(hangoutsDate.getTime() - currentDate.getTime());

        if (hangoutsDate < currentDate) {
            msg = 'and is late for '
        }

        msg += stamp2string(deltaStamp);
        $(element).find(HANGOUTS_TIMER_SELECTOR).html(msg);

        $(element).find(HANGOUTS_DATE_SELECTOR).html(
            'Broadcast ' + (hangoutsDate < currentDate?'was':'is')
            + ' scheduled to '
            + hangoutsDate.toString()
        );
    }

    function startHangoutsUpdateTimer() {
        var hangoutsDate = new Date(params.start_date);
        if (isValidDate(hangoutsDate)) {
            updateHangoutsTimer();
            if (hangoutsDate > new Date()) {
                // future date, need to set update timer
                window.hangoutsTimer = setTimeout(startHangoutsUpdateTimer, 60 * 1000);
            }
        } else {
            console.warn('Hangouts Xblock: Error parsing start date');
            $(element).find(HANGOUTS_DATE_SELECTOR).html('');
            $(element).find(HANGOUTS_TIMER_SELECTOR).html('');
        }
    }

    function getYoutubeUrl() {
        console.log('getYoutubeUrl');
        $.post(
            jsonData.getYoutubeUrl,
            {
                'csrfmiddlewaretoken': csrfmiddlewaretoken
            },
            function(data) {
                if (data && data.youtube_url) {
                    createYoutubePlayer(data.youtube_url);
                } else {
                    setTimeout(getYoutubeUrl, YOUTUBE_AVAILABILITY_TIMER * 1000);
                }
            }
        )
    }

    function createYoutubePlayer(videoId) {
        $(element).find(HANGOUTS_ROOT_SELECTOR).html('<iframe id="ytplayer" class="hangouts-youtube" src="http://www.youtube.com/embed/' + videoId + '?autoplay=1" frameborder="0"></iframe>');
    }

    var csrfmiddlewaretoken = getCookie('csrftoken');

    window.gApiOnLoadCallback = function() {
        window.jsonData = {
            saveYoutubeUrl: document.location.origin + runtime.handlerUrl(element, 'save_data_hangouts'),
            getYoutubeUrl: document.location.origin + runtime.handlerUrl(element, 'get_youtube_url')
        }

        var invitesList = [],
            serializedJsonData = JSON.stringify(jsonData);

        if (params.emails_enrolled) {
            for (var i = 0; i < params.emails_enrolled.length; i++) {
                invitesList.push({
                    'id': params.emails_enrolled[i],
                    'invite_type': 'EMAIL'
                });
            }
        }

        if (params.title) {
            $(element).find(HANGOUTS_TITLE_SELECTOR).html(params.title);
        }

        if (params.start_date) {
            startHangoutsUpdateTimer();
        }

        if (params.is_course_staff) {
            var $button = $(element).find(HANGOUTS_BUTTON_SELECTOR);
            //gapi.hangout.onApiReady.add(function(eventObj) {
            gapi.hangout.render($button[0], {
                'render': 'createhangout',
                'hangout_type': 'onair',
                'initial_apps': [{
                     'app_id' : HANGOUTS_WIDGET_APP_ID,
                     'start_data' : serializedJsonData,
                     'app_type' : 'LOCAL_APP'
                }],
                'invites': invitesList,
                'widget_size': 175
            });
            //});
        } else {
            if (params.youtube_url) {
                createYoutubePlayer(params.youtube_url);
            } else {
                getYoutubeUrl();
            }
        }
    }
}
