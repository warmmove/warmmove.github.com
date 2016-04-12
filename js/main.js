
/****** FILE: handlebars-v1.3.0.js *****/
var Handlebars = (function() {
    var __module4__ = (function() {
        "use strict";
        var __exports__;
        function SafeString(string) {
            this.string = string;
        }
        SafeString.prototype.toString = function() {
            return "" + this.string;
        };
        __exports__ = SafeString;
        return __exports__;
    })();
    var __module3__ = (function(__dependency1__) {
        "use strict";
        var __exports__ = {};
        var SafeString = __dependency1__;
        var escape = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        };
        var badChars = /[&<>"'`]/g;
        var possible = /[&<>"'`]/;
        function escapeChar(chr) {
            return escape[chr] || "&amp;";
        }
        function extend(obj, value) {
            for (var key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    obj[key] = value[key];
                }
            }
        }
        __exports__.extend = extend;
        var toString = Object.prototype.toString;
        __exports__.toString = toString;
        var isFunction = function(value) {
            return typeof value === 'function';
        };
        if (isFunction(/x/)) {
            isFunction = function(value) {
                return typeof value === 'function' && toString.call(value) === '[object Function]';
            };
        }
        var isFunction;
        __exports__.isFunction = isFunction;
        var isArray = Array.isArray || function(value) {
            return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
        };
        __exports__.isArray = isArray;
        function escapeExpression(string) {
            if (string instanceof SafeString) {
                return string.toString();
            } else if (!string && string !== 0) {
                return "";
            }
            string = "" + string;
            if (!possible.test(string)) {
                return string;
            }
            return string.replace(badChars, escapeChar);
        }
        __exports__.escapeExpression = escapeExpression;
        function isEmpty(value) {
            if (!value && value !== 0) {
                return true;
            } else if (isArray(value) && value.length === 0) {
                return true;
            } else {
                return false;
            }
        }
        __exports__.isEmpty = isEmpty;
        return __exports__;
    })(__module4__);
    var __module5__ = (function() {
        "use strict";
        var __exports__;
        var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];
        function Exception(message, node) {
            var line;
            if (node && node.firstLine) {
                line = node.firstLine;
                message += ' - ' + line + ':' + node.firstColumn;
            }
            var tmp = Error.prototype.constructor.call(this, message);
            for (var idx = 0; idx < errorProps.length; idx++) {
                this[errorProps[idx]] = tmp[errorProps[idx]];
            }
            if (line) {
                this.lineNumber = line;
                this.column = node.firstColumn;
            }
        }
        Exception.prototype = new Error();
        __exports__ = Exception;
        return __exports__;
    })();
    var __module2__ = (function(__dependency1__, __dependency2__) {
        "use strict";
        var __exports__ = {};
        var Utils = __dependency1__;
        var Exception = __dependency2__;
        var VERSION = "1.3.0";
        __exports__.VERSION = VERSION;
        var COMPILER_REVISION = 4;
        __exports__.COMPILER_REVISION = COMPILER_REVISION;
        var REVISION_CHANGES = {
            1: '<= 1.0.rc.2',
            2: '== 1.0.0-rc.3',
            3: '== 1.0.0-rc.4',
            4: '>= 1.0.0'
        };
        __exports__.REVISION_CHANGES = REVISION_CHANGES;
        var isArray = Utils.isArray, isFunction = Utils.isFunction, toString = Utils.toString, objectType = '[object Object]';
        function HandlebarsEnvironment(helpers, partials) {
            this.helpers = helpers || {};
            this.partials = partials || {};
            registerDefaultHelpers(this);
        }
        __exports__.HandlebarsEnvironment = HandlebarsEnvironment;
        HandlebarsEnvironment.prototype = {
            constructor: HandlebarsEnvironment,
            logger: logger,
            log: log,
            registerHelper: function(name, fn, inverse) {
                if (toString.call(name) === objectType) {
                    if (inverse || fn) {
                        throw new Exception('Arg not supported with multiple helpers');
                    }
                    Utils.extend(this.helpers, name);
                } else {
                    if (inverse) {
                        fn.not = inverse;
                    }
                    this.helpers[name] = fn;
                }
            },
            registerPartial: function(name, str) {
                if (toString.call(name) === objectType) {
                    Utils.extend(this.partials, name);
                } else {
                    this.partials[name] = str;
                }
            }
        };
        function registerDefaultHelpers(instance) {
            instance.registerHelper('helperMissing', function(arg) {
                if (arguments.length === 2) {
                    return undefined;
                } else {
                    throw new Exception("Missing helper: '" + arg + "'");
                }
            });
            instance.registerHelper('blockHelperMissing', function(context, options) {
                var inverse = options.inverse || function() {}, fn = options.fn;
                if (isFunction(context)) {
                    context = context.call(this);
                }
                if (context === true) {
                    return fn(this);
                } else if (context === false || context == null) {
                    return inverse(this);
                } else if (isArray(context)) {
                    if (context.length > 0) {
                        return instance.helpers.each(context, options);
                    } else {
                        return inverse(this);
                    }
                } else {
                    return fn(context);
                }
            });
            instance.registerHelper('each', function(context, options) {
                var fn = options.fn, inverse = options.inverse;
                var i = 0, ret = "", data;
                if (isFunction(context)) {
                    context = context.call(this);
                }
                if (options.data) {
                    data = createFrame(options.data);
                }
                if (context && typeof context === 'object') {
                    if (isArray(context)) {
                        for (var j = context.length; i < j; i++) {
                            if (data) {
                                data.index = i;
                                data.first = (i === 0);
                                data.last = (i === (context.length - 1));
                            }
                            ret = ret + fn(context[i], {
                                data: data
                            });
                        }
                    } else {
                        for (var key in context) {
                            if (context.hasOwnProperty(key)) {
                                if (data) {
                                    data.key = key;
                                    data.index = i;
                                    data.first = (i === 0);
                                }
                                ret = ret + fn(context[key], {
                                    data: data
                                });
                                i++;
                            }
                        }
                    }
                }
                if (i === 0) {
                    ret = inverse(this);
                }
                return ret;
            });
            instance.registerHelper('if', function(conditional, options) {
                if (isFunction(conditional)) {
                    conditional = conditional.call(this);
                }
                if ((!options.hash.includeZero&&!conditional) || Utils.isEmpty(conditional)) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            });
            instance.registerHelper('unless', function(conditional, options) {
                return instance.helpers['if'].call(this, conditional, {
                    fn: options.inverse,
                    inverse: options.fn,
                    hash: options.hash
                });
            });
            instance.registerHelper('with', function(context, options) {
                if (isFunction(context)) {
                    context = context.call(this);
                }
                if (!Utils.isEmpty(context))
                    return options.fn(context);
            });
            instance.registerHelper('log', function(context, options) {
                var level = options.data && options.data.level != null ? parseInt(options.data.level, 10): 1;
                instance.log(level, context);
            });
        }
        var logger = {
            methodMap: {
                0: 'debug',
                1: 'info',
                2: 'warn',
                3: 'error'
            },
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            level: 3,
            log: function(level, obj) {
                if (logger.level <= level) {
                    var method = logger.methodMap[level];
                    if (typeof console !== 'undefined' && console[method]) {
                        console[method].call(console, obj);
                    }
                }
            }
        };
        __exports__.logger = logger;
        function log(level, obj) {
            logger.log(level, obj);
        }
        __exports__.log = log;
        var createFrame = function(object) {
            var obj = {};
            Utils.extend(obj, object);
            return obj;
        };
        __exports__.createFrame = createFrame;
        return __exports__;
    })(__module3__, __module5__);
    var __module6__ = (function(__dependency1__, __dependency2__, __dependency3__) {
        "use strict";
        var __exports__ = {};
        var Utils = __dependency1__;
        var Exception = __dependency2__;
        var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
        var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
        function checkRevision(compilerInfo) {
            var compilerRevision = compilerInfo && compilerInfo[0] || 1, currentRevision = COMPILER_REVISION;
            if (compilerRevision !== currentRevision) {
                if (compilerRevision < currentRevision) {
                    var runtimeVersions = REVISION_CHANGES[currentRevision], compilerVersions = REVISION_CHANGES[compilerRevision];
                    throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. " + "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").");
                } else {
                    throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. " + "Please update your runtime to a newer version (" + compilerInfo[1] + ").");
                }
            }
        }
        __exports__.checkRevision = checkRevision;
        function template(templateSpec, env) {
            if (!env) {
                throw new Exception("No environment passed to template");
            }
            var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
                var result = env.VM.invokePartial.apply(this, arguments);
                if (result != null) {
                    return result;
                }
                if (env.compile) {
                    var options = {
                        helpers: helpers,
                        partials: partials,
                        data: data
                    };
                    partials[name] = env.compile(partial, {
                        data: data !== undefined
                    }, env);
                    return partials[name](context, options);
                } else {
                    throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
                }
            };
            var container = {
                escapeExpression: Utils.escapeExpression,
                invokePartial: invokePartialWrapper,
                programs: [],
                program: function(i, fn, data) {
                    var programWrapper = this.programs[i];
                    if (data) {
                        programWrapper = program(i, fn, data);
                    } else if (!programWrapper) {
                        programWrapper = this.programs[i] = program(i, fn);
                    }
                    return programWrapper;
                },
                merge: function(param, common) {
                    var ret = param || common;
                    if (param && common && (param !== common)) {
                        ret = {};
                        Utils.extend(ret, common);
                        Utils.extend(ret, param);
                    }
                    return ret;
                },
                programWithDepth: env.VM.programWithDepth,
                noop: env.VM.noop,
                compilerInfo: null
            };
            return function(context, options) {
                options = options || {};
                var namespace = options.partial ? options: env, helpers, partials;
                if (!options.partial) {
                    helpers = options.helpers;
                    partials = options.partials;
                }
                var result = templateSpec.call(container, namespace, context, helpers, partials, options.data);
                if (!options.partial) {
                    env.VM.checkRevision(container.compilerInfo);
                }
                return result;
            };
        }
        __exports__.template = template;
        function programWithDepth(i, fn, data) {
            var args = Array.prototype.slice.call(arguments, 3);
            var prog = function(context, options) {
                options = options || {};
                return fn.apply(this, [context, options.data || data].concat(args));
            };
            prog.program = i;
            prog.depth = args.length;
            return prog;
        }
        __exports__.programWithDepth = programWithDepth;
        function program(i, fn, data) {
            var prog = function(context, options) {
                options = options || {};
                return fn(context, options.data || data);
            };
            prog.program = i;
            prog.depth = 0;
            return prog;
        }
        __exports__.program = program;
        function invokePartial(partial, name, context, helpers, partials, data) {
            var options = {
                partial: true,
                helpers: helpers,
                partials: partials,
                data: data
            };
            if (partial === undefined) {
                throw new Exception("The partial " + name + " could not be found");
            } else if (partial instanceof Function) {
                return partial(context, options);
            }
        }
        __exports__.invokePartial = invokePartial;
        function noop() {
            return "";
        }
        __exports__.noop = noop;
        return __exports__;
    })(__module3__, __module5__, __module2__);
    var __module1__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
        "use strict";
        var __exports__;
        var base = __dependency1__;
        var SafeString = __dependency2__;
        var Exception = __dependency3__;
        var Utils = __dependency4__;
        var runtime = __dependency5__;
        var create = function() {
            var hb = new base.HandlebarsEnvironment();
            Utils.extend(hb, base);
            hb.SafeString = SafeString;
            hb.Exception = Exception;
            hb.Utils = Utils;
            hb.VM = runtime;
            hb.template = function(spec) {
                return runtime.template(spec, hb);
            };
            return hb;
        };
        var Handlebars = create();
        Handlebars.create = create;
        __exports__ = Handlebars;
        return __exports__;
    })(__module2__, __module4__, __module5__, __module3__, __module6__);
    var __module7__ = (function(__dependency1__) {
        "use strict";
        var __exports__;
        var Exception = __dependency1__;
        function LocationInfo(locInfo) {
            locInfo = locInfo || {};
            this.firstLine = locInfo.first_line;
            this.firstColumn = locInfo.first_column;
            this.lastColumn = locInfo.last_column;
            this.lastLine = locInfo.last_line;
        }
        var AST = {
            ProgramNode: function(statements, inverseStrip, inverse, locInfo) {
                var inverseLocationInfo, firstInverseNode;
                if (arguments.length === 3) {
                    locInfo = inverse;
                    inverse = null;
                } else if (arguments.length === 2) {
                    locInfo = inverseStrip;
                    inverseStrip = null;
                }
                LocationInfo.call(this, locInfo);
                this.type = "program";
                this.statements = statements;
                this.strip = {};
                if (inverse) {
                    firstInverseNode = inverse[0];
                    if (firstInverseNode) {
                        inverseLocationInfo = {
                            first_line: firstInverseNode.firstLine,
                            last_line: firstInverseNode.lastLine,
                            last_column: firstInverseNode.lastColumn,
                            first_column: firstInverseNode.firstColumn
                        };
                        this.inverse = new AST.ProgramNode(inverse, inverseStrip, inverseLocationInfo);
                    } else {
                        this.inverse = new AST.ProgramNode(inverse, inverseStrip);
                    }
                    this.strip.right = inverseStrip.left;
                } else if (inverseStrip) {
                    this.strip.left = inverseStrip.right;
                }
            },
            MustacheNode: function(rawParams, hash, open, strip, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "mustache";
                this.strip = strip;
                if (open != null && open.charAt) {
                    var escapeFlag = open.charAt(3) || open.charAt(2);
                    this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
                } else {
                    this.escaped=!!open;
                }
                if (rawParams instanceof AST.SexprNode) {
                    this.sexpr = rawParams;
                } else {
                    this.sexpr = new AST.SexprNode(rawParams, hash);
                }
                this.sexpr.isRoot = true;
                this.id = this.sexpr.id;
                this.params = this.sexpr.params;
                this.hash = this.sexpr.hash;
                this.eligibleHelper = this.sexpr.eligibleHelper;
                this.isHelper = this.sexpr.isHelper;
            },
            SexprNode: function(rawParams, hash, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "sexpr";
                this.hash = hash;
                var id = this.id = rawParams[0];
                var params = this.params = rawParams.slice(1);
                var eligibleHelper = this.eligibleHelper = id.isSimple;
                this.isHelper = eligibleHelper && (params.length || hash);
            },
            PartialNode: function(partialName, context, strip, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "partial";
                this.partialName = partialName;
                this.context = context;
                this.strip = strip;
            },
            BlockNode: function(mustache, program, inverse, close, locInfo) {
                LocationInfo.call(this, locInfo);
                if (mustache.sexpr.id.original !== close.path.original) {
                    throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, this);
                }
                this.type = 'block';
                this.mustache = mustache;
                this.program = program;
                this.inverse = inverse;
                this.strip = {
                    left: mustache.strip.left,
                    right: close.strip.right
                };
                (program || inverse).strip.left = mustache.strip.right;
                (inverse || program).strip.right = close.strip.left;
                if (inverse&&!program) {
                    this.isInverse = true;
                }
            },
            ContentNode: function(string, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "content";
                this.string = string;
            },
            HashNode: function(pairs, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "hash";
                this.pairs = pairs;
            },
            IdNode: function(parts, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "ID";
                var original = "", dig = [], depth = 0;
                for (var i = 0, l = parts.length; i < l; i++) {
                    var part = parts[i].part;
                    original += (parts[i].separator || '') + part;
                    if (part === ".." || part === "." || part === "this") {
                        if (dig.length > 0) {
                            throw new Exception("Invalid path: " + original, this);
                        } else if (part === "..") {
                            depth++;
                        } else {
                            this.isScoped = true;
                        }
                    } else {
                        dig.push(part);
                    }
                }
                this.original = original;
                this.parts = dig;
                this.string = dig.join('.');
                this.depth = depth;
                this.isSimple = parts.length === 1&&!this.isScoped && depth === 0;
                this.stringModeValue = this.string;
            },
            PartialNameNode: function(name, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "PARTIAL_NAME";
                this.name = name.original;
            },
            DataNode: function(id, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "DATA";
                this.id = id;
            },
            StringNode: function(string, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "STRING";
                this.original = this.string = this.stringModeValue = string;
            },
            IntegerNode: function(integer, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "INTEGER";
                this.original = this.integer = integer;
                this.stringModeValue = Number(integer);
            },
            BooleanNode: function(bool, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "BOOLEAN";
                this.bool = bool;
                this.stringModeValue = bool === "true";
            },
            CommentNode: function(comment, locInfo) {
                LocationInfo.call(this, locInfo);
                this.type = "comment";
                this.comment = comment;
            }
        };
        __exports__ = AST;
        return __exports__;
    })(__module5__);
    var __module9__ = (function() {
        "use strict";
        var __exports__;
        var handlebars = (function() {
            var parser = {
                trace: function trace() {},
                yy: {},
                symbols_: {
                    "error": 2,
                    "root": 3,
                    "statements": 4,
                    "EOF": 5,
                    "program": 6,
                    "simpleInverse": 7,
                    "statement": 8,
                    "openInverse": 9,
                    "closeBlock": 10,
                    "openBlock": 11,
                    "mustache": 12,
                    "partial": 13,
                    "CONTENT": 14,
                    "COMMENT": 15,
                    "OPEN_BLOCK": 16,
                    "sexpr": 17,
                    "CLOSE": 18,
                    "OPEN_INVERSE": 19,
                    "OPEN_ENDBLOCK": 20,
                    "path": 21,
                    "OPEN": 22,
                    "OPEN_UNESCAPED": 23,
                    "CLOSE_UNESCAPED": 24,
                    "OPEN_PARTIAL": 25,
                    "partialName": 26,
                    "partial_option0": 27,
                    "sexpr_repetition0": 28,
                    "sexpr_option0": 29,
                    "dataName": 30,
                    "param": 31,
                    "STRING": 32,
                    "INTEGER": 33,
                    "BOOLEAN": 34,
                    "OPEN_SEXPR": 35,
                    "CLOSE_SEXPR": 36,
                    "hash": 37,
                    "hash_repetition_plus0": 38,
                    "hashSegment": 39,
                    "ID": 40,
                    "EQUALS": 41,
                    "DATA": 42,
                    "pathSegments": 43,
                    "SEP": 44,
                    "$accept": 0,
                    "$end": 1
                },
                terminals_: {
                    2: "error",
                    5: "EOF",
                    14: "CONTENT",
                    15: "COMMENT",
                    16: "OPEN_BLOCK",
                    18: "CLOSE",
                    19: "OPEN_INVERSE",
                    20: "OPEN_ENDBLOCK",
                    22: "OPEN",
                    23: "OPEN_UNESCAPED",
                    24: "CLOSE_UNESCAPED",
                    25: "OPEN_PARTIAL",
                    32: "STRING",
                    33: "INTEGER",
                    34: "BOOLEAN",
                    35: "OPEN_SEXPR",
                    36: "CLOSE_SEXPR",
                    40: "ID",
                    41: "EQUALS",
                    42: "DATA",
                    44: "SEP"
                },
                productions_: [0, [3, 2], [3, 1], [6, 2], [6, 3], [6, 2], [6, 1], [6, 1], [6, 0], [4, 1], [4, 2], [8, 3], [8, 3], [8, 1], [8, 1], [8, 1], [8, 1], [11, 3], [9, 3], [10, 3], [12, 3], [12, 3], [13, 4], [7, 2], [17, 3], [17, 1], [31, 1], [31, 1], [31, 1], [31, 1], [31, 1], [31, 3], [37, 1], [39, 3], [26, 1], [26, 1], [26, 1], [30, 2], [21, 1], [43, 3], [43, 1], [27, 0], [27, 1], [28, 0], [28, 2], [29, 0], [29, 1], [38, 1], [38, 2]],
                performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
                    var $0 = $$.length - 1;
                    switch (yystate) {
                    case 1:
                        return new yy.ProgramNode($$[$0 - 1], this._$);
                        break;
                    case 2:
                        return new yy.ProgramNode([], this._$);
                        break;
                    case 3:
                        this.$ = new yy.ProgramNode([], $$[$0 - 1], $$[$0], this._$);
                        break;
                    case 4:
                        this.$ = new yy.ProgramNode($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                        break;
                    case 5:
                        this.$ = new yy.ProgramNode($$[$0 - 1], $$[$0], [], this._$);
                        break;
                    case 6:
                        this.$ = new yy.ProgramNode($$[$0], this._$);
                        break;
                    case 7:
                        this.$ = new yy.ProgramNode([], this._$);
                        break;
                    case 8:
                        this.$ = new yy.ProgramNode([], this._$);
                        break;
                    case 9:
                        this.$ = [$$[$0]];
                        break;
                    case 10:
                        $$[$0 - 1].push($$[$0]);
                        this.$ = $$[$0 - 1];
                        break;
                    case 11:
                        this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1].inverse, $$[$0 - 1], $$[$0], this._$);
                        break;
                    case 12:
                        this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1], $$[$0 - 1].inverse, $$[$0], this._$);
                        break;
                    case 13:
                        this.$ = $$[$0];
                        break;
                    case 14:
                        this.$ = $$[$0];
                        break;
                    case 15:
                        this.$ = new yy.ContentNode($$[$0], this._$);
                        break;
                    case 16:
                        this.$ = new yy.CommentNode($$[$0], this._$);
                        break;
                    case 17:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;
                    case 18:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;
                    case 19:
                        this.$ = {
                            path: $$[$0 - 1],
                            strip: stripFlags($$[$0 - 2], $$[$0])
                        };
                        break;
                    case 20:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;
                    case 21:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;
                    case 22:
                        this.$ = new yy.PartialNode($$[$0 - 2], $$[$0 - 1], stripFlags($$[$0 - 3], $$[$0]), this._$);
                        break;
                    case 23:
                        this.$ = stripFlags($$[$0 - 1], $$[$0]);
                        break;
                    case 24:
                        this.$ = new yy.SexprNode([$$[$0 - 2]].concat($$[$0 - 1]), $$[$0], this._$);
                        break;
                    case 25:
                        this.$ = new yy.SexprNode([$$[$0]], null, this._$);
                        break;
                    case 26:
                        this.$ = $$[$0];
                        break;
                    case 27:
                        this.$ = new yy.StringNode($$[$0], this._$);
                        break;
                    case 28:
                        this.$ = new yy.IntegerNode($$[$0], this._$);
                        break;
                    case 29:
                        this.$ = new yy.BooleanNode($$[$0], this._$);
                        break;
                    case 30:
                        this.$ = $$[$0];
                        break;
                    case 31:
                        $$[$0 - 1].isHelper = true;
                        this.$ = $$[$0 - 1];
                        break;
                    case 32:
                        this.$ = new yy.HashNode($$[$0], this._$);
                        break;
                    case 33:
                        this.$ = [$$[$0 - 2], $$[$0]];
                        break;
                    case 34:
                        this.$ = new yy.PartialNameNode($$[$0], this._$);
                        break;
                    case 35:
                        this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
                        break;
                    case 36:
                        this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0], this._$));
                        break;
                    case 37:
                        this.$ = new yy.DataNode($$[$0], this._$);
                        break;
                    case 38:
                        this.$ = new yy.IdNode($$[$0], this._$);
                        break;
                    case 39:
                        $$[$0 - 2].push({
                            part: $$[$0],
                            separator: $$[$0 - 1]
                        });
                        this.$ = $$[$0 - 2];
                        break;
                    case 40:
                        this.$ = [{
                            part: $$[$0]
                        }
                        ];
                        break;
                    case 43:
                        this.$ = [];
                        break;
                    case 44:
                        $$[$0 - 1].push($$[$0]);
                        break;
                    case 47:
                        this.$ = [$$[$0]];
                        break;
                    case 48:
                        $$[$0 - 1].push($$[$0]);
                        break;
                    }
                },
                table: [{
                    3: 1,
                    4: 2,
                    5: [1, 3],
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 11],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    1: [3]
                }, {
                    5: [1, 16],
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 11],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    1: [2, 2]
                }, {
                    5: [2, 9],
                    14: [2, 9],
                    15: [2, 9],
                    16: [2, 9],
                    19: [2, 9],
                    20: [2, 9],
                    22: [2, 9],
                    23: [2, 9],
                    25: [2, 9]
                }, {
                    4: 20,
                    6: 18,
                    7: 19,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 21],
                    20: [2, 8],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    4: 20,
                    6: 22,
                    7: 19,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 21],
                    20: [2, 8],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    5: [2, 13],
                    14: [2, 13],
                    15: [2, 13],
                    16: [2, 13],
                    19: [2, 13],
                    20: [2, 13],
                    22: [2, 13],
                    23: [2, 13],
                    25: [2, 13]
                }, {
                    5: [2, 14],
                    14: [2, 14],
                    15: [2, 14],
                    16: [2, 14],
                    19: [2, 14],
                    20: [2, 14],
                    22: [2, 14],
                    23: [2, 14],
                    25: [2, 14]
                }, {
                    5: [2, 15],
                    14: [2, 15],
                    15: [2, 15],
                    16: [2, 15],
                    19: [2, 15],
                    20: [2, 15],
                    22: [2, 15],
                    23: [2, 15],
                    25: [2, 15]
                }, {
                    5: [2, 16],
                    14: [2, 16],
                    15: [2, 16],
                    16: [2, 16],
                    19: [2, 16],
                    20: [2, 16],
                    22: [2, 16],
                    23: [2, 16],
                    25: [2, 16]
                }, {
                    17: 23,
                    21: 24,
                    30: 25,
                    40: [1, 28],
                    42: [1, 27],
                    43: 26
                }, {
                    17: 29,
                    21: 24,
                    30: 25,
                    40: [1, 28],
                    42: [1, 27],
                    43: 26
                }, {
                    17: 30,
                    21: 24,
                    30: 25,
                    40: [1, 28],
                    42: [1, 27],
                    43: 26
                }, {
                    17: 31,
                    21: 24,
                    30: 25,
                    40: [1, 28],
                    42: [1, 27],
                    43: 26
                }, {
                    21: 33,
                    26: 32,
                    32: [1, 34],
                    33: [1, 35],
                    40: [1, 28],
                    43: 26
                }, {
                    1: [2, 1]
                }, {
                    5: [2, 10],
                    14: [2, 10],
                    15: [2, 10],
                    16: [2, 10],
                    19: [2, 10],
                    20: [2, 10],
                    22: [2, 10],
                    23: [2, 10],
                    25: [2, 10]
                }, {
                    10: 36,
                    20: [1, 37]
                }, {
                    4: 38,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 11],
                    20: [2, 7],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    7: 39,
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 21],
                    20: [2, 6],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    17: 23,
                    18: [1, 40],
                    21: 24,
                    30: 25,
                    40: [1, 28],
                    42: [1, 27],
                    43: 26
                }, {
                    10: 41,
                    20: [1, 37]
                }, {
                    18: [1, 42]
                }, {
                    18: [2, 43],
                    24: [2, 43],
                    28: 43,
                    32: [2, 43],
                    33: [2, 43],
                    34: [2, 43],
                    35: [2, 43],
                    36: [2, 43],
                    40: [2, 43],
                    42: [2, 43]
                }, {
                    18: [2, 25],
                    24: [2, 25],
                    36: [2, 25]
                }, {
                    18: [2, 38],
                    24: [2, 38],
                    32: [2, 38],
                    33: [2, 38],
                    34: [2, 38],
                    35: [2, 38],
                    36: [2, 38],
                    40: [2, 38],
                    42: [2, 38],
                    44: [1, 44]
                }, {
                    21: 45,
                    40: [1, 28],
                    43: 26
                }, {
                    18: [2, 40],
                    24: [2, 40],
                    32: [2, 40],
                    33: [2, 40],
                    34: [2, 40],
                    35: [2, 40],
                    36: [2, 40],
                    40: [2, 40],
                    42: [2, 40],
                    44: [2, 40]
                }, {
                    18: [1, 46]
                }, {
                    18: [1, 47]
                }, {
                    24: [1, 48]
                }, {
                    18: [2, 41],
                    21: 50,
                    27: 49,
                    40: [1, 28],
                    43: 26
                }, {
                    18: [2, 34],
                    40: [2, 34]
                }, {
                    18: [2, 35],
                    40: [2, 35]
                }, {
                    18: [2, 36],
                    40: [2, 36]
                }, {
                    5: [2, 11],
                    14: [2, 11],
                    15: [2, 11],
                    16: [2, 11],
                    19: [2, 11],
                    20: [2, 11],
                    22: [2, 11],
                    23: [2, 11],
                    25: [2, 11]
                }, {
                    21: 51,
                    40: [1, 28],
                    43: 26
                }, {
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 11],
                    20: [2, 3],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    4: 52,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 11],
                    20: [2, 5],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    14: [2, 23],
                    15: [2, 23],
                    16: [2, 23],
                    19: [2, 23],
                    20: [2, 23],
                    22: [2, 23],
                    23: [2, 23],
                    25: [2, 23]
                }, {
                    5: [2, 12],
                    14: [2, 12],
                    15: [2, 12],
                    16: [2, 12],
                    19: [2, 12],
                    20: [2, 12],
                    22: [2, 12],
                    23: [2, 12],
                    25: [2, 12]
                }, {
                    14: [2, 18],
                    15: [2, 18],
                    16: [2, 18],
                    19: [2, 18],
                    20: [2, 18],
                    22: [2, 18],
                    23: [2, 18],
                    25: [2, 18]
                }, {
                    18: [2, 45],
                    21: 56,
                    24: [2, 45],
                    29: 53,
                    30: 60,
                    31: 54,
                    32: [1, 57],
                    33: [1, 58],
                    34: [1, 59],
                    35: [1, 61],
                    36: [2, 45],
                    37: 55,
                    38: 62,
                    39: 63,
                    40: [1, 64],
                    42: [1, 27],
                    43: 26
                }, {
                    40: [1, 65]
                }, {
                    18: [2, 37],
                    24: [2, 37],
                    32: [2, 37],
                    33: [2, 37],
                    34: [2, 37],
                    35: [2, 37],
                    36: [2, 37],
                    40: [2, 37],
                    42: [2, 37]
                }, {
                    14: [2, 17],
                    15: [2, 17],
                    16: [2, 17],
                    19: [2, 17],
                    20: [2, 17],
                    22: [2, 17],
                    23: [2, 17],
                    25: [2, 17]
                }, {
                    5: [2, 20],
                    14: [2, 20],
                    15: [2, 20],
                    16: [2, 20],
                    19: [2, 20],
                    20: [2, 20],
                    22: [2, 20],
                    23: [2, 20],
                    25: [2, 20]
                }, {
                    5: [2, 21],
                    14: [2, 21],
                    15: [2, 21],
                    16: [2, 21],
                    19: [2, 21],
                    20: [2, 21],
                    22: [2, 21],
                    23: [2, 21],
                    25: [2, 21]
                }, {
                    18: [1, 66]
                }, {
                    18: [2, 42]
                }, {
                    18: [1, 67]
                }, {
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [1, 9],
                    15: [1, 10],
                    16: [1, 12],
                    19: [1, 11],
                    20: [2, 4],
                    22: [1, 13],
                    23: [1, 14],
                    25: [1, 15]
                }, {
                    18: [2, 24],
                    24: [2, 24],
                    36: [2, 24]
                }, {
                    18: [2, 44],
                    24: [2, 44],
                    32: [2, 44],
                    33: [2, 44],
                    34: [2, 44],
                    35: [2, 44],
                    36: [2, 44],
                    40: [2, 44],
                    42: [2, 44]
                }, {
                    18: [2, 46],
                    24: [2, 46],
                    36: [2, 46]
                }, {
                    18: [2, 26],
                    24: [2, 26],
                    32: [2, 26],
                    33: [2, 26],
                    34: [2, 26],
                    35: [2, 26],
                    36: [2, 26],
                    40: [2, 26],
                    42: [2, 26]
                }, {
                    18: [2, 27],
                    24: [2, 27],
                    32: [2, 27],
                    33: [2, 27],
                    34: [2, 27],
                    35: [2, 27],
                    36: [2, 27],
                    40: [2, 27],
                    42: [2, 27]
                }, {
                    18: [2, 28],
                    24: [2, 28],
                    32: [2, 28],
                    33: [2, 28],
                    34: [2, 28],
                    35: [2, 28],
                    36: [2, 28],
                    40: [2, 28],
                    42: [2, 28]
                }, {
                    18: [2, 29],
                    24: [2, 29],
                    32: [2, 29],
                    33: [2, 29],
                    34: [2, 29],
                    35: [2, 29],
                    36: [2, 29],
                    40: [2, 29],
                    42: [2, 29]
                }, {
                    18: [2, 30],
                    24: [2, 30],
                    32: [2, 30],
                    33: [2, 30],
                    34: [2, 30],
                    35: [2, 30],
                    36: [2, 30],
                    40: [2, 30],
                    42: [2, 30]
                }, {
                    17: 68,
                    21: 24,
                    30: 25,
                    40: [1, 28],
                    42: [1, 27],
                    43: 26
                }, {
                    18: [2, 32],
                    24: [2, 32],
                    36: [2, 32],
                    39: 69,
                    40: [1, 70]
                }, {
                    18: [2, 47],
                    24: [2, 47],
                    36: [2, 47],
                    40: [2, 47]
                }, {
                    18: [2, 40],
                    24: [2, 40],
                    32: [2, 40],
                    33: [2, 40],
                    34: [2, 40],
                    35: [2, 40],
                    36: [2, 40],
                    40: [2, 40],
                    41: [1, 71],
                    42: [2, 40],
                    44: [2, 40]
                }, {
                    18: [2, 39],
                    24: [2, 39],
                    32: [2, 39],
                    33: [2, 39],
                    34: [2, 39],
                    35: [2, 39],
                    36: [2, 39],
                    40: [2, 39],
                    42: [2, 39],
                    44: [2, 39]
                }, {
                    5: [2, 22],
                    14: [2, 22],
                    15: [2, 22],
                    16: [2, 22],
                    19: [2, 22],
                    20: [2, 22],
                    22: [2, 22],
                    23: [2, 22],
                    25: [2, 22]
                }, {
                    5: [2, 19],
                    14: [2, 19],
                    15: [2, 19],
                    16: [2, 19],
                    19: [2, 19],
                    20: [2, 19],
                    22: [2, 19],
                    23: [2, 19],
                    25: [2, 19]
                }, {
                    36: [1, 72]
                }, {
                    18: [2, 48],
                    24: [2, 48],
                    36: [2, 48],
                    40: [2, 48]
                }, {
                    41: [1, 71]
                }, {
                    21: 56,
                    30: 60,
                    31: 73,
                    32: [1, 57],
                    33: [1, 58],
                    34: [1, 59],
                    35: [1, 61],
                    40: [1, 28],
                    42: [1, 27],
                    43: 26
                }, {
                    18: [2, 31],
                    24: [2, 31],
                    32: [2, 31],
                    33: [2, 31],
                    34: [2, 31],
                    35: [2, 31],
                    36: [2, 31],
                    40: [2, 31],
                    42: [2, 31]
                }, {
                    18: [2, 33],
                    24: [2, 33],
                    36: [2, 33],
                    40: [2, 33]
                }
                ],
                defaultActions: {
                    3: [2, 2],
                    16: [2, 1],
                    50: [2, 42]
                },
                parseError: function parseError(str, hash) {
                    throw new Error(str);
                },
                parse: function parse(input) {
                    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
                    this.lexer.setInput(input);
                    this.lexer.yy = this.yy;
                    this.yy.lexer = this.lexer;
                    this.yy.parser = this;
                    if (typeof this.lexer.yylloc == "undefined")
                        this.lexer.yylloc = {};
                    var yyloc = this.lexer.yylloc;
                    lstack.push(yyloc);
                    var ranges = this.lexer.options && this.lexer.options.ranges;
                    if (typeof this.yy.parseError === "function")
                        this.parseError = this.yy.parseError;
                    function popStack(n) {
                        stack.length = stack.length - 2 * n;
                        vstack.length = vstack.length - n;
                        lstack.length = lstack.length - n;
                    }
                    function lex() {
                        var token;
                        token = self.lexer.lex() || 1;
                        if (typeof token !== "number") {
                            token = self.symbols_[token] || token;
                        }
                        return token;
                    }
                    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
                    while (true) {
                        state = stack[stack.length - 1];
                        if (this.defaultActions[state]) {
                            action = this.defaultActions[state];
                        } else {
                            if (symbol === null || typeof symbol == "undefined") {
                                symbol = lex();
                            }
                            action = table[state] && table[state][symbol];
                        }
                        if (typeof action === "undefined" ||!action.length ||!action[0]) {
                            var errStr = "";
                            if (!recovering) {
                                expected = [];
                                for (p in table[state])
                                    if (this.terminals_[p] && p > 2) {
                                        expected.push("'" + this.terminals_[p] + "'");
                                    }
                                if (this.lexer.showPosition) {
                                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                                } else {
                                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                                }
                                this.parseError(errStr, {
                                    text: this.lexer.match,
                                    token: this.terminals_[symbol] || symbol,
                                    line: this.lexer.yylineno,
                                    loc: yyloc,
                                    expected: expected
                                });
                            }
                        }
                        if (action[0]instanceof Array && action.length > 1) {
                            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                        }
                        switch (action[0]) {
                        case 1:
                            stack.push(symbol);
                            vstack.push(this.lexer.yytext);
                            lstack.push(this.lexer.yylloc);
                            stack.push(action[1]);
                            symbol = null;
                            if (!preErrorSymbol) {
                                yyleng = this.lexer.yyleng;
                                yytext = this.lexer.yytext;
                                yylineno = this.lexer.yylineno;
                                yyloc = this.lexer.yylloc;
                                if (recovering > 0)
                                    recovering--;
                            } else {
                                symbol = preErrorSymbol;
                                preErrorSymbol = null;
                            }
                            break;
                        case 2:
                            len = this.productions_[action[1]][1];
                            yyval.$ = vstack[vstack.length - len];
                            yyval._$ = {
                                first_line: lstack[lstack.length - (len || 1)].first_line,
                                last_line: lstack[lstack.length - 1].last_line,
                                first_column: lstack[lstack.length - (len || 1)].first_column,
                                last_column: lstack[lstack.length - 1].last_column
                            };
                            if (ranges) {
                                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                            }
                            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                            if (typeof r !== "undefined") {
                                return r;
                            }
                            if (len) {
                                stack = stack.slice(0, - 1 * len * 2);
                                vstack = vstack.slice(0, - 1 * len);
                                lstack = lstack.slice(0, - 1 * len);
                            }
                            stack.push(this.productions_[action[1]][0]);
                            vstack.push(yyval.$);
                            lstack.push(yyval._$);
                            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                            stack.push(newState);
                            break;
                        case 3:
                            return true;
                        }
                    }
                    return true;
                }
            };
            function stripFlags(open, close) {
                return {
                    left: open.charAt(2) === '~',
                    right: close.charAt(0) === '~' || close.charAt(1) === '~'
                };
            }
            var lexer = (function() {
                var lexer = ({
                    EOF: 1,
                    parseError: function parseError(str, hash) {
                        if (this.yy.parser) {
                            this.yy.parser.parseError(str, hash);
                        } else {
                            throw new Error(str);
                        }
                    },
                    setInput: function(input) {
                        this._input = input;
                        this._more = this._less = this.done = false;
                        this.yylineno = this.yyleng = 0;
                        this.yytext = this.matched = this.match = '';
                        this.conditionStack = ['INITIAL'];
                        this.yylloc = {
                            first_line: 1,
                            first_column: 0,
                            last_line: 1,
                            last_column: 0
                        };
                        if (this.options.ranges)
                            this.yylloc.range = [0, 0];
                        this.offset = 0;
                        return this;
                    },
                    input: function() {
                        var ch = this._input[0];
                        this.yytext += ch;
                        this.yyleng++;
                        this.offset++;
                        this.match += ch;
                        this.matched += ch;
                        var lines = ch.match(/(?:\r\n?|\n).*/g);
                        if (lines) {
                            this.yylineno++;
                            this.yylloc.last_line++;
                        } else {
                            this.yylloc.last_column++;
                        }
                        if (this.options.ranges)
                            this.yylloc.range[1]++;
                        this._input = this._input.slice(1);
                        return ch;
                    },
                    unput: function(ch) {
                        var len = ch.length;
                        var lines = ch.split(/(?:\r\n?|\n)/g);
                        this._input = ch + this._input;
                        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
                        this.offset -= len;
                        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                        this.match = this.match.substr(0, this.match.length - 1);
                        this.matched = this.matched.substr(0, this.matched.length - 1);
                        if (lines.length - 1)
                            this.yylineno -= lines.length - 1;
                        var r = this.yylloc.range;
                        this.yylloc = {
                            first_line: this.yylloc.first_line,
                            last_line: this.yylineno + 1,
                            first_column: this.yylloc.first_column,
                            last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length: this.yylloc.first_column - len
                        };
                        if (this.options.ranges) {
                            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
                        }
                        return this;
                    },
                    more: function() {
                        this._more = true;
                        return this;
                    },
                    less: function(n) {
                        this.unput(this.match.slice(n));
                    },
                    pastInput: function() {
                        var past = this.matched.substr(0, this.matched.length - this.match.length);
                        return (past.length > 20 ? '...' : '') + past.substr( - 20).replace(/\n/g, "");
                    },
                    upcomingInput: function() {
                        var next = this.match;
                        if (next.length < 20) {
                            next += this._input.substr(0, 20 - next.length);
                        }
                        return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
                    },
                    showPosition: function() {
                        var pre = this.pastInput();
                        var c = new Array(pre.length + 1).join("-");
                        return pre + this.upcomingInput() + "\n" + c + "^";
                    },
                    next: function() {
                        if (this.done) {
                            return this.EOF;
                        }
                        if (!this._input)
                            this.done = true;
                        var token, match, tempMatch, index, col, lines;
                        if (!this._more) {
                            this.yytext = '';
                            this.match = '';
                        }
                        var rules = this._currentRules();
                        for (var i = 0; i < rules.length; i++) {
                            tempMatch = this._input.match(this.rules[rules[i]]);
                            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                                match = tempMatch;
                                index = i;
                                if (!this.options.flex)
                                    break;
                            }
                        }
                        if (match) {
                            lines = match[0].match(/(?:\r\n?|\n).*/g);
                            if (lines)
                                this.yylineno += lines.length;
                            this.yylloc = {
                                first_line: this.yylloc.last_line,
                                last_line: this.yylineno + 1,
                                first_column: this.yylloc.last_column,
                                last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length: this.yylloc.last_column + match[0].length
                            };
                            this.yytext += match[0];
                            this.match += match[0];
                            this.matches = match;
                            this.yyleng = this.yytext.length;
                            if (this.options.ranges) {
                                this.yylloc.range = [this.offset, this.offset += this.yyleng];
                            }
                            this._more = false;
                            this._input = this._input.slice(match[0].length);
                            this.matched += match[0];
                            token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
                            if (this.done && this._input)
                                this.done = false;
                            if (token)
                                return token;
                            else 
                                return;
                        }
                        if (this._input === "") {
                            return this.EOF;
                        } else {
                            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                                text: "",
                                token: null,
                                line: this.yylineno
                            });
                        }
                    },
                    lex: function lex() {
                        var r = this.next();
                        if (typeof r !== 'undefined') {
                            return r;
                        } else {
                            return this.lex();
                        }
                    },
                    begin: function begin(condition) {
                        this.conditionStack.push(condition);
                    },
                    popState: function popState() {
                        return this.conditionStack.pop();
                    },
                    _currentRules: function _currentRules() {
                        return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                    },
                    topState: function() {
                        return this.conditionStack[this.conditionStack.length - 2];
                    },
                    pushState: function begin(condition) {
                        this.begin(condition);
                    }
                });
                lexer.options = {};
                lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
                    function strip(start, end) {
                        return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
                    }
                    var YYSTATE = YY_START
                    switch ($avoiding_name_collisions) {
                    case 0:
                        if (yy_.yytext.slice( - 2) === "\\\\") {
                            strip(0, 1);
                            this.begin("mu");
                        } else if (yy_.yytext.slice( - 1) === "\\") {
                            strip(0, 1);
                            this.begin("emu");
                        } else {
                            this.begin("mu");
                        }
                        if (yy_.yytext)
                            return 14;
                        break;
                    case 1:
                        return 14;
                        break;
                    case 2:
                        this.popState();
                        return 14;
                        break;
                    case 3:
                        strip(0, 4);
                        this.popState();
                        return 15;
                        break;
                    case 4:
                        return 35;
                        break;
                    case 5:
                        return 36;
                        break;
                    case 6:
                        return 25;
                        break;
                    case 7:
                        return 16;
                        break;
                    case 8:
                        return 20;
                        break;
                    case 9:
                        return 19;
                        break;
                    case 10:
                        return 19;
                        break;
                    case 11:
                        return 23;
                        break;
                    case 12:
                        return 22;
                        break;
                    case 13:
                        this.popState();
                        this.begin('com');
                        break;
                    case 14:
                        strip(3, 5);
                        this.popState();
                        return 15;
                        break;
                    case 15:
                        return 22;
                        break;
                    case 16:
                        return 41;
                        break;
                    case 17:
                        return 40;
                        break;
                    case 18:
                        return 40;
                        break;
                    case 19:
                        return 44;
                        break;
                    case 20:
                        break;
                    case 21:
                        this.popState();
                        return 24;
                        break;
                    case 22:
                        this.popState();
                        return 18;
                        break;
                    case 23:
                        yy_.yytext = strip(1, 2).replace(/\\"/g, '"');
                        return 32;
                        break;
                    case 24:
                        yy_.yytext = strip(1, 2).replace(/\\'/g, "'");
                        return 32;
                        break;
                    case 25:
                        return 42;
                        break;
                    case 26:
                        return 34;
                        break;
                    case 27:
                        return 34;
                        break;
                    case 28:
                        return 33;
                        break;
                    case 29:
                        return 40;
                        break;
                    case 30:
                        yy_.yytext = strip(1, 2);
                        return 40;
                        break;
                    case 31:
                        return 'INVALID';
                        break;
                    case 32:
                        return 5;
                        break;
                    }
                };
                lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:-?[0-9]+(?=([~}\s)])))/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/];
                lexer.conditions = {
                    "mu": {
                        "rules": [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
                        "inclusive": false
                    },
                    "emu": {
                        "rules": [2],
                        "inclusive": false
                    },
                    "com": {
                        "rules": [3],
                        "inclusive": false
                    },
                    "INITIAL": {
                        "rules": [0, 1, 32],
                        "inclusive": true
                    }
                };
                return lexer;
            })()
            parser.lexer = lexer;
            function Parser() {
                this.yy = {};
            }
            Parser.prototype = parser;
            parser.Parser = Parser;
            return new Parser;
        })();
        __exports__ = handlebars;
        return __exports__;
    })();
    var __module8__ = (function(__dependency1__, __dependency2__) {
        "use strict";
        var __exports__ = {};
        var parser = __dependency1__;
        var AST = __dependency2__;
        __exports__.parser = parser;
        function parse(input) {
            if (input.constructor === AST.ProgramNode) {
                return input;
            }
            parser.yy = AST;
            return parser.parse(input);
        }
        __exports__.parse = parse;
        return __exports__;
    })(__module9__, __module7__);
    var __module10__ = (function(__dependency1__) {
        "use strict";
        var __exports__ = {};
        var Exception = __dependency1__;
        function Compiler() {}
        __exports__.Compiler = Compiler;
        Compiler.prototype = {
            compiler: Compiler,
            disassemble: function() {
                var opcodes = this.opcodes, opcode, out = [], params, param;
                for (var i = 0, l = opcodes.length; i < l; i++) {
                    opcode = opcodes[i];
                    if (opcode.opcode === 'DECLARE') {
                        out.push("DECLARE " + opcode.name + "=" + opcode.value);
                    } else {
                        params = [];
                        for (var j = 0; j < opcode.args.length; j++) {
                            param = opcode.args[j];
                            if (typeof param === "string") {
                                param = "\"" + param.replace("\n", "\\n") + "\"";
                            }
                            params.push(param);
                        }
                        out.push(opcode.opcode + " " + params.join(" "));
                    }
                }
                return out.join("\n");
            },
            equals: function(other) {
                var len = this.opcodes.length;
                if (other.opcodes.length !== len) {
                    return false;
                }
                for (var i = 0; i < len; i++) {
                    var opcode = this.opcodes[i], otherOpcode = other.opcodes[i];
                    if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
                        return false;
                    }
                    for (var j = 0; j < opcode.args.length; j++) {
                        if (opcode.args[j] !== otherOpcode.args[j]) {
                            return false;
                        }
                    }
                }
                len = this.children.length;
                if (other.children.length !== len) {
                    return false;
                }
                for (i = 0; i < len; i++) {
                    if (!this.children[i].equals(other.children[i])) {
                        return false;
                    }
                }
                return true;
            },
            guid: 0,
            compile: function(program, options) {
                this.opcodes = [];
                this.children = [];
                this.depths = {
                    list: []
                };
                this.options = options;
                var knownHelpers = this.options.knownHelpers;
                this.options.knownHelpers = {
                    'helperMissing': true,
                    'blockHelperMissing': true,
                    'each': true,
                    'if': true,
                    'unless': true,
                    'with': true,
                    'log': true
                };
                if (knownHelpers) {
                    for (var name in knownHelpers) {
                        this.options.knownHelpers[name] = knownHelpers[name];
                    }
                }
                return this.accept(program);
            },
            accept: function(node) {
                var strip = node.strip || {}, ret;
                if (strip.left) {
                    this.opcode('strip');
                }
                ret = this[node.type](node);
                if (strip.right) {
                    this.opcode('strip');
                }
                return ret;
            },
            program: function(program) {
                var statements = program.statements;
                for (var i = 0, l = statements.length; i < l; i++) {
                    this.accept(statements[i]);
                }
                this.isSimple = l === 1;
                this.depths.list = this.depths.list.sort(function(a, b) {
                    return a - b;
                });
                return this;
            },
            compileProgram: function(program) {
                var result = new this.compiler().compile(program, this.options);
                var guid = this.guid++, depth;
                this.usePartial = this.usePartial || result.usePartial;
                this.children[guid] = result;
                for (var i = 0, l = result.depths.list.length; i < l; i++) {
                    depth = result.depths.list[i];
                    if (depth < 2) {
                        continue;
                    } else {
                        this.addDepth(depth - 1);
                    }
                }
                return guid;
            },
            block: function(block) {
                var mustache = block.mustache, program = block.program, inverse = block.inverse;
                if (program) {
                    program = this.compileProgram(program);
                }
                if (inverse) {
                    inverse = this.compileProgram(inverse);
                }
                var sexpr = mustache.sexpr;
                var type = this.classifySexpr(sexpr);
                if (type === "helper") {
                    this.helperSexpr(sexpr, program, inverse);
                } else if (type === "simple") {
                    this.simpleSexpr(sexpr);
                    this.opcode('pushProgram', program);
                    this.opcode('pushProgram', inverse);
                    this.opcode('emptyHash');
                    this.opcode('blockValue');
                } else {
                    this.ambiguousSexpr(sexpr, program, inverse);
                    this.opcode('pushProgram', program);
                    this.opcode('pushProgram', inverse);
                    this.opcode('emptyHash');
                    this.opcode('ambiguousBlockValue');
                }
                this.opcode('append');
            },
            hash: function(hash) {
                var pairs = hash.pairs, pair, val;
                this.opcode('pushHash');
                for (var i = 0, l = pairs.length; i < l; i++) {
                    pair = pairs[i];
                    val = pair[1];
                    if (this.options.stringParams) {
                        if (val.depth) {
                            this.addDepth(val.depth);
                        }
                        this.opcode('getContext', val.depth || 0);
                        this.opcode('pushStringParam', val.stringModeValue, val.type);
                        if (val.type === 'sexpr') {
                            this.sexpr(val);
                        }
                    } else {
                        this.accept(val);
                    }
                    this.opcode('assignToHash', pair[0]);
                }
                this.opcode('popHash');
            },
            partial: function(partial) {
                var partialName = partial.partialName;
                this.usePartial = true;
                if (partial.context) {
                    this.ID(partial.context);
                } else {
                    this.opcode('push', 'depth0');
                }
                this.opcode('invokePartial', partialName.name);
                this.opcode('append');
            },
            content: function(content) {
                this.opcode('appendContent', content.string);
            },
            mustache: function(mustache) {
                this.sexpr(mustache.sexpr);
                if (mustache.escaped&&!this.options.noEscape) {
                    this.opcode('appendEscaped');
                } else {
                    this.opcode('append');
                }
            },
            ambiguousSexpr: function(sexpr, program, inverse) {
                var id = sexpr.id, name = id.parts[0], isBlock = program != null || inverse != null;
                this.opcode('getContext', id.depth);
                this.opcode('pushProgram', program);
                this.opcode('pushProgram', inverse);
                this.opcode('invokeAmbiguous', name, isBlock);
            },
            simpleSexpr: function(sexpr) {
                var id = sexpr.id;
                if (id.type === 'DATA') {
                    this.DATA(id);
                } else if (id.parts.length) {
                    this.ID(id);
                } else {
                    this.addDepth(id.depth);
                    this.opcode('getContext', id.depth);
                    this.opcode('pushContext');
                }
                this.opcode('resolvePossibleLambda');
            },
            helperSexpr: function(sexpr, program, inverse) {
                var params = this.setupFullMustacheParams(sexpr, program, inverse), name = sexpr.id.parts[0];
                if (this.options.knownHelpers[name]) {
                    this.opcode('invokeKnownHelper', params.length, name);
                } else if (this.options.knownHelpersOnly) {
                    throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
                } else {
                    this.opcode('invokeHelper', params.length, name, sexpr.isRoot);
                }
            },
            sexpr: function(sexpr) {
                var type = this.classifySexpr(sexpr);
                if (type === "simple") {
                    this.simpleSexpr(sexpr);
                } else if (type === "helper") {
                    this.helperSexpr(sexpr);
                } else {
                    this.ambiguousSexpr(sexpr);
                }
            },
            ID: function(id) {
                this.addDepth(id.depth);
                this.opcode('getContext', id.depth);
                var name = id.parts[0];
                if (!name) {
                    this.opcode('pushContext');
                } else {
                    this.opcode('lookupOnContext', id.parts[0]);
                }
                for (var i = 1, l = id.parts.length; i < l; i++) {
                    this.opcode('lookup', id.parts[i]);
                }
            },
            DATA: function(data) {
                this.options.data = true;
                if (data.id.isScoped || data.id.depth) {
                    throw new Exception('Scoped data references are not supported: ' + data.original, data);
                }
                this.opcode('lookupData');
                var parts = data.id.parts;
                for (var i = 0, l = parts.length; i < l; i++) {
                    this.opcode('lookup', parts[i]);
                }
            },
            STRING: function(string) {
                this.opcode('pushString', string.string);
            },
            INTEGER: function(integer) {
                this.opcode('pushLiteral', integer.integer);
            },
            BOOLEAN: function(bool) {
                this.opcode('pushLiteral', bool.bool);
            },
            comment: function() {},
            opcode: function(name) {
                this.opcodes.push({
                    opcode: name,
                    args: [].slice.call(arguments, 1)
                });
            },
            declare: function(name, value) {
                this.opcodes.push({
                    opcode: 'DECLARE',
                    name: name,
                    value: value
                });
            },
            addDepth: function(depth) {
                if (depth === 0) {
                    return;
                }
                if (!this.depths[depth]) {
                    this.depths[depth] = true;
                    this.depths.list.push(depth);
                }
            },
            classifySexpr: function(sexpr) {
                var isHelper = sexpr.isHelper;
                var isEligible = sexpr.eligibleHelper;
                var options = this.options;
                if (isEligible&&!isHelper) {
                    var name = sexpr.id.parts[0];
                    if (options.knownHelpers[name]) {
                        isHelper = true;
                    } else if (options.knownHelpersOnly) {
                        isEligible = false;
                    }
                }
                if (isHelper) {
                    return "helper";
                } else if (isEligible) {
                    return "ambiguous";
                } else {
                    return "simple";
                }
            },
            pushParams: function(params) {
                var i = params.length, param;
                while (i--) {
                    param = params[i];
                    if (this.options.stringParams) {
                        if (param.depth) {
                            this.addDepth(param.depth);
                        }
                        this.opcode('getContext', param.depth || 0);
                        this.opcode('pushStringParam', param.stringModeValue, param.type);
                        if (param.type === 'sexpr') {
                            this.sexpr(param);
                        }
                    } else {
                        this[param.type](param);
                    }
                }
            },
            setupFullMustacheParams: function(sexpr, program, inverse) {
                var params = sexpr.params;
                this.pushParams(params);
                this.opcode('pushProgram', program);
                this.opcode('pushProgram', inverse);
                if (sexpr.hash) {
                    this.hash(sexpr.hash);
                } else {
                    this.opcode('emptyHash');
                }
                return params;
            }
        };
        function precompile(input, options, env) {
            if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
                throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
            }
            options = options || {};
            if (!('data'in options)) {
                options.data = true;
            }
            var ast = env.parse(input);
            var environment = new env.Compiler().compile(ast, options);
            return new env.JavaScriptCompiler().compile(environment, options);
        }
        __exports__.precompile = precompile;
        function compile(input, options, env) {
            if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
                throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
            }
            options = options || {};
            if (!('data'in options)) {
                options.data = true;
            }
            var compiled;
            function compileInput() {
                var ast = env.parse(input);
                var environment = new env.Compiler().compile(ast, options);
                var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
                return env.template(templateSpec);
            }
            return function(context, options) {
                if (!compiled) {
                    compiled = compileInput();
                }
                return compiled.call(this, context, options);
            };
        }
        __exports__.compile = compile;
        return __exports__;
    })(__module5__);
    var __module11__ = (function(__dependency1__, __dependency2__) {
        "use strict";
        var __exports__;
        var COMPILER_REVISION = __dependency1__.COMPILER_REVISION;
        var REVISION_CHANGES = __dependency1__.REVISION_CHANGES;
        var log = __dependency1__.log;
        var Exception = __dependency2__;
        function Literal(value) {
            this.value = value;
        }
        function JavaScriptCompiler() {}
        JavaScriptCompiler.prototype = {
            nameLookup: function(parent, name) {
                var wrap, ret;
                if (parent.indexOf('depth') === 0) {
                    wrap = true;
                }
                if (/^[0-9]+$/.test(name)) {
                    ret = parent + "[" + name + "]";
                } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
                    ret = parent + "." + name;
                } else {
                    ret = parent + "['" + name + "']";
                }
                if (wrap) {
                    return '(' + parent + ' && ' + ret + ')';
                } else {
                    return ret;
                }
            },
            compilerInfo: function() {
                var revision = COMPILER_REVISION, versions = REVISION_CHANGES[revision];
                return "this.compilerInfo = [" + revision + ",'" + versions + "'];\n";
            },
            appendToBuffer: function(string) {
                if (this.environment.isSimple) {
                    return "return " + string + ";";
                } else {
                    return {
                        appendToBuffer: true,
                        content: string,
                        toString: function() {
                            return "buffer += " + string + ";";
                        }
                    };
                }
            },
            initializeBuffer: function() {
                return this.quotedString("");
            },
            namespace: "Handlebars",
            compile: function(environment, options, context, asObject) {
                this.environment = environment;
                this.options = options || {};
                log('debug', this.environment.disassemble() + "\n\n");
                this.name = this.environment.name;
                this.isChild=!!context;
                this.context = context || {
                    programs: [],
                    environments: [],
                    aliases: {}
                };
                this.preamble();
                this.stackSlot = 0;
                this.stackVars = [];
                this.registers = {
                    list: []
                };
                this.hashes = [];
                this.compileStack = [];
                this.inlineStack = [];
                this.compileChildren(environment, options);
                var opcodes = environment.opcodes, opcode;
                this.i = 0;
                for (var l = opcodes.length; this.i < l; this.i++) {
                    opcode = opcodes[this.i];
                    if (opcode.opcode === 'DECLARE') {
                        this[opcode.name] = opcode.value;
                    } else {
                        this[opcode.opcode].apply(this, opcode.args);
                    }
                    if (opcode.opcode !== this.stripNext) {
                        this.stripNext = false;
                    }
                }
                this.pushSource('');
                if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
                    throw new Exception('Compile completed with content left on stack');
                }
                return this.createFunctionContext(asObject);
            },
            preamble: function() {
                var out = [];
                if (!this.isChild) {
                    var namespace = this.namespace;
                    var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
                    if (this.environment.usePartial) {
                        copies = copies + " partials = this.merge(partials, " + namespace + ".partials);";
                    }
                    if (this.options.data) {
                        copies = copies + " data = data || {};";
                    }
                    out.push(copies);
                } else {
                    out.push('');
                }
                if (!this.environment.isSimple) {
                    out.push(", buffer = " + this.initializeBuffer());
                } else {
                    out.push("");
                }
                this.lastContext = 0;
                this.source = out;
            },
            createFunctionContext: function(asObject) {
                var locals = this.stackVars.concat(this.registers.list);
                if (locals.length > 0) {
                    this.source[1] = this.source[1] + ", " + locals.join(", ");
                }
                if (!this.isChild) {
                    for (var alias in this.context.aliases) {
                        if (this.context.aliases.hasOwnProperty(alias)) {
                            this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
                        }
                    }
                }
                if (this.source[1]) {
                    this.source[1] = "var " + this.source[1].substring(2) + ";";
                }
                if (!this.isChild) {
                    this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
                }
                if (!this.environment.isSimple) {
                    this.pushSource("return buffer;");
                }
                var params = this.isChild ? ["depth0", "data"]: ["Handlebars", "depth0", "helpers", "partials", "data"];
                for (var i = 0, l = this.environment.depths.list.length; i < l; i++) {
                    params.push("depth" + this.environment.depths.list[i]);
                }
                var source = this.mergeSource();
                if (!this.isChild) {
                    source = this.compilerInfo() + source;
                }
                if (asObject) {
                    params.push(source);
                    return Function.apply(this, params);
                } else {
                    var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
                    log('debug', functionSource + "\n\n");
                    return functionSource;
                }
            },
            mergeSource: function() {
                var source = '', buffer;
                for (var i = 0, len = this.source.length; i < len; i++) {
                    var line = this.source[i];
                    if (line.appendToBuffer) {
                        if (buffer) {
                            buffer = buffer + '\n    + ' + line.content;
                        } else {
                            buffer = line.content;
                        }
                    } else {
                        if (buffer) {
                            source += 'buffer += ' + buffer + ';\n  ';
                            buffer = undefined;
                        }
                        source += line + '\n  ';
                    }
                }
                return source;
            },
            blockValue: function() {
                this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';
                var params = ["depth0"];
                this.setupParams(0, params);
                this.replaceStack(function(current) {
                    params.splice(1, 0, current);
                    return "blockHelperMissing.call(" + params.join(", ") + ")";
                });
            },
            ambiguousBlockValue: function() {
                this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';
                var params = ["depth0"];
                this.setupParams(0, params);
                var current = this.topStack();
                params.splice(1, 0, current);
                this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
            },
            appendContent: function(content) {
                if (this.pendingContent) {
                    content = this.pendingContent + content;
                }
                if (this.stripNext) {
                    content = content.replace(/^\s+/, '');
                }
                this.pendingContent = content;
            },
            strip: function() {
                if (this.pendingContent) {
                    this.pendingContent = this.pendingContent.replace(/\s+$/, '');
                }
                this.stripNext = 'strip';
            },
            append: function() {
                this.flushInline();
                var local = this.popStack();
                this.pushSource("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
                if (this.environment.isSimple) {
                    this.pushSource("else { " + this.appendToBuffer("''") + " }");
                }
            },
            appendEscaped: function() {
                this.context.aliases.escapeExpression = 'this.escapeExpression';
                this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
            },
            getContext: function(depth) {
                if (this.lastContext !== depth) {
                    this.lastContext = depth;
                }
            },
            lookupOnContext: function(name) {
                this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
            },
            pushContext: function() {
                this.pushStackLiteral('depth' + this.lastContext);
            },
            resolvePossibleLambda: function() {
                this.context.aliases.functionType = '"function"';
                this.replaceStack(function(current) {
                    return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
                });
            },
            lookup: function(name) {
                this.replaceStack(function(current) {
                    return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
                });
            },
            lookupData: function() {
                this.pushStackLiteral('data');
            },
            pushStringParam: function(string, type) {
                this.pushStackLiteral('depth' + this.lastContext);
                this.pushString(type);
                if (type !== 'sexpr') {
                    if (typeof string === 'string') {
                        this.pushString(string);
                    } else {
                        this.pushStackLiteral(string);
                    }
                }
            },
            emptyHash: function() {
                this.pushStackLiteral('{}');
                if (this.options.stringParams) {
                    this.push('{}');
                    this.push('{}');
                }
            },
            pushHash: function() {
                if (this.hash) {
                    this.hashes.push(this.hash);
                }
                this.hash = {
                    values: [],
                    types: [],
                    contexts: []
                };
            },
            popHash: function() {
                var hash = this.hash;
                this.hash = this.hashes.pop();
                if (this.options.stringParams) {
                    this.push('{' + hash.contexts.join(',') + '}');
                    this.push('{' + hash.types.join(',') + '}');
                }
                this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
            },
            pushString: function(string) {
                this.pushStackLiteral(this.quotedString(string));
            },
            push: function(expr) {
                this.inlineStack.push(expr);
                return expr;
            },
            pushLiteral: function(value) {
                this.pushStackLiteral(value);
            },
            pushProgram: function(guid) {
                if (guid != null) {
                    this.pushStackLiteral(this.programExpression(guid));
                } else {
                    this.pushStackLiteral(null);
                }
            },
            invokeHelper: function(paramSize, name, isRoot) {
                this.context.aliases.helperMissing = 'helpers.helperMissing';
                this.useRegister('helper');
                var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
                var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
                var lookup = 'helper = ' + helper.name + ' || ' + nonHelper;
                if (helper.paramsInit) {
                    lookup += ',' + helper.paramsInit;
                }
                this.push('('
                + lookup
                + ',helper '
                + '? helper.call(' + helper.callParams + ') '
                + ': helperMissing.call(' + helper.helperMissingParams + '))');
                if (!isRoot) {
                    this.flushInline();
                }
            },
            invokeKnownHelper: function(paramSize, name) {
                var helper = this.setupHelper(paramSize, name);
                this.push(helper.name + ".call(" + helper.callParams + ")");
            },
            invokeAmbiguous: function(name, helperCall) {
                this.context.aliases.functionType = '"function"';
                this.useRegister('helper');
                this.emptyHash();
                var helper = this.setupHelper(0, name, helperCall);
                var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');
                var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
                var nextStack = this.nextStack();
                if (helper.paramsInit) {
                    this.pushSource(helper.paramsInit);
                }
                this.pushSource('if (helper = ' + helperName + ') { ' + nextStack + ' = helper.call(' + helper.callParams + '); }');
                this.pushSource('else { helper = ' + nonHelper + '; ' + nextStack + ' = typeof helper === functionType ? helper.call(' + helper.callParams + ') : helper; }');
            },
            invokePartial: function(name) {
                var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];
                if (this.options.data) {
                    params.push("data");
                }
                this.context.aliases.self = "this";
                this.push("self.invokePartial(" + params.join(", ") + ")");
            },
            assignToHash: function(key) {
                var value = this.popStack(), context, type;
                if (this.options.stringParams) {
                    type = this.popStack();
                    context = this.popStack();
                }
                var hash = this.hash;
                if (context) {
                    hash.contexts.push("'" + key + "': " + context);
                }
                if (type) {
                    hash.types.push("'" + key + "': " + type);
                }
                hash.values.push("'" + key + "': (" + value + ")");
            },
            compiler: JavaScriptCompiler,
            compileChildren: function(environment, options) {
                var children = environment.children, child, compiler;
                for (var i = 0, l = children.length; i < l; i++) {
                    child = children[i];
                    compiler = new this.compiler();
                    var index = this.matchExistingProgram(child);
                    if (index == null) {
                        this.context.programs.push('');
                        index = this.context.programs.length;
                        child.index = index;
                        child.name = 'program' + index;
                        this.context.programs[index] = compiler.compile(child, options, this.context);
                        this.context.environments[index] = child;
                    } else {
                        child.index = index;
                        child.name = 'program' + index;
                    }
                }
            },
            matchExistingProgram: function(child) {
                for (var i = 0, len = this.context.environments.length; i < len; i++) {
                    var environment = this.context.environments[i];
                    if (environment && environment.equals(child)) {
                        return i;
                    }
                }
            },
            programExpression: function(guid) {
                this.context.aliases.self = "this";
                if (guid == null) {
                    return "self.noop";
                }
                var child = this.environment.children[guid], depths = child.depths.list, depth;
                var programParams = [child.index, child.name, "data"];
                for (var i = 0, l = depths.length; i < l; i++) {
                    depth = depths[i];
                    if (depth === 1) {
                        programParams.push("depth0");
                    } else {
                        programParams.push("depth" + (depth - 1));
                    }
                }
                return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
            },
            register: function(name, val) {
                this.useRegister(name);
                this.pushSource(name + " = " + val + ";");
            },
            useRegister: function(name) {
                if (!this.registers[name]) {
                    this.registers[name] = true;
                    this.registers.list.push(name);
                }
            },
            pushStackLiteral: function(item) {
                return this.push(new Literal(item));
            },
            pushSource: function(source) {
                if (this.pendingContent) {
                    this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent)));
                    this.pendingContent = undefined;
                }
                if (source) {
                    this.source.push(source);
                }
            },
            pushStack: function(item) {
                this.flushInline();
                var stack = this.incrStack();
                if (item) {
                    this.pushSource(stack + " = " + item + ";");
                }
                this.compileStack.push(stack);
                return stack;
            },
            replaceStack: function(callback) {
                var prefix = '', inline = this.isInline(), stack, createdStack, usedLiteral;
                if (inline) {
                    var top = this.popStack(true);
                    if (top instanceof Literal) {
                        stack = top.value;
                        usedLiteral = true;
                    } else {
                        createdStack=!this.stackSlot;
                        var name=!createdStack ? this.topStackName() : this.incrStack();
                        prefix = '(' + this.push(name) + ' = ' + top + '),';
                        stack = this.topStack();
                    }
                } else {
                    stack = this.topStack();
                }
                var item = callback.call(this, stack);
                if (inline) {
                    if (!usedLiteral) {
                        this.popStack();
                    }
                    if (createdStack) {
                        this.stackSlot--;
                    }
                    this.push('(' + prefix + item + ')');
                } else {
                    if (!/^stack/.test(stack)) {
                        stack = this.nextStack();
                    }
                    this.pushSource(stack + " = (" + prefix + item + ");");
                }
                return stack;
            },
            nextStack: function() {
                return this.pushStack();
            },
            incrStack: function() {
                this.stackSlot++;
                if (this.stackSlot > this.stackVars.length) {
                    this.stackVars.push("stack" + this.stackSlot);
                }
                return this.topStackName();
            },
            topStackName: function() {
                return "stack" + this.stackSlot;
            },
            flushInline: function() {
                var inlineStack = this.inlineStack;
                if (inlineStack.length) {
                    this.inlineStack = [];
                    for (var i = 0, len = inlineStack.length; i < len; i++) {
                        var entry = inlineStack[i];
                        if (entry instanceof Literal) {
                            this.compileStack.push(entry);
                        } else {
                            this.pushStack(entry);
                        }
                    }
                }
            },
            isInline: function() {
                return this.inlineStack.length;
            },
            popStack: function(wrapped) {
                var inline = this.isInline(), item = (inline ? this.inlineStack : this.compileStack).pop();
                if (!wrapped && (item instanceof Literal)) {
                    return item.value;
                } else {
                    if (!inline) {
                        if (!this.stackSlot) {
                            throw new Exception('Invalid stack pop');
                        }
                        this.stackSlot--;
                    }
                    return item;
                }
            },
            topStack: function(wrapped) {
                var stack = (this.isInline() ? this.inlineStack : this.compileStack), item = stack[stack.length - 1];
                if (!wrapped && (item instanceof Literal)) {
                    return item.value;
                } else {
                    return item;
                }
            },
            quotedString: function(str) {
                return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + '"';
            },
            setupHelper: function(paramSize, name, missingParams) {
                var params = [], paramsInit = this.setupParams(paramSize, params, missingParams);
                var foundHelper = this.nameLookup('helpers', name, 'helper');
                return {
                    params: params,
                    paramsInit: paramsInit,
                    name: foundHelper,
                    callParams: ["depth0"].concat(params).join(", "),
                    helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
                };
            },
            setupOptions: function(paramSize, params) {
                var options = [], contexts = [], types = [], param, inverse, program;
                options.push("hash:" + this.popStack());
                if (this.options.stringParams) {
                    options.push("hashTypes:" + this.popStack());
                    options.push("hashContexts:" + this.popStack());
                }
                inverse = this.popStack();
                program = this.popStack();
                if (program || inverse) {
                    if (!program) {
                        this.context.aliases.self = "this";
                        program = "self.noop";
                    }
                    if (!inverse) {
                        this.context.aliases.self = "this";
                        inverse = "self.noop";
                    }
                    options.push("inverse:" + inverse);
                    options.push("fn:" + program);
                }
                for (var i = 0; i < paramSize; i++) {
                    param = this.popStack();
                    params.push(param);
                    if (this.options.stringParams) {
                        types.push(this.popStack());
                        contexts.push(this.popStack());
                    }
                }
                if (this.options.stringParams) {
                    options.push("contexts:[" + contexts.join(",") + "]");
                    options.push("types:[" + types.join(",") + "]");
                }
                if (this.options.data) {
                    options.push("data:data");
                }
                return options;
            },
            setupParams: function(paramSize, params, useRegister) {
                var options = '{' + this.setupOptions(paramSize, params).join(',') + '}';
                if (useRegister) {
                    this.useRegister('options');
                    params.push('options');
                    return 'options=' + options;
                } else {
                    params.push(options);
                    return '';
                }
            }
        };
        var reservedWords = ("break else new var" + " case finally return void" + " catch for switch while" + " continue function this with" + " default if throw" + " delete in try" + " do instanceof typeof" + " abstract enum int short" + " boolean export interface static" + " byte extends long super" + " char final native synchronized" + " class float package throws" + " const goto private transient" + " debugger implements protected volatile" + " double import public let yield").split(" ");
        var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};
        for (var i = 0, l = reservedWords.length; i < l; i++) {
            compilerWords[reservedWords[i]] = true;
        }
        JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
            if (!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name)) {
                return true;
            }
            return false;
        };
        __exports__ = JavaScriptCompiler;
        return __exports__;
    })(__module2__, __module5__);
    var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
        "use strict";
        var __exports__;
        var Handlebars = __dependency1__;
        var AST = __dependency2__;
        var Parser = __dependency3__.parser;
        var parse = __dependency3__.parse;
        var Compiler = __dependency4__.Compiler;
        var compile = __dependency4__.compile;
        var precompile = __dependency4__.precompile;
        var JavaScriptCompiler = __dependency5__;
        var _create = Handlebars.create;
        var create = function() {
            var hb = _create();
            hb.compile = function(input, options) {
                return compile(input, options, hb);
            };
            hb.precompile = function(input, options) {
                return precompile(input, options, hb);
            };
            hb.AST = AST;
            hb.Compiler = Compiler;
            hb.JavaScriptCompiler = JavaScriptCompiler;
            hb.Parser = Parser;
            hb.parse = parse;
            return hb;
        };
        Handlebars = create();
        Handlebars.create = create;
        __exports__ = Handlebars;
        return __exports__;
    })(__module1__, __module7__, __module8__, __module10__, __module11__);
    return __module0__;
})();;

