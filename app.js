(function () {
"use strict";

angular.module("NarrowItDownApp",[])
  .controller("NarrowItDownController",NarrowItDownController)
  .service("MenuSearchService",MenuSearchService)
  .directive("foundItems", FoundItemsDirective)
  //.filter("highlight", HighlightFilterFactory)

  .constant("ApiBasePath", "https://davids-restaurant.herokuapp.com/menu_items.json");

  NarrowItDownController.$inject = ["MenuSearchService"];
  function NarrowItDownController(MenuSearchService) {
    var ctrl = this;
    ctrl.pvez = true;
    ctrl.searchTerm = "";
    ctrl.found = null;
    ctrl.showError = false;

    ctrl.getItems = function () {
      ctrl.pvez = false;
      if (ctrl.searchTerm !== "" && ctrl.searchTerm !==null){
        var promise = MenuSearchService.getMatchedMenuItems(ctrl.searchTerm);
        promise.then(function (result) {
          if (result.length !== 0) {
            ctrl.showError = false;
            ctrl.pvez = false;
            ctrl.found = result;
          }else {
            ctrl.showError =true;
          }
        })
        .catch(function (error){
          console.log('something went wrong.' + error);
          ctrl.showError =true;
        })
      }
      else ctrl.showError = true;
    };


    ctrl.removeMatchedMenuItem = function(index) {
      this.found.splice(index, 1);
    };
  }

  MenuSearchService.$inject = ["$http", "ApiBasePath"];
  function MenuSearchService($http, ApiBasePath) {
    var service = this;

    service.getMatchedMenuItems = function (searchTerm) {
      return $http({
        method: "GET",
        url: ApiBasePath
      }).then(function (result) {
          // process result and only keep items that match
          var foundItems = [];
          var listItems = result.data.menu_items;

          listItems.forEach(function (item) {
              if  (item.description &&
                  (item.description.toLowerCase()
                        .indexOf(searchTerm.toLowerCase()) !== -1)) {
                      foundItems.push(item);}
          });

          // return processed items
          return foundItems;
          }).catch(function(result){
              console.error(result);
        });
    return service;
    }
  };

  FoundItemsDirective.$inject=[];
  function FoundItemsDirective() {
    var ddo={
      restrict: "E",
      templateUrl: "foundItems.html",
      scope:{
        items: "<",
        pvez: "<",
        showError: "<",
        onRemove: "&"
      },
      controller: NarrowItDownController,
      controllerAs: "ctrl",
      bindToController: true
    };

    return ddo;
  };

})();
