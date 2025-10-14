// eslint-disable-next-line func-names
(function(Drupal, once) {
  function handleAccordionTogglePress(e) {
    var button = document.getElementById('aalto-topnav-button');
    var expanded = Drupal.behaviors.aalto_utils.isExpanded(button);

    if (expanded === true) {
      switch (e.key) {
        case 'Tab':
          Drupal.behaviors.aalto_utils.loopWithTab(e);
          break;
        // no default
      }
    }
  }

  var toggleAccordion = function toggleAccordion(accordion) {
    var thisItem = accordion;
    var thisContent = thisItem.parentNode.nextElementSibling;
    var itemParent = thisItem.parentNode;
    var expanded = thisItem.getAttribute('aria-expanded') === 'true' || false;
    thisItem.setAttribute('aria-expanded', !expanded);
    thisItem.classList.toggle('is-collapsed');
    thisItem.classList.toggle('is-expanded');
    thisContent.classList.toggle('is-collapsed');
    thisContent.classList.toggle('is-expanded');
    itemParent.classList.toggle('is-closed');
    itemParent.classList.toggle('is-open');

    if (accordion.classList.contains('aalto-topnav__navigation-heading')) {
      // toggle accordion's items' visibility to screen readers when accordion is toggled
      accordion
        .closest('.aalto-topnav__navigation-item')
        .querySelectorAll('.aalto-topnav__submenu-link')
        .forEach(child => {
          if (child.tagName === 'A' || child.tagName === 'BUTTON') {
            child.setAttribute('tabindex', expanded ? '-1' : '0');
          }
        });

      // add accordion panel's items to loop in top nav
      Drupal.behaviors.aalto_utils.setupMenuKeys(
        document.getElementById('aalto-topnav-items-container'),
        handleAccordionTogglePress
      );

      window.dataLayer.push({
        event: 'gaEvents',
        eventCategory: 'TopNav',
        eventAction: expanded ? 'Submenu collapse' : 'Submenu expand',
        eventLabel: accordion.innerText,
      });
    }

    thisContent.classList.toggle('animateIn');

    // Restore focus to accordion. Timeout hack is needed for some reason.
    setTimeout(() => {
      accordion.focus();
    }, 1);
  };

  const switchAccordion = function switchAccordion(e) {
    const thisItem = e.currentTarget;

    // Toggle accordion only if 'js-anchor-link-icon' wasn't pressed.
    if (!e.target.classList.contains('js-anchor-link-icon')) {
      toggleAccordion(thisItem);
    }
  };

  var expandAllAccordions = function expandAllAccordions(e) {
    var clickedButton = e.currentTarget;
    var expandAllButton = document.querySelector('.accordion__expand-all');
    var collapseAllButton = document.querySelector('.accordion__collapse-all');
    var expandedAccordionToggles = document.querySelectorAll(
      '.accordion__remote-controlled.is-expanded'
    );
    var collapsedAccordionToggles = document.querySelectorAll(
      '.accordion__remote-controlled.is-collapsed'
    );
    var i;

    if (clickedButton === expandAllButton && collapsedAccordionToggles.length > 0) {
      for (i = 0; i < collapsedAccordionToggles.length; i++) {
        toggleAccordion(collapsedAccordionToggles[i]);
      }
      clickedButton.classList.add('hidden');

      // check that we remove class from the right element
      if (clickedButton.nextSibling.classList.contains('accordion__collapse-all')) {
        clickedButton.nextSibling.classList.remove('hidden');

        // Restore focus to the button that replaced the button clicked. Use timeout, so it has enough time to render.
        setTimeout(() => {
          clickedButton.nextSibling.focus();
        }, 1);
      }
    }

    if (clickedButton === collapseAllButton && expandedAccordionToggles.length > 0) {
      for (i = 0; i < expandedAccordionToggles.length; i++) {
        toggleAccordion(expandedAccordionToggles[i]);
      }
      clickedButton.classList.add('hidden');

      // check that we remove class from the right element
      if (clickedButton.previousSibling.classList.contains('accordion__expand-all')) {
        clickedButton.previousSibling.classList.remove('hidden');

        // Restore focus to the button that replaced the button clicked. Use timeout, so it has enough time to render.
        setTimeout(() => {
          clickedButton.previousSibling.focus();
        }, 1);
      }
    }
  };

  var updateRemoteControls = function updateRemoteControls() {
    var remoteAccordionToggles = document.querySelectorAll('.accordion__remote-controlled');
    var expandAllButton = document.querySelector('.accordion__expand-all');
    var collapseAllButton = document.querySelector('.accordion__collapse-all');
    var i = 0;
    var accordionsCollapsed = 0;

    for (i = 0; i < remoteAccordionToggles.length; i++) {
      // show 'collapse all' button if any of accordions is expanded
      if (remoteAccordionToggles[i].classList.contains('is-expanded')) {
        collapseAllButton.classList.remove('hidden');
        expandAllButton.classList.add('hidden');
      }
      if (remoteAccordionToggles[i].classList.contains('is-collapsed')) {
        accordionsCollapsed += 1;
      }
    }

    // show 'expand all' only if all accordions are collapsed
    if (accordionsCollapsed === remoteAccordionToggles.length) {
      collapseAllButton.classList.add('hidden');
      expandAllButton.classList.remove('hidden');
    }
  };

  Drupal.behaviors.aalto_accordion = {
    attach: function attach(context) {
      once('aalto_accordion', 'body', context).forEach(function() {
        var remoteAccordionToggles = context.querySelectorAll('.accordion__remote-controlled');
        var accordionToggles = context.querySelectorAll('.accordion__title');
        var expandAllButton = context.querySelector('.accordion__expand-all');
        var collapseAllButton = context.querySelector('.accordion__collapse-all');
        var i;
        for (i = 0; i < accordionToggles.length; i++) {
          accordionToggles[i].addEventListener('click', switchAccordion, false);
        }
        // 'expand/collapse all' works currently only for one button per page
        if (remoteAccordionToggles) {
          for (i = 0; i < remoteAccordionToggles.length; i++) {
            remoteAccordionToggles[i].addEventListener('click', updateRemoteControls, false);
          }
        }
        if (expandAllButton) {
          expandAllButton.addEventListener('click', expandAllAccordions, false);
        }
        if (collapseAllButton) {
          collapseAllButton.addEventListener('click', expandAllAccordions, false);
        }
      });
    },
  };
})(Drupal, once);
