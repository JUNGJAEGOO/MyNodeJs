var express = require('express');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var bodyparser = require('body-parser');
var pool = mysql.createPool({
    host : 'localhost',
    password : 'worn1215',
    user : 'root',
    database : 'nodejs'
});

app.use(bodyparser.urlencoded({extended: true}));

app.listen(3000,function(req,res){
    console.log("Connected... port is 3000......");
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
    var results;
    pool.getConnection(function(err,connection){
        if ( err ){
            console.error('my sql error');
        }else{
            var sql = 'select * from topic';
            
            connection.query(sql,function(err,result){
                if( err){
                    console.error(err);
                    throw err;
                }
                else{
                    //console.log(result);
                    results = result;
                    res.render('board',{title : '게시판', boards: results});
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
    res.render('writeform',{title : '글쓰기'});
});

app.post('/board/write',function(req,res){
    
    var title = req.body.title;
    var name = req.body.name;
    var description = req.body.description;
    var password = req.body.password;
    var datas= [name,password,title,description];
    console.log(datas);
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

app.get('/captcha',function(req,res){
    res.render('captcha',{title : 'CAPTCHA'});
});

app.get('/maps',function(req,res){
    res.render('maps',{title : 'MAPS'});
});