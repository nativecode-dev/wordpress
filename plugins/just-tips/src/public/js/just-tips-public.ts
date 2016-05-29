/// <reference path="../../../typings/index.d.ts" />
import {} from 'jquery';

(function ($) {
    'use strict';

    $(function () {
        let tips: JQuery = $('.just-tips');
        tips.each((tip) => {
            $(tip).show();
        });
    });

})(jQuery);
