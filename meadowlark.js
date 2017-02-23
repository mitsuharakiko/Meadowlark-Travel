var express = require("express");
var bodyParser = require("body-parser");
//upload file plugin fomidable
var formidable = require("formidable");
//jquery upload file plugin
//var jqUpload = require("jquery-file-upload-middleware");
var cookie = require("cookie-parser");
//引入文件系统
var fs = require("fs");

//引入cookie凭证
var credentials = require("./lib/credentials.js");
//引入幸运饼干随机生成句子
var fortuneCookies = require("./lib/fortune.js");
//引入天气组件
var weatherData = require("./lib/weatherData.js");

var app = express();
var _bodyParser = bodyParser();
var _cookieParser = cookie(credentials.cookieSecret);

//设置handlebars引擎
var handlebars = require("express3-handlebars").create({
    defaultLayout:"main",
    //设置模板段落
    helpers: {
        section: function(name,options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this); 
            return null;
        }
    }
});

app.engine("handlebars",handlebars.engine);
app.set("view engine","handlebars");

//设置nodejs服务器端口号
app.set("port",process.env.PORT || 3000);

//攀岩包免责条款
//app.use(require("./lib/tourRequiresWaiver.js"));
/*
var cartValidation = require("./lib/cartValidation.js");
app.use(cartValidation.checkWaivers);
app.use(cartValidation.chechGuestCounts);
*/

//static中间件可以将一个或者多个目录指派为包含静态资源的目录，资源不会经过任何处理直接发送给客户端
app.use(express.static(__dirname+"/public"));   //必须在所有的路由之前

var dataDir = __dirname + "/data";
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);



//mocha的页面检查开启中间件
app.use(function(req,res,next){
    res.locals.showTest = app.get("env") !== "production" && req.query.test === "1";
    next();
});

//给res.locals.partials对象添加数据的中间件
app.use(function(req,res,next){
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = weatherData.getWeatherData(); //res.locals用于渲染视图的上下文
    next();
});

//session会话
app.use(function(req,res,next){
     //res.session.flash = {
     flash = {  
        type: "danger",
        inrto: "database",
        message: "白痴奶茶大西瓜"
    };
    res.locals.flash = flash;
    //delete req.session.flash;
    next();
});

app.get("/",function(req,res){
    //res.type("text/plain");   //使用视图模板引擎以后，就不要res.type()，防止强制解析成文本，浏览器上显示的也是文本标签而不是渲染的dom
    res.render("home"); //没有设置状态码是因为视图引擎默认返回text/plain里面的内容类型跟200状态码
    // res.send("Meadowlark Travel"); //该页面发送文本
    //res.cookie("monster","nom nom");
    //res.signedCookies("signed_monster","dukang",{ signed: true });
});

app.get("/about",function(req,res){
    //res.type("text/plain");
    res.render("about",{
        fortune: fortuneCookies.getFortune(),
        pageTestScript: "/qa/tests-about.js"
    });
    // res.send("About Meadowlark Travel"); //该页面发送文本
});

//thank-you
app.get("/thank-you",function(req,res){
    res.render("thank-you");
});

app.get("/tours/hood-rivers",function(req,res){
    res.render("tours/hood-rivers");
});

app.get("/tours/request-group-rate",function(req,res){
    res.
    res.render("tours/request-group-rate");
});

app.get("/newsletter",function(req,res){
    res.render("newsletter",{
        csrf: "CSRF token goes here"
    });
});

//formidable文件上传
app.get("/contest/vacation-photo",function(req,res){
    var now = new Date();
    res.render("contest/vacation-photo",{
        year: now.getFullYear(),
        month: now.getMonth()    
    });
});

//formidable文件上传时候发送的请求处理
app.post("/contest/vacation-photo/:year/:month",function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err) res.redirect(303,"/error");
        if(err){
            res.session.flash = {
                type: "danger",
                intro: "Oops!",
                message: "There was an error processing your submission. Please try again."
            };
            return res.redirect(303,"/contest/vacation-photo");
        }
        var photo = files.photo;
        var dir = vacationPhotoDir + '/' + Date.now();
        var path = dir + "/" + photo.name;
        fs.mkdirSync(dir);
        fs.renameSync(photo.path, dir + "/" + photo.name);
        //saveContestEntry("vacation-photo",fields.email,req.params.year,req.params.month,path);
        req.session.flash ={
            type: "success",
            intro: "Good Luck!",
            message: "You have been entered into the contest."
        };
        console.log("received fields:" + fields);
        console.log("received files:" + files);
        res.redirect(303,"/contest/vacation-photo/entries");
    });
});

