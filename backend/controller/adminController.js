require('dotenv').config()
var Food = require('../models/food')
var User = require('../models/user')
var Order = require('../models/order')
var Feedback = require('../models/feedback')
// var QRCode = require('qrcode')
const fileUploadmiddleware = require('../middleware/fileUpload')

exports.addFood = async (req, res) => {
    let available;
    let quantity;
    let limit;
    if (!isNaN(req.body.foodqty)) {

        if (req.body.foodqty <= 0) {
            available = false;
            quantity = 0;
            limit = false;
        }
        else {
            available = true;
            quantity = req.body.foodqty;
            limit = false;
        }
        if (req.body.foodqty == -1) {
            available = true;
            quantity = -1;
            limit = true;
        }
        // **********************
        try {
            const image = req.file
            const imageUrl = await fileUploadmiddleware.uploadImage(image)
            var food = new Food({
                foodname: req.body.foodname,
                foodqty: quantity,
                foodprice: req.body.foodprice,
                foodimage: imageUrl,
                foodavail: available,
                unlimited: limit
            })
            try {
                doc = food.save();
                console.log("Item has been added");
                const io = req.app.get('io');
                io.emit("Food Added", " Item has been added");
                return res.json({ msg: 'Item added' });
            }
            catch (err) {
                console.log("An error has occured while adding item")
                return res.json({ errormsg: 'Somthing went wrong' });
            }
        }
        catch (err) {
            console.log("An error has occured while adding item")
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        // **********************

    }
    else {
        console.log("Invalid Quantity!");
        return res.json({ errormsg: 'Invalid Quantity!' });
    }
}


exports.getallFoodItem = (req, res) => {

    Food.find({}, (err, items) => {
        if (err) {
            console.log("Cannot fetch item, Please try again!")
            res.status(500).json({ errormsg: 'Somthing went wrong' })
        }
        res.json({ msg: items })
    })
}

exports.editFood = (req, res) => {
    let available;
    let quantity;
    if (!isNaN(req.body.foodqty)) {
        if (req.body.foodqty <= 0) {
            available = false;
            quantity = 0;
        }
        else {
            available = true;
            quantity = req.body.foodqty
        }
        if (req.body.foodqty == -1) {

            quantity= -1;
            if (req.body.isitavail == "yes") {
                available = true;
            }
            else {
                available = false;
            }
        }
        Food.updateOne({ _id: req.body._id }, {
            foodname: req.body.foodname,
            foodprice: req.body.foodprice,
            foodqty: quantity,
            foodavail: available
        }, function (err, item) {

            if (err) {
                console.log("Cannot edit item without an image attached");
                return res.json({ errormsg: 'Somthing went wrong' });
            }
            else {
                console.log("Cannot edit item without an image attached");
                const io = req.app.get('io');
                io.emit("Item Added", " Item has been added");
                return res.json({ msg: 'Edited food without image' });
            }
        })
    }
    else {
        console.log("Invalid Quantity!");
        return res.json({ errormsg: 'Invalid Quantity!' });
    }


}

exports.editFoodWithImage = async (req, res) => {
    let available;
    let quantity;
    if (!isNaN(req.body.foodqty)) {
        if (req.body.foodqty <= 0) {
            available = false;
            quantity = 0;
        }
        else {
            available = true;
            quantity = req.body.foodqty;
        }
        if (req.body.foodqty == -1) {
            // avail = true;
            quantity = -1;
            if (req.body.isitavail == "yes") {
                available = true;
            }
            else {
                available = false;
            }
        }
        try {
            Food.findOne({ _id: req.body._id }, async (err, data) => {
                if (err) {
                    console.log("Item Cannot be Deleted");
                    return res.json({ errormsg: 'Somthing went wrong' });
                }
                else {
                    if (!data) {
                        console.log("Item Cannot be Deleted");
                        return res.json({ errormsg: 'Somthing went wrong' });
                    }
                    else {
                        try {
                            var x = await fileUploadmiddleware.deleteImage(data.foodimage);
                            const image = req.file
                            const imageUrl = await fileUploadmiddleware.uploadImage(image)
                            Food.updateOne({ _id: req.body._id }, {
                                foodname: req.body.foodname,
                                foodprice: req.body.foodprice,
                                foodqty: qty,
                                foodimage: imageUrl,
                                foodavail: available
                            }, function (err, item) {
                                if (err) {
                                    console.log("Cannot edit item without an image attached")
                                    return res.json({ errormsg: 'Somthing went wrong' });
                                }
                                else {
                                    console.log("Item has been Edited successfully");
                                    const io = req.app.get('io');
                                    io.emit("Food Added", " Item has been added");
                                    return res.json({ msg: 'Edited food with image' });
                                }
                            })
                        } catch (error) {
                            console.log("Item Cannot be Deleted");
                            return res.json({ errormsg: 'Somthing went wrong' });
                        }

                    }

                }

            })
        }
        catch (err) {
            console.log("Error!! Item Cannot be Edited")
            return res.json({ errormsg: 'Somthing went wrong' });
        }

    }
    else {
        console.log("Invalid Quantity!");
        return res.json({ errormsg: 'Invalid Quantity!' });
    }


}

exports.deleteFood = (req, res) => {

    Food.findOne({ _id: req.params.id }, async (err, data) => {
        if (err) {
            console.log("Item Cannot be Deleted");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        else {
            if (!data) {
                console.log("Item Cannot be Deleted");
                return res.json({ errormsg: 'Somthing went wrong' });
            }
            else {
                try {
                    var x = await fileUploadmiddleware.deleteImage(data.foodimage);
                    Food.deleteOne({ _id: req.params.id }, (error) => {
                        if (error) {
                            console.log("Item Cannot be Deleted");
                            return res.json({ errormsg: 'Somthing went wrong' });
                        }
                    })
                    const io = req.app.get('io');
                    io.emit("Food Added", " Item has been added");
                    return res.json({ msg: 'Item has been Deleted' });
                } catch (error) {
                    console.log("Item Cannot be Deleted");
                    return res.json({ errormsg: 'Somthing went wrong' });
                }

            }

        }

    })
}

exports.getallUser = (req, res) => {
    User.find({ role: "user" }, (err, usr) => {
        if (err) {
            console.log("Cannot get all users");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        else {
            res.json({ user: usr });
        }
    }).select("-password").select("-role")
}


exports.block = (req, res) => {
    var id = req.params.id
    User.updateOne({ _id: id }, { blocked: true }, (err, user) => {
        if (err) {
            console.log("User Cannot be blocked");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        else {
            console.log("User Has been blocked");
            res.status(201).json({ msg: "User has been blocked" });
        }
    })

}
exports.unblock = (req, res) => {
    var id = req.params.id
    User.updateOne({ _id: id }, { blocked: false }, (err, user) => {
        if (err) {
            console.log("Error has occured,User Cannot be unblocked ");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        else {
            console.log("User has been unblocked");
            res.status(201).json({ msg: "unblocked user!" });
        }
    })
}



exports.getallOrders = (req, res) => {
    var today = new Date();
    var date = today.toJSON().slice(0, 10);
    // unpaid
    // picked up
    Order.find({ $or: [{ status: { $ne: "picked up" } }, { paymentstatus: "unpaid" }], orderdate: date }, (err, orders) => {
        if (err) {
            console.log("Error, cannot get all items");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        else {
            // console.log(orders);
            res.json({ msg: orders });
        }
    }).select("-items").select("-orderdate")
}



exports.updateorderstatus = (req, res) => {
    Order.updateOne({ _id: req.body.id }, { status: req.body.status }, (err, done) => {
        if (err) {
            console.log("Error, Status cannot be updated");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        else {
            console.log("order status updated");
            const io = req.app.get('io');
            io.emit(req.body.email, "Order Status has been updated");
            res.json({ msg: "Your Order has been Successfully updated" });
        }
    })
}



exports.deleteOrder = (req, res) => {
    Order.deleteOne({ _id: req.params.id }, (error) => {
        if (error) {
            console.log("Error, Cannot delete this order");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
    })
    const io = req.app.get('io');
    io.emit("orderdelete", "Order has been removed Successfully");
    return res.json({ msg: 'Item has beem deleted Successfully' });
}




exports.getoneOrder = (req, res) => {
    var id = req.params.id
    Order.find({ _id: id }, (err, order) => {
        if (err) {
            console.log("Cannot get an Order");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        return res.send(order);
    })
}


exports.getOneuser = (req, res) => {
    var id = req.params.id
    User.findOne({ _id: id }, (err, user) => {
        if (err) {
            console.log("Cannot get an Order");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        res.status(200).json({ msg: user })
    }).select("-password").select("-role").select("-blocked").select("-_id")
}


exports.getorderHistory = (req, res) => {
    var date = req.params.date
    var emptyarray = []
    let total = 0;
    Order.find({ orderdate: date }, (err, orders) => {
        if (err) {
            console.log("Error, Cannot get Order History");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        for (let i = 0; i < orders.length; i++) {
            let element = orders[i];
            element = element.items
            for (let j = 0; j < element.length; j++) {
                let temp = { _id: element[j]._id, foodqty: element[j].foodqty, foodprice: element[j].foodprice, foodname: element[j].foodname, foodimage: element[j].foodimage }
                let k = 0
                for (k = 0; k < emptyarray.length; k++) {
                    if (emptyarray[k]._id == element[j]._id) {
                        emptyarray[k].foodqty += element[j].foodqty
                        total += element[j].foodqty * element[j].foodprice
                        break;
                    }
                }
                if (k == emptyarray.length) {
                    total += element[j].foodqty * element[j].foodprice
                    emptyarray.push(temp)
                }
            }
        }
        res.json({ msg: emptyarray, total: total })
    })
}


exports.updatePaymentstatus = (req, res) => {
    Order.updateOne({ _id: req.body.id }, { paymentstatus: req.body.paymentstatus }, (err, done) => {
        if (err) {
            console.log("Error, Cannot update order payment");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        else {
            console.log("Order status has been updated Successfully");
            const io = req.app.get('io');
            io.emit(req.body.email, "order status has been updated");
            res.json({ msg: "Your payment status has been updated Successfully!" });
        }
    })
}

exports.getallFeedback = (req, res) => {
    Feedback.find({}, (err, feedbacks) => {
        if (err) {
            console.log("There has been an error, cannot get feedback");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
        else {
            feedbacks = feedbacks.reverse() 
            res.json({ msg: feedbacks });
        }
    })
}


exports.deleteFeedback = (req, res) => {
    Feedback.deleteOne({ _id: req.params.id }, (error) => {
        if (error) {
            console.log("Error, Feedback cannot be deleted");
            return res.json({ errormsg: 'Somthing went wrong' });
        }
    })
    return res.json({ msg: 'Feedback has been deleted successfully' });
}