/****** FILE: imagesloaded.js *****/

(function() {
    function e() {}
    function t(e, t) {
        for (var n = e.length; n--;)
            if (e[n].listener === t)
                return n;
        return - 1
    }
    function n(e) {
        return function() {
            return this[e].apply(this, arguments)
        }
    }
    var i = e.prototype, r = this, o = r.EventEmitter;
    i.getListeners = function(e) {
        var t, n, i = this._getEvents();
        if ("object" == typeof e) {
            t = {};
            for (n in i)
                i.hasOwnProperty(n) && e.test(n) && (t[n] = i[n])
        } else 
            t = i[e] || (i[e] = []);
        return t
    }, i.flattenListeners = function(e) {
        var t, n = [];
        for (t = 0; e.length > t; t += 1)
            n.push(e[t].listener);
        return n
    }, i.getListenersAsObject = function(e) {
        var t, n = this.getListeners(e);
        return n instanceof Array && (t = {}, t[e] = n), t || n
    }, i.addListener = function(e, n) {
        var i, r = this.getListenersAsObject(e), o = "object" == typeof n;
        for (i in r)
            r.hasOwnProperty(i)&&-1 === t(r[i], n) && r[i].push(o ? n : {
                listener: n,
                once: !1
            });
        return this
    }, i.on = n("addListener"), i.addOnceListener = function(e, t) {
        return this.addListener(e, {
            listener: t,
            once: !0
        })
    }, i.once = n("addOnceListener"), i.defineEvent = function(e) {
        return this.getListeners(e), this
    }, i.defineEvents = function(e) {
        for (var t = 0; e.length > t; t += 1)
            this.defineEvent(e[t]);
        return this
    }, i.removeListener = function(e, n) {
        var i, r, o = this.getListenersAsObject(e);
        for (r in o)
            o.hasOwnProperty(r) && (i = t(o[r], n), - 1 !== i && o[r].splice(i, 1));
        return this
    }, i.off = n("removeListener"), i.addListeners = function(e, t) {
        return this.manipulateListeners(!1, e, t)
    }, i.removeListeners = function(e, t) {
        return this.manipulateListeners(!0, e, t)
    }, i.manipulateListeners = function(e, t, n) {
        var i, r, o = e ? this.removeListener: this.addListener, s = e ? this.removeListeners: this.addListeners;
        if ("object" != typeof t || t instanceof RegExp)
            for (i = n.length; i--;)
                o.call(this, t, n[i]);
        else 
            for (i in t)
                t.hasOwnProperty(i) && (r = t[i]) && ("function" == typeof r ? o.call(this, i, r) : s.call(this, i, r));
        return this
    }, i.removeEvent = function(e) {
        var t, n = typeof e, i = this._getEvents();
        if ("string" === n)
            delete i[e];
        else if ("object" === n)
            for (t in i)
                i.hasOwnProperty(t) && e.test(t) && delete i[t];
        else 
            delete this._events;
        return this
    }, i.removeAllListeners = n("removeEvent"), i.emitEvent = function(e, t) {
        var n, i, r, o, s = this.getListenersAsObject(e);
        for (r in s)
            if (s.hasOwnProperty(r))
                for (i = s[r].length; i--;)
                    n = s[r][i], n.once===!0 && this.removeListener(e, n.listener), o = n.listener.apply(this, t || []), o === this._getOnceReturnValue() && this.removeListener(e, n.listener);
        return this
    }, i.trigger = n("emitEvent"), i.emit = function(e) {
        var t = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(e, t)
    }, i.setOnceReturnValue = function(e) {
        return this._onceReturnValue = e, this
    }, i._getOnceReturnValue = function() {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, i._getEvents = function() {
        return this._events || (this._events = {})
    }, e.noConflict = function() {
        return r.EventEmitter = o, e
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function() {
        return e
    }) : "object" == typeof module && module.exports ? module.exports = e : this.EventEmitter = e
}).call(this), function(e) {
    function t(t) {
        var n = e.event;
        return n.target = n.target || n.srcElement || t, n
    }
    var n = document.documentElement, i = function() {};
    n.addEventListener ? i = function(e, t, n) {
        e.addEventListener(t, n, !1)
    } : n.attachEvent && (i = function(e, n, i) {
        e[n + i] = i.handleEvent ? function() {
            var n = t(e);
            i.handleEvent.call(i, n)
        } : function() {
            var n = t(e);
            i.call(e, n)
        }, e.attachEvent("on" + n, e[n + i])
    });
    var r = function() {};
    n.removeEventListener ? r = function(e, t, n) {
        e.removeEventListener(t, n, !1)
    } : n.detachEvent && (r = function(e, t, n) {
        e.detachEvent("on" + t, e[t + n]);
        try {
            delete e[t + n]
        } catch (i) {
            e[t + n] = void 0
        }
    });
    var o = {
        bind: i,
        unbind: r
    };
    "function" == typeof define && define.amd ? define("eventie/eventie", o) : e.eventie = o
}(this), function(e, t) {
    "function" == typeof define && define.amd ? define(["eventEmitter/EventEmitter", "eventie/eventie"], function(n, i) {
        return t(e, n, i)
    }) : "object" == typeof exports ? module.exports = t(e, require("eventEmitter"), require("eventie")) : e.imagesLoaded = t(e, e.EventEmitter, e.eventie)
}(window, function(e, t, n) {
    function i(e, t) {
        for (var n in t)
            e[n] = t[n];
        return e
    }
    function r(e) {
        return "[object Array]" === d.call(e)
    }
    function o(e) {
        var t = [];
        if (r(e))
            t = e;
        else if ("number" == typeof e.length)
            for (var n = 0, i = e.length; i > n; n++)
                t.push(e[n]);
        else 
            t.push(e);
        return t
    }
    function s(e, t, n) {
        if (!(this instanceof s))
            return new s(e, t);
        "string" == typeof e && (e = document.querySelectorAll(e)), this.elements = o(e), this.options = i({}, this.options), "function" == typeof t ? n = t : i(this.options, t), n && this.on("always", n), this.getImages(), a && (this.jqDeferred = new a.Deferred);
        var r = this;
        setTimeout(function() {
            r.check()
        })
    }
    function c(e) {
        this.img = e
    }
    function f(e) {
        this.src = e, v[e] = this
    }
    var a = e.jQuery, u = e.console, h = u !== void 0, d = Object.prototype.toString;
    s.prototype = new t, s.prototype.options = {}, s.prototype.getImages = function() {
        this.images = [];
        for (var e = 0, t = this.elements.length; t > e; e++) {
            var n = this.elements[e];
            "IMG" === n.nodeName && this.addImage(n);
            var i = n.nodeType;
            if (i && (1 === i || 9 === i || 11 === i))
                for (var r = n.querySelectorAll("img"), o = 0, s = r.length; s > o; o++) {
                    var c = r[o];
                    this.addImage(c)
                }
            }
    }, s.prototype.addImage = function(e) {
        var t = new c(e);
        this.images.push(t)
    }, s.prototype.check = function() {
        function e(e, r) {
            return t.options.debug && h && u.log("confirm", e, r), t.progress(e), n++, n === i && t.complete(), !0
        }
        var t = this, n = 0, i = this.images.length;
        if (this.hasAnyBroken=!1, !i)
            return this.complete(), void 0;
        for (var r = 0; i > r; r++) {
            var o = this.images[r];
            o.on("confirm", e), o.check()
        }
    }, s.prototype.progress = function(e) {
        this.hasAnyBroken = this.hasAnyBroken ||!e.isLoaded;
        var t = this;
        setTimeout(function() {
            t.emit("progress", t, e), t.jqDeferred && t.jqDeferred.notify && t.jqDeferred.notify(t, e)
        })
    }, s.prototype.complete = function() {
        var e = this.hasAnyBroken ? "fail": "done";
        this.isComplete=!0;
        var t = this;
        setTimeout(function() {
            if (t.emit(e, t), t.emit("always", t), t.jqDeferred) {
                var n = t.hasAnyBroken ? "reject": "resolve";
                t.jqDeferred[n](t)
            }
        })
    }, a && (a.fn.imagesLoaded = function(e, t) {
        var n = new s(this, e, t);
        return n.jqDeferred.promise(a(this))
    }), c.prototype = new t, c.prototype.check = function() {
        var e = v[this.img.src] || new f(this.img.src);
        if (e.isConfirmed)
            return this.confirm(e.isLoaded, "cached was confirmed"), void 0;
        if (this.img.complete && void 0 !== this.img.naturalWidth)
            return this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), void 0;
        var t = this;
        e.on("confirm", function(e, n) {
            return t.confirm(e.isLoaded, n), !0
        }), e.check()
    }, c.prototype.confirm = function(e, t) {
        this.isLoaded = e, this.emit("confirm", this, t)
    };
    var v = {};
    return f.prototype = new t, f.prototype.check = function() {
        if (!this.isChecked) {
            var e = new Image;
            n.bind(e, "load", this), n.bind(e, "error", this), e.src = this.src, this.isChecked=!0
        }
    }, f.prototype.handleEvent = function(e) {
        var t = "on" + e.type;
        this[t] && this[t](e)
    }, f.prototype.onload = function(e) {
        this.confirm(!0, "onload"), this.unbindProxyEvents(e)
    }, f.prototype.onerror = function(e) {
        this.confirm(!1, "onerror"), this.unbindProxyEvents(e)
    }, f.prototype.confirm = function(e, t) {
        this.isConfirmed=!0, this.isLoaded = e, this.emit("confirm", this, t)
    }, f.prototype.unbindProxyEvents = function(e) {
        n.unbind(e.target, "load", this), n.unbind(e.target, "error", this)
    }, s
});;

