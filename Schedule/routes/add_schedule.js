var express = require('express');
var mongo = require('mongodb').MongoClient;
var router = express.Router();
var objectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017';
var db_name = 'db_schedule';


router.get('/', function(req, res, next) {
    var groups = [];
    var courses = [];
    var lecturers = [];

    mongo.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db(db_name);

        var cursor_group = db.collection('group').find();
        cursor_group.forEach(function (doc, err) {
            var item = new Object();
            if (err) throw err;
            item._id = doc._id;
            item.name = doc.group_num;
            groups.push(item);
        });
        var cursor_course = db.collection('course').find();
        cursor_course.forEach(function (doc, err) {
            var item = new Object();
            if (err) throw err;
            item._id = doc._id;
            item.name = doc.name;
            courses.push(item);
        });
        var cursor_lecturer = db.collection('lecturer').find();
        cursor_lecturer.forEach(function (doc, err) {
            var item = new Object();
            if (err) throw err;
            item._id = doc._id;
            item.name = doc.full_name;
            lecturers.push(item);
        }, function() {
            client.close();
            res.render('add_schedule', {groups: groups, courses: courses, lecturers: lecturers});
        });
    });
});

router.post('/insert', function (req, res, next){
    var item = {
        course_id: new objectId(req.body.select_course),
        date_time: new Date(req.body.date_time),
        lecturer_id: new objectId(req.body.select_lecturer),
        group_id: new objectId(req.body.select_group)
    };
    mongo.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db(db_name);
        db.collection('schedule').insertOne(item, function (err, result) {
            if (err) throw err;
            client.close();
        });
    });
    res.redirect('/add_schedule');
});

module.exports = router;
