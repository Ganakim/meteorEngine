import './siteModal.html'

Template.siteModal.helpers({
  modalInfo(){
    return modal()
  },
  fadeErrors(){
    $('small.text-danger').show()
    setTimeout(()=>{
      $('small.text-danger').fadeOut()
    }, 1000)
  }
})

Template.siteModal.events({
  'click #SiteModalShroud'(e){
    if(e.target.id == 'SiteModalShroud'){
      modal().close()
      if(customRouter.currentRoute.path == 'game'){
        customRouter.go('home')
      }
    }
  },
  'keyup #SiteModal'(e){
    if(e.keyCode == 13){
      $('#SiteModal .card-footer>.btn').first().trigger('click')
    }
  },
  'click [id*="SiteModalAction-"]'(e){
    if(this.action){
      let formInfo = {}
      $('[id*="SiteModalInput-"]').each((i, a)=>{
        formInfo[a.id.replace('SiteModalInput-', '')] = a.value
      })
      this.action(formInfo)
    }else{
      modal().close()
      if(customRouter.currentRoute.path == 'game'){
        customRouter.go('home')
      }
    }
  }
})