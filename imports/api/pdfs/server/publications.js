import { Meteor } from 'meteor/meteor';
import { Pdfs } from '../pdfs.js';

Meteor.publish('pdfs', function () {
    return Pdfs.find({});
});


