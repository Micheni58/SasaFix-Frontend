import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../hooks/useAuth";

const validationSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(["client", "provider"], "Please select a role")
    .required("Role is required"),
  location: Yup.string().when("role", {
    is: "provider",
    then: (schema) => schema.required("Location is required for providers"),
    otherwise: (schema) => schema.notRequired(),
  }),
  phone_number: Yup.string().when("role", {
    is: "provider",
    then: (schema) =>
      schema
        .min(9, "Phone must be at least 9 characters")
        .required("Phone is required for providers"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const ROLE_ROUTES = { admin: "/admin", provider: "/provider", client: "/client" };

const SignUpForm = () => {
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus("");
    const userData = {
      full_name: values.full_name,
      email: values.email,
      password: values.password,
      role: values.role,
      location: values.location || null,
      phone_number: values.phone_number || null,
    };
    try {
      const response = await fetch("http://localhost:8000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.access_token || "");
        setSuccess(true);
        setTimeout(() => navigate(ROLE_ROUTES[data.user.role] || "/client"), 500);
      } else {
        setStatus(data.detail || data.error || "Registration failed");
      }
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join Sasa Fix
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your skill swap account
          </p>
        </div>
        {success ? (
          <div className="text-center">
            <div className="text-green-600 text-lg font-medium mb-4">
              Account created successfully!
            </div>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <Formik
            initialValues={{
              full_name: "",
              email: "",
              password: "",
              role: "",
              location: "",
              phone_number: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status, values }) => (
              <Form className="mt-8 space-y-6">
                {status && (
                  <div className="text-red-600 text-sm text-center">
                    {status}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <Field
                      type="text"
                      name="full_name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Full name"
                      disabled={isSubmitting}
                    />
                    <ErrorMessage
                      name="full_name"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email address"
                      disabled={isSubmitting}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Field
                      type="password"
                      name="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Password"
                      disabled={isSubmitting}
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Field
                      as="select"
                      name="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="">Select your role</option>
                      <option value="client">
                        Client (Looking for services)
                      </option>
                      <option value="provider">Service Provider</option>
                    </Field>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  {values.role === "provider" && (
                    <>
                      <div>
                        <Field
                          type="text"
                          name="location"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Location (e.g., Nairobi, Kinoo)"
                          disabled={isSubmitting}
                        />
                        <ErrorMessage
                          name="location"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Field
                          type="tel"
                          name="phone_number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Phone number (e.g., +254712345678)"
                          disabled={isSubmitting}
                        />
                        <ErrorMessage
                          name="phone_number"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
