Webcam.set({
  width: 240,
  height: 180,
  image_format: 'jpeg',
  jpeg_quality: 90
});
Webcam.attach('#my_camera');

var canvas = document.getElementById('viewport'),
  context = canvas.getContext('2d');

function take_snapshot() {
  // take snapshot and get image data
  Webcam.snap(function(data_uri) {
    base_image = new Image();
    base_image.src = data_uri;
    base_image.onload = function() {
      context.drawImage(base_image, 0, 0, 240, 180);

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
              if (data[0]) {
                // $("#results").text(JSON.stringify(data, null, 2));
                faceIdGlobal = data[0].faceId;
                identify(faceIdGlobal);
              } else {
                console.log('No face');
                $("#card").removeClass("bg-light");
                $("#card").addClass("bg-danger");
              }
            })
            .fail(function(err) {
              // $("#results").text(JSON.stringify(err));
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
          if (data[0].candidates[0]) {
            $("#card").removeClass("bg-light bg-warning bg-danger");
            $("#card").addClass("bg-success");
            console.log('Recognised!');
            // $("#identity").text(JSON.stringify(data, null, 2));
            personIdGlobal = data[0].candidates[0].personId;
            getName(personIdGlobal);
          } else {
            console.log('Face detected, but not recognised');
            $("#card").removeClass("bg-light");
            $("#card").addClass("bg-danger");
          }
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
          $("#name").val(data.name);
          $("#password").val(data.name);
          $('form#login').submit();
      })
      .fail(function() {
          alert("error");
      });
  }