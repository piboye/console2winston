var util = require("util");
var winston = require("winston");
var stackTrace = require("stack-trace");
var _ = require("underscore");

var g_logger = winston; 
exports.logger = g_logger;

exports.init= function(log) {
    g_logger = log;
    exports.logger = exports.winston = g_logger;
    return g_logger;
}
exports.enable_console = false;
exports.enable_extra_info = true;

var my_console = {};
for (var i in console) {
    my_console[i] = console[i];
}
exports.console= my_console;

function log(sl, level, args) {
   var out = "";
   if (exports.enable_extra_info) {
       var trace = stackTrace.parse(new Error());
       var filename = trace[sl].fileName;
       var funcname = trace[sl].functionName;
       if (funcname == null) funcname = trace[sl].methodName;
       var line = trace[sl].lineNumber;
       header = util.format("[%d][%s:%d][%s]\t", process.pid,filename, line, funcname);
       g_logger.log(level, header + args);
   } else {
        g_logger.log(level, out);
   }
   if (!!exports.enable_console) 
   {
       switch(level) {
           case "info": 
               my_console.info(out);
               break;
           case "debug":
               my_console.debug(out);
               break;
           case "error":
               my_console.error(out);
               break;
           case "warn":
               my_console.warn(out);
               break;
           default:
                my_console.log(out);
       }
   }
}


var g_time_labels={};
(function() {
    console.log = function(){ 
        log(2, "info", util.format.apply(util.format, arguments));
    };
    _.each(["info", "debug", "error", "warn", "verbose", "silly"], function(m) {
        console[m] = function(){log(2, m, util.format.apply(util.format, arguments));};
    });
    console.trace = function(lable) {
        var st = new Error().stack;
        st = st.replace(/^.*\n/, "");
        st = "Trace: "+lable +"\n" + st;
        log(2, "error", st); 
    };
    console.dir = function(a) {
        var out  = util.inspect(a);
        log(2, "info", out);
    };
    console.assert = function(a) {
        if (!a) {
             var st = new Error().stack; 
             var msg = Array.prototype.slice.call(arguments, 1, arguments.length);
             st = st.replace(/^.*\n/, "");
             st = st.replace(/^.*\n/, "AssertionError: " + util.format.apply(util.format, msg)+"\n");
             log(2, "error", st);
        }
    }
    console.time = function(label)  {
        g_time_labels[label] = new Date().getTime();
    }
    console.timeEnd = function(label) {
        var begin= g_time_labels[label];
        g_time_labels[label]=undefined;
        var now = new Date().getTime();
        if (typeof(begin) != 'undefined') {
            log(2, "info", label+": "+ (now - begin));
        } else {
            var st = new Error().stack;
            st = st.replace(/^.*\n/, "");
            st = "Error: No such label: "+label +"\n"+ st;
            log(2, "error", st); 
        }
    }
})();
