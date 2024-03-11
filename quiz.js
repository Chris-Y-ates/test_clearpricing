const express = require('express');
const app = express();
var server = require('http').createServer(app);
const bodyParser = require("body-parser");
const {Pool} = require('pg');
var nodemailer = require('nodemailer');

let pool = new Pool({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "realtime"
});

var regcompleted = false;
var regagain = false;
var isntreg = false;
var passwrong = false;
var userpass= false;
var passpass = false;
var passsent = false;
var newdetails = false;

const port = 8080;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();

var userDate = year + "-" + month + "-" + date;

function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
  
  app.get('/', (req, res)=>{
    try{        
        list = [];
        userChoice=[];
        firstchoice = [];
        correctchoice = [];
        secondchoice = [];
        arr = [];
        counts = 0;
        userEmail = "";
    
    pool.connect(async (error, client, release)=>{
        let desp = await client.query(`SELECT nickname, MAX(attemptnumber) as maxattempt FROM leaderboard 
        GROUP BY nickname ORDER BY maxattempt DESC`)

        var size = desp.rows.length;

        let resp = await client.query(`SELECT nickname, ROUND(avg(improvement)) as avgimprovement 
        FROM leaderboard 
        GROUP BY nickname
        ORDER BY avgimprovement DESC`);

        var j = '';
        
        for (i = 0; i < size ; i++) {
            j+= '<tr style="text-align: center">';
            j+= '<td>' + '<b>' + (i+1) + '</b>' + '</td>';   
            j+= '<td>' + '<b>' + resp.rows[i].nickname + '</b>' + '</td>';            
            j+= '<td>' + '<b>' + resp.rows[i].avgimprovement + '%' + '</b>' + '</td>';
            j+= '</tr>';
        }
        client.release();

        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Real-Time Quiz App</title>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
            crossorigin="anonymous">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            <script>

            var nowreg = "You Are Now Registered";
            var alreadyreg = "You Are Registered";
            var notreg = "You Are Not Registered";
            var wrongcode = "Incorrect Password";
            var userwrong = "Incorrect Password <br> Login Again";
            var passemailed = "Password Sent";
            var changedetails = "Details Changed <br> Login Again";

            </script>
            <style>

                h1 {
                    font-family: Fantasy;
                }
                body {
                    text-align: center;
                    background: powderblue;
                }

                table {
                    border-collapse: collapse;
                    border: none !important;
                    
                }
            
                h2 {
                    text-align: center;   
                    color: white; 
                    font-family: Fantasy;
                }

                th {
                    text-align: center;
                }

                form {
                    display: inline-block;
                }

                .achievements-wrapper { 
                    height: 100%;
                    width: 100%; 
                    overflow-y: auto;
                    text-align: center;
                    position: fixed;
                }

                input{
                    text-align:center;
                 }

                 th {
                    position: sticky;
                    top: 0px;  
                    background: white;
                    color: black;
                  }
                  
                  /* Add a black background color to the top navigation */
                    .topnav {
                    background-color: #333;
                    overflow: hidden;
                    }

                    /* Style the links inside the navigation bar */
                    .topnav a {
                    float: left;
                    color: #f2f2f2;
                    text-align: center;
                    padding: 24px 5%;
                    text-decoration: none;
                    font-size: 17px;
                    }

                    /* Add a color to the active/current link */
                    .topnav a.active {
                    background-color: #04AA6D;
                    color: white;
                    }
            </style>
        </head>
        <body>
        <div class="topnav">
            <a href="/" onclick='showHome();' style="width: 100%; background-color: black;"><h2>&#9200 RealTime Quiz</h2></a>
            <a id="home1" href="/" onclick='showHome();' class="active"  style="width: 33%;">Home</a>
            <a id="rankings1" href="#rankings" onclick="showRankings();" style="width: 33%;">Rankings</a>
            <a id="about1" href="#about" onclick="showAbout();" style="width: 33%;">About</a>
        </div>
                    <div id="home" style="padding-top: 20px;">
                        <h3 id="homeMessage">Enter Details to Play!</h3>
                        <form action="/info/add" method="POST"><br>
                            <p id="manyemail" style="color: red; display:none;"><b>Max Characters 40</b></p>
                            <input type="email" name="email" id="email" maxlength="40" placeholder='Enter Email Address' style="margin-left: 10px font-size: 18pt; height: 30px; width:260px;" required>
                            <br><br> 
                            <p id="manypassword" style="color: red; display:none;"><b>Max Characters 20</b></p>
                            <input type="password" name="password" id="password" maxlength="20" placeholder='Enter Your Password' style="margin-left: 5px font-size: 18pt; height: 30px; width:260px;" required><br><br>
                            
                            <div style="width:250px;" align="center">
                                <button type="submit" class="btn btn-primary btn-block" style="font-size: 11pt; width:260px; height: 34px;">Login</button>
                            </div><br>                            
                        </form><br>
                        <form action="/registration" method="GET">
                        <div style="width:260px; align: center;">
                                <button type="submit" class="btn btn-primary btn-block" style="font-size: 11pt; width:260px; height: 34px;">Registration</button>
                            </div><br>  
                        </form><br>
                        <form action="/forgotten/password" method="GET">
                        <div style="width:260px; align: center;">
                                <button type="submit" class="btn btn-primary btn-block" style="font-size: 11pt; width:260px; height: 34px;">Forgotten Password</button>
                            </div><br>  
                        </form>
                    </div>
            <div id="rankings" class="span3 achievements-wrapper" style="display:none;">
                
                        <table class="table table-striped table-light">
                        <th colspan="1" class="table-grey"><h4>POS</h4></th>
                        <th colspan="1" class="table-grey"><h4>NAME</h4></th>
                        <th colspan="1" class="table-grey"><h4>%IMP</h4></th>
                            <tbody>
                                ${j}
                            </tbody>
                        </table>  
                    </div>

                    <div class="achievements-wrapper" id="about" style="display:none;"><br>
                    <h5 style="text-align: left; margin-left:10px;margin-right:10px;">Who Can Benefit</h5>
                    <p style="text-align: left;margin-left:10px;margin-right:10px;">This App has been developed to assist in memory/brain training
                    to help improve cognitive function. The focus of the quiz is on users improvement in memory recall over a number of attempts at the quiz,
                     rather than the number of correct answers selected on their first attempt. The ranking system reflects this focus.</p>
                    <h5 style="text-align: left;margin-left:10px;margin-right:10px;">How it Works</h5>
                    <p style="text-align: left;margin-left:10px;margin-right:10px;">Once registered you will see a list of questions with the correct answers.
                    You will have a short time to remember as many answers as possible before the quiz begins.
                    In the user profile section functionality is included for users to track their progress and the progress of any friends who also play the quiz.
                    </p>
                    </div>
                    
        </body>
        <script>
                    if (${regcompleted} == true){
                        document.getElementById("homeMessage").innerHTML = nowreg;  
                    }
                    if (${regagain} == true){
                        document.getElementById("homeMessage").innerHTML = alreadyreg;   
                    }
                    if (${isntreg} == true){
                        document.getElementById("homeMessage").innerHTML = notreg;
                    }
                    if (${passwrong} == true){
                        document.getElementById("homeMessage").innerHTML = wrongcode;
                    }

                    if (${userpass} == true || ${passpass} == true){
                        document.getElementById("homeMessage").innerHTML = userwrong;
                    }

                    if (${passsent} == true){
                        document.getElementById("homeMessage").innerHTML = passemailed;
                    }

                    if (${newdetails} == true){
                        document.getElementById("homeMessage").innerHTML = changedetails;
                    }

                    $("#email").on('input', function() {
                        if ($(this).val().length >= 40) {
                            document.getElementById("manyemail").style.display = "block";
                        } else{
                            document.getElementById("manyemail").style.display = "none";
                        }
                    });

                    var $input = $('input')
                    $input.keyup(function(e) {
                        var max = 40;
                        if ($input.val().length > max) {
                            $input.val($input.val().substr(0, max));
                        }
                    });

                    $("#password").on('input', function() {
                        if ($(this).val().length >= 20) {
                            document.getElementById("manypassword").style.display = "block";
                        } else{
                            document.getElementById("manypassword").style.display = "none";
                        }
                    });

                    function showHome(){
                        document.getElementById("home").style.display = "block";
                        document.getElementById("home1").className = "active";
                        document.getElementById("rankings").style.display = "none";
                        document.getElementById("rankings1").className = "";
                        document.getElementById("about").style.display = "none";
                        document.getElementById("about1").className = "";
                    }
                    function showRankings(){
                        document.getElementById("home").style.display = "none";
                        document.getElementById("home1").className = "";
                        document.getElementById("rankings").style.display = "block";
                        document.getElementById("rankings1").className = "active";
                        document.getElementById("about").style.display = "none";
                        document.getElementById("about1").className = "";
                    }
                    function showAbout(){
                        document.getElementById("home").style.display = "none";
                        document.getElementById("home1").className = "";
                        document.getElementById("rankings").style.display = "none";
                        document.getElementById("rankings1").className = "";
                        document.getElementById("about").style.display = "block";
                        document.getElementById("about1").className = "active";
                    }
        </script>
        </html>`)
        regagain = false;
        regcompleted = false;
        isntreg = false;
        passwrong = false;
        userpass = false;
        passpass = false;
        newdetails = false;
    })
    }catch(error){
        console.log(error);
    }
});

app.get('/registration', (req, res)=>{
    try{

        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Real-Time Quiz App</title>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
            crossorigin="anonymous">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            
            <style>

                body {
                    text-align: center;
                    background-color: powderblue;
                }

                form {
                    display: inline-block;
                }

                h2 {
                    text-align: center;   
                    color: white; 
                    font-family: Fantasy;
                }

                input{
                    text-align:center;
                 }

                 .topnav {
                 background-color: #333;
                 overflow: hidden;
                 position: sticky;
                 }

                 .topnav a {
                 float: left;
                 color: #f2f2f2;
                 text-align: center;
                 padding: 24px 5%;
                 text-decoration: none;
                 font-size: 17px;
                 }

                 .topnav a.active {
                 background-color: #04AA6D;
                 color: white;
                 width: 25%;
                 }

                 .login  {
                    background-color: #0057fc;
                    color: white;   
                }

            </style>
        </head>
        <body>
        <div class="topnav fixed-top">
            <a href="/" style="width: 100%; background-color: black;"><h2>&#9200 REAL-TIME QUIZ</h2></a>
        </div>
        <div id="disclaimer" style="margin-left: 10%; margin-right: 10%;  text-align: justify;text-justify: inter-word; display:none;">
            <h3 style="margin-top: 3%; text-align: center;">DATA PROTECTION</h3><br>
            By pressing the Submit Button you agree to your data being used for the purpose of my university project. This app has
            been designed to eventually help people that have difficulty with their memory. Your
            user name, password, email address and the record of your attempts at this quiz will be stored in a database. Your data will be
            used to analyse how effective the application is at improving memory, and will only be used to prepare a
            university project report and for no other purpose. Personal information such as your password, name and email address will be 
            anonymised and not linked to you directly in any way when referred to in my research report. No marketing agencies, governing bodies 
            or any other outside organisation will be provided access to your data. The only people who have access to your data will be the 
            person directly involved in the research for this university project and noone else. Your participation in this project is entirely 
            voluntary, and you can choose to be removed from the database and project report by emailing me at cy1yates@gmail.com by 15 August 2021.
            
        </div>
            <div id= "form" style="padding-top: 1%;">
                        <div id="form1">
                        <h4>Step 1 - Enter Details</h4>
                        </div><br>
                        <form action="/adduser" method="POST">
                            <div>
                            <label for="email" id="manyemail" style="color: red; display: none;"><b>Max 40 Email Characters</b></label>
                            </div>
                            <div id="form2">
                            <input type="email" name="email" id="email" maxlength="40" placeholder='Enter Email Address' style="margin-left: 10px 
                            font-size: 18pt; height: 30px; width:260px;" required><br>
                            </div>
                            <div>
                            <label for="nickname" id="manynickname" style="color: red; display: none; margin-bottom: -10px;"><b>Max 14 Name Characters</b></label>
                            </div>
                            <div id="form3">
                            <input type="text" name="nickname" id="nickname" maxlength="14" placeholder='Enter Your Name' style="margin-left: 10px 
                            font-size: 18pt; height: 30px; width:260px;margin-top: 5%;" required><br> 
                            </div>
                            <div>
                            <label for="password" id="manypassword" style="color: red;display: none;"><b>Max 20 Password Characters</b></label>
                            </div>
                            <div id="form4">
                            <input type="password" name="password" id="password" maxlength="20" placeholder='Enter Your Password' style="margin-left: 
                            5px font-size: 18pt; height: 30px; width:260px;margin-top: 5%;" required><br>
                            </div>
                            <div id="form5">
                            <input type="password" name="password_confirm" id="password_confirm" maxlength="20" placeholder='Re-Enter Your Password' 
                            style="margin-left: 5px font-size: 18pt; height: 30px; width:260px;margin-top: 5%;" 
                            oninput="check(this)" required><br>
                            </div>
                            <script language='javascript' type='text/javascript'>
                                function check(input) {
                                    if (input.value != document.getElementById('password').value) {
                                        input.setCustomValidity('Password Must be Matching.');
                                    } else {
                                        // input is valid -- reset the error message
                                        input.setCustomValidity('');
                                    }
                                }
                            </script>
                            <div id="button" class="row justify-content-center" style="display:none;">
                                <button for="form" type="submit" class="btn btn-primary btn-block" style="font-size: 18pt; width:300px;">Agree and Register</button>
                            </div><br>    
                                     
                        </form>
                    </div>
                    <div id="button2" class="row justify-content-center">
                        <button type="submit" class="btn btn-primary btn-block" onclick="step2();" style="height: 12%;font-size: 18pt; width:100%;position: 
                        absolute; bottom:0;margin-right:20%;margin-left:20%;">Go to Step 2</button>
                    </div><br>                            
                        
              <script>
              var $input = $('input')
                    $input.keyup(function(e) {
                        var max = 40;
                        if ($input.val().length > max) {
                            $input.val($input.val().substr(0, max));
                        }
                    });

              $("#email").on('input', function() {
                if ($(this).val().length >= 40) {
                    document.getElementById("manyemail").style.display = "block";
                } else{
                    document.getElementById("manyemail").style.display = "none";
                }
            });
   
            $("#password").on('input', function() {
                if ($(this).val().length >= 20) {
                    document.getElementById("manypassword").style.display = "block";
                } else{
                    document.getElementById("manypassword").style.display = "none";
                }
            });

            $("#nickname").on('input', function() {
                if ($(this).val().length >= 14) {
                    document.getElementById("manynickname").style.display = "block";
                } else{
                    document.getElementById("manynickname").style.display = "none";
                }
            });

            function step2(){
                document.getElementById("form1").style.display = "none";
                document.getElementById("form2").style.display = "none";
                document.getElementById("form3").style.display = "none";
                document.getElementById("form4").style.display = "none";
                document.getElementById("form5").style.display = "none";
                document.getElementById("button2").style.display = "none";
                document.getElementById("disclaimer").style.display = "block";
                document.getElementById("button").style.display = "block";
            }
              </script>
        </body>
        </html>`)
    
    }catch(error){
        console.log(error);
    }
});

var register = "";

app.post('/adduser', (req, res)=>{
    try {
        pool.connect(async(error,client,release)=>{
            let resp = await client.query(`SELECT name, useremail from users`)

            registeragain = false;

            nickName = req.body.nickname;

            for (i=0;i<resp.rows.length;i++){
                if(req.body.email == resp.rows[i].useremail){
                    registeragain = true;
                   
                } if (req.body.nickname == resp.rows[i].name) {
                    registeragain = true;                 
                }
            }  
            if (registeragain == true) {
                client.release();
                regagain = true;
                res.redirect('/')
            } else{
                let addregister = await client.query(`insert into users (useremail, name, password) values ($1, $2, $3)`, [(req.body.email), (req.body.nickname), (req.body.password)]);
                client.release();
                regcompleted = true;
                res.redirect('/');
            }    
        })
        register = '';

    }catch(error){
        console.log(error);
    }
});

app.get('/forgotten/password', (req, res)=>{
    try{
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Real-Time Quiz App</title>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
            crossorigin="anonymous">
            <script src='quiz.js'></script>
        
            <style>
                body {
                    text-align: center;
                    background: powderblue;
                }

                form {
                    display: inline-block;
                }

                h1 {
                    text-align: center;    
                }

                input{
                    text-align:center;
                 }
                    .topnav {
                    background-color: #333;
                    overflow: hidden;
                    }

                    .topnav a {
                    float: left;
                    color: #f2f2f2;
                    text-align: center;
                    padding: 24px 5%;
                    text-decoration: none;
                    font-size: 17px;
                    }

                    .topnav a.active {
                    background-color: #04AA6D;
                    color: white;
                    }

                    .login  {
                        background-color: #0057fc;
                        color: white;   
                    }
            </style>
        </head>
        <body>
        <div class="topnav">
            <a href="/" onclick='showHome();' style="width: 100%; background-color: black;"><h1>&#9200 RealTime Quiz</h1></a>
        </div>
            <div style="padding-top: 5%;">
                   
                        <h4>Get Password Reminder</h4><br>
                        <form action="/get/password" method="POST">

                            <input type="email" name="email" id="email" maxlength="40" placeholder='Enter Email Address' style="margin-left: 10px font-size: 18pt; height: 40px; width:260px;" required><br><br> 
                            <div style="width:250px;" align="center">
                                <button type="submit" class="btn btn-block login" style="font-size: 18pt; width:260px;">Retrieve Password</button>
                            </div><br>                            
                        </form>
                    </div>
        </body>
        </html>`)
    
    }catch(error){
        console.log(error);
    }
});

app.post('/get/password', async(req,res)=>{

    try{
        pool.connect(async(error,client,release)=>{
            let checkpassword = await client.query(`select password from users where useremail = '${req.body.email}'`);

            if (checkpassword.rows.length > 0){
                var transporter = nodemailer.createTransport({
                    service: 'outlook',
                    auth: {
                      user: 'real_time_quiz@outlook.com',
                      pass: 'Realtimequiz'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'real_time_quiz@outlook.com',
                    to: `${req.body.email}`,
                    subject: 'Forgotten Password',
                    text: `Your Password is: ${checkpassword.rows[0].password}`
                  };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } 
                  });
                client.release();
                passsent = true;
                res.redirect('/')
            } 
        })
    }catch(error){
        console.log(error);
    }
})

app.post('/info/add', async (req, res)=>{
    nickName = "";
    userEmail = "";
    var userexists = 0;
    var passwordexists = false;

    try {
        pool.connect(async(error,client,release)=>{
            let checkuser = await client.query(`select * from users`);

            for (i=0;i<checkuser.rows.length;i++){

                if(checkuser.rows[i].useremail == req.body.email && checkuser.rows[i].password == req.body.password){
                    userexists = 0;
                    passwordexists = true;
                    break
                }
                else if (checkuser.rows[i].useremail == req.body.email && checkuser.rows[i].password != req.body.password){
                    userexists = 0;
                    passwordexists = false;
                    break
                } else {
                    userexists = 1;
                    
                } 
            }

            let findemail = await client.query(`select * from users, leaderboard where leaderboard.nickname
            = users.name and users.useremail = '${req.body.email}'`);

            if (userexists == 1){
                client.release();
                isntreg = true;
                res.redirect('/')
            }else if (passwordexists == false){
                client.release();
                passwrong = true;
                res.redirect('/')
            }else if (findemail.rows.length > 0){
                nickName += findemail.rows[0].name;
                userEmail += findemail.rows[0].useremail;
                client.release();
                res.redirect('/user/profile');
            } else{
                pool.connect(async (error, client, release)=>{
                    var notontable = await client.query(`select * from users`);
                    var lengthnoton = notontable.rows.length;
                    nickName += notontable.rows[lengthnoton - 1].name;
                    userEmail += notontable.rows[lengthnoton - 1].useremail;
                    client.release();
                    res.redirect('/user/profile');
                })
            }
        })
    }catch(error){
        console.log(error);
    }
})

app.get('/user/profile', async(req, res) => {

    try {
        list = [];
        userChoice=[];
        firstchoice = [];
        correctchoice = [];
        secondchoice = [];
        arr = [];
        counts = 0;
        var status = "";
        
        pool.connect(async (error, client, release)=>{

            let leader = await client.query(`select * from leaderboard where nickname = '${nickName}' order by attemptnumber asc`);
            var getleader = "";

            for (i = 0; i < leader.rows.length; i++) {
                getleader+= '<tr>';
                getleader+= '<td style="width: 35%">' + '<b>' + 'Attempt' + ' ' + leader.rows[i].attemptnumber + '</b>' + '</td>';
                getleader+= '<td style="width: 35%">' + '<b>' + leader.rows[i].date + '</b>' + '</td>';
                getleader+= '<td style="width: 35%">' + '<b>' + leader.rows[i].numbercorrect + '/20' + '</b>' + '</td>';
                getleader+= '</tr>';
        } if(leader.rows.length < 15){
            for (i=0; i<15; i++) {
                getleader+= '<tr height="40px">';
                getleader+= '<td style="width: 35%">' + '</td>';
                getleader+= '<td style="width: 35%">' + '</td>';
                getleader+= '<td style="width: 35%">' + '</td>';
                getleader+= '</tr>';
            }
        }
            
        if (leader.rows.length <= 1){
            status += '<div style="text-align: center;">';
            status += '<h1>&#128373</h1><h4>BEGINNER</h4><br><br><h5 style="text-align: center;">Your Journey is just beginning.<br><br>';
            status += 'Good luck!</h5></div>';
        }

        else if ((leader.rows[leader.rows.length-1].improvement) > (leader.rows[leader.rows.length-2].improvement)){
            status += '<div style="text-align: center;"><h1>&#128077;&#127999; &#127942';
            status += '&#x1F44D</h1><h4>IMPROVER</h4><br><br><h5 style="text-align: center;">Your Memory is Improving. Keep Going!</h5><br></div>';
        }
            
        else if ((leader.rows[leader.rows.length-1].improvement) < (leader.rows[leader.rows.length-2].improvement)) {
            status += '<div style="text-align: center;">';
            status += '<h1>&#128078 &#128530 &#128078;&#127998;</h1><br><h4>POORER</h4><br><br><h5 style="text-align: center;">';
            status += 'Keep playing to improve your memory.</h5><br></div>';
        } 
        
        else if ((leader.rows[leader.rows.length-1].improvement) < (leader.rows[leader.rows.length-2].improvement) && leader.rows[leader.rows.length-2].improvement == 20){
            status += '<div style="text-align: center;">';
            status += '<h1>&#128580 &#129335 &#128580;</h1><br><h4>STEADY</h4><br><br><h5 style="text-align: center;">';
            status += 'Your Memory has remained consistent.<br><br>Keep Going to Maintain your Memory.</h5><br></div>';
        }
        else{
            status += '<div style="text-align: center;">';
            status += '<h1>&#128580 &#129335 &#128580;</h1><br><h4>STEADY</h4><br><br><h5 style="text-align: center;">';
            status += 'Your Memory has remained consistent.<br><br>Play more to improve further.</h5><br></div>';
        }
        client.release();

            res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Real-Time Quiz App</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
                crossorigin="anonymous">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                <script src="https://kit.fontawesome.com/758fbfa7b4.js" crossorigin="anonymous"></script>

                <style>

                body{
                    background-color:powderblue;
                }

                p {
                    text-align: center;   
                }
                h5 {
                    text-align: center;   
                    color: #34282C; 
                    font-family: Fantasy;
                }

                h4 {
                    text-align: center;   
                }

                th {
                    text-align: center;
                }

                .achievements-wrapper { 
                    height: 100%;
                    width: 100%; 
                    overflow-y: auto;
                    text-align: center;
                    position: fixed;
                }

                 th {
                    background: white;
                  }

                .topnav {
                background-color: #333;
                overflow: hidden;
                position: sticky;
                top: 0px;  
                }

                .topnav a {
                float: left;
                color: #f2f2f2;
                text-align: center;
                padding: 24px 5%;
                text-decoration: none;
                font-size: 17px;
                }

                .topnav a.active {
                background-color: #04AA6D;
                color: white;
                }

                .login  {
                    background-color: black;
                    color: white;   
                }

                </style>
            </head>
    
            <body>
            <div class="topnav">
            <a href="/" onclick='showHome();' style="width: 100%; background-color: black;"><h2>&#9200 RealTime Quiz</h2></a>
            <a id="status1" href="#status" onclick='showStatus();' class="active"  style="width: 33%;">Status</a>
            <a id="history1" href="#history" onclick="showHistory();" style="width: 33%;">Attempts</a>
            <a id="account1" href="#account" onclick="showAccount();" style="width: 33%;">Account</a>
        </div>
        <div id="status">
        <br>
                ${status}
            <form action="/info/get" method="GET">                          
                <div class="row justify-content-center">
                    <button type="submit" class="btn btn-primary btn-block" style="padding-top: 15px !important;padding-bottom: 55px !important;font-size: 20pt; width: 100%; height: 10%; position: absolute; bottom:0;">Play the Quiz Now!</button>
                </div><br>                            
            </form>
        </div>
            
        <div id="history" class="span3 achievements-wrapper" style="display:none;">
            <table class="table table-striped table-light">
                <tbody>
                    ${getleader}
                </tbody>
            </table>
         </div>

         <div id="account" style="text-align:center; display: none;"><br>
         <h6 style="text-align: center;">${nickName}<br>Account Area </h6>

         <div class="row justify-content-center" id="typeuser">
 
         <form action="/change/user" method="POST">
             <div>
             <div>
             <label for="nickname" id="manynickname" style="color: red; display: none; margin-bottom: -10px;"><b>Max 14 Name Characters</b></label>
             </div>
             <input type="text" name="nickname" id="nickname" maxlength="14" placeholder='Enter New Username' style="margin-left: 10px font-size: 6pt; height: 28px; width:260px;margin-top: 5%; text-align: center;" required><br> 
             <div>
             <label for="password" id="manypassword" style="color: red;display: none;"><b>Max 20 Password Characters</b></label>
             <div>
             <input type="password" name="password" id="password" maxlength="20" placeholder='Enter Your Password' style="margin-left: 5px font-size: 6pt; height: 28px; width:260px;margin-top: 5%;text-align: center;" required><br>
             
             <div style="width:250px;" align="center">
                 <button type="submit" class="btn btn-block login" style="font-size: 12pt; width:260px; height: 38px;margin-top: 5%;">Update Username</button>
             </div>                  
         </form>
     </div>

     <div class="row justify-content-center" id="typepassword" style="padding-top: 2%;">
 
         <form action="/change/password" method="POST">
             <div>
             <div>
             <label for="password" id="manypassword" style="color: red;text-align: center; display: none;"><b>Max 20 Password Characters</b></label>
             <div>
             <input type="password" name="newpassword" id="newpassword" maxlength="20" placeholder='Enter New Password' style="margin-left: 5px font-size: 6pt; height: 28px; width:260px;margin-top: 5%;text-align: center;" required><br>
             <input type="password" name="password" id="password" maxlength="20" placeholder='Enter Old Password' style="margin-left: 5px font-size: 6pt; height: 28px; width:260px;margin-top: 5%;text-align: center;" required><br>
             
             <div style="width:250px;" align="center">
                 <button type="submit" class="btn btn-block login" style="font-size: 12pt; width:260px; height: 38px;margin-top: 5%;">Update Password</button>
             </div><br>                   
         </form>
     </div>
     </div>
     <script>
            var $input = $('input')
                $input.keyup(function(e) {
                    var max = 40;
                    if ($input.val().length > max) {
                        $input.val($input.val().substr(0, max));
                    }
                });

            $("#email").on('input', function() {
            if ($(this).val().length >= 40) {
                document.getElementById("manyemail").style.display = "block";
            } else{
                document.getElementById("manyemail").style.display = "none";
            }
            });

            $("#password").on('input', function() {
            if ($(this).val().length >= 20) {
                document.getElementById("manypassword").style.display = "block";
            } else{
                document.getElementById("manypassword").style.display = "none";
            }
            });

            $("#nickname").on('input', function() {
            if ($(this).val().length >= 14) {
                document.getElementById("manynickname").style.display = "block";
            } else{
                document.getElementById("manynickname").style.display = "none";
            }
            });

            function showStatus(){
                document.getElementById("status").style.display = "block";
                document.getElementById("status1").className = "active";
                document.getElementById("history").style.display = "none";
                document.getElementById("history1").className = "";
                document.getElementById("account").style.display = "none";
                document.getElementById("account1").className = "";
            }
            function showHistory(){
                document.getElementById("status").style.display = "none";
                document.getElementById("status1").className = "";
                document.getElementById("history").style.display = "block";
                document.getElementById("history1").className = "active";
                document.getElementById("account").style.display = "none";
                document.getElementById("account1").className = "";
            }
            function showAccount(){
                document.getElementById("status").style.display = "none";
                document.getElementById("status1").className = "";
                document.getElementById("history").style.display = "none";
                document.getElementById("history1").className = "";
                document.getElementById("account").style.display = "block";
                document.getElementById("account1").className = "active";
            }
        </script>         
        </body>
        </html>`);
        }); 

    } catch(error){
        console.log(error);
    }
});

