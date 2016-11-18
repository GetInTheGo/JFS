'use strict';

describe('Controller: RecruitCtrl', function () {

  // load the controller's module
  beforeEach(module('helloIonicApp'));

  var RecruitCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RecruitCtrl = $controller('RecruitCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(RecruitCtrl.awesomeThings.length).toBe(3);
  });
});
