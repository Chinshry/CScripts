// ==UserScript==
// @name         豆瓣评分人数展示
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  豆瓣网页版 选电影和电视剧TAB 新增评分人数、观看状态标签、去广告
// @author       cccccc
// @match        https://movie.douban.com/tv*
// @match        https://movie.douban.com/explore*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("hello");
    setTimeout(function () {
        function setGlobalStyle() {
            var css = '.article, .list, .list-wp {width:auto !important}';
            css += '.item {width:175px !important; white-space:nowrap !important}'
            css += '.cover-wp {height:0 !important;padding-bottom:140% !important;position:relative}'
            var head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            head.appendChild(style);
            $('.aside').remove();
            $('.extra').remove();
        }

        async function addScore(index) {
            var items = $('.item');

            $.each(items, function (i, node) {
                if (i < index) {
                    return true;
                }
                let id = $(node).attr('href').split("/")[4];
                $.ajax({
                    type: 'GET',
                    url: 'https://m.douban.com/rexxar/api/v2/tv/' + id + '?ck=8pGV&for_mobile=1',
                    headers: {
                        "Content-Type": "text/html; charset=utf-8",
                    },
                    success: function (response) {
                        let rate = response.rating.count;
                        $(node).children().eq(1).append(`<p>评分人数 <strong>${rate == '' ? '未知':rate}</strong></p>`);

                        if (response.interest == null) {
                             await getStatus(node, id);
                             // return
                        }
                        console.log("222 ");
                        let text = response.interest.status;
                        let status = '';
                        if (text == 'done') {
                            status = "看过";
                            bgColor = '#c9c9c9';
                        } else if (text == 'doing') {
                            status = "在看";
                            bgColor = '#89c6ff';
                        } else if (text == 'mark') {
                            status = "想看";
                            bgColor = '#e6c76a';
                        }
                        $(node).children().eq(0).append(`<div style="position:absolute;right: 5px;bottom: 8px;background-color: ${bgColor};color: black;padding: 1px 4px;border-radius: 4px;">${status}</div>`);
                    },
                    onerror: function (err) {
                        console.log("错误 " + err);
                    }
                });
            })
        }

        function getStatus(node, id) {
            $.ajax({
                type: 'GET',
                url: 'https://movie.douban.com/j/subject_abstract?subject_id=' + id,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                },
                success: function (response) {
                    let text = response.subject.collection_status;
                    let cover = $(node).children().eq(0);
                    let status = '';
                    let bgColor = '';
                    if (text == 'P') {
                        status = "看过";
                        bgColor = '#c9c9c9';
                    } else if (text == 'N') {
                        status = "在看";
                        bgColor = '#89c6ff';
                    } else if (text == 'F') {
                        status = "想看";
                        bgColor = '#e6c76a';
                    }
                    cover.append(`<div style="position:absolute;left: 5px;bottom: 8px;background-color: ${bgColor};color: black;padding: 1px 4px;border-radius: 4px;">${status}</div>`);
                    console.log("111");
                },
                onerror: function (err) {
                    console.log("错误 " + err);
                }
            });
        }


        $(":radio").click(function(){
            setTimeout(function () {
                addScore(0);
            }, 2000)
        })

        setGlobalStyle();
        addScore(0);

        $('.more').click(function() {
            let start = $('.item').length;
            setTimeout(function () {
                addScore(start);
            }, 2000)
        });
    }, 2000)
})();