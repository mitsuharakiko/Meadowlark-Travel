var express = require("express");
var app = express();
var fortuneCookies = require("./lib/fortune.js");
var weatherData = require("./lib/weatherData.js");

//设置handlebars引擎
var handlebars = require("express3-handlebars").create({defaultLayout:"main"});
app.engine("handlebars",handlebars.engine);
app.set("view engine","handlebars");

//设置nodejs服务器端口号
app.set("port",process.env.PORT || 3000);

//static中间件可以将一个或者多个目录指派为包含静态资源的目录，资源不会经过任何处理直接发送给客户端
app.use(express.static(__dirname+"/public"));   //必须在所有的路由之前

//mocha的页面检查开启中间件
app.use(function(req,res,next){
    res.locals.showTest = app.get("env") !== "production" && req.query.test === "1";
    next();
});

app.get("/",function(req,res){
    //res.type("text/plain");   //使用视图模板引擎以后，就不要res.type()，防止强制解析成文本，浏览器上显示的也是文本标签而不是渲染的dom
    res.render("home"); //没有设置状态码是因为视图引擎默认返回text/plain里面的内容类型跟200状态码
    // res.send("Meadowlark Travel"); //该页面发送文本
});

app.get("/about",function(req,res){
    //res.type("text/plain");
    res.render("about",{
        fortune: fortuneCookies.getFortune(),
        pageTestScript: "/qa/tests-about.js"
    });
    // res.send("About Meadowlark Travel"); //该页面发送文本
});

app.get("/tours/hood-rivers",function(req,res){
    res.render("tours/hood-rivers");
});

app.get("/tours/request-group-rate",function(req,res){
    res.render("tours/request-group-rate");
});

//app.use()中间件的添加只能在get的后面，如果位置放错首页就无法显示
//给res.locals.partials对象添加数据的中间件
app.use(function(req,res,next){
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = weatherData.getWeatherData(); //res.locals用于渲染视图的上下文
    next();
});

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

