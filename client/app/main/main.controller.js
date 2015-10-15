'use strict';

angular.module('remoteMouseApp')
  .controller('MainCtrl', function ($scope, $http, $timeout) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $scope.grid = [[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]];

    $scope.cellClick = function(rowIndex, columnIndex) {
      $scope.clickedRow = rowIndex;
      $scope.clickedColumn = columnIndex;
    }

    $scope.pointerTop = 100;
    $scope.pointerLeft = 120;
    $scope.pointerStep = 10;

    $scope.click = function() {
      console.log( document.elementFromPoint($scope.pointerLeft, $scope.pointerTop));
      $timeout(function() {
        document.elementFromPoint($scope.pointerLeft, $scope.pointerTop).click();
      })
    }

    $scope.up = function() {
      $timeout(function() {
        $scope.pointerTop -= $scope.pointerStep;
      });
    };
    $scope.down = function() {
      $timeout(function() {
        $scope.pointerTop += $scope.pointerStep;
      });
    };
    $scope.left = function() {
      $timeout(function() {
        $scope.pointerLeft -= $scope.pointerStep;
      });
    };
    $scope.right = function() {
      $timeout(function() {
        $scope.pointerLeft += $scope.pointerStep;
      });
    };

  });
