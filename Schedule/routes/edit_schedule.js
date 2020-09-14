var express = require('express');
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var router = express.Router();
var moment = require('moment')

var url = 'mongodb://localhost:27017';
var db_name = 'db_schedule';


router.get('/', function(req, res, next) {
    var groups = [];
    var courses = [];
    var lecturers = [];
    let select_id = objectId(req.query.id.toString());

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
        var selected_schedule = new Object();
        var selected_params = new Object();
        db.collection("schedule").findOne({"_id": select_id}).then(result => {
            if(result) {
                console.log(`Successfully found document: ${result._id}.`)
                selected_schedule = result;
            } else {
                console.log("No document matches the provided query.")
            }
            return result;
        });
        console.log("selected_id:", select_id);
        var cursor_lecturer = db.collection('lecturer').find();
        cursor_lecturer.forEach(function (doc, err) {
            var item = new Object();
            if (err) throw err;
            item._id = doc._id;
            item.name = doc.full_name;
            lecturers.push(item);
        }, function() {
            db.collection("group").findOne({"_id": objectId(selected_schedule.group_id)}).then(result => {
                if(result) {
                    console.log(`Successfully found document: ${result._id}.`)
                    selected_params.group_num = result.group_num;
                } else {
                    console.log("No document matches the provided query.")
                }
                return result;
            });
            db.collection("course").findOne({"_id": objectId(selected_schedule.course_id)}).then(result => {
                if(result) {
                    console.log(`Successfully found document: ${result._id}.`)
                    selected_params.course_name = result.name;
                } else {
                    console.log("No document matches the provided query.")
                }
                return result;
            });
            db.collection("lecturer").findOne({"_id": objectId(selected_schedule.lecturer_id)}).then(result => {
                if(result) {
                    console.log(`Successfully found document: ${result._id}.`)
                    selected_params.lecturer_name = result.full_name;
                } else {
                    console.log("No document matches the provided query.")
                }
                return result;
            });
            selected_params.date_time = moment(new Date(selected_schedule.date_time.toString())).format('YYYY-MM-DDTHH:mm:SS')
            client.close();
            console.log("result: ", selected_params.date_time);
            res.render('edit_schedule', {groups: groups, courses: courses, lecturers: lecturers, selected_schedule: selected_schedule, selected_params: selected_params});
        });
    });
});

router.post('/update', function (req, res, next){
    let select_id = objectId(req.body.id);
    var item = {
        course_id: new objectId(req.body.select_course),
        date_time: new Date(req.body.date_time),
        lecturer_id: new objectId(req.body.select_lecturer),
        group_id: new objectId(req.body.select_group)
    };
    mongo.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db(db_name);
        db.collection('schedule').updateOne({"_id": select_id}, {$set: item}, function (err, result) {
            if (err) throw err;
            client.close();
        });
    });
    res.redirect('/schedule_table');
});

module.exports = router;