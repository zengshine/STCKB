var commom = {
  ls: (function mystorage() {
    var ms = "mystorage";
    var storage = window.localStorage;
    if (!window.localStorage) {
      alert("浏览器支持localstorage");
      return false;
    }

    var set = function (key, value) {
      //存储
      var mydata = storage.getItem(ms);
      if (!mydata) {
        this.init();
        mydata = storage.getItem(ms);
      }
      mydata = JSON.parse(mydata);
      mydata.data[key] = value;
      storage.setItem(ms, JSON.stringify(mydata));
      return mydata.data;

    };

    var get = function (key) {
      //读取
      var mydata = storage.getItem(ms);
      if (!mydata) {
        return false;
      }
      mydata = JSON.parse(mydata);

      return mydata.data[key];
    };

    var remove = function (key) {
      //读取
      var mydata = storage.getItem(ms);
      if (!mydata) {
        return false;
      }

      mydata = JSON.parse(mydata);
      delete mydata.data[key];
      storage.setItem(ms, JSON.stringify(mydata));
      return mydata.data;
    };

    var clear = function () {
      //清除对象
      storage.removeItem(ms);
    };

    var init = function () {
      storage.setItem(ms, '{"data":{}}');
    };

    return {
      set: set,
      get: get,
      remove: remove,
      init: init,
      clear: clear
    };
  })(),

};
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
};
String.prototype.Trim = function () {
    /// <summary>去掉字符串的前后空格</summary>

    return this.replace(/(^\s*)|(\s*$)/g, "");
};
export default commom;
