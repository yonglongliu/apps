  (function() {
    'use strict';
    var loader = LazyLoader;
    loader.load('js/navigation_map.js', function() {
      NavigationMap.init();
    });
    window.addEventListener('keydown', function(evt) {
      handleKeydown(evt);
    });

    window.addEventListener('menuEvent', function(event) {
      NavigationMap && (NavigationMap.optionMenuVisible = event.detail.menuVisible);
    });

    function handleKeydown(evt) {
      var el = evt.target,
        bestElementToFocus;
      if (NavigationMap && (NavigationMap.currentActivatedLength > 0 || NavigationMap.lockNavigation))  {
        return;
      }
      if(document.activeElement.type === 'select-one') {
        return;
      }
      if (evt.key === 'Enter' || evt.key === 'Accept') {
        handleClick(evt);
      } else {
        if (!evt.target.classList) {
          return;
        }
        if (!evt.target.classList.contains('focus')) {
          el = document.querySelector('.focus');
        }
        bestElementToFocus = findElementFromNavProp(el, evt);
        if (bestElementToFocus != null) {
          var prevFocused = document.querySelectorAll('.focus');
          if (bestElementToFocus == prevFocused[0]) {
            return;
          }

          if (prevFocused.length > 0) {
            prevFocused[0].classList.remove('focus');
          }
          if (NavigationMap.scrollToElement === undefined) {
            bestElementToFocus.scrollIntoView(false);
          } else {
            NavigationMap.scrollToElement(bestElementToFocus, evt);
          }
          bestElementToFocus.classList.add('focus');
          if(NavigationMap.ignoreFocus == null || !NavigationMap.ignoreFocus){
            bestElementToFocus.focus();
            evt.preventDefault();
          }
          document.dispatchEvent(new CustomEvent('focusChanged', {
            detail: {
              focusedElement: bestElementToFocus
            }
          }));
        }
      }
    }

    function findElementFromNavProp(currentlyFocused, evt) {
      var elementID;
      if (currentlyFocused == null) {
        return null;
      }
      if (NavigationMap != undefined && NavigationMap.disableNav != undefined && NavigationMap.disableNav)
        return null;
      var elmStyle = currentlyFocused.style;
      var handled = false;
      switch (evt.key) {
        case 'ArrowLeft':
          elementID = elmStyle.getPropertyValue('--nav-left');
          handled = true;
          break;
        case 'ArrowRight':
          elementID = elmStyle.getPropertyValue('--nav-right');
          handled = true;
          break;
        case 'ArrowUp':
          elementID = elmStyle.getPropertyValue('--nav-up');
          handled = true;
          break;
        case 'ArrowDown':
          elementID = elmStyle.getPropertyValue('--nav-down');
          handled = true;
          break;
        case 'Home':
        case 'MozHomeScreen':
          elementID = elmStyle.getPropertyValue('--nav-home');
          handled = true;
          break;
      }
      if (!elementID) {
        return null;
      }
      if (handled) {
        evt.preventDefault();
      }

      var selector = '[data-nav-id="' + elementID + '"]';
      return document.querySelector(selector);
    }

    function handleClick(evt) {
      var el = document.querySelector('.focus');
      el && el.focus();

      if ( NavigationMap && NavigationMap.optionMenuVisible && !evt.target.classList.contains('menu-button')) {
            // workaround for case of quick click just right after option menu opening start
        var selectedMenuElement = document.querySelector('menu button.menu-button');
        selectedMenuElement && selectedMenuElement.click && selectedMenuElement.click();
      } else if (NavigationMap && NavigationMap.handleClick) {
              //costimization of click action.
        NavigationMap.handleClick(evt);
      } else {
        evt.target.click();
        for (var i = 0; i < evt.target.children.length; i++) {
          evt.target.children[i].click();
        }
      }
    }
  })();