app.post('/change/user', (req, res)=>{
    try{
        pool.connect(async(error,client,release)=>{
            let checkuser = await client.query(`select * from users`);
            var passwordmatch = 0;
            
            for (i=0;i<checkuser.rows.length;i++){

                if(checkuser.rows[i].name == nickName && checkuser.rows[i].password == req.body.password){
                    passwordmatch ++;
                }
            }
            if (passwordmatch == 1){
                let user = await client.query(`UPDATE users SET name = '${req.body.nickname}' WHERE name = '${nickName}'`)
                let user2 = await client.query(`UPDATE leaderboard SET nickname = '${req.body.nickname}' WHERE nickname = '${nickName}'`)
                newdetails = true;
                res.redirect('/')
            } else {
                userpass = true;
                res.redirect('/')
            }
            client.release();
        })
       newdetails = false;
    } catch(error){
        console.log(error)
    }
}) 

app.post('/change/password', (req, res)=>{
    try{
        pool.connect(async(error,client,release)=>{
            let checkuser = await client.query(`select * from users`);
            var passwordmatch = 0;
            
            for (i=0;i<checkuser.rows.length;i++){

                if(checkuser.rows[i].name == nickName && checkuser.rows[i].password == req.body.password){
                    passwordmatch ++;
                }
            }

            if (passwordmatch == 1){
                let user = await client.query(`UPDATE users SET password = '${req.body.newpassword}' WHERE name = '${nickName}'`)
                client.release();
                newdetails = true;
                res.redirect('/')
            } else {
                client.release();
                passpass = true;
                res.redirect('/')
            }
        })
       newdetails = false;
    } catch(error){
        console.log(error)
    }
}) 

