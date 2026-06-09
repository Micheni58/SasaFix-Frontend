import CreateBooking from "./Client/bookings/CreateBooking";
import BookingsAndPayments from "./Admin/BookingsAndPayments";
import MyBookings from "./Client/bookings/MyBookings";
function Login() {
    return(
        <>
        <h1>Login Page</h1>
        <CreateBooking />
        <BookingsAndPayments />
        <MyBookings />
        </>
    )
}       
export default Login;