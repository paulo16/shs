
import { Meteor } from 'meteor/meteor';

Meteor.publish('users', function () {
  return Meteor.users.find({}, { fields: { username: 1, roles: 1, 'emails.address': 1, profile: 1 } })
});