/****** FILE: masonry.pkgd.min.js *****/
!function(a) {
    function b() {}
    function c(a) {
        function c(b) {
            b.prototype.option || (b.prototype.option = function(b) {
                a.isPlainObject(b) && (this.options = a.extend(!0, this.options, b))
            })
        }
        function e(b, c) {
            a.fn[b] = function(e) {
                if ("string" == typeof e) {
                    for (var g = d.call(arguments, 1), h = 0, i = this.length; i > h; h++) {
                        var j = this[h], k = a.data(j, b);
                        if (k)
                            if (a.isFunction(k[e]) && "_" !== e.charAt(0)) {
                                var l = k[e].apply(k, g);
                                if (void 0 !== l)
                                    return l
                            } else 
                                f("no such method '" + e + "' for " + b + " instance");
                            else 
                                f("cannot call methods on " + b + " prior to initialization; attempted to call '" + e + "'")
                            }
                    return this
                }
                return this.each(function() {
                    var d = a.data(this, b);
                    d ? (d.option(e), d._init()) : (d = new c(this, e), a.data(this, b, d))
                })
            }
        }
        if (a) {
            var f = "undefined" == typeof console ? b: function(a) {
                console.error(a)
            };
            return a.bridget = function(a, b) {
                c(b), e(a, b)
            }, a.bridget
        }
    }
    var d = Array.prototype.slice;
    "function" == typeof define && define.amd ? define("jquery-bridget/jquery.bridget", ["jquery"], c) : c("object" == typeof exports ? require("jquery") : a.jQuery)
}(window), function(a) {
    function b(b) {
        var c = a.event;
        return c.target = c.target || c.srcElement || b, c
    }
    var c = document.documentElement, d = function() {};
    c.addEventListener ? d = function(a, b, c) {
        a.addEventListener(b, c, !1)
    } : c.attachEvent && (d = function(a, c, d) {
        a[c + d] = d.handleEvent ? function() {
            var c = b(a);
            d.handleEvent.call(d, c)
        } : function() {
            var c = b(a);
            d.call(a, c)
        }, a.attachEvent("on" + c, a[c + d])
    });
    var e = function() {};
    c.removeEventListener ? e = function(a, b, c) {
        a.removeEventListener(b, c, !1)
    } : c.detachEvent && (e = function(a, b, c) {
        a.detachEvent("on" + b, a[b + c]);
        try {
            delete a[b + c]
        } catch (d) {
            a[b + c] = void 0
        }
    });
    var f = {
        bind: d,
        unbind: e
    };
    "function" == typeof define && define.amd ? define("eventie/eventie", f) : "object" == typeof exports ? module.exports = f : a.eventie = f
}(this), function(a) {
    function b(a) {
        "function" == typeof a && (b.isReady ? a() : g.push(a))
    }
    function c(a) {
        var c = "readystatechange" === a.type && "complete" !== f.readyState;
        b.isReady || c || d()
    }
    function d() {
        b.isReady=!0;
        for (var a = 0, c = g.length; c > a; a++) {
            var d = g[a];
            d()
        }
    }
    function e(e) {
        return "complete" === f.readyState ? d() : (e.bind(f, "DOMContentLoaded", c), e.bind(f, "readystatechange", c), e.bind(a, "load", c)), b
    }
    var f = a.document, g = [];
    b.isReady=!1, "function" == typeof define && define.amd ? define("doc-ready/doc-ready", ["eventie/eventie"], e) : "object" == typeof exports ? module.exports = e(require("eventie")) : a.docReady = e(a.eventie)
}(window), function() {
    function a() {}
    function b(a, b) {
        for (var c = a.length; c--;)
            if (a[c].listener === b)
                return c;
        return - 1
    }
    function c(a) {
        return function() {
            return this[a].apply(this, arguments)
        }
    }
    var d = a.prototype, e = this, f = e.EventEmitter;
    d.getListeners = function(a) {
        var b, c, d = this._getEvents();
        if (a instanceof RegExp) {
            b = {};
            for (c in d)
                d.hasOwnProperty(c) && a.test(c) && (b[c] = d[c])
        } else 
            b = d[a] || (d[a] = []);
        return b
    }, d.flattenListeners = function(a) {
        var b, c = [];
        for (b = 0; b < a.length; b += 1)
            c.push(a[b].listener);
        return c
    }, d.getListenersAsObject = function(a) {
        var b, c = this.getListeners(a);
        return c instanceof Array && (b = {}, b[a] = c), b || c
    }, d.addListener = function(a, c) {
        var d, e = this.getListenersAsObject(a), f = "object" == typeof c;
        for (d in e)
            e.hasOwnProperty(d)&&-1 === b(e[d], c) && e[d].push(f ? c : {
                listener: c,
                once: !1
            });
        return this
    }, d.on = c("addListener"), d.addOnceListener = function(a, b) {
        return this.addListener(a, {
            listener: b,
            once: !0
        })
    }, d.once = c("addOnceListener"), d.defineEvent = function(a) {
        return this.getListeners(a), this
    }, d.defineEvents = function(a) {
        for (var b = 0; b < a.length; b += 1)
            this.defineEvent(a[b]);
        return this
    }, d.removeListener = function(a, c) {
        var d, e, f = this.getListenersAsObject(a);
        for (e in f)
            f.hasOwnProperty(e) && (d = b(f[e], c), - 1 !== d && f[e].splice(d, 1));
        return this
    }, d.off = c("removeListener"), d.addListeners = function(a, b) {
        return this.manipulateListeners(!1, a, b)
    }, d.removeListeners = function(a, b) {
        return this.manipulateListeners(!0, a, b)
    }, d.manipulateListeners = function(a, b, c) {
        var d, e, f = a ? this.removeListener: this.addListener, g = a ? this.removeListeners: this.addListeners;
        if ("object" != typeof b || b instanceof RegExp)
            for (d = c.length; d--;)
                f.call(this, b, c[d]);
        else 
            for (d in b)
                b.hasOwnProperty(d) && (e = b[d]) && ("function" == typeof e ? f.call(this, d, e) : g.call(this, d, e));
        return this
    }, d.removeEvent = function(a) {
        var b, c = typeof a, d = this._getEvents();
        if ("string" === c)
            delete d[a];
        else if (a instanceof RegExp)
            for (b in d)
                d.hasOwnProperty(b) && a.test(b) && delete d[b];
        else 
            delete this._events;
        return this
    }, d.removeAllListeners = c("removeEvent"), d.emitEvent = function(a, b) {
        var c, d, e, f, g = this.getListenersAsObject(a);
        for (e in g)
            if (g.hasOwnProperty(e))
                for (d = g[e].length; d--;)
                    c = g[e][d], c.once===!0 && this.removeListener(a, c.listener), f = c.listener.apply(this, b || []), f === this._getOnceReturnValue() && this.removeListener(a, c.listener);
        return this
    }, d.trigger = c("emitEvent"), d.emit = function(a) {
        var b = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(a, b)
    }, d.setOnceReturnValue = function(a) {
        return this._onceReturnValue = a, this
    }, d._getOnceReturnValue = function() {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, d._getEvents = function() {
        return this._events || (this._events = {})
    }, a.noConflict = function() {
        return e.EventEmitter = f, a
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function() {
        return a
    }) : "object" == typeof module && module.exports ? module.exports = a : e.EventEmitter = a
}.call(this), function(a) {
    function b(a) {
        if (a) {
            if ("string" == typeof d[a])
                return a;
            a = a.charAt(0).toUpperCase() + a.slice(1);
            for (var b, e = 0, f = c.length; f > e; e++)
                if (b = c[e] + a, "string" == typeof d[b])
                    return b
        }
    }
    var c = "Webkit Moz ms Ms O".split(" "), d = document.documentElement.style;
    "function" == typeof define && define.amd ? define("get-style-property/get-style-property", [], function() {
        return b
    }) : "object" == typeof exports ? module.exports = b : a.getStyleProperty = b
}(window), function(a) {
    function b(a) {
        var b = parseFloat(a), c =- 1 === a.indexOf("%")&&!isNaN(b);
        return c && b
    }
    function c() {}
    function d() {
        for (var a = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        }, b = 0, c = g.length; c > b; b++) {
            var d = g[b];
            a[d] = 0
        }
        return a
    }
    function e(c) {
        function e() {
            if (!m) {
                m=!0;
                var d = a.getComputedStyle;
                if (j = function() {
                    var a = d ? function(a) {
                        return d(a, null)
                    }
                    : function(a) {
                        return a.currentStyle
                    };
                    return function(b) {
                        var c = a(b);
                        return c || f("Style returned " + c + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), c
                    }
                }(), k = c("boxSizing")) {
                    var e = document.createElement("div");
                    e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style[k] = "border-box";
                    var g = document.body || document.documentElement;
                    g.appendChild(e);
                    var h = j(e);
                    l = 200 === b(h.width), g.removeChild(e)
                }
            }
        }
        function h(a) {
            if (e(), "string" == typeof a && (a = document.querySelector(a)), a && "object" == typeof a && a.nodeType) {
                var c = j(a);
                if ("none" === c.display)
                    return d();
                var f = {};
                f.width = a.offsetWidth, f.height = a.offsetHeight;
                for (var h = f.isBorderBox=!(!k ||!c[k] || "border-box" !== c[k]), m = 0, n = g.length; n > m; m++) {
                    var o = g[m], p = c[o];
                    p = i(a, p);
                    var q = parseFloat(p);
                    f[o] = isNaN(q) ? 0 : q
                }
                var r = f.paddingLeft + f.paddingRight, s = f.paddingTop + f.paddingBottom, t = f.marginLeft + f.marginRight, u = f.marginTop + f.marginBottom, v = f.borderLeftWidth + f.borderRightWidth, w = f.borderTopWidth + f.borderBottomWidth, x = h && l, y = b(c.width);
                y!==!1 && (f.width = y + (x ? 0 : r + v));
                var z = b(c.height);
                return z!==!1 && (f.height = z + (x ? 0 : s + w)), f.innerWidth = f.width - (r + v), f.innerHeight = f.height - (s + w), f.outerWidth = f.width + t, f.outerHeight = f.height + u, f
            }
        }
        function i(b, c) {
            if (a.getComputedStyle||-1 === c.indexOf("%"))
                return c;
            var d = b.style, e = d.left, f = b.runtimeStyle, g = f && f.left;
            return g && (f.left = b.currentStyle.left), d.left = c, c = d.pixelLeft, d.left = e, g && (f.left = g), c
        }
        var j, k, l, m=!1;
        return h
    }
    var f = "undefined" == typeof console ? c: function(a) {
        console.error(a)
    }, g = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];
    "function" == typeof define && define.amd ? define("get-size/get-size", ["get-style-property/get-style-property"], e) : "object" == typeof exports ? module.exports = e(require("desandro-get-style-property")) : a.getSize = e(a.getStyleProperty)
}(window), function(a) {
    function b(a, b) {
        return a[g](b)
    }
    function c(a) {
        if (!a.parentNode) {
            var b = document.createDocumentFragment();
            b.appendChild(a)
        }
    }
    function d(a, b) {
        c(a);
        for (var d = a.parentNode.querySelectorAll(b), e = 0, f = d.length; f > e; e++)
            if (d[e] === a)
                return !0;
        return !1
    }
    function e(a, d) {
        return c(a), b(a, d)
    }
    var f, g = function() {
        if (a.matchesSelector)
            return "matchesSelector";
        for (var b = ["webkit", "moz", "ms", "o"], c = 0, d = b.length; d > c; c++) {
            var e = b[c], f = e + "MatchesSelector";
            if (a[f])
                return f
        }
    }();
    if (g) {
        var h = document.createElement("div"), i = b(h, "div");
        f = i ? b : e
    } else 
        f = d;
    "function" == typeof define && define.amd ? define("matches-selector/matches-selector", [], function() {
        return f
    }) : "object" == typeof exports ? module.exports = f : window.matchesSelector = f
}(Element.prototype), function(a) {
    function b(a, b) {
        for (var c in b)
            a[c] = b[c];
        return a
    }
    function c(a) {
        for (var b in a)
            return !1;
        return b = null, !0
    }
    function d(a) {
        return a.replace(/([A-Z])/g, function(a) {
            return "-" + a.toLowerCase()
        })
    }
    function e(a, e, f) {
        function h(a, b) {
            a && (this.element = a, this.layout = b, this.position = {
                x: 0,
                y: 0
            }, this._create())
        }
        var i = f("transition"), j = f("transform"), k = i && j, l=!!f("perspective"), m = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "otransitionend",
            transition: "transitionend"
        }
        [i], n = ["transform", "transition", "transitionDuration", "transitionProperty"], o = function() {
            for (var a = {}, b = 0, c = n.length; c > b; b++) {
                var d = n[b], e = f(d);
                e && e !== d && (a[d] = e)
            }
            return a
        }();
        b(h.prototype, a.prototype), h.prototype._create = function() {
            this._transn = {
                ingProperties: {},
                clean: {},
                onEnd: {}
            }, this.css({
                position: "absolute"
            })
        }, h.prototype.handleEvent = function(a) {
            var b = "on" + a.type;
            this[b] && this[b](a)
        }, h.prototype.getSize = function() {
            this.size = e(this.element)
        }, h.prototype.css = function(a) {
            var b = this.element.style;
            for (var c in a) {
                var d = o[c] || c;
                b[d] = a[c]
            }
        }, h.prototype.getPosition = function() {
            var a = g(this.element), b = this.layout.options, c = b.isOriginLeft, d = b.isOriginTop, e = parseInt(a[c ? "left": "right"], 10), f = parseInt(a[d ? "top": "bottom"], 10);
            e = isNaN(e) ? 0 : e, f = isNaN(f) ? 0 : f;
            var h = this.layout.size;
            e -= c ? h.paddingLeft : h.paddingRight, f -= d ? h.paddingTop : h.paddingBottom, this.position.x = e, this.position.y = f
        }, h.prototype.layoutPosition = function() {
            var a = this.layout.size, b = this.layout.options, c = {};
            b.isOriginLeft ? (c.left = this.position.x + a.paddingLeft + "px", c.right = "") : (c.right = this.position.x + a.paddingRight + "px", c.left = ""), b.isOriginTop ? (c.top = this.position.y + a.paddingTop + "px", c.bottom = "") : (c.bottom = this.position.y + a.paddingBottom + "px", c.top = ""), this.css(c), this.emitEvent("layout", [this])
        };
        var p = l ? function(a, b) {
            return "translate3d(" + a + "px, " + b + "px, 0)"
        }
        : function(a, b) {
            return "translate(" + a + "px, " + b + "px)"
        };
        h.prototype._transitionTo = function(a, b) {
            this.getPosition();
            var c = this.position.x, d = this.position.y, e = parseInt(a, 10), f = parseInt(b, 10), g = e === this.position.x && f === this.position.y;
            if (this.setPosition(a, b), g&&!this.isTransitioning)
                return void this.layoutPosition();
            var h = a - c, i = b - d, j = {}, k = this.layout.options;
            h = k.isOriginLeft ? h : - h, i = k.isOriginTop ? i : - i, j.transform = p(h, i), this.transition({
                to: j,
                onTransitionEnd: {
                    transform: this.layoutPosition
                },
                isCleaning: !0
            })
        }, h.prototype.goTo = function(a, b) {
            this.setPosition(a, b), this.layoutPosition()
        }, h.prototype.moveTo = k ? h.prototype._transitionTo : h.prototype.goTo, h.prototype.setPosition = function(a, b) {
            this.position.x = parseInt(a, 10), this.position.y = parseInt(b, 10)
        }, h.prototype._nonTransition = function(a) {
            this.css(a.to), a.isCleaning && this._removeStyles(a.to);
            for (var b in a.onTransitionEnd)
                a.onTransitionEnd[b].call(this)
        }, h.prototype._transition = function(a) {
            if (!parseFloat(this.layout.options.transitionDuration))
                return void this._nonTransition(a);
            var b = this._transn;
            for (var c in a.onTransitionEnd)
                b.onEnd[c] = a.onTransitionEnd[c];
            for (c in a.to)
                b.ingProperties[c]=!0, a.isCleaning && (b.clean[c]=!0);
            if (a.from) {
                this.css(a.from);
                var d = this.element.offsetHeight;
                d = null
            }
            this.enableTransition(a.to), this.css(a.to), this.isTransitioning=!0
        };
        var q = j && d(j) + ",opacity";
        h.prototype.enableTransition = function() {
            this.isTransitioning || (this.css({
                transitionProperty: q,
                transitionDuration: this.layout.options.transitionDuration
            }), this.element.addEventListener(m, this, !1))
        }, h.prototype.transition = h.prototype[i ? "_transition": "_nonTransition"], h.prototype.onwebkitTransitionEnd = function(a) {
            this.ontransitionend(a)
        }, h.prototype.onotransitionend = function(a) {
            this.ontransitionend(a)
        };
        var r = {
            "-webkit-transform": "transform",
            "-moz-transform": "transform",
            "-o-transform": "transform"
        };
        h.prototype.ontransitionend = function(a) {
            if (a.target === this.element) {
                var b = this._transn, d = r[a.propertyName] || a.propertyName;
                if (delete b.ingProperties[d], c(b.ingProperties) && this.disableTransition(), d in b.clean && (this.element.style[a.propertyName] = "", delete b.clean[d]), d in b.onEnd) {
                    var e = b.onEnd[d];
                    e.call(this), delete b.onEnd[d]
                }
                this.emitEvent("transitionEnd", [this])
            }
        }, h.prototype.disableTransition = function() {
            this.removeTransitionStyles(), this.element.removeEventListener(m, this, !1), this.isTransitioning=!1
        }, h.prototype._removeStyles = function(a) {
            var b = {};
            for (var c in a)
                b[c] = "";
            this.css(b)
        };
        var s = {
            transitionProperty: "",
            transitionDuration: ""
        };
        return h.prototype.removeTransitionStyles = function() {
            this.css(s)
        }, h.prototype.removeElem = function() {
            this.element.parentNode.removeChild(this.element), this.emitEvent("remove", [this])
        }, h.prototype.remove = function() {
            if (!i ||!parseFloat(this.layout.options.transitionDuration))
                return void this.removeElem();
            var a = this;
            this.on("transitionEnd", function() {
                return a.removeElem(), !0
            }), this.hide()
        }, h.prototype.reveal = function() {
            delete this.isHidden, this.css({
                display: ""
            });
            var a = this.layout.options;
            this.transition({
                from: a.hiddenStyle,
                to: a.visibleStyle,
                isCleaning: !0
            })
        }, h.prototype.hide = function() {
            this.isHidden=!0, this.css({
                display: ""
            });
            var a = this.layout.options;
            this.transition({
                from: a.visibleStyle,
                to: a.hiddenStyle,
                isCleaning: !0,
                onTransitionEnd: {
                    opacity: function() {
                        this.isHidden && this.css({
                            display: "none"
                        })
                    }
                }
            })
        }, h.prototype.destroy = function() {
            this.css({
                position: "",
                left: "",
                right: "",
                top: "",
                bottom: "",
                transition: "",
                transform: ""
            })
        }, h
    }
    var f = a.getComputedStyle, g = f ? function(a) {
        return f(a, null)
    }
    : function(a) {
        return a.currentStyle
    };
    "function" == typeof define && define.amd ? define("outlayer/item", ["eventEmitter/EventEmitter", "get-size/get-size", "get-style-property/get-style-property"], e) : "object" == typeof exports ? module.exports = e(require("wolfy87-eventemitter"), require("get-size"), require("desandro-get-style-property")) : (a.Outlayer = {}, a.Outlayer.Item = e(a.EventEmitter, a.getSize, a.getStyleProperty))
}(window), function(a) {
    function b(a, b) {
        for (var c in b)
            a[c] = b[c];
        return a
    }
    function c(a) {
        return "[object Array]" === l.call(a)
    }
    function d(a) {
        var b = [];
        if (c(a))
            b = a;
        else if (a && "number" == typeof a.length)
            for (var d = 0, e = a.length; e > d; d++)
                b.push(a[d]);
        else 
            b.push(a);
        return b
    }
    function e(a, b) {
        var c = n(b, a);
        - 1 !== c && b.splice(c, 1)
    }
    function f(a) {
        return a.replace(/(.)([A-Z])/g, function(a, b, c) {
            return b + "-" + c
        }).toLowerCase()
    }
    function g(c, g, l, n, o, p) {
        function q(a, c) {
            if ("string" == typeof a && (a = h.querySelector(a)), !a ||!m(a))
                return void(i && i.error("Bad " + this.constructor.namespace + " element: " + a));
            this.element = a, this.options = b({}, this.constructor.defaults), this.option(c);
            var d=++r;
            this.element.outlayerGUID = d, s[d] = this, this._create(), this.options.isInitLayout && this.layout()
        }
        var r = 0, s = {};
        return q.namespace = "outlayer", q.Item = p, q.defaults = {
            containerStyle: {
                position: "relative"
            },
            isInitLayout: !0,
            isOriginLeft: !0,
            isOriginTop: !0,
            isResizeBound: !0,
            isResizingContainer: !0,
            transitionDuration: "0.4s",
            hiddenStyle: {
                opacity: 0,
                transform: "scale(0.001)"
            },
            visibleStyle: {
                opacity: 1,
                transform: "scale(1)"
            }
        }, b(q.prototype, l.prototype), q.prototype.option = function(a) {
            b(this.options, a)
        }, q.prototype._create = function() {
            this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), b(this.element.style, this.options.containerStyle), this.options.isResizeBound && this.bindResize()
        }, q.prototype.reloadItems = function() {
            this.items = this._itemize(this.element.children)
        }, q.prototype._itemize = function(a) {
            for (var b = this._filterFindItemElements(a), c = this.constructor.Item, d = [], e = 0, f = b.length; f > e; e++) {
                var g = b[e], h = new c(g, this);
                d.push(h)
            }
            return d
        }, q.prototype._filterFindItemElements = function(a) {
            a = d(a);
            for (var b = this.options.itemSelector, c = [], e = 0, f = a.length; f > e; e++) {
                var g = a[e];
                if (m(g))
                    if (b) {
                        o(g, b) && c.push(g);
                        for (var h = g.querySelectorAll(b), i = 0, j = h.length; j > i; i++)
                            c.push(h[i])
                    } else 
                        c.push(g)
            }
            return c
        }, q.prototype.getItemElements = function() {
            for (var a = [], b = 0, c = this.items.length; c > b; b++)
                a.push(this.items[b].element);
            return a
        }, q.prototype.layout = function() {
            this._resetLayout(), this._manageStamps();
            var a = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
            this.layoutItems(this.items, a), this._isLayoutInited=!0
        }, q.prototype._init = q.prototype.layout, q.prototype._resetLayout = function() {
            this.getSize()
        }, q.prototype.getSize = function() {
            this.size = n(this.element)
        }, q.prototype._getMeasurement = function(a, b) {
            var c, d = this.options[a];
            d ? ("string" == typeof d ? c = this.element.querySelector(d) : m(d) && (c = d), this[a] = c ? n(c)[b] : d) : this[a] = 0
        }, q.prototype.layoutItems = function(a, b) {
            a = this._getItemsForLayout(a), this._layoutItems(a, b), this._postLayout()
        }, q.prototype._getItemsForLayout = function(a) {
            for (var b = [], c = 0, d = a.length; d > c; c++) {
                var e = a[c];
                e.isIgnored || b.push(e)
            }
            return b
        }, q.prototype._layoutItems = function(a, b) {
            function c() {
                d.emitEvent("layoutComplete", [d, a])
            }
            var d = this;
            if (!a ||!a.length)
                return void c();
            this._itemsOn(a, "layout", c);
            for (var e = [], f = 0, g = a.length; g > f; f++) {
                var h = a[f], i = this._getItemLayoutPosition(h);
                i.item = h, i.isInstant = b || h.isLayoutInstant, e.push(i)
            }
            this._processLayoutQueue(e)
        }, q.prototype._getItemLayoutPosition = function() {
            return {
                x: 0,
                y: 0
            }
        }, q.prototype._processLayoutQueue = function(a) {
            for (var b = 0, c = a.length; c > b; b++) {
                var d = a[b];
                this._positionItem(d.item, d.x, d.y, d.isInstant)
            }
        }, q.prototype._positionItem = function(a, b, c, d) {
            d ? a.goTo(b, c) : a.moveTo(b, c)
        }, q.prototype._postLayout = function() {
            this.resizeContainer()
        }, q.prototype.resizeContainer = function() {
            if (this.options.isResizingContainer) {
                var a = this._getContainerSize();
                a && (this._setContainerMeasure(a.width, !0), this._setContainerMeasure(a.height, !1))
            }
        }, q.prototype._getContainerSize = k, q.prototype._setContainerMeasure = function(a, b) {
            if (void 0 !== a) {
                var c = this.size;
                c.isBorderBox && (a += b ? c.paddingLeft + c.paddingRight + c.borderLeftWidth + c.borderRightWidth : c.paddingBottom + c.paddingTop + c.borderTopWidth + c.borderBottomWidth), a = Math.max(a, 0), this.element.style[b ? "width": "height"] = a + "px"
            }
        }, q.prototype._itemsOn = function(a, b, c) {
            function d() {
                return e++, e === f && c.call(g), !0
            }
            for (var e = 0, f = a.length, g = this, h = 0, i = a.length; i > h; h++) {
                var j = a[h];
                j.on(b, d)
            }
        }, q.prototype.ignore = function(a) {
            var b = this.getItem(a);
            b && (b.isIgnored=!0)
        }, q.prototype.unignore = function(a) {
            var b = this.getItem(a);
            b && delete b.isIgnored
        }, q.prototype.stamp = function(a) {
            if (a = this._find(a)) {
                this.stamps = this.stamps.concat(a);
                for (var b = 0, c = a.length; c > b; b++) {
                    var d = a[b];
                    this.ignore(d)
                }
            }
        }, q.prototype.unstamp = function(a) {
            if (a = this._find(a))
                for (var b = 0, c = a.length; c > b; b++) {
                    var d = a[b];
                    e(d, this.stamps), this.unignore(d)
                }
        }, q.prototype._find = function(a) {
            return a ? ("string" == typeof a && (a = this.element.querySelectorAll(a)), a = d(a)) : void 0
        }, q.prototype._manageStamps = function() {
            if (this.stamps && this.stamps.length) {
                this._getBoundingRect();
                for (var a = 0, b = this.stamps.length; b > a; a++) {
                    var c = this.stamps[a];
                    this._manageStamp(c)
                }
            }
        }, q.prototype._getBoundingRect = function() {
            var a = this.element.getBoundingClientRect(), b = this.size;
            this._boundingRect = {
                left: a.left + b.paddingLeft + b.borderLeftWidth,
                top: a.top + b.paddingTop + b.borderTopWidth,
                right: a.right - (b.paddingRight + b.borderRightWidth),
                bottom: a.bottom - (b.paddingBottom + b.borderBottomWidth)
            }
        }, q.prototype._manageStamp = k, q.prototype._getElementOffset = function(a) {
            var b = a.getBoundingClientRect(), c = this._boundingRect, d = n(a), e = {
                left: b.left - c.left - d.marginLeft,
                top: b.top - c.top - d.marginTop,
                right: c.right - b.right - d.marginRight,
                bottom: c.bottom - b.bottom - d.marginBottom
            };
            return e
        }, q.prototype.handleEvent = function(a) {
            var b = "on" + a.type;
            this[b] && this[b](a)
        }, q.prototype.bindResize = function() {
            this.isResizeBound || (c.bind(a, "resize", this), this.isResizeBound=!0)
        }, q.prototype.unbindResize = function() {
            this.isResizeBound && c.unbind(a, "resize", this), this.isResizeBound=!1
        }, q.prototype.onresize = function() {
            function a() {
                b.resize(), delete b.resizeTimeout
            }
            this.resizeTimeout && clearTimeout(this.resizeTimeout);
            var b = this;
            this.resizeTimeout = setTimeout(a, 100)
        }, q.prototype.resize = function() {
            this.isResizeBound && this.needsResizeLayout() && this.layout()
        }, q.prototype.needsResizeLayout = function() {
            var a = n(this.element), b = this.size && a;
            return b && a.innerWidth !== this.size.innerWidth
        }, q.prototype.addItems = function(a) {
            var b = this._itemize(a);
            return b.length && (this.items = this.items.concat(b)), b
        }, q.prototype.appended = function(a) {
            var b = this.addItems(a);
            b.length && (this.layoutItems(b, !0), this.reveal(b))
        }, q.prototype.prepended = function(a) {
            var b = this._itemize(a);
            if (b.length) {
                var c = this.items.slice(0);
                this.items = b.concat(c), this._resetLayout(), this._manageStamps(), this.layoutItems(b, !0), this.reveal(b), this.layoutItems(c)
            }
        }, q.prototype.reveal = function(a) {
            var b = a && a.length;
            if (b)
                for (var c = 0; b > c; c++) {
                    var d = a[c];
                    d.reveal()
                }
        }, q.prototype.hide = function(a) {
            var b = a && a.length;
            if (b)
                for (var c = 0; b > c; c++) {
                    var d = a[c];
                    d.hide()
                }
        }, q.prototype.getItem = function(a) {
            for (var b = 0, c = this.items.length; c > b; b++) {
                var d = this.items[b];
                if (d.element === a)
                    return d
            }
        }, q.prototype.getItems = function(a) {
            if (a && a.length) {
                for (var b = [], c = 0, d = a.length; d > c; c++) {
                    var e = a[c], f = this.getItem(e);
                    f && b.push(f)
                }
                return b
            }
        }, q.prototype.remove = function(a) {
            a = d(a);
            var b = this.getItems(a);
            if (b && b.length) {
                this._itemsOn(b, "remove", function() {
                    this.emitEvent("removeComplete", [this, b])
                });
                for (var c = 0, f = b.length; f > c; c++) {
                    var g = b[c];
                    g.remove(), e(g, this.items)
                }
            }
        }, q.prototype.destroy = function() {
            var a = this.element.style;
            a.height = "", a.position = "", a.width = "";
            for (var b = 0, c = this.items.length; c > b; b++) {
                var d = this.items[b];
                d.destroy()
            }
            this.unbindResize();
            var e = this.element.outlayerGUID;
            delete s[e], delete this.element.outlayerGUID, j && j.removeData(this.element, this.constructor.namespace)
        }, q.data = function(a) {
            var b = a && a.outlayerGUID;
            return b && s[b]
        }, q.create = function(a, c) {
            function d() {
                q.apply(this, arguments)
            }
            return Object.create ? d.prototype = Object.create(q.prototype) : b(d.prototype, q.prototype), d.prototype.constructor = d, d.defaults = b({}, q.defaults), b(d.defaults, c), d.prototype.settings = {}, d.namespace = a, d.data = q.data, d.Item = function() {
                p.apply(this, arguments)
            }, d.Item.prototype = new p, g(function() {
                for (var b = f(a), c = h.querySelectorAll(".js-" + b), e = "data-" + b + "-options", g = 0, k = c.length; k > g; g++) {
                    var l, m = c[g], n = m.getAttribute(e);
                    try {
                        l = n && JSON.parse(n)
                    } catch (o) {
                        i && i.error("Error parsing " + e + " on " + m.nodeName.toLowerCase() + (m.id ? "#" + m.id : "") + ": " + o);
                        continue
                    }
                    var p = new d(m, l);
                    j && j.data(m, a, p)
                }
            }), j && j.bridget && j.bridget(a, d), d
        }, q.Item = p, q
    }
    var h = a.document, i = a.console, j = a.jQuery, k = function() {}, l = Object.prototype.toString, m = "function" == typeof HTMLElement || "object" == typeof HTMLElement ? function(a) {
        return a instanceof HTMLElement
    }
    : function(a) {
        return a && "object" == typeof a && 1 === a.nodeType && "string" == typeof a.nodeName
    }, n = Array.prototype.indexOf ? function(a, b) {
        return a.indexOf(b)
    }
    : function(a, b) {
        for (var c = 0, d = a.length; d > c; c++)
            if (a[c] === b)
                return c;
        return - 1
    };
    "function" == typeof define && define.amd ? define("outlayer/outlayer", ["eventie/eventie", "doc-ready/doc-ready", "eventEmitter/EventEmitter", "get-size/get-size", "matches-selector/matches-selector", "./item"], g) : "object" == typeof exports ? module.exports = g(require("eventie"), require("doc-ready"), require("wolfy87-eventemitter"), require("get-size"), require("desandro-matches-selector"), require("./item")) : a.Outlayer = g(a.eventie, a.docReady, a.EventEmitter, a.getSize, a.matchesSelector, a.Outlayer.Item)
}(window), function(a) {
    function b(a, b) {
        var d = a.create("masonry");
        return d.prototype._resetLayout = function() {
            this.getSize(), this._getMeasurement("columnWidth", "outerWidth"), this._getMeasurement("gutter", "outerWidth"), this.measureColumns();
            var a = this.cols;
            for (this.colYs = []; a--;)
                this.colYs.push(0);
            this.maxY = 0
        }, d.prototype.measureColumns = function() {
            if (this.getContainerWidth(), !this.columnWidth) {
                var a = this.items[0], c = a && a.element;
                this.columnWidth = c && b(c).outerWidth || this.containerWidth
            }
            this.columnWidth += this.gutter, this.cols = Math.floor((this.containerWidth + this.gutter) / this.columnWidth), this.cols = Math.max(this.cols, 1)
        }, d.prototype.getContainerWidth = function() {
            var a = this.options.isFitWidth ? this.element.parentNode: this.element, c = b(a);
            this.containerWidth = c && c.innerWidth
        }, d.prototype._getItemLayoutPosition = function(a) {
            a.getSize();
            var b = a.size.outerWidth%this.columnWidth, d = b && 1 > b ? "round": "ceil", e = Math[d](a.size.outerWidth / this.columnWidth);
            e = Math.min(e, this.cols);
            for (var f = this._getColGroup(e), g = Math.min.apply(Math, f), h = c(f, g), i = {
                x: this.columnWidth * h,
                y: g
            }, j = g + a.size.outerHeight, k = this.cols + 1 - f.length, l = 0; k > l; l++)
                this.colYs[h + l] = j;
            return i
        }, d.prototype._getColGroup = function(a) {
            if (2 > a)
                return this.colYs;
            for (var b = [], c = this.cols + 1 - a, d = 0; c > d; d++) {
                var e = this.colYs.slice(d, d + a);
                b[d] = Math.max.apply(Math, e)
            }
            return b
        }, d.prototype._manageStamp = function(a) {
            var c = b(a), d = this._getElementOffset(a), e = this.options.isOriginLeft ? d.left: d.right, f = e + c.outerWidth, g = Math.floor(e / this.columnWidth);
            g = Math.max(0, g);
            var h = Math.floor(f / this.columnWidth);
            h -= f%this.columnWidth ? 0 : 1, h = Math.min(this.cols - 1, h);
            for (var i = (this.options.isOriginTop ? d.top : d.bottom) + c.outerHeight, j = g; h >= j; j++)
                this.colYs[j] = Math.max(i, this.colYs[j])
        }, d.prototype._getContainerSize = function() {
            this.maxY = Math.max.apply(Math, this.colYs);
            var a = {
                height: this.maxY
            };
            return this.options.isFitWidth && (a.width = this._getContainerFitWidth()), a
        }, d.prototype._getContainerFitWidth = function() {
            for (var a = 0, b = this.cols; --b && 0 === this.colYs[b];)
                a++;
            return (this.cols - a) * this.columnWidth - this.gutter
        }, d.prototype.needsResizeLayout = function() {
            var a = this.containerWidth;
            return this.getContainerWidth(), a !== this.containerWidth
        }, d
    }
    var c = Array.prototype.indexOf ? function(a, b) {
        return a.indexOf(b)
    }
    : function(a, b) {
        for (var c = 0, d = a.length; d > c; c++) {
            var e = a[c];
            if (e === b)
                return c
        }
        return - 1
    };
    "function" == typeof define && define.amd ? define(["outlayer/outlayer", "get-size/get-size"], b) : "object" == typeof exports ? module.exports = b(require("outlayer"), require("get-size")) : a.Masonry = b(a.Outlayer, a.getSize)
}(window);;

