# MyScripts

一个关于兔区的脚本  

## 目录

* [安装与使用](#安装与使用)
  * [PC端](#PC端)
  * [Android端](#Android端)
  * [IOS端](#IOS端)
* [主要功能](#主要功能)
  * [页面优化](#页面优化)
    * 白色主题
    * 去广告
    * 顶部直达 & 底部直达
    * 链接可点击
  * [板块页](#板块页)
    * [屏蔽帖子&举报帖子](#blockAndReport)
    * [发帖人发帖记录搜索](#发帖人发帖记录搜索)
  * [帖子页](#帖子页)
    * [屏蔽该帖](#屏蔽该帖)
    * [只看楼主/TA&屏蔽TA&隐藏TA](#onlyShow)
    * [标记楼主](#帖子页)
    * [发帖人及回帖人发帖记录搜索](#发帖人及回帖人发帖记录搜索)
  * [屏蔽页](#屏蔽页)
    * [查看屏蔽帖子](#查看屏蔽帖子)
    * [查看屏蔽用户名](#查看屏蔽用户名)
* [**注意事项 必看！**](#注意事项)

## 安装与使用

### PC端

1. 建议使用 Chrome或者Firefox，首先安装 [Tampermonkey](https://tampermonkey.net/) 油猴扩展。Chrome安装扩展需科学上网，无法科学上网安装扩展的方法请百度。
2. 安装完成后，点击本脚本的地址 [HERE](https://greasyfork.org/zh-CN/scripts/411262-%E5%85%94%E5%85%94%E5%85%94%E5%8C%BA) ，根据提示安装脚本。
3. 今后会提示更新。

### Android端

1. **使用Firefox/Kiwi Browser**

    步骤同PC先安装 [Tampermonkey](https://tampermonkey.net/) 油猴扩展再安装脚本，今后会提示更新。

2. **使用X浏览器**

    点击 **设置-浏览器脚本-新增脚本**，代码同 [via浏览器](#via) 。推荐使用此方法，会自动更新，无需手动。  
    或者直接点击本脚本的地址 [HERE](https://greasyfork.org/zh-CN/scripts/411262-%E5%85%94%E5%85%94%E5%85%94%E5%8C%BA) ，根据提示安装。该方法无法提示更新，只能覆盖安装，不推荐。   

<span id="via"></span>

3. **使用Via**

   设置-脚本-右上角加号-新建  ，会自动更新，无需手动。 
   域名：*  
   代码填写如下：

    ```javascript
    function shouldRun(){
        const whiteList = ['bindex','board','newpost','showmsg','search','filterword','userinfo','postbypolice'];
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        const finalName = pathname.substr(1).split(".")[0];
        const thisHost = (hostname == "bbs.jjwxc.net");
        const thisPath = whiteList.indexOf(finalName);
        if (thisHost && thisPath >= 0){
          console.log("Is WhiteList");
          return true;
        }
        console.log("Not WhiteList");
        return false;
    }

    (function(){
        console.log("ready");
        if (!shouldRun()){
            return;
        }
        const scriptMy = document.createElement('script');
        scriptMy.src = 'https://greasyfork.org/zh-CN/scripts/411262-%E5%85%94%E5%85%94%E5%85%94%E5%8C%BA/code/%25E5%2585%2594%25E5%2585%2594%25E5%2585%2594%25E5%258C%25BA%252B.user.js';
        document.head.appendChild(scriptMy);
    }())
    ```

### IOS端

* 使用Alook (付费App)  
设置-自定义设置-javascript扩展-右上角加号-主动扩展  
名称随意填写，代码段填写同 [via浏览器](#via) 。会自动更新，无需手动。 

## 主要功能

### 页面优化

* 白色主题
* 去广告
* [顶部直达&底部直达](https://greasyfork.org/zh-CN/scripts/370556-%E4%B8%80%E4%B8%AA%E8%BF%94%E5%9B%9E%E9%A1%B6%E9%83%A8%E5%92%8C%E5%88%B0%E8%BE%BE%E5%BA%95%E9%83%A8%E7%9A%84%E6%8C%89%E9%92%AE
)
* [链接可点击](https://github.com/lkytal/GM/blob/master/linkMix.user.js)

### 板块页

![](https://raw.githubusercontent.com/cccccchin/MyScripts/master/jjwxc/版块页.png)

<span id="blockAndReport"></span>

**屏蔽帖子 & 举报帖子**

* 点击左侧 **屏蔽** 按钮，将该**帖子id**加入**帖子屏蔽列表**，并立即隐藏该帖，今后也不再显示。  
* 点击左侧 **举报** 按钮，快捷举报。  

<span id="发帖人发帖记录搜索"></span>

**发帖人发帖记录搜索**

* 右侧发帖人 **用户名** 可点击，点击后将前台跳转至**该用户名**发帖记录搜索页。

### 帖子页
![](https://raw.githubusercontent.com/cccccchin/MyScripts/master/jjwxc/帖子页.png)

<span id="屏蔽该帖"></span>  

**屏蔽该帖**  

* 点击主楼 **屏蔽该帖**，同[板块页的屏蔽](#blockAndReport)。将该**帖子id**加入**帖子屏蔽列表**，今后不再显示。

<span id="onlyShow"></span>  

**只看楼主/TA & 屏蔽TA & 隐藏TA**  

* 点击 **只看楼主/只看TA**，在本帖只显示该用户名楼层，刷新失效。  
* 点击 **屏蔽TA** 全局屏蔽该用户名，将该**用户名**加入**用户名屏蔽列表**，立即隐藏该用户名在本楼的楼层。并且今后都将屏蔽该用户名所发的帖子，及其在所有帖子的回复楼层。  
* 点击 **隐藏TA** 在本帖隐藏该用户名，将立即隐藏该用户名在本楼的所有回复楼层，刷新失效，翻页失效。  

<span id="发帖人及回帖人发帖记录搜索"></span>  

**发帖人及回帖人发帖记录搜索**  

* 同 [板块页-发帖记录搜索](#发帖人发帖记录搜索)，楼主及回贴人的**用户名**均可点击，点击后前台跳转至**该用户名**发帖记录搜索页。

<span id="标记楼主"></span>  

**标记楼主**  

* 如图中主楼所示，在楼主楼层**用户名**左侧标记[楼主]

### 屏蔽页

![](https://raw.githubusercontent.com/cccccchin/MyScripts/master/jjwxc/屏蔽设置按钮.png)

点击版块页右上角 **屏蔽设置**，进入屏蔽页。  
除了屏蔽词管理，新增了 **屏蔽帖子** 和 **屏蔽用户名** 管理，点击上方tab进行切换。

![](https://raw.githubusercontent.com/cccccchin/MyScripts/master/jjwxc/屏蔽页.png)

<span id="查看屏蔽帖子"></span>

**查看屏蔽帖子**

* 在版块页点击 **屏蔽** 和帖子页首楼点击 **屏蔽此贴** 的帖子会被添加到该列表，全局有效。
* **帖子标题**可点击，直达帖子页面。

<span id="查看屏蔽用户名"></span>

**查看屏蔽用户名**

* 在帖子页的楼层中点 **屏蔽TA** 的用户名会被添加到该列表，全局有效。
* 列表中的用户，会屏蔽**该用户名**所发的帖子，及其在所有帖子的回复楼层。  
* **用户名**可点击，直达**该用户名**发帖记录搜索页。

## **注意事项**

* 屏蔽列表点击右方**解除**按钮即可移出屏蔽列表
* **屏蔽用户名功能** 不适用于**实名前**的用户名，如误屏蔽用户名，如“= =”，请到屏蔽列表移除。
* 该屏蔽列表只在该浏览器内生效。例如PC端的Chrome和Firefox都安装了此脚本，屏蔽列表是不相通的，也不会跟随账号。屏蔽列表只做浏览器本地存储，浏览器数据清理后也将全部清空。

![visitors](https://visitor-badge.glitch.me/badge?page_id=cccccchin.tuqu)
[![HitCount](http://hits.dwyl.com/cccccchin/MyScripts/tuqu.svg)](http://hits.dwyl.com/cccccchin/MyScripts/tuqu)
