import React, { useEffect, useState } from 'react'
import "./ProductController.css"
import { useAuth } from '../../../Context/AuthContext'
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../../FirebaseConfig';
import { useAlert } from '../../../Context/AlertContext';

const ProductController = () => {
    const {currentUser} = useAuth();
    const showAlert = useAlert();
    const [orders, setOrders] = useState([]);

    // Fetch orders from fires store
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'orders'));
                const ordersArray = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(ordersArray);
            } catch (error) {
                console.error('Error fetching orders: ', error);
            }
        }

        fetchOrders();
    },[]);

    // update payment status
    const updatePaymentStatus = async (orderId, newStatus) => {
        try {
            const orderDocRef = doc(db, 'orders', orderId);
            await updateDoc(orderDocRef, { paymentStatus: newStatus });
            console.log(`order ${orderId} payment status update to ${newStatus}`);
            showAlert('success', 'payment status update')
        } catch (error) {
            console.error('Error updating payment status: ', error);
        }
    }

  return (
    <>
        {currentUser && currentUser.role === 'admin' ? (
            <div className='orderContainer'>
                <h1>product controller</h1>
                <OrderTable orders={orders} updatePaymentStatus={updatePaymentStatus}/>
            </div>
        ) : (
            <p>please move out you are not the admin</p>
        )}
    </>
  )
};

const OrderTable = ({ orders, updatePaymentStatus }) => {
    return (
        <table className='order-table'>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>State</th>
                    <th>Zip Code</th>
                    <th>Amount</th>
                    <th>Items - Quantity</th>
                    <th>Items - Product Name</th>
                    <th>Timestamp</th>
                    <th>Payment Status</th>
                </tr>
            </thead>
            {orders.map(order => (
                <tr key={order.id}>
                    <td>
                        {order.items?.length > 0 ? (
                            order.items.map((item, index) => (
                            <img width={50} key={index} src={item.image} alt="Product" />
                            ))
                        ) : (
                            'No Image'
                        )}
                    </td>

                    <td>{order.email}</td>
                    <td>{order.country}</td>
                    <td>{order.state}</td>
                    <td>{order.zipCode}</td>
                    <td>&#8358;{new Intl.NumberFormat().format(order.amount)}</td>
                    <td>
                        {order.items?.length > 0 ? (
                        order.items.map((item, index) => (
                            <p key={index}>{item.quantity}</p>
                        ))
                    ) : (
                        <p>null</p>
                    )}
                    </td>

                    <td>
                        {order.items?.length > 0 ? (
                        order.items.map((item, index) => (
                            <p key={index}>{item.productName}</p>
                        ))
                    ) : (
                        <p>null</p>
                    )}
                    </td>

                    <td>
                        {order.timestamp ? new Date(order.timestamp.seconds * 1000).toLocaleString() : 'No Timestamp'}
                    </td>
                    <td>
                        <select
                            value={order.paymentStatus}
                            onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        >
                            <option value={order.paymentStatus} key="">{order.paymentStatus}</option>
                            <option value="pending">Pending</option>
                            <option value="road">Road</option>
                            <option value="cancel">Cancel</option>
                            <option value="received">Received</option>
                        </select>
                    </td>
                </tr>
            ))}
        </table>
    )
}


export default ProductController