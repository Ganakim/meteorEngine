import { check, Match } from 'meteor/check'
import { Vector, EngineAnimation } from '/lib/engine'

Collections = {
  Users: Meteor.users
}


function functionify(obj){
  Object.entries(obj).forEach(([key, val])=>{
    if(typeof val == 'string' && /^function \([\w ]*\) {[\S\s]*}$/.test(val)){
      obj[key] = new Function(`return ${val}`)()
    }else if(typeof val == 'object'){
      functionify(val)
    }
  })
}
