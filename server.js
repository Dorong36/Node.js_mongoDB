const { response } = require('express');
const express = require('express');
const app = express();
// app.listen(8080, function(){
//     console.log('listening on 8080')
// });

// body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

// mongoDB
const MongoClient = require('mongodb').MongoClient;

// ejs
app.set('view engine', 'ejs');


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
    response.sendFile(__dirname + '/index.html');
})

app.get('/write', function(request, response){
    response.sendFile(__dirname + '/write.html');
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