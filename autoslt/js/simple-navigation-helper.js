var SimpleNavigationHelper = function(selector, element, scrollSelector, initialFocusIndex) {
  this.selector = selector;
  this.element = element;
  this.scrollSelector = scrollSelector;
  this.initialFocusIndex = initialFocusIndex || 0;
  this.element.addEventListener('keydown', this);
  this._mutationObserver = new MutationObserver(this.refresh.bind(this));
  this._mutationObserver.observe(this.element, {
    childList: true,
    subtree: true,
    attributes: true
  });
  this.element.addEventListener('focus', this);
  this.updateCandidates();
};

SimpleNavigationHelper.prototype.loopable = true;

SimpleNavigationHelper.prototype.setFocus = function(element) {
  this._currentFocus = element;
  // XXX: The reason to maintain this value is because,
  // if the container is having tons of children elements,
  // the focus event handler will trigger a long restyling (2sec)
  // even with setTimeout or requestAnimationFrame.
  // So here is a hack to implicitly let other modules to focus on the
  // last active element when back from other element to this element
  // but not focus on the container directly.
  this.element.activeElement = element;
  this.scrollIntoView(element);
  if (this.element.contains(document.activeElement)) {
    element.focus();
  }
};

SimpleNavigationHelper.prototype.destroy = function() {
  this.element.removeEventListener('keydown', this);
  this.element.removeEventListener('focus', this);
  this._candidates = [];
  this._mutationObserver.disconnect();
  this._currentFocus = null;
  this.element.activeElement = null;
  this.element = null;
};

SimpleNavigationHelper.prototype.setInitialFocus = function() {
  var initial = this.getInitialFocus();
  this.setFocus(initial);
};

SimpleNavigationHelper.prototype.updateCandidates = function() {
  this._candidates = Array.from(this.element.querySelectorAll(this.selector));
};

SimpleNavigationHelper.prototype.isAriaHiddenByAncestor = function() {
  let isHidden = false;
  let element = this.element;
  while (element !== document.body) {
    if ('true' === element.getAttribute('aria-hidden')) {
      isHidden = true;
      break;
    }
    element = element.parentNode;
  }
  return isHidden;
};

SimpleNavigationHelper.prototype.refresh = function(mutations) {
  mutations.forEach((mutation) => {
    [].slice.call(mutation.removedNodes).forEach((node) => {
      if (node === this._currentFocus) {
        let next = this.findNext(this._currentFocus);
        if (next && next !== this._currentFocus) {
          this._currentFocus = next;
          this.element.activeElement = next;
        } else {
          this._currentFocus = this.element;
          this.element.activeElement = null;
        }
        if (document.activeElement === document.body &&
            !this.isAriaHiddenByAncestor()) {
          this.scrollIntoView(this._currentFocus);
          this._currentFocus.focus();
        }
      } else {
      }
    });
  });

  this.updateCandidates();
  // In case all candidates are removed
  // or in case it's initially empty then add candidates
  if (this.element === document.activeElement) {
    this.setInitialFocus();
  } else if (document.body === document.activeElement && !this.isAriaHiddenByAncestor()) {
    // Once there're no candidates and document.activeElement loses,
    // we assume the losing document.activeElement is in our scope due to change this time.
    // So we need to focus back to the root.
    this._currentFocus = this.element;
    this.element.focus();
  }
};

SimpleNavigationHelper.prototype.handleEvent = function(evt) {
  if ('keydown' === evt.type) {
    this.onKeyDown(evt);
  } else if ('focus' === evt.type) {
    if (this._currentFocus && this._currentFocus !== this.element) {
      this.scrollIntoView(this._currentFocus);
      this._currentFocus.focus();
      return;
    }
    let next = this.findNext();
    if (next) {
      this.scrollIntoView(next);
      next.focus();
      this._currentFocus = next;
      this.element.activeElement = next;
    } else {
      this._currentFocus = this.element;
      this.element.activeElement = null;
    }
  }
};

SimpleNavigationHelper.prototype.onKeyDown = function(evt) {
  var nextFocus = null;
  var handled = false;
  switch (evt.key) {
    case 'ArrowDown':
      handled = true;
      nextFocus = this.findNext();
      break;
    case 'ArrowUp':
      handled = true;
      nextFocus = this.findPrev();
      break;
    default:
      break;
  }
  if (nextFocus) {
    this.scrollIntoView(nextFocus);
    nextFocus.focus();
    this._currentFocus = nextFocus;
    this.element.activeElement = nextFocus;
  }
  if (handled) {
    evt.stopPropagation();
    evt.preventDefault();
  }
};

SimpleNavigationHelper.prototype.scrollIntoView = function(element) {
  if (this.scrollSelector) {
    let target = element;
    let found = false;
    while (target !== document.body) {
      if (target.matches(this.scrollSelector)) {
        found = true;
        target.scrollIntoView(false);
        break;
      }
      target = target.parentNode;
    }
    if (!found) {
      // In case the parent does no exist.
      element.scrollIntoView(false);
    }
  } else {
    element.scrollIntoView(false);
  }
};

SimpleNavigationHelper.prototype.getInitialFocus = function() {
  let candidates = this._candidates;
  if (!candidates.length) {
    return null;
  }
  return candidates[this.initialFocusIndex];
};

SimpleNavigationHelper.prototype.findNext = function(element) {
  element = element || document.activeElement;
  let candidates = this._candidates;
  if (!candidates.length) {
    return null;
  }
  let next = 0;
  candidates.some((dom, index) => {
    if (dom === element) {
      next = (index + 1) % candidates.length;
      return true;
    } else {
      return false;
    }
  });
  if (!candidates[next] && !this.loopable) {
    return null;
  }
  return candidates[next] || candidates[this.initialFocusIndex];
};

SimpleNavigationHelper.prototype.findPrev = function(element) {
  element = element || document.activeElement;
  let candidates = this._candidates;
  if (!candidates.length) {
    return null;
  }
  let next = null;
  candidates.some((dom, index) => {
    if (dom === element) {
      next = ((candidates.length + index) - 1) % candidates.length;
      if (!this.loopable && 0 === index) {
        next = null;
      }
      return true;
    } else {
      return false;
    }
  });
  if (!candidates[next] && !this.loopable) {
    return null;
  }
  return candidates[next] || candidates[this.initialFocusIndex];
};
