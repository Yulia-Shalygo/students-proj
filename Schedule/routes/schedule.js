var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var dateFormat = require('dateformat');

var url = 'mongodb://localhost:27017';
var db_name = 'db_schedule';

router.get('/',async function (req, res, next){
    var resultArray = [];
    let user_id = objectId(req.query.id.toString());
    mongo.connect(url, async function (err, client) {
        if (err) throw err;
        var db = client.db(db_name);
        let user;
        try{
            user = await db.collection("user").findOne({"_id": user_id})
        } catch (err) {
            return res.status(500).send()
        }
        var cursor = db.collection('schedule').find({"group_id": objectId(user.group_id)}).sort( { date_time: 1 } );
        cursor.forEach (function (doc, err) {
            var item = new Object();
            if (err) throw err;
            item.date = dateFormat(doc.date_time, "dd.mm.yyyy HH:MM");
            db.collection("lecturer").findOne({"_id": doc.lecturer_id}, function(err, result) {
                if (err) throw err;
                item.lecturer = result.full_name;
            });
            db.collection("course").findOne({"_id": doc.course_id},function(err, result) {
                if (err) throw err;
                item.course = result.name;
                item.control = result.control;
            });
            db.collection("progress").findOne({"course_id": doc.course_id, "user_id": user_id},function(err, result) {
                if (err) throw err;
                try {
                    item.rating = result.rating;
                }
                catch (e) {
                    item.rating = "Нет данных";
                }
            });
            resultArray.push(item);
        }, async function() {
            await client.close();
            res.render('schedule', {items: resultArray});
        });
    });

});

module.exports = router;
