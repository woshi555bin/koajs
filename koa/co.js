/**
 * Created by wangbin23 on 2017/12/17.
 */
var fs = require("fs")
function size(file) {
    return function(fn){
        fs.stat(file, function(err, stat){
            if (err) return fn(err);
            fn(null, stat.size);
        });
    }
}
function co(fn) {
    return function(done) {
        var ctx = this;

        var gen = isGenerator(fn) ? fn : fn.call(ctx);
        var it = null;
        function _next(err, res) {
            it = gen.next(res);
            if (it.done) {
                done.call(ctx, err, it.value);
            } else {
                //new line
                it.value = toThunk(it.value,ctx);
                it.value(_next);
            }
        }
        _next();
    }
}
function isGeneratorFunction(obj) {
    return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}
function isGenerator(obj) {
    return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}
function isPromise(obj) {
    return obj && 'function' == typeof obj.then;
}
function isObject(obj){
    return obj && Object == obj.constructor;
}
function isArray(obj){
    return Array.isArray(obj);
}
function promiseToThunk(promise){
    return function(done){
        promise.then(function(err,res){
            done(err,res);
        },done)
    }
}
function objectToThunk(obj){
    var ctx = this;
    return function(done){
        var keys = Object.keys(obj);
        var results = new obj.constructor();
        var length = keys.length;
        var _run = function(fn,key){
            fn = toThunk(fn);
            fn.call(ctx,function(err,res){
                results[key] = res;
                --length || done(null, results);
            })
        }
        for(var i in keys){
            _run(obj[keys[i]],keys[i]);
        }

    }
}
function toThunk(obj,ctx){
    if (isGeneratorFunction(obj)) {
        return co(obj.call(ctx));
    }
    if (isGenerator(obj)) {
        return co(obj);
    }
    if (isObject(obj) || isArray(obj)) {
        return objectToThunk.call(ctx, obj);
    }
    if (isPromise(obj)) {
        return promiseToThunk.call(ctx, obj);
    }
    return obj;
}


co(function *(){
    var a = size('.gitignore');
    var b = size('package.json');
    var r = yield [a,b];
    return r;
})(function (err,args){
    console.log("callback===args=======");
    console.log(args);

})