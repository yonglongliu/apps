'use strict';

(function(exports) {
  var EventSender  = {
    emit: function(eventType, info) {
      if (!info) {
        info = {};
      }

      let evt = new CustomEvent(eventType, {'detail': info});
      window.dispatchEvent(evt);
    }
  };

  exports.EventSender = EventSender;
}(window));
