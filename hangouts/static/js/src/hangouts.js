/* Javascript for HangoutsXBlock. */
function HangoutsXBlock(runtime, element) {

    function updateCount(result) {
        $('.count', element).text(result.count);
    }

    var handlerUrl = runtime.handlerUrl(element, 'increment_count');

    $('p', element).click(function(eventObject) {
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: updateCount
        });
    });

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
