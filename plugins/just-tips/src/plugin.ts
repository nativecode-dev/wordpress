/// <reference path="../typings/index.d.ts" />
import {} from 'jquery';

(function ($: JQueryStatic) {
    $(function () {

        let tips: JQuery = $('.just-tips');
        tips.each((tip) => {
            $(tip).show();
        });

    });
})(<JQueryStatic>window['jQuery']);
