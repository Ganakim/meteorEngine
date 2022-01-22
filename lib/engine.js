class Vector {
  constructor(x, y){
    if(x == undefined){
      this.x = 0
      this.y = 0
    }else if (y == undefined){
      if(x.x == undefined){
        throw new Meteor.Error('402', 'Single argument Vectors require an x property')
      }
      if(x.y == undefined){
        throw new Meteor.Error('402', 'Single argument Vectors require a y property')
      }
      this.x = x.x
      this.y = x.y
    }else{
      this.x = x
      this.y = y
    }
  }
  get(operator, v2){
    switch(operator){
      case '+':
        return new Vector(this.x + v2.x, this.y + v2.y)
      case '+=':
        this.x += v2.x
        this.y += v2.y
        return this
      case '-':
        return new Vector(this.x - v2.x, this.y - v2.y)
      case '-=':
        this.x -= v2.x
        this.y -= v2.y
        return this
      case '*':
        return new Vector(this.x * v2.x, this.y * v2.y)
      case '*=':
        this.x *= v2.x
        this.y *= v2.y
        return this
      case '/':
        return new Vector(this.x / v2.x, this.y / v2.y)
      case '/=':
        this.x /= v2.x
        this.y /= v2.y
        return this
      case 'distance':
        return Math.sqrt(((v2.x - this.x) * 2) + ((v2.y - this.y) * 2))
      case 'angle':
        return Math.atan2(this.y - v2.y, this.x - v2.x) * (180 / Math.PI)
    }
  }
}

class EngineAnimation{
  #tileset
  #layers
  constructor(tileset = 'blank.png', start = new Vector(), tileSize = new Vector(), layers = []){
    this.#tileset = tileset
    this.start = start
    this.tileSize = tileSize
    this.#layers = layers
    this.srcWidth = 0
    this.srcHeight = 0
    this.loaded = new Tracker.Dependency()
    this.load()
  }
  get tileset(){
    return this.#tileset
  }
  set tileset(newTileset){
    this.#tileset = newTileset
    this.load()
  }
  get layers(){
    return this.#layers.map((a, i)=>({...a, frames: Array(a.length || 1).fill(0).map((b, j)=>({
      ...b,
      width: this.tileSize.x,
      height: this.tileSize.y,
      top: this.start.y + (this.tileSize.y * i),
      right: this.start.x + (this.tileSize.x * (j+1)),
      bottom: this.start.y + (this.tileSize.y * (i+1)),
      left: this.start.x + (this.tileSize.x * j)
    }))}))
  }
  load(){
    let img = new Image()
    let resize = (width, height)=>{
      if(!width || !height){
        this.srcWidth = 0
        this.srcHeight = 0
        console.log('Invalid src:', this.#tileset)
        this.#tileset = null
      }else if(this.srcWidth != width || this.srcHeight != height){
        this.srcWidth = width
        this.srcHeight = height
        this.loaded.changed()
      }
    }
    img.onload = function(){
      resize(this.width, this.height)
    }
    img.src = this.tileset
  }
  colorize(colors){
    Object.entries(colors).forEach(([layerID, color])=>{
      let layer = this.#layers.find(a=>a.id == layerID)
      if(layer){
        layer.color = color
      }
    })
    return this
  }
}

