/**
 * Created by wangbin23 on 2017/12/5.
 */
var http=require('http');
var req=module.exports={
    __proto__:http.IncomingMessage.prototype //req是IncomingMessage的实例 //res是ServerResponse亦即OutgoingMessage的实例
};
req.get=req.header=function header(name){
    var lc=name.toLocaleLowerCase();
    switch (lc) {
        case 'referer':
        case 'referrer'  :return this.headers.referrer || this.headers.referer
        default:return this.header[lc];
    }
};