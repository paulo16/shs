import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './login.html';

Template.login.events({
    'submit': function (event) {
        event.preventDefault();
        var username = event.target.username.value;
        var password = event.target.password.value;
        
        Meteor.loginWithPassword(username,password,function(err){
            if(!err) {
                FlowRouter.go('/');
            }else{
               console.log(err);
            }
        });
    }
});