// ==UserScript==
// @name         兔兔兔区+
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  屏蔽用户|屏蔽帖子|发帖记录直达|快捷举报|楼主标记|只看楼主只看TA|白色主题去广告|链接可点击|顶部底部直达
// @author       cccccc
// @include      https://bbs.jjwxc.net/bindex.php*
// @include      https://bbs.jjwxc.net/board.php*
// @include      https://bbs.jjwxc.net/newpost.php*
// @include      https://bbs.jjwxc.net/showmsg.php*
// @include      https://bbs.jjwxc.net/search.php*
// @include      https://bbs.jjwxc.net/filterword.php*
// @include      https://bbs.jjwxc.net/userinfo.php*
// @include      https://bbs.jjwxc.net/postbypolice.php*
// @updateURL    https://raw.github.com/cccccchin/MyScripts/master/%E5%85%94%E5%85%94%E5%85%94%E5%8C%BA%2B.js
// ==/UserScript==


const up_button_icon = "https://s1.ax1x.com/2020/08/12/aXfqW4.png";
const down_button_icon = "https://s1.ax1x.com/2020/08/12/aXfhyn.png";
const bgColor = "#FFFFFF";
const bgCss = { "background-color": bgColor };
const borderCss = { "border-color": bgColor, "border": "none" };

const pathname = window.location.pathname;
const IS_NEWPOST = pathname.indexOf('newpost') >= 0;
const IS_BOARD = IS_NEWPOST || pathname.indexOf('board') >= 0;
const IS_POST = pathname.indexOf('showmsg') >= 0;
const IS_SEARCH = pathname.indexOf('search') >= 0;
const IS_FILTER = pathname.indexOf('filterword') >= 0;
const BOARD_ID = IS_BOARD || IS_POST || IS_SEARCH ? getPageParams('board') : '';
const POST_ID = IS_POST ? getPageParams('id') : '';
const BOARD_TYPE = IS_BOARD ? getPageParams('type') : '';

console.log("BOARD_ID = " + BOARD_ID);
console.log("POST_ID = " + POST_ID);

var Style = {
    init() {
        addGlobalStyle('body', bgCss);
        addGlobalStyle('.blockUI.blockMsg', bgCss);
        addGlobalStyle('.blockUI.blockMsg', { border: "1px solid #000000" });
        addGlobalStyle('tr', bgCss);
        addGlobalStyle('td', bgCss);
    },
    removeAD() {
        $('.width_300').parent().remove();
    },
    board() {
        Style.removeAD()
        const reportNode = document.createElement('script');
        reportNode.type = 'text/javascript';
        reportNode.src = '/scripts/userreport.js?ver=20200202';
        document.head.appendChild(reportNode);
        if (IS_NEWPOST){
            const blockUItNode = document.createElement('script');
            blockUItNode.type = 'text/javascript';
            blockUItNode.src = '//static.jjwxc.net/scripts/jquery.blockUI.pack.js';
            document.head.appendChild(blockUItNode);
        }

        addGlobalStyle('a:link', { color: '#161616' });
        addGlobalStyle('a:visited', { color: '#808080' });
        addGlobalStyle('a:hover', { color: '#bf7326' });

        addGlobalStyle('a.board-bam:link', { color: '#669900' });
        addGlobalStyle('a.board-bam:hover', { color: '#bf7326' });

        addGlobalStyle('a.board-report:link', { color: '#669900' });
        addGlobalStyle('a.board-report:hover', { color: '#bf7326' });
    },
    search() {
        Style.removeAD();
        addGlobalStyle('table', { "border-color": bgColor });
    },
    page() {
        addGlobalStyle('.page-reply:link', { color: '#000000' });
        addGlobalStyle('.page-reply:hover', { color: '#bf7326' });
        addGlobalStyle('.page-reply:visited', { color: '#808080' });
        addGlobalStyle('table', borderCss);
        addGlobalStyle('td', borderCss);
        for (var i = 1; i < 25; i++) {
            changeImgBg(i)
        }
        $('#imgurl').remove()
        $('.textbook').remove()
    },
    filter() {
        addGlobalStyle('b', { "margin-left": '15px' });
    }
}

