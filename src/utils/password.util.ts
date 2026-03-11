import bcrypt from "bcryptjs";
import ApiError from "./ApiError";

/**
 * Hash a plain text password
 * @param plainPassword - The plain text password to hash
 * @param saltRounds - Number of salt rounds (default: 10, higher = more secure but slower)
 * @returns Hashed password
 */
export const hashPassword = async (
    plainPassword: string,
    saltRounds: number = 10
): Promise<string> => {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error(`Password hashing failed: ${(error as Error).message}`);
    }
};

/**
 * Compare plain text password with hashed password
 * @param plainPassword - The plain text password from login
 * @param hashedPassword - The hashed password from database
 * @returns true if passwords match, false otherwise
 */
export const comparePasswords = async (
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> => {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        if (!isMatch) {
            throw new ApiError(400, "Password is not matched");
        }
        return isMatch;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new Error(`Password comparison failed: ${(error as Error).message}`);
    }
};
