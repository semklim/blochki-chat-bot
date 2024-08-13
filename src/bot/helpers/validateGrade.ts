
export default function validateNumber(
  n: string,
  moreThen = 1,
  lessThen = 10
) {
  const number = parseInt(n);
  if (isNaN(number) || number < moreThen || lessThen < number) {
    return undefined;
  }
  return number;
}