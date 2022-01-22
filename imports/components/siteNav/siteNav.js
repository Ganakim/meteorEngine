import './siteNav.html'

Template.siteNav.helpers({
  navLinks(){
    return [
      {text:'Game', link:'game'}
    ]
  }
})

Template.siteNav.events({
  'click #Login'(e){
    askForLogin()
  },
  'click #Logout'(e){
    Meteor.logout(()=>{
      if(customRouter.currentRoute.path == 'game'){
        customRouter.go('home')
      }
    })
  },
  'click .navLinks>div'(e){
    customRouter.go(this.link)
  }
})

function askForSignup(error){
  prompt({
    title: 'Sign Up',
    inputs: [
      {name:'username', type:'text', label:'Username'},
      {name:'password', type:'password', label:'Password'},
      {name:'confirmPassword', type:'password', label:'Confirm Password'},
    ],
    error: error?.reason,
    actions: [
      {text:'Sign Up', color:'primary', action(form){
        if(form.password == form.confirmPassword){
          Accounts.createUser({username:form.username, password:form.password}, (err)=>{
            if(err){
              askForSignup(err, form.username)
            }else{
              modal().close()
              customRouter.go(window.location.href)
            }
          })
        }else{
          askForSignup({error:'match', reason:'Passwords do not match'}, form.username)
        }
      }},
      {text:'Or, log in', color:'link', action(){
        askForLogin()
      }}
    ]
  })
}

function askForLogin(error){
  prompt({
    title: 'Log In',
    error: [400, 403].includes(error?.error) ? 'Incorrect password' : '',
    inputs: [
      {name:'username', type:'text', label:'Username'},
      {name:'password', type:'password', label:'Password'},
    ],
    actions: [
      {text:'Log In', color:'primary', action(form){
        Meteor.loginWithPassword(form.username, form.password, (err)=>{
          if(err){
            askForLogin(err, form.username)
          }else{
            modal().close()
            customRouter.go(window.location.href)
          }
        })
      }},
      {text:'Or, sign up', color:'link', action(){
        askForSignup()
      }}
    ]
  })
}
