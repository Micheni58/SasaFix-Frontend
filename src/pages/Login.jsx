import AdminNotification from "./Admin/Notification";
import ClientNotification from "./Client/Notification";
import ProviderNotification from "./ServiceProvider/Notification";
function Login() {
    return(
        <>
        <h1>Login Page</h1>
        <AdminNotification />
        <ClientNotification />
        <ProviderNotification />
        </>
    )
}       
export default Login;