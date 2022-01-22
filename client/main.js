import { Template } from 'meteor/templating'
import { Engine, Vector, EngineAnimation } from '/lib/engine'
import './main.html'
import '/lib/collections'
import '/lib/tools'
//Componenets
import '/imports/components/siteModal/siteModal'
import '/imports/components/sprite/sprite'
//pages

require('jquery')
require('jquery-ui')
require('jquery-ui-sortable-npm')
require('popper.js')
require('bootstrap')

const engine = new Engine()

// #region Game
Template.body.onCreated(()=>{
  // Object.keys(Collections).forEach(a=>{
  //   Meteor.subscribe(a.toLowerCase(), {
  //     onError: function(){console.log(`${a} Error:`, arguments)},
  //     onStop: function(){console.log(`${a} Stopped:`, arguments)},
  //     onReady: function(){console.log(`${a} Ready:`, Collections[a].find().fetch().length)}
  //   })
  // })
})

Template.body.onRendered(()=>{
  engine.initialize('#GameArea', {
    bg: '#1d1d1d',
    size: new Vector(900, 600),
    init(){
      console.log('Initializing Game')
      engine.ui.show('topBar', ['username'])
      engine.ui.show('stats')
      console.log(engine)

      // Creating a gameobject
      engine.player = engine.GameObject({
        position: new Vector(0, 50),
        scale: new Vector(50, 50),
        animations: {
          idle: new EngineAnimation('solidColor.png', new Vector(), new Vector(1, 1))
        },
        init(){
          this.speed = 10
        },
        update(){
          // Do sprite specific things here
          if(engine.getKey(['w', 'ArrowUp'])){
            this.y -= this.speed
          }
          if(engine.getKey(['s', 'ArrowDown'])){
            this.y += this.speed
          }
        }
      })
      console.log(this.player)
    },
    update(){
      // Do scene update things here
      if(engine.getKey(['a', 'ArrowLeft'])){
        this.player.x -= this.player.speed
      }
      if(engine.getKey(['d', 'ArrowRight'])){
        this.player.x += this.player.speed
      }
    },
    events: { // You can hook directly into DOM events here
      'keyup'(e){
        console.log(e.key)
      }
    }
  })
  engine.startGame()
})

Template.body.helpers({
  ui(){
    let panes = engine.ui
    delete panes.show
    delete panes.hide
    delete panes.remove
    delete panes.clear
    return panes
  }
})

Template.body.events({
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
// #endregion
