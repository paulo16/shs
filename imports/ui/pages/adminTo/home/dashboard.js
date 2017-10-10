import 'meteor/alanning:roles';
import 'chart.js';
import "./dashboard.html";

Template.dashboard.onRendered(function () {
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

    Meteor.call('findPaiementByDay', (error, result) => {
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
    });




});