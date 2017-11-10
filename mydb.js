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
app.listen(80,function(req,res){
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
    if( typeof boardid === "undefined"){ boardid = 1; }
   
    var results;
    pool.getConnection(function(err,connection){
        if ( err ){
            console.error('my sql error');
        }else{
            var sql = 'select idx,title,name,description,date_format(date,"%Y-%m-%d") date,view from topic';
            
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

app.get('/madenote',function(req,res){
    res.render('madenote',{title : '제작 기록'});
});

app.get('/board/writeform',function(req,res){
    res.render('writeform',{title : '글 작성화면'});
});

app.post('/board/writeupdate',function(req,res){
    var title = req.body.title;
    var name = req.body.name;
    var description = req.body.description;
    var datas = [title,name,description];
    var idx = req.body.id;
    pool.getConnection(function(err,connection){
        if( err){
            console.error(err);
            throw err;
        }else{
            var sql = 'update topic set title=?,name=?,description=?,modidate=now() where idx ='+idx;
            connection.query(sql,datas,function(err,res){
                if( err){
                    console.error(err);
                    throw err;
                }
                console.log("글 수정완료");
                connection.release();
            })
        }
    })
    res.redirect('/board');
});

app.get('/board/delete',function(req,res){
    var idx = req.param('idx');
    
    pool.getConnection(function(err,connection){
        if( err){
            console.error(err);
            throw err;
        }else{
            var sql = 'delete from topic where idx = '+idx;
            connection.query(sql,function(err,res){
                if( err){
                    console.error(err);
                    throw err;
                }
                console.log("삭ㅋ제ㅋ");
                connection.release();
            })
        }
    })

    res.redirect('/board');
})

app.get('/board/modify',function(req,response){
    var idx = req.param('idx');
    
    pool.getConnection(function(err,connection){
        if( err){
            console.error(err);
            throw err;
        }else{
            var sql = 'select * from topic where idx = '+idx;
            connection.query(sql,function(err,res){
                if( err){
                    console.error(err);
                    throw err;
                }else{
                //console.log(res[0]);
                response.render('writeupdate',{title:"글 수정",idx:res[0].idx,titles:res[0].title,name:res[0].name,desc:res[0].description,password:res[0].password});
                }
                connection.release();
            })
        }
    })

    
})

app.get('/board/boardview',function(req,res){
    var contentid = req.param('id');
    //console.log(contentid);
    

    pool.getConnection(function(err,connection){
        if( err){
            console.error(err);
            throw err;
        }else{
            var sql2 = 'update topic set view = view + 1 where idx = '+contentid;
            connection.query(sql2,function(err,res){
                if( err){
                    console.error(err);
                    throw err;
                }
                //console.log("조회수 1 증가");
                connection.release();
            })
        }
    })
   
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
                    res.render('boardview',{title : '글 보기', boardidx : result[0].idx,
                    boardtitle: result[0].title, boardname: result[0].name, 
                    boardconts: result[0].description.replace(/\r\n/g,'<br>'), boardtime:result[0].date, boardview:result[0].view});
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

app.get('/signin',function(req,res){
	res.render('signin',{title: '회원가입'});
})

app.post('/signsuccess',function(req,res){
    var name = req.body.name;
    var id = req.body.id;
    var password = req.body.password;
    var birth = req.body.birth;
    var phone = req.body.phone;
    var email = req.body.email;
    var datas = [name,password,id,birth,phone,email];
    pool.getConnection(function(err,connection){
        if ( err ){
            console.error('회원가입 오류');
        }else{
            var sql = 'insert into user values(?,?,?,?,?,?)';
            
            connection.query(sql,datas,function(err,result){
                if( err){
                    console.error(err);
                    throw err;
                }
                else{
                    //console.log(result);
                    results = result;
                    res.render('signsuccess',{title : '회원가입 성공'});
                    connection.release();
                    }
            })
        }
    })
})