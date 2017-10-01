import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Accounts } from 'meteor/accounts-base';
import './register.html';

Template.register.events({
    'submit form': function (e) {
        event.preventDefault();
        let pseudo = $('[name=pseudo]').val();
        let nom = $('[name=nom]').val();
        let prenom = $('[name=prenom]').val();
        let email = $('[name=email]').val();
        let telephone = $('[name=telephone]').val();
        let password = $('[name=password]').val();
        let photo = $('[name=photo]').val();
        let role=$('[name=roles]').val();
        let roles =[role];

        let profile = {
            lastName: nom,
            firstName: prenom,
            phone: telephone,
            photo: photo
        };

        let user = {
            username:pseudo,
            email: email,
            password: password,
            profile: profile,
            roles: roles
        }
        console.log('je suis dans register user' + JSON.stringify(user));
        Accounts.createUser(user, function (err) { // Mais quelle est donc cette méthode mystère ?...
            if (err) {
                Bert.alert('Problème lors de l \'insertion', 'warning', 'growl-top-right');
            } else {
                Bert.alert('Utilisateur bien ajouté!', 'success', 'growl-top-right');
                FlowRouter.go('/'); // Ceci est une redirection depuis un event/helper, elle est basée sur le nom de la route

            }

        });

    }
});