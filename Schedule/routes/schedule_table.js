var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var dateFormat = require('dateformat');
var objectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017';
var db_name = 'db_schedule';


router.get('/', function (req, res, next){
    var resultArray = [];
    mongo.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db(db_name);
        var cursor = db.collection('schedule').find().sort( { date_time: 1 } );
        cursor.forEach ( function (doc, err) {
            var item = new Object();
            if (err) throw err;
            item.date = dateFormat(doc.date_time, "dd.mm.yyyy HH:MM");
            item.id = doc._id;
            db.collection("group").findOne({"_id": doc.group_id}, function(err, result) {
                if (err) throw err;
                item.group = result.group_num;
            });
            db.collection("course").findOne({"_id": doc.course_id},function(err, result) {
                if (err) throw err;
                item.course = result.name;
            });
            db.collection("lecturer").findOne({"_id": doc.lecturer_id},function(err, result) {
                if (err) throw err;
                item.lecturer = result.full_name;
            });
            resultArray.push(item);
        }, async function() {
            await client.close();
            res.render('schedule_table', {items: resultArray});
        });
    });

});

router.get('/delete',function (req, res, next){
    let select_id = objectId(req.query.id.toString());
    mongo.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db(db_name);
        db.collection('schedule').deleteOne({"_id": select_id}, function (err, result) {
            if (err) throw err;
            client.close();
        });
    });
    res.redirect('/schedule_table');
});


module.exports = router;