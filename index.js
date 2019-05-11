// Dependencies
var Twitter = require('twitter');
var config = require('./config.js');

var fs = require('fs');
var async = require('async');


// Pass config details to twitter
var bot = new Twitter(config);

// Params


var misspell_word = "";
var correct_word = "";

async function generate_line() {

	get_line('./words.csv', function(misspell, correct){
		misspell_word = misspell;
		correct_word = correct;

		console.log("Params Words are: ", misspell_word, correct_word);
	})
	return misspell_word, correct_word;
}

function generate_text(word) {
	var posts = [
		" um it's actualy spelled " + word + "*",
		" I believe the spelling is " + word + "*",
		" you mean " + word + "*?",
		" did you mean " + word + "*?",
		" I think you meant " + word + "*",
		" it's spelled " + word + "*",
		" actualy it's " + word + "*", 
		" you misspelled " + word + "*",
		" um I believe it's spelled " + word + "*",
		" it's " + word + "*", 
		" the spelling is " + word + "*", 
		" it's actualy " + word + "*", 
	]
	return posts[Math.floor(Math.random() * posts.length)]
}

async function get_the_tweets() {
	await(generate_line());

	console.log("Tweets Words are: ", misspell_word, correct_word);

	var params = {
	  q: "agreed",
	  result_type: "mixed",
	  multi:true,
	  lang: 'en',
	  // Ignore tweets that are replies
	  in_reply_to_status_id: null,
	  retweeted: false

	}

  	bot.get('search/tweets', params, function (err, data, response) {

	    if (!err) {
	    	var data_statuses_n = Math.floor(Math.random() * data.statuses.length);
	        console.log("Pick index: ", data_statuses_n);

	    	var tweet_id = data.statuses[data_statuses_n].id_str;
	    	var tweet_text = data.statuses[data_statuses_n].text;
	    	var tweet_author = data.statuses[data_statuses_n].user.screen_name;

	    	console.log("Tweet ID: " + tweet_id);
	    	console.log("Tweet text: " + tweet_text);
	    	console.log("Tweet author: " + tweet_author);

	    	var post_author = "@" + tweet_author;
	    	var post_text = post_author + generate_text("aggreed");

	    	console.log(post_text);

	        bot.post('statuses/update', 
	        	{ status: post_text, 
	        		in_reply_to_status_id: tweet_id,
	        		auto_populate_reply_metadata: "true"
	        	}, function(err, response){
			          if(err){
			            console.log(err[0].message);
			          }
			          else{
			            console.log("tweeted");
			          }
	        		});
	      
	    } else {
	      console.log(err);
	    }
  	});
}

async function get_line(filename, callback) {
	console.log("get-line");

    fs.readFile(filename, function (err, data) {
      if (err) throw err;

      var lines = data.toString('utf-8').split("\n");

      var rand_line_num = Math.floor(Math.random() * lines.length)
      console.log(rand_line_num);

      var rand_line = lines[+rand_line_num];
      console.log(rand_line, typeof(rand_line));

      // var rand_line_split = rand_line.split(',');
      // console.log(rand_line_split, typeof(rand_line_split));

      var misspell = rand_line.split(',')[0];
      var correct = rand_line.split(',')[1];

      console.log("Got the words: ", misspell, correct);

      callback(misspell, correct);
    });
}

get_the_tweets();