class GameObject {
  #parent
  #opacity
  #visible
  #init
  #update
  #destroy
  #getParent
  #getChildren
  animations
  #animation
  frame
  #initialized
  #attach
  constructor(engine, position = new Vector(), rotation = 0, scale = new Vector(1,1), parent = null, animations = {}, animation = null, frame = 0, anchor = new Vector(1,1), zIndex = 0, opacity = 'inherit', visible = 'inherit', init, update, destroy, events = {}){
    do{
      this.id = (Math.random() + 1).toString(36).slice(2,10)
    }while(Object.keys(engine.gameObjects).includes(this.id))
    engine.gameObjects[this.id] = this
    this.#parent = parent
    if(Object.keys(animations).length){
      this.animations = animations
      this.#animation = animation || (this.animations.idle ? 'idle' : Object.keys(this.animations)[0])
      this.frame = frame
    }
    this.anchor = anchor
    this.zIndex = zIndex
    this.position = position
    this.rotation = rotation
    this.scale = scale
    this.#opacity = opacity
    this.#visible = visible
    this.#init = init ? init.bind(this) : null
    this.#update = update ? update.bind(this) : null
    this.#destroy = destroy ? destroy.bind(this) : null
    this.initialized = false
    this.#attach = parent !== null
    this.events = events || {}
    this.#initialized = false
    this.dep = new Tracker.Dependency()
    this.#getParent = ()=>{
      return this.#parent ? engine.gameObjects[this.#parent] : null
    }
    this.#getChildren = ()=>{
      return Object.values(engine.gameObjects).filter(a=>a.parent?.id == this.id)
    }
    // this.#setAnimationFrame = ()=>{
    //   this.sprite.find('image').each((i, a)=>{
    //     a.setAttribute('href', this.animations[this.animation].tileset)
    //   })
    //   if(this.animation.toLowerCase().includes('layers')){
    //     this.width = Math.max(...this.animations[this.animation].frames.map(a=>a.width))
    //     this.height = Math.max(...this.animations[this.animation].frames.map(a=>a.height))
    //   }else{
    //     this.width = this.animations[this.animation].frames[this.frame].width
    //     this.height = this.animations[this.animation].frames[this.frame].height
    //   }
    // }
  }
  set parent(obj){
    this.#parent = obj.id
    this.#attach = true
    this.dep.changed()
  }
  get parent(){
    return this.#getParent()
  }
  get chrildren(){
    return this.#getChildren()
  }
  get globalPosition(){
    return this.#parent ? this.parent.globalPosition.get('+', this.position) : this.position
  }
  set opacity(newOpacity){
    this.#opacity = newOpacity
    this.dep.changed()
  }
  get opacity(){
    return this.#opacity == 'inherit' ? (this.#parent ? this.parent.opacity : this.#opacity) : this.#opacity
  }
  set visible(newVisible){
    this.#visible = newVisible
    this.dep.changed()
  }
  get visible(){
    return this.#visible == 'inherit' ? (this.#parent ? this.parent.visible : this.#visible) : this.#visible
  }
  get animation(){
    return this.animations[this.#animation]
  }
  set animation(newAnimation){
    if(this.animations[newAnimation]){
      this.#animation = newAnimation
    }
  }
  addChild(...chrildren){
    [...chrildren].flat().forEach(child=>{
      child.parent = this.id
    })
    this.dep.changed()
  }
  update(gameArea){
    if(this.attach){
      if(!this.#initialized){
        Blaze.renderWithData(Template.sprite, this, this.parent?.sprite?.[0] || gameArea)
        this.sprite = $(`#Sprite-${this.id}`)
      }
      //
      this.sprite.find('image').each((i, a)=>{
        a.setAttribute('href', this.animations[this.animation].tileset)
      })
      if(this.animation.toLowerCase().includes('layers')){
        this.width = Math.max(...this.animations[this.animation].frames.map(a=>a.width))
        this.height = Math.max(...this.animations[this.animation].frames.map(a=>a.height))
      }else{
        this.width = this.animations[this.animation].frames[this.frame].width
        this.height = this.animations[this.animation].frames[this.frame].height
      }
      //
      let offset = this.anchor.get('*', new Vector(this.width/2, this.height/2))
      this.sprite.css({
        left: this.position.x - offset.x,
        top: this.position.y - offset.y,
        width: this.width,
        height: this.height,
        'z-index': this.zIndex,
        transform: `rotate(${this.rotation}deg)`,
        display: this.visible ? 'block' : 'none',
        opacity: this.opacity
      })
      if(!this.#initialized){
        if(this.#init){
          this.#init()
        }
        this.#initialized = true
      }
      if(this.#update){
        this.#update(gameArea)
      }
      this.chrildren.forEach(a=>a.update())
    }
  }
  destroy(){
    this.#destroy && this.#destroy()
    this.chrildren.forEach(a=>{
      a.destroy()
    })
    Blaze.remove(this.sprite)
    // this.sprite.remove()
    delete engine.gameObjects[this.id]
  }
}