//jquer文件上传
/*
app.use("/upload",function(req,res){
    var now = Date.now();
    jqUpload.fileHandler({
        uploadDir: function(){
            return __dirname + "/public/uploads/"+ now;
        },
        uploadUrl: function(){
            return "/upload/"+ now;
        },
    })(req,res,next);
});
*/ //本项目中暂时没有使用到jqupload插件

//body-parser
app.use(_bodyParser);
//cookie
app.use(_cookieParser);
//引入session会话
app.use(require("express-session")());
//ajax的表单提交
app.post("/process",function(req,res){
    console.log("Form (form querystring):" + req.query.form);
    console.log("CSRF token (form hidden and field):" + req.body._csrf);
    console.log("Name (form visible form field):" + req.body.name);
    console.log("Email (form visible form field):" + req.body.email);

    if(req.xhr || req.accepted("json","html") === "json"){
        //如果是错误的话，应该发送{error: "error description"}
        res.send({success:true});
    } else {
        //错误的话，重定向到错误页面
        res.redirect(303 , "/thank-you");
    }
    
});

app.post("/newsletter",function(req,res){
    //session追加
    var name = req.body.name || "",
        email = req.body.email || "";
    if(!email.match(VALID_EMAIL_REGEX)){
        if(req.xhr) return res.json({error:"Invalid name email address"});
        req.session.flash = {
            type: "danger", 
            intro: "Validation error!",
            message: "The mail address you entered was not valid!"
        };
        return res.redirect(303,"/newsletter/archive");
    }
    new NewsLetterSignup({
        name: name,
        email: email
    }).save(function(err){
        if(err){
            if(req.xhr) return res.json({error: "Database error!"});
            req.session.flash = {
                type: "danger",
                intro: "Database error!",
                message: "There was a database error; Please try again later!"
            };
            return res.redirect(303,"/newsletter/archive");
        }

        if(req.xhr) return res.json({success: true});
        req.session.flash = {
            type: "success",
            intro: "Thank You!",
            message: "You have been signed up for the newsletter!"
        };
        return res.redirect(303,"/newsletter/archive");
    });
});


/* little example */
/*
app.use(function(req,res,next){
    console.log('\n\nALLWAYS');
    next();
});

app.get('/a',function(req,res){
    console.log('/a: 路由终止');
    res.send("a");
});

app.get('/a',function(req,res){
    console.log('/a: 永远不会调用');
});

app.get('/b',function(req,res,next){
    console.log('/b: 路由未终止');
    next();
});

app.use(function(req,res,next){
    console.log('SOMETIMES');
    next();
});

app.get('/b',function(req,res,next){
    console.log('/b: (part2): 抛出错误');
    throw new Error("b 失败");
});

app.get('/b',function(err,req,res,next){
    console.log('/b: 检测到错误并传递');
    next(err);
});

app.get('/c',function(err,req){
    console.log('/c: 抛出错误');
    throw new Error("c 失败");
});

app.use('/c',function(err,req,res,next){
    console.log('/c: 检测到错误但是不传递。');
    next();
});

app.use(function(err,req,res,next){
    console.log('检测未处理的错误' + err.message);
    res.send('500 - 服务器错误');
});

app.use(function(req,res){
    console.log(' 未处理的路由 ');
    res.send("404 - 未找到");
});
*/
/* --- little example --- */

//404
app.use(function(req,res){
   // res.type("text/plain");
    res.status(404);
    res.render("404");
    // res.send("404 - not found"); //该页面发送文本
});

//500
app.use(function(err,req,res,next){
    console.error(err.stack);
    //res.type("text/plain");
    res.status(500);
    res.render("500");
    // res.send("500 - Server Error"); //该页面发送文本
});

app.listen(app.get("port"),function(){
    console.log("Express strated on localhost : "+ app.get("port") +" ; Press Ctrl-C to terminate ;");
});

