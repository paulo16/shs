import { Meteor } from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import 'meteor/alanning:roles';
import { Users } from './users.js';
import 'meteor/monbro:mongodb-mapreduce-aggregation';

Meteor.users.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, doc, fieldNames, modifier) {
        return true;
    },
    remove: function (userId, doc) {
        return true;
    }
});

Meteor.methods({

    nombreAgent: function () {
        return Meteor.users.find().count();
    },

    insertUser: function (newUser) {
        var id = Accounts.createUser(newUser);

        if (newUser.roles.length > 0) {
            // Need _id of existing user record so this call must come
            // after `Accounts.createUser` or `Accounts.onCreate`
            Roles.addUsersToRoles(id, newUser.roles);
        }
        console.log('id serveur ' + id);
        return id;
    },
    synchroUsers: function () {
        var Future = Npm.require('fibers/future');
        var fut = new Future();

        var config = JSON.parse(Assets.getText('config-server.json'));
        var remoteConnection = DDP.connect(config.url_serveur);
        console.log('Url: ' + config.url_serveur);

        if (remoteConnection.status != 'failed' && remoteConnection.status != 'offline') {
            console.log('Debut synchro ');
            var remoteUsers = new Mongo.Collection('users', remoteConnection);
            // Subscribe to items collection we got via DDP
            remoteConnection.subscribe('users', function () {

                // Find in items and observe changes
                remoteUsers.find().observeChanges({

                    // When collection changed, find #results element and publish result inside it
                    changed: function (id, fields) {
                        //console.log('NEW-' + JSON.stringify(fields));
                        if (fields.profile.numero_agent) {
                            Meteor.users.update({
                                numero_agent: fields.profile.numero_agent
                            }, {
                                    $set: {
                                        username: fields.username,
                                        password: fields.password,
                                        emails: fields.emails,
                                        profile: fields.profile,
                                        services: fields.services,
                                        roles: fields.roles,
                                    }
                                },
                                { upsert: true }
                            );
                        }
                    },
                    added: function (id, fields) {
                        if (fields.numero_agent) {
                            Meteor.users.update({
                                numero_agent: fields.profile.numero_agent
                            }, {
                                    $set: {
                                        username: fields.username,
                                        password: fields.password,
                                        createdAt: fields.createdAt,
                                        emails: fields.emails,
                                        profile: fields.profile,
                                        services: fields.services,
                                        roles: fields.roles,
                                    }
                                },
                                { upsert: true }
                            );
                        }
                    },
                    removed: function (id) {
                        console.log('remove-' + JSON.stringify(id));
                        Meteor.users.remove(id);
                    }
                });

                console.log('synchro down collection distante ok ');

                let usersLocals = Meteor.users.find({}, { fields: { 'profile.numero_agent': 1 } }).fetch();
                let arrusersLocals = [];
                usersLocals.forEach(function (element) {
                    arrusersLocals.push(element.profile.numero_agent);
                });

                let usersDistants = remoteUsers.find({}, { fields: { 'profile.numero_agent': 1 } }).fetch();
                let arrusersDistants = [];
                usersDistants.forEach(function (element) {
                    arrusersDistants.push(element.profile.numero_agent);
                });

                let array_numeroAgent_remote = _.uniq(_.difference(arrusersLocals, arrusersDistants));
                //console.log('array_numeroAgent_remote :' + JSON.stringify(array_numeroAgent_remote));
                let array_users_addremote = Meteor.users.find({ 'profile.numero_agent': { $in: array_numeroAgent_remote } }).fetch();
                //console.log(' array_users_addremote :' + JSON.stringify(array_users_addremote));

                array_users_addremote.forEach(function (element) {
                    delete element._id;
                    //delete element.profile.numero_agent;
                    //console.log(element);
                    remoteUsers.insert(element);
                });
                console.log('synchro up collection distante ok ');

                fut.return("Synchronisation Users complete !");
            });

        } else {
            console.log('connection fermé coté distant ! veillez verifier ');
        }

        return fut.wait();
    },
    removeUser: function (id) {
        let Future = Npm.require('fibers/future');
        let fut = new Future();
        //console.log('id : ' + id);
        Meteor.users.remove({ _id: id }, (err) => {
            if (err) throw new Meteor.Error("suppression", "erreur lors de la suppresion", err);
            fut.return(true);
        });
        return fut.wait();
    },
    updateUser: function (user) {
        if (user._id) {
            //console.log('id user' + user._id);
            Meteor.users.update({
                _id: user._id
            }, {
                    $set: {
                        username: user.username,
                        'emails.0.address': user.email,
                        profile: user.profile,
                        //services: user.services,
                        roles: user.roles,
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            Accounts.setPassword(user._id, user.password);
            //
        }

    }

});

