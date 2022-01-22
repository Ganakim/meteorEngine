import { Template } from 'meteor/templating'
import './main.html'
import '/lib/collections'
import '/lib/tools'
//Componenets
import '/imports/components/siteNav/siteNav'
import '/imports/components/siteModal/siteModal'
import '/imports/components/sprite/sprite'
//pages
import '/imports/pages/home/home'
import '/imports/pages/game/game'
import '/imports/pages/test/test'
import '/imports/pages/wiki/wiki'
import '/imports/pages/about/about'
import '/imports/pages/404/404'

require('jquery')
require('jquery-ui')
require('jquery-ui-sortable-npm')
require('popper.js')
require('bootstrap')

Meteor.startup(()=>{
  Session.set('userSubLoaded', false)
  let timer
  $(window).on('resize', e=>{
    clearTimeout(timer)
    timer = setTimeout(()=>{
      $('body>div:not(#SiteNav):not(#SiteModal)').css({
        height: $(window).height() - $('#SiteNav').outerHeight(),
        marginTop: $('#SiteNav').outerHeight()
      })
    }, 300)
  })
})

Template.body.helpers({
  modalInfo(){
    return modal().title || modal().message
  }
})

Template.body.events({
  'click [dropdown]'(e){
    const target = $(e.target).closest('[dropdown]')
    const dropTarget = $(target.attr('dropdown'))
    if(dropTarget[0]){
      e.stopPropagation()
      $(`[dropdown="true"]:not(${target.attr('dropdown')})`).attr({dropdown: 'false'})
      dropTarget.attr({dropdown: dropTarget.attr('dropdown') == 'true' ? 'false' : 'true'})
      dropTarget.parents('[dropdown="false"]').attr({dropdown: 'true'})
    }
  },
  'click *:not(#SiteModal):not(#SiteModal *)'(e){
    if(!($(e.target).is('[dropdown]') || $(e.target).is('[dropdown] *'))){
      $('[dropdown="true"]:not([locked="true"])').attr({dropdown: 'false'})
    }
  }
})

let routerDep = new Tracker.Dependency()
customRouter = {
  routes:{
    'notFound'(route){
      console.log('404 - Route Not Found.', route)
      customRouter.go('404')
    },
    ':page'(params, queryParams){
      if(Template[params.page]){
        Session.set('page', {path:params.page, data:queryParams})
      }else{
        customRouter.go('notFound')
      }
    },
    'wiki/:item'(params, queryParams){
      Session.set('page', {path:'wiki', data:queryParams, section:params.item})
    },
  },
  protected:[
    'wiki'
  ],
  get currentRoute(){
    return this._route
  },
  go(path){
    if(Session.get('userSubLoaded')){
      var route = Object.keys(this.routes).map(a=>{
        var routeRegex = RegExp(`^${a.replace(/(:(\w+))/gm, '(?<$2>[-\\w]+)')}$`.replaceAll('/', '\\/'))
        var cleanedPath = path.match(`^(${Meteor.absoluteUrl()})?(?<newRoute>[^\?]+)(\\?|$)`).groups.newRoute
        if(routeRegex.test(cleanedPath.replace(/\/$/, ''))){
          var params = {}
          Object.entries(cleanedPath.replace(/\/$/, '').match(routeRegex).groups || {}).map(([i,b])=>params[i] = isFinite(b) ? parseInt(b) : b)
          var queries = {}
          path.replace(/^[^\?]+(\?|$)/, '').split('&').filter(a=>a.length).map(a=>queries[a.split('=')[0]]=isFinite(a.split('=')[1]) ? parseInt(a.split('=')[1]) : a.split('=')[1])
          return {
            fullPath: path.replace(Meteor.absoluteUrl(), ''),
            path: cleanedPath,
            matchedRoute: a,
            params: params,
            queryParams: queries
          }
        }
        return false
      }).find(a=>a)
      if(!route || route.path == 'undefined'){
        this.go('home')
      }else{
        if(this.protected.includes(route.path) && !(Meteor.user?.permissions || []).includes(route.path)){
          alert('Not Authenticated')
          customRouter.go('403')
        }else{
          if(this._route?.fullPath == route.fullPath){
            location.reload()
          }
          this._route = route
          window.history.pushState("", "", `/${route.fullPath}`)
          this.routes[route.matchedRoute](route.params, route.queryParams)
          setTimeout(()=>{
            $(window).trigger('resize')
          }, 100)
        }
      }
    }else{
      console.log('waiting on subs')
      setTimeout(()=>{customRouter.go(path)}, 100)
    }
  }
}

modal = ()=>{
  routerDep.depend()
  return {
    ...customRouter.modal,
    close(){
      customRouter.modal = null
      routerDep.changed()
    }
  }
}

alert = (a)=>{
  if(a){
    if(typeof a == 'string'){
      customRouter.modal = {title:'', message:a, actions:[{text:'Ok', color:'secondary'}]}
    }else{
      customRouter.modal = {title:a.title||'Alert', message:a.message||'', actions:a.actions||[{text:'Ok', color:'secondary'}]}
    }
    routerDep.changed()
  }
  return modal()
}

prompt = (p)=>{
  if(p){
    customRouter.modal = {
      title: p.title||'Prompt',
      message: p.message||'',
      inputs: p.inputs||[],
      error: p.error||'',
      actions: p.actions||[
        {text:'Ok', color:'secondary'}
      ]}
    routerDep.changed()
  }
  return modal()
}

Meteor.subscribe('user', {
  onError: function(){console.log(`userSub Error:`, arguments)},
  onStop: function(){console.log(`userSub Stopped:`, arguments)},
  onReady: function(){
    console.log(`Welcome ${Meteor.user() ? `back ${Meteor.user().username}` : 'Guest'}`)
    Session.set('userSubLoaded', true)
    customRouter.go(window.location.href)
  }
})