class Engine{
  #keysDown
  #keysReleased
  #keyRemoveTimers
  #last
  #mouse
  #area
  #initialized
  #ui
  constructor(){
    this.fps = 0
    this.dep = new Tracker.Dependency()
    this.gameObjects = {}
    this.area = null
    this.scene = null
    this.#last = 0
    this.#keysDown = {}
    this.#keysReleased = {}
    this.#keyRemoveTimers = {}
    this.#mouse = {
      x: 0,
      y: 0,
      down: false,
    }
    this.#initialized = false
  }
  get ui(){
    this.dep.depend()
    return {
      ...this.#ui,
      show:(name, data)=>{
        if(name){
          if(this.#ui[name]){
            this.#ui[name].visible = true
          }else{
            this.#ui[name] = {visible:true, data}
          }
          this.dep.changed()
        }
      },
      hide:(name)=>{
        if(name && this.#ui[name]){
          this.#ui[name].visible = false
          this.dep.changed()
        }
      },
      remove:(name)=>{
        if(name && this.#ui[name]){
          delete this.#ui[name]
          this.dep.changed()
        }
      },
      clear:()=>{
        this.#ui = {}
        this.dep.changed()
      }
    }
  }
  get mouse(){
    this.dep.depend()
    return {
      x: this.#mouse.x,
      y: this.#mouse.y,
      position: new Vector(this.#mouse.x, this.#mouse.y),
      down: this.#mouse.down
    }
  }
  getKey(keys, type = 'down'){
    return [...keys].flat().some(key=>this[type == 'down' ? 'keysDown' : 'keysReleased'][key])
  }
  startGame(){
    if(this.#initialized){
      Template.game.events({
        [`mousemove ${this.#area.attr('id')}`](e){
          engine.#mouse.x = e.clientX
          engine.#mouse.y = e.clientY
          this.dep.changed()
        },
        [`mousedown ${this.#area.attr('id')}`](e){
          engine.#mouse.down = engine.gameObjects[$(e.target).closest('[id*="Sprite-"').attr('id').replace('Sprite-', '')]
          this.dep.changed()
        },
        [`mouseup ${this.#area.attr('id')}`](e){
          engine.#mouse.down = false
          this.dep.changed()
        },
        [`keyDown ${this.#area.attr('id')}`](e){
          if(!Object.keys(engine.#keysDown).includes(e.key)){
            engine.#keysDown[e.key] = true
          }
          if(engine.#keyRemoveTimers[e.key]){
            clearTimeout(engine.#keyRemoveTimers[e.key])
          }
        },
        [`keyup ${this.#area.attr('id')}`](e){
          delete engine.#keysDown[e.key]
          engine.#keysReleased[e.key] = true
          engine.#keyRemoveTimers[e.key] = setTimeout(()=>{
            delete engine.#keysReleased[e.key]
            delete engine.#keyRemoveTimers[e.key]
          }, 10)
        }
      })
      // this.#area.parent().on('click dblclick mouseenter mouseleave mousedown mouseup', e=>{
      //   let target = this.gameObjects[$(e.target).closest('[id*="Sprite-"').attr('id').replace('Sprite-', '')]
      //   if(target.events?.[e.type]){
      //     target.events[e.type](e)
      //   }
      // })
      window.requestAnimationFrame(this.gameLoop.bind(this))
    }
  }
  initialize(gameSpace, data){
    this.ui.clear()
    this.#area = $(gameSpace)
    this.width = data.size.x
    this.height = data.size.y
    let areaInfo = {
      position: 'relative',
      width: 0,
      height: 0,
    }
    if(data.bg){
      if(/^#[0-9a-fA-f]{6}$/.test(data.bg)){
        areaInfo.backgroundColor = data.bg
      }else{
        areaInfo.backgroundImage = `url(${data.bg})`
        areaInfo.backgroundSize = 'cover'
        areaInfo.backgroundPosition = 'center'
      }
    }else{
      areaInfo.backgroundColor = '#000000'
    }
    this.#area.css(areaInfo).prop('tabindex', 0)
    this.scale = new Vector()
    this.update = data.update
    Object.entries(data.events).forEach(([event, handler])=>{
      this.#area.on(event, handler)
    })
    let timer
    $(window).on('resize', e=>{
      clearTimeout(timer)
      timer = setTimeout(()=>{
        let ow = this.#area.parent().width()
        let oh = this.#area.parent().height()
        let iw = this.width
        let ih = this.height
        this.scale = ow-iw <= oh-ih ? ow/iw : oh/ih
        this.#area.width(this.width * this.scale)
        this.#area.height(this.height * this.scale)
      }, 300)
    })
    $(window).trigger('resize')
    if(data.init){
      data.init()
    }
    this.#initialized = true
  }
  gameLoop(timestamp){
    let newFps = Math.ceil(1/((timestamp-this.#last)/1000))
    this.fps = newFps
    Session.set('fps', this.fps)
    if(this.update){
      this.update()
      Object.values(this.gameObjects).filter(a=>a.parent === null).forEach(a=>{
        a.update(this.#area[0])
      })
    }
    this.#last = timestamp
    window.requestAnimationFrame(this.gameLoop.bind(this))
  }
  GameObject(data = {}){
    return new GameObject(this, data.position, data.rotation, data.scale, data.parent, data.animations, data.animation, data.frame, data.anchor, data.zIndex, data.opacity, data.visible, data.init, data.update, data.destroy, data.events)
  }
  toggleFullscreen(){
    Tools.fullscreen(Tools.fullscreen() ? false : this.#area.parent()[0])
    this.dep.changed()
  }
}

export { Engine, Vector, EngineAnimation }