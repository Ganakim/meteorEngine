import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { UserStatus } from 'meteor/mizzao:user-status'
import { Vector, EngineAnimation, GameObject } from '/lib/engine'

import '/lib/collections'
import '/lib/tools'

Meteor.methods({
  getServerTime(){
    return moment().format('h:mm a')
  }
})

Accounts.onCreateUser((options, user)=>{
  return user
})

Meteor.publish('user', ()=>{
  return Meteor.users.find(Meteor.userId(), {
    fields:{
      parties: 1,
      characters: 1
    }
  })
})

Meteor.publish('users', ()=>{
  return Meteor.users.find({}, {
    fields: {
      
    }
  })
})