/****** FILE: picturefill.js *****/

(function(w) {
    "use strict";
    w.picturefillLoaded = false;
    w.picturefillCallback = null;
    w.picturefill = function() {
        var ps = w.document.getElementsByTagName("span");
        var switched = false;
        for (var i = 0, il = ps.length; i < il; i++) {
            if (ps[i].getAttribute("data-picture") !== null) {
                var sources = ps[i].getElementsByTagName("span"), matches = [];
                for (var j = 0, jl = sources.length; j < jl; j++) {
                    var media = sources[j].getAttribute("data-media");
                    if (!media || (w.matchMedia && w.matchMedia(media).matches)) {
                        matches.push(sources[j]);
                    }
                }
                var picImg = ps[i].getElementsByTagName("img")[0];
                if (matches.length) {
                    var matchedEl = matches.pop();
                    if (!picImg || picImg.parentNode.nodeName === "NOSCRIPT") {
                        picImg = w.document.createElement("img");
                        picImg.alt = ps[i].parentNode.getAttribute("data-alt");
                    } else if (matchedEl === picImg.parentNode) {
                        continue;
                    }
                    if (matchedEl.getAttribute("data-width")) {
                        picImg.width = matchedEl.getAttribute("data-width");
                    }
                    if (matchedEl.getAttribute("data-height")) {
                        picImg.height = matchedEl.getAttribute("data-height");
                    }
                    picImg.setAttribute("itemprop", "image");
                    picImg.removeAttribute("style");
                    picImg.src = matchedEl.getAttribute("data-src");
                    matchedEl.appendChild(picImg);
                    switched = true;
                    if (picturefillCallback) {
                        picturefillCallback();
                    }
                } else if (picImg) {
                    picImg.parentNode.removeChild(picImg);
                }
            }
        }
    };
    w.load = function() {
        w.picturefill();
        w.picturefillLoaded = true;
    };
    if (w.addEventListener) {
        w.addEventListener("resize", w.picturefill, false);
        w.addEventListener("DOMContentLoaded", function() {
            w.load();
            w.removeEventListener("load", w.load, false);
        }, false);
        w.addEventListener("load", w.load, false);
    } else if (w.attachEvent) {
        w.attachEvent("onload", w.load);
    }
}(this));
window.matchMedia = window.matchMedia || (function(e, f) {
    var c, a = e.documentElement, b = a.firstElementChild || a.firstChild, d = e.createElement("body"), g = e.createElement("div");
    g.id = "mq-test-1";
    g.style.cssText = "position:absolute;top:-100em";
    d.appendChild(g);
    return function(h) {
        g.innerHTML = '&shy;<style media="' + h + '"> #mq-test-1 { width: 42px; }</style>';
        a.insertBefore(d, b);
        c = g.offsetWidth == 42;
        a.removeChild(d);
        return {
            matches: c,
            media: h
        }
    }
})(document);;

