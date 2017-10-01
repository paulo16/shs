import { Template } from 'meteor/templating';
import moment from 'moment';

import './TmplModalUpdateUser.html';
import './validator.js';

Template.TmplModalUpdateUser.helpers({
    user: function () {
        //console.log('dans la form' + JSON.stringify(Session.get('UserData')));
        let user = Session.get('UserData');
        if (user) {
            //console.log(JSON.stringify(user));
            return user;
        }
        return {};

    },
    equal: function (data1, data2) {
        if (data1 === data2) {
            return "selected";
        }

        return "";

    }
});

Template.TmplModalUpdateUser.events({
    'submit #form-updateuser': function (event, template) {
        event.preventDefault();
        if ($('#_id').val()) {
            let id = $('#_id').val();
            let nom = $('#nom').val()
            let prenom = $('#prenom').val();
            let email = $('#email').val();
            let telephone = $('#telephone').val();
            let password = $('#password').val();
            let pseudo = $('#pseudo').val();
            let role = $('#role').val();
            let numero_agent = $('#numero_agent').val();

            let profile = {
                lastName: nom,
                firstName: prenom,
                phone: telephone,
                numero_agent: numero_agent
            };

            let user = {
                _id: id,
                username: pseudo,
                email: email,
                password: password,
                profile: profile,
                roles: role
            }

            Meteor.call('updateUser', user, (err, res) => {
                if (err) {
                    swal(
                        'Oops...',
                        'Pétit problème, mise à jour non éffectué :( !',
                        'error'
                    );
                } else {
                    swal(
                        'Bien!',
                        'Mise à jour bien éffectuées ',
                        'success'
                    )
                }

            });

        }
    }
});

Template.TmplModalUpdateUser.onRendered(function () {
    $("#form-updateuser").validate({
        rules: {
            "nom": {
                required: true
            },
            "pseudo": {
                required: true
            },
            email: {
                required: true,
                emailUnique: true,
            },
            "role": {
                required: true
            },
            "password": {
                required: true
            },

        },
        messages: {
            "nom": {
                required: " Obligatoire"
            },
            "pseudo": {
                required: " Obligatoire"
            },
            "role": {
                required: " Obligatoire"
            },
            "password": {
                required: " Obligatoire"
            },
            email: {
                required: ' Email obligatoire',
                emailUnique: ' Cet email existe déja !',
            },
        },
    });

});