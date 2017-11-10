angular.module('app', []).controller('main', ['$scope', '$http', function($scope, $http) {
  $scope.text = {};
  $scope.showDeposit = true;
  $scope.withdrawAmount = 0;
  $scope.accountId = '';
  $scope.repeater = new Array();

  console.log('loaded');

  $scope.addBanknote = function () {
    $scope.repeater.push({value:0, amount:0});
    console.log($scope.repeater);
  }

  $scope.removeBanknote = function (index) {
    $scope.repeater.splice(index, 1);
    console.log($scope.repeater);
  }

  $scope.executeAction = function () {
    var data = {};
    if ($scope.showDeposit) {
      data.value = 0;
      data.targetAccount = $scope.accountId;
      data.banknotes = $scope.repeater.map(function (note) {
        data.value += note.value * note.amount;
        return { value: '' + note.value, amount: note.amount};
      });
    } else {
      data.account = $scope.accountId;
      data.value = $scope.withdrawAmount;
    }
    $http({
      method: 'POST',
      url: '/api/' + ($scope.showDeposit ? 'deposit' : 'withdraw'),
      data: data
    })
    .then(function successCallback(response) {
      if (response.data.banknotes) {
        alert(JSON.stringify(response.data.banknotes));
      } else {
        alert(JSON.stringify(response.data));
      }
    }, function errorCallback(response) {
      alert('failed');
    });
  }

  $scope.getBalance = function () {
    if ($scope.accountId) {
      $http({
        method: 'GET',
        url: '/api/balance?account=' + $scope.accountId
      }).then(function successCallback(response) {
          alert('current balance: ' + response.data.value);
        }, function errorCallback(response) {
          alert('failed');
        });
    } else {
      alert('Insert a valid Account ID');
    }
  }
}]);

angular.element(document).ready(function($scope) {
	angular.bootstrap(document, ['app']);
});
