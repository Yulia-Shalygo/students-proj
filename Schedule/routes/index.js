var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017';
var db_name = 'db_schedule';

router.get('/', function(req, res, next) {
  res.render('index');
});


router.post('/login',function (req, res, next){
    mongo.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db(db_name);
        db.collection('user').findOne({"login": req.body.login, "pass": req.body.pass}, function (err, result) {
            if (err) throw err;
            client.close();
            if (result == null)
                res.redirect('/');
            try {
                if (result.role == "methodist")
                    res.redirect('/schedule_table');
                if (result.role == "student")
                    res.redirect('/schedule?id=' + result._id);
            }
            catch (err) {
            }
        });

    });
});

module.exports = router;
