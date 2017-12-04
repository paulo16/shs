import 'meteor/alanning:roles';
import 'chart.js';
import 'meteor/natestrauser:select2';
import 'meteor/themeteorchef:jquery-validation';
import "./dashboard.html";
import {
    Meteor
} from 'meteor/meteor';

Template.dashboard.onRendered(function () {

    $('#date-debut').datepicker({
        format: 'dd-mm-yyyy',
    });
    $('#date-fin').datepicker({
        format: 'dd-mm-yyyy',
    });

    var loggedInUser = Meteor.user();
    var ctx1 = this.find("#clients-province").getContext('2d');

    Meteor.call('findClientParProvince', (error, result) => {
        if (error) {
            console.log(error);
        } else if (result) {
            //console.log(result);
            let labels = [];
            let data = [];
            result.forEach(function (element) {
                labels.push(element._id);
                data.push(element.count);
            });

            var myChart1 = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'clients par province',
                        data: data,
                        backgroundColor: 'rgba(153, 102, 255, 1)',
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

        }
    });

    if (Roles.userIsInRole(loggedInUser, ['admin'])) {
        var ctx2 = this.find("#montants-province").getContext('2d');

        Meteor.call('findPaiementParProvince', (error, result) => {
            if (error) {
                console.log(error);
            } else if (result) {
                //console.log(result);
                let labels = [];
                let data = [];
                result.forEach(function (element) {
                    labels.push(element._id);
                    data.push(element.total);
                });

                var myChart2 = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: ' Payements par province',
                            data: data,
                            backgroundColor: 'rgba(255, 159, 64, 1)',
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });

            }
        });
    }

    showStatsAgents(Meteor.user().username);

});


Template.dashboard.helpers({
    datenow() {
        let date = moment(new Date()).format('DD-MM-YYYY');
        return date;
    },
    lesAgents: function () {

        Meteor.call('lesAgents', (error, results) => {
            let content = '';
            if (error) {
                console.log(error);
            } else {
                let username = Meteor.user().username ? Meteor.user().username : "";
                content = '<select id="agents" class="form-control select2">';
                content += '<option value="">Tous</option>';

                for (var i = 0; i < results.length; i++) {
                    if (username && results[i] == username) {
                        content += '<option selected value="' + results[i] + '">' + results[i] + '</option>';
                    }
                    content += '<option value="' + results[i] + '">' + results[i] + '</option>';
                }
                content += '</select>';
                $('.select-province').html(content);
            }
        });

    }

});

Template.dashboard.events({

    "submit  #form-search-paiement": function (event, template) {
        event.preventDefault();
        $('#client-jour-total').html('');
        $('#montant-jour-total').html('');
        let pseudo = $("#agents").val();

        showStatsAgents(pseudo);
    }

});

function showStatsAgents(pseudo) {

    let agent = $("#agents").val() ? $("#agents").val() : pseudo;

    let dateDebut;
    let today = new Date();

    if ($('#date-debut').val()) {
        let dtDebutIterm = $('#date-debut').val();
        let tabDebut = dtDebutIterm.split("-");
        dateDebut = new Date(tabDebut[2], tabDebut[1] - 1, tabDebut[0], 00, 00, 00);

    } else {
        dateDebut = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);;
    }

    let dateFin;
    if ($('#date-fin').val()) {
        let dtFinIterm = $('#date-fin').val();
        let tabFin = dtFinIterm.split("-");
        dateFin = new Date(tabFin[2], tabFin[1] - 1, tabFin[0], 23, 00, 00);
        //console.log('date fin ' + dateFin);
    } else {
        dateFin = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 0, 0);;
    }

    if ((agent != '' && agent != undefined) || (dateDebut != '' && dateDebut != undefined) || (dateFin != '' && dateFin != undefined)) {

        let filtre = {
            agent: agent,
            dateDebut: dateDebut,
            dateFin: dateFin
        };
        //console.log('filtre exsite -' + JSON.stringify(filtre));
        //Session.set("filtre", filtre);
        Meteor.call('findPaiementByDay', filtre, (error, result) => {
            if (error) {
                console.log(error);
            } else if (result) {
                //console.log(result);
                $('#client-jour-total').append(result.length);
                let som = 0;
                result.forEach(function (element) {
                    som += element.total;
                });
                $('#montant-jour-total').append(som);

            }

        })

    }
}