/****** FILE: jsclock-0.8.min.js *****/

(function() {
    var $;
    $ = jQuery;
    $.fn.jsclock = function(sTime, oConfig) {
        var sCurrentTime, that;
        that = this;
        sCurrentTime = "";
        if (oConfig == null) {
            oConfig = {};
        }
        $.fn.jsclock.getTime = function() {
            return sCurrentTime;
        };
        $.fn.jsclock.stopClock = function() {
            return oConfig.stopClock = true;
        };
        $.fn.jsclock.startClock = function() {
            if (oConfig.stopClock === true) {
                oConfig.stopClock = false;
                if (sTime === null) {
                    return that.jsclock(sTime, oConfig);
                } else {
                    return that.jsclock(sCurrentTime, oConfig);
                }
            }
        };
        $.fn.jsclock.toggleClock = function() {
            if (oConfig.stopClock === true) {
                return that.jsclock.startClock();
            } else {
                return that.jsclock.stopClock();
            }
        };
        return this.each(function() {
            var aTime, clientClock, clockwork, iCurrentCenti, iCurrentHour, iCurrentMinute, iCurrentSecond, rValidateTimeString, reverseClockwork, updateTimeString;
            if (typeof sTime === "object") {
                oConfig = sTime;
                sTime = null;
            }
            iCurrentHour = 0;
            iCurrentMinute = 0;
            iCurrentSecond = 0;
            iCurrentCenti = 0;
            updateTimeString = function() {
                var addLeadingZero;
                addLeadingZero = function(iTimeStringFragment) {
                    if (iTimeStringFragment < 10 && iTimeStringFragment.length !== 2) {
                        iTimeStringFragment = "0" + iTimeStringFragment;
                    }
                    return iTimeStringFragment;
                };
                iCurrentHour = addLeadingZero(iCurrentHour);
                iCurrentMinute = addLeadingZero(iCurrentMinute);
                iCurrentSecond = addLeadingZero(iCurrentSecond);
                iCurrentCenti = addLeadingZero(iCurrentCenti);
                if (oConfig.showCenti === true) {
                    sCurrentTime = "" + iCurrentHour + ":" + iCurrentMinute + ":" + iCurrentSecond + ":" + iCurrentCenti;
                } else {
                    sCurrentTime = "" + iCurrentHour + ":" + iCurrentMinute + ":" + iCurrentSecond;
                }
                that.html(sCurrentTime);
                if (oConfig.stopClock === true) {
                    return clearTimeout(clockLoop);
                }
            };
            rValidateTimeString = /^(([01][0-9])|(2[0-3])):[0-5][0-9]:[0-5][0-9](:[0-9][0-9])?$/i;
            if (oConfig.countdown != null) {
                if (typeof oConfig.countdown !== "boolean") {
                    that.html('countdown value must either be "true" or "false".');
                    return false;
                }
            }
            if (oConfig.showCenti != null) {
                if (typeof oConfig.showCenti !== "boolean") {
                    that.html('showCenti value must either be "true" or "false".');
                    return false;
                }
            }
            if (oConfig.callback != null) {
                if (typeof oConfig.callback !== "function") {
                    that.html('callback must be a function!');
                    return false;
                }
            }
            if (sTime) {
                if (rValidateTimeString.test(sTime)) {
                    aTime = sTime.split(':');
                    iCurrentHour = aTime[0];
                    iCurrentMinute = aTime[1];
                    iCurrentSecond = aTime[2];
                    iCurrentCenti = aTime[3];
                    if (oConfig.countdown === true) {
                        reverseClockwork = function() {
                            var baseclock, fullclock, simpleclock;
                            baseclock = function() {
                                if (iCurrentSecond > 0) {
                                    return iCurrentSecond--;
                                } else {
                                    iCurrentSecond = 59;
                                    if (iCurrentMinute > 0) {
                                        return iCurrentMinute--;
                                    } else {
                                        iCurrentMinute = 59;
                                        if (iCurrentHour > 0) {
                                            return iCurrentHour--;
                                        } else {
                                            if (typeof oConfig.callback === "function") {
                                                oConfig.callback.call(that);
                                                return clearTimeout(clockloop);
                                            } else {
                                                return iCurrentHour = 23;
                                            }
                                        }
                                    }
                                }
                            };
                            simpleclock = function() {
                                var clockloop;
                                updateTimeString();
                                baseclock();
                                return clockloop = setTimeout(simpleclock, 1000);
                            };
                            fullclock = function() {
                                var clockloop;
                                if (iCurrentCenti > 0) {
                                    iCurrentCenti--;
                                } else {
                                    iCurrentCenti = 99;
                                    baseclock();
                                }
                                updateTimeString();
                                return clockloop = setTimeout(fullclock, 10);
                            };
                            if (oConfig.showCenti === true) {
                                return fullclock();
                            } else {
                                return simpleclock();
                            }
                        };
                        return reverseClockwork();
                    } else {
                        clockwork = function() {
                            var baseclock, fullclock, simpleclock;
                            baseclock = function() {
                                if (iCurrentSecond < 59) {
                                    return iCurrentSecond++;
                                } else {
                                    iCurrentSecond = 0;
                                    if (iCurrentMinute < 59) {
                                        return iCurrentMinute++;
                                    } else {
                                        iCurrentMinute = 0;
                                        if (iCurrentHour < 23) {
                                            return iCurrentHour++;
                                        } else {
                                            return iCurrentHour = 0;
                                        }
                                    }
                                }
                            };
                            simpleclock = function() {
                                var clockLoop;
                                baseclock();
                                updateTimeString();
                                return clockLoop = setTimeout(simpleclock, 1000);
                            };
                            fullclock = function() {
                                var clockLoop;
                                if (iCurrentCenti < 99) {
                                    iCurrentCenti++;
                                } else {
                                    iCurrentCenti = 0;
                                    baseclock();
                                }
                                updateTimeString();
                                return clockLoop = setTimeout(fullclock, 10);
                            };
                            if (oConfig.showCenti === true) {
                                return fullclock();
                            } else {
                                return simpleclock();
                            }
                        };
                        return clockwork();
                    }
                } else {
                    return that.html('Time string <strong>must</strong> be either in the format "HH:MM:SS" or in the "HH:MM:SS:CC" format. Hours, minutes and seconds are all <strong>REQUIRED</strong>, as are the leading zeros, if any. Centiseconds are entirely optional, even if showCenti is true.');
                }
            } else {
                if (oConfig.countdown === true) {
                    that.html('You must specify a time string to countdown from!');
                    return false;
                } else {
                    clientClock = function() {
                        var baseclock, fullclock, simpleclock;
                        baseclock = function() {
                            var oCurrentDate;
                            oCurrentDate = new Date();
                            iCurrentHour = oCurrentDate.getHours();
                            iCurrentMinute = oCurrentDate.getMinutes();
                            return iCurrentSecond = oCurrentDate.getSeconds();
                        };
                        simpleclock = function() {
                            var clockLoop;
                            baseclock();
                            updateTimeString();
                            return clockLoop = setTimeout(simpleclock, 1000);
                        };
                        fullclock = function() {
                            var bFirstTime, oCurrentDate;
                            if (typeof bFirstTime != "undefined" && bFirstTime !== null) {
                                if (iCurrentCenti < 99) {
                                    iCurrentCenti++;
                                } else {
                                    iCurrentCenti = 0;
                                    baseclock();
                                }
                            } else {
                                baseclock();
                                oCurrentDate = new Date();
                                iCurrentCenti = oCurrentDate.getMilliseconds().toString().substr(0, 2);
                                bFirstTime = true;
                            }
                            updateTimeString();
                            return setTimeout(fullclock, 10);
                        };
                        if (oConfig.showCenti === true) {
                            return fullclock();
                        } else {
                            return simpleclock();
                        }
                    };
                    return clientClock();
                }
            }
        });
    };
}).call(this);;

