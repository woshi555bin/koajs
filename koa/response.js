/**
 * Created by wangbin23 on 2017/12/5.
 */
var  _http_server =require('_http_server');
var fs=require('fs');
var path=require('path');
var res=module.exports={
    __proto__:__http_server.ServerResponse.prototype
};
var headersList={};
var statusCode=200;
/**
 * 设置响应首部
 * @param key
 * @param value
 * @return res
 */
res.headers=function(key,value){
    if(typeof key ==='object'){
        for (var n in key){
            if(!key.hasOwnProperty(n)) continue;
            headersList[n]=key[n]
        }
    }else{
        headersList[key]=value;
    }
    return this;
};
/**
 * 设置响应MIME Type
 * @param contentType
 * @returns res
 */
res.contentType=function(contentType){
    this.headers({'Content-Type':contentType});
    return this;
};
/**
 * 状态码
 * @param num
 * @returns res
 */
res.status=function(num){
    if(typeof num === 'number'){
        statusCode=num;
    }
    return this
};
/**
 * 发送整个首部
 * @return res
 */
res.sendHeader=function(){
    this.writeHead(statusCode,headerList);
    statusCode=200;
    headersList={};
    return this;
};
/**
 * 发送数据
 * @param msg
 */
res.send=function(msg){
    var type=typeof msg;
    if(type==='string' || Buffer.isBuffer(msg)){
        this.contentType('text/html').status(200).sendHeader().end(msg)
    }else if(type === 'object'){
        this.contentType('application/json').sendHeader().end(JSON.stringify(masg))
    }else if(type==='number'){
        this.contentType('text/plain').status(msg).sendHeader().end(_http_server.STATUS_CODES[msg])
    }
};
/**
 * 重定向
 * @param url 地址
 */
res.redirect=function(url){
    this.status(302);
    this.headers('Location',url || '/');
    this.sendHeader();
    this.end();
};
/**
 * 发送文件
 * @param staticPath
 */
res.sendFile=function(staticPath){
    fs.createReadStream(staticPath).pipe(this);
}
/**
 * 渲染模版引擎
 * @param name 模版文件名称
 * @param data 模版数据
 */
res.render = function (name, data) {
    var that=this;
    var engine = this.app.engineOptions;
    var viewEngine = engine.viewEngineList[engine.viewType];
    if (viewEngine) {
        viewEngine(path.join(engine.viewsPath, name + '.' + engine.viewType), data, function (err, data) {
            if (err) {
                that.status(500).sendHeader().send('view engine failure' + err);
            } else {
                that.status(200).contentType('text/html').sendHeader().send(data);
            }
        });
    } else {
        this.status(500).sendHeader().send('view engine failure');
    }
};