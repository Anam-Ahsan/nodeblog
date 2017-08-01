var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');


var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.jpg') //Appending .jpg
  }
})

var upload = multer({ storage: storage });


router.get('/show/:id',function(req,res,next){
var db = req.db;
console.log(req.params.id)
	var posts = db.get('posts');
	posts.findOne({
		_id:req.params.id
	},{},function(err,posts){
res.render('show',{
"title":req.params.post,
"post":posts
});
	})





})

router.get('/add',function(req,res,next){
	var db =req.db;
	var categories=db.get('categories');
	
	 categories.find({},{},function(err,categories){
res.render('addpost',{
		"title":"Add Post",
		categories:categories,
	});
	});

});

router.post('/add',upload.single('mainimage'),function(req,res,next){
// get form values
var title    	=	req.body.title;
var category	= 	req.body.category;
var body		=	req.body.body;
var author		=	req.body.author;
var date 		= 	new Date();
console.log(req.file);
if(req.file){

var mainImageOriginalName = req.file.originalname;
var mainImageName = req.file.filename;
var mainImageMime = req.file.mimetype;
var mainImagePath = req.file.path;
var mainImageExt = req.file.extension;
var mainImageSize = req.file.size;
}else{
var mainImageName = 'c.png';
}


// Form Validation
req.checkBody('title','Title field is required').notEmpty();

req.checkBody('body','Body field is required').notEmpty();



var errors = req.validationErrors();

if(errors){
	
	res.render('addpost',{
		errors:errors,
		title:title,
		body:body
		
	});
}else{
	var posts = db.get('posts');
	posts.insert({
		title:title,
		body:body,
		category:category,
		author:author,
		date:date,
		mainimage:mainImageName,
	},function(err,post){
		if(err){
			res.send('There was issue submitting posts');
		}else{
			req.flash('success','Post Submitted');
			 res.location('/');
	res.redirect('/');
		}

	});
	
	
}
});



// comments addition



router.post('/addcomment',function(req,res,next){
// get form values
var name    	=	req.body.name;
var email	= 	req.body.email;
var body		=	req.body.body;
var postid		=	req.body.postid;
var commentdate 		= 	new Date();




// Form Validation
req.checkBody('name','Name field is required').notEmpty();
req.checkBody('email','Email field is required').notEmpty();
req.checkBody('email','Not valid email').isEmail();
req.checkBody('body','Body field is required').notEmpty();



var errors = req.validationErrors();

if(errors){
	var posts =db.get('posts');
	posts.findOne(postid,function(err,post){
	res.render('show',{
			errors:errors,
			post:post
		
		});


	});
	
}else{
	var comment={"name":name,"email":email,"body":body,"commentdate":commentdate};
	var posts =db.get('posts');
	posts.update({
		"_id":postid

	},{
		$push:{
			"comments":comment
		}
	},function(err,doc){
		if(err) {
			throw err;}
			else{
				req.flash('success','Comment Added');
				res.location('/posts/show/'+'postid');
				res.redirect('/posts/show/'+postid);
			}
	}


	);
	
}
});









module.exports = router;