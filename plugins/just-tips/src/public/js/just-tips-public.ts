import 'jquery';

(function ($) {
    'use strict';

    $(function () {
        let tips: JQuery = $('.just-tips');
        tips.each((tip) => {
            $(tip).show();
        });
    });

})(jQuery);
