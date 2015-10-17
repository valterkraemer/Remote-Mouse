'use strict';

angular.module('remoteMouseApp')
  .controller('MainCtrl', function ($scope, $http, $timeout) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    var ws = new WebSocket("ws://localhost:9000"); // TODO don't hardcode URL
    ws.onopen = function() {
      console.log("WS connected");
    };
    ws.onmessage = function(msgEvent) {
      console.log("RX: %s", msgEvent.data);
      if (msgEvent.data === "click") {
        $timeout(function() {
          document.elementFromPoint($scope.pointerLeft, $scope.pointerTop).click();
        });
      }
      else {
        var match = /^pos:(-?[0-9]+),(-?[0-9]+)$/.exec(msgEvent.data);
        if (match) {
          $timeout(function() {
            $scope.pointerLeft = parseInt(match[1]);
            $scope.pointerTop = parseInt(match[2]);
          });
        }
        else {
          console.log("(ignored)");
        }
      }
    };

    $scope.grid = [[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]];

    $scope.cellClick = function(rowIndex, columnIndex) {
      $scope.clickedRow = rowIndex;
      $scope.clickedColumn = columnIndex;
    }

    $scope.pointerTop = 100;
    $scope.pointerLeft = 120;
    $scope.pointerStep = 10;

    $scope.joinChannel = function() {
      ws.send("join:" + ($scope.channel || ""));
    };

    $scope.click = function() {
      console.log( document.elementFromPoint($scope.pointerLeft, $scope.pointerTop));
      $timeout(function() {
        document.elementFromPoint($scope.pointerLeft, $scope.pointerTop).click();
        ws.send("click");
      })
    }

    var sendPosition = function() {
      ws.send("pos:" + $scope.pointerLeft + "," + $scope.pointerTop);
    };

    $scope.up = function() {
      $timeout(function() {
        $scope.pointerTop -= $scope.pointerStep;
        sendPosition();
      });
    };
    $scope.down = function() {
      $timeout(function() {
        $scope.pointerTop += $scope.pointerStep;
        sendPosition();
      });
    };
    $scope.left = function() {
      $timeout(function() {
        $scope.pointerLeft -= $scope.pointerStep;
        sendPosition();
      });
    };
    $scope.right = function() {
      $timeout(function() {
        $scope.pointerLeft += $scope.pointerStep;
        sendPosition();
      });
    };

  });
