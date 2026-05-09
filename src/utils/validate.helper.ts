export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/; // Simple regex for 10 digit phone numbers
    return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email validation
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    // Password must be at least 6 characters long and contain at least one number,
    // one capital letter, and at least one non-alphanumeric symbol (allows + and others)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    return passwordRegex.test(password);
};

export const isMobileOrEmail = (identifier: string): "phone" | "email" | null => {
    if (validatePhone(identifier)) {
        return "phone";
    } else if (validateEmail(identifier)) {
        return "email";
    } else {
        return null;
    }
};