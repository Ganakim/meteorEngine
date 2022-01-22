
import './game.html'
import { Engine, Vector, EngineAnimation } from '/lib/engine'

const engine = new Engine()

// #region Game
Template.game.onCreated(()=>{
  Object.keys(Collections).forEach(a=>{
    Meteor.subscribe(a.toLowerCase(), {
      onError: function(){console.log(`${a} Error:`, arguments)},
      onStop: function(){console.log(`${a} Stopped:`, arguments)},
      onReady: function(){console.log(`${a} Ready:`, Collections[a].find().fetch().length)}
    })
  })
})

Template.game.onRendered(()=>{
  engine.initialize('#GameArea', {
    bg: '#000000',
    size: new Vector(900, 600),
    init(){
      console.log('Initializing Game')
      engine.ui.show('topBar', ['username'])
      engine.ui.show('stats')
      console.log(engine)
    },
    update(){
      
    },
    events: {
      'keyup'(e){
        console.log(e.key)
      }
    }
  })
  engine.startGame()
})

Template.game.helpers({
  ui(){
    let panes = engine.ui
    delete panes.show
    delete panes.hide
    delete panes.remove
    delete panes.clear
    return panes
  }
})

Template.game.events({
  'mouseenter #MaximizeGame'(){
    $('#MaximizeGame>div').addClass('out')
  },
  'mouseleave #MaximizeGame'(){
    $('#MaximizeGame>div').removeClass('out')
  },
  'click #MaximizeGame>div'(){
    engine.toggleFullscreen()
  }
})
// #endregion

// #region topBar
Template.topBar.onCreated(()=>{
  Meteor.call('getServerTime', (err, res)=>{
    Session.set('serverTime', res)
  })
  setInterval(()=>{
    Meteor.call('getServerTime', (err, res)=>{
      Session.set('serverTime', res)
    })
  }, 1000)
})

Template.topBar.helpers({
  clock(){
    return Session.get('serverTime')
  }
})
// #endregion

// #region stats
  Template.stats.helpers({
    
  })
// #endregion
