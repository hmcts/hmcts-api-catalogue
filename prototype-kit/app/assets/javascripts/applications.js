// Real "my applications and teams", against the same backend and token as
// auth.js. Wrapped in DOMContentLoaded because this script (loaded via
// pageScripts) runs BEFORE auth.js in document order - window.HmctsAuth
// would be undefined at top level, so everything here waits for the whole
// page (including auth.js) to have run first.
//
// Phase 1 only (see the design doc): applications are always owned directly
// by the signed-in user, no teams yet.
document.addEventListener('DOMContentLoaded', function () {
  'use strict'

  var Auth = window.HmctsAuth
  if (!Auth) return

  var ENVIRONMENT_LABELS = {
    sandbox: 'Sandbox',
    development: 'Development',
    'integration-test': 'Integration test',
    production: 'Production'
  }

  var API_CATALOGUE = {
    'crime-prosecution-case-details': 'Crime Prosecution Case Details API',
    'hearing-results': 'Hearing Results API',
    'court-listings-and-scheduling': 'Court Listings and Scheduling API',
    'court-and-tribunal-reference-data': 'Court and Tribunal Reference Data API',
    'fees-and-financial-transactions': 'Fees and Financial Transactions API',
    'tribunal-case-administration': 'Tribunal Case Administration API'
  }

  function requireSignedIn () {
    if (Auth.getToken()) return true
    window.location.href = Auth.siteUrl('sign-in/')
    return false
  }

  function formatDate (iso) {
    var d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function formatDateTime (iso) {
    var d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  function escapeHtml (str) {
    var div = document.createElement('div')
    div.textContent = str == null ? '' : String(str)
    return div.innerHTML
  }

  // ---- list page ------------------------------------------------------

  var appsTable = document.getElementById('apps-table')
  if (appsTable) {
    if (!requireSignedIn()) return

    Auth.authedFetch('/api/applications').then(function (res) {
      if (res.status === 401) { window.location.href = Auth.siteUrl('sign-in/'); return }
      return res.json()
    }).then(function (data) {
      if (!data) return
      var body = document.getElementById('apps-table-body')
      var loading = document.getElementById('apps-loading')
      var empty = document.getElementById('apps-empty-hint')
      loading.hidden = true

      if (!data.applications.length) {
        empty.hidden = false
        return
      }

      appsTable.hidden = false
      data.applications.forEach(function (app) {
        var tr = document.createElement('tr')
        tr.className = 'govuk-table__row'
        tr.innerHTML =
          '<td class="govuk-table__cell"><a class="govuk-link" href="' + Auth.siteUrl('account/applications/detail/?id=' + encodeURIComponent(app.id)) + '">' + escapeHtml(app.name) + '</a></td>' +
          '<td class="govuk-table__cell">' + escapeHtml(ENVIRONMENT_LABELS[app.environment] || app.environment) + '</td>' +
          '<td class="govuk-table__cell">' + escapeHtml(app.owner.type === 'user' ? 'Me' : app.owner.type) + '</td>'
        body.appendChild(tr)
      })
    }).catch(function () {
      document.getElementById('apps-loading').textContent = 'Could not load your applications. Try again in a moment.'
    })
  }

  // ---- check answers: real creation ------------------------------------

  var createForm = document.getElementById('create-app-form')
  if (createForm) {
    if (!requireSignedIn()) return

    createForm.addEventListener('submit', function (event) {
      event.preventDefault()

      var raw
      try {
        raw = JSON.parse(window.sessionStorage.getItem('journey:new-application')) || []
      } catch (e) {
        raw = []
      }

      var answers = {}
      raw.forEach(function (a) { answers[a.name] = a.value })

      var environmentLabel = answers.environment || ''
      var environment = Object.keys(ENVIRONMENT_LABELS).filter(function (key) {
        return ENVIRONMENT_LABELS[key] === environmentLabel
      })[0]
      var name = answers['app-name'] || ''

      var summary = document.getElementById('create-app-error-summary')
      var link = document.getElementById('create-app-error-link')
      var button = document.getElementById('create-app-submit')

      if (!environment || !name) {
        link.textContent = 'Your answers could not be read back. Go back and fill in the form again.'
        link.setAttribute('href', '../')
        summary.hidden = false
        summary.focus()
        return
      }

      button.disabled = true
      button.textContent = 'Creating…'

      Auth.authedFetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, environment: environment })
      }).then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data } })
      }).then(function (result) {
        if (!result.ok) {
          button.disabled = false
          button.textContent = 'Create application'
          link.textContent = result.data.error || 'Something went wrong. Please try again.'
          link.setAttribute('href', '../')
          summary.hidden = false
          summary.focus()
          return
        }

        try {
          window.sessionStorage.setItem('createdApplication', JSON.stringify({
            application: result.data.application,
            apiKey: result.data.apiKey
          }))
        } catch (e) { /* private browsing, etc - confirmation page has a fallback */ }

        window.location.href = Auth.siteUrl('account/applications/new/confirmation/')
      }).catch(function () {
        button.disabled = false
        button.textContent = 'Create application'
        link.textContent = 'Could not reach the applications service. Try again in a moment.'
        link.setAttribute('href', '../')
        summary.hidden = false
        summary.focus()
      })
    })
  }

  // ---- confirmation -----------------------------------------------------

  var confirmationKeyEl = document.getElementById('confirmation-api-key')
  if (confirmationKeyEl) {
    var created = null
    try { created = JSON.parse(window.sessionStorage.getItem('createdApplication')) } catch (e) {}

    if (!created) {
      document.getElementById('confirmation-fallback').hidden = false
      document.querySelector('.govuk-panel').hidden = true
      confirmationKeyEl.hidden = true
      document.querySelector('.govuk-warning-text').hidden = true
      document.querySelector('p.govuk-body').hidden = true
    } else {
      document.getElementById('confirmation-app-name').textContent = created.application.name
      confirmationKeyEl.textContent = created.apiKey
      document.getElementById('confirmation-detail-link').setAttribute(
        'href', Auth.siteUrl('account/applications/detail/?id=' + encodeURIComponent(created.application.id))
      )
      try { window.sessionStorage.removeItem('createdApplication') } catch (e) {}
    }
  }

  // ---- detail page --------------------------------------------------------

  var detailContent = document.getElementById('detail-content')
  if (detailContent) {
    if (!requireSignedIn()) return

    var params = new URLSearchParams(window.location.search)
    var appId = params.get('id')
    var loadingEl = document.getElementById('detail-loading')
    var errorSummary = document.getElementById('detail-error-summary')
    var errorText = document.getElementById('detail-error-text')

    function showDetailError (message) {
      loadingEl.hidden = true
      errorText.textContent = message
      errorSummary.hidden = false
      errorSummary.focus()
    }

    if (!appId) {
      showDetailError('No application was specified.')
    } else {
      loadDetail()
    }

    function loadDetail () {
      Auth.authedFetch('/api/applications/' + encodeURIComponent(appId)).then(function (res) {
        if (res.status === 401) { window.location.href = Auth.siteUrl('sign-in/'); return null }
        if (res.status === 404) { showDetailError('This application could not be found.'); return null }
        return res.json()
      }).then(function (data) {
        if (!data) return
        render(data)
      }).catch(function () {
        showDetailError('Could not load this application. Try again in a moment.')
      })
    }

    function render (data) {
      var app = data.application

      document.getElementById('detail-name').textContent = app.name
      document.getElementById('detail-name-value').textContent = app.name
      document.getElementById('detail-description').textContent = app.description || '—'
      document.getElementById('detail-owner').textContent = app.owner.type === 'user' ? 'Me' : app.owner.type
      document.getElementById('detail-created').textContent = formatDate(app.createdAt)
      document.getElementById('detail-id').textContent = app.id
      document.getElementById('detail-environment').textContent = ENVIRONMENT_LABELS[app.environment] || app.environment

      var keysList = document.getElementById('detail-keys-list')
      keysList.innerHTML = data.apiKeys.filter(function (k) { return !k.revokedAt }).map(function (k) {
        return '<div class="govuk-summary-list__row">' +
          '<dt class="govuk-summary-list__key">Active API key</dt>' +
          '<dd class="govuk-summary-list__value">Created: ' + formatDateTime(k.createdAt) + ' (ends ' + escapeHtml(k.preview) + ')</dd>' +
          '</div>'
      }).join('') || '<div class="govuk-summary-list__row"><dt class="govuk-summary-list__key">Active API keys</dt><dd class="govuk-summary-list__value">None</dd></div>'

      var attrsBody = document.getElementById('attrs-table-body')
      var attrsHint = document.getElementById('attrs-empty-hint')
      var attrEntries = Object.keys(app.customAttributes || {})
      attrsBody.innerHTML = ''
      if (!attrEntries.length) {
        attrsHint.hidden = false
      } else {
        attrsHint.hidden = true
        attrEntries.forEach(function (key) {
          var tr = document.createElement('tr')
          tr.className = 'govuk-table__row'
          tr.innerHTML =
            '<td class="govuk-table__cell"><strong>' + escapeHtml(key) + '</strong></td>' +
            '<td class="govuk-table__cell">' + escapeHtml(app.customAttributes[key]) + '</td>'
          attrsBody.appendChild(tr)
        })
      }

      var apisBody = document.getElementById('apis-table-body')
      var apisHint = document.getElementById('apis-empty-hint')
      var connected = app.connectedApis || []
      apisBody.innerHTML = ''
      if (!connected.length) {
        apisHint.hidden = false
      } else {
        apisHint.hidden = true
        connected.forEach(function (api) {
          var tr = document.createElement('tr')
          tr.className = 'govuk-table__row'
          tr.innerHTML =
            '<td class="govuk-table__cell">' + escapeHtml(api.name) + '</td>' +
            '<td class="govuk-table__cell"><a class="govuk-link" href="#" data-remove-api="' + escapeHtml(api.id) + '">Remove</a></td>'
          apisBody.appendChild(tr)
        })
      }

      loadingEl.hidden = true
      detailContent.hidden = false
    }

    document.getElementById('rotate-key-form').addEventListener('submit', function (event) {
      event.preventDefault()
      Auth.authedFetch('/api/applications/' + encodeURIComponent(appId) + '/api-keys', { method: 'POST' })
        .then(function (res) { return res.json() })
        .then(function (data) {
          var notice = document.getElementById('new-key-notice')
          notice.textContent = 'New API key created: ' + data.apiKey + ' (copy it now, this is the only time it is shown)'
          notice.hidden = false
          loadDetail()
        })
    })

    document.getElementById('add-attr-form').addEventListener('submit', function (event) {
      event.preventDefault()
      var key = document.getElementById('attr-key').value.trim()
      var value = document.getElementById('attr-value').value.trim()
      if (!key) return
      var body = {}
      body[key] = value
      Auth.authedFetch('/api/applications/' + encodeURIComponent(appId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customAttributes: body })
      }).then(function () {
        document.getElementById('attr-key').value = ''
        document.getElementById('attr-value').value = ''
        loadDetail()
      })
    })

    document.getElementById('add-api-form').addEventListener('submit', function (event) {
      event.preventDefault()
      var select = document.getElementById('api-select')
      var apiId = select.value
      var apiName = API_CATALOGUE[apiId]
      Auth.authedFetch('/api/applications/' + encodeURIComponent(appId) + '/connected-apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: apiId, name: apiName })
      }).then(function () { loadDetail() })
    })

    document.getElementById('apis-table-body').addEventListener('click', function (event) {
      var link = event.target.closest('[data-remove-api]')
      if (!link) return
      event.preventDefault()
      Auth.authedFetch('/api/applications/' + encodeURIComponent(appId) + '/connected-apis/' + encodeURIComponent(link.getAttribute('data-remove-api')), {
        method: 'DELETE'
      }).then(function () { loadDetail() })
    })
  }
})
