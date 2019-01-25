/**
 * Base class of all pages to offer single page navigation
 */
'use strict';

function Page() {
}

/*＊
  This function use for every child object to init navigation, the default navigate way.
  Can rewrite this in sub page.

  - Parameter container: The container of sub page that contains all .focusable element of sub page
  every time travel to this sub page will focus on it.
 */
Page.prototype.initNavigation = function(container) {
  if (!this.navigator) {
    this.navigator = new SimpleNavigationHelper('.focusable',
      container.querySelector('.nav-container'));
  }

  container.querySelector('.nav-container').focus();
};
