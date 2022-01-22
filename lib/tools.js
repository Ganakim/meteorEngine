Tools = {
  transform(a, b){
    if(a && b){
      switch(a){
        case 'u':
        case 'U':
        case 'upper':
        case 'Upper':
        case 'uppercase':
        case 'Uppercase':
          return b.toUpperCase()
        case 'l':
        case 'L':
        case 'lower':
        case 'Lower':
        case 'lowercase':
        case 'Lowercase':
          return b.charAt(0).toLowerCase() + b.slice(1)
        case 'c':
        case 'C':
        case 'caps':
        case 'Caps':
        case 'capital':
        case 'Capital':
        case 'capitalize':
        case 'Capitalize':
          return b.charAt(0).toUpperCase() + b.slice(1)
        case 'h':
        case 'H':
        case 'hyphenate':
        case 'Hyphenate':
          return b.replace(' ', '-')
      }
    }
  },
  join(a, ...b){
    b=b.filter(c=>!(c instanceof Spacebars.kw))
    return a == '[]' ? b : b.join(a)
  },
  split(a, b){
    if(a){
      switch(b){
        case 'keys':
          return Object.keys(a)
        case 'keys.length':
          return Object.keys(a).length
        case 'values':
          return Object.values(a)
        case 'entries':
          return Object.entries(a).map((([a,b])=>({key:a, value:b})))
        default:
          return a.split(b)
      }
    }
  },
  logic(a, b, c, d){
    try{
      if(a == '!'){
        return !b
      }
      if(a == 'typeof'){
        return typeof b
      }
      if(b == 'in'){
        return c.includes(a)
      }
      if(b == '?'){
        return a ? c : d
      }
      var s = `(${typeof a == 'string' ? `${JSON.stringify(a)}` : typeof a == 'object' ? JSON.stringify(a) : a}) ${b} (${typeof c == 'string' ? `${JSON.stringify(c)}` : typeof c == 'object' ? JSON.stringify(c) : c})`
      if(['=', '==', '===', '!=', '!==', '<', '<=', '>', '>=', '+', '-', '*', '/', '%', '&&', '||'].includes(b)){
        return eval(s)
      }
    }
    catch(err){
      console.log('LOGIC ERROR', a, b, c, s, err)
      throw err
    }
  },
  get(a){
    if(a.includes('.')){
      var steps = a.split('.')
      var base = Session.get(steps.shift())
      if(base){
        return steps.reduce((b, c)=>{
          return b && b[c]
        }, base)
      }
    }else{
      return Session.get(a)
    }
  },
  log(...a){
    a=a.filter(b=>!(b instanceof Spacebars.kw))
    console.log(...a)
  },
  formatTime(time, newFormat, oldFormat){
    if(oldFormat.hash != undefined){
      oldFormat = undefined
    }
    return (time ?  moment(time, oldFormat) : moment()).format(newFormat)
  },
  search(collection, id, part){
    if(collection instanceof Spacebars.kw){
      collection = undefined
    }
    if(id instanceof Spacebars.kw){
      id = undefined
    }
    if(part instanceof Spacebars.kw){
      part = undefined
    }
    var result
    if(id){
      result = Collections[collection].findOne(id)
    }else{
      result = Collections[collection].find(/*where ? where : */{}, {many:true}).fetch()
    }
    if(result){
      if(part && typeof part == 'string'){
        var parts = part.split('.')
        if(parts.length > 1){
          return parts.reduce((a,i)=>a[i], result)
        }else{
          return result?.[part]
        }
      }else{
        return result
      }
    }
  },
  randomFrom(a){
    return a[Math.floor(Math.random()*a.length)]
  },
  fullscreen(elem, dep){
    let isFullscreen = (window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)
    if(!elem && elem !== undefined){
      return closeFullscreen(dep)
    }else if(elem){
      return openFullscreen(elem, dep)
    }else{
      return isFullscreen
    }
  }
}

if(Meteor.isClient){
  for(var helper in Tools){
    Template.registerHelper(helper, Tools[helper])
  }
}

function openFullscreen(elem, dep) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
  dep && dep.changed()
  return true
}

function closeFullscreen(dep) {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
  dep && dep.changed()
  return false
}