function addGlobalStyle(node, styleParams) {
    var styleStr = JSON.stringify(styleParams)
    var styleF = styleStr.replace(/"([^"]*)"/g, "$1").replace(/[,]/g, ' !important;').replace('}', ' !important}');
    var css = node + styleF;
    // console.log(css);
    var head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function changeImgBg(imgId) {
    var styleStr = JSON.stringify(styleParams)
    var styleParams = {
        "background-image": "url(img/grzx/" + imgId + ".png)",
        "background-size": "100%",
        "background-position": "0 0"
    }
    addGlobalStyle('.image' + imgId, styleParams);
}

function getPageParams(key, url) {
    if (typeof (url) == "undefined") {
        var search = window.location.search;
        var str = search.substring(1, search.length);
    } else {
        var str = url.split("?")[1];
    }
    let arr = str.split("&");
    let obj = new Object();
    for (let i = 0; i < arr.length; i++) {
        let tmp_arr = arr[i].split("=");
        if (tmp_arr[0] == "keyword") {
            obj[tmp_arr[0]] = tmp_arr[1];
        } else {
            obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
        }
    }
    return obj[key];
}

function initStyle() {
    Style.init();
    if (IS_BOARD) {
        Style.board();
    } else if (IS_POST) {
        Style.page();
    } else if (IS_SEARCH) {
        Style.search();
    } else if (IS_FILTER) {
        Style.board();
        Style.filter();
    } else {
        Style.removeAD();
    }
}


initStyle()

