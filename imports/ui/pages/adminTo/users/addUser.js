import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Accounts } from 'meteor/accounts-base';
import './addUser.html';
import './validator.js';

Template.addUser.events({
    'submit #add-user': function (e) {
        event.preventDefault();

        let nom = $('[name=nom]').val()
        let prenom = $('[name=prenom]').val();
        let email = $('[name=email]').val();
        let telephone = $('[name=telephone]').val();
        let password = $('[name=password]').val();
        let pseudo = $('[name=pseudo]').val();
        let role = [$('[name=role]').val()];
        let numero_agent = $('[name=numero_agent]').val();

        let profile = {
            lastName: nom,
            firstName: prenom,
            phone: telephone,
            numero_agent: numero_agent
        };

        let user = {
            username: pseudo,
            email: email,
            password: password,
            profile: profile,
            roles: role
        }
        console.log('je suis dans register user' + JSON.stringify(user));


        Meteor.call('insertUser', user, (err, id) => {
            // Mais quelle est donc cette méthode mystère ?...

            if (id) {
                console.log('id - ' + id);

                Bert.alert('Utilisateur bien ajouté!', 'success', 'growl-top-right');
                FlowRouter.go('listUsers'); // Ceci est une redirection depuis un event/helper, elle est basée sur le nom de la route

            } else {
                Bert.alert('Problème lors de l \'insertion', 'warning', 'growl-top-right');
            }
        });

    }
});

Template.addUser.onRendered(function () {
    $("#add-user").validate({
        rules: {
            nom: {
                required: true,
                minlength: 2
            },
            prenom: {
                required: true,
                minlength: 2
            },
            password: {
                required: true,
                minlength: 5
            },
            pseudo: {
                required: true
            },
            email: {
                required: true,
                emailUnique: true,
            },
            role: {
                required: true
            },
            'numero_agent': {
                required: true
            }
        },
        messages: {
            nom: {
                required: 'Nom obligatoire',
            },
            prenom: {
                required: 'Prénom obligatoire',
            },
            pseudo: {
                required: 'pseudo obligatoire',
            },
            password: {
                required: 'Mot de passe obligatoire',
            },
            email: {
                required: 'Email obligatoire',
                emailUnique: 'Cet email existe déja !',
            },
            role: {
                required: 'role obligatoire',
            },
            'numero_agent': {
                required: 'Numéro obligatoire',
            }
        },
    });
})