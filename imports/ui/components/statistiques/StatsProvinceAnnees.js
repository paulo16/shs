import 'chart.js';
import moment from 'moment';
import 'meteor/rajit:bootstrap3-datepicker';
import { Paiements } from '/imports/api/paiements/paiements.js';
import "./StatsProvinceAnnees.html";



let myChart1;
let myChart2;


// *************** Template StatsProvinceAnnnes *****************
Template.StatsProvinceAnnees.helpers({
    lesprovinces: function () {

        Meteor.call('listeProvinces', (error, results) => {
            let content = '';
            if (error) {
                console.log(error);
            } else {
                content = '<select id="province" class="form-control select2" style="width: 50% ;text-align:center">';
                content += '<option value="">Toutes les regions</option>';

                for (var i = 0; i < results.length; i++) {
                    content += '<option value="' + results[i] + '">' + results[i] + '</option>';
                }
                content += '</select>';
                $('.select-province').html(content);
            }
        });

    }

});

Template.StatsProvinceAnnees.onRendered(function () {
    $('select').select2();

    let ctx1 = this.find("#stats-provinces-annees").getContext('2d');
    //let  province=this.find("#province").val();

    Meteor.call('MontantAnneeProvince', (error, result) => {
        if (error) {
            console.log(error);
        } else if (result) {
            //console.log(result);
            let labels = [];
            let data = [];
            result.forEach(function (element) {
                labels.push(element._id.year);
                data.push(element.total);
            });

            if (myChart1) {
                myChart1.destroy();
            }

            myChart1 = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Montant par année',
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

});

Template.StatsProvinceAnnees.events({
    'change #province': function (event, template) {
        let valselect = $(event.target).val();
        let ctx1 = template.find("#stats-provinces-annees").getContext('2d');
        //let  province=this.find("#province").val();

        Meteor.call('MontantAnneeProvince', valselect, (error, result) => {
            if (error) {
                console.log(error);
            } else if (result) {
                //console.log(result);
                let labels = [];
                let data = [];
                result.forEach(function (element) {
                    labels.push(element._id.year);
                    data.push(element.total);
                });
                if (myChart1) {
                    myChart1.destroy();
                }
                myChart1 = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Montant par année',
                            data: data,
                            backgroundColor: 'rgba(100, 99, 255, 0.5)',
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
});



// *************** Template StatsProvinceDate *****************
Template.StatsProvinceDate.onRendered(function () {
    $('#date-debut').datepicker({
        format: 'dd-mm-yyyy',
    });
    $('#date-fin').datepicker({
        format: 'dd-mm-yyyy',
    });

    var ctx2 = this.find("#stats-provinces-date").getContext('2d');

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

            if (myChart2) {
                myChart2.destroy();
            }

            myChart2 = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: ' Payements par province Date',
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
});

Template.StatsProvinceDate.events({
    'submit #filtre_date': function (event, template) {

        event.preventDefault();
        let dtdebutIterm = $('#date-debut').val();
        let tabdatedebut = dtdebutIterm.split("-");
        let datedebut = new Date(tabdatedebut[2], tabdatedebut[1] - 1, tabdatedebut[0]);

        let dtfinIterm = $('#date-fin').val();
        let tabdatefin = dtfinIterm.split("-");
        let datefin = new Date(tabdatefin[2], tabdatefin[1] - 1, tabdatefin[0]);

        //let datedebut = moment($('#date-debut').val()).format();
        //let datefin = moment($('#date-fin').val()).format();
        console.log('date-picker debut : ' + datedebut + ' - date-picker fin : ' + datefin);

        if (datedebut && datefin) {
            let ctx2 = template.find("#stats-provinces-date").getContext('2d');

            Meteor.call('findPaiementParProvince', datedebut, datefin, (error, result) => {
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

                    if (myChart2) {
                        myChart2.destroy();
                    }

                    myChart2 = new Chart(ctx2, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: ' Payements par province Date',
                                data: data,
                                backgroundColor: 'rgba(100, 255, 64, 0.5)',
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


    }
});
