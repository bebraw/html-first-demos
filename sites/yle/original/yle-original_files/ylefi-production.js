yleTagManager.loadAnalyticsScript('//analytics-sdk.yle.fi/yle-analytics.min.js', function() {
  yleAnalytics.accounts.addAccounts([{
    type: 'datacloud',
    id: 'yleiset'
  }, {
    type: 'adobe',
    id: 'yleiset'
  }, {
    type: 'chartbeat',
    id: 'yle.fi'
  }, {
    type: 'audienceproject',
    id: {
      section: '240fba10-c301-4511-91b8-6a0ea84cab2e',
      media: '89ac7509-a992-40e5-9c55-7b1f9503ee7a'
    }
  }
  ])

  if (yleAnalytics.attachLinkTrackingToClickEvents) {
    yleAnalytics.attachLinkTrackingToClickEvents()
  }
})
