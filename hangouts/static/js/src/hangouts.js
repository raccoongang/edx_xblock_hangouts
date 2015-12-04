/* Javascript for HangoutsXBlock. */
function HangoutsXBlock(runtime, element) {
    var saveYoutubeUrl = runtime.handlerUrl(element, 'save_youtube_url');
    var getYoutubeUrl = runtime.handlerUrl(element, 'get_youtube_url');

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

    var csrfmiddlewaretoken = getCookie('csrftoken');

    window.gApiOnLoadCallback = function() {
        console.log('gapi ready, ', arguments);
        var $container = $(element).find('.hangouts_button')
        if ($container.length) {
            //gapi.hangout.onApiReady.add(function(eventObj) {
                gapi.hangout.render($container[0], {
                    'render': 'createhangout',
                    'hangout_type': 'onair',
                    // 'initial_apps': [{
                    //     'app_id' : '184219133185',
                    //     'start_data' : 'dQw4w9WgXcQ',
                    //     'app_type' : 'ROOM_APP'
                    // }],
                    'widget_size': 175
                });
            //});
        }
    }

    $(function ($) {
        /* Here's where you'd do things on page load. */
    });
}