$(function () {
    var initNodes = {
        board() {
            $('#subidform_submit').find('button').eq(0).text("屏蔽设置");
            let nodes = $('#msglist').children().children().toArray();

            if (IS_NEWPOST){
                nodes = $('body').find('table').eq(2).children().children().toArray();
            }
            let blockPosts = localStorage['BlockPosts'] || '';
            let blockUsers = localStorage['BlockUsers'] || '';
            nodes.shift();
            for (let node of nodes) {
                let reportNode = $(node).find('td').eq(1);
                let titleNode = $(node).find('td').eq(3);
                let authorNode = $(node).find('td').eq(4);
                let title = titleNode[0].innerText;
                let url = $(titleNode).children().attr('href');
                if (url == undefined) {
                    url = $(titleNode).children().eq(1).attr('href');
                }
                let id = getPageParams('id', url);
                let authorName = $.trim($(authorNode).text())

                $(reportNode).children().remove();
                $(reportNode).append(`<a class="board-bam" id="${id}" board="${BOARD_ID}" data="${title}" href="javascript:void(0);" style = "font-size:14px">屏蔽</a>`);
                $(reportNode).append(`<a class="board-report" href="javascript:;" onclick="userreportshow(${id}, 0, 0, ${BOARD_ID})" style = "font-size:14px">举报</a>`);
                $(authorNode).html("");

                $(authorNode).append(`<a class="board-author" href="https://bbs.jjwxc.net/search.php?act=search&board=${BOARD_ID}&keyword=${authorName}&topic=4" target="_blank">&nbsp${authorName}</font></a>`);

                if (blockPosts !== '') {
                    var blockPostsJs = JSON.parse(blockPosts);
                    if (blockPostsJs.hasOwnProperty(id)) {
                        $(node).remove();
                        console.log("已隐藏帖子 " + title);
                    }
                }
                if (blockUsers !== '') {
                    var blockUsersJs = JSON.parse(blockUsers);
                    if (blockUsersJs.indexOf(authorName) != -1) {
                        $(node).remove();
                        console.log("已隐藏 " + authorName + " 发的帖子 " + title);
                    }
                }
            }
        },
        page() {
            var lzIdenti = $('.authorname').eq(0).find('font').eq(2).text();
            console.log("楼主 " + lzIdenti);
            let title = $('#msgsubject').text().split("主题：")[1]
            let blockUsers = localStorage['BlockUsers'] || '';

            $('.authorname').each(function (index, node) {
                if (index == 0) {
                    var lzAuthornameNode = $('.authorname').eq(0);
                    $(node).find('a').eq(0).after(`<a class="board-bam" id="${POST_ID}" board="${BOARD_ID}" data="${title}" href="javascript:void(0);" style = "font-size:14px; margin-left:8px">屏蔽该帖</a>`);
                }

                var replyIdNode = $(node).find('font').eq(2)
                var star = $(node).find('font').eq(-1)
                $(star).remove()

                var replyNameNode = $(replyIdNode).parent().contents()
                    .filter(function () {
                        return this.nodeType == Node.TEXT_NODE;
                    });
                var replyName = replyNameNode[0].wholeText.split("|")[0]

                var displayName;
                if ($(replyIdNode).text() == lzIdenti) {
                    displayName = "[楼主]" + replyName;
                } else {
                    displayName = replyName;
                }
                $(replyIdNode).prev().after(`<a class="page-reply" id="replyName_${replyName}" href="https://bbs.jjwxc.net/search.php?act=search&board=${BOARD_ID}&keyword=${replyName}&topic=4" target="_blank">${displayName}</a>`);
                $(replyNameNode)[0].remove()

                if (index == 0) {
                    $(".board-bam").after(`<a class="board-only-show-user" data="${replyName}" href="javascript:void(0);" style = "font-size:14px; margin-left:8px">只看楼主</a>`);
                    $(".board-bam").after(`<a class="board-bam-user-temp" data="${replyName}" href="javascript:void(0);" style = "font-size:14px; margin-left:8px">隐藏TA</a>`);
                    $(".board-bam").after(`<a class="board-bam-user" data="${replyName}" href="javascript:void(0);" style = "font-size:14px; margin-left:8px">屏蔽TA</a>`);
                } else {
                    $(node).next().prepend(`<a class="board-only-show-user" data="${replyName}" href="javascript:void(0);" style = "font-size:14px; margin-left:8px">只看TA</a>`);;
                    $(node).next().prepend(`<a class="board-bam-user-temp" data="${replyName}" href="javascript:void(0);" style = "font-size:14px; margin-left:8px">隐藏TA</a>`);
                    $(node).next().prepend(`<a class="board-bam-user" data="${replyName}" href="javascript:void(0);" style = "font-size:14px; margin-left:8px">屏蔽TA</a>`);
                }

                if (blockUsers !== '') {
                    var blockUsersJs = JSON.parse(blockUsers);
                    if (blockUsersJs.indexOf(replyName) != -1) {
                        $(node).parent().prev().remove();
                        $(node).parent().prev().remove();
                        $(node).parent().next().remove();
                        $(node).parent().remove();
                        console.log("已屏蔽 " + replyName + " 的楼层 " + index);
                    }
                }
            })
        },
        filter() {
            let oldTab = document.querySelector("body > center > b");
            $(oldTab).attr("class", "filter-bam-keyword");
            $(oldTab).attr("style", "font-size:20px");;
            $(oldTab).after(`<b class="filter-bam-user">屏蔽用户设置</b>`);
            $(oldTab).after(`<b class="filter-bam-post">屏蔽帖子设置</b>`);
        }
    }

    var Event = {
        addBlockPost(node) {
            let id = $(node).attr('id')
            let title = $(node).attr('data')
            let board = $(node).attr('board')
            console.log($('#boardtr_' + id).length)
            if (IS_NEWPOST){
                $(node).parent().parent().parent().parent().parent().parent().remove();
            } else {
                $('#boardtr_' + id).remove();
            }

            let arr = localStorage.getItem('BlockPosts') ? JSON.parse(localStorage.getItem('BlockPosts')) : {};
            arr[id] = [board, title]
            localStorage.setItem('BlockPosts', JSON.stringify(arr));
        },
        onlyShowUser(node) {
            let name = $(node).attr('data')
            let newNode = $(".page-reply:not(#replyName_" + name + ")");
            $(newNode).parent().parent().prev().remove();
            $(newNode).parent().parent().prev().remove();
            $(newNode).parent().parent().next().remove();
            $(newNode).parent().parent().remove();
        },
        addBlockUserTemp(node) {
            let name = $(node).attr('data')
            let newNode = $('#replyName_' + name);
            $(newNode).parent().parent().prev().remove();
            $(newNode).parent().parent().prev().remove();
            $(newNode).parent().parent().next().remove();
            $(newNode).parent().parent().remove();
        },
        addBlockUser(node) {
            let name = $(node).attr('data')
            Event.addBlockUserTemp(node);

            let arr = localStorage.getItem('BlockUsers') ? JSON.parse(localStorage.getItem('BlockUsers')) : [];
            if (arr.indexOf(name) == -1) {
                arr.unshift(name)
                localStorage.setItem('BlockUsers', JSON.stringify(arr));
            }
        },
        showBlockUser(node) {
            $(node).attr("style", "font-size:20px");
            $(node).siblings().attr("style", "font-size:16px");
            let arr = localStorage.getItem('BlockUsers') ? JSON.parse(localStorage.getItem('BlockUsers')) : [];
            console.log(arr);

            $("table").eq(1).attr("style", "visibility:hidden");
            let blockTable = $("table").eq(2).children().toArray()[0]
            $(blockTable).parent().next().attr("style", "visibility:hidden");

            let tips = $(blockTable).parent().next().next().next().find('tr').eq(0)
            tips.html(`<td>温馨提示：<br>1、在帖子的楼层中点“屏蔽TA”的用户名会被添加到该列表，刷新仍旧有效。<br>2、而帖子的楼层中点“隐藏TA”只临时隐藏当前贴中该用户的回复楼层，刷新失效。<br>3、列表中的用户，会屏蔽该用户名所发的帖子，并屏蔽帖子中该用户名回复的楼层<br><br></td>`)

            let blockTrs = $(blockTable).children().toArray()
            let tableTab = '<tr align="center" id="filtertablehead">' +
                               '<td style="font-weight: 700;width: 70%">屏蔽用户名</td>' +
                               '<td style="font-weight: 700;width: 30%">操作</td>' +
                           '</tr>'
            for (let blockTr of blockTrs) {
                blockTr.remove()
            }
            $(blockTable).append($(tableTab))
            if (arr.length != 0) {
                let html =''
                for(let userName of arr){
                    html += '<tr align="center" id="' + userName + '">' +
                            '     <td  style="width: 70%"><a href="https://bbs.jjwxc.net/search.php?act=search&board=2&keyword='+ userName + '&topic=4" target="_blank">' + userName + '</a></td>' +
                            '     <td style="width: 30%"><button class="filter-bam-user-del" data="' + userName + '">解除屏蔽</button></td>' +
                            '</tr>'
                }
                $(blockTable).append($(html))
            }
        },
        showBlockPost(node) {
            $(node).attr("style", "font-size:20px");
            $(node).siblings().attr("style", "font-size:16px");
            let arr = localStorage.getItem('BlockPosts') ? JSON.parse(localStorage.getItem('BlockPosts')) : {};
            console.log(arr);

            $("table").eq(1).attr("style", "visibility:hidden");
            let blockTable = $("table").eq(2).children().toArray()[0]
            $(blockTable).parent().next().attr("style", "visibility:hidden");
            let tips = $(blockTable).parent().next().next().next().find('tr').eq(0)
            tips.html(`<td>温馨提示：<br>在主页点击“屏蔽”和帖子首楼点击“屏蔽此贴”的帖子会被添加到该列表，刷新仍旧有效。<br><br></td>`)

            let blockTrs = $(blockTable).children().toArray()
            let tableTab = '<tr align="center" id="filtertablehead">' +
                               '<td style="font-weight: 700;width: 20%">帖子ID</td>' +
                               '<td style="font-weight: 700;width: 70%">帖子标题</td>' +
                               '<td style="font-weight: 700;width: 10%">操作</td>' +
                           '</tr>'
            for (let blockTr of blockTrs) {
                blockTr.remove()
            }
            $(blockTable).append($(tableTab))
            if (arr.length != 0) {
                let html =''
                for(let postId in arr){
                    let boardId = arr[postId][0]
                    let postTitle = arr[postId][1]
                    html = '<tr align="center" id="' + postId + '">' +
                                '<td style="width: 20%">' + postId + '</td>' +
                                '<td style="width: 70%"><a href="https://bbs.jjwxc.net/showmsg.php?board=' +boardId + '&id=' + postId + '" target="_blank">' + postTitle + '</a></td>' +
                                '<td style="width: 10%"><button class="filter-bam-post-del" data="' + postId + '">解除</button></td>' +
                            '</tr>' + html
                }
                $(blockTable).append($(html))
            }

        },
        delBlockUser(node) {
            let name = $(node).attr('data')
            let arr = localStorage.getItem('BlockUsers') ? JSON.parse(localStorage.getItem('BlockUsers')) : [];
            for(let i=0;i<arr.length;i++){
                if(arr[i] == name){
                    arr.splice(i,1)
                    localStorage.setItem('BlockUsers', JSON.stringify(arr));
                    $(node).parent().parent().remove()
                }
            }
        },
        delBlockPost(node) {
            let postId = $(node).attr('data')
            let arr = localStorage.getItem('BlockPosts') ? JSON.parse(localStorage.getItem('BlockPosts')) : {};
            delete arr[postId];
            localStorage.setItem('BlockPosts', JSON.stringify(arr));
            $(node).parent().parent().remove()
        },
        eventRegister() {
            $(document).on('click', '.board-bam', function () {
                Event.addBlockPost(this);
            })
            $(document).on('click', '.board-only-show-user', function () {
                Event.onlyShowUser(this);
            })
            $(document).on('click', '.board-bam-user-temp', function () {
                Event.addBlockUserTemp(this);
            })
            $(document).on('click', '.board-bam-user', function () {
                Event.addBlockUser(this);
            })
            $(document).on('click', '.filter-bam-keyword', function () {
                location = 'https://bbs.jjwxc.net/filterword.php'
            })
            $(document).on('click', '.filter-bam-user', function () {
                Event.showBlockUser(this);
            })
            $(document).on('click', '.filter-bam-post', function () {
                Event.showBlockPost(this);
            })
            $(document).on('click', '.filter-bam-user-del', function () {
                Event.delBlockUser(this);
            })
            $(document).on('click', '.filter-bam-post-del', function () {
                Event.delBlockPost(this);
            })
        }
    }

    function initPages() {
        // Style.init();
        if (IS_BOARD) {
            initNodes.board()
            Event.eventRegister()
        } else if (IS_POST) {
            initNodes.page();
            Event.eventRegister()
            //} else if (IS_SEARCH) {
            //initNodes.search();
        } else if (IS_FILTER) {
            initNodes.filter();
            Event.eventRegister()
        }
	}

    textToLink();
	upAndDown()
	initPages()

	function upAndDown(){ //https://greasyfork.org/zh-CN/scripts/370556-%E4%B8%80%E4%B8%AA%E8%BF%94%E5%9B%9E%E9%A1%B6%E9%83%A8%E5%92%8C%E5%88%B0%E8%BE%BE%E5%BA%95%E9%83%A8%E7%9A%84%E6%8C%89%E9%92%AE
		//var $ = $ || window.$;
		var canScrollMouseOver = false; //当鼠标在按钮上，但未点击时，页面能否自动滚动，true 为可以自动滚动，false 为不能自动滚动，可修改
		var opacityMouseLeave = 0.5; //当鼠标不在按钮上时，按钮的不透明度，从 0.0（完全透明）到 1.0（完全不透明），可修改
		var opacityMouseEnter = 0.8; //当鼠标在按钮上时，按钮的不透明度，从 0.0（完全透明）到 1.0（完全不透明），可修改
		var clickScrollTime = 500; //点击按钮时，网页滚动到顶部或底部需要的时间，单位是毫秒，可修改
		var needScrollTime; //网页可以自动滚动时，滚动需要的时间，由网页高度计算得出，这样不同网页都会匀速滚动
		var isClicked = false; //按钮是否被点击
		var initialHeight = 0; //网页向底部滚动时，需要滚动的距离
		var scrollAction = 'undefined';
		var scrollDirection = "down"; //网页滚动方向，down 为向下，up 为向上
		var loadTimes = 0; //网页中动态增加数据的次数
		var maxLoadTimes = 10; //最大的动态增加数据的次数（可修改），如果动态增加数据的次数超过这个值，则说明当前网页不适合执行此脚本，建议将其加入排除的网站当中
		var goTopBottomButton = document.createElement("div");
		goTopBottomButton.className = "goTopBottomButton";
		goTopBottomButton.innerHTML = "<img class='toggleButton' style='width:35px;height:35px;display:block;cursor:pointer;'></img>"; //图片的宽和高可修改，原始图片宽高均为 40px
		goTopBottomButton.style.position = "fixed";
		goTopBottomButton.style.zIndex = 10000;
		goTopBottomButton.style.bottom = "50px"; //距离网页底部 50px，可修改
		goTopBottomButton.style.right = "30px"; //距离网页右边 30px，可修改
		var toggleButton = goTopBottomButton.lastChild;
		toggleButton.style.opacity = opacityMouseLeave; //按钮初始不透明度
		toggleButton.src = down_button_icon; //按钮初始显示向下的图片
		document.getElementsByTagName("body")[0].appendChild(goTopBottomButton);

		/*按钮事件开始*/
		toggleButton.addEventListener("mouseenter",function() { //鼠标移入时不透明度改变，如果 canScrollMouseOver 为 true，则网页可以自动滚动
			isClicked = false;
			if (canScrollMouseOver) {
				if (scrollDirection == "up") {
					needScrollTime = getScrollTop() * 10;
					$('html,body').animate({scrollTop:'0px'},needScrollTime);
				} else {
					initialHeight = $(document).height();
					var restHeight = $(document).height() - getScrollTop();
					needScrollTime = restHeight * 10;
					$('html,body').animate({scrollTop:initialHeight},needScrollTime,continueToBottom);
				}
			}
			toggleButton.style.opacity = opacityMouseEnter;
		})
		toggleButton.addEventListener("mouseleave",function() { //鼠标移出时不透明度改变，如果 canScrollMouseOver 为 true，并且按钮未被点击，停止网页自动滚动的动画
			if (canScrollMouseOver && !isClicked) {
				$('html,body').stop();
			}
			toggleButton.style.opacity = opacityMouseLeave;
		})
		toggleButton.addEventListener("click",function() { //点击按钮时，网页滚动到顶部或底部
			isClicked = true;
			if (canScrollMouseOver) {
				$('html,body').stop();
			}
			if (scrollDirection == "up") {
				$('html,body').animate({scrollTop:'0px'},clickScrollTime);
			} else {
				initialHeight = $(document).height();
				$('html,body').animate({scrollTop:initialHeight},clickScrollTime,continueToBottom);
			}
		})
		/*按钮事件结束*/

		/*页面滚动监听*/
		document.onscroll = function() {
			if (scrollAction == 'undefined') {
				scrollAction = window.pageYOffset;
			}
			var diffY = scrollAction - window.pageYOffset;
			scrollAction = window.pageYOffset;
			if (diffY < 0) {
				changeDirection("down");
			} else if (diffY > 0) {
				changeDirection("up");
			}
			if (getScrollTop() == 0) {
				changeDirection("down");
			}
			if (getScrollTop() + $(window).height() >= $(document).height()) {
				changeDirection("up");
			}
		}

		function changeDirection(direction) { //改变按钮方向
			scrollDirection = direction;
			toggleButton.src = direction == 'down' ? down_button_icon : up_button_icon;
		}

		function getScrollTop() { //获取垂直方向滑动距离
			var scrollTop = 0;
			if (document.documentElement && document.documentElement.scrollTop) {
				scrollTop = document.documentElement.scrollTop;
			} else if (document.body) {
				scrollTop = document.body.scrollTop;
			}
			return scrollTop;
		}

		function continueToBottom() { //判断页面是否继续下滑（主要是为了处理网页动态增加数据导致网页高度变化的情况）
			var currentHeight = $(document).height();
			if (initialHeight != currentHeight) {
				if (loadTimes >= maxLoadTimes) {
					$('html,body').stop();
					alert(" 本网站有太多的异步请求，不适合执行脚本《" + GM_info.script.name + "》，建议加入排除网站当中，具体方法请查看脚本主页");
					loadTimes = 0;
					return;
				}
				loadTimes ++;
				initialHeight = currentHeight;
				$('html,body').animate({scrollTop:initialHeight},1000,continueToBottom);
			}
		}
	}

    function textToLink() { //https://github.com/lkytal/GM/blob/master/linkMix.user.js
        var clearLink, excludedTags, linkFilter, linkMixInit, linkPack, linkify, observePage, observer, setLink, urlPrefixes, url_regexp, xPath;
        url_regexp = /((https?:\/\/|www\.)[\x21-\x7e]+[\w\/=]|\w([\w._-])+@\w[\w\._-]+\.(com|cn|org|net|info|tv|cc|gov|edu)|(\w[\w._-]+\.(com|cn|org|net|info|tv|cc|gov|edu))(\/[\x21-\x7e]*[\w\/])?|ed2k:\/\/[\x21-\x7e]+\|\/|thunder:\/\/[\x21-\x7e]+=)/gi;
        urlPrefixes = ['http://', 'https://', 'ftp://', 'thunder://', 'ed2k://', 'mailto://', 'file://'];

        clearLink = function (event) {
            var j, len, link, prefix, ref, ref1, url;
            link = (ref = event.originalTarget) != null ? ref : event.target;
            if (!(link != null && link.localName === "a" && ((ref1 = link.className) != null ? ref1.indexOf("textToLink") : void 0) !== -1)) {
                return;
            }
            url = link.getAttribute("href");
            //console.log url
            for (j = 0, len = urlPrefixes.length; j < len; j++) {
                prefix = urlPrefixes[j];
                if (url.indexOf(prefix) === 0) {
                    return;
                }
            }
            if (url.indexOf('@') !== -1) {
                return link.setAttribute("href", "mailto://" + url);
            } else {
                return link.setAttribute("href", "http://" + url);
            }
        };

        document.addEventListener("mouseover", clearLink);

        setLink = function (candidate) {
            var ref, ref1, ref2, span, text;
            if (candidate == null || ((ref = candidate.parentNode) != null ? (ref1 = ref.className) != null ? typeof ref1.indexOf === "function" ? ref1.indexOf("textToLink") : void 0 : void 0 : void 0) !== -1 || candidate.nodeName === "#cdata-section") {
                return;
            }
            text = candidate.textContent.replace(url_regexp, '<a href="$1" target="_blank" class="textToLink">$1</a>');
            if (((ref2 = candidate.textContent) != null ? ref2.length : void 0) === text.length) {
                return;
            }
            span = document.createElement("span");
            span.innerHTML = text;
            return candidate.parentNode.replaceChild(span, candidate);
        };

        excludedTags = "a,svg,canvas,applet,input,button,area,pre,embed,frame,frameset,head,iframe,img,option,map,meta,noscript,object,script,style,textarea,code".split(",");

        xPath = `//text()[not(ancestor::${excludedTags.join(') and not(ancestor::')})]`;

        linkPack = function (result, start) {
            var i, j, k, ref, ref1, ref2, ref3, startTime;
            startTime = Date.now();
            while (start + 10000 < result.snapshotLength) {
                for (i = j = ref = start, ref1 = start + 10000; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
                    setLink(result.snapshotItem(i));
                }
                start += 10000;
                if (Date.now() - startTime > 2500) {
                    return;
                }
            }
            for (i = k = ref2 = start, ref3 = result.snapshotLength; ref2 <= ref3 ? k <= ref3 : k >= ref3; i = ref2 <= ref3 ? ++k : --k) {
                setLink(result.snapshotItem(i));
            }
        };

        linkify = function (node) {
            var result;
            result = document.evaluate(xPath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            return linkPack(result, 0);
        };

        linkFilter = function (node) {
            var j, len, tag;
            for (j = 0, len = excludedTags.length; j < len; j++) {
                tag = excludedTags[j];
                if (tag === node.parentNode.localName.toLowerCase()) {
                    return NodeFilter.FILTER_REJECT;
                }
            }
            return NodeFilter.FILTER_ACCEPT;
        };

        observePage = function (root) {
            var tW;
            tW = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { //+ NodeFilter.SHOW_ELEMENT,
                acceptNode: linkFilter
            }, false);
            while (tW.nextNode()) {
                setLink(tW.currentNode);
            }
        };

        observer = new window.MutationObserver(function (mutations) {
            var Node, j, k, len, len1, mutation, ref;
            for (j = 0, len = mutations.length; j < len; j++) {
                mutation = mutations[j];
                if (mutation.type === "childList") {
                    ref = mutation.addedNodes;
                    for (k = 0, len1 = ref.length; k < len1; k++) {
                        Node = ref[k];
                        observePage(Node);
                    }
                }
            }
        });

        linkMixInit = function () {
            if (window !== window.top || window.document.title === "") {
                return;
            }
            //console.time('a')
            linkify(document.body);
            //console.timeEnd('a')
            return observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        };
        setTimeout(linkMixInit, 100)
    }
})