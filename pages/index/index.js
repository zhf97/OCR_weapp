//index.js
//获取应用实例
var app = getApp();
var time='';
Page({
  data:{
    tempFilePaths:"",
    resultstring:"",
    time:""
  },
    chooseimage: function () {
      var that = this;
      wx.chooseImage({
        count: 1, // 默认9 
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有 
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
        success: function (res) {// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片 
          that.setData({tempFilePaths: res.tempFilePaths});
      }
    })
  },

  submitimg: function () {
    wx.showLoading({'title':'识别中'});
    var CryptoJS = require('../../lib/crypto-js/crypto-js');
    var now = Math.floor(Date.now()/1000);
    var expired = now + 1000;
    var secret_src = 'a=' + app.globalData.appid + '&b=' + '&k=' + app.globalData.secretid+'&e='+expired+'&t='+now+'&r='+'123'+'&f=';
    var auth_b = CryptoJS.HmacSHA1(secret_src, app.globalData.secret).concat(CryptoJS.enc.Utf8.parse(secret_src));
    var auth = auth_b.toString(CryptoJS.enc.Base64);
    var that=this;
    time=Date.now();
    wx.uploadFile({
      url: 'https://recognition.image.myqcloud.com/ocr/handwriting', //仅为示例，非真实的接口地址 
      filePath: this.data.tempFilePaths[0],
      name: 'image',
      header:{
        'authorization':auth
      },
      formData: {
        'appid': app.globalData.appid
      },
      success: function (res) {
        wx.hideLoading();
        var data = res.data;
        that.display(data);
      }
      
    })
  },
  display(data){
    var result = JSON.parse(data);
    var out ="识别到了：\n";
    for(var i=0;i<result.data.items.length;i++)
    {
      out=out+'['+i+']'+' '+result.data.items[i].itemstring+'\n';
    }
    var last = Date.now() - time;
    this.setData({ time:' 用时:'+last+'ms'});
    console.log(result);
    this.setData({ "resultstring": out});
  }

});