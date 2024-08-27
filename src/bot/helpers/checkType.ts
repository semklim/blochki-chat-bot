/**
 * Checks if a given object has a specific property.
 *
 * This function is a type guard that verifies whether the provided object
 * contains a property with the specified name. If the property exists,
 * the function returns `true`, asserting the type of the object.
 *
 * @template T - The expected type of the object.
 * @param {any} obj - The object to check.
 * @param {string} propertyName - The name of the property to look for in the object.
 * @returns {obj is T} - Returns `true` if the object has the specified property, otherwise `false`.
 *
 * @example
 * interface User {
 *   name: string;
 *   age: number;
 * }
 *
 * const user: any = { name: 'Alice', age: 30 };
 *
 * if (hasProperty<User>(user, 'name')) {
 *   console.log(`${user.name} is ${user.age} years old.`);
 * } else {
 *   console.log('Invalid user object.');
 * }
 */
export const hasProperty = <T>(obj: any, propertyName: keyof T): obj is T => propertyName in obj;
