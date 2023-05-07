// ==UserScript==
// @name         Download Weibo Images & Videos (Only support new version weibo UI)
// @name:zh-CN   下载微博图片和视频（仅支持新版界面）
// @version      0.8.1
// @description  Download images and videos from new version weibo UI webpage.
// @description:zh-CN 从新版微博界面下载图片和视频。
// @author       OWENDSWANG
// @match        https://weibo.com/*
// @match        https://s.weibo.com/weibo*
// @match        https://s.weibo.com/realtime*
// @match        https://s.weibo.com/video*
// @exclude      https://weibo.com/tv/*
// @exclude      https://weibo.com/p/*
// @icon         https://weibo.com/favicon.ico
// @license      MIT
// @homepage     https://greasyfork.org/scripts/430877
// @supportURL   https://github.com/owendswang/Download-Weibo-Images-Videos
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      wx1.sinaimg.cn
// @connect      wx2.sinaimg.cn
// @connect      wx3.sinaimg.cn
// @connect      wx4.sinaimg.cn
// @connect      g.us.sinaimg.cn
// @connect      f.video.weibocdn.com
// @namespace    http://tampermonkey.net/
// @run-at       document-end
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

(function() {
    'use strict';
    // let templete_default = '{original}.{ext}'
    let templete_desc = "{YY}{MM}{DD} {desc} @{username}_{index}.{ext}"
    let templete_id = "{YYYY}{MM}{DD}_{mblogid}_{index}.{ext}"
    let default_id_mode_list = ["2360812967", "5884616667"]
    let text = [];
    let text_zh = [
        '添加下载按钮',
        '欢迎使用“下载微博图片”脚本',
        '请选择添加下载按钮的方式：',
        '手动添加',
        '自动添加',
        '保存',
        '下载设置',
        '下载文件名称',
        '{original} - 原文件名\n{username} - 原博主名称\n{userid} - 原博主ID\n{mblogid} - 原博mblogid\n{uid} - 原博uid\n{ext} - 文件后缀\n{index} - 图片序号\n{YYYY} {YY} {MM} {DD} {HH} {mm} {ss} \n - 原博发布时间，可分开独立使用',
        '下载队列',
        '重试',
        '关闭',
        '取消',
        '打包下载',
        '打包文件名',
        '与“下载文件名”规则相同，但{original}、{ext}、{index}除外',
    ];
    let text_en = [
        'Add Download Buttons',
        'Welcome Using \'Download Weibo Images\' Script',
        'Which way do you like to add download buttons to each weibo post?',
        'Click \'Add Download Buttons\' button to add download buttons.',
        'When mouse over browser page, add download buttons automatically.',
        'Save',
        'Download Setting',
        'Download File Name',
        '{original} - Original file name\n{username} - Original user name\n{userid} - Original user ID\n{mblogid} - original mblogid\n{uid} - original uid\n{ext} - File extention\n{index} - Image index\n{YYYY} {YY} {MM} {DD} {HH} {mm} {ss} - "Year", \n"Month", "Date", "Hour", "Minute", "Second" \nof the created time of the original post',
        'Download Queue',
        'Retry',
        'Close',
        'Cancel',
        'Pack download files as a ZIP file',
        'ZIP File Name',
        'The same rules as "Download File Name" except {original}, {ext} and {index}',
    ];
    if(navigator.language.substr(0, 2) == 'zh') {
        text = text_zh;
    } else {
        text = text_en;
    }

    function httpGet(theUrl) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    function downloadError(e, url, name, headerFlag, progress, zipMode = false) {
        console.log(e, url);
        /*GM_notification({
            title: 'Download error',
            text: 'Error: ' + e.error + '\nUrl: ' + url,
            silent: true,
            timeout: 3,
        });*/
        progress.style.background = 'red';
        progress.firstChild.textContent = name + ' [' + (e.error || 'Unknown') + ']';
        progress.firstChild.style.color = 'yellow';
        progress.firstChild.style.mixBlendMode = 'unset';
        if (!zipMode) {
            let progressRetryBtn = document.createElement('button');
            progressRetryBtn.style.border = 'unset';
            progressRetryBtn.style.background = 'unset';
            progressRetryBtn.style.color = 'yellow';
            progressRetryBtn.style.position = 'absolute';
            progressRetryBtn.style.right = '1.2rem';
            progressRetryBtn.style.top = '0.05rem';
            progressRetryBtn.style.fontSize = '1rem';
            progressRetryBtn.style.lineHeight = '1rem';
            progressRetryBtn.style.cursor = 'pointer';
            progressRetryBtn.style.letterSpacing = '-0.2rem';
            progressRetryBtn.textContent = '⤤⤦';
            progressRetryBtn.title = text[10];
            progressRetryBtn.onmouseover = function(e){
                this.style.color = 'white';
            }
            progressRetryBtn.onmouseout = function(e){
                this.style.color = 'yellow';
            }
            progressRetryBtn.onclick = function(e) {
                this.parentNode.remove();
                downloadWrapper(url, name, headerFlag);
            }
            progress.insertBefore(progressRetryBtn, progress.lastChild);
        }
        progress.lastChild.title = text[11];
        progress.lastChild.style.color = 'yellow';
        progress.lastChild.onmouseover = function(e){
            this.style.color = 'white';
        };
        progress.lastChild.onmouseout = function(e){
            this.style.color = 'yellow';
        };
        progress.lastChild.onclick = function(e) {
            this.parentNode.remove();
            if(progress.parent.childElementCount == 1) progress.parent.firstChild.style.display = 'none';
        };
        // setTimeout(() => { progress.remove(); if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none'; }, 1000);
    }

    let downloadQueueCard = document.createElement('div');
    downloadQueueCard.style.position = 'fixed';
    downloadQueueCard.style.bottom = '0.5rem';
    downloadQueueCard.style.left = '0.5rem';
    downloadQueueCard.style.maxHeight = '50vh';
    downloadQueueCard.style.overflowY = 'auto';
    downloadQueueCard.style.overflowX = 'hidden';
    let downloadQueueTitle = document.createElement('div');
    downloadQueueTitle.textContent = text[9];
    downloadQueueTitle.style.fontSize = '0.8rem';
    downloadQueueTitle.style.color = 'gray';
    downloadQueueTitle.style.display = 'none';
    downloadQueueCard.appendChild(downloadQueueTitle);
    document.body.appendChild(downloadQueueCard);
    let progressBar = document.createElement('div');
    progressBar.style.height = '1.4rem';
    progressBar.style.width = '23rem';
    // progressBar.style.background = 'linear-gradient(to right, red 100%, transparent 100%)';
    progressBar.style.borderStyle = 'solid';
    progressBar.style.borderWidth = '0.1rem';
    progressBar.style.borderColor = 'grey';
    progressBar.style.borderRadius = '0.5rem';
    progressBar.style.boxSizing = 'content-box';
    progressBar.style.marginTop = '0.5rem';
    progressBar.style.marginRight = '1rem';
    progressBar.style.position = 'relative';
    let progressText = document.createElement('div');
    // progressText.textContent = 'test.test';
    progressText.style.mixBlendMode = 'screen';
    progressText.style.width = '100%';
    progressText.style.textAlign = 'center';
    progressText.style.color = 'orange';
    progressText.style.fontSize = '0.7rem';
    progressText.style.lineHeight = '1.4rem';
    progressText.style.overflow = 'hidden';
    progressBar.appendChild(progressText);
    let progressCloseBtn = document.createElement('button');
    progressCloseBtn.style.border = 'unset';
    progressCloseBtn.style.background = 'unset';
    progressCloseBtn.style.color = 'orange';
    progressCloseBtn.style.position = 'absolute';
    progressCloseBtn.style.right = '0';
    progressCloseBtn.style.top = '0.1rem';
    progressCloseBtn.style.fontSize = '1rem';
    progressCloseBtn.style.lineHeight = '1rem';
    progressCloseBtn.style.cursor = 'pointer';
    progressCloseBtn.textContent = '×';
    progressCloseBtn.title = text[12];
    progressCloseBtn.onmouseover = function(e){
        this.style.color = 'red';
    }
    progressCloseBtn.onmouseout = function(e){
        this.style.color = 'orange';
    }
    progressBar.appendChild(progressCloseBtn);
    // downloadQueueCard.appendChild(progressBar);

    function downloadWrapper(url, name, headerFlag = false, zipMode = false) {
        // console.log(url);
        downloadQueueTitle.style.display = 'block';
        let progress = downloadQueueCard.appendChild(progressBar.cloneNode(true));
        progress.firstChild.textContent = name + ' [0%]';
        if (zipMode) {
            return new Promise(function(resolve, reject) {
                const download = GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    responseType: 'blob',
                    headers: headerFlag ? {
                        'Referer': 'https://weibo.com/',
                        'Origin': 'https://weibo.com/'
                    } : null,
                    onprogress: (e) => {
                        // e = { int done, finalUrl, bool lengthComputable, int loaded, int position, int readyState, response, str responseHeaders, responseText, responseXML, int status, statusText, int total, int totalSize }
                        const percent = e.done / e.total * 100;
                        progress.style.background = 'linear-gradient(to right, green ' + percent + '%, transparent ' + percent + '%)';
                        progress.firstChild.textContent = name + ' [' + percent.toFixed(0) + '%]';
                    },
                    onload: ({ status, response }) => {
                        const timeout = setTimeout(() => {
                            progress.remove();
                            if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                        }, 1000);
                        progress.lastChild.onclick = function(e) {
                            clearTimeout(timeout);
                            this.parentNode.remove();
                            if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                        }
                        resolve(response);
                    },
                    onabort: (e) => { downloadError(e, url, name, headerFlag, progress); resolve(null); },
                    onerror: (e) => { downloadError(e, url, name, headerFlag, progress); resolve(null); },
                    ontimeout: (e) => { downloadError(e, url, name, headerFlag, progress); resolve(null); },
                });
                progress.lastChild.onclick = function(e) {
                    download.abort();
                    this.parentNode.remove();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                };
            });
        } else {
            const download = GM_download({
                url,
                name,
                headers: headerFlag ? {
                    'Referer': 'https://weibo.com/',
                    'Origin': 'https://weibo.com/'
                } : null,
                onprogress: (e) => {
                    // e = { int done, finalUrl, bool lengthComputable, int loaded, int position, int readyState, response, str responseHeaders, responseText, responseXML, int status, statusText, int total, int totalSize }
                    const percent = e.done / e.total * 100;
                    progress.style.background = 'linear-gradient(to right, green ' + percent + '%, transparent ' + percent + '%)';
                    progress.firstChild.textContent = name + ' [' + percent.toFixed(0) + '%]';
                },
                onload: ({ status, response }) => {
                    const timeout = setTimeout(() => {
                        progress.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    }, 1000);
                    progress.lastChild.onclick = function(e) {
                        clearTimeout(timeout);
                        this.parentNode.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    }
                },
                onerror: (e) => { downloadError(e, url, name, headerFlag, progress); },
                ontimeout: (e) => { downloadError(e, url, name, headerFlag, progress); },
            });
            progress.lastChild.onclick = function(e) {
                download.abort();
                this.parentNode.remove();
                if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
            };
        }
    }

    function getName(nameSetting, desc, originalName, ext, userName, userId, postId, postUid, index, postTime) {
        let setName = nameSetting;
        setName = setName.replace('{ext}', ext);
        setName = setName.replace('{original}', originalName);
        setName = setName.replace('{username}', userName);
        setName = setName.replace('{userid}', userId);
        setName = setName.replace('{mblogid}', postId);
        setName = setName.replace('{uid}', postUid);
        setName = setName.replace('{index}', index);
        setName = setName.replace('{desc}', desc);
        let YYYY, YY, MM, DD, HH, mm, ss;
        const postAt = new Date(postTime);
        if (postTime) {
            YYYY = postAt.getFullYear().toString();
            YY = postAt.getFullYear().toString().slice(-2);
            MM = (postAt.getMonth() + 1).toString().padStart(2, '0');
            DD = postAt.getDate().toString().padStart(2, '0');
            HH = postAt.getHours().toString().padStart(2, '0');
            mm = postAt.getMinutes().toString().padStart(2, '0');
            ss = postAt.getSeconds().toString().padStart(2, '0');
        }
        setName = setName.replace('{YYYY}', YYYY);
        setName = setName.replace('{YY}', YY);
        setName = setName.replace('{MM}', MM);
        setName = setName.replace('{DD}', DD);
        setName = setName.replace('{HH}', HH);
        setName = setName.replace('{mm}', mm);
        setName = setName.replace('{ss}', ss);
        return setName.replace(/[<>|\|*|"|\/|\|:|?]/g, '_');
    }

    function getTemplete(isDescMode, totalLength) {
        if (totalLength > 1) {
            if (isDescMode) {
                return templete_desc
            } else {
                return templete_id
            }
        } else {
            if (isDescMode) {
                return templete_desc.replace("_{index}", "")
            } else {
                return templete_id.replace("_{index}", "")
            }
        }
    }

    function handleDownloadList(downloadList, packName) {
        if (GM_getValue('zipMode', false)) {
            let zip = new JSZip();
            // console.log('zip', zip);
            let promises = downloadList.map(async function(ele, idx) {
                return await downloadWrapper(ele.url, ele.name, ele.headerFlag, true).then(function(data) {
                    // console.log('data', data);
                    if (data) zip.file(downloadList[idx].name, data);
                });
            });
            // console.log('promises', promises);
            Promise.all(promises).then(async function(responseList) {
                // console.log('responseList', responseList);
                // console.log('zip', zip);
                // console.log('generateAsync', zip.generateAsync());
                const content = await zip.generateAsync({ type: 'blob', streamFiles: true }/*, function({ percent, currentFile }) { console.log(percent); }*/);
                // console.log('content', content);
                if (zip.files && Object.keys(zip.files).length > 0) saveAs(content, packName);
            });
        } else {
            for (const item of downloadList) {
                downloadWrapper(item.url, item.name, item.headerFlag);
            }
        }
    }

    function addDlBtn(footer) {
        let dlBtnDiv = document.createElement('div');
        dlBtnDiv.className = 'woo-box-item-flex toolbar_item_1ky_D';
        let divInDiv = document.createElement('div');
        divInDiv.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_likebox_1rLfZ';
        let dlBtn = document.createElement('button');
        dlBtn.className = 'woo-like-main toolbar_btn_Cg9tz download-button';
        dlBtn.setAttribute('tabindex', '0');
        dlBtn.setAttribute('title', '下载');
        dlBtn.innerHTML = '<span class="woo-like-iconWrap"><svg class="woo-like-icon"><use xlink:href="#woo_svg_download"></use></svg></span><span class="woo-like-count">下载</span>';
        dlBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            const article = this.parentElement.parentElement.parentElement.parentElement.parentElement;
            if( article.tagName.toLowerCase() == 'article') {
                // let contentRow = article.getElementsByClassName('content_row_-r5Tk')[0];
                const header = article.getElementsByTagName('header')[0];
                const postLink = header.getElementsByClassName('head-info_time_6sFQg')[0];
                let postId = postLink.href.split('/')[postLink.href.split('/').length - 1];
                const response = httpGet('https://weibo.com/ajax/statuses/show?id=' + postId);
                const resJson = JSON.parse(response);
                // console.log(resJson);
                let picInfos = [];
                let userName, userId, postUid, postTime;
                let status = resJson;
                if(resJson.hasOwnProperty('retweeted_status')) {
                    status = resJson.retweeted_status;
                }
                postId = status.mblogid;
                picInfos = status.pic_infos;
                userName = status.user.screen_name;
                userId = status.user.idstr;
                postUid = status.idstr;
                postTime = status.created_at;
                let downloadList = [];
                const isIdMode = default_id_mode_list.indexOf(userId) > -1
                console.log("isIdMode=" + isIdMode);
                const downloadDescMode = document.getElementById('checkBoxFileNameDesc').checked
                const downloadIdMode = isIdMode || document.getElementById('checkBoxFileNameId').checked
                const downloadIndexMode = document.getElementById('checkBoxFileIndexDesc').checked
                let desc = document.getElementById('inputFileNameDesc').value;
                let indexLise = document.getElementById('inputFileIndexDesc').value.match(RegExp(/[0-9]+/g))?.map(Number)
                if(footer.parentElement.getElementsByTagName('video').length > 0) {
                    // console.log('download video');
                    if(resJson.hasOwnProperty('page_info')) {
                        let mediaInfo = resJson.page_info.media_info;
                        let largeVidUrl = mediaInfo.playback_list[0].play_info.url;
                        let vidName = largeVidUrl.split('?')[0];
                        vidName = vidName.split('/')[vidName.split('/').length - 1].split('?')[0];
                        let originalName = vidName.split('.')[0];
                        let ext = vidName.split('.')[1];
                        if (downloadDescMode) {
                            let setName = getName(getTemplete(true, 1), desc, originalName, ext, userName, userId, postId, postUid, 1, postTime);
                            downloadList.push({ url: largeVidUrl, name: setName });
                        }
                        if (downloadIdMode) {
                            let setName = getName(getTemplete(false, 1), desc, originalName, ext, userName, userId, postId, postUid, 1, postTime);
                            downloadList.push({ url: largeVidUrl, name: setName });
                        }
                    }
                }
                if (picInfos) {
                    // console.log('download images');
                    let index = 0;
                    let totalLength = Object.entries(picInfos).length
                    let padLength = totalLength.toString().length;
                    for (const [id, pic] of Object.entries(picInfos)) {
                        if (downloadIndexMode && indexLise != null && indexLise.indexOf(index + 1) == -1) continue
                        index += 1;
                        let largePicUrl = pic.largest.url;
                        let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
                        let originalName = picName.split('.')[0];
                        let ext = picName.split('.')[1];
                        if (downloadDescMode) {
                            let setName = getName(getTemplete(true, totalLength), desc, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime);
                            downloadList.push({ url: largePicUrl, name: setName, headerFlag: true });
                        }
                        if (downloadIdMode) {
                            let setName = getName(getTemplete(false, totalLength), desc, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime);
                            downloadList.push({ url: largePicUrl, name: setName, headerFlag: true });
                        }
                        if(pic.hasOwnProperty('video')) {
                            let videoUrl = pic.video;
                            let videoName = videoUrl.split('%2F')[videoUrl.split('%2F').length - 1].split('?')[0];
                            videoName = videoName.split('/')[videoName.split('/').length - 1].split('?')[0];
                            if (!videoName.includes('.')) videoName = videoUrl.split('/')[videoUrl.split('/').length - 1].split('?')[0];
                            // console.log(videoUrl, videoName);
                            let originalName = videoName.split('.')[0];
                            let ext = videoName.split('.')[1];
                            if (downloadDescMode) {
                                let setName = getName(getTemplete(true, totalLength), desc, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime);
                                downloadList.push({ url: videoUrl, name: setName });
                            }
                            if (downloadIdMode) {
                                let setName = getName(getTemplete(false, totalLength), desc, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime);
                                downloadList.push({ url: videoUrl, name: setName });
                            }
                        }
                    }
                }
                handleDownloadList(downloadList, getName(GM_getValue('packFileName', '{mblogid}.zip'), desc, '{original}', '{ext}', userName, userId, postId, postUid, '{index}'));
            }
        });
        divInDiv.appendChild(dlBtn);
        dlBtnDiv.appendChild(divInDiv);
        footer.firstChild.appendChild(dlBtnDiv);
        // console.log('added download button');
    }

    function sAddDlBtn(footer) {
        const lis = footer.getElementsByTagName('li');
        for (const li of lis) {
            li.style.width = '25%';
        }
        let dlBtnLi = document.createElement('li');
        dlBtnLi.style.width = '25%';
        let aInLi = document.createElement('a');
        aInLi.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter';
        aInLi.setAttribute('title', '下载');
        aInLi.setAttribute('href', 'javascript:void(0);');
        let dlBtn = document.createElement('button');
        dlBtn.className = 'woo-like-main toolbar_btn download-button';
        dlBtn.innerHTML = '<span class="woo-like-iconWrap"><svg class="woo-like-icon"><use xlink:href="#woo_svg_download"></use></svg></span><span class="woo-like-count">下载</span>';
        aInLi.addEventListener('click', function(event) { event.preventDefault(); });
        dlBtn.addEventListener('click', function(event) {
            // console.log('download');
            event.preventDefault();
            const card = this.parentElement.parentElement.parentElement.parentElement;
            const cardWrap = card.parentElement;
            // console.log(card, cardWrap);
            const mid = cardWrap.getAttribute('mid');
            // console.log(mid);
            if(mid) {
                const response = httpGet('https://weibo.com/ajax/statuses/show?id=' + mid);
                const resJson = JSON.parse(response);
                // console.log(resJson);
                let picInfos = [];
                let userName, userId, postUid, postId, postTime;
                let status = resJson;
                if(resJson.hasOwnProperty('retweeted_status')) {
                    status = resJson.retweeted_status;
                }
                postId = status.mblogid;
                picInfos = status.pic_infos;
                userName = status.user.screen_name;
                userId = status.user.idstr;
                postUid = status.idstr;
                postTime = status.created_at;
                const isIdMode = default_id_mode_list.indexOf(userId) > -1
                console.log("isIdMode=" + isIdMode);
                const downloadDescMode = document.getElementById('checkBoxFileNameDesc').checked
                const downloadIdMode = isIdMode || document.getElementById('checkBoxFileNameId').checked
                const downloadIndexMode = document.getElementById('checkBoxFileIndexDesc').checked
                let desc = document.getElementById('inputFileNameDesc').value;
                let indexLise = document.getElementById('inputFileIndexDesc').value.match(RegExp(/[0-9]+/g))?.map(Number)
                let downloadList = [];
                if(footer.parentElement.getElementsByTagName('video').length > 0) {
                    // console.log('download video');
                    if(resJson.hasOwnProperty('page_info')) {
                        let mediaInfo = resJson.page_info.media_info;
                        let largeVidUrl = mediaInfo.playback_list[0].play_info.url;
                        let vidName = largeVidUrl.split('?')[0];
                        vidName = vidName.split('/')[vidName.split('/').length - 1].split('?')[0];
                        if (!vidName.includes('.')) vidName = largeVidUrl.split('/')[largeVidUrl.split('/').length - 1].split('?')[0];
                        let originalName = vidName.split('.')[0];
                        let ext = vidName.split('.')[1];
                        if (downloadDescMode) {
                            let setName = getName(getTemplete(true, 1), desc, originalName, ext, userName, userId, postId, postUid, 1, postTime);
                            downloadList.push({ url: largeVidUrl, name: setName });
                        }
                        if (downloadIdMode) {
                            let setName = getName(getTemplete(false, 1), desc, originalName, ext, userName, userId, postId, postUid, 1, postTime);
                            downloadList.push({ url: largeVidUrl, name: setName });
                        }
                    }
                }
                if (picInfos) {
                    // console.log('download images');
                    let index = 0;
                    let totalLength = Object.entries(picInfos).length
                    let padLength = totalLength.toString().length;
                    for (const [id, pic] of Object.entries(picInfos)) {
                        if (downloadIndexMode && indexLise != null && indexLise.indexOf(index + 1) == -1) continue
                        index += 1;
                        let largePicUrl = pic.largest.url;
                        let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
                        let originalName = picName.split('.')[0];
                        let ext = picName.split('.')[1];
                        if (downloadDescMode) {
                            let setName = getName(getTemplete(true, totalLength), desc, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'));
                            downloadList.push({ url: largePicUrl, name: setName, headerFlag: true });
                            }
                        if (downloadIdMode) {
                            let setName = getName(getTemplete(false, totalLength), desc, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'));
                            downloadList.push({ url: largePicUrl, name: setName, headerFlag: true });
                        }
                        if(pic.hasOwnProperty('video')) {
                            let videoUrl = pic.video;
                            let videoName = videoUrl.split('%2F')[videoUrl.split('%2F').length - 1].split('?')[0];
                            videoName = videoName.split('/')[videoName.split('/').length - 1].split('?')[0];
                            // console.log(videoUrl, videoName);
                            let originalName = videoName.split('.')[0];
                            let ext = videoName.split('.')[1];
                            if (downloadDescMode) {
                                let setName = getName(getTemplete(true, totalLength), desc, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'));
                                downloadList.push({ url: videoUrl, name: setName });
                            }
                            if (downloadIdMode) {
                                let setName = getName(getTemplete(false, totalLength), desc, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'));
                                downloadList.push({ url: videoUrl, name: setName });
                            }
    
                        }
                    }
                }
                handleDownloadList(downloadList, getName(GM_getValue('packFileName', '{mblogid}.zip'), desc, '{original}', '{ext}', userName, userId, postId, postUid, '{index}'));
            }
        });
        aInLi.appendChild(dlBtn);
        dlBtnLi.appendChild(dlBtn);
        footer.firstChild.appendChild(dlBtnLi);
        // console.log('added download button');
    }

    function bodyMouseOver(event) {
        let svg = document.getElementById('__SVG_SPRITE_NODE__');
        let symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
        symbol.id = 'woo_svg_download';
        symbol.setAttribute('viewBox', '0 0 100 100');
        symbol.innerHTML = '<path fill="currentColor" d="m49.95875,100.13473c-3.05879,0 -5.93551,-1.24781 -7.92008,-3.45286l-36.05003,-36.92165c-2.73106,-3.02552 -3.29548,-7.00828 -1.58402,-10.47823a10.2688,9.64065 0 0 1 9.39486,-5.64081l13.1091,0l0,-33.87903c0,-5.1451 4.46074,-9.33297 9.94107,-9.33297l26.18179,0c5.48033,0 9.94107,4.18787 9.94107,9.33297l0,33.89612l13.1091,0c4.07839,0 7.68339,2.15376 9.39486,5.64081c1.71147,3.46995 1.14705,7.4527 -1.49298,10.37567l-36.19568,37.10968c-1.89354,2.08539 -4.77026,3.3503 -7.82905,3.3503zm-36.14106,-49.63911c-1.82071,0 -2.60361,1.282 -2.80389,1.67515s-0.72828,1.77771 0.43697,3.0768l36.05003,36.92165c0.89215,0.99141 1.91174,1.12816 2.43975,1.12816c0.52801,0 1.5476,-0.13675 2.34871,-1.0256l36.2503,-37.12677c1.07422,-1.21363 0.54621,-2.5811 0.34593,-2.97424s-0.96498,-1.67515 -2.80389,-1.67515l-16.75052,0c-2.00278,0 -3.64142,-1.5384 -3.64142,-3.41867l0,-37.3148c0,-1.38456 -1.20167,-2.49563 -2.65823,-2.49563l-26.16358,0c-1.47477,0 -2.65823,1.12816 -2.65823,2.49563l0,37.3148c0,1.88027 -1.63864,3.41867 -3.64142,3.41867l-16.75052,0z"/>';
        svg.appendChild(symbol);

        if (location.host == 'weibo.com') {
            // let arts = document.getElementsByTagName('article');
            const footers = document.getElementsByTagName('footer');
            for (const footer of footers) {
                if(footer.getElementsByClassName('download-button').length > 0) {
                    // console.log('already added download button');
                } else {
                    // console.log(footer.parentElement);
                    if(footer.parentElement.tagName.toLowerCase() == 'article') {
                        const article = footer.parentElement;
                        const imgs = article.getElementsByTagName('img');
                        let added = false;
                        // console.log(imgs);
                        if(imgs.length > 0) {
                            let addFlag = false;
                            for (const img of imgs) {
                                if(['woo-picture-img', 'picture_focusImg_1z5In', 'picture-viewer_pic_37YQ3'].includes(img.className)) {
                                    addFlag = true;
                                }
                            }
                            if(addFlag == true) {
                                addDlBtn(footer);
                                added = true;
                            }
                        }
                        let videos = article.getElementsByTagName('video');
                        if(videos.length > 0 && added == false) {
                            addDlBtn(footer);
                        }
                    }
                }
            }
        }
        if (location.host == 's.weibo.com') {
            // let cards = document.querySelectorAll('#pl_feedlist_index .card-wrap');
            const footers = document.querySelectorAll('#pl_feedlist_index .card-act');
            for (const footer of footers) {
                if(footer.getElementsByClassName('download-button').length > 0) {
                    // console.log('already added download button');
                } else {
                    // console.log(footer.parentElement);
                    if(footer.parentElement.className == 'card' && footer.parentElement.parentElement.className == 'card-wrap') {
                        const card = footer.parentElement;
                        let added = false;
                        const media_prev = card.querySelector('div[node-type="feed_list_media_prev"]');
                        // console.log(media_prev);
                        if (media_prev) {
                            const imgs = media_prev.getElementsByTagName('img');
                            // console.log(imgs);
                            if(imgs.length > 0) {
                                sAddDlBtn(footer);
                                added = true;
                            }
                            const videos = card.getElementsByTagName('video');
                            if(videos.length > 0 && added == false) {
                                sAddDlBtn(footer);
                            }
                        }
                    }
                }
            }
        }
    }

    function creatButton() {
        let custonButton = document.createElement('button');
        // custonButton.textContent = text;
        // custonButton.id = id;
        custonButton.style.top = '14rem';
        custonButton.style.left = '1rem';
        custonButton.style.backgroundColor = 'black';
        custonButton.style.color = 'lightgray';
        custonButton.style.marginRight = '0.5rem';
        custonButton.style.paddingLeft = '1rem';
        custonButton.style.paddingRight = '1rem';
        custonButton.style.paddingTop = '0.5rem';
        custonButton.style.paddingBottom = '0.5rem';
        custonButton.style.fontWeight = 'bold';
        custonButton.style.borderWidth = '0.15rem';
        custonButton.style.borderColor = 'lightgray';
        custonButton.style.borderRadius = '0.4rem';
        custonButton.style.borderStyle = 'solid';
        custonButton.addEventListener('mouseover', function(event) {
            custonButton.style.backgroundColor = 'lightgray';
            custonButton.style.color = 'black';
            custonButton.style.borderColor = 'black';
        });
        custonButton.addEventListener('mouseout', function(event) {
            custonButton.style.backgroundColor = 'black';
            custonButton.style.color = 'lightgray';
            custonButton.style.borderColor = 'lightgray';
        });
        custonButton.addEventListener('mousedown', function(event) {
            custonButton.style.backgroundColor = 'gray';
        });
        custonButton.addEventListener('mouseup', function(event) {
            custonButton.style.backgroundColor = 'lightgray';
        });
        return custonButton    
    }

    let startButton = creatButton();
    let settingModel

    function addStartButton() {
        settingModel.appendChild(startButton);
        document.body.removeEventListener('mouseover', bodyMouseOver)
    }

    function addEventListener() {
        if (settingModel.getElementById('startButton')) {
            settingModel.removeChild(startButton);
        }
        document.body.addEventListener('mouseover', bodyMouseOver);
    }

    let addDlBtnMode = GM_getValue('addDlBtnMode', 0);

    function initStartButton() {
        startButton.textContent = text[0];
        startButton.id = 'startButton';
        startButton.style.zIndex = 400;
        startButton.addEventListener('click', bodyMouseOver);
    }

    function showSetting() {
        settingModel = document.createElement('div');
        settingModel.style.top = '4rem';
        settingModel.style.position = 'fixed';
        settingModel.style.width = 'auto';
        settingModel.style.height = 'auto';
        settingModel.style.zIndex = 600;
        settingModel.style.padding = '1rem';
        settingModel.style.backgroundColor = '#0c0c0c';
        settingModel.style.borderRadius = '1rem';

        let question1 = document.createElement('div');
        question1.style.paddingBottom = '0.8rem';

        let labelChooseMode = document.createElement('label');
        labelChooseMode.textContent = text[2];
        labelChooseMode.style.display = 'block';
        labelChooseMode.style.width = 'calc(100% - 1rem)';
        labelChooseMode.style.marginBottom = '0.3rem';
        labelChooseMode.style.color = '#ea8011'
        question1.appendChild(labelChooseMode);

        let chooseButton = document.createElement('input');
        chooseButton.type = 'radio';
        chooseButton.id = 'chooseButton';
        chooseButton.name = 'chooseSetting';
        chooseButton.value = 1;
        let labelForChooseButton = document.createElement('label');
        labelForChooseButton.htmlFor = 'chooseButton';
        labelForChooseButton.textContent = text[3];
        let divForChooseButton = document.createElement('div');
        divForChooseButton.appendChild(chooseButton);
        divForChooseButton.appendChild(labelForChooseButton);
        question1.appendChild(divForChooseButton);
        let chooseEvent = document.createElement('input');
        chooseEvent.type = 'radio';
        chooseEvent.id = 'chooseEvent';
        chooseEvent.name = 'chooseSetting';
        chooseEvent.value = 2;
        chooseEvent.style.marginTop = '0.5rem';
        if (addDlBtnMode == 2) {
            chooseEvent.checked = true;
        } else {
            chooseButton.checked = true;
        }
        let labelForChooseEvent = document.createElement('label');
        labelForChooseEvent.htmlFor = 'chooseEvent';
        labelForChooseEvent.textContent = text[4];
        let divForChooseEvent = document.createElement('div');
        divForChooseEvent.appendChild(chooseEvent);
        divForChooseEvent.appendChild(labelForChooseEvent);
        question1.appendChild(divForChooseEvent);

        settingModel.appendChild(question1);


        let question2 = document.createElement('div');
        question2.style.paddingBottom = '0.8rem';

        let labelFileName = document.createElement('label');
        labelFileName.textContent = text[7];
        labelFileName.style.display = 'block';
        labelFileName.style.width = 'calc(100% - 1rem)';
        labelFileName.style.marginBottom = '0.3rem';
        labelFileName.style.color = '#ea8011'
        question2.appendChild(labelFileName);

        let checkBoxFileNameDesc = document.createElement('input');
        checkBoxFileNameDesc.type = 'checkbox';
        checkBoxFileNameDesc.id = 'checkBoxFileNameDesc';
        checkBoxFileNameDesc.name = 'checkBoxFileNameDesc';
        checkBoxFileNameDesc.style.marginTop = '0.5rem';
        checkBoxFileNameDesc.checked = GM_getValue('downloadDescMode', true);
        question2.appendChild(checkBoxFileNameDesc);
        let spanFileNameDesc = document.createElement('span')
        spanFileNameDesc.textContent = "描述"
        question2.append(spanFileNameDesc);
        let inputFileNameDesc = document.createElement('input')
        inputFileNameDesc.type = 'input';
        inputFileNameDesc.id = 'inputFileNameDesc'
        inputFileNameDesc.name = 'inputFileNameDesc';
        inputFileNameDesc.style.width = '160px'
        inputFileNameDesc.style.marginLeft = '30px'
        question2.append(inputFileNameDesc);

        let br1 = document.createElement('br');
        question2.append(br1);

        let checkBoxFileIndexDesc = document.createElement('input');
        checkBoxFileIndexDesc.type = 'checkbox';
        checkBoxFileIndexDesc.id = 'checkBoxFileIndexDesc';
        checkBoxFileIndexDesc.name = 'checkBoxFileIndexDesc';
        checkBoxFileIndexDesc.style.marginTop = '0.5rem';
        checkBoxFileIndexDesc.checked = GM_getValue('downloadDescMode', true);
        question2.appendChild(checkBoxFileIndexDesc);
        let spanFileIndexDesc = document.createElement('span')
        spanFileIndexDesc.textContent = "序号"
        question2.append(spanFileIndexDesc);
        let inputFileIndexDesc = document.createElement('input')
        inputFileIndexDesc.type = 'input';
        inputFileIndexDesc.id = 'inputFileIndexDesc'
        inputFileIndexDesc.name = 'inputFileIndexDesc';
        inputFileIndexDesc.style.width = '160px'
        inputFileIndexDesc.style.marginLeft = '30px'
        question2.append(inputFileIndexDesc);

        let br2 = document.createElement('br');
        question2.append(br2);

        let checkBoxFileNameId = document.createElement('input');
        checkBoxFileNameId.type = 'checkbox';
        checkBoxFileNameId.id = 'checkBoxFileNameId';
        checkBoxFileNameId.name = 'checkBoxFileNameId';
        checkBoxFileNameId.style.marginTop = '0.5rem';
        checkBoxFileNameId.checked = GM_getValue('downloadIdMode', false);
        question2.append(checkBoxFileNameId);
        let spanFileNameId = document.createElement('span')
        spanFileNameId.textContent = "微博ID"
        question2.append(spanFileNameId);

        settingModel.appendChild(question2);

        let okButton = creatButton();
        okButton.textContent = text[5];
        okButton.addEventListener('click', function(event) {
            if(document.getElementById('chooseButton').checked == true) {
                GM_setValue('addDlBtnMode', 1);
                addDlBtnMode = 1;
                addStartButton();
            } else {
                GM_setValue('addDlBtnMode', 2);
                addDlBtnMode = 2;
                addEventListener();
            }
        });
        settingModel.appendChild(okButton);

        document.body.appendChild(settingModel);
    }

    showSetting();
    initStartButton();

    if (addDlBtnMode == 1) {
        addStartButton();
    } else if (addDlBtnMode == 2) {
        addEventListener();
    }
})();