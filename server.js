const { response } = require('express');
const express = require('express');
const app = express();
// app.listen(8080, function(){
//     console.log('listening on 8080')
// });

// static 파일 보관 public 폴더 알려주기
app.use('/public', express.static('public'));

// body parser
const bodyParser = require('body-parser');
const req = require('express/lib/request');
app.use(bodyParser.urlencoded({extended : true}));

// mongoDB
const MongoClient = require('mongodb').MongoClient;

// ejs
app.set('view engine', 'ejs');

// method-override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// session - require
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
// session - 미들웨어
app.use(session({secret : '123123', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 






// 어떤 db에 저장할 것인가 명시하기 위해 변수 생성
var db;

// mongodb 연결하기
MongoClient.connect('mongodb+srv://admin:msngs123@cluster0.l9orvf9.mongodb.net/?retryWrites=true&w=majority',
function(error, client){ // 1. db 접속이 완료되면
    // 에러가 나면 이유 error 파라미터에 답긴 에러를 출력
    if(error) return console.log(error);

    // todoapp이라는 database(폴더)에 연결해주세요
    db = client.db('todoapp')
    // 데이터 저장해보자 (그냥 고정적 코드)
    // db.collection('post').insertOne({_id: 01, name : 'Yu', age : 27}, function(error, result){
    //     console.log('저장완료');
    // })

    // 0. app.listen 안으로 넣어주기
    app.listen(8080, function(){
        console.log('listening on 8080') // 2. 8080에 서버를 띄워라~~(서버 잘 뜨면 접속 된것)
    });
})



// 누군가가 /pet으로 방문을 하면..
// pet 관련된 안내문을 띄워주자
// app.get('/pet', function(request, response){
//     response.send('pet site');
// })

// app.get('/beauty', function(request, response){
//     response.send('this is beauty site!!!');
// })


// 페이지
app.get('/', function(request, response){
    response.render('index.ejs')
})

app.get('/write', function(request, response){
    response.render('write.ejs')
})



// form 내용 받아오기
app.post('/add', function(request, response){
    response.send('전송완료');

    // 1. db 총게시물 갯수 데이터 가져오기
    db.collection('counter').findOne({name : 'postCnt'}, function(error, result){
        // 2. 변수에 담아주고
        let totalPost = result.totalPost
        // 3. 갯수 데이터 _id에 넣어서 저장해주기
        db.collection('post').insertOne({_id: totalPost + 1, title : request.body.title, date : request.body.date},
            (error, result) => {
                console.log('저장완료')
                // 4. 이제 갯수 데이터 +1 해주기
                db.collection('counter').updateOne({name : 'postCnt'}, {$inc : {totalPost : 1}}, function(error, result){
                    if(error) console.log(error)
                })
        })
        
    });
    
})


// db에서 데이터 받아와서 ejs파일에 넘겨주고 렌더링하기
app.get('/list', (request, response)=>{
    // db에 저장된 post라는 collection 안의 모든(or id, 제목, ... 이 ~~인 )데이터를 꺼내주세요

    // 1. db에서 자료 찾기
    // db.collection('post').find(); => find()만 하면 모든 메타데이터 다가져옴
    db.collection('post').find().toArray((error, result)=>{
        console.log(result);
        // 2. ejs파일에 데이터 넣어서 보여주기
        // response.render('파일.ejs', {작명이름 : result});
        //                              => 찾은 데이터파일이 담긴 result를 object로 넘겨주기
        response.render('list.ejs', {posts : result});
    });
})


// 데이터 지우기
// app.delete('/delete', (request, response)=>{
//     // 데이터 찍어보기
//     console.log(request.body); // 숫자 id 데이터가 문자형으로 들어와있음 (종종 이런 경우가 생긴다!!)
//     // 숫자형으로 변환
//     request.body._id = parseInt(request.body._id);

//     // 진짜 삭제해주기
//     db.collection('post').deleteOne(request.body, (error, result)=>{
//         console.log('delete is done');
//         response.status(200).send({message : 'success'});
//         // response.status(400).send({message : 'fail'});
//     })
// })

// 데이터 지우기 url parameter version
app.delete('/delete/:id', (request, response)=>{
    db.collection('post').deleteOne({_id : parseInt(request.params.id)}, (error, result)=>{
        console.log(result)
        response.status(200).send({message : 'success'});
    })
})


app.get('/detail/:id', (req, res)=>{
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
        if(result != null){
            res.render('detail.ejs', {data : result});
        }else{
            res.send('404')
        }
    })
})



// edit 페이지 만들기
// get
app.get('/edit/:id', (req, res)=>{
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
        console.log(result)
        if(result != null){
            res.render('edit.ejs', {data : result});
        }else{
            res.send('404')
        }
    })
})

// post로 업데이트 하기
/*
app.post('/edit/:id', (req, res)=>{
    db.collection('post').updateOne({_id : parseInt(req.params.id)},
    { $set : {title : req.body.title, date : req.body.date}}, (error, result)=>{
        if(error){
            console.log(error)
        }else{
            db.collection('post').find().toArray((error2, result2)=>{
                res.render('list.ejs', {posts : result2});
            });
        }
    })
})
*/

// put 활용하기
app.put('/edit', (req, res)=>{
    db.collection('post').updateOne({_id : parseInt(req.body.id)},
    { $set : {title : req.body.title, date : req.body.date}}, (error, result)=>{
        if(error){
            console.log(error)
        }else{
            res.redirect('/list');
        }
    })
})



// 로그인
app.get('/login', (req, res)=>{
    res.render('login.ejs')
})

app.get('/fail', (req, res)=>{
    res.render('loginfail.ejs')
})

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), (req, res)=>{
    res.redirect('/');
})

// 로그인 검사
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (id, pw, done) {
    //console.log(id, pw);
    db.collection('login').findOne({ id: id }, function (error, result) {
      if (error) return done(error)
      if (!result) return done(null, false, { message: '존재하지않는 아이디요' })

      if (pw == result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
}));

// 세션 만들기 (로그인 성공시 발동)
// 시리얼화 해서 쿠키에 저장!!
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

// 세션에 담긴 정보로 DB 조회
// DB 정보 조회하기 위해 다시 시리얼화 해제해 주는 것!!
passport.deserializeUser(function (userId, done) {
    db.collection('login').findOne({id : userId}, (error, result)=>{
        done(null, {result})
    })
}); 



// 마이페이지 만들기
app.get('/mypage', isLoggedIn, (req, res)=>{
    // 유저 정보는 req.user에 담겨있음
    console.log(req.user)
    res.render('mypage.ejs', {data : req.user})
})

function isLoggedIn (req, res, next){
    if(req.user){
        next();
    } else {
        res.send('Please log in first!')
    }
}
