import { Meteor } from 'meteor/meteor'
import { Vector, EngineAnimation, GameObject } from '/lib/engine'

import '/lib/collections'
import '/lib/tools'

Meteor.methods({
  getServerTime(){
    return moment().format('h:mm a')
  }
})
