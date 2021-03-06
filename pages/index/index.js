//index.js
//获取应用实例
var app = getApp();
var time='';
Page({
  data:{
    tempFilePaths:"",//wx.chooseImage接口返回的临时地址
    resultstring:"",//API返回的结果
    time:""//用时记录
  },
    chooseimage: function () {
      var that = this;
      wx.chooseImage({
        count: 1, // 默认9 
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有 
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
        success: function (res) {// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片 
          that.setData({tempFilePaths: res.tempFilePaths});//保存临时文件地址
      }
    })
  },

  submitimg: function () {
    wx.showLoading({'title':'识别中'});//提示框
    var CryptoJS = require('../../lib/crypto-js/crypto-js');//引入CryptoJS模块
    var now = Math.floor(Date.now()/1000);//生成时间戳Timestamp
    var expired = now + 1000;//生成过期时间
    var secret_src = 'a=' + app.globalData.appid + '&b=' + '&k=' + app.globalData.secretid+'&e='+expired+'&t='+now+'&r='+'123'+'&f=';//按照开发文档拼接字符串
    var auth_b = CryptoJS.HmacSHA1(secret_src, app.globalData.secret).concat(CryptoJS.enc.Utf8.parse(secret_src));//完成加密算法
    var auth = auth_b.toString(CryptoJS.enc.Base64);//按要求获取base64字符串
    var that=this;
    time=Date.now();//开始计时
    wx.uploadFile({
      url: 'https://recognition.image.myqcloud.com/ocr/handwriting', 
      filePath: this.data.tempFilePaths[0],
      name: 'image',
      header:{
        'authorization':auth//header按照文档填写
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
    if(result.code!=0)//非正常情况
    {
      wx.showModal({'title':'错误','content':'服务暂不可用\ncode:'+result.code+'\nmsg:'+result.message,'showCancel':false});
    }
    else
    {
      var out ="识别到了：\n";
      for(var i=0;i<result.data.items.length;i++)
      {
        out=out+'['+i+']'+' '+result.data.items[i].itemstring+'\n';//识别返回结果的拼接
      }
      var last = Date.now() - time;//停止计时
      this.setData({ time:' 用时:'+last+'ms'});//显示
      console.log(result);//控制台记录结果，以便调试
      this.setData({ "resultstring": out});
    }
  }

});