app.get('/info/get', (req, res)=>{

    list = [];
    firstchoice = [];
    correctchoice = [];
    secondchoice = [];

    try{
    pool.connect(async (error, client, release)=>{
        let resp = await client.query(`SELECT * FROM questions`);

        let choices = [];

        for (i = 0; i < 20; i++) {
            x = Math.floor(Math.random() * (1200 - 1 + 1)) + 1;
            choices.push(x);
            list.push(resp.rows[x].question)
        }
        for (i = 0; i < 20; i++) {
            firstchoice.push(resp.rows[choices[i]].option1)
        }

        for (i = 0; i < 20; i++) {
            secondchoice.push(resp.rows[choices[i]].option2)
        }

        for (i = 0; i < 20; i++) {
            correctchoice.push(resp.rows[choices[i]].correctanswer)
        }

        var j = "";

        for (i = 0; i < list.length; i++) {
            
            arr = [];
            for (t = 0; t < 1; t++) {
                arr.push(correctchoice[i]);

                j+=`<div id=${i} class="my-container" style="margin-left: -3.2em; margin-right: -1.2em; display:none">`;
                j+=`<h4 style="margin-left: 1.2em;">Question ${i+1}<br></h4><p style="font-size: 20px;margin-left: 1.4em;">${list[i]}</p>`+'<br>';
                j+=`<label class="container"><h5 style="margin-left: -0.8em;">Answer: ${arr[0]}</h5>
                </label><br>`;
                j+=`<a href="#" onclick="fastForward(${i})">><h4 style="margin-left: 1.2em;">Next >>></h4></a>`;
                j+=`</div>`; 
            };
        };

        var q = "";
            
        for (i = 0; i < 20; i++) {
                
            arr2 = [];
            for (t = 0; t < 1; t++) {
                arr2.push(firstchoice[i]);
                arr2.push(secondchoice[i]);
                arr2.push(correctchoice[i]);

                shuffle(arr2);

                q+=`<div id=${21+i} class="my-container" style="margin-left: -3.2em; margin-right: -1.2em; display:none">`;
                q+=`<h4 style="margin-left: 1.2em;">Question ${i+1}</h4><p style="font-size: 20px;margin-left: 1.4em;">${list[i]}</p>`+'<br>';
                q+=`<label class="container" style="margin-left: 1.8em;"><p>${arr2[0]}</p>
                <input type="checkbox" id="checkvalue2" name="option" value='${arr2[0]}' onclick="seeNext(${21+i});">
                <span class="checkmark"></span>
                </label>`;
                q+=`<label class="container" style="margin-left: 1.8em;"><p>${arr2[1]}</p>
                <input type="checkbox"  id="checkvalue2" name="option" value='${arr2[1]}' onclick="seeNext(${21+i});">
                <span class="checkmark"></span>
                </label>`;
                q+=`<label class="container" style="margin-left: 1.8em;"><hp>${arr2[2]}</hp>
                <input type="checkbox"  id="checkvalue2" name="option" value='${arr2[2]}' onclick="seeNext(${21+i});">
                <span class="checkmark"></span>
                </label>`;
                q+=`</div>`;

            };
        };
        
        client.release();

        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
            crossorigin="anonymous">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            <script>
            $('.container').click(function() {
                $("#checkvalue").prop("checked", true);
              });
            </script>

            <style>
              
            body {
                background-color:powderblue;
            }

            .my-container {
                height: 340px;
                justify-content: space-around;
                margin: 20px 0px 0px 20px;
            }

            .container {
                display: block;
                position: relative;
                padding-left: 50px;
                padding-right: 50px;
                margin-bottom: 18px;
                width: 100%;
                cursor: pointer;
                font-size: 18px;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                margin: 10px 20px 20px -5px;
              }
            
            .container input {
              position: absolute;
              opacity: 0;
              cursor: pointer;
              height: 0;
              width: 0;
            }
            
            .checkmark {
              position: absolute;
              top: 0;
              left: 0;
              height: 25px;
              width: 25px;
              background-color: grey;
            }
            
            .container:hover input ~ .checkmark {
              background-color: #ccc;
            }
            
            .container input:checked ~ .checkmark {
              background-color: #2196F3;
            }
            
            .checkmark:after {
              content: "";
              position: absolute;
              display: none;
            }
            
            .container input:checked ~ .checkmark:after {
              display: block;
            }
            
            .container .checkmark:after {
              left: 9px;
              top: 5px;
              width: 5px;
              height: 10px;
              border: solid white;
              border-width: 0 3px 3px 0;
              -webkit-transform: rotate(45deg);
              -ms-transform: rotate(45deg);
              transform: rotate(45deg);
            }

            .jumbotron {
                height: 40px;
                padding-top: 25px !important;
                padding-bottom: 75px !important;
                margin: 0px 15px 30px 30px;
            }

            button {
                height: 50px;
                width: 290px;
                margin-top: 5%;
            }

            h2 {
                margin-left: 20%;
            }
            #myProgress {
                width: 100%;
                background-color: #ddd;
                vertical-align:middle;
                
              }
              
            #myBar {
                width: 0%;
                height: 40px;
                background-color: #04AA6D;
                text-align: center;
                vertical-align: middle;
                line-height: 35px;
                font-size: 25px;
                color: white;
              }
                    .topnav {
                    background-color: #333;
                    overflow: hidden;
                    }

                    .topnav a {
                    float: left;
                    color: #f2f2f2;
                    text-align: center;
                    padding: 24px 5%;
                    text-decoration: none;
                    font-size: 17px;
                    }

                    /* Add a color to the active/current link */
                    .topnav a.active {
                    background-color: #04AA6D;
                    color: white;
                    }
            </style>
        </head>
        <body>
        <div class="topnav">
        <a href="/" onclick='showHome();' style="width: 100%; background-color: black;"><h1>&#9200 RealTime Quiz</h1></a>
        
        </div>
                <div id="myProgress">
                <div id="myBar"></div>
             </div>
            <div id="checkvalue" class="container" style="width: 100%;">
            
            <form>
                <div id="form"><p style="color:purple;margin-left: -1.4em;"><b> Disappears in <span id="countdowntimer">5 </span> seconds</b></p>${j}</div>
                <div id="form2"><p style="color:purple;margin-left: -1.4em;display:none;"><b> Question Disappears in <span id="countdowntimer2">5 </span> Seconds</b></p></div>
            </form>
            </div>

            <div id="checkvalue2" class="container" ">
            
            <form action="/answers" method="POST">
            
            <div id="form">${q}</div>

            <div id="button2" style="display: none;"><br><br>
                <label for="answers"><h4>Press Button to See Results</h4></label><br>
                <button type="submit" id="answers" class="btn btn-primary btn-lg">Submit Answers</button>
            </div>
            </form>
            </div>
            <div id="button" style="display: none;margin-left: 5%;"><br><br>
                 
                    <label for="answers"><h4>Push Button Below to Begin</h4></label><br>
                    <button id="answers" class="btn btn-primary btn-lg" onclick="seeFirstofAll(21);">See the Questions</button>
                
                </div>
            <script>
            var width = 0;
            var length = 0;
            let downloadTimer;
            let downloadTimer2;
            let myTimeOut;
            let myTimeOut2;
            let timeleft = 5;

            function getQuestion(number) {
                myTimeOut = setTimeout(function(){
                    if (number != 19){
                        clearInterval(downloadTimer);
                        notnext = document.getElementById(number);
                        notnext.style.display = "none";
                        nextNumber = number + 1;
                        passnext = document.getElementById(nextNumber);
                        passnext.style.display = "block";   
                        nobutton = document.getElementById("button");
                        nobutton.style.display = "none";   
                        var elem = document.getElementById("myBar");
                        width += 5;
                        elem.style.width = width + "%";
                        elem.innerHTML = width + "%";
                        timeleft = 5;
                        timer(nextNumber);
                    }
                   
                }, 100);
            }

            function fastForward(number){
                timeleft = 0;
                console.log("fastForward")
                console.log(number);
                clearTimeout(myTimeOut);
                if (number < 19){
                    getQuestion(number);
                } else{
                    notnext = document.getElementById(number);
                    notnext.style.display = "none";
                    passnext = document.getElementById("button");
                    passnext.style.display = "block";  
                    document.getElementById("form").style.display = "none"; 
                }
                        
            }

            var size = document.getElementById("checkvalue");
            for(i=0; i<size.innerHTML.length; i++){
                if(i==0){
                    document.getElementById("button").style.display = "none";
                    document.getElementById(0).style.display = "block";
                    var elem = document.getElementById("myBar");
                    var width = 5;
                    elem.style.width = width + "%";
                    elem.innerHTML = width +  "%";
                    timer(0);
                } else{
                    document.getElementById(i).style.display = "none";
                }
            }        
            async function timer(number){
                clearTimeout(myTimeOut);
                console.log("timer started");
                downloadTimer = setInterval(function(){
                document.getElementById("countdowntimer").textContent = timeleft;
                if(number != 30 && timeleft == 0){
                    clearInterval(downloadTimer);
                    fastForward(number);
                } 
                timeleft -= 1;
            }, 1500);   
            }   

            async function seeFirstofAll(digit){
                document.getElementById("button").style.display = "none";
                seeFirst(digit);
            }
            function seeFirst(digit){
                if (digit == 21){
                    console.log("seeFirst digit is" + digit);
                    document.getElementById(digit).style.display = "block";
                    var elem = document.getElementById("myBar");
                    width = 5;
                    elem.style.width = width + "%";
                    elem.innerHTML = width + "%";
                    console.log("seeFirst != 40");
                } 
            }

            function seeNext(digit){
                setTimeout(function(){
                    if (digit != 40) {
                        document.getElementById(digit).style.display = "none";
                        passnext = document.getElementById("button");
                        passnext.style.display = "none";  
                        document.getElementById(digit+1).style.display = "block";
                        var elem = document.getElementById("myBar");
                        width += 5;
                        elem.style.width = width + "%";
                        elem.innerHTML = width + "%";
                        console.log("seeNext != 40");
                    } else if (digit == 40){
                        document.getElementById(digit).style.display = "none";
                        document.getElementById("button2").style.display = "block";
                        width += 10;
                        console.log("seeNext == 40");
                    }
                }, 100);
            }
                </script>
        </body>
        </html>`)
    })
    }catch(error){
        console.log(error);
    }
});

app.post('/answers', async(req, res) => {

    var oneoption = "";

    const body = (req.body.option);

    if(req.body.option[0].length == 1) {
        for(i=0;i<req.body.option.length; i++){
            oneoption += req.body.option[i]
        }
        userChoice.push(oneoption);
    } else{
        for (i=0; i < body.length; i++) {
            userChoice.push(body[i])
        };

    }
    var counts = 0;
    var difference = [];
    for (i=0; i < userChoice.length; i++) {
        for (p=0; p < correctchoice.length; p++){
            if (userChoice[i] == correctchoice[p]) {
                difference.push(userChoice[i]);
            }
        }
    }

    counts = difference.length;
    var j = "";

    for (i = 0; i < userChoice.length; i++) {

        j+='<br>';
        j+=`<hr style="height:1px;border:none;color:#333;background-color:#333;">`;
        j+=`<div class="my-container" style="margin-left: -10px;">`;
        j+=`<h3 style="margin-left: -10px;">Question ${i+1}</h3>`;
        j+= `<h4 style="margin-left: -10px;">${list[i]}</h4>`+'<br>';
        
        if(userChoice[i]==correctchoice[i]){
            j+=`<h3 style="margin-left: -10px; color:green;">CORRECT</h3>`;
            j+=`<label class="container" style="margin-left: -10px;">${firstchoice[i]}
            <input type="checkbox" id="correct1" name="option" value='${firstchoice[i]}'>
            <span class="checkmark"></span>
            </label>`;
            j+=`<label class="container" style="margin-left: -10px;">${secondchoice[i]}
            <input type="checkbox"  id="correct2" name="option" value='${secondchoice[i]}'>
            <span class="checkmark"></span>
            </label>`;
            j+=`<label class="container" style="margin-left: -10px;">${correctchoice[i]}
            <input type="checkbox" checked="checked"  id="correct3" name="option" value='${correctchoice[i]}'>
            <span class="checkmark"></span>
            </label>`;
            j+=`<br></div>`;
        } else if(userChoice[i]==firstchoice[i]){
            j+=`<h3 style="margin-left: -10px;color:red;">INCORRECT</h3>`
            j+=`<label class="container2" style="margin-left: -10px;">${firstchoice[i]}
            <input type="checkbox" checked="checked" id="incorrect1" name="option" value='${firstchoice[i]}'>
            <span class="checkmark2"></span>
            </label>`;
            j+=`<label class="container" style="margin-left: -10px;">${secondchoice[i]}
            <input type="checkbox"  id="incorrect2" name="option" value='${secondchoice[i]}'>
            <span class="checkmark"></span>
            </label>`;
            j+=`<label class="container" style="margin-left: -10px;">${correctchoice[i]}
            <input type="checkbox" checked="checked" id="incorrect3" name="option" value='${correctchoice[i]}'>
            <span class="checkmark"></span>
            </label>`;
            j+=`</div>`;
        }
        else{
            j+=`<h3 style="margin-left: -10px; color:red;">INCORRECT</h3>`
            j+=`<label class="container" style="margin-left: -10px;"">${firstchoice[i]}
            <input type="checkbox" id="incorrect1" name="option" value='${firstchoice[i]}'>
            <span class="checkmark"></span>
            </label>`;
            j+=`<label class="container2" style="margin-left: -10px;">${secondchoice[i]}
            <input type="checkbox" checked="checked" id="incorrect2" name="option" value='${secondchoice[i]}'>
            <span class="checkmark2"></span>
            </label>`;
            j+=`<label class="container" style="margin-left: -10px;">${correctchoice[i]}
            <input type="checkbox" checked="checked" id="incorrect3" name="option" value='${correctchoice[i]}'>
            <span class="checkmark"></span>
            </label>`;
            j+=`</div>`;
        }   
    };

    try {
        pool.connect(async (error, client, release)=>{

            let desp = await client.query(`select * from leaderboard where 
            leaderboard.nickname = '${nickName}'`);

            var firstattempt = 0; 
            var base = 0; 
            var howimproved = 0;

            if (desp.rows.length < 1) {
                userAttempt = 1;
                howimproved = 0;
            } else {
                userAttempt = desp.rows.length + 1;
                firstattempt = desp.rows[0].numbercorrect;
                base = counts - firstattempt;
                howimproved = Math.round((base / firstattempt)*100);
            }

            let resp = await client.query(`insert into leaderboard (attemptnumber, nickname, date, numbercorrect, improvement) values ($1, $2, $3, $4, $5)`, [(userAttempt), (nickName), (userDate), (counts), (howimproved)]);

            client.release();

            res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Real-Time Quiz App</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
                crossorigin="anonymous">
                <style>
                body{
                    background-color:powderblue;
                }
                h1 {
                    text-align: center;    
                    padding-top: 15px !important;
                }

                th {
                    text-align: center;
                }

                .my-container {
                    height: 440px;
                    justify-content: space-around;
                    margin: 20px 0px 0px 20px;
                }
    
                .container {
                  display: block;
                  position: relative;
                  padding-left: 50px;
                  padding-right: -50px;
                  margin-bottom: 18px;
                  cursor: pointer;
                  font-size: 22px;
                  -webkit-user-select: none;
                  -moz-user-select: none;
                  -ms-user-select: none;
                  user-select: none;
                  margin: 20px -20px 20px 20px;
                }
                
                .container input {
                  position: absolute;
                  opacity: 0;
                  cursor: pointer;
                  height: 0;
                  width: 0;
                }
                
                .checkmark {
                  position: absolute;
                  top: 0;
                  left: 0;
                  height: 25px;
                  width: 25px;
                  background-color: grey;
                  
                }
                
                .container:hover input ~ .checkmark {
                  background-color: #ccc;
                }
                
                .container input:checked ~ .checkmark {
                  background-color: green;
                }
                
                .checkmark:after {
                  content: "";
                  position: absolute;
                  display: none;
                }
                
                .container input:checked ~ .checkmark:after {
                  display: block;
                }
                
                .container .checkmark:after {
                  left: 9px;
                  top: 5px;
                  width: 5px;
                  height: 10px;
                  border: solid white;
                  border-width: 0 3px 3px 0;
                  -webkit-transform: rotate(45deg);
                  -ms-transform: rotate(45deg);
                  transform: rotate(45deg);
                }
    
                .container2 {
                    display: block;
                    position: relative;
                    padding-left: 65px;
                    margin-bottom: -18px;
                    cursor: pointer;
                    font-size: 22px;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    margin: 20px -20px 20px 20px;
                  }
       
                  .container2 input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                    height: 0;
                    width: 0;
                  }
                  
                  .checkmark2 {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 25px;
                    width: 25px;
                    background-color: grey;
                    
                  }
                  
                  .container2:hover input ~ .checkmark2 {
                    background-color: #ccc;
                  }
                  
                  .container2 input:checked ~ .checkmark2 {
                    background-color: red;
                  }
                  
                  .checkmark2:after {
                    content: "";
                    position: absolute;
                    display: none;
                  }
                  
                  .container2 input:checked ~ .checkmark2:after {
                    display: block;
                  }
                  .container2 .checkmark2:after {
                    left: 9px;
                    top: 5px;
                    width: 5px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 3px 3px 0;
                    -webkit-transform: rotate(45deg);
                    -ms-transform: rotate(45deg);
                    transform: rotate(45deg);
                  }
                
                .jumbotron {
                    height: 100px;
                    padding-top: 15px !important;
                    padding-bottom: 105px !important;
                }
                .achievements-wrapper { 
                    height: 310px; 
                    overflow: auto; 
                }

                 th {
                    position: sticky;
                    top: 0px;  
                    background: black;
                  }
                  button {
                    height: 30px;
                    padding-top: 15px !important;
                    padding-bottom: 55px !important;
                }
              .topnav {
              background-color: #333;
              overflow: hidden;
              }
              .topnav a {
              float: left;
              color: #f2f2f2;
              text-align: center;
              padding: 24px 5%;
              text-decoration: none;
              font-size: 17px;
              }

              .topnav a.active {
              background-color: #04AA6D;
              color: white;
              }
                </style>
            </head>
            <body>
            <div class="topnav">
                    <a href="/" onclick='showHome();' style="width: 100%; background-color: black;"><h1>&#9200 RealTime Quiz</h1></a></div>
            <div id="showincorrect" class="container" style="display:none;">
            ${j}
            <form action="/user/profile" method="GET">
                <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-bottom: 180px;">Back To Profile</button>
                </form>  
            </div>
            <div id="takesurvey" class="row justify-content-center" style="display: none;text-align: center;">
            <div>
            <h2 style="text-align: center;">Questionnaire</h2></div><br>
            <form action="/survey" method="POST">
            <h6 id="question1" style="text-align: center;">How often have you played the quiz?</h6>
            <input type="radio" id="howoften" name="howoften" value="very often" required>
            <label for="howoften">Very Often</label>
            <input type="radio" id="howoften" name="howoften" value="often">
            <label for="howoften">Often</label>
            <input type="radio" id="howoften" name="howoften" value="occasionally">
            <label for="howoften">Occasionally</label>
            <input type="radio" id="howoften" name="howoften" value="rarely">
            <label for="howoften">Rarely</label><br><br>
            <h6 id="question2" style="text-align: center;">Have you used all the app's features?</h6>
            <input type="radio" id="usedfeatures" name="usedfeatures" value="yes" required>
            <label for="usedfeatures">Yes</label>
            <input type="radio" id="usedfeatures" name="usedfeatures" value="no">
            <label for="usedfeatures">No</label><br><br>
            <h6 id="question3" style="text-align: center;">Do you think this app will improve memory?</h6>
            <input type="radio" id="willimprove" name="willimprove" value="yes" required>
            <label for="willimprove">Yes</label>
            <input type="radio" id="willimprove" name="willimprove" value="no">
            <label for="willimprove">No</label><br><br>
            <h6 id="question4" style="text-align: center;">How old are you?</h6>
            <input type="radio" id="howold" name="howold" value="18 to 40" required>
            <label for="howold">18 to 40</label>
            <input type="radio" id="howold" name="howold" value="40 to 65">
            <label for="howold">40 to 65</label>
            <input type="radio" id="howold" name="howold" value="over 65">
            <label for="howold">Over 65</label><br><br>
            <h6 id="question5" style="text-align: center;">Is the app easy to use?</h6>
            <input type="radio" id="easyuse" name="easyuse" value="yes" required>
            <label for="easyuse">Yes</label>
            <input type="radio" id="easyuse" name="easyuse" value="no">
            <label for="easyuse">No</label><br><br>
            <h6 id="question6" style="text-align: center;">Is logging in easy to do?</h6>
            <input type="radio" id="logeasy" name="logeasy" value="yes" required>
            <label for="logeasy">Yes</label>
            <input type="radio" id="logeasy" name="logeasy" value="no">
            <label for="logeasy">No</label><br><br>
            <h6 id="question7" style="text-align: center;">Have you noticed any issues like time-lag?</h6>
            <input type="radio" id="timelag" name="timelag" value="yes" required>
            <label for="timelag">Yes</label>
            <input type="radio" id="timelag" name="timelag" value="no">
            <label for="timelag">No</label><br><br>
            <label for="explain"><h6 id="question8">How could the app be improved?</h6></label><br>
            <textarea id="explain" name="explain" rows="3" cols="40" required>
            </textarea><br><br>
            <button type="submit" class="btn btn-dark btn-block" style="font-size: 18pt; width:60%;margin-left:20%;">Submit Survey</button><br>
          </form>
            </div><br>

            <div id="showscore" class="row justify-content-center">
                <h3>Your Score is ${counts} out of 20</h3>
            </div><br>
            
            <div id="seebreakdown" class="row justify-content-center">
                <button class="btn btn-dark btn-block" onclick="incorrect()" style="font-size: 18pt; width:260px;">See Breakdown</button>
            </div><br>

            <div id="backprofile" class="row justify-content-center">
            <form action="/user/profile" method="GET">
                <button type="submit" class="btn btn-dark btn-block" style="font-size: 18pt; width:260px;">Back to Profile</button>         
            </form>  
            </div><br>

            <div id="showsurvey" class="row justify-content-center">
            <div class="text-center">
                <button type="submit" class="btn btn-dark btn-block" onclick="survey();" style="font-size: 18pt; width:260px;">
                Complete Survey</button>
            </div>   
            </div>
            <script>
            function survey(){
                document.getElementById("showscore").style.display = "none";
                document.getElementById("seebreakdown").style.display = "none";
                document.getElementById("backprofile").style.display = "none";
                document.getElementById("showsurvey").style.display = "none";
                document.getElementById("takesurvey").style.display = "block";
            }
            function incorrect(){
                document.getElementById("showscore").style.display = "none";
                document.getElementById("seebreakdown").style.display = "none";
                document.getElementById("backprofile").style.display = "none";
                document.getElementById("showsurvey").style.display = "none";
                document.getElementById("takesurvey").style.display = "none";
                document.getElementById("showincorrect").style.display = "block";
            }
            </script>
            </body>
            </html>`);
        }); 
    } catch(error){
        console.log(error);
    }
});

