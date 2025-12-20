import converter from "number-to-words";

export function amountToWords(amount: number) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = converter.toWords(rupees).replace(/,/g, "") + " Rupees";

  if (paise > 0) {
    words +=
      " and " + converter.toWords(paise).replace(/,/g, "") + " Paise";
  }

  return (
    words.charAt(0).toUpperCase() +
    words.slice(1) +
    " Only"
  );
}
