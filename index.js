const express = require("express");
const paypal = require("paypal-rest-sdk");
const url = require('url');
const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave("FLWPUBK-c6ee262b3190713b7d70a8ee633a0e40-X", "FLWSECK-09abd0e3d489b4056963a2b460f4b112-X");

const PORT = 3003;

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AcIQ-jo8gwLPkh97zjemfZj6ztXymBYT8ApskVBYmbD0np67aOWK05zWZY8CA7btPliZbXEv3WO8PZmT',
    'client_secret': 'EGJoTpKn1GH5yaRKOiBf5_d-SA8hTzN3SOxKTYJpX7zcqXkIaYW8RYm3Cv3n6pJtH83Nsp-kDiL33jt5'
})

const app = express();

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

app.post('/paypal', (req, res) => {


    const queryObject = url.parse(req.url, true).query;
    // console.log(queryObject);
    const { amount } = queryObject;
    console.log(amount);

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3003/success",
            "cancel_url": "http://localhost:3003/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Payment",
                    "sku": "001",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
            },
            "description": "Pay goods"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

});

app.post('/flutterwave', (req, res) => {


    const queryObject = url.parse(req.url, true).query;
    // console.log(queryObject);
    const { amount } = queryObject;
    console.log(amount);

    const rw_mobile_money = async () => {

        try {

            const payload = {
                "tx_ref": "MC-158523s09v5050e8", //This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
                "order_id": "USS_URG_893982923s2323", //Unique ref for the mobilemoney transaction to be provided by the merchant
                "amount": "1500",
                "currency": "RWF",
                "email": "olufemi@flw.com",
                "phone_number": "054709929220",
                "fullname": "John Madakin"
            }

            const response = await flw.MobileMoney.rwanda(payload)
            console.log(response);
        } catch (error) {
            console.log(error)
        }

    }


    rw_mobile_money();

});


app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {

        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))