app.post('/survey', async (req, res)=>{
    
    if (2 > 1){
        var transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
              user: 'real_time_quiz@outlook.com',
              pass: 'Realtimequiz'
            }
          });
          var mailOptions = {
            from: 'real_time_quiz@outlook.com',
            to: `cy1yates@gmail.com`,
            subject: 'RealTime Quiz Survey',
            html: `
            <table style="width:100%; border: 1px solid black;">
            <tr>
              <td style="border: 1px solid black; width: 50%;">How often have you played the quiz?</td>
              <td style="border: 1px solid black;width: 50%;text-align: center;">${req.body.howoften}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; width: 50%;">Have you used all the app's features?</td>
              <td style="border: 1px solid black;width: 50%;text-align: center;">${req.body.usedfeatures}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; width: 50%;">Do you think this app will improve memory?</td>
              <td style="border: 1px solid black;width: 50%;text-align: center;">${req.body.willimprove}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; width: 50%;">How old are you?</td>
              <td style="border: 1px solid black;width: 50%;text-align: center;">${req.body.howold}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; width: 50%;">Is the app easy to use?</td>
              <td style="border: 1px solid black;width: 50%;text-align: center;">${req.body.easyuse}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; width: 50%;">Is logging in easy to do?</td>
              <td style="border: 1px solid black;width: 50%;text-align: center;">${req.body.logeasy}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; width: 50%;">Have you noticed any issues like time-lag?</td>
              <td style="border: 1px solid black;width: 50%;text-align: center;">${req.body.timelag}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; width: 50%;">How could the app be improved?</td>
              <td style="border: 1px solid black;width: 50%;text-align: center;">${req.body.explain}</td>
            </tr>
          </table>
            `
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } 
          });   
    }     
    res.redirect('/user/profile');
})

server.listen(process.env.PORT || 8080);
console.log(`Server listening on Port 8080 `);