/****** Hero.js *****/

var Hero = function() {
    var container;
    var images;
    var callback;
    var total;
    var index =- 1;
    var current = 0;
    var init = function(callbackFunc) {
        callback = callbackFunc;
        container = $(".hero");
        if (container.is("*")) {
            images = container.find(".hero-image");
            total = images.size();
            if (total > 1) {
                container.css("cursor", "pointer").click(function() {
                    swap();
                });
            }
            $(window).on('resize', invalidate);
            $('body').focus(invalidate).blur(invalidate);
            swap();
        } else {
            callbackFunc();
        }
    };
    function invalidate() {
        images.each(function() {
            center($(this));
        });
    }
    var swap = function() {
        index++;
        current = index%total;
        images.each(function(i) {
            if (i === current) {
                fadeInn($(this));
            } else {
                fadeOut($(this));
            }
        });
    };
    var center = function(item) {
        var offset = container.width() - item.find("img").width();
        item.css("margin-left", Math.round(offset / 2));
    };
    var fadeInn = function(item) {
        if (item.hasClass('loaded')) {
            center(item);
            if (Modernizr.csstransitions) {
                item.removeClass('fade--out').addClass('fade--inn');
            } else {
                item.stop().animate({
                    opacity: 1
                }, {
                    duration: tweenSpeed * 1000,
                    ease: tweenEase
                });
            }
        } else {
            Loader.add();
            item.attr('data-picture', '').addClass('loaded');
            window.picturefill();
            item.imagesLoaded().always(function() {
                center(item);
                if (Modernizr.csstransitions) {
                    item.removeClass('fade').removeClass('fade--out').addClass('fade--inn');
                } else {
                    item.stop().animate({
                        opacity: 1
                    }, {
                        duration: tweenSpeed * 1000,
                        ease: tweenEase
                    });
                }
                if (callback != undefined) {
                    callback();
                    callback = undefined;
                }
                Loader.force();
            });
        }
    };
    var fadeOut = function fadeOut(item) {
        if (Modernizr.csstransitions) {
            item.removeClass('fade--inn').addClass("fade--out");
        } else {
            item.stop().animate({
                opacity: 0
            }, {
                duration: tweenSpeed * 1000,
                ease: tweenEase
            });
        }
    };
    return {
        init: init,
        invalidate: invalidate
    };
}();;

