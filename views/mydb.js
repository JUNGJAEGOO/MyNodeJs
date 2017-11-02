var express = require('express');
var dt = require('date-utils');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var bodyparser = require('body-parser');
var pool = mysql.createPool({
    host : 'localhost',
    password : 'worn1215',
    user : 'root',
    port : 3307,
    database : 'nodejs'
});


app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(__dirname+'/public'));
app.listen(3000,function(req,res){
    console.log("Connected... port is 3000!......");
});
app.set('view engine','ejs');


app.get('/',function(req,res){
    res.redirect('/home');
});

app.get('/home',function(req,res){
    res.render('home',{title : '홈'});
});
app.get('/about',function(req,res){
    res.render('about',{title : '어바웃'});
});

app.get('/board',function(req,res){
    var boardid = req.param('page');
    if( typeof boardid === "undefined"){ console.log('hi'); boardid = 1; }
    console.log(boardid);
    var results;
    pool.getConnection(function(err,connection){
        if ( err ){
            console.error('my sql error');
        }else{
            var sql = 'select idx,title,name,description,date_format(date,"%Y-%m-%d") date from topic';
            
            connection.query(sql,function(err,result){
                if( err){
                    console.error(err);
                    throw err;
                }
                else{
                    //console.log(result);
                    results = result;
                    res.render('board',{title : '게시판', boards: results, page:boardid});
                    connection.release();
                    }
            })
        }
    })
    
});

app.get('/db',function(req,res){
    res.render('db',{title : '데이터베이스'});
});

app.get('/board/writeform',function(req,res){
    res.render('writeform',{title : '글 작성화면'});
});

app.get('/board/boardview',function(req,res){
    var contentid = req.param('id');
    //console.log(contentid);
    
    var conts;
    pool.getConnection(function(err,connection){
        if ( err ){
            console.error('my sql error');
        }else{
            var sql = 'select * from topic where idx=?';
            
            connection.query(sql,contentid,function(err,result){
                if( err){
                    console.error(err);
                    throw err;
                }
               else{
                    console.log(result[0].description);
                    
                    res.render('boardview',{title : '글 보기', 
                    boardtitle: result[0].title, boardname: result[0].name, 
                    boardconts: result[0].description, boardtime:result[0].date});
                    connection.release();
                    }
            })
        }
     })
    //res.render('boardview',{title: '글 보기',content: conts});
})

app.post('/board/write',function(req,res){
    
    var title = req.body.title;
    var name = req.body.name;
    var description = req.body.description;
    var password = req.body.password;
    
    var datas= [name,password,title,description];  // 변수 time 의 원 db에서 컬럼명은 date
    //console.log(datas);
   
    var sql = "insert into topic(name,password,title,description) values(?,?,?,?)";

    pool.getConnection(function(err,connection){
        if( err){
            console.error(err);
            throw err;
        }
        else{
            connection.query(sql,datas,function(err,result){
                if( err){
                    console.error(err);
                    throw err;
                }
                else{
                    console.log("등록 완료");
                    connection.release();
                    res.redirect('/board');
                    
                }
            })
        }
    })
    
    
})

app.get('/upcoming',function(req,res){
    res.render('upcoming',{title : 'Upcoming'});
});

app.get('/maps',function(req,res){
    res.render('maps',{title : 'MAPS'});
});