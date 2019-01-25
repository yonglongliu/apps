/* global NavigationHelper */
'use strict';

(function(exports) {
  var NavigationMap = {

    init: function() {
    },

    register: function(navInfo) {
      var bootFocusElement = NavigationHelper.reset(
          navInfo.navigator,
          navInfo.controls,
          navInfo.defaultFocusIndex,
          navInfo.curViewId,
          navInfo.noSetfocus
      );

      return bootFocusElement;
    },

    initPanelNavigation: function(selector, defaultFocusIndex, curViewId, noSetfocus, doc) {
      var navInfo = {};
      navInfo.navigator = VerticalNavigator;
      navInfo.controls = function() {
        return doc.querySelector('#'+ curViewId).querySelectorAll(selector);
      };
      navInfo.defaultFocusIndex = function() {
        return defaultFocusIndex;
      };
      navInfo.curViewId = curViewId;
      navInfo.noSetfocus = noSetfocus;

      this.register(navInfo);
    },

    postEvent: function (eventInfo) {
      var evt = new CustomEvent('navigationEvent', {'detail': eventInfo});
      window.dispatchEvent(evt);
    },

  };

  exports.NavigationMap = NavigationMap;
})(window);