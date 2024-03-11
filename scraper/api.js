const express = require('express');
const app = express();
const {Pool} = require('pg');
const fetch = require('node-fetch');
app.use(express.json());

let pool = new Pool({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "realtime"
});

const port = 8070;

var count = 32;

async function start (){
    try {
        await pool.connect()
        await pool.query(`CREATE TABLE users(
            useremail VARCHAR,
            name VARCHAR,
            password VARCHAR,
            PRIMARY KEY(useremail)	
        )`)
        await pool.query(`CREATE TABLE questions(
            question VARCHAR,
            correctanswer VARCHAR,
            option1 VARCHAR,
            option2 VARCHAR,
            PRIMARY KEY(question)
        )`)
        await pool.query(`CREATE TABLE leaderboard(
            attemptnumber INT,
            nickname VARCHAR,
            date VARCHAR,
            numbercorrect INT,
            improvement INT,
            PRIMARY KEY(attemptnumber, nickname)	
        )`)
        await pool.query(`INSERT INTO users (useremail, name, password) values ('test1email', 'test1name', 'testpass')`)
        await pool.query(`INSERT INTO leaderboard (attemptnumber, nickname, date, numbercorrect, improvement) values (1, 'test1name', '2021-08-12', 5, 0)`)

        for (i=1; i<33; i++){
            console.log(`Countdown ${count}`);
            count--;
            for (p=0; p<3; p++){
                if (p==0){
                    await fetch(`https://opentdb.com/api.php?amount=50&category=${i}&difficulty=easy&type=multiple`).then(
                    
                    function(a){return a.json();}
                ).then(
                    async function(general){
                        for (t=0; t< general.results.length;t++) {
                            var first = general.results[t].question;
                            var second = general.results[t].correct_answer;
                            var third = general.results[t].incorrect_answers[0];
                            var fourth = general.results[t].incorrect_answers[1];
                            var sixth = await pool.query(`insert into questions (question, correctanswer, option1, option2) values ($1, $2, $3, $4)`, 
                            [(`${first}`), (`${second}`), (`${third}`), (`${fourth}`)]);
                        }
                    }
                    
                )
                }
                else if (p==1){
                    await fetch(`https://opentdb.com/api.php?amount=50&category=${i}&difficulty=medium&type=multiple`).then(
                    
                        function(a){return a.json();}
                    ).then(
                        async function(general){
                            for (t=0; t< general.results.length;t++) {
                                var first = general.results[t].question;
                                var second = general.results[t].correct_answer;
                                var third = general.results[t].incorrect_answers[0];
                                var fourth = general.results[t].incorrect_answers[1];
                                var sixth = await pool.query(`insert into questions (question, correctanswer, option1, option2) values ($1, $2, $3, $4)`, 
                                [(`${first}`), (`${second}`), (`${third}`), (`${fourth}`)]);
                            }
                        }
                        
                    )
                }
                else {
                    await fetch(`https://opentdb.com/api.php?amount=50&category=${i}&difficulty=hard&type=multiple`).then(
                    
                        function(a){return a.json();}
                    ).then(
                        async function(general){
                            for (t=0; t< general.results.length;t++) {
                                var first = general.results[t].question;
                                var second = general.results[t].correct_answer;
                                var third = general.results[t].incorrect_answers[0];
                                var fourth = general.results[t].incorrect_answers[1];
                                var sixth = await pool.query(`insert into questions (question, correctanswer, option1, option2) values ($1, $2, $3, $4)`, 
                                [(`${first}`), (`${second}`), (`${third}`), (`${fourth}`)]);
                            }
                        }
                        
                    )
                }
                
            }
        }
        console.log("Fetching Has Now Finished");
    }catch(error){
        console.log(error);
    }
} 


start();


app.listen(port, ()=>{
    console.log(`server started on port ${port}`);
})