/****** FILE: Grid.js *****/

var Grid = function() {
    var grid;
    var stage;
    var columns;
    var threshold = 400;
    var lazyTotal;
    var init = function() {
        grid = $('.grid');
        if (grid.is("*")) {
            stage = $(window);
            lazyTotal = $('.grid .lazy').size();
            if ($(".ss_class_WorkHolder").is("*")) {
                columns = [4, 2];
            }
            if ($(".ss_class_GalleryPage").is("*")) {
                columns = [2, 2];
            }
            stage.on('resize', invalidate).scroll(findVisible);
            $('body').focus(invalidate).blur(invalidate);
            invalidate();
        }
    };
    var invalidate = function() {
        findVisible();
        if (stage.width() > 568) {
            currentColumns = columns[0];
        } else {
            currentColumns = columns[1];
        }
        grid.masonry({
            transitionDuration: "0.0s",
            columnWidth: grid.width() / currentColumns
        });
    };
    var findVisible = function() {
        if (lazyTotal > 0) {
            var elementY;
            var windowHeight = stage.height();
            var scrollTop = stage.scrollTop();
            $('.grid .lazy').each(function(i, e) {
                elementY = $(e).offset().top;
                if (elementY > (scrollTop - threshold) && elementY < (scrollTop + windowHeight + threshold)) {
                    lazyTotal--;
                    loadVisible($(e));
                }
            });
        }
    };
    var loadVisible = function(item) {
        Loader.add();
        item.removeClass("lazy").find(".image").attr("data-picture", "");
        window.picturefill();
        item.imagesLoaded().progress(function(instance, image) {
            if (image.isLoaded) {
                fadeInn(item);
            } else {
                item.remove();
            }
        }).always(function() {
            Loader.force();
        });
    };
    var fadeInn = function(item) {
        if (Modernizr.csstransitions) {
            item.removeClass('fade').removeClass('fade--out').addClass('fade--inn');
        } else {
            element.stop().animate({
                opacity: 1
            }, {
                duration: tweenSpeed * 1000,
                ease: tweenEase
            });
        }
    };
    return {
        init: init
    }
}();;

