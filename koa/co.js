function co(fn) {
    //判断是否为 generatorFunction
    var isGenFun = isGeneratorFunction(fn);

    return function (done) {
        var ctx = this;

        var gen = fn;

        if (isGenFun) {
            //把 arguments 转换成数组
            var args = slice.call(arguments), len = args.length;
            //根据最后一个参数是否为函数，判断是否存在回掉函数
            var hasCallback = len && 'function' == typeof args[len - 1];
            done = hasCallback ? args.pop() : error;
            //执行 generatorFunction
            gen = fn.apply(this, args);
        } else {
            done = done || error;
        }
        //调用 next 函数，这是一个递归函数
        next();

        function exit(err, res) {
            setImmediate(function(){
                done.call(ctx, err, res);
            });
        }

        function next(err, res) {
            var ret;

            // multiple args
            if (arguments.length > 2) res = slice.call(arguments, 1);

            // error
            if (err) {
                try {
                    ret = gen.throw(err);
                } catch (e) {
                    return exit(e);
                }
            }

            // ok
            if (!err) {
                try {
                    //执行 next，会获得 yield 返回的对象。同时通过 next 传入数据，为变量赋值
                    //返回的对象格式是{value:xxx,done:xxx},这里的 value 是一个函数
                    ret = gen.next(res);
                } catch (e) {
                    return exit(e);
                }
            }

            // done 判断是否完成
            if (ret.done) return exit(null, ret.value);

            // normalize
            ret.value = toThunk(ret.value, ctx);

            // run
            if ('function' == typeof ret.value) {
                var called = false;
                try {
                    //执行 ret.value 函数，同时传入一个回调函数。当异步函数执行完，会递归 next
                    //next又会执行gen.next()，同时把结果传出去
                    ret.value.call(ctx, function(){
                        if (called) return;
                        called = true;
                        next.apply(ctx, arguments);
                    });
                } catch (e) {
                    setImmediate(function(){
                        if (called) return;
                        called = true;
                        next(e);
                    });
                }
                return;
            }

            // invalid
            next(new TypeError('You may only yield a function, promise, generator, array, or object, '
                + 'but the following was passed: "' + String(ret.value) + '"'));
        }
    }
}