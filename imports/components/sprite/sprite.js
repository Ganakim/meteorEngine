import './sprite.html'

Template.sprite.helpers({
  getFrame(frame = 0){
    return this.frames[frame]
  },
  fixSize(){
    this.animation.loaded.depend()
    if(this.animation.srcWidth && this.animation.srcHeight){
      $(`#Sprite-${this.id} image`).each((i, a)=>{
        a.style.width = this.animation.srcWidth
        a.style.height = this.animation.srcHeight
      })
    }
  }
})