/****** FILE: script.js *****/

var tweenEase = "easeInOutQuad";
var tweenSpeed = 1.00;
var Handheld = function() {
    var handheldState = false;
    var menu;
    var init = function() {
        menu = $(".handheld-menu");
        $(".handheld-menu-button").click(function() {
            if (handheldState) {
                hide();
            } else {
                show();
            }
        });
    };
    var show = function() {
        menu.stop().show().animate({
            opacity: 1
        }, {
            duration: 600,
            ease: tweenEase
        });
        window.addEventListener("touchmove", onWindowScroll, false);
        handheldState = true;
    };
    var hide = function() {
        menu.stop().animate({
            opacity: 0
        }, {
            duration: 600,
            ease: tweenEase,
            complete: onHide
        });
        window.removeEventListener("touchmove", onWindowScroll);
        handheldState = false;
    };
    var onHide = function() {
        $(".handheld-menu").hide();
    };
    var onWindowScroll = function(event) {
        event.preventDefault();
    };
    return {
        init: init
    };
}();
var Loader = function() {
    var currentAlpha = 0;
    var hasLoader = false;
    var loader;
    var addItr = 0;
    var add = function() {
        addItr++;
        if (hasLoader) {
            return;
        }
        loader = $('page--loader');
        hasLoader = true;
        currentAlpha = 0;
        onAddLoader();
    };
    var onAddLoader = function() {
        if (hasLoader) {
            if (Modernizr.cssanimations) {
                $(".page--loader").addClass("flash");
            } else {
                currentAlpha = currentAlpha === 0 ? 1 : 0;
                loader.animate({
                    opacity: currentAlpha
                }, {
                    duration: tweenSpeed * 1000,
                    delay: 2000,
                    ease: tweenEase,
                    complete: onAddLoader
                });
            }
        }
    };
    var kill = function() {
        addItr--;
        if (addItr <= 1) {
            if (Modernizr.cssanimations) {
                $(".page--loader").removeClass("flash");
            } else {
                $(".page--loader").stop().animate({
                    opacity: 0
                }, {
                    duration: tweenSpeed * 1000,
                    ease: tweenEase
                });
            }
            hasLoader = false;
        }
    };
    var force = function() {
        addItr = 0;
        kill();
    };
    return {
        add: add,
        kill: kill,
        force: force
    };
}();
var Lightning = function() {
    var CONST_MARGIN = 48;
    var isOn = false;
    var isLoaded;
    var data;
    var lightning;
    var frame;
    var image;
    var stage;
    var body;
    var html;
    var imageWidth;
    var imageHeight;
    var ratio;
    var margin;
    var newWidth;
    var newHeight;
    var captionHeight;
    var init = function() {
        if ($(".ss_class_WorkHolder").is("*")&&!Modernizr.touch) {
            $(".grid .item a").click(onOpen);
            window.onpopstate = onAddressChange;
            html = $('html');
            stage = $(window);
            stage.on("resize", invalidate);
            body = $('body');
            body.focus(invalidate);
            body.blur(invalidate);
        }
    };
    var invalidate = function() {
        if (isOn) {
            if (isLoaded) {
                if (imageWidth >= imageHeight) {
                    newWidth = stage.width() - margin;
                    newHeight = newWidth / ratio;
                    if (newHeight + margin > stage.height()) {
                        newHeight = stage.height() - margin;
                        newWidth = newHeight * ratio;
                    }
                } else {
                    newHeight = stage.height() - margin;
                    newWidth = newHeight * ratio;
                    if (newWidth > stage.width()) {
                        newWidth = stage.width() - margin;
                        newHeight = newWidth / ratio;
                    }
                }
                newWidth = Math.round(newWidth);
                newHeight = Math.round(newHeight);
                image.css({
                    "width": newWidth,
                    "height": newHeight
                });
                frame.css({
                    "width": newWidth,
                    "height": newHeight + captionHeight,
                    "left": ((stage.width() - newWidth) / 2) + 14,
                    "top": (stage.height() - newHeight - captionHeight) / 2
                });
            } else {
                if (stage.width() < stage.height()) {
                    newWidth = stage.width() - CONST_MARGIN;
                } else {
                    newWidth = stage.height() - CONST_MARGIN;
                }
                if (newWidth > 960) {
                    newWidth = 960;
                }
                newHeight = Math.round((newWidth / 16) * 9) + captionHeight;
                frame.css({
                    "width": newWidth,
                    "height": newHeight,
                    "left": ((stage.width() - newWidth) / 2) + 14,
                    "top": (stage.height() - newHeight) / 2
                });
            }
        }
    };
    var onOpen = function(event) {
        event.preventDefault();
        data = {
            id: $(this).parent().attr("id"),
            url: $(this).attr("data-href"),
            title: $(this).attr("data-title"),
            client: $(this).attr("data-client"),
            year: $(this).attr("data-year"),
            uri: $(this).attr("data-url"),
            videoID: $(this).attr("data-videoID"),
            isVideo: $(this).attr("data-isVideo") === "1",
            template: $(this).attr("data-isVideo") === "1" ? "#lightning-video": "#lightning-image"
        };
        Loader.add();
        if (Modernizr.history) {
            history.pushState(null, null, data.uri);
        }

        var source = $(data.template).html();
        var template = Handlebars.compile(source);
        body.append(template(data));
        if ($(document).height() > stage.height()) {
            var scrollTop = (html.scrollTop()) ? html.scrollTop(): body.scrollTop();
            html.addClass('no-scroll').css('top', - scrollTop);
            body.css("margin-right", $.scrollbarWidth());
        }
        lightning = $(".lightning");
        frame = lightning.find(".frame");
        captionHeight = lightning.find(".caption").height() + 14;
        margin = captionHeight + CONST_MARGIN;
        lightning.css({
            "top": scrollTop
        });
        stage.bind('keyup', onKeyUp);
        lightning.bind('click touchend', onClose);
        show();
        isOn = true;
        if (data.isVideo) {
            invalidate();
            onLoadedComplete();
        } else {
            lightning.imagesLoaded(onLoaded);
        }
    };
    function show() {
        if (Modernizr.csstransitions) {
            lightning.removeClass("fade--out").addClass('fade--inn');
        } else {
            lightning.animate({
                opacity: 1
            }, {
                duration: tweenSpeed * 1000,
                ease: tweenEase
            });
        }
    }
    var _hideTimeout;
    function hide() {
        var scrollTop = parseInt(html.css('top'));
        html.removeClass('no-scroll').scrollTop( - scrollTop);
        body.css("margin-right", 0).scrollTop( - scrollTop);
        if (Modernizr.csstransitions) {
            lightning.removeClass('fade--inn').addClass("fade--out");
            _hideTimeout = setTimeout(onHideEnd, 1200);
        } else {
            lightning.animate({
                opacity: 0
            }, {
                duration: tweenSpeed * 1000,
                ease: tweenEase,
                complete: onHideEnd
            });
        }
    }
    var onHideEnd = function() {
        if (Modernizr.csstransitions) {
            clearTimeout(_hideTimeout);
        }
        lightning.remove();
        lightning = null;
        image = null;
        margin =- 1;
        captionHeight =- 1;
        imageWidth =- 1;
        imageHeight =- 1;
        ratio =- 1;
    };
    var onLoaded = function() {
        image = $(".lightning .image img");
        imageWidth = image.width();
        imageHeight = image.height();
        ratio = imageWidth / imageHeight;
        isLoaded = true;
        onLoadedComplete();
    };
    var onLoadedComplete = function() {
        invalidate($(window).width(), $(window).height());
        Loader.force();
        if (Modernizr.csstransitions) {
            frame.addClass('fade--inn');
        } else {
            frame.animate({
                opacity: 1
            }, {
                duration: tweenSpeed * 1000,
                ease: tweenEase
            });
        }
    };
    var onClose = function() {
        isOn = false;
        isLoaded = false;
        $(window).unbind('keyup');
        lightning.unbind('touchend');
        lightning.unbind('click');
        if (Modernizr.history) {
            history.pushState(null, null, "./work.html#" + data.id);
        }
        hide();
    };
    var onAddressChange = function() {
        if (isOn) {
            onClose();
        }
    };
    var onKeyUp = function(event) {
        if (event.keyCode == 27) {
            onClose();
        }
    };
    return {
        init: init,
        invalidate: invalidate
    };
}();
var ImagePage = function() {
    var init = function() {
        if ($(".ss_class_StaffPage").is("*") || $(".ss_class_ErrorPage").is("*") || $(".ss_class_WorkPage").is("*")) {
            var main = $(".main");
            main.find(".image").attr("data-picture", "");
            window.picturefill();
            main.imagesLoaded().always(function() {
                if (Modernizr.csstransitions) {
                    main.removeClass('fade').removeClass('fade--out').addClass('fade--inn');
                } else {
                    main.animate({
                        opacity: 1
                    }, {
                        duration: tweenSpeed * 1000,
                        ease: tweenEase
                    });
                }
            });
        }
    };
    return {
        init: init
    };
}();
var StaffLazy = function() {
    var threshold = 500;
    var init = function() {
        if ($(".ss_class_StaffHolder").is("*")) {
            $(window).scroll(onScroll);
            findVisible();
        }
    };
    var findVisible = function() {
        var windowHeight = $(window).height(), scrollTop = $(window).scrollTop(), element, elementY, top, bottom;
        $('.mobil .lazy').each(function(i, e) {
            element = $(e);
            elementY = element.offset().top;
            top = scrollTop - threshold;
            bottom = scrollTop + windowHeight + threshold;
            if (elementY > top && elementY < bottom) {
                loadVisible(element);
            }
        });
    };
    function onScroll() {
        findVisible();
    }
    function loadVisible(element) {
        Loader.add();
        element.removeClass("lazy");
        var image = element.find(".image");
        image.attr("data-picture", "");
        window.picturefill();
        image.imagesLoaded().progress(function(instance, image) {
            if (image.isLoaded) {
                element.animate({
                    opacity: 1
                }, {
                    duration: tweenSpeed * 1000,
                    ease: tweenEase
                });
            } else {
                element.remove();
            }
        }).always(function(instance) {
            Loader.force();
        });
    }
    return {
        init: init
    }
}();
$(document).ready(function() {

    Config.init();






    var body = $("body");





    if (navigator.userAgent.toLowerCase().indexOf("chrome")>-1) {
        var current_css = body.css("font-family");
        body.css("font-family", current_css);
        var a = setInterval(function() {
            var current_css = body.css("font-family");
            body.css("font-family", current_css);
            clearInterval(a);
        }, 300);
    }
    Hero.init(heroDone);
    function heroDone() {
        Handheld.init();
        Lightning.init();
        Grid.init();
        ImagePage.init();
        StaffLazy.init();
    }
    var clock = $(".current-time span");
    if (clock.is("*")) {
        clock.load(ctx+"/time.do", null, function(response, status) {
        	var json = JSON.parse(response);
            $(this).jsclock(json);
        });
    }
});

$.scrollbarWidth = function() {
    var a, b, c;
    if (c === undefined) {
        a = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
        b = a.children();
        c = b.innerWidth() - b.height(99).innerWidth();
        a.remove()
    }
    return c
};;
