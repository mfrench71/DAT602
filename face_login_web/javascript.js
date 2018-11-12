Webcam.set({
  width: 320,
  height: 240,
  image_format: 'jpeg',
  jpeg_quality: 90
});
Webcam.attach('#my_camera');

var canvas = document.getElementById('viewport'),
  context = canvas.getContext('2d');

var faceIdGlobal = '';
var personIdGlobal = '';

function take_snapshot() {
  // take snapshot and get image data
  Webcam.snap(function(data_uri) {
    base_image = new Image();
    base_image.src = data_uri;
    base_image.onload = function() {
      context.drawImage(base_image, 0, 0, 320, 240);

      let data = canvas.toDataURL('image/jpeg');

      fetch(data)
        .then(res => res.blob())
        .then(blobData => {
          $.post({
              url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect",
              contentType: "application/octet-stream",
              headers: {
                'Ocp-Apim-Subscription-Key': '750cc2f2c6fe4633a2ace4e9d7335867'
              },
              processData: false,
              data: blobData
            })
            .done(function(data) {
              $("#results").text(JSON.stringify(data, null, 2));
              faceIdGlobal = data[0].faceId;
              identify(faceIdGlobal);
            })
            .fail(function(err) {
              $("#results").text(JSON.stringify(err));
            })
        });
    }
  });
};

function identify(faceIdGlobal) {
      $.post({
            url: "https://westus.api.cognitive.microsoft.com/face/v1.0/identify",
            contentType: "application/json",
            headers: {
              'Ocp-Apim-Subscription-Key': '750cc2f2c6fe4633a2ace4e9d7335867'
            },
          data: "{personGroupId:'users', faceIds:['" + faceIdGlobal + "'], confidenceThreshold: '.5'}"
      })
      .done(function(data) {
          $("#identity").text(JSON.stringify(data, null, 2));
          personIdGlobal = data[0].candidates[0].personId;
          getName(personIdGlobal);
      })
      .fail(function() {
          alert("error");
      });
  };

  function getName(personIdGlobal) {
    var params = {
          'personGroupId': 'users',
          'personId': personIdGlobal
      };

      $.get({
            url: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/users/persons/" + personIdGlobal,
            headers: {
              'Ocp-Apim-Subscription-Key': '750cc2f2c6fe4633a2ace4e9d7335867'
            },
      })
      .done(function(data) {
          $("#name").text(data.name);
      })
      .fail(function() {
          alert("error");
      });
  }