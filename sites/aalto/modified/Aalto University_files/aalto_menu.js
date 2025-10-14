/* eslint-disable func-names */
(function(Drupal) {
  var getMenus = function(extraSelector) {
    var selector = extraSelector
      ? extraSelector.concat('.js-menu-container')
      : '.js-menu-container';
    return [].slice.call(document.querySelectorAll(selector)); // Needs to be an array instead of NodeList for forEach to work in old Edge and IE 11.
  };

  var getMenuToggleButton = function(menu) {
    return menu.querySelector('.js-menu-toggle');
  };

  // Check if menu has data attribute data-mq which holds a media query where things should be done.
  var checkMediaQueryMatch = function(menu) {
    var mediaQuery = menu.dataset.mq;
    return mediaQuery ? Drupal.behaviors.aalto_utils.isMediaQueryMatch(mediaQuery) : true;
  };

  // At least for now, in mobile there can be several dropdown menus open at the same time. So, we close them all when screen width changes to desktop version where only one at a time can be open.
  // This may change when an off canvas mobile submenu is done, so need for this function may be temporary.
  var closeMenusOnResize = Drupal.behaviors.aalto_utils.debounce(function() {
    var menus = getMenus('.aalto-dropdown_container--nav');

    menus.forEach(function(menu) {
      var mediaQuery = menu.dataset.mq;
      if (mediaQuery) {
        window.matchMedia(mediaQuery).onchange = function() {
          var button = getMenuToggleButton(menu);
          if (checkMediaQueryMatch(menu) === true) {
            Drupal.behaviors.aalto_utils.toggleMenu(button, true);
          }
        };
      }
    });
  }, 50);

  function handleMenuKeyPress(e) {
    var menu = e.currentTarget;
    var doHandling = checkMediaQueryMatch(menu);
    var button = getMenuToggleButton(menu);
    var expanded = Drupal.behaviors.aalto_utils.isExpanded(button);

    if (doHandling === true) {
      if (expanded === true && Drupal.behaviors.aalto_utils.isEscPressed(e) === true) {
        e.preventDefault();
        e.stopPropagation();
        Drupal.behaviors.aalto_utils.toggleMenu(button, true);
        button.focus();
      }
      if (e.key === 'Tab' && expanded === true) {
        Drupal.behaviors.aalto_utils.loopWithTab(e);
      }
    }
  }

  function closeAllMenusOnOutsideClick(e) {
    var menuContainers = getMenus();
    menuContainers.forEach(function(menu) {
      var isClickInside = menu.contains(e.target);
      var toggleButton = getMenuToggleButton(menu);
      if (checkMediaQueryMatch(menu) === true) {
        if (isClickInside === false) {
          Drupal.behaviors.aalto_utils.toggleMenu(toggleButton, true);
        }
      }
    });
  }

  function toggleMenu(e) {
    var toggleButton = e.currentTarget;
    var expanded = Drupal.behaviors.aalto_utils.isExpanded(toggleButton);
    Drupal.behaviors.aalto_utils.toggleMenu(toggleButton, expanded);
  }

  function closeMenu(e) {
    var menu = e.currentTarget.closest('.js-menu-container');
    var toggleButton = getMenuToggleButton(menu);
    Drupal.behaviors.aalto_utils.toggleMenu(toggleButton, true);
  }

  Drupal.behaviors.aalto_menu = {
    attach: function attach(context) {
      once('aalto_menu', 'html', context).forEach(function() {
        var menuContainers = getMenus();
        var menuToggleButtons = [].slice.call(document.querySelectorAll('.js-menu-toggle')); // Needs to be an array instead of NodeList for forEach to work in old Edge and IE 11.
        var menuCloseButtons = [].slice.call(document.querySelectorAll('.js-menu-close')); // Needs to be an array instead of NodeList for forEach to work in old Edge and IE 11.

        if (menuContainers.length) {
          window.addEventListener('resize', closeMenusOnResize);
          document.addEventListener('click', closeAllMenusOnOutsideClick);
          menuContainers.forEach(function(menu) {
            Drupal.behaviors.aalto_utils.setupMenuKeys(menu, handleMenuKeyPress);
          });
        }

        if (menuToggleButtons.length) {
          menuToggleButtons.forEach(function(button) {
            button.addEventListener('click', toggleMenu);
          });
        }

        if (menuCloseButtons.length) {
          menuCloseButtons.forEach(function(button) {
            button.addEventListener('click', closeMenu);
          });
        }
      });
    },
  };
})(Drupal);
