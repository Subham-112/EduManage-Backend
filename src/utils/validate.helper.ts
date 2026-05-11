import ApiError from "./ApiError";

export const validatePhone = (phone: string, required: boolean = true): boolean => {
    if (required && !phone) {
        throw new ApiError(400, "Phone number is required");
    }
    const phoneRegex = /^\d{10}$/; // Simple regex for 10 digit phone numbers
    if (!phoneRegex.test(phone)) {
        throw new ApiError(400, "Invalid phone number format");
    }
    return true;
};

export const validateEmail = (email: string, required: boolean = true): boolean => {
    if (required && !email) {
        throw new ApiError(400, "Email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email validation
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }
    return true;
};

export const validatePassword = (password: string, required: boolean = true): boolean => {
    if (required && !password) {
        throw new ApiError(400, "Password is required");
    }
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }
    // Password must be at least 6 characters long and contain at least one number,
    // one capital letter, and at least one non-alphanumeric symbol (allows + and others)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!passwordRegex.test(password)) {
        throw new ApiError(400, "Password must contain at least one uppercase letter, one number, and one special character");
    }
    return true;
};

export const isPhoneOrEmail = (identifier: string): "phone" | "email" => {
    if (validatePhone(identifier)) {
        return "phone";
    } else if (validateEmail(identifier)) {
        return "email";
    } else {
        throw new ApiError(400, "Invalid email or phone number format");
    }
};