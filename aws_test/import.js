// load config details
var config = require('./config')

// load required modules
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var fs = require('fs-extra');
var path = require('path');

// get configuration details
AWS.config.region = config.region;
var rekognition = new AWS.Rekognition({region: config.region});
var collectionName = config.collectionName;

// create a collection of faces to search 
function createCollection() {
	rekognition.createCollection( { "CollectionId": config.collectionName }, function(err, data) {
	  if (err) {
		console.log(err, err.stack); // an error occurred
	  } else {
		console.log(data);           // successful response
	  }
	});
}

// index faces from './faces' directory
function indexFaces() {
	var klawSync = require('klaw-sync')
	var paths = klawSync('./faces', { nodir: true, ignore: [ "*.json" ] });
	// loop each image
	paths.forEach((file) => {
		console.log(file.path);
		var p = path.parse(file.path);
		var name = p.name.replace(/\W/g, '');
		var bitmap = fs.readFileSync(file.path);

		rekognition.indexFaces({
		   "CollectionId": collectionName,
		   "DetectionAttributes": [ "ALL" ],
		   "ExternalImageId": name,
		   "Image": { 
			  "Bytes": bitmap
		   }
		}, function(err, data) {
			if (err) {
				console.log(err, err.stack); // an error occurred
			} else {
				console.log(data);           // successful response
				fs.writeJson(file.path + ".json", data, err => {
					if (err) return console.error(err)
				});
			}
		});
	});
}
createCollection();
indexFaces();