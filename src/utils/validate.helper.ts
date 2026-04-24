export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/; // Simple regex for 10 digit phone numbers
    return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email validation
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    // Password must be at least 6 characters long and contain at least one number and one capital letter and one symbol